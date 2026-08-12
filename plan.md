# Purelane — Shopify Rebuild Plan (5-Part Project)

Turn the design prototype `purelane-homepage.html` into production Shopify theme sections for stock Dawn. One person, ~2 days, five parts. Each part has a goal, concrete steps, and exit criteria — a part is not done until its exit criteria pass.

## Scope

The five required sections, in build priority order:

1. Hero — `section.hero`
2. Shop / product grid — `#shop`
3. Best-selling combos — `#combos`
4. Bundles — `#bundles`
5. Reviews rail — `#reviews`

Everything else in the file is bonus. Bonus sections ship only after all five pass QA (Part 4).

## The bar (from the brief)

- **Pixel-accurate** — match the file exactly (layout, spacing, type, colour, behaviour) at every width from 375px up. Build, not redesign.
- **Merchant-editable** — nothing hardcoded that marketing would want to change.
- **Real Shopify data** — products, prices, content come from the platform. Where a native field doesn't exist, solve it properly (metafields / metaobjects).
- **Reusable** — several sections render similar cards; build shared snippets.
- **Survives the theme editor** — add/remove/reorder/reconfigure never breaks anything, including animations.
- **Fast** — Core Web Vitals treated as a requirement, with measured before/after baselines.
- **Accessible** — keyboard, focus states, contrast, reduced motion.
- **Clean and reviewable** — code and commit history both.

## The 48-hour schedule

| When | Part | Outcome |
|---|---|---|
| Day 1 · AM | **Part 1** Recon & Spec | Audit done, fix-list final, section specs written, decisions locked |
| Day 1 · PM | **Part 2** Setup & Data | Dev store + CLI running, 8 products seeded, metaobjects created, performance baseline captured |
| Day 1 · PM → Day 2 · AM | **Part 3** Build | Shared snippets → shop → hero → combos → bundles → reviews |
| Day 2 · PM | **Part 4** QA & Hardening | Pixel checks, theme-editor stress test, a11y + performance passes |
| Day 2 · Late | **Part 5** Delivery | Git cleaned, notes written, email sent |

**Cut strategy (decided now, not in a panic):** the brief says "we're reading what you chose to do properly and what you chose to cut." If time runs out, cut in this order:

1. **Reviews rail** — most mechanical (a marquee of static cards), least "wow". Easiest to describe honestly as cut.
2. **Bundles** — shares the combo card pattern; if combos are done well, bundles is an incremental copy.
3. **Combos** — keep if at least Hero + Shop are pixel-perfect and data-driven.

Never cut **Hero** or **Shop**. They are what a reviewer opens first, and they exercise the shared product card, real-product-image flow, and Add-to-Cart behaviour that everything else reuses. A perfect hero + shop + one card-driven section beats five half-built sections.

---

# Part 1 — Recon & Spec

**Goal:** know exactly what the prototype is, what is wrong with it, and what we are building — precise enough that an agent can build from the spec and we can verify against it. No code in this part.

## 1a. Design audit (verified against the file)

`purelane-homepage.html` — 1716 lines, ~148 KB, single file, no dependencies.

**Design tokens — IMPORTANT: the file has TWO style blocks. The dark V1 palette (ink `#17102b` etc.) is fully overridden by a "VERSION 2 - BRAND COLOURS (light)" block, so the actually-rendered design is the light theme. Build against V2.** Full token table in `specs/00-tokens.md`.
- V2: ink `#f4f0fb` (pale mint page bg), brand `#4b3a8f`, paper `#241a3d`, accent `#b8701c` (not `#f0a03c`), surface `#17102b`, accent-green `#4f7d10`, stars `#7a9c1e`, primary button teal `linear-gradient(135deg,#00706a,#004b46)`
- Radius `--r: 26px`, `--r-sm: 16px`
- Max width `--maxw: 1180px`
- Section rhythm `--sec-y: 34px` (22px ≤760px)
- Display font **Outfit** (uppercase, weight 800), body font **Inter**
- Body background is a fixed multi-layer "scene" system (4 pale-mint gradients) crossfaded by scroll position — rebuilt as a static fixed gradient + per-section tint (see `specs/00-tokens.md`)

**The five sections (mapped)**

