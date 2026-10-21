import type { Part, Session } from '../types';

/**
 * Single source of truth for the CSCS AI Tutorials 2026 content.
 *
 * SCHEDULE FACTS AND WHERE THEY COME FROM. Transcribed on 2026-09-26 from the
 * syllabus grid Carlos sent as an image (Script.png): three parts, each two
 * consecutive days, the first day 10:00 to 17:30 and the second 09:00 to 16:30.
 * Part I is 6 and 7 October 2026, Part II is 20 and 21 October 2026, Part III
 * has no dates yet. Part I's exercise rows carry the names Luca gave on
 * 2026-10-02 (Pytorch with SLURM, Claude Code and GEPA, LLM from scratch, SFT
 * and LoRA); the other parts' rows carry the grid's plain "Coding exercise".
 * The ScheduleTable prefixes "CX" to every exercise row. No rooms are known yet.
 *
 * To update content, edit the objects below. Each part has two days plus a
 * `resources` list.
 */

/**
 * Placeholder for material that has not been uploaded yet. Renders greyed out
 * as "Soon" instead of a link, so an agenda can go live before its files do.
 * Replace with deck(...) or exercise(...) once the file is in public/.
 */
export const SOON = '#';

/**
 * A lecture deck hosted by THIS site, from `public/slides/part<n>/`.
 *
 * The course repository is private, so every file a participant needs is
 * served from here: it needs no new repository and no visibility change, and
 * it goes live on the next deploy. BASE_URL rather than a bare './' so the
 * link survives a change to `base` in vite.config.ts. Under hash routing the
 * document URL is always the site root, so a relative href resolves correctly
 * from any route.
 */
export const deck = (n: number, file: string): string =>
  `${import.meta.env.BASE_URL}slides/part${n}/${file}`;

/**
 * A deck URL with a version tag, for a deck that is refreshed. GitHub Pages sends
 * `cache-control: max-age=600`, so a browser that fetched a PDF in the last ten minutes keeps
 * showing that file, and a chip that downloads it right after a refresh can hand over the
 * previous build. The tag is part of the address the browser caches by and no part of the file
 * name the server looks up, so a refreshed deck gets a new address and the same file path.
 * Pass the file's md5; the first eight characters are the tag. lib/links.ts ignores the query
 * when it decides that a link is a PDF, so the chip keeps its download attribute and its arrow.
 */
export const versioned = (url: string, md5: string): string => `${url}?v=${md5.slice(0, 8)}`;

/**
 * A lecture NOTES file hosted by THIS site, from `public/notes/part<n>/`: a text to read at
 * home, where a deck is projected in the room. Same reasoning as deck(): the course
 * repository is private, so the PDF is served from here, and lib/links.ts gives its chip the
 * download attribute like a deck's.
 */
export const notes = (n: number, file: string): string =>
  `${import.meta.env.BASE_URL}notes/part${n}/${file}`;

/**
 * An exercise file hosted by THIS site, from `public/exercises/<folder>/`: a
 * notebook, its helper `.py`, or a self-contained HTML page. The folder is
 * `part<n>` for an exercise of that part and `setup` for the trial notebook.
 * The browser downloads a notebook rather than rendering it, see
 * lib/links.ts, and the participant drags it into JupyterLab on Santis.
 */
export const exercise = (folder: string, file: string): string =>
  `${import.meta.env.BASE_URL}exercises/${folder}/${file}`;

/**
 * A notebook of THIS repository, opened in Google Colab. Colab reads a public GitHub
 * repository directly, so it opens the file that `public/` serves as soon as that file is
 * on `main`, and there is no second copy to keep in step. `path` runs from the repository
 * root, for example `public/exercises/part2/<notebook>.ipynb`. The link leaves this site,
 * so lib/links.ts gives it no download attribute. The sibling BMAI site has the same
 * helper for the notebooks of its own public repositories.
 */
export const colab = (path: string): string =>
  `https://colab.research.google.com/github/eth-cscs-hs26/CSCS-PAGE/blob/main/${path}`;

/**
 * A participant-facing HOW-TO page hosted by this site, from `public/guides/`,
 * for guides written as standalone HTML. The Santis setup guide is a page of
 * the site itself (#/setup) rather than a file, so this is spare for now.
 */
export const guide = (file: string): string => `${import.meta.env.BASE_URL}guides/${file}`;

/**
 * An interactive VISUALIZATION hosted by THIS site, from
 * `public/viz/part<n>/<name>/`: a folder rather than one file, so this points
 * at its index.html, or at `page` for a folder with several pages.
 *
 * Same reasoning as deck(): the course repository is private, and serving the
 * page from here needs no new repository and no visibility change. Each
 * visualization is browser only, loads no library and makes no network
 * request, so it works from this subpath exactly as it does from a file:// URL
 * on a laptop. The sibling BMAI site does the same under `viz/we<n>/`.
 */
export const viz = (n: number, name: string, page = 'index.html'): string =>
  `${import.meta.env.BASE_URL}viz/part${n}/${name}/${page}`;

/** The Setup page of this site, for a resources list. */
export const SETUP_PAGE = '#/setup';

/** The trial notebook the Setup page ends with. */
export const TRIAL_NOTEBOOK = exercise('setup', 'santis-trial.ipynb');

/**
 * The Wuggish attention game of the Day 2 lecture "Attention and transformers",
 * from `public/viz/part1/wuggish/`. Its source is `cscs-hs26/wuggish-game/`,
 * imported on 2026-10-01 from CAS BMAI weekend 2; only index.html, css, js and
 * data are copied here, the three folders the page loads.
 *
 * `?dev=0` hides the game's fast-forward button, which jumps straight to the
 * reveal with the game counted as solved. It is on by default so the lecturer
 * can rehearse the reveal, and a participant who finds it skips the point of
 * the game, so every link a participant gets carries `?dev=0`.
 */
const WUGGISH_GAME = `${viz(1, 'wuggish')}?dev=0`;

/**
 * The Square One quiz show of the Day 1 lecture "Intro to SLT and PyTorch", from
 * `public/viz/part1/square-root-show/`. Its source is `cscs-hs26/square-root-show/`,
 * imported on 2026-10-05 from Carlos's Foundations of AI repository, where it opened
 * that day; only index.html, css, js and vendor are copied here, the folders the page
 * loads, byte for byte as FAI's public site serves them. The 10:00 deck prints this
 * address, and a QR code made from it, on its frame "Try it: Square One", so the two
 * must change together.
 */
const SQUARE_ONE = viz(1, 'square-root-show');

/**
 * Mara's road game of the Day 3 lecture "Policy gradient methods" (10:00), from
 * `public/viz/part2/courier-road/` (the folder keeps its first name). Its source is
 * `cscs-hs26/courier-road-game/`, written on 2026-10-10 at Carlos's request as the second
 * game, after a Nim knobs game that left this site on 2026-10-20, and rebuilt on
 * 2026-10-17 as two scenes: the story of Mara, a busker who
 * plays her fiddle in every place she reaches, and a scene where the participant walks her
 * one day down a tree of fifteen illustrated places by hand, taking the southwest or the
 * southeast road at each fork and seeing only the current place, the coins her hat received
 * there and the total so far, for as many days as they like. The earlier page, where the
 * participant turns the knobs of her habits, is kept as `knobs.html` in the same folder and
 * is not linked. Only index.html, knobs.html, css, js and img are copied here, the files the
 * pages load. They make no network request and keep only their theme (and, on knobs.html,
 * the knob table) in `localStorage`.
 */
