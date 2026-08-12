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
```

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