| Section | Prototype location | Contents | Data source |
|---|---|---|---|
| Hero | `section.hero` | 3 trust badges, `h1` "Clean That Lasts", rule divider, lede, CTA buttons, badge strip, product stage with 3 slides (1/2/3 bottles) + price tags + dot controls, parallax + scroll fade | Section settings for copy; slide picker = product or "art" mode; prices from products |
| Shop | `#shop` | Panel head + grid of product cards: pill badge (Best seller / Top rated / New), product art, title, rating (★ + count), price row (₹ + compare-at + % off), "Add to cart" | Collection picker; cards from products; badges from tags |
| Combos | `#combos` | Panel head + combo rail: cards with tray (stacked product images, "You save ₹…", "Most popular" flag), title, product count, "Includes:" line, price row (₹ + compare-at + save), fine print, CTA | `combo` metaobjects referencing products; savings computed from prices |
| Bundles | `#bundles` | Panel head + 3 tier cards (Starter 2 / Most popular 3 / Whole home 5), each with tag, product art stack, qty, price + compare-at, per-product price line, bullet list, CTA | `bundle` metaobjects referencing products |
| Reviews | `#reviews` | Kicker + aggregates (4.8 / 8,000+ reviews, 12 lakh+ homes), auto-scrolling marquee rail of review cards (stars, headline, quote, verified check, name, product) | Aggregates = section settings; cards from `review` metaobjects |

**Bonus material (inventory only)** — header `#hdr` (hides on scroll), in-page anchor rail, sticky bottom CTA bar ("Pick any 3, pay ₹499"), `#ingredients`, `#how`, `#proof`, `#range`, `#whybundles`, `#categories`, trust bar, signup form, footer. Product art is hand-built inline SVG bottles (tap, kitchen, copper, washer tablets, floor, toilet, laundry, dishwash, handwash, eraser).

**Scripts (current behaviour)** — reveal-on-scroll via `IntersectionObserver` (`.rv` → `.in`) with visible fallback; scene crossfade driven by scroll position over `[data-scene]` zones; parallax on hero product + water layers via `requestAnimationFrame` + mousemove ≥1024px; hero stage autoplay carousel (3.8 s) pausing on hover / out-of-view; product "rotator" in `#how`. All gated by `prefers-reduced-motion`.

## 1b. Fix-list (prototype patterns we will NOT replicate as-is)

This list doubles as the "what I'd flag about the original file" deliverable.

- Hardcoded products, prices, ratings, review copy in markup → Liquid + schema + metaobjects
- Inline SVG "art" bottles instead of real product images → real images by default, art as opt-in fallback
- Dead buttons ("Add to cart"), `<form onsubmit="return false">`, `<a>` used as buttons → real `product-form`/cart behaviour
- Fixed full-viewport background with scroll-jacking crossfade + mousemove parallax → LCP/CWV risk; rebuild performant and reduced-motion aware
- Auto-marquee / autoplay carousels without pause-on-focus or visibility handling
- Contrast / semantics gaps (heading order, focus management, missing skip link)
- `₹` hardcoded into strings → Liquid `money` filters; store currency decision (Part 2b)

## 1c. Section specs (the spec before the code)

One page per section lives in `specs/` (hero.md, shop.md, combos.md, bundles.md, reviews.md). Each specifies: layout/behaviour reference to the prototype lines, **all merchant-editable settings** (copy, colours, spacing, badges, CTA labels, animation toggle), data wiring, breakpoints (375 / 768 / 1024 / 1440), and the edge-case states (sold out, no image, long title). Agents build from these; QA verifies against these.

## Part 1 exit criteria

- [ ] Audit + fix-list final (above)
- [ ] `specs/` written for all five sections; each setting named with a default matching the prototype pixel-for-pixel
- [ ] Decisions in Part 2b confirmed (or explicitly overridden)

---

# Part 2 — Setup, Data & Decisions

**Goal:** a working dev environment and a locked data model, so Part 3 is pure build. One external dependency: the dev store URL + password (user supplies).

## 2a. Environment

- Free **Shopify Partner account + development store** running a clean install of stock **Dawn** (user creates; exact click-path provided).
- **Shopify CLI** (`shopify theme dev`) against the store; local preview at `localhost:9292` — this is also what Lighthouse runs against (no password needed locally).
- `git init` in `TroopodAssignment`; clean commit history staged per part.