const COURIER_ROAD = viz(2, 'courier-road');

/**
 * The yogurt cup game of the Day 4 lecture "Multimodal AI" (09:00), from `public/viz/part2/yogurt-cups/`. Its source is
 * `cscs-hs26/yogurt-cups-game/`, the two-laptop page of the game that Carlos's BMAI and FDD courses play before anyone says
 * the word autoencoder: the sender sees five pictures and describes them in words, the receiver finds them in a catalogue
 * and the receiver's clock is the score. Copied on 2026-10-19 at his request with one change: the flags are laid out in a
 * fresh random order for each player, so a position on the screen tells the partner nothing. Only index.html, game.css,
 * images.js and order.js are copied here, the files the page loads. It makes no network request and stores nothing. DRAFT.
 */
const YOGURT_CUPS = viz(2, 'yogurt-cups');

/**
 * The Part I coding exercises, one zip each in `public/exercises/part1/`, named
 * like the exercise's folder on the cluster
 * (`/capstor/scratch/cscs/course_00776/exercises/<exercise>/`, the copy line on
 * the Setup page). Unpacking a zip gives that folder: the notebook plus the
 * helper it imports, which must stay together. One link per exercise, so a
 * participant downloads once (Luca, 2026-10-02). Sources: `cscs-hs26` branch
 * `cx-sft` (SFT and LoRA), `cx2-claude-code-gepa` (Claude Code and GEPA:
 * the student notebook and `cx2_setup.py` only) and `cscs-hs26/cx-llms/` on main.
 */
const CX_PYTORCH_SLURM_ZIP = exercise('part1', '01_pytorch_slurm.zip');
const CX_CLAUDE_GEPA_ZIP = exercise('part1', 'cx2_claude_code_gepa.zip');
const CX_LLM_ZIP = exercise('part1', 'llm_from_scratch.zip');
const CX_SFT_ZIP = exercise('part1', 'sft_lora.zip');

/**
 * The Part II coding exercises, one zip each in `public/exercises/part2/`, same
 * layout as Part I. `rlhf_grpo.zip` (Day 3, 16:15): the student notebook of
 * `cscs-hs26/w2-cx-rlhf-grpo/` with its helpers and `build_powerful_model.py`;
 * the solutions notebook stays out. Its preference data and chatbot checkpoint
 * are read from `course_00776`'s scratch, not shipped in the zip.
 */
const CX_RLHF_GRPO_ZIP = exercise('part2', 'rlhf_grpo.zip');

/**
 * The Part II, Day 3 noon exercise (12:15), "PPO on CartPole": the small version of the
 * Lunar Lander notebook of FDD Weekend 4, with the same four tasks and nine blanks on a
 * game with four numbers of state and two actions, so that each training run takes a minute
 * or two. One student notebook in `public/exercises/part2/`, copied on 2026-10-18 at
 * Carlos's request from `cscs-hs26/part2-day1/ppo-cartpole-exercise/` (commit a457b78); the
 * solutions notebook stays in that private repository. It runs in Google Colab on a CPU
 * runtime and installs what it needs itself, so it has a Colab link and a download and no zip.
 */
const CX_PPO_CARTPOLE_NOTEBOOK = exercise('part2', 'cx_ppo_cartpole_student.ipynb');
const CX_PPO_CARTPOLE_COLAB = colab('public/exercises/part2/cx_ppo_cartpole_student.ipynb');

/**
 * The second exercise of the Part II, Day 3 noon slot (12:15), Ivan's "Policy gradients: teaching a lander to land": REINFORCE, a baseline,
 * actor-critic, GAE and PPO on LunarLander-v3, in the lecture's order. The student notebook and its helper module `util.py` (the notebook does
 * `import util`), copied from `cscs-hs26/cx-rl/` (commit c9aae0c), served as one zip and no longer in Colab (Ivan, 2026-10-20). The solutions
 * notebook stays in the private repository. Ivan first published it on 2026-10-19 (and took CartPole off the page), then reverted that; it is back
 * beside CartPole at Carlos's word the same evening ("Ivan's lunar lander should also be there").
 */
// The folder `rl_policy_gradients/` as the zip's top-level entry.
const CX_RL_ZIP = exercise('part2', 'rl_policy_gradients.zip');

/**
 * The two Colab notebooks of the opening of the Part II, Day 3, 10:00 lecture "Policy gradient
 * methods" (the first two notebooks of the 11:15 coding exercise, numbers 1 and 2; the third is REINFORCE's), which Carlos redid on 2026-10-17 as a series of decks, each with a notebook:
 * "Gradient ascent" (Part 1: the grasshopper climbs a hill; participants complete `grad` and
 * `gradient_ascent`, five lines) and "Mara's road" (Part 2: the method of the lecture on a town of
 * fifteen places, with softmax, play days, the measured gradient of a cell and the loop; eight
 * lines to complete since 2026-10-19). One student notebook each in `public/exercises/part2/`,
 * copied on 2026-10-19 at Carlos's request ("publish ... as Colab notebooks, not as Jupyter
 * notebooks to run in the cluster") from `cscs-hs26/part2-day1/pg-redo/00-gradient-ascent/notebook/`
 * (commit 8e7dc60) and `.../01-mara-table/notebook/` (commit e7f81b0), byte for byte; the solutions
 * notebooks stay in that private repository. They need only numpy and matplotlib, install nothing
 * and download nothing, so each has a Colab link and no download chip and no zip. Until the night of 2026-10-19 the gradient ascent chip stood on
 * the 10:00 lecture row; Carlos then asked for every Colab notebook to be in a coding exercise, numbered in the order to do them (`step` on the link).
 */
const CX_GRADIENT_ASCENT_COLAB = colab('public/exercises/part2/cx_gradient_ascent_student.ipynb');
const CX_MARA_COLAB = colab('public/exercises/part2/cx_mara_student.ipynb');

/**
 * The REINFORCE notebook, "Mara's road: REINFORCE, as the libraries write it", the third notebook of the 11:15 coding exercise of Day 3 (after gradient
 * ascent and Mara's road). One student notebook in `public/exercises/part2/`, copied on the evening of 2026-10-19 at Carlos's request ("a coding exercise that
 * includes the Mara and the REINFORCE notebook") from `cscs-hs26/part2-day1/pg-redo/02-reinforce/notebook/` (commit 04ff868), byte for byte; the solutions
 * notebook stays in that private repository. It needs PyTorch (preinstalled in Colab), numpy and matplotlib, installs nothing and downloads nothing, so it has a
 * Colab link and no download chip and no zip. The same commit replaced the Mara notebook above: both now keep the table of knobs with a row for each road and a
 * column for each place, as in the slides (Carlos: "change the Mara and reinforce notebooks to one row per action").
 */
const CX_REINFORCE_COLAB = colab('public/exercises/part2/cx_reinforce_student.ipynb');

