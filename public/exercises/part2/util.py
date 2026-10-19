"""Plumbing for rl_policy_gradients_*.ipynb: everything that is not the lesson."""
from __future__ import annotations

import math
import os
import sys
from typing import Callable, Sequence

import numpy as np
import torch
import torch.nn as nn

# ═══════════════════════════════════════════════════════════════════════════════
# 1. HELPERS AND HOUSE STYLE
# ═══════════════════════════════════════════════════════════════════════════════

# Colour means one thing: CPU = GRAY, GPU = PURPLE; good = GREEN, failed = RED, watch-this = AMBER.
# PURPLE2 and TEAL are neutral series colours and carry no other meaning.
PURPLE, PURPLE2 = "#667eea", "#764ba2"
GREEN, RED, AMBER = "#39b36a", "#e0796d", "#e0a23c"
GRAY, TEAL = "#9aa3b2", "#2a8c82"


def install_house_style() -> None:
    """Matplotlib defaults used by every plot in the notebook."""
    import matplotlib.pyplot as plt

    plt.rcParams.update({
        "figure.dpi": 110, "font.size": 9,
        "axes.spines.top": False, "axes.spines.right": False,
        "axes.grid": True, "grid.alpha": 0.25,
        "axes.prop_cycle": plt.cycler(color=[PURPLE2, AMBER, GREEN, GRAY]),
    })


def must_fill(_where: str = "the cell above", **kwargs) -> None:
    """Stop with a readable message if an exercise cell still contains `...` (`_where`: where the blanks are)."""
    missing = [k for k, v in kwargs.items() if v is Ellipsis or v is None
               or (isinstance(v, tuple) and any(x is Ellipsis for x in v))]
    if missing:
        raise ValueError(f"Please fill in {', '.join(missing)} in {_where}, then re-run this cell.")


def print_versions(modules: dict) -> None:
    """One line per library: name and version."""
    for name, mod in modules.items():
        print(f"  {name:10s} {getattr(mod, '__version__', sys.version.split()[0])}")


def random_seeds(n: int) -> list[int]:
    """n fresh random seeds, different at every run (print them to reproduce a run)."""
    return [int(s) for s in np.random.default_rng().integers(0, 100_000, size=n)]


def smooth(x: Sequence[float], k: int = 20) -> np.ndarray:
    """Trailing moving average over k entries (shorter at the start)."""
    c = np.cumsum(np.insert(np.asarray(x, float), 0, 0.0))
    return np.array([(c[i + 1] - c[max(0, i + 1 - k)]) / min(k, i + 1) for i in range(len(x))])


def plot_runs(ax_train, ax_eval, runs: Sequence[dict], color: str, label: str, k: int = 20,
              x_key: str = "episodes") -> None:
    """Training and evaluation returns of several seeds: the mean as a line, the spread (best to worst seed) as a band.

    Each run is a dict with `returns` (one training return per episode), `evals` (a list of (x, mean evaluation
    return)) and `seed`. With x_key="steps" the training returns are placed by `steps_at` instead of episode number.
    """
    seeds = ", ".join(str(r["seed"]) for r in runs)
    if x_key == "episodes":
        n = min(len(r["returns"]) for r in runs)
        grid = np.arange(1, n + 1)
        train = np.array([smooth(r["returns"][:n], k) for r in runs])
    else:
        end = min(r["steps_at"][-1] for r in runs)
        grid = np.linspace(0, end, 200)
        train = np.array([np.interp(grid, r["steps_at"], smooth(r["returns"], k)) for r in runs])
    train = np.clip(train, -1000, None)
    ax_train.plot(grid, train.mean(0), color=color, lw=2, label=f"{label} (seeds {seeds})")
    ax_train.fill_between(grid, train.min(0), train.max(0), color=color, alpha=0.2)
    xs = np.array([x for x, _ in runs[0]["evals"]])
    n_eval = min(len(r["evals"]) for r in runs)
    ev = np.clip(np.array([[v for _, v in r["evals"][:n_eval]] for r in runs]), -1000, None)
    ax_eval.plot(xs[:n_eval], ev.mean(0), color=color, lw=2, marker="o", ms=3, label=f"{label} (seeds {seeds})")
    ax_eval.fill_between(xs[:n_eval], ev.min(0), ev.max(0), color=color, alpha=0.2)