## 2b. Decisions (locked early — each one is a time bomb if deferred)

1. **Currency: ₹ (INR).** The prototype is INR throughout. Set the store currency to INR at creation so Liquid `money` filters render `₹` and pixel-accuracy holds. Fallback if INR is unavailable: render currency-agnostic and flag the deviation in build notes.
2. **Review aggregates are merchant-editable settings**, not data. "4.8 / 8,000+ / 12 lakh+" has no native platform source without a reviews app — expose rating, review-count, and homes-copy as section settings with the prototype values as defaults.
3. **Badges come from product tags.** `bestseller`, `toprated`, `new` tags drive pill badges via a tag→label mapping in the shop section schema. Tags are standard Shopify — marketing can manage them in Admin with zero developer help.
4. **Savings are computed, never hardcoded.** "You save ₹X" and %-off derive from `compare_at_price` vs `price` in Liquid. If a combo has no compare-at prices, the save row hides itself.
5. **Add to Cart uses Dawn's native `product-form`** with cart-adding behaviour — never a dead button.

## 2c. Seed data

- At least **8 products** suited to the brand (tap cleaner, kitchen cleaner, copper/brass cleaner, floor cleaner, toilet cleaner, laundry detergent, dishwash gel, handwash, washing-machine tablets, magic eraser).
- Required edge cases: **one sold out**, **one with no image**, **one with a very long title** — each deliberately styled in the card snippet.
- Tags (`bestseller` etc.) set on products; collection(s) created for the shop grid.
- Compare-at prices set so combos/shop %-off rows have real data.

## 2d. Data model (metafields & metaobjects — created here, shipped as JSON in `data/`)

| Definition | Fields | Used by |
|---|---|---|
| `combo` (metaobject) | name, description, products (product reference list), badge text, includes line, fine print, CTA label, is_most_popular (checkbox) | Combos section |
| `bundle` (metaobject) | name, tag/badge, products (product reference list), bullets (richtext), CTA label | Bundles section |
| `review` (metaobject) | author name, product (product reference), rating (number), headline, quote, verified (checkbox) | Reviews rail |
| `product.badge` (metafield, optional) | overrides tag-based badge per product | Shop cards |

Metaobjects are the "native field doesn't exist → solve it properly" answer: marketing adds/edits combos, bundles and reviews in Admin without touching code. Definitions exported as JSON for the deliverables.

## 2e. Performance baseline (before we change anything)

- Run Lighthouse against the **stock Dawn** homepage at `localhost:9292` before any section work (`npx lighthouse http://localhost:9292 --view` or CLI flags).
- Record LCP / CLS / INP / TBT. Targets for the final build: **LCP < 2.5s, CLS < 0.1, INP < 200ms** on a throttled profile.
- Baseline number goes in `notes/performance-baseline.md`; Part 4 re-runs the identical command and compares.

## Part 2 exit criteria

- [ ] Dev store + `shopify theme dev` working; user credentials recorded in deliverables notes (not the repo)
- [ ] 8+ products seeded including the three edge cases; collection + tags set
- [ ] `combo` / `bundle` / `review` metaobjects created; definitions saved to `data/`
- [ ] Currency decision applied; `₹` renders on real prices
- [ ] Stock-Dawn performance baseline captured

---

# Part 3 — Build

**Goal:** the five sections, schema-first, on stock Dawn. Order matters: shared snippets first, then the two sections everything reuses, then the card-driven sections, then the most cuttable last.

## 3a. Theme file map

