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
| `src/data/parts.ts` | **Source of truth for all content.** Three `Part` objects, each two `Day`s of sessions, plus a `resources` list. Link helpers `deck`, `exercise`, `guide`, placeholder `SOON`. Every schedule fact and its source is in its header comment. |
| `src/types.ts` | The `Part`, `Day`, `Session`, `Resource` shapes. |
| `src/pages/SetupPage.tsx` | The participant guide to the CSCS JupyterHub for Santis, transcribed on 2026-09-26 from Luca's `explanation.md` (2026-09-25) with its wording kept. Spawn values in constants at the top. Ends with the trial notebook. |
| `src/pages/HomePage.tsx`, `PartPage.tsx`, `CalendarPage.tsx` | Overview with the three part cards, one part's agenda and materials, the month grid with `.ics` and Google export. |
| `src/components/` | `ScheduleTable` (one day, with the half-day topic rows), `PartCard`, `SchedulePeek` (hover preview), `CalendarStrip`, `Header`, `Footer`, `EthLogo`, `SessionTypeChip`. |
| `src/data/calendar.ts`, `src/lib/ics.ts`, `src/lib/date.ts` | Calendar events derived from the parts (only parts with dates), the iCalendar export, ISO date helpers. Do not hand-maintain events. |
| `src/lib/links.ts` | `downloadKind`: which links get the `download` attribute (same-origin PDF, notebook, zip). |
| `src/index.css` | All styling, plain CSS, the ETH flat style of the BMAI site plus the `.srow--topic` and `.guide` blocks. |
| `public/exercises/setup/santis-trial.ipynb` | The trial notebook: copy of Luca's `example.ipynb` (2026-09-25), a CNN on FashionMNIST that probes the container, installs what is missing, stores data on scratch and trains on the GPU. Its intro cell points at the Setup page. |
| `public/guides/img/jupyter-spawn.png` | Carlos's screenshot of the spawn page, 2026-09-25, shown on the Setup page. |
| `public/slides/part<n>/`, `public/exercises/part<n>/` | Where slides and exercise files go once they exist. Empty so far: every material link is `SOON`. |
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
- **OPEN:** the Part I exercises have working titles in the official Google Sheet ("CX PyTorch
  with SLURM and SLT", "CX Claude Code and GEPA", "CX LLMs in a cluster", "CX SFT and LoRA")
  that are not on the page yet; the grid says "Coding exercise" and the page follows the grid.
- **DRAFT:** the Setup page, awaiting Carlos's review and a walk-through on the live hub. The
  TOML it names sits in one course account's `$SCRATCH`, where files unused for 30 days are
  deleted, and course accounts close on 22 October 2026. Check it before each course day.
- No material is uploaded yet. The Setup page and the trial notebook are the only real links.

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
