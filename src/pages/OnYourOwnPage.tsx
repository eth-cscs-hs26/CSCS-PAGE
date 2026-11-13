import { useEffect, type ReactNode } from 'react';
import { colab, exercise } from '../data/parts';
// The TOML exactly as this site serves it, shown on the page so that it can be read before it is used.
import TOML_TEXT from '../../public/exercises/self-paced/pytorch-jlab.toml?raw';

/**
 * "On your own": every exercise of the course, run after the course on the participant's own
 * CSCS account (Luca, 2026-11-13). The course accounts closed on 22 October 2026 and with them
 * the scratch folders some exercises read; former participants asked for all the material on
 * the website. The Setup page stays as it was for the next iteration; this page is the
 * self-paced route beside it.
 *
 * Rule (Luca, 2026-11-13): anything downloadable and larger than the notebooks is built or
 * downloaded on the cluster, never served here. Three exercises were changed for that, in
 * `cscs-hs26/self-paced/` (branch `self-paced`), whose `build_zips.py` writes the three zips
 * and the TOML of `public/exercises/self-paced/`. The others are served from their course
 * folders, unchanged: they already download what they need into the participant's scratch.
 *
 * DRAFT, untested: nobody has yet run these steps from an ordinary CSCS account.
 */

const SITE = 'https://eth-cscs-hs26.github.io/CSCS-PAGE';
const HUB = 'https://jupyter-santis.cscs.ch/hub/spawn';
const TOML_FILE = 'pytorch-jlab.toml';
const TOML_URL = `${SITE}/exercises/self-paced/${TOML_FILE}`;
const TOML_HREF = exercise('self-paced', TOML_FILE);
const SPAWN_SCREENSHOT = `${import.meta.env.BASE_URL}guides/img/jupyter-spawn.png`;

type Exercise = {
  when: string;
  title: string;
  /** Folder of public/exercises/ and file name: a zip (unpacked in ~) or a single notebook. */
  folder: string;
  file: string;
  /** A Colab link, for the notebooks that were written for Colab. */
  colabPath?: string;
  /** What the first run builds or downloads, and anything to do once. */
  firstRun: ReactNode;
  /** Optional one-time command, shown as a code block. */
  once?: string;
  /** True for the three exercises changed for this page. */
  selfPaced?: boolean;
};

const PART1: Exercise[] = [
  {
    when: 'Part I, Day 1, 12:15',
    title: 'PyTorch with SLURM',
    folder: 'self-paced',
    file: '01_pytorch_slurm.zip',
    selfPaced: true,
    firstRun: (
      <>
        Three things to do once. Put your project in the line{' '}
        <code>#SBATCH --account=&lt;YOUR_PROJECT&gt;</code> of <code>submit.sbatch</code>. Pull the
        PyTorch uenv of the lecture into your own uenv repository, from a terminal on a Santis login
        node (the <code>uenv</code> command is not available inside JupyterLab), with the line below.
        And in every JupyterLab terminal you submit from, run <code>source cluster-env.sh</code> in the
        exercise folder. The <code>README.md</code> in the folder explains each step and the usual
        errors.
      </>
    ),
    once: 'uenv image pull pytorch/v2.9.1:v2',
  },
  {
    when: 'Part I, Day 1, 16:15',
    title: 'Claude Code and GEPA',
    folder: 'self-paced',
    file: 'cx2_claude_code_gepa.zip',
    selfPaced: true,
    firstRun: (
      <>
        Once, in a JupyterLab terminal, run <code>prepare_cx2.sh</code> from the exercise folder, as
        below. It puts Ollama, the two open models of the exercise (about 20 GB) and the Claude Code
        CLI in <code>$SCRATCH/cx2</code>. No API key is needed: Claude Code talks to the open model on
        your own GPU. If the script has not run, both parts of the notebook replay saved runs instead.
      </>
    ),
    once: 'cd ~/cx2_claude_code_gepa && bash prepare_cx2.sh',
  },
  {
    when: 'Part I, Day 2, 11:15',
    title: 'LLM from scratch',
    folder: 'part1',
    file: 'llm_from_scratch.zip',
    firstRun:
      'The helper downloads the public TinyStories data (about 230 MB) on the first run and trains the tokeniser from it.',
  },
  {
    when: 'Part I, Day 2, 15:15',
    title: 'SFT and LoRA',
    folder: 'part1',
    file: 'sft_lora.zip',
    firstRun:
      'The first run downloads Qwen2.5-0.5B and the SQL dataset from Hugging Face into your scratch, and writes its checkpoints there.',
  },
];

