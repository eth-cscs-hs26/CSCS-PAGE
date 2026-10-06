import { useEffect } from 'react';
import { TRIAL_NOTEBOOK } from '../data/parts';

/**
 * The participant-facing setup guide, transcribed from `explanation.md`
 * (Luca, 2026-09-25) with its wording kept. The spawn values are those of
 * Carlos's screenshot of the spawn page, 2026-09-25; the TOML path is on the
 * page on purpose (Luca, 2026-09-26). Check the path before each course day:
 * it sits in a course account's scratch, where unused files are deleted after
 * 30 days.
 */

const HUB = 'https://jupyter-santis.cscs.ch/hub/spawn';
/**
 * CSCS's reservation for Part I (Hussein, 2026-10-05): 10 nodes, one GPU per
 * participant, until Wednesday 7 October 21:00. It is for these notebook
 * sessions; batch jobs leave it out (Carlos, 2026-10-05). Part II has none yet.
 */
const RESERVATION = 'ai-training';
const TOML = '/capstor/scratch/cscs/course_00776/jupyter/pytorch-cscs-jlab.toml';
const IMAGE = '/capstor/store/cscs/cscs/jupyter/pytorch/pt-26.05-py3-jlab.sqsh';
const SPAWN_SCREENSHOT = `${import.meta.env.BASE_URL}guides/img/jupyter-spawn.png`;
/**
 * The exercise zips of this site, in course order. The download line needs the
 * site's absolute address: the build's base is relative ('./').
 */
const SITE = 'https://eth-cscs-hs26.github.io/CSCS-PAGE';
const EXERCISES = [
  { when: 'Tuesday 6 October, first exercise (12:15)', title: 'CX Pytorch with SLURM', zip: '01_pytorch_slurm.zip' },
  { when: 'Tuesday 6 October, second exercise (16:15)', title: 'CX Claude Code and GEPA', zip: 'cx2_claude_code_gepa.zip' },
  { when: 'Wednesday 7 October, first exercise (11:15)', title: 'CX LLM from scratch', zip: 'llm_from_scratch.zip' },
  { when: 'Wednesday 7 October, second exercise (15:15)', title: 'CX SFT and LoRA', zip: 'sft_lora.zip' },
];
const downloadLine = (zip: string) =>
  `cd ~ && curl -LO ${SITE}/exercises/part1/${zip} && unzip ${zip}`;

const INSTALL_SNIPPET = `import importlib, subprocess, sys
for module, package in (("torchvision", "torchvision"), ("sklearn", "scikit-learn")):
    try:
        importlib.import_module(module)
    except ImportError:
        subprocess.run([sys.executable, "-m", "pip", "install", "-q", package], check=False)`;

