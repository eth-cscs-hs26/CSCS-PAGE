# AI Tutorials: Machine Learning and LLM Development · course website

Course website for **AI Tutorials: Machine Learning and LLM Development** (ETH Zürich and
CSCS, autumn 2026), live at
https://eth-cscs-hs26.github.io/CSCS-PAGE/.

A static, Moodle-style site: the three parts of the course, each with the agenda of its two
days and its materials, a Setup page that takes a participant from their CSCS account to a
running JupyterLab session on Santis, a trial notebook that proves the session works, and a
calendar with `.ics` and Google Calendar export.

Built with Vite, React and TypeScript, from the same recipe as the sibling BMAI and FDD sites.

## Commands

```bash
npm install      # install dependencies
npm run dev      # dev server at http://localhost:5173
npm run build    # tsc -b (type-check) + vite build into dist/
npm run preview  # serve the production build locally
```

`npm run build` is the correctness gate: it type-checks with `tsc -b` before bundling. There is
no test suite.

## Editing content

All course content lives in [`src/data/parts.ts`](src/data/parts.ts) as a single typed
`Part[]` array (shape in `src/types.ts`). Pages and components render from that array, so
updating an agenda, adding a room, or linking a slide deck means editing only that file.

Each part has two `days`, each day a list of `sessions` with a `time`, a `title` and a `type`
(`lecture`, `exercise`, `break`, `tba`). A session's optional `topic` is the half-day heading
of the syllabus and renders above it. A session with an empty title and type `tba` renders as
a quiet placeholder row.

Material links use the helpers at the top of the file:

```ts
deck(1, 'intro-slt-pytorch.pdf')            // PDF in public/slides/part1/
exercise('part1', 'cx_pytorch_slurm.ipynb') // notebook in public/exercises/part1/
SOON                                         // not uploaded yet, renders greyed out as "Soon"
```

## Adding a file for participants

Everything participants download is served by this site, because the course repository is
private. Drop the file into `public/` and link it:

- slides go to `public/slides/part<n>/`, linked with `deck(n, file)`;
- notebooks and their helper `.py` files go to `public/exercises/part<n>/`, linked with
  `exercise('part<n>', file)`. A notebook link downloads the file; the participant drags it
  into JupyterLab on Santis as the Setup page describes.

Links are relative to the site root, so they work under the GitHub Pages subpath.

## The Setup page

`src/pages/SetupPage.tsx` is the participant guide to the CSCS JupyterHub for Santis: account,
the spawn form, what the container provides, putting files in, running, stopping. The spawn
values (container TOML path, GPUs, runtime, account) are in constants at the top of that file;
the screenshot is `public/guides/img/jupyter-spawn.png`. The trial notebook it ends with is
`public/exercises/setup/santis-trial.ipynb`.

## Deployment

Pushing to `main` runs `.github/workflows/deploy.yml`, which builds and publishes `dist/` to
GitHub Pages. One-time setup in the repository: **Settings → Pages → Build and deployment →
Source: GitHub Actions**. Hash routing and `base: './'` in `vite.config.ts` are what make deep
links and assets work under the Pages subpath, so keep both if you touch routing or the build
config.
