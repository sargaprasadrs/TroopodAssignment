# Part 4 — QA Report (prototype baseline)

Date: 2026-08-13 · Target: V2 light palette · Reference file: `purelane-homepage.html` (1716 lines)

**Status:** harness + prototype baseline **done**. Store-dependent checks (4b, live 4a/4d) and the Part 3 code review (4e) are **blocked on the dev store and Part 3 files** — they are wired up and ready to run.

---

## 4a — Pixel verification

**Harness:** `scripts/px-check/capture.js` — puppeteer-core driving the installed Chrome; widths **375 / 768 / 1024 / 1440**; full-page + the five section crops (`sec-<w>-hero|shop|combos|bundles|reviews`); `prefers-reduced-motion: reduce` emulated for deterministic frames.

**Prototype baseline captured** (24 PNGs in `scripts/px-check/prototype/`):

| Width | Page height (px) | Sections found |
|---|---|---|
| 375 | 11,575 | all 5 ✓ |
| 768 | 9,377 | all 5 ✓ |
| 1024 | 7,338 | all 5 ✓ |
| 1440 | 7,501 | all 5 ✓ |

**Compare step (pending dev store):** `PX_URL=http://localhost:9292 node capture.js` → `target/`, then diff per section against `specs/`. Re-run after every section change.

---

## 4b — Theme-editor stress test

⛔ **Blocked** — needs the dev store. Checklist is in `plan.md` Part 4b (add/remove/reorder each section; delete a metaobject mid-render; swap images; watch console + animations). Nothing to run until the store exists.

---

## 4c — Accessibility

### axe-core (WCAG 2a/2aa/21a/21aa/22aa, 1440px) — 2 violation types

| Impact | Rule | Count | Targets | Fix for production |
|---|---|---|---|---|
| serious | `color-contrast` | 2 | `.swipecue`, `.railnote` | paper-3 text @ 3.73:1 — darken these small labels (10.4–12px) to ≥4.5:1 |
| serious | `target-size` | 9 | nav rail anchor dots (8px) | WCAG 2.2 min target 24×24 — enlarge hit area (padding / `::before` extension) |

### Contrast matrix (`scripts/px-check/contrast.py`) — full table in console; key results

| Pair | Ratio | AA normal | Verdict |
|---|---|---|---|
| body `#241a3d` on ink | 14.5:1 | PASS | ✓ |
| headings `#17102b` on glass | 16.9:1 | PASS | ✓ |
| teal ink `#01423b` on white (ghost btn) | 11.4:1 | PASS | ✓ |
| on-teal `#f4fdf6` on teal (primary btn) | 5.7:1 | PASS | ✓ |
| `paper-3` (56%) text on ink | 3.73:1 | **FAIL** | fine print, kickers, `.cnt`, `.fine`, `.who` (9–10.4px) |
| accent `#b8701c` on ink / white | 3.48 / 3.91:1 | **FAIL** | prices, `.rate b`, tags, `.pr em` (9.5–27px) |
| green `#4f7d10` on ink | 4.38:1 | **FAIL** | pill labels 8.5px, `.combo .save` |
| stars `#7a9c1e` | 2.83:1 | **FAIL** | decorative icons — still < 3:1 icon bar |

**Production guidance (goes in build notes):** the design's micro-labels (8.5–11px) are below AA with the current token alphas. Fix by keeping decorative hairlines/icons at low-alpha, but text uses a darker tone (e.g. `paper-3` → `rgba(36,26,61,.68)` ≈ 4.9:1) or bump sizes ≥ 12px bold.

### Interactive browser pass (Chrome, DevTools)

- **Console:** zero errors / failed requests on load ✓
- **Keyboard:** first 15 tab stops all show visible focus rings; **hero stage dots are reachable and focused** ✓ (prototype has no skip link — production adds one)
- **Headings:** sequence is `h1` (hero) → `h5` (review cards) → … **`#reviews` has no section heading** (kicker is a span) — heading level 1→5 skip. Production: add a visually-hidden `h2` or promote the kicker.
- **Landmarks:** `header` / `nav` / `main` / `footer` present ✓
- **Reduced motion:** CSS override removes reveal blur/translate and stops animation — **23 active CSS animations** found without the override (water layers, marquee, carousel, drift) → performance evidence for rebuilding the scene system.

---

## 4d — Performance

**Prototype reference** (Lighthouse mobile, served locally — `out/lh-prototype.json`):

| Metric | Prototype | Target |
|---|---|---|
| Performance score | 74 | ≥ 90 |
| **LCP** | **4.3 s** | < 2.5 s |
| CLS | 0 | < 0.1 |
| TBT | 0 ms | — |
| Total bytes | 328 KiB | — |

LCP 4.3s on a 328 KiB page (huge inline SVG/base64 art + two full style blocks + fixed animated scene layer) is the strongest argument for the Part 1 rebuild decisions. **Baseline (stock Dawn) + final re-run: ⛔ blocked on dev store** — identical command documented in `notes/performance-baseline.md`.

---

## 4e — Code review (web-design-guidelines skill)

⛔ **Blocked on Part 3 files.** The `web-design-guidelines` skill is available and will run against `sections/` + `snippets/` as soon as the build lands.

---

## Exit criteria status

| Criterion | Status |
|---|---|
| Zero pixel drift at 4 widths | 🔧 harness ready + prototype baseline done — needs store target |
| Theme-editor stress test | ⛔ blocked (store) |
| axe clean / keyboard / reduced-motion | 🟡 prototype has 2 finding types — production must be zero |
| Performance meets thresholds | ⛔ blocked (store); prototype reference 74 / LCP 4.3s recorded |
| Five sections pass or consciously cut | ⏳ awaiting Part 3 |
