# scripts/px-check — QA harness (Part 4)

Zero-hassle checks against the **installed Chrome** (no browser download). Node 18+ required.

## Setup (one-time)

```bash
cd scripts/px-check
npm install   # puppeteer-core + axe-core (no browser download)
```

## 1. Pixel captures (`4a`)

Captures the design source and the build at 375 / 768 / 1024 / 1440, full-page + the five section crops, with `prefers-reduced-motion: reduce` emulated so captures are stable (no mid-animation frames).

```bash
node capture.js                                  # prototype (default: file://purelane-homepage.html)
PX_URL=http://localhost:9292 node capture.js     # dev store / theme dev preview
# env knobs (useful for the dev server, which keeps a live-reload socket open):
PX_WAIT=load PX_SETTLE=1500 PX_URL=http://localhost:9292 node capture.js
```

> `PX_WAIT` overrides the page-load condition (`networkidle0` default). The Shopify dev server keeps a websocket open for hot reload, so `networkidle0` never fires — use `PX_WAIT=load PX_SETTLE=1500` against it. `PX_SETTLE` is the post-load settle delay in ms.

- Output: `prototype/` (or `target/` when `PX_URL` is set) — `<width>.png` + `sec-<width>-<section>.png` (hero, shop, combos, bundles, reviews)
- Report: `out/capture-report.json` (per-width page heights; any section reported `MISSING`)
- Compare: open `prototype/<w>.png` next to `target/<w>.png` (or overlay in an image tool) against the section specs in `specs/`. Screenshots are gitignored from store pushes (`.shopifyignore`).

## 2. axe audit (`4c`)

```bash
node axe.js
```

- Runs axe-core against WCAG 2a/2aa/21a/21aa/22aa rules at 1440px.
- Summary to console; full JSON in `out/axe-report.json`.
- Same `PX_URL` env override applies.

## 3. Contrast matrix (`4c`)

```bash
python contrast.py
```

- WCAG AA contrast ratios for the V2 palette's real text/background pairs (alpha blends included).

## 4. Performance reference (`4d`)

```bash
python -m http.server 8123 --bind 127.0.0.1 --directory ../..
npx -y lighthouse http://127.0.0.1:8123/purelane-homepage.html \
  --only-categories=performance,accessibility \
  --output=json --output-path=out/lh-prototype.json \
  --chrome-path="C:/Program Files/Google/Chrome/Application/chrome.exe"
```

The stock-Dawn baseline / final-build re-run uses the identical command in `notes/performance-baseline.md` against `localhost:9292`.

## 5. Live-build interactive pass (`4c`)

```bash
node live-check.js            # requires theme dev running at localhost:9292
```

- Verifies all five sections render, checks focus rings on tab stops, emulates `prefers-reduced-motion` and counts active animations, and collects console errors + failed requests.
- Output: `out/live-check.json` + `out/live-homepage.png` (full-page screenshot).

## 6. Live hero check (password-gated storefronts)

```bash
PX_PASSWORD=<storefront password> node live-hero.js
# optional: PX_STORE=https://your-store.myshopify.com
```

- Loads the published storefront (handles the password page), verifies the hero renders with its slides/dots/images, checks the `fetchpriority`/`loading` attributes on hero art, and captures full-page + hero-crop screenshots as evidence.
- Credentials come from env only — `PX_PASSWORD` is required and never committed.
- Output: `out/live-hero.json` + `out/live-hero-full.png` + `out/live-hero-section.png`.

## 7. Unpublished-theme preview check

```bash
PX_PASSWORD=<storefront password> node preview-check.js
# optional: PX_STORE=https://your-store.myshopify.com
```

- Opens the storefront's password page, then loads a specific preview theme URL (`?preview_theme_id=…`) and reports whether the hero slides/dots render on it — handy for eyeballing an unpublished theme before pushing.

> All scripts default the prototype URL to the repo-relative `purelane-homepage.html` when `PX_URL` isn't set, so the harness runs on any machine without editing paths.

## 8. Demo video (`IP protection`)

```bash
node record-demo.js        # requires preview/purelane-preview.html (see scripts/watermark.js)
```

- Records a ~15 s walkthrough of the **watermarked** read-only preview into `delivery/purelane-demo.webm` (WebM/VP8, ~12 fps).
- Uses CDP screencast frames (fast on the heavy SVG page) + `ffmpeg-static` (bundled, no system install).
- Env knobs: `DEMO_URL`, `DEMO_WIDTH`/`DEMO_HEIGHT`, `DEMO_DURATION`, `DEMO_OUT`, `DEMO_HIDE` (defaults to hiding the `.bub` bubble layer while recording — barely visible, much smoother).
