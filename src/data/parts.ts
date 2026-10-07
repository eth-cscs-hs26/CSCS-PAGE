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
 * An exercise file hosted by THIS site, from `public/exercises/<folder>/`: a
 * notebook, its helper `.py`, or a self-contained HTML page. The folder is
 * `part<n>` for an exercise of that part and `setup` for the trial notebook.
 * The browser downloads a notebook rather than rendering it, see
 * lib/links.ts, and the participant drags it into JupyterLab on Santis.
 */
export const exercise = (folder: string, file: string): string =>
  `${import.meta.env.BASE_URL}exercises/${folder}/${file}`;

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
 * The Part I lecture decks, ten PDFs in `public/slides/part1/`: unchanged
 * copies of the decks as they are projected in the room, so every click is a
 * page of its own and the page numbers run ahead of the slide number in the
 * footer. Copied on 2026-10-05, at Carlos's request, from the built PDFs of
 * `cscs-hs26` at its commit 208ec44, except the first deck, copied again the same
 * day at dc20dbf with its two FAI frames (CLAUDE.md lists each file's source). One
 * constant per deck, so a session's "Slides" chip and its Materials entry carry
 * the same URL and cannot drift apart. The 15:15 session of Day 1 holds two
 * decks, OPRO and GEPA, so it has two chips and two entries; so does the 14:15
 * session of Day 2, whose second deck, "The KV cache and PagedAttention" (19
 * frames, 70 pages), was added on 2026-10-07 at Carlos's request, copied from the
 * built `kvcache-slides.pdf` of `cscs-hs26` (CLAUDE.md has its source). The decks
 * of Parts II and III are not on the site yet.
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
  inference: deck(1, 'inference-methods.pdf'),
  kvcache: deck(1, 'kv-cache-paged-attention.pdf'),
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
              { label: 'Slides', url: SLIDES.inference },
              { label: 'KV cache slides', url: SLIDES.kvcache },
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
      { label: 'Datasets & tokenisation', url: SLIDES.tokenisation, group: 'Lecture slides' },
      { label: 'Attention and transformers', url: SLIDES.transformers, group: 'Lecture slides' },
      { label: 'SFT and LoRA', url: SLIDES.sftLora, group: 'Lecture slides' },
      { label: 'Inference methods', url: SLIDES.inference, group: 'Lecture slides' },
      { label: 'Inference methods: the KV cache and PagedAttention', url: SLIDES.kvcache, group: 'Lecture slides' },
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
    theme: 'Policy gradients, RLHF, DPO and GRPO, then multimodal AI, AI for science and agents',
    dates: '20–21 October 2026',
    summary:
      'The first day is reinforcement learning as it is used to align language models, from the ' +
      'policy gradient to RLHF, DPO and GRPO. The second day widens the view: multimodal models, ' +
      'AI in the sciences, and agentic workflows.',
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
          },
          coffee('11:00'),
          { time: '11:15', title: 'Policy gradient methods', type: 'lecture' },
          { time: '12:15', title: 'Coding exercise', type: 'exercise' },
          lunch('13:00'),
          {
            time: '14:00',
            title: 'RLHF',
            type: 'lecture',
            topic: 'Reinforcement Learning for LLMs (continued)',
          },
          coffee('15:00'),
          { time: '15:15', title: 'DPO & GRPO', type: 'lecture' },
          { time: '16:15', title: 'Coding exercise', type: 'exercise' },
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
          },
          coffee('10:00'),
          { time: '10:15', title: 'AI for science', type: 'lecture' },
          { time: '11:15', title: 'Coding exercise', type: 'exercise' },
          lunch('12:00'),
          {
            time: '13:00',
            title: 'Agentic workflows & what is next',
            type: 'lecture',
            topic: 'Advanced Topics (continued)',
          },
          coffee('14:00'),
          // The syllabus grid leaves this slot blank. OPEN until Carlos says what fills it.
          { time: '14:15', title: '', type: 'tba' },
          { time: '15:15', title: 'Coding exercise', type: 'exercise' },
          endOfDay('16:30'),
        ],
      },
    ],
    resources: [
      ...beforeYouStart,
      { label: 'Policy gradient methods', url: SOON, group: 'Lecture slides' },
      { label: 'RLHF', url: SOON, group: 'Lecture slides' },
      { label: 'DPO & GRPO', url: SOON, group: 'Lecture slides' },
      { label: 'Multimodal AI', url: SOON, group: 'Lecture slides' },
      { label: 'AI for science', url: SOON, group: 'Lecture slides' },
      { label: 'Agentic workflows & what is next', url: SOON, group: 'Lecture slides' },
      { label: 'Day 3 morning exercise', url: SOON, group: 'Coding exercises' },
      { label: 'Day 3 afternoon exercise', url: SOON, group: 'Coding exercises' },
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
