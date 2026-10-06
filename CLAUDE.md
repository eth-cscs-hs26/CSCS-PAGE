# `CSCS-PAGE` — the course website of AI Tutorials: Machine Learning and LLM Development

Public repository `github.com/eth-cscs-hs26/CSCS-PAGE`, published by GitHub Pages at
https://eth-cscs-hs26.github.io/CSCS-PAGE/. Created by Luca on 2026-09-26 at Carlos's
request of 2026-09-25, from the sibling BMAI site (`eth-bmai-hs26/BMAI-PAGE`, its state of
2026-09-23). The course itself, its people and its private material live in
`github.com/eth-cscs-hs26/cscs-hs26` (checked out next to this folder as `cscs-hs26/`); its
`CLAUDE.md` on `main` is the wider context. This file covers only the website.

**This repository is public.** Nothing goes in it that may not be read by anyone: no
credentials, no participant names, no internal e-mails. The Santis spawn values (container
TOML path, account name) are on the Setup page by Luca's decision of 2026-09-26.

## Files

| File | Role |
|---|---|
| `src/data/parts.ts` | **Source of truth for all content.** Three `Part` objects, each two `Day`s of sessions, plus a `resources` list. Link helpers `deck`, `exercise`, `guide`, `viz`, placeholder `SOON`. Every schedule fact and its source is in its header comment. |
| `src/types.ts` | The `Part`, `Day`, `Session`, `Resource` shapes. |
| `src/pages/SetupPage.tsx` | The participant guide to the CSCS JupyterHub for Santis, transcribed on 2026-09-26 from Luca's `explanation.md` (2026-09-25) with its wording kept. Spawn values in constants at the top. Step 4, rewritten 2026-10-02 (DRAFT, uncommitted), gives two ways to get an exercise: the zip from the Materials list, dragged into JupyterLab and unpacked there with `unzip` (present in the container, checked 2026-10-02), or the copy line from the cluster folder `/capstor/scratch/cscs/course_00776/exercises/<exercise>/` in a JupyterLab terminal. Since 2026-10-06 the notice after step 4 tells PyTorch with SLURM participants to run `source cluster-env.sh` in a JupyterLab terminal before `sbatch` (the workaround in the exercise-zip row below). Ends with the trial notebook. **2026-10-05 (DRAFT):** step 2 tells participants to set the reservation `ai-training` under Advanced settings on 6 and 7 October (`RESERVATION`, a constant at the top): CSCS's reservation for Part I, one GPU per participant, which Carlos keeps for these notebook sessions while batch jobs leave it out. The field's label inside that section was not seen (the hub needs a CSCS login, and CSCS's documentation does not describe it), so the step points at the launch summary's Reservation row, which the screenshot shows. Step 1 and 2 no longer say "five digits": two of the project's accounts are `course_` plus eight letters and digits. |
| `src/pages/HomePage.tsx`, `PartPage.tsx`, `CalendarPage.tsx` | Overview with the three part cards, one part's agenda and materials, the month grid with `.ics` and Google export. |
| `src/components/` | `ScheduleTable` (one day, with the half-day topic rows), `PartCard`, `SchedulePeek` (hover preview), `CalendarStrip`, `Header`, `Footer`, `EthLogo`, `SessionTypeChip`. |
| `src/data/calendar.ts`, `src/lib/ics.ts`, `src/lib/date.ts` | Calendar events derived from the parts (only parts with dates), the iCalendar export, ISO date helpers. Do not hand-maintain events. |
| `src/lib/links.ts` | `downloadKind`: which links get the `download` attribute (same-origin PDF, notebook, zip). |
| `src/index.css` | All styling, plain CSS, the ETH flat style of the BMAI site plus the `.srow--topic` and `.guide` blocks. |
| `public/exercises/setup/santis-trial.ipynb` | The trial notebook: copy of Luca's `example.ipynb` (2026-09-25), a CNN on FashionMNIST that probes the container, installs what is missing, stores data on scratch and trains on the GPU. Its intro cell points at the Setup page. |
| `public/guides/img/jupyter-spawn.png` | Carlos's screenshot of the spawn page, 2026-09-25, shown on the Setup page. |
| `public/viz/part1/wuggish/` | **DRAFT.** The Wuggish attention game of the Day 2 lecture "Attention and transformers": `index.html`, `css/`, `js/` and `data/`, copied on 2026-10-01 from `cscs-hs26/wuggish-game/` (imported from CAS BMAI weekend 2), whose `CLAUDE.md` holds the provenance and the copy command. A browser-only page: it makes no network request, stores only the light or dark theme, and declares `noindex`. Linked as `viz(1, 'wuggish')` plus `?dev=0`, which hides the fast-forward button that skips to the reveal. |
| `public/viz/part1/square-root-show/` | **DRAFT.** "Square One", the quiz show of the Day 1 lecture "Intro to SLT and PyTorch": guess the side of a square of 41 285 km2, then the golden number w = 1 + 1/w, then live code the five-line program that finds the root. `index.html`, `css/`, `js/` and `vendor/` (fonts, SIL OFL 1.1, with their licences), copied on 2026-10-05 from `cscs-hs26/square-root-show/` (imported the same day from Carlos's Foundations of AI repository, where it opened that day), byte for byte as FAI's own public site serves it; the tests, `README.md` and the working notes stay in `cscs-hs26`. A browser-only page: it makes no network request and keeps only its theme and the editor's text and size in `localStorage`. Linked as `viz(1, 'square-root-show')`: a "Square One game" chip on the Day 1 10:00 row, a "Visualizations" entry in Part I's Materials, and, since the same day, the QR code and address on the frame "Try it: Square One" of the 10:00 deck (`SQUARE_ONE` in `parts.ts`; change them together). |
| `public/exercises/part1/<exercise>.zip` | **DRAFT.** Live since they were pushed (Luca's Day 2 zips; Amine's Day 1 zip, commit `ba8db15`, 2026-10-05). **Day 1, 12:15:** `01_pytorch_slurm.zip` (student notebook, `train.py`, `learner.py`, `submit.sbatch`, `cluster-env.sh`, `requirements.txt` and a participant `README.md`); its first six files are identical to `cscs-hs26/part1-day1/01_pytorch_slurm/` at `e768533` (2026-10-06), the README is a participant version of that folder's. **Since 2026-10-06 (Ghali, tested on Santis as `course_00770`, jobs 909069 and 909295 COMPLETED on a GH200):** `sbatch` works from the JupyterLab terminal. Inside the container Slurm's plugins lack `libjson-c.so.5`, and `sbatch` copies the container's environment into the job, which then starts in the container again. `cluster-env.sh`, sourced once per terminal, wraps `sbatch`, `squeue`, `scontrol`, `sacct` and `scancel` in `env -i` with `LD_LIBRARY_PATH` pointing at a copy of the library; `submit.sbatch` no longer has `#SBATCH --uenv`/`--view` (the uenv plugin rejects them inside the container) and passes `--uenv=<shared>/pytorch/store.squashfs --view=default` to `srun`. Both read `/capstor/scratch/cscs/course_00770/shared/` (`libjson-c.so.5`, and `pytorch/` = `store.squashfs` plus `meta/` of `pytorch/v2.9.1:v2`), made world-readable on 2026-10-06: keep it, scratch purges files unused for 30 days. **OPEN:** not yet tested from a second account; the real fix is for CSCS to add the library to the hub image. **Day 1, 16:15:** `cx2_claude_code_gepa.zip` (student notebook and `cx2_setup.py` only, no solution or `.sh` scripts; from `cscs-hs26` branch `cx2-claude-code-gepa` at `734d796`, 2026-10-06, with the saved results of that day's live run on Santis), a chip on the 16:15 row and its entry under "Coding exercises". **Day 2:** the two Day 2 exercises, one zip each, holding the exercise folder named like its folder on the cluster: `sft_lora.zip` (student notebook and `cx_SFT_LoRA_setup.py`, from `cscs-hs26` branch `cx-sft` at `a1ebf89`) and `llm_from_scratch.zip` (student notebook and `util.py`, from `cscs-hs26/cx-llms/`; the data folder is not in it, the helper downloads 230 MB on first run). One link per exercise by Luca's decision of 2026-10-02 ("I don't want them to press for each file"): a chip on the Day 2 11:15 and 15:15 rows and one entry each under "Coding exercises". The same two folders are staged on the cluster at `/capstor/scratch/cscs/course_00776/exercises/`, the second way on the Setup page's step 4. Rebuild a zip with Python's `zipfile` from the source files, folder as the top-level entry. A local commit holding all three staged exercises as loose files is kept on the branch `website-three-exercises`. |
| `public/slides/part1/` | **DRAFT.** The nine lecture decks of Part I as PDFs: unchanged copies of the decks as projected in the room (every click is a page of its own, so the page numbers run ahead of the slide numbers in the footer), copied on 2026-10-05 at Carlos's request from the built PDFs of `cscs-hs26` at its commit `208ec44`; the first deck was copied again the same day at `dc20dbf`, once it had gained two frames from Carlos's FAI deck (the Popper cold intro and a QR code to Square One). Published name, then its source in that repository and its pages: `intro-slt-pytorch.pdf` (`part1-day1/slt-slides/slt-slides.pdf`, 125), `pytorch-slurm-clusters.pdf` (`part1-day1/pytorch-slurm-slides/pytorch-slurm-slides.pdf`, 124; copied again on 2026-10-05 at `aa71943`, after the deck was re-synced to the 12:15 exercise's weight-decay pair at width 128), `claude-code-1.pdf` (`part1-day1/claude-code-slides/cc1-slides.pdf`, 185), `prompt-optimization-opro.pdf` (`part1-day1/claude-code-slides/cc2-slides.pdf`, 42), `prompt-optimization-gepa.pdf` (`part1-day1/gepa-slides/gepa-slides.pdf`, 84), `datasets-tokenisation.pdf`, `attention-transformers.pdf` and `sft-lora.pdf` (`part1-day2/day2-slides/{tokenisation,transformer,sft-lora}-slides.pdf`, 65, 183 and 90) and `inference-methods.pdf` (`part1-day2/inference-slides/inference-slides.pdf`, 177). Each is a "Slides" chip on its lecture row and an entry under "Lecture slides" in Part I's Materials, both built from one constant, `SLIDES`, in `parts.ts`; the 15:15 session holds two decks, so it carries an "OPRO slides" and a "GEPA slides" chip. The decks are drafts in the course repository: after one is rebuilt, its copy here is stale until it is copied again (`git -C ../cscs-hs26 show HEAD:<source path> > public/slides/part1/<file>`). `public/slides/part2/` and `part3/` are made when those decks exist. |
| `.github/workflows/deploy.yml` | Builds on every push to `main` and publishes `dist/` to GitHub Pages. |

## Content state

- **Title corrected 2026-09-30.** The site had shown "CSCS Workshop 2026" everywhere since
  its creation; that was never the course's name. The official title, SETTLED in
  `cscs-hs26/form-draft.md` for CSCS's own webpage and intranet publication, is "AI
  Tutorials: Machine Learning and LLM Development"; it now appears verbatim in the page
  title, meta description, header, hero, footer, README and this file. The short form
  already used in Carlos's own slide decks, "CSCS AI Tutorials", is kept for the
  per-event calendar titles and the `.ics` export (`PRODID`, `X-WR-CALNAME`, download
  filename), where the full title would be unwieldy.
- **Schedule.** Transcribed on 2026-09-26 from the syllabus grid Carlos sent as an image
  (`CSCS/Script.png` in Luca's workspace): three parts of two consecutive days, first day
  10:00 to 17:30, second 09:00 to 16:30. Part I is 6 and 7 October 2026, Part II 20 and 21
  October 2026. Coding-exercise rows carry the grid's plain "Coding exercise".
- **OPEN:** Part III has no dates ("dates TBD" on the grid). It is shown with "Dates to be
  announced" and has no calendar event. When dated, set `dateISO` on its two days in
  `parts.ts` and add its month to `calendarMonths` in `calendar.ts`.
- **OPEN:** the Part II Day 4 slot at 14:15 is blank on the grid (a green cell with no text).
  Rendered as a quiet "to be announced" row until Carlos says what fills it.
- **OPEN:** no rooms or venue. `Day.room` is empty everywhere; `partRoom()` renders it once set.
- **SETTLED by Luca, 2026-10-02 (uncommitted):** the Part I exercise rows are named "CX Pytorch
  with SLURM", "CX Claude Code and GEPA", "CX LLM from scratch" and "CX SFT and LoRA", his
  wording, in place of the grid's plain "Coding exercise" (the sheet's working titles were "CX
  PyTorch with SLURM and SLT" and "CX LLMs in a cluster"); the Materials entries carry the same
  names. Parts II and III still follow the grid.
- **DRAFT:** the Setup page, awaiting Carlos's review and a walk-through on the live hub. The
  TOML it names sits in `course_00776`'s `$SCRATCH`, where files unused for 30 days are
  deleted, and course accounts close on 22 October 2026. Scratch is group-only by default;
  the path was made world-readable on 2026-09-30 after a participant could not load it
  (see the top-level `CLAUDE.md`). Before each course day, check that the file exists and
  that the three path components still show `--x`/`--x`/`r--` for others.
- **Square One, since 2026-10-05 (DRAFT).** Carlos: "Redo the slides to include links to the square one and the
  popper cold intro from FAI" (he chose the 10:00 deck and the website). The quiz show is served from
  `public/viz/part1/square-root-show/` (table above) and the first deck, "Intro to SLT and PyTorch", was
  redone with a QR frame for it and the Popper frame. Whether the room plays it in class is **OPEN**.
- **Part I slides, since 2026-10-05 (DRAFT).** Carlos: "put the slides on the website ... in the resources
  section as well as chips in the schedules. Do this for part I only at the moment." The nine decks of the
  table above are on the site, a chip on each lecture row and an entry under "Lecture slides" in Part I's
  Materials. Parts II and III stay `SOON`. **OPEN:** the Day 1 afternoon exercise briefing deck
  (`cscs-hs26/part1-day1/claude-code-slides/cc-exercise-slides.pdf`) is not here, since it goes with its
  exercise, which is not on the site yet.
- The other real links are the Setup page, the trial notebook, the two
  Day 2 exercises in the table above (DRAFT, uncommitted) and, since 2026-10-01, the Wuggish game (**DRAFT**, Carlos asked for it that day): a chip on the
  Part I, Day 2, 10:15 row "Attention and transformers" and a "Visualizations" entry in Part I's
  Materials list. The 10:15 deck points to it with a QR frame. Whether the room plays it in class
  is **OPEN** (details in `cscs-hs26/wuggish-game/CLAUDE.md`).

## Deployment

Push to `main` deploys. The one-time setting **Settings → Pages → Source: GitHub Actions** was
set by Luca on 2026-09-26, and the first deploy succeeded the same day. Build locally with
`npm run build` before pushing; it is the only correctness gate.

## CLAUDE.md maintenance protocol

**1. Keep this file current.** After any *major* change, update the CLAUDE.md of every
folder it touches, in the same session, before reporting the task done. A change is
major if it alters any of:
- dates, deadlines, or the block/day structure of the course;
- syllabus content, the topic list, or which exercises run on which platform;
- who is involved (trainers, TAs, admins, CSCS contacts) or what their role is;
- money, participant numbers, venue, or anything CSCS has to book;
- the file layout of the folder, or how a generated artefact is regenerated;
- a decision that supersedes something already written here — strike the superseded
  statement, never leave it standing silently.

Do not log routine edits (typos, wording passes). Prefer rewriting an existing line over
appending a new one: this file describes the present state, it is not a changelog.

**2. Every working subfolder gets one.** Any subfolder that holds real work — not
`.git`, not caches, not generated output — must carry its own `CLAUDE.md` with this
protocol reproduced verbatim between the BEGIN/END markers, plus whatever is specific to
that folder. Create it in the same step as the folder. If you edit the protocol,
propagate the edit to every CLAUDE.md in the tree.

**3. Status honesty.** Anything unresolved carries a marker: **SETTLED** (agreed with
the other party) · **DRAFT** (written, awaiting Carlos's review) · **OPEN** (needs a
decision or external input). Never promote a marker without a real confirmation to point
at, and say who confirmed it and when.
