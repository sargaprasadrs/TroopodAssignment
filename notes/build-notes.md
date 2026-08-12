# Build notes — Purelane Shopify rebuild

Deliverable for the Troopod assignment. Covers: what's wrong with the original file, what we changed and why, current state, and what we'd do with more time. Evidence lives in `specs/` (the spec), `notes/qa-report.md` (QA), and `scripts/px-check/` (harness).

---

## 1. What I'd flag about the original file (`purelane-homepage.html`)

1. **Two style blocks — the dark theme is dead code.** The file ships a dark "V1" palette that is fully overridden by a "VERSION 2 — brand colours (light)" block. Anyone building from the top of the file would reproduce the wrong theme. We target V2 (pale mint ground, teal ink, `#b8701c` accent) — see `specs/00-tokens.md`.
2. **Everything is hardcoded.** Products, prices (₹200/₹299…), ratings ("★ 4.8 · 237 reviews"), review cards, and combo savings are literal strings in the markup. Not one byte comes from a platform.
3. **Dead UI.** "Add to cart" buttons do nothing; a signup `<form onsubmit="return false">`; `<a>` elements styled as buttons.
4. **SVG/base64 art instead of product images** — the whole catalogue is inline bottle illustrations (~328 KiB page, LCP 4.3 s measured in Part 4). No lazy loading, no real hero image.
5. **Scroll-jacked fixed background.** A full-viewport "scene" layer crossfades 4 gradients by scroll position with mousemove parallax and animated water layers (23 active CSS animations without reduced-motion). This is the single biggest CWV liability.
6. **Autoplay without accessibility.** Marquee and hero carousel pause on hover but not on focus; no reduced-motion fallback for several effects.
7. **Accessibility gaps (measured, Part 4):**
   - `paper-3` text @ 3.73:1, accent @ 3.48:1, star colour @ 2.83:1 — all fail WCAG AA at the design's 8.5–11 px micro-label sizes
   - Nav rail dots are 8 px targets (WCAG 2.2 wants 24×24)
   - `#reviews` has **no heading** (document order jumps h1 → h5)
   - No skip link; dot controls announce state by class only

## 2. What we changed in the code and why

**Data (the "real Shopify data" bar)**
- Products, prices, compare-at and availability come from Liquid objects; `% off` and "You save ₹" are **computed**, never hardcoded (decision 4 in `notes/decisions.md`).
- Combos & bundles are **metaobjects** (`combo` + `combo_item`, `bundle`), reviews are `review` metaobjects — marketing edits them in Admin (`data/` has the definitions; `data/seed-products.csv` covers the required sold-out / no-image / long-title edge cases).
- Badges come from product tags (`bestseller`/`toprated`/`new`) with a `custom.badge` metafield override per product.

**Build (verified in the landed sections)**
- Five schema-first sections (`sections/purelane-*.liquid`) — every heading, CTA, badge, colour, spacing and animation toggle is a schema setting with prototype defaults. Eight shared snippets (cards, panel head, icons, product art) implement the "reusable" bar.
- Add to Cart uses Dawn's native `product-form` with quantity + sold-out disabled state — no dead buttons.
- Hero slides: image-or-product picker with **computed price/compare-at fallback**, auto-computed "% off" when the offer line is blank, `aria-live` region announcing the active slide, `aria-current` dots.
- Animations rebuilt per the spec: reveal unobserve, autoplay pauses on hover/focus/off-screen, everything gated by `prefers-reduced-motion`; scene crossfade replaced by a static tint (see `specs/00-tokens.md`).
- Long-title clamp, art-fallback-for-no-image, and sold-out states handled in the shared product card.

**Current state (honest):** Part 3 has landed `sections/` + `snippets/` (13 files). **Still pending:** `assets/purelane.css` + `purelane.js` (referenced by `purelane-assets.liquid` but not yet in the repo), homepage `templates/index.json`, layout wiring, and dev-store validation (4b/4d in `notes/qa-report.md`). The repo's committed history covers Parts 1, 2, 4 and 5; the Part 3 commit follows when the build finishes.

## 3. What I'd do with more time

- Finish and QA the asset layer + homepage template, then run the theme-editor stress test (4b) and the Lighthouse re-check (4d) on the dev store — the harness is ready (`scripts/px-check/`, `notes/performance-baseline.md`).
- Integrate a real reviews app so aggregates come from the platform instead of section settings.
- Wire the three queued a11y fixes from Part 4 into the build (darken `paper-3`/`accent` for small text, enlarge nav-dot hit areas, add a `#reviews` heading).
- Editor presets polish + `locales`/`config` for a fully stock-Dawn-conformant theme.

## 4. Cut log

Nothing cut yet — all five sections are built per the plan's cut strategy (reviews/bundles were the fallback cuts; not needed).