/**
 * The OPTIONAL coding exercise of the Part II, Day 3 afternoon (16:15), beside the RLHF, DPO and GRPO notebook of Luca and Vassili: "Monte Carlo tree search, with no
 * opponent". Theseus in a 6 by 6 labyrinth with two Medusas on fixed rounds; the participants build the search of the 14:00 lecture (five gaps, eight lines to write) and
 * point it at an agent. Adapted on 2026-10-19 from the labyrinth notebook of FDD Weekend 6 and cut to the essentials the same day. One student notebook in
 * `public/exercises/part2/`, copied on 2026-10-20 at Carlos's request ("Put the notebook in the coding exercises of the afternoon (but mark it as optional)") from
 * `cscs-hs26/part2-day1/mcts-labyrinth-exercise/labyrinth_mcts_exercises.ipynb` (commit 91ed527, md5 0ebc8ef5b42a25da0ea4166b52482d2b), byte for byte; the solutions notebook
 * stays in that private repository. It needs the Python standard library only (and IPython's HTML for the animation), installs nothing, downloads nothing and runs in about
 * 15 seconds, so it has a Colab link and a download and no zip. The chip and the Materials entries carry `optional: true`, which draws the "optional" tag. DRAFT.
 */
const CX_MCTS_LABYRINTH_NOTEBOOK = exercise('part2', 'cx_mcts_labyrinth_student.ipynb');
const CX_MCTS_LABYRINTH_COLAB = colab('public/exercises/part2/cx_mcts_labyrinth_student.ipynb');

/**
 * The Part I lecture decks, nine PDFs in `public/slides/part1/`: unchanged
 * copies of the decks as they are projected in the room, so every click is a
 * page of its own and the page numbers run ahead of the slide number in the
 * footer. Copied on 2026-10-05, at Carlos's request, from the built PDFs of
 * `cscs-hs26` at its commit 208ec44, except the first deck, copied again the same
 * day at dc20dbf with its two FAI frames (CLAUDE.md lists each file's source). One
 * constant per deck, so a session's "Slides" chip and its Materials entry carry
 * the same URL and cannot drift apart. The 15:15 session of Day 1 holds two
 * decks, OPRO and GEPA, so it has two chips and two entries. The 14:15 session of
 * Day 2 carries "The KV cache and PagedAttention" (18 frames, 69 pages), copied on
 * 2026-10-07 at Carlos's request from the built `kvcache-slides.pdf` of
 * `cscs-hs26`; it replaced the 177-page `inference-methods.pdf`, which he had
 * removed the same day (CLAUDE.md has the sources). The two decks of the Part II,
 * Day 3 morning are SLIDES_PG below, the two of the Day 3 afternoon SLIDES_RL and the
 * Day 4 10:15 decks SLIDES_AI and SLIDES_BO, the Day 3 14:00 lecture SLIDES_MCTS, the Day 4 14:15 lecture's own deck SLIDES_AGENTIC and its survey deck SLIDES_SURVEY, the Day 4 09:00 diffusion deck SLIDES_DIFFUSION; the other decks of Parts II and III are not on the site yet.
 */
const SLIDES = {
  introSlt: deck(1, 'intro-slt-pytorch.pdf'),
  pytorchSlurm: deck(1, 'pytorch-slurm-clusters.pdf'),
  claudeCode: deck(1, 'claude-code-1.pdf'),
  opro: deck(1, 'prompt-optimization-opro.pdf'),
  gepa: deck(1, 'prompt-optimization-gepa.pdf'),
  tokenisation: deck(1, 'datasets-tokenisation.pdf'),
  transformers: deck(1, 'attention-transformers.pdf'),
  sftLora: deck(1, 'sft-lora.pdf'),
  kvcache: deck(1, 'kv-cache-paged-attention.pdf'),
  // Handouts, one page per slide (the last build step of each), added on 2026-10-21 at Carlos's request ("Make handouts also available on
  // the website") from the handout builds of `cscs-hs26`: `gepa-slides-handout.pdf` (24 pages, md5 393fc0c90d590f649f5a6465d42a95bc, all its pages
  // pixel-equal to pages of the published deck) and `kvcache-slides-handout.pdf` (18 pages, md5 0cc1ca6725104d1aab1883b82ae683df, cut from the
  // same build and passed through Ghostscript, so a few pixels of a page differ). The other seven Part I decks have no handout build.
  gepaHandout: versioned(deck(1, 'prompt-optimization-gepa-handout.pdf'), '393fc0c90d590f649f5a6465d42a95bc'),
  kvcacheHandout: versioned(deck(1, 'kv-cache-paged-attention-handout.pdf'), '0cc1ca6725104d1aab1883b82ae683df'),
};

/**
 * The two lecture decks of the Part II, Day 3 morning "Policy gradient methods", in `public/slides/part2/`, with their handouts: the OFFICIAL
 * decks since 2026-10-19 (Carlos: "put those parts on the website because that's now the official"; on the evening of the same day: "publish the
 * handouts on the website. They are official"). The decks are the click-level PDFs of `cscs-hs26/part2-day1/pg-redo/official/`, copied unchanged
 * like the Part I decks, so the page numbers run ahead of the slide number in the footer; a handout is the same slides with one page each (the last
 * click of every slide), so page n is slide n. Lecture 1 (56 slides, 188 pages) opens with the cold intro (five slides on Aristotle's Nicomachean
 * Ethics, slides 2 to 6: Carlos, late on 2026-10-19, "I really like this cold intro, put it on the policy gradient part 1"), then is gradient ascent,
 * Mara's road, policy gradient methods and REINFORCE, with an appendix "REINFORCE in PyTorch" (slides 51 to 56: Carlos, the same night, "make slide 49
 * till the end like an appendix and give it a title"). Lecture 2 (40 slides, 113 pages) is REINFORCE with a baseline, actor-critic, TD learning, GAE and PPO, whose PPO part ends on the complete
 * loss with the clip (slides 38 to 40, brought back at his word the same night). Apart from lecture 1's appendix they have none (Carlos, 2026-10-19
 * evening: "Drop the appendices, keep them only for the posterity here"): the others stay in the private repository. Each
 * file is one constant, so a session's chip and its Materials entry carry the same URL.
 */
const SLIDES_PG = {
  first: deck(2, 'policy-gradient-methods-1.pdf'),
  second: deck(2, 'policy-gradient-methods-2.pdf'),
  firstHandout: deck(2, 'policy-gradient-methods-1-handout.pdf'),
  secondHandout: deck(2, 'policy-gradient-methods-2-handout.pdf'),
};

/**
 * The two decks of the Part II, Day 3 hour "RLHF, DPO and GRPO" (15:15), in `public/slides/part2/`: `rlhf.pdf` (25 slides, 108 pages) and `dpo-grpo.pdf`
 * (33 frames, 99 pages), the click-level PDFs of `cscs-hs26/part2-day1/rlhf-dpo-grpo-slides/`. They were published on 2026-10-19 at Carlos's request ("put the
 * slides there") as the builds of 2026-10-18 (27 slides and 52 frames) and copied again on 2026-10-20 at his request ("Publish them on the website") after his
 * cuts of that day: the RLHF deck lost its section "Results and limits" (cscs-hs26 e896cc9, md5 6d5d56e88770d8281996b22680f9f266); in the DPO & GRPO deck the
 * second half of the GRPO section is an optional section, the DeepSeek-R1 and comparison sections are gone, and so are its slides 10 and 30 and its appendix on
 * deriving the DPO loss (cscs-hs26 77a3af0, md5 c25b7ed71dd07897ea206edb15f448a0). DRAFT. Their handouts, `rlhf-handout.pdf` (25 pages) and `dpo-grpo-handout.pdf`
 * (33 pages), are the same slides with one page each (the last click of every slide, so page n is slide n); added on 2026-10-20 at his request ("deliver the
 * handout for RLHF GRPO and DPO") and copied again with the decks, from `rlhf-slides-handout.pdf` (md5 d86b99eda58a48020161a9a112fff4f9) and
 * `dpo-grpo-slides-handout.pdf` (md5 a9c5f97869a7f2ff6d3537c1c3b8619e) of the same two commits. The four addresses carry a version tag, `versioned()` above, so
 * that the chips and the Materials entries, which share these constants, hand over the latest build even to a browser that cached the previous one (Carlos,
 * 2026-10-20: "I just want the latest version to appear in the website, both in the resource section and in the chips"). After a refresh, put the new md5 here.
 */
