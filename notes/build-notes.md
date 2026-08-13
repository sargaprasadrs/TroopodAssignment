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

**Current state (honest):** Parts 1–5 landed (5 sections + 8 snippets + `assets/purelane.css`/`purelane.js` + `templates/index.json`), deployed and verified live on `purelane-dev-rzcwvlkv`. A post-review hardening pass then applied:

- Hero slide price/compare-at **defaults are now empty** so the "empty = product price" fallback actually works (previously the pre-filled ₹200/₹299 always won).
- Reviews marquee `pause_on_hover` setting is now wired to the CSS pause (was a no-op).
- `review` metaobject rating is `number_integer` — no more 4.5 → 5-star rounding.
- Multi-variant products show a **"Choose options"** CTA to the product page instead of silently adding the default variant.
- **A11y fixes applied:** `#reviews` gained an sr-only `h2` (fixes the h1→h5 jump), hero dots have 24×24 hit areas (WCAG 2.2), and the failing contrast pairs were re-tuned — `paper-3` alpha 0.56 → 0.68 (3.73:1 → 5.4:1), new `accent-deep #8f5410` (≈5.5:1) for small accent text, `green-deep #3f640c` for pill text, stars darkened to `#6e8c1a` (≥3:1 icons). Verified with `scripts/px-check/contrast.py`.
- Reveal-on-scroll is gated on our own `pl-js` class instead of Dawn's `html.js` — if `purelane.js` ever fails to load, content stays visible rather than stuck hidden.
- `% off` rows now round instead of truncate (41.6% → 42%), and zero-item combos/bundles hide their count rows.
- QA scripts no longer embed store credentials or machine-specific paths: passwords come from `PX_PASSWORD` (env), and the default prototype URL is resolved relative to the repo.
- **Hero CTA buttons now default to real anchors** (`#shop` / `#bundles`) — they previously rendered `href=""` dead buttons when the section was added fresh. The `url` setting type wouldn't accept an anchor default, so the two CTA links are now `text` like the combo/bundle fallback links.
- **Prototype fonts loaded:** Outfit (display) + Inter (body) from Google Fonts with preconnect + `display=swap`, exactly as the design file does — the build previously fell back to Dawn's default font, so the distinctive display type was missing.

**Known Dawn issue (not in this repo):** the stock Dawn header cart link has no accessible name (axe `link-name` violation). One-line fix in Dawn's `snippets/header.liquid` (`aria-label="Cart"` on the cart anchor) — the repo only ships custom files, so patch Dawn at deploy time if you want it gone.

## 3. What I'd do with more time

- Run the **theme-editor stress test (4b)** — the one QA item that needs a human in the editor (`plan.md` Part 4b has the checklist; the editor link is in `notes/qa-report.md`).
- Run the **final Lighthouse pass (4d)** on the live storefront and record the stock-Dawn → final delta (`notes/performance-baseline.md` has the identical command).
- Integrate a real reviews app so aggregates come from the platform instead of section settings.
- Editor presets polish + `locales`/`config` for a fully stock-Dawn-conformant theme.
- Seed the store (products + metaobjects from `data/README.md`) so the shop/combos grids render with real cards — right now they correctly render empty until then.

## 4. Cut log

- **Purelane cart drawer (`sections/purelane-cart-drawer.liquid`)** — an experiment to replace stock Dawn's header cart with a branded drawer. Cut: it needs Dawn header/layout surgery (files this repo deliberately doesn't ship), stock Dawn already ships a working cart drawer, and it was out of the five-section scope. Any brand styling can ride on top of Dawn's native drawer later.
- Nothing else cut — all five sections are built per the plan's cut strategy (reviews/bundles were the fallback cuts; not needed).