| File | Purpose |
|---|---|
| `sections/purelane-hero.liquid` | Hero — campaign copy, image/product picker, 3-slide stage, badge strip, scene colour pickers, animation toggle |
| `sections/purelane-shop.liquid` | `#shop` — collection picker, product grid |
| `sections/purelane-combos.liquid` | `#combos` — product-group rail from `combo` metaobjects |
| `sections/purelane-bundles.liquid` | `#bundles` — three tier cards from `bundle` metaobjects |
| `sections/purelane-reviews.liquid` | `#reviews` — aggregates + marquee rail from `review` metaobjects |
| `snippets/purelane-product-card.liquid` | Shared product card (shop grid + combo/bundle includes) |
| `snippets/purelane-combo-card.liquid` | Shared combo card |
| `snippets/purelane-bundle-card.liquid` | Shared bundle tier card |
| `snippets/purelane-review-card.liquid` | Shared review card |
| `snippets/purelane-product-art.liquid` | SVG bottle art (fallback + previews, merchant-switchable) |
| `snippets/purelane-panel-head.liquid` | Shared section head (kicker, title, lede) used by all five |
| `assets/purelane.css` | Section styles, scoped, tokens in one place |
| `assets/purelane.js` | Animations, scoped, deferred |
| `templates/index.json` | Homepage template assembling the five sections + block ordering |
| `data/` | Metaobject/metafield definition JSON exports |
| `specs/` | Per-section specs from Part 1 |
| `scripts/px-check/` | Pixel-verification screenshots (Part 4) |
| `notes/` | Performance baseline + build/AI-workflow notes (Part 5) |

## 3b. Build order

1. **Scaffolding + tokens:** `purelane.css`/`purelane.js` shells, token variables, `purelane-panel-head`.
2. **`purelane-product-card`** — the card shared by three sections (badge, art→image fallback, long-title clamp, sold-out/no-image states, ₹ price row, Add to Cart via Dawn `product-form`).
3. **Shop** (simplest full-section win; exercises the card + collection).
4. **Hero** (highest visibility; stage slides with product-or-art picker, autoplay carousel with pause on hover/focus/off-screen, dot controls keyboard-operable).
5. **Combos** (`combo` metaobjects → `purelane-combo-card`).
6. **Bundles** (`bundle` metaobjects → `purelane-bundle-card`; reuses art stack + price math).
7. **Reviews** (aggregate settings + `purelane-review-card` marquee with pause-on-focus).
8. **Homepage template** (`templates/index.json`) — section order + `blocks` wiring so reordering in the editor can't break the layout.

## 3c. Schema-first rules

- Every token (colours, type, spacing), heading, badge, CTA label, price/annotation string via `{% schema %}` settings with **prototype values as defaults**.
- Sections include `"limit": 1` where appropriate (hero) and named presets for the template.
- Reordering/removing a block in the theme editor must degrade gracefully: missing metaobjects or products render the section's empty/placeholder state, never Liquid errors or broken animations.

## 3d. Animations that survive the theme editor

- Reveal-on-scroll via `IntersectionObserver`; **unobserve after reveal** so re-renders don't re-trigger glitches.
- Autoplay carousels / marquee: pause on hover **and on focus**, stop when off-screen, restart cleanly on re-entry.
- No layout shift: reserved aspect ratios for images/cards; art and image paths both sized.
- `prefers-reduced-motion` respected end-to-end (reveals become instant, carousels static).

## 3e. Performance & accessibility built in (not cleaned up later)

- Hero LCP optimised: `fetchpriority` on hero image, preload critical font, `loading="lazy"` + `decoding="async"` below the fold.
- Deferred `purelane.js`, no render-blocking third parties.
- Semantic landmarks, skip link, correct heading order, visible focus states, ARIA on carousels/rails, keyboard-operable dots.

## Part 3 exit criteria

- [ ] All five sections build on stock Dawn from the specs in Part 1
- [ ] No hardcoded product/price/review data anywhere; schema settings cover the prototype values
- [ ] `purelane-product-card` reused by shop + combos + bundles; panel head reused by all five
- [ ] Edge cases styled: sold out, no image, very long title
- [ ] Add to Cart adds to the cart; all links/buttons are real

---

# Part 4 — QA & Hardening

**Goal:** prove the bar, don't claim it. Every check is named, with a tool and a pass/fail definition.

## 4a. Pixel verification (the "pixel-accurate" bar)

- **Workflow (`scripts/px-check/`):** Playwright screenshots of the prototype (`file://purelane-homepage.html`) and the dev store at **375, 768, 1024, 1440px**, full-page + section-level, saved side-by-side.
- Compare section by section against `specs/`; fix drift at the source (CSS, not by eyeballing).
- Re-run after every section change until no visual drift at any width.

## 4b. Theme-editor stress test