const PART2: Exercise[] = [
  {
    when: 'Part II, Day 3, 11:15, notebook 1',
    title: 'Gradient ascent: the grasshopper',
    folder: 'part2',
    file: 'cx_gradient_ascent_student.ipynb',
    colabPath: 'public/exercises/part2/cx_gradient_ascent_student.ipynb',
    firstRun: 'Needs only NumPy and Matplotlib; downloads nothing.',
  },
  {
    when: 'Part II, Day 3, 11:15, notebook 2',
    title: "Mara's road",
    folder: 'part2',
    file: 'cx_mara_student.ipynb',
    colabPath: 'public/exercises/part2/cx_mara_student.ipynb',
    firstRun: 'Needs only NumPy and Matplotlib; downloads nothing.',
  },
  {
    when: 'Part II, Day 3, 11:15, notebook 3',
    title: 'REINFORCE, as the libraries write it',
    folder: 'part2',
    file: 'cx_reinforce_student.ipynb',
    colabPath: 'public/exercises/part2/cx_reinforce_student.ipynb',
    firstRun: 'Needs PyTorch, NumPy and Matplotlib; downloads nothing.',
  },
  {
    when: 'Part II, Day 3, 12:15, notebook 1',
    title: 'PPO on CartPole',
    folder: 'part2',
    file: 'cx_ppo_cartpole_student.ipynb',
    colabPath: 'public/exercises/part2/cx_ppo_cartpole_student.ipynb',
    firstRun: 'Installs gymnasium itself on the first run.',
  },
  {
    when: 'Part II, Day 3, 12:15, notebook 2',
    title: 'Policy gradients on Lunar Lander',
    folder: 'part2',
    file: 'rl_policy_gradients.zip',
    firstRun: 'Its first cell installs and builds the Box2D physics engine the game needs.',
  },
  {
    when: 'Part II, Day 3, 16:15',
    title: 'RLHF, DPO and GRPO',
    folder: 'self-paced',
    file: 'rlhf_grpo.zip',
    selfPaced: true,
    firstRun: (
      <>
        The preference data, <code>preferences.jsonl</code>, ships in the folder. The chatbot
        checkpoint of Part 1 (6 GB) does not: a cell right after the Setup builds it into{' '}
        <code>$SCRATCH/rlhf_grpo</code> the first time, from the base Qwen2.5-1.5B and public Dolly
        data, in roughly ten to twenty minutes (an estimate). Later runs find it there. Part 2
        downloads GSM8K and Qwen2.5-0.5B-Instruct.
      </>
    ),
  },
  {
    when: 'Part II, Day 3, 16:15, optional',
    title: 'Monte Carlo tree search on a labyrinth',
    folder: 'part2',
    file: 'cx_mcts_labyrinth_student.ipynb',
    colabPath: 'public/exercises/part2/cx_mcts_labyrinth_student.ipynb',
    firstRun: 'Standard library only; downloads nothing and runs in seconds.',
  },
  {
    when: 'Part II, Day 4, 11:15',
    title: 'AI for science: Bayesian optimisation and active learning',
    folder: 'part2',
    file: 'cx_ai4sci_student.ipynb',
    colabPath: 'public/exercises/part2/cx_ai4sci_student.ipynb',
    firstRun: 'Downloads Qwen2.5-0.5B-Instruct from Hugging Face for its embeddings.',
  },
  {
    when: 'Part II, Day 4, 15:15',
    title: 'Agentic workflows',
    folder: 'part2',
    file: 'cx-agents.zip',
    firstRun:
      'The first run downloads Qwen2.5-3B-Instruct (about 6 GB) from Hugging Face into your scratch.',
  },
];