const SLIDES_RL = {
  rlhf: versioned(deck(2, 'rlhf.pdf'), '6d5d56e88770d8281996b22680f9f266'),
  dpoGrpo: versioned(deck(2, 'dpo-grpo.pdf'), 'c25b7ed71dd07897ea206edb15f448a0'),
  rlhfHandout: versioned(deck(2, 'rlhf-handout.pdf'), 'd86b99eda58a48020161a9a112fff4f9'),
  dpoGrpoHandout: versioned(deck(2, 'dpo-grpo-handout.pdf'), 'a9c5f97869a7f2ff6d3537c1c3b8619e'),
};

/**
 * The Part II, Day 3, 14:00 lecture "Planning with Monte Carlo tree search", `public/slides/part2/monte-carlo-tree-search.pdf` and its handout
 * `monte-carlo-tree-search-handout.pdf`: FINAL since the night of 2026-10-19 (Carlos: "make this final and commit push and publish"), changed on 2026-10-20 at
 * his request and copied twice that day (the 60-slide build, then this one), the last time at his word ("Yes, copy the 25-slide MCTS deck and handout to the course website"). 25 slides:
 * a title page, two slides on LATS (slides 2 and 3: what Language Agent Tree Search is, and an excerpt of its results on three tasks, as a motivation of the
 * search; Zhou et al., ICML 2024, Tables 3, 4 and 6) and five sections each behind a divider that shows the road of the lecture (the labyrinth story, the
 * setting, the first version of the search, a bonus for the barely tried, growing the tree), ending on "The four phases". The deck is the click-level build, 70
 * pages, like the other Part II decks, so the number in the footer is the slide number and runs behind the page number; the handout is the same 25 slides with
 * one page each (the last click of every slide), so page n is slide n. Copied unchanged on 2026-10-20 from `cscs-hs26/part2-day1/mcts-slides/` at its commit
 * 5365f45 (md5 b30c3784a16bda081f627c7adf1b1364 for the deck and d93015c51fd28c07f2bd5a25c5952b5a for the handout), replacing the 60-slide build of the same
 * morning (commit 5bc0c49, md5 ba391512a6e41a8e822acbef6a6006d8 and 482ea82c0029c1504a1799447ca7c454) and, before it, the 61-slide build of 2026-10-19 (commit
 * 3f63ce4). What went since the 60-slide build: the cold open on Theseus, the Minotaur and Ariadne (with its two public domain plates, so no plate is in the
 * PDF any more), sections on replanning, on a guess to start from and on where the method is used (AlphaGo and LATS), the appendix, and twelve single slides.
 * The pictures are drawn for the deck.
 */
const SLIDES_MCTS = {
  deck: deck(2, 'monte-carlo-tree-search.pdf'),
  handout: deck(2, 'monte-carlo-tree-search-handout.pdf'),
};

/**
 * The Part II, Day 4, 13:00 lecture "LATS: Language Agent Tree Search", `public/slides/part2/language-agent-tree-search.pdf` and its handout
 * `language-agent-tree-search-handout.pdf`: the FDD Weekend 6 lecture on LATS in the CSCS format, DRAFT. Copied unchanged on 2026-10-20 from
 * `cscs-hs26/part2-day2/lats-slides/` at its commit 3166e62 (md5 9984867ca4c5b10e901ead1b216d849e for the deck, 34 pages with the builds by clicks;
 * md5 0cf58768baecba9030602309d3fc9545 for the handout, one page per frame, eight frames). The addresses carry `versioned()`, so a refresh needs only the new md5.
 */
const SLIDES_LATS = {
  deck: versioned(deck(2, 'language-agent-tree-search.pdf'), '9984867ca4c5b10e901ead1b216d849e'),
  handout: versioned(deck(2, 'language-agent-tree-search-handout.pdf'), '0cf58768baecba9030602309d3fc9545'),
};

/**
 * The Part II, Day 4, 10:15 lecture "AI for science", `public/slides/part2/ai-for-science.pdf`: the OFFICIAL deck since 2026-10-19 (Carlos, after his
 * eighth round of cuts: "Then publish because these are the official slides"), SHORTENED on 2026-10-20 by his ninth round ("We archive this. We're keeping a
 * shorter version ...") and republished on 2026-10-21 ("Publish it with the handout"). Six papers (GraphCast 6 frames, GenCast 5, GAOT 4, AlphaFold 2 5, FunSearch 4,
 * AlphaEvolve 8; Aurora is out), each behind a divider, after a title page: 39 slides, one page each. Unlike the Part I decks it has no click-level pages ("make these
 * slides only a handout only. I don't want the transitions"), so page n is slide n and the number in the footer is the page number (a divider shows none); this one
 * PDF is both the slides and the handout. Copied unchanged on 2026-10-21 from `cscs-hs26/part2-day2/ai-for-science-slides/ai-for-science-slides.pdf` at its commit
 * 925f833 (md5 656490bcd2a0f79bb042db30cb71a7ed). The 72-slide deck it replaces (md5 bd8a711e5aa0cfa8db36e0f5d63bc085) is `full_version/ai-for-science-slides-v2-72slides.pdf` in that folder. The
 * figures that remain are credited on their slides: the papers' own figures of GenCast and GAOT (CC BY 4.0) and two public-domain images of NASA and NOAA for
 * GraphCast; the three crops of the figures of Aurora's Nature paper (CC BY-NC-ND 4.0) left with Aurora. The address carries `versioned()`, so a refresh needs
 * only the new md5.
 */
const SLIDES_AI = {
  deck: versioned(deck(2, 'ai-for-science.pdf'), '656490bcd2a0f79bb042db30cb71a7ed'),
};

/**
 * The second deck of the Part II, Day 4, 10:15 hour "AI for science", `public/slides/part2/gaussians-to-bayesian-optimisation.pdf`: "From
 * Gaussians to Bayesian optimisation", made on 2026-10-19 at Carlos's request ("merge the gaussian slides here. Package this into one slide
 * deck and put it on the website in the section of ai for science") from his lecture on Gaussian distributions and Gaussian processes (four
 * stages, 20 slides, ported from his FDD Weekend 1 deck; its fifth stage, a Gaussian process over anything, was dropped the same evening at his
 * word "Drop stage 5") followed by the four slides "Bayesian optimisation in four slides" as Stage 5. 30 slides in 86 pages. Unlike the AI for
 * science deck it has the click-level pages, since the Gaussian slides show their captions one at a time and a page per slide would lose them,
 * so the number in the footer is the slide number and runs behind the page number. DRAFT. Copied unchanged on 2026-10-19 from
 * `cscs-hs26/part2-day2/gaussian-to-bo-slides/gaussian-to-bo-slides.pdf` (md5 0f5dc6a3050b76b8075095543a6aa6bf). The 38-slide version with
 * Stage 5 is in that folder's `full_version/`, not here. Its handout, `gaussians-to-bayesian-optimisation-handout.pdf` (30 pages, one for each slide, the last
 * build step; copied on 2026-10-21 from `gaussian-to-bo-slides-handout.pdf`, md5 7cc2c1d0ba583cc117e9895e033a75cf, every page pixel-equal to a page of the deck), was
 * added at Carlos's request ("Make handouts also available on the website"). Three Gaussian slides whose captions replace one another at each click ("Fit a
 * Gaussian process: the forecast", "So what is a Gaussian process?", "The same idea, over a map") show only the last caption there, and the second of them
 * only the last of its three pictures.
 */