Do **all** of these in the editor, in this order, and watch console for errors:

1. Add each section (via preset), then remove it and re-add it
2. Reorder all five; change every setting; reconfigure blocks
3. Swap combo/bundle/review metaobjects; delete one while rendered
4. Replace a product image with none; un-publish a product
5. Confirm animations still run after each step (no dead observers, no stuck autoplay)

## 4c. Accessibility pass

- `axe-core` scan (via Lighthouse audit or browser extension) — zero critical/serious violations
- Keyboard: tab order through hero slides, grids, rails, cart buttons; visible focus everywhere
- Contrast: WCAG AA on text and UI (the prototype's paper-on-ink scheme is strong — verify all states)
- `prefers-reduced-motion`: page fully usable with animations off
- Screen-reader pass (heading structure, aria-labels on carousels, form labels)

## 4d. Performance verification

- Re-run the **identical Lighthouse command from Part 2e** on the final build at `localhost:9292`.
- Pass = LCP < 2.5s, CLS < 0.1, INP < 200ms, and no regression vs the stock-Dawn baseline.
- Also check: no render-blocking unused CSS/JS, images sized, no layout shift on carousel/rail load.

## 4e. Code review

- Run the **`web-design-guidelines`** skill against the built section files.
- Read-through for Liquid edge cases (empty collections, missing compare-at price, multi-currency rendering).
- Commit-friendliness: sections are reviewable as diffs, not one blob.

## Part 4 exit criteria

- [ ] Zero pixel drift at 375 / 768 / 1024 / 1440
- [ ] Theme-editor stress test passes end-to-end (including after deleting metaobjects mid-render)
- [ ] axe clean; keyboard + reduced-motion + screen-reader passes
- [ ] Performance meets thresholds vs baseline
- [ ] All five sections pass or are consciously cut per the Day-1 cut strategy (documented why)

---

# Part 5 — Delivery

**Goal:** package everything the brief asks for, straight and honest about gaps.

## 5a. Git

- Repo in `TroopodAssignment`, clean history staged per part: recon → data model → scaffolding → each section → QA fixes.
- No secrets in the repo (store password goes in the deliverables notes, not committed).

## 5b. Deliverables checklist

- [ ] Dev store URL and password
- [ ] GitHub repo, commit history intact
- [ ] Metafield / metaobject definitions (`data/` JSON)
- [ ] Build notes — `notes/build-notes.md`
- [ ] AI workflow notes — `notes/ai-workflow-notes.md`
- [ ] Email to **nj@troopod.io**, subject: `AI Product Engineer Assignment - Your Name`

## 5c. Build notes outline (`notes/build-notes.md`)

1. **What I'd flag about the original file** — the Part 1b fix-list, expanded with specifics (scroll-jacked background, dead CTAs, hardcoded ₹, autoplay without pause-on-focus, SVG-art-instead-of-product-images).
2. **What I changed in the code and why** — per section: data wiring, semantics, a11y, breakpoint logic, performance changes; each deviation from "match the prototype" justified against the "code is not the spec" clause.
3. **What I'd do with more time** — bonus sections, real reviews app integration, scene system refinement, editor presets polish.
4. **Cut log** — what was cut and why (from the Day-1 strategy), if anything.

## 5d. AI workflow notes outline (`notes/ai-workflow-notes.md`)

1. What was delegated to agents (spec-writing, section scaffolding, QA passes, metafield JSON).
2. Where agents failed and how it was caught (spec drift, Liquid edge cases, theme-editor re-render bugs — the review loops that caught them).
3. What to systematise for twenty more of these: the `specs/` template, the pixel-check script, the metaobject recipe, the QA checklist — i.e., the parts of this plan that are now reusable.

## Part 5 exit criteria

- [ ] All deliverables in 5b sent before the deadline
- [ ] Notes are straight about gaps (the brief explicitly rewards honesty over completeness)

---

# Open items

- **Dev store URL + password** — user supplies before Part 2 can start (only external dependency)
- **Currency confirm** — INR availability on the dev store; fallback documented in 2b
- **Seed-product list confirm** — 8+ products matching the brand; user sign-off on the edge-case trio
- **Bonus sections** — only after the five core sections pass Part 4