def finish_return_axes(ax_train, ax_eval, x_label: str, solved: float, ylim: tuple = (-400, 320)) -> None:
    """Titles, labels, the 'solved' line and a fixed y range for a pair of axes made by plot_runs.

    Returns far below the range (a lander hovering until the time limit can score -3,000) leave the plot at the
    bottom, so that the interesting part stays readable."""
    ax_train.set_title("training: return of each episode (20-episode average)")
    ax_eval.set_title("evaluation: 10 fixed test episodes, actions sampled")
    for ax in (ax_train, ax_eval):
        ax.axhline(solved, ls=":", c="k", lw=0.8)
        ax.text(ax.get_xlim()[0], solved + 5, " solved", fontsize=8, va="bottom")
        ax.set_xlabel(x_label)
        ax.set_ylim(*ylim)
    ax_train.set_ylabel("return (line: mean over seeds, band: best to worst seed)")
    ax_eval.legend(fontsize=8, loc="lower right")


# ═══════════════════════════════════════════════════════════════════════════════
# 2. NETWORKS AND RUNNING STATISTICS
# ═══════════════════════════════════════════════════════════════════════════════

def mlp(n_in: int, n_out: int, hidden: int = 64, out_gain: float = 1.0) -> nn.Sequential:
    """Two hidden ReLU layers, orthogonal initialisation; a small `out_gain` starts the head near zero."""
    layers = [nn.Linear(n_in, hidden), nn.ReLU(), nn.Linear(hidden, hidden), nn.ReLU(), nn.Linear(hidden, n_out)]
    for layer in layers:
        if isinstance(layer, nn.Linear):
            nn.init.orthogonal_(layer.weight, math.sqrt(2))
            nn.init.zeros_(layer.bias)
    nn.init.orthogonal_(layers[-1].weight, out_gain)
    return nn.Sequential(*layers)


class RunningMeanStd:
    """Running mean and variance over batches (the parallel algorithm of Chan et al.)."""

    def __init__(self, shape: tuple = ()):
        self.mean, self.var, self.count = np.zeros(shape), np.ones(shape), 1e-4

    def update(self, x: np.ndarray) -> None:
        b_mean, b_var, b_count = x.mean(0), x.var(0), x.shape[0]
        delta, total = b_mean - self.mean, self.count + b_count
        self.mean = self.mean + delta * b_count / total
        self.var = (self.var * self.count + b_var * b_count + delta**2 * self.count * b_count / total) / total
        self.count = total


# ═══════════════════════════════════════════════════════════════════════════════
# 3. VIDEO
# ═══════════════════════════════════════════════════════════════════════════════

def record_episode(env, act: Callable[[np.ndarray], object], seed: int, frame_every: int = 2) -> tuple[list, float]:
    """Play one episode with act(obs) on an env made with render_mode="rgb_array"; return its frames and return."""
    obs, _ = env.reset(seed=seed)
    frames, total, t = [env.render()], 0.0, 0
    while True:
        obs, r, terminated, truncated, _ = env.step(act(obs))
        total += r
        t += 1
        if t % frame_every == 0:
            frames.append(env.render())
        if terminated or truncated:
            frames.append(env.render())
            return frames, total