const SLIDES_BO = {
  deck: deck(2, 'gaussians-to-bayesian-optimisation.pdf'),
  handout: versioned(deck(2, 'gaussians-to-bayesian-optimisation-handout.pdf'), '7cc2c1d0ba583cc117e9895e033a75cf'),
};

const AI4SCI_EXERCISE = colab(
  'public/exercises/part2/cx_ai4sci_student.ipynb'
);
/**
 * The deck "1,580 AI Authors" for the Part II, Day 4, 14:15 lecture "Agentic workflows & what is next", `public/slides/part2/ai-researchers-survey.pdf`: what
 * AI researchers said in December 2024 about when human-level AI arrives, how good or bad they expect it to be and what they fear, from the report "Advanced AI
 * according to 1,580 researchers: uncertain, unsafe, and sooner than we thought" (Grace et al., AI Impacts, September 2026). Published on 2026-10-20 at Carlos's
 * request ("Publish it on the website at 14:15"). 41 pages, one page per slide (no clicks): a title page, 29 slides in four moments with a divider before each and
 * a closing, and six pages of appendix (the quotations with their report pages, where each date and chart comes from, the two papers). Every chart is drawn from
 * numbers the report prints; none of the report's figures is reproduced, and the report is cited on slide 2. DRAFT: Carlos had not reviewed the deck when he asked for
 * it to be published, and the report's PDF states no licence. Copied unchanged from `cscs-hs26/ai-researchers-survey-slides/ai-researchers-survey-2024.pdf` (commit
 * 451cbd7, md5 c90f6aae3e8d5db813e001b4c4e2a9fa); the version tag is the first eight characters of that md5, to change when the deck is copied again.
 */
const SLIDES_SURVEY = {
  deck: versioned(deck(2, 'ai-researchers-survey.pdf'), 'c90f6aae3e8d5db813e001b4c4e2a9fa'),
};

/**
 * The deck for the Part II, Day 4, 14:15 lecture "Agentic workflows & what is next", `public/slides/part2/agentic-workflows.pdf`: seven papers on AI agents that work on software,
 * each on its own card (title, authors and link) and then its slides: AutoCodeRover, Agentless, why context matters (NoLiMa and Lost in the Middle), context files, multi-turn
 * conversations, A-Mem and Self-Repair. Published on 2026-10-20 at Carlos's request ("Publish this slide in the section of agentic workflows next to the slides of the AI
 * researcher survey"). 27 pages, one page per slide (no clicks): the title page, then each paper's card and its slides, with no divider between them. The lecture build with its
 * clicks has 79 pages and is not on the site. The card of "Why context matters" credits the lecture whose structure that section follows. DRAFT: Carlos's review of this
 * 27-page version is not recorded. Copied unchanged from `cscs-hs26/part2-day2/agentic-workflows-slides/agentic-workflows-slides-handout.pdf` (commit 7d18b25, md5
 * 8c4b151314d6c5dd128d16e5dc06e056); the version tag is the first eight characters of that md5, to change when the deck is copied again.
 */
const SLIDES_AGENTIC = {
  deck: versioned(deck(2, 'agentic-workflows.pdf'), '8c4b151314d6c5dd128d16e5dc06e056'),
};

/**
 * The lecture notes "Intuition for Diffusion in Nature and in Generative Modelling" (Carlos Cotrini, 9 pages, compiled with pdfTeX on
 * 2026-03-06) for the Part II, Day 4, 09:00 lecture "Multimodal AI". One PDF in `public/notes/part2/`, copied on 2026-10-19 at Carlos's
 * request ("Let's reuse the pdf, just put it on the website") byte for byte from `cscs-hs26/part2-day2/diffusion-notes/diffusion-notes.pdf`,
 * whose CLAUDE.md records where it came from. Its LaTeX source was searched for and never found, so the PDF is used as it is. DRAFT.
 */
const NOTES_DIFFUSION = notes(2, 'diffusion-notes.pdf');

/**
 * The diffusion part of the Part II, Day 4, 09:00 lecture "Multimodal AI", `public/slides/part2/diffusion-models.pdf` and its handout
 * `diffusion-models-handout.pdf`: "Diffusion models", Carlos's three sketches (the forward and backward process, the training of a diffusion model and
 * the conditional diffusion models with the prompt "cat") in the CSCS format, with a three-sentence explanation in front, a drawing of the model itself and
 * the caption of the conditional training. A title slide and, as slide 2, Carlos's dog slide of the BMAI diffusion deck, "Which are real? Which are fake?"
 * (a mosaic of golden retrievers, his picture unchanged and uncredited in his deck, the source unverified), then seven slides: 23 pages with the builds by clicks
 * (so the footer number runs behind the page number, as in the Part I decks) and a handout of one page per slide, 8 pages. DRAFT. First published on 2026-10-20 at
 * Carlos's request ("put a title slide and then publish this in the section on multimodal AI"; 22 pages, cscs-hs26 commit 6c22a0e) and refreshed on 2026-10-21 at his
 * request ("Bring the slide about the dogs and put it as motivation slide for the deck then publish the slides"), copied unchanged from
 * `cscs-hs26/part2-day2/diffusion-sketches-slides/` at its commit ca3a6dd (md5 5adf4784c9f772c1ba7ce68208c9b5cb for the deck and
 * ac782e6545d4ef6025dff64264f530d2 for the handout). The dog and cat and their noise are drawn for the deck, so there is no image to credit there; the
 * mosaic is the one picture with no known licence. This is the diffusion part only: the lecture's own slides (autoencoders, UNets, cross-attention) are not on
 * the site yet, so the Materials list keeps its "Multimodal AI" placeholder. The addresses carry `versioned()`, so a refresh needs only the new md5.
 */
const SLIDES_DIFFUSION = {
  deck: versioned(deck(2, 'diffusion-models.pdf'), '5adf4784c9f772c1ba7ce68208c9b5cb'),
  handout: versioned(deck(2, 'diffusion-models-handout.pdf'), 'ac782e6545d4ef6025dff64264f530d2'),
};

export const ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI'];

/** "Part I", "Part II", … */
export const partLabel = (p: Pick<Part, 'number'>): string => `Part ${ROMAN[p.number - 1]}`;

const coffee = (time: string): Session => ({ time, title: 'Coffee break', type: 'break' });
const lunch = (time: string): Session => ({ time, title: 'Lunch', type: 'break' });
const endOfDay = (time: string): Session => ({ time, title: 'End of day', type: 'break' });

/** Materials every part shares: the session must be running before anything else. */
const beforeYouStart = [
  { label: 'Setting up a JupyterLab session on Santis', url: SETUP_PAGE, group: 'Before you start' },
  { label: 'Trial notebook: a CNN on one GH200', url: TRIAL_NOTEBOOK, group: 'Before you start' },
];