const getLine = (ex: Exercise) =>
  ex.file.endsWith('.zip')
    ? `cd ~ && curl -LO ${SITE}/exercises/${ex.folder}/${ex.file} && unzip ${ex.file}`
    : `mkdir -p ~/notebooks && cd ~/notebooks && curl -LO ${SITE}/exercises/${ex.folder}/${ex.file}`;

function ExerciseBlock({ ex }: { ex: Exercise }) {
  return (
    <div className="guide__ex">
      <p className="guide__when">{ex.when}</p>
      <h3>
        {ex.title}
        {ex.selfPaced && <span className="guide__tag">self-paced version</span>}
      </h3>
      <pre>
        <code>{getLine(ex)}</code>
      </pre>
      <p>{ex.firstRun}</p>
      {ex.once && (
        <pre>
          <code>{ex.once}</code>
        </pre>
      )}
      <p className="guide__links">
        <a href={exercise(ex.folder, ex.file)} download="">
          {ex.file.endsWith('.zip') ? 'Exercise folder (zip ↓)' : 'Notebook ↓'}
        </a>
        {ex.colabPath && (
          <>
            {' · '}
            <a href={colab(ex.colabPath)} target="_blank" rel="noopener noreferrer">
              Open in Colab
            </a>
          </>
        )}
      </p>
    </div>
  );
}