export function SetupPage() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <article className="section">
      <div className="container">
        <header className="wdetail-head">
          <div className="wdetail-head__eyebrow">
            <span className="wdetail-head__num">Setup</span>
          </div>
          <h1>Running a notebook on Santis</h1>
          <p className="wdetail-head__theme">
            From your CSCS account to a notebook running on one GH200
          </p>
        </header>

        <div className="guide">
          <p className="guide__lead">
            Course notebooks run on Santis, the Alps cluster at CSCS, inside a JupyterLab session
            with one GH200 GPU. This page takes you from your CSCS account to a running notebook
            and explains what the session provides. The PyTorch with SLURM exercise also submits
            separate batch jobs from a JupyterLab terminal.
          </p>

          <h2>
            <span>1</span>Your CSCS account
          </h2>
          <p>
            You need the course account CSCS emailed you: a username that starts with{' '}
            <code>course_</code>, the password you set, and an authenticator app linked at your
            first sign-in. Sort that out before the session; everything below assumes you can sign in.
          </p>

          <h2>
            <span>2</span>Start a JupyterLab session
          </h2>
          <p>Open the hub and sign in:</p>
          <pre>
            <code>
              <a href={HUB} target="_blank" rel="noopener noreferrer">
                {HUB}
              </a>
            </code>
          </pre>
          <p>
            Sign in with the <strong>course account</strong> (the username that starts with <code>course_</code>),
            not with any other CSCS account you may have: only the course account belongs to the
            project that pays for the GPU, and the form below will not submit with another one.
          </p>
          <p>Fill in the form as in the screenshot below.</p>
          <ul>
            <li>
              <strong>Environment:</strong> choose <em>Custom Container</em>.
            </li>
            <li>
              <strong>Path to CE toml file:</strong> paste
              <pre>
                <code>{TOML}</code>
              </pre>
            </li>
            <li>
              <strong>GPUs:</strong> 1.
            </li>
            <li>
              <strong>Runtime:</strong> 4h.
            </li>
            <li>
              <strong>Advanced settings:</strong> on 6 and 7 October, open this section and set the
              reservation to <code>{RESERVATION}</code>, the GPUs CSCS keeps for this course, one per
              participant. On the other days, leave it closed.
            </li>
          </ul>
          <p>
            The launch summary on the right should read: environment <em>container</em>, GPUs 1,
            runtime 4:00:00, partition <em>normal</em>, account <code>ai-tutorial-course2026-cscs</code>,
            and, on 6 and 7 October, reservation <code>{RESERVATION}</code>.
            Press <strong>Launch session</strong>. The page waits while the cluster schedules your
            job, usually under two minutes, then JupyterLab opens.
          </p>
          <p>
            What you asked for: the container is a ready-made image with PyTorch, CUDA and
            JupyterLab, and the TOML file tells the hub where to find it. One GPU is one GH200 chip.
            The runtime is the wall-clock limit of the session: after four hours it is killed, and
            your files stay on disk.
          </p>
          <figure className="guide__figure">
            <img src={SPAWN_SCREENSHOT} alt="The JupyterHub spawn page for Santis, filled in" />
            <figcaption>
              The spawn page, filled in. On 6 and 7 October its summary also shows the reservation.
            </figcaption>
          </figure>

          <h2>
            <span>3</span>What the container gives you
          </h2>
          <p>The TOML file you pasted points the hub at an image CSCS keeps on shared storage:</p>
          <pre>
            <code>{IMAGE}</code>
          </pre>
          <p>
            It is NVIDIA's PyTorch container, release 26.05, with JupyterLab added. Without
            installing anything, a notebook can import PyTorch built for the GH200, torchvision,
            NumPy and the rest of what that image ships. The full list is one cell away:
          </p>
          <pre>
            <code>!pip list</code>
          </pre>
          <p>
            Anything else is a pip install away. The image is writable, so a plain{' '}
            <code>pip install</code> in a cell works and lands inside the container. The container
            is rebuilt at every session, so that install is gone next time and takes a minute to
            redo; add <code>--user</code> and the package lands in <code>~/.local</code> in your
            home directory and stays. The course notebooks check before installing, so the same
            cell is right on a laptop, on Colab and here:
          </p>
          <pre>
            <code>{INSTALL_SNIPPET}</code>
          </pre>
          <p>
            Inside the session you see your home directory, <code>/capstor</code> (scratch and
            store) and <code>/iopsstor</code>. The container sets{' '}
            <code>HF_HOME</code> to <code>/capstor/scratch/cscs/$USER/hf_cache</code>, so anything
            Hugging Face downloads lands on scratch, not in your 50 GB home. Put your own datasets
            and checkpoints on <code>$SCRATCH</code> too; files unused for 30 days are deleted there.
          </p>
          <p>
            Some exercises ship a helper file next to the notebook, <code>&lt;name&gt;_setup.py</code>,
            holding the plumbing: imports and installs, data loading, grading, display helpers. The
            notebook then imports it in one line and shows only the code that teaches something.
            When you receive such a pair, the two files must sit in the same folder.
          </p>

          <h2>
            <span>4</span>Get the exercise files
          </h2>
          <p>
            Every exercise is one folder: the notebook and the files it uses, which must stay
            together. The quickest way to get it: open a terminal in JupyterLab (File → New →
            Terminal) and paste the line of your exercise. It downloads the folder from this site
            and unpacks it in your home directory; the folder appears in the file browser on the
            left (click its refresh button if not).
          </p>
          {EXERCISES.map((ex) => (
            <div key={ex.zip}>
              <p>
                <strong>{ex.when}:</strong> {ex.title}
              </p>
              <pre>
                <code>{downloadLine(ex.zip)}</code>
              </pre>
            </div>
          ))}
          <p>
            <strong>Or download the zip from this site.</strong> Each exercise is one download,
            &ldquo;Exercise folder&rdquo;, on the Part I page. Unzip it on your laptop, then select
            the files inside the unpacked folder and drag them together into the JupyterLab file
            browser, into one folder of their own: the file browser accepts dropped files, not a
            dropped folder. Or drag the zip itself in and unpack it in the terminal with{' '}
            <code>unzip &lt;name&gt;.zip</code>.
          </p>
          <p>
            Unpacking a second time asks before overwriting your edits; rename the old folder first
            if you want a clean restart.
          </p>

          <div className="notice">
            <h3 className="notice__title">PyTorch with SLURM: one line before sbatch</h3>
            <p>
              Its folder holds <code>cluster-env.sh</code>. In a JupyterLab terminal, move into the
              folder and run <code>source cluster-env.sh</code> once, before the first{' '}
              <code>sbatch</code>; without it, <code>sbatch</code>, <code>squeue</code> and{' '}
              <code>sacct</code> fail inside this container. Run it again in every new terminal.
            </p>
          </div>

          <h2>
            <span>5</span>Run the notebook
          </h2>
          <p>
            Double-click the notebook and follow its instructions. Most notebooks can be run top to
            bottom with Shift+Enter or Run → Run All Cells. PyTorch with SLURM pauses for two
            batch jobs and their job IDs, so run it section by section. Collapsed cells are
            plumbing: run them like any other, and click their ··· bar to read the code. If a
            setup cell asks you to restart the kernel after installing packages, do so
            (Kernel → Restart Kernel…) and run the cell again.
          </p>

          <div className="notice">
            <h3 className="notice__title">Try it now: a CNN on one GH200</h3>
            <p>
              A small notebook that follows the pattern of every course notebook: it probes what the
              container already has, installs the little that is missing, puts a dataset on scratch
              and trains a convolutional network on the GPU. Two epochs on FashionMNIST take well
              under a minute. If it runs top to bottom, your session is ready for the course.
            </p>
            <p>
              Download it, drag it into JupyterLab as in step 4, and run it as in step 5.
            </p>
            <a className="btn" href={TRIAL_NOTEBOOK} download="">
              Trial notebook (Notebook ↓)
            </a>
          </div>

          <h2>
            <span>6</span>When you are done
          </h2>
          <p>
            File → Hub Control Panel → <strong>Stop My Server</strong> frees the GPU for someone
            else. The session ends by itself after four hours anyway.
          </p>
          <p>
            Stuck? Ask a teaching assistant. CSCS's own documentation is at{' '}
            <a href="https://docs.cscs.ch" target="_blank" rel="noopener noreferrer">
              docs.cscs.ch
            </a>
            .
          </p>
        </div>
      </div>
    </article>
  );
}