export const parts: Part[] = [
  {
    id: 'part1',
    number: 1,
    title: 'Machine Learning on HPC and the LLM Workflow',
    theme: 'Statistical learning, PyTorch on Alps, Claude Code, and an LLM from data to inference',
    dates: '6–7 October 2026',
    summary:
      'Two days that take a scientist from a first PyTorch model on a cluster node to a language ' +
      'model built end to end: tokenised data, a transformer, supervised fine-tuning with LoRA, ' +
      'and inference. The first afternoon puts Claude Code to work as a programming partner.',
    days: [
      {
        number: 1,
        dateISO: '2026-10-06',
        hours: '10:00 to 17:30',
        sessions: [
          {
            time: '10:00',
            title: 'Intro to SLT and PyTorch',
            type: 'lecture',
            topic: 'Introduction to Machine Learning on HPC',
            links: [
              { label: 'Slides', url: SLIDES.introSlt },
              { label: 'Square One game', url: SQUARE_ONE },
            ],
          },
          coffee('11:00'),
          {
            time: '11:15',
            title: 'PyTorch with slurm and clusters',
            type: 'lecture',
            links: [{ label: 'Slides', url: SLIDES.pytorchSlurm }],
          },
          {
            time: '12:15',
            title: 'Pytorch with SLURM',
            type: 'exercise',
            links: [{ label: 'Exercise folder', url: CX_PYTORCH_SLURM_ZIP }],
          },
          lunch('13:00'),
          {
            time: '14:00',
            title: 'Claude Code I',
            type: 'lecture',
            topic: 'AI-Enhanced Programming for Modern Developers',
            links: [{ label: 'Slides', url: SLIDES.claudeCode }],
          },
          coffee('15:00'),
          {
            time: '15:15',
            title: 'Claude Code II / Prompt optimization / GEPA',
            type: 'lecture',
            links: [
              { label: 'OPRO slides', url: SLIDES.opro },
              { label: 'GEPA slides', url: SLIDES.gepa },
              { label: 'GEPA handout', url: SLIDES.gepaHandout },
            ],
          },
          {
            time: '16:15',
            title: 'Claude Code and GEPA',
            type: 'exercise',
            links: [{ label: 'Exercise folder', url: CX_CLAUDE_GEPA_ZIP }],
          },
          endOfDay('17:30'),
        ],
      },
      {
        number: 2,
        dateISO: '2026-10-07',
        hours: '09:00 to 16:30',
        sessions: [
          {
            time: '09:00',
            title: 'Datasets & tokenisation',
            type: 'lecture',
            topic: 'End-to-End LLM Development Workflow',
            links: [{ label: 'Slides', url: SLIDES.tokenisation }],
          },
          coffee('10:00'),
          {
            time: '10:15',
            title: 'Attention and transformers',
            type: 'lecture',
            links: [
              { label: 'Slides', url: SLIDES.transformers },
              { label: 'Wuggish attention game', url: WUGGISH_GAME },
            ],
          },
          {
            time: '11:15',
            title: 'LLM from scratch',
            type: 'exercise',
            links: [{ label: 'Exercise folder', url: CX_LLM_ZIP }],
          },
          lunch('12:00'),
          {
            time: '13:00',
            title: 'SFT and LoRA',
            type: 'lecture',
            topic: 'End-to-End LLM Development Workflow (continued)',
            links: [{ label: 'Slides', url: SLIDES.sftLora }],
          },
          coffee('14:00'),
          {
            time: '14:15',
            title: 'Inference methods',
            type: 'lecture',
            links: [
              { label: 'Slides', url: SLIDES.kvcache },
              { label: 'Handout', url: SLIDES.kvcacheHandout },
            ],
          },
          {
            time: '15:15',
            title: 'SFT and LoRA',
            type: 'exercise',
            links: [{ label: 'Exercise folder', url: CX_SFT_ZIP }],
          },
          endOfDay('16:30'),
        ],
      },
    ],
    resources: [
      ...beforeYouStart,
      { label: 'Intro to SLT and PyTorch', url: SLIDES.introSlt, group: 'Lecture slides' },
      { label: 'PyTorch with slurm and clusters', url: SLIDES.pytorchSlurm, group: 'Lecture slides' },
      { label: 'Claude Code I', url: SLIDES.claudeCode, group: 'Lecture slides' },
      { label: 'Claude Code II / Prompt optimization: OPRO', url: SLIDES.opro, group: 'Lecture slides' },
      { label: 'Claude Code II / Prompt optimization: GEPA', url: SLIDES.gepa, group: 'Lecture slides' },
      { label: 'Claude Code II / Prompt optimization: GEPA: handout, one page per slide', url: SLIDES.gepaHandout, group: 'Lecture slides' },
      { label: 'Datasets & tokenisation', url: SLIDES.tokenisation, group: 'Lecture slides' },
      { label: 'Attention and transformers', url: SLIDES.transformers, group: 'Lecture slides' },
      { label: 'SFT and LoRA', url: SLIDES.sftLora, group: 'Lecture slides' },
      { label: 'Inference methods: the KV cache and PagedAttention', url: SLIDES.kvcache, group: 'Lecture slides' },
      { label: 'Inference methods: the KV cache and PagedAttention: handout, one page per slide', url: SLIDES.kvcacheHandout, group: 'Lecture slides' },
      {
        label: 'Square One: guess the side of a square (Day 1, intro to SLT and PyTorch)',
        url: SQUARE_ONE,
        group: 'Visualizations',
      },
      {
        label: 'The Wuggish attention game: bind the words yourself (Day 2, attention and transformers)',
        url: WUGGISH_GAME,
        group: 'Visualizations',
      },
      { label: 'CX Pytorch with SLURM (Day 1 morning)', url: CX_PYTORCH_SLURM_ZIP, group: 'Coding exercises' },
      { label: 'CX Claude Code and GEPA (Day 1 afternoon)', url: CX_CLAUDE_GEPA_ZIP, group: 'Coding exercises' },
      { label: 'CX LLM from scratch (Day 2 morning)', url: CX_LLM_ZIP, group: 'Coding exercises' },
      { label: 'CX SFT and LoRA (Day 2 afternoon)', url: CX_SFT_ZIP, group: 'Coding exercises' },
    ],
  },
  {
    id: 'part2',
    number: 2,
    title: 'Reinforcement Learning for LLMs and Advanced Topics',
    theme: 'Policy gradients, Monte Carlo tree search, RLHF, DPO and GRPO, then multimodal AI, AI for science and agents',
    dates: '20–21 October 2026',
    summary:
      'The first day is reinforcement learning as it is used to align language models, from the ' +
      'policy gradient and tree search to RLHF, DPO and GRPO. The second day widens the view: multimodal models, ' +
      'AI in the sciences, language agent tree search and agentic workflows.',
    days: [
      {
        number: 3,
        dateISO: '2026-10-20',
        hours: '10:00 to 17:30',
        sessions: [
          {
            time: '10:00',
            title: 'Policy gradient methods',
            type: 'lecture',
            topic: 'Reinforcement Learning for LLMs',
            links: [
              { label: 'Slides', url: SLIDES_PG.first },
              { label: 'Handout', url: SLIDES_PG.firstHandout },
              { label: "Mara's road game", url: COURIER_ROAD },
            ],
          },
          coffee('11:00'),
          // 2026-10-19 evening, Carlos: after the break a 30 minute coding exercise on the first lecture (the Mara and REINFORCE notebooks), then 30 minutes of the second.
          // Later that night, Carlos: every Colab notebook goes in a coding exercise, numbered in the order to do them; the gradient ascent notebook, which stood on the
          // 10:00 row, is the first of these three.
          {
            time: '11:15',
            title: 'Coding exercise',
            type: 'exercise',
            links: [
              { label: 'Gradient ascent notebook (Colab)', url: CX_GRADIENT_ASCENT_COLAB, step: 1 },
              { label: "Mara's road notebook (Colab)", url: CX_MARA_COLAB, step: 2 },
              { label: 'REINFORCE notebook (Colab)', url: CX_REINFORCE_COLAB, step: 3 },
            ],
          },
          {
            time: '11:45',
            title: 'Policy gradient methods (continued)',
            type: 'lecture',
            links: [
              { label: 'Slides', url: SLIDES_PG.second },
              { label: 'Handout', url: SLIDES_PG.secondHandout },
            ],
          },
          {
            time: '12:15',
            title: 'Coding exercise',
            type: 'exercise',
            links: [
              { label: 'PPO on CartPole notebook (Colab)', url: CX_PPO_CARTPOLE_COLAB, step: 1 },
              { label: 'Lunar Lander exercise folder', url: CX_RL_ZIP, step: 2 },
            ],
          },
          lunch('13:00'),
          // 2026-10-19 evening, Carlos: the 14:00 lecture becomes Monte Carlo tree search, and RLHF, DPO and GRPO are one hour at 15:15.
          {
            time: '14:00',
            title: 'Monte Carlo tree search',
            type: 'lecture',
            topic: 'Reinforcement Learning for LLMs (continued)',
            links: [
              { label: 'Slides', url: SLIDES_MCTS.deck },
              { label: 'Handout', url: SLIDES_MCTS.handout },
            ],
          },
          coffee('15:00'),
          {
            time: '15:15',
            title: 'RLHF, DPO & GRPO',
            type: 'lecture',
            links: [
              { label: 'RLHF slides', url: SLIDES_RL.rlhf },
              { label: 'RLHF handout', url: SLIDES_RL.rlhfHandout },
              { label: 'DPO & GRPO slides', url: SLIDES_RL.dpoGrpo },
              { label: 'DPO & GRPO handout', url: SLIDES_RL.dpoGrpoHandout },
            ],
          },
          // 2026-10-20, Carlos: the labyrinth notebook of the Monte Carlo tree search lecture goes in the coding exercises of the afternoon, marked optional.
          {
            time: '16:15',
            title: 'Coding exercise',
            type: 'exercise',
            links: [
              { label: 'Exercise folder', url: CX_RLHF_GRPO_ZIP },
              { label: 'Labyrinth notebook (Colab)', url: CX_MCTS_LABYRINTH_COLAB, optional: true },
            ],
          },
          endOfDay('17:30'),
        ],
      },
      {
        number: 4,
        dateISO: '2026-10-21',
        hours: '09:00 to 16:30',
        sessions: [
          {
            time: '09:00',
            title: 'Multimodal AI',
            type: 'lecture',
            topic: 'Advanced Topics in AI Systems and Applications',
            links: [
              { label: 'Diffusion models slides', url: SLIDES_DIFFUSION.deck },
              { label: 'Diffusion models handout', url: SLIDES_DIFFUSION.handout },
              { label: 'Yogurt cup game', url: YOGURT_CUPS },
              { label: 'Lecture notes', url: NOTES_DIFFUSION },
            ],
          },
          coffee('10:00'),
          {
            time: '10:15',
            title: 'AI for science',
            type: 'lecture',
            links: [
              { label: 'AI for science slides', url: SLIDES_AI.deck },
              { label: 'Gaussians to Bayesian optimisation slides', url: SLIDES_BO.deck },
              { label: 'Gaussians to Bayesian optimisation handout', url: SLIDES_BO.handout },
            ],
          },
          { 
            time: '11:15', 
            title: 'Coding exercise', 
            type: 'exercise',   
            links: [
              { label: 'AI for Science notebook (Colab)',url: AI4SCI_EXERCISE,},
            ], 
          },
          lunch('12:00'),
          // 2026-10-19, Carlos: "move agentic workflows and what is next to the block of 2:15 p.m. in the afternoon, and instead at
          // 1 p.m. you put the topic on LATS" (language agent tree search). The grid had left 14:15 blank. The slides went up on 2026-10-20 (SLIDES_LATS).
          {
            time: '13:00',
            title: 'LATS: Language Agent Tree Search',
            type: 'lecture',
            topic: 'Advanced Topics (continued)',
            links: [
              { label: 'Slides', url: SLIDES_LATS.deck },
              { label: 'Handout', url: SLIDES_LATS.handout },
            ],
          },
          coffee('14:00'),
          {
            time: '14:15',
            title: 'Agentic workflows & what is next',
            type: 'lecture',
            links: [
              { label: 'Agentic workflows slides', url: SLIDES_AGENTIC.deck },
              { label: 'AI researchers survey slides', url: SLIDES_SURVEY.deck },
            ],
          },
          { time: '15:15', title: 'Coding exercise', type: 'exercise' },
          endOfDay('16:30'),
        ],
      },
    ],
    resources: [
      ...beforeYouStart,
      { label: 'Policy gradient methods, lecture 1: from gradient ascent to REINFORCE', url: SLIDES_PG.first, group: 'Lecture slides' },
      { label: 'Policy gradient methods, lecture 1: handout, one page per slide', url: SLIDES_PG.firstHandout, group: 'Lecture slides' },
      { label: 'Policy gradient methods, lecture 2: baselines, actor-critic, TD, GAE and PPO', url: SLIDES_PG.second, group: 'Lecture slides' },
      { label: 'Policy gradient methods, lecture 2: handout, one page per slide', url: SLIDES_PG.secondHandout, group: 'Lecture slides' },
      { label: 'Monte Carlo tree search', url: SLIDES_MCTS.deck, group: 'Lecture slides' },
      { label: 'Monte Carlo tree search: handout, one page per slide', url: SLIDES_MCTS.handout, group: 'Lecture slides' },
      { label: 'RLHF', url: SLIDES_RL.rlhf, group: 'Lecture slides' },
      { label: 'RLHF: handout, one page per slide', url: SLIDES_RL.rlhfHandout, group: 'Lecture slides' },
      { label: 'DPO & GRPO', url: SLIDES_RL.dpoGrpo, group: 'Lecture slides' },
      { label: 'DPO & GRPO: handout, one page per slide', url: SLIDES_RL.dpoGrpoHandout, group: 'Lecture slides' },
      { label: 'Multimodal AI', url: SOON, group: 'Lecture slides' },
      { label: 'Multimodal AI: diffusion models', url: SLIDES_DIFFUSION.deck, group: 'Lecture slides' },
      { label: 'Multimodal AI: diffusion models: handout, one page per slide', url: SLIDES_DIFFUSION.handout, group: 'Lecture slides' },
      { label: 'AI for science', url: SLIDES_AI.deck, group: 'Lecture slides' },
      { label: 'Gaussians to Bayesian optimisation', url: SLIDES_BO.deck, group: 'Lecture slides' },
      { label: 'Gaussians to Bayesian optimisation: handout, one page per slide', url: SLIDES_BO.handout, group: 'Lecture slides' },
      { label: 'LATS: Language Agent Tree Search', url: SLIDES_LATS.deck, group: 'Lecture slides' },
      { label: 'LATS: Language Agent Tree Search: handout, one page per slide', url: SLIDES_LATS.handout, group: 'Lecture slides' },
      { label: 'Agentic workflows & what is next', url: SLIDES_AGENTIC.deck, group: 'Lecture slides' },
      { label: 'AI researchers on the future of AI: the 2024 survey of 1,580 researchers', url: SLIDES_SURVEY.deck, group: 'Lecture slides' },
      {
        label: 'Intuition for diffusion in nature and in generative modelling (Day 4, multimodal AI)',
        url: NOTES_DIFFUSION,
        group: 'Lecture notes',
      },
      {
        label: "Mara's road: walk a busker down a mountain and fill her hat (Day 3, policy gradient methods)",
        url: COURIER_ROAD,
        group: 'Visualizations',
      },
      {
        label: 'Yogurt cups: invent a code with a partner, on two laptops (Day 4, multimodal AI)',
        url: YOGURT_CUPS,
        group: 'Visualizations',
      },
      { label: 'CX Gradient ascent: the grasshopper (Day 3, 11:15 coding exercise, opens in Google Colab)', url: CX_GRADIENT_ASCENT_COLAB, group: 'Coding exercises', step: 1 },
      { label: "CX Mara's road: learn the best path by playing (Day 3, 11:15 coding exercise, opens in Google Colab)", url: CX_MARA_COLAB, group: 'Coding exercises', step: 2 },
      { label: 'CX REINFORCE: the update as the libraries write it (Day 3, 11:15 coding exercise, opens in Google Colab)', url: CX_REINFORCE_COLAB, group: 'Coding exercises', step: 3 },
      { label: 'CX PPO on CartPole (Day 3, 12:15 coding exercise, opens in Google Colab)', url: CX_PPO_CARTPOLE_COLAB, group: 'Coding exercises', step: 1 },
      { label: 'CX PPO on CartPole (Day 3, 12:15 coding exercise, the notebook file)', url: CX_PPO_CARTPOLE_NOTEBOOK, group: 'Coding exercises', step: 1 },
      { label: 'CX Policy gradients on Lunar Lander (Day 3, 12:15 coding exercise, the notebook and util.py in one folder)', url: CX_RL_ZIP, group: 'Coding exercises', step: 2 },
      { label: 'CX RLHF, DPO and GRPO (Day 3 afternoon)', url: CX_RLHF_GRPO_ZIP, group: 'Coding exercises' },
      { label: 'CX Monte Carlo tree search on a labyrinth (Day 3 afternoon, opens in Google Colab)', url: CX_MCTS_LABYRINTH_COLAB, group: 'Coding exercises', optional: true },
      { label: 'CX Monte Carlo tree search on a labyrinth (Day 3 afternoon, the notebook file)', url: CX_MCTS_LABYRINTH_NOTEBOOK, group: 'Coding exercises', optional: true },
      { label: 'Day 4 morning exercise', url: SOON, group: 'Coding exercises' },
      { label: 'Day 4 afternoon exercise', url: SOON, group: 'Coding exercises' },
    ],
  },
  {
    id: 'part3',
    number: 3,
    title: 'Distributed Training and Efficient Architectures',
    theme: 'PyTorch DDP, parallelism strategies, memory optimisation, MoE and attention at scale',
    dates: 'Dates to be announced',
    summary:
      'Training beyond one GPU: data parallelism and collectives, then the parallelism strategies ' +
      'and memory tricks that make large language models trainable. The second day covers the ' +
      'architectures that scale, from mixture of experts to long-context and FlashAttention.',
    days: [
      {
        number: 5,
        hours: '10:00 to 17:30',
        sessions: [
          {
            time: '10:00',
            title: 'Data parallelism & PyTorch DDP',
            type: 'lecture',
            topic: 'Distributed Deep Learning with PyTorch',
          },
          coffee('11:00'),
          { time: '11:15', title: 'Collectives, multi-node & profiling', type: 'lecture' },
          { time: '12:15', title: 'Coding exercise', type: 'exercise' },
          lunch('13:00'),
          {
            time: '14:00',
            title: 'Parallelism strategies (DP / TP / PP)',
            type: 'lecture',
            topic: 'Training Large Language Models at Scale',
          },
          coffee('15:00'),
          { time: '15:15', title: 'Memory optimisation (ZeRO, FP8, checkpointing)', type: 'lecture' },
          { time: '16:15', title: 'Coding exercise and deep speed', type: 'exercise' },
          endOfDay('17:30'),
        ],
      },
      {
        number: 6,
        hours: '09:00 to 16:30',
        sessions: [
          {
            time: '09:00',
            title: 'Mixture of Experts & expert parallelism',
            type: 'lecture',
            topic: 'Advanced Parallelism & Efficient Architectures',
          },
          coffee('10:00'),
          { time: '10:15', title: 'Long-context: sequence & context parallelism', type: 'lecture' },
          { time: '11:15', title: 'Coding exercise', type: 'exercise' },
          lunch('12:00'),
          {
            time: '13:00',
            title: 'FlashAttention, GQA / MQA & attention optimisation',
            type: 'lecture',
            topic: 'Advanced Parallelism (continued)',
          },
          coffee('14:00'),
          { time: '14:15', title: 'Extended hands-on & troubleshooting', type: 'lecture' },
          { time: '15:15', title: 'Coding exercise', type: 'exercise' },
          endOfDay('16:30'),
        ],
      },
    ],
    resources: [
      ...beforeYouStart,
      { label: 'Data parallelism & PyTorch DDP', url: SOON, group: 'Lecture slides' },
      { label: 'Collectives, multi-node & profiling', url: SOON, group: 'Lecture slides' },
      { label: 'Parallelism strategies (DP / TP / PP)', url: SOON, group: 'Lecture slides' },
      { label: 'Memory optimisation (ZeRO, FP8, checkpointing)', url: SOON, group: 'Lecture slides' },
      { label: 'Mixture of Experts & expert parallelism', url: SOON, group: 'Lecture slides' },
      { label: 'Long-context: sequence & context parallelism', url: SOON, group: 'Lecture slides' },
      { label: 'FlashAttention, GQA / MQA & attention optimisation', url: SOON, group: 'Lecture slides' },
      { label: 'Day 5 morning exercise', url: SOON, group: 'Coding exercises' },
      { label: 'Day 5 afternoon exercise', url: SOON, group: 'Coding exercises' },
      { label: 'Day 6 morning exercise', url: SOON, group: 'Coding exercises' },
      { label: 'Day 6 afternoon exercise', url: SOON, group: 'Coding exercises' },
    ],
  },
];

export const getPart = (id: string): Part | undefined => parts.find((p) => p.id === id);

/**
 * One room label for a part: the single room when both days share it, or
 * "Day 1 X · Day 2 Y" when they differ; undefined while no room is known.
 */
export function partRoom(p: Part): string | undefined {
  const [a, b] = p.days;
  if (!a.room && !b.room) return undefined;
  if (a.room === b.room) return a.room;
  return `Day ${a.number} ${a.room ?? 'TBA'} · Day ${b.number} ${b.room ?? 'TBA'}`;
}