def label(frame: np.ndarray, text: str) -> np.ndarray:
    """The frame with a line of text written in its top-left corner."""
    from PIL import Image, ImageDraw, ImageFont

    img = Image.fromarray(frame)
    draw = ImageDraw.Draw(img)
    size = max(12, frame.shape[0] // 18)
    font = ImageFont.load_default(size=size)
    x0, y0, x1, y1 = draw.textbbox((10, 8), text, font=font)
    draw.rectangle((x0 - 5, y0 - 4, x1 + 5, y1 + 4), fill=(255, 255, 255))   # readable on a dark sky too
    draw.text((10, 8), text, fill=(20, 20, 20), font=font)
    return np.asarray(img)


def tile(clips: Sequence[list], labels: Sequence[str], cols: int | None = None, hold: int = 15, gap: int = 0) -> list:
    """Play several clips at once, side by side (or in a grid of `cols` columns), each labelled, with `gap` grey
    pixels between them.

    Shorter clips freeze on their last frame, so an episode that ended early stays visible; `hold` extra frames
    keep the end on screen."""
    cols = cols or len(clips)
    n = max(len(c) for c in clips) + hold
    blank = np.full_like(clips[0][0], 255)
    rows = math.ceil(len(clips) / cols)
    out = []
    for i in range(n):
        tiles = [label(c[min(i, len(c) - 1)], txt) for c, txt in zip(clips, labels)]
        tiles += [blank] * (rows * cols - len(tiles))
        out.append(grid(tiles, cols, gap))
    return out


def show_video(frames: Sequence[np.ndarray], path: str, fps: int = 25, width: int | None = None):
    """Write frames to an MP4 and return an inline video for the notebook."""
    import warnings

    import imageio
    from IPython.display import Video

    with warnings.catch_warnings():     # ffmpeg runs as a subprocess; harmless warnings when JAX threads are alive
        warnings.filterwarnings("ignore", message="os.fork")
        imageio.mimsave(path, list(frames), fps=max(1, int(fps)), macro_block_size=8)
    return Video(path, embed=True, width=width or min(960, frames[0].shape[1]))

def grid(tiles: Sequence[np.ndarray], cols: int, gap: int = 0, colour: tuple = (128, 128, 128)) -> np.ndarray:
    """Tiles of one size in a grid of `cols` columns, `gap` pixels of `colour` between them (missing tiles left blank)."""
    h, w = tiles[0].shape[:2]
    rows = math.ceil(len(tiles) / cols)
    out = np.empty((rows * h + (rows - 1) * gap, cols * w + (cols - 1) * gap, 3), dtype=np.uint8)
    out[:] = colour
    for k, t in enumerate(tiles):
        r, c = divmod(k, cols)
        out[r * (h + gap):r * (h + gap) + h, c * (w + gap):c * (w + gap) + w] = t[..., :3]
    return out

# ═══════════════════════════════════════════════════════════════════════════════
# 4. PARALLEL RUNS
# ═══════════════════════════════════════════════════════════════════════════════

def _call_pickled(blob: bytes):
    """Worker side of parallel_map: unpickle (function, job) and run it on one thread."""
    import cloudpickle

    torch.set_num_threads(1)
    fn, job = cloudpickle.loads(blob)
    return fn(job)


def parallel_map(fn, jobs: Sequence, max_workers: int | None = None) -> list:
    """Run fn(job) for every job in fresh worker processes, at most one per CPU core; results in job order.

    The workers are spawned, not forked: PyTorch cannot run autograd in a process forked from one that already
    has. Functions defined in a notebook cannot be imported by a spawned worker, so each (fn, job) is sent by
    value with cloudpickle (a dependency of Gymnasium), together with everything fn refers to. Return plain data
    (numbers, lists, tensors, state dicts), not instances of classes defined in the notebook.
    """
    import multiprocessing as mp
    from concurrent.futures import ProcessPoolExecutor

    import cloudpickle

    blobs = [cloudpickle.dumps((fn, job)) for job in jobs]
    workers = min(len(blobs), max_workers or os.cpu_count() or 1)
    with ProcessPoolExecutor(max_workers=workers, mp_context=mp.get_context("spawn")) as pool:
        return list(pool.map(_call_pickled, blobs))