export function OnYourOwnPage() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <article className="section">
      <div className="container">
        <header className="wdetail-head">
          <div className="wdetail-head__eyebrow">
            <span className="wdetail-head__num">On your own</span>
          </div>
          <h1>The exercises on your own CSCS account</h1>
          <p className="wdetail-head__theme">
            After the course: every coding exercise on Santis, with your own project
          </p>
        </header>

        <div className="guide">
          <p className="guide__lead">
            The course is over and the course accounts closed on 22 October 2026. Some exercises
            read models and data from those accounts&rsquo; folders on the cluster, so they no
            longer run as they were taught. This page gives you every exercise in a form that runs
            on your own CSCS account: the files come from this site, and anything large, models
            and datasets, is downloaded or built on the cluster the first time you run it. The GPU
            time is charged to your own project.
          </p>

          <div className="notice">
            <h3 className="notice__title">Written after the course, not yet tested</h3>
            <p>
              These steps and the three self-paced versions below were prepared after the course
              and have not yet been run end to end from an ordinary CSCS account. Each exercise
              says what its first run does, and the self-paced ones print what to do when a step
              fails.
            </p>
          </div>

          <h2>
            <span>1</span>What you need
          </h2>
          <p>
            A CSCS account with a project that has GPU time on Santis, the Alps cluster at CSCS, and
            SSH access to Santis as for your own work. Every exercise runs on one GH200 GPU inside
            a JupyterLab session; the PyTorch with SLURM exercise also submits two five-minute
            batch jobs. The course accounts and the course reservation are gone, so everything
            below uses your own account.
          </p>

          <h2>
            <span>2</span>Put the course TOML in your home directory
          </h2>
          <p>
            The JupyterLab session starts from a container that a small TOML file describes. Keep
            your copy in your home directory: files on scratch that nobody reads for 30 days are
            deleted. From a terminal on a Santis login node:
          </p>
          <pre>
            <code>{`curl -L -o ~/${TOML_FILE} ${TOML_URL}\necho ~/${TOML_FILE}`}</code>
          </pre>
          <p>
            The second line prints the full path you will paste into the hub, something like{' '}
            <code>/users/&lt;your username&gt;/{TOML_FILE}</code>. This is the file:
          </p>
          <pre>
            <code>{TOML_TEXT}</code>
          </pre>
          <p>
            <code>image</code> is NVIDIA&rsquo;s PyTorch container, release 26.05, with JupyterLab
            added, kept by CSCS on shared storage. The <code>mounts</code> make your home, scratch
            and store visible inside it, along with what Slurm needs; the last two lines mount one
            library, <code>libjson-c.so.5</code>, without which <code>sbatch</code> fails inside
            JupyterLab (the course TOML of the Setup page does not have them).{' '}
            <code>HF_HOME</code> sends Hugging Face downloads to your scratch rather than to your
            50 GB home.
          </p>
          <p>
            <a className="btn" href={TOML_HREF} download="">
              {TOML_FILE} ↓
            </a>
          </p>

          <h2>
            <span>3</span>Start a JupyterLab session
          </h2>
          <p>Open the hub and sign in with your own CSCS account:</p>
          <pre>
            <code>
              <a href={HUB} target="_blank" rel="noopener noreferrer">
                {HUB}
              </a>
            </code>
          </pre>
          <ul>
            <li>
              <strong>Environment:</strong> <em>Custom Container</em>.
            </li>
            <li>
              <strong>Path to CE toml file:</strong> the path that <code>echo</code> printed in step 2.
            </li>
            <li>
              <strong>GPUs:</strong> 1.
            </li>
            <li>
              <strong>Runtime:</strong> up to 4h. The longest first runs below take well under that.
            </li>
            <li>
              <strong>Advanced settings:</strong> leave the reservation empty: the course&rsquo;s has ended.
            </li>
          </ul>
          <p>
            Before you press <strong>Launch session</strong>, check that the launch summary names the
            project you want to charge as its account. The page waits while the cluster schedules
            your job, then JupyterLab opens.
          </p>
          <figure className="guide__figure">
            <img src={SPAWN_SCREENSHOT} alt="The JupyterHub spawn page for Santis, filled in during the course" />
            <figcaption>
              The spawn page as filled in during the course. Your path and your account will differ.
            </figcaption>
          </figure>
          <p>
            Inside the session, a plain <code>pip install --user</code> in a cell installs a package
            into your home and keeps it for the next session; the notebooks install what they miss
            themselves. Put large files on <code>$SCRATCH</code>, as the exercises do.
          </p>

          <h2>
            <span>4</span>Get an exercise and run it
          </h2>
          <p>
            Open a terminal in JupyterLab (File → New → Terminal) and paste the line of the
            exercise. A folder exercise is unpacked in your home directory, a single notebook goes
            to <code>~/notebooks</code>; it appears in the file browser on the left (click its
            refresh button if not). Then double-click the notebook and run it from the top. Keep the
            files of a folder together: the notebook imports its helpers from its own folder.
          </p>
          <p>
            Three exercises have a <strong>self-paced version</strong>, changed from the one of the
            course so that it builds what it needs on your account. They unpack into a folder with
            the same name as the course one: if you kept the course folder, rename it first. The
            notebooks with an <em>Open in Colab</em> link were written for Google Colab and run
            there as well.
          </p>

          <h2 className="guide__part">Part I</h2>
          {PART1.map((ex) => (
            <ExerciseBlock key={ex.file} ex={ex} />
          ))}

          <h2 className="guide__part">Part II</h2>
          {PART2.map((ex) => (
            <ExerciseBlock key={ex.file} ex={ex} />
          ))}

          <h2>
            <span>5</span>When you are done
          </h2>
          <p>
            File → Hub Control Panel → <strong>Stop My Server</strong>. Until you do, the GPU stays
            allocated and charged to your project; the session ends by itself when its runtime is
            over. What the exercises built on scratch (the RLHF checkpoint, the models of Claude
            Code and GEPA, the Hugging Face cache) stays there for 30 days after its last use and
            is then deleted; the next first run builds it again.
          </p>
          <p>
            CSCS&rsquo;s own documentation is at{' '}
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
