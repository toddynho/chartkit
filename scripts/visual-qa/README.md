# Visual QA

A headless sweep of the ChartKit site. It screenshots the docs chart pages, runs cheap layout checks, and can ask a vision model to triage what it sees. The model only finds problems. It does not gate CI. A bug it keeps finding should become a deterministic test, the way the progress-ring rail fit did.

The soft visual scoreboard in `catalog/visual` rasterizes frozen specs. This sweep screenshots the running site instead. Playwright is the same browser the rail-fit test uses.

Primary runner is a headless Linux box. The command builds `apps/web` and serves `astro preview` itself.

## Quickstart

From the repo root, after `npm ci`:

```bash
npx playwright install --with-deps chromium
npm run qa:visual -- --no-model
```

GitHub's `ubuntu-latest` is Ubuntu 26.04. Playwright 1.55 has no browser build for it, and `--with-deps` exits with `does not support chromium on ubuntu26.04-x64`. CI installs the Ubuntu 24 build instead, which lands in the same cache path:

```bash
PLAYWRIGHT_HOST_PLATFORM_OVERRIDE=ubuntu24.04-x64 npx playwright install chromium
```

That builds the site, previews it, and writes `visual-qa-report/`. The folder is gitignored. `index.html` and `report.json` sit next to `shots/`. Image paths are relative, so zip the folder to share it.

A model pass uses Crusoe Managed Inference unless you point it somewhere else. The key stays in the environment.

```bash
export QA_VISION_API_KEY=...   # or CRUSOE_API_KEY
npm run qa:visual -- --list-models
npm run qa:visual
```

`QA_VISION_MODEL` and `--model` are optional. Ids are case-sensitive and have to match `GET /v1/models`. When the model is unset and the base URL is Crusoe, the sweep prefers `nvidia/NVIDIA-Nemotron-3.5-Super-VL` if that id is in the list, then `Qwen/Qwen3.8-27B`, then the first multimodal model. `--model` overrides that so you can compare models:

```bash
npm run qa:visual -- --model Qwen/Qwen3.8-27B
npm run qa:visual -- --model google/gemma-4-31b-it
```

`--list-models` prints models whose `architecture.modality` is `multimodal` or whose tags include image-text-to-text, and the id it would pick.

Reasoning models (Nemotron VL, Qwen3.8, GLM, DeepSeek, Kimi) spend output tokens thinking before the JSON. The request uses `max_tokens` 4096 so the answer is not cut off. Gemma 4 answers directly and still fits. Raise it with `--max-tokens` if a shot reports `finish_reason=length`.

An already-running server skips the build:

```bash
npm run qa:visual -- --url http://127.0.0.1:4321 --no-model
npm run qa:visual -- --url http://127.0.0.1:4321 --only progress-ring,rose
```

## What it opens

- Every docs chart page from `chartPageTypes` (`/docs/charts/<type>`), and each demo in the right-rail switcher.
- Rail widths 280, the default 380, and 720, on a 1440×900 desktop. `380` leaves the stored width unset.
- The same pages at 390×844. The rail stacks there, so the width is not varied. The viewport shot scrolls the chart into view.
- A crop of `#response-chart` (the playground crop is `.play-card__chart`).
- The homepage, `/compare`, and the playground: the default example, plus line, bar, donut, and progress-ring.

Screenshots are the viewport, not the whole scrolled article. The crop is the chart pane.

Deterministic checks run in the page and are stored with the shot: a scrollbar inside a chart pane (`scrollHeight > clientHeight` on an overflow auto/scroll pane), an SVG box past its container, overlapping text boxes, an empty chart, and horizontal page overflow.

## Flags

| Flag | |
|---|---|
| `--url <site>` | Use a server that is already up. |
| `--only <types>` | Comma-separated chart types, for example `progress-ring,rose`. |
| `--widths <list>` | Comma-separated rail widths. `default` is 380. |
| `--no-model` | Capture and checks only. |
| `--list-models` | Print multimodal models and exit. |
| `--base-url <url>` | Vision API. Overrides `QA_VISION_BASE_URL`. |
| `--model <id>` | Overrides `QA_VISION_MODEL`. |
| `--max-tokens <n>` | Default 4096. |
| `--headed` | Show the browser. Default is headless. |
| `--concurrency <n>` | Pages and model requests. Default 3. |
| `--out <dir>` | Default `visual-qa-report`. |

Environment: `QA_VISION_BASE_URL` (default `https://api.inference.crusoecloud.com/v1`), `QA_VISION_API_KEY` (falls back to `CRUSOE_API_KEY`), `QA_VISION_MODEL`.

## Time

On a headless Linux box, after `npm ci` and the Playwright install, a full `--no-model` sweep was about 2 minutes: about 30 seconds to build the site and about 80 seconds to capture. That run took 486 shots and wrote 968 images (a viewport shot plus a chart crop). The command prints the exact counts. A cold build on a slower machine takes longer than 30 seconds.

Nemotron-3.5-Super-VL accepts one image per request, so a review sends the page viewport and leaves the chart crop on disk. Other models get the page and the crop. A full Nemotron pass is about 10 seconds per shot, about 80 minutes for 486 shots. Use `--only` for a subset.

To review a report that is already on disk, without recapturing:

```bash
node scripts/visual-qa/review-existing.mjs --only progress-ring,rose
node scripts/visual-qa/review-existing.mjs --model Qwen/Qwen3.8-27B --only /docs/charts/donut
```

`--only` there is chart types or page paths. `--out`, `--base-url`, `--max-tokens`, and `--concurrency` (default 3) match the sweep. Results merge back onto the same shots by page, demo, viewport, and rail width, and the HTML and JSON are rewritten.

## Mac and Ollama

On a Mac the same commands work. `npx playwright install --with-deps chromium` still installs Chromium; the system-deps step is a no-op outside Linux. To hit a dev server you already started (`npm run dev`, port 4321) instead of a preview build:

```bash
npm run qa:visual -- --url http://localhost:4321 --list-models
```

Ollama's OpenAI-compatible server does not tag modality, so set the model:

```bash
QA_VISION_BASE_URL=http://localhost:11434/v1 QA_VISION_MODEL=qwen2.5vl npm run qa:visual -- --url http://localhost:4321
```

No key is sent to localhost. Do not commit a key.
