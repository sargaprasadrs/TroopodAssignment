# Purelane — Strategy & Build Summary

**Project:** Rebuild of a single-file design prototype into a merchant-editable
Shopify theme (five homepage sections), built for a plant-based homecare brand.

> **Note to the reader:** this document is the high-level summary. It describes
> the approach and the steps taken; the source code and exact business figures
> are intentionally not included. The companion assets are a read-only
> watermarked preview, a short demo video, and watermarked screenshots.

---

## 1. What the project is

A static HTML design prototype (~1,700 lines, single file) was turned into
production Shopify theme sections that a merchant's marketing team can run
without a developer. The design file was treated as the spec: the goal was
pixel-accurate visual output, while fixing whatever was wrong with the
underlying code for production.

## 2. Strategy

Five sections were built, in priority order, with shared building blocks:

1. **Hero** — headline, trust cues, and a 3-slide product stage.
2. **Shop / product grid** — a collection-driven grid of product cards.
3. **Combos** — a rail of curated product groups.
4. **Bundles** — tiered offer cards.
5. **Reviews** — an aggregate rating row plus a scrolling rail of review cards.

Everything reusable lives in shared snippets so the sections stay small and the
theme editor can add/remove/reorder them without breaking anything.

## 3. Key decisions (and why)

- **Nothing hardcoded.** Copy, colours, labels and prices come from Shopify —
  section settings, products, and custom content objects (metaobjects) that
  marketing manages in Admin without touching code.
- **Prices and savings are computed**, never typed in — they derive from the
  platform's standard compare-at pricing.
- **The design's dark palette was a red herring.** The file contained two
  competing style blocks; the actually-rendered design was the light theme, and
  all work targeted that.
- **Performance and accessibility were treated as requirements**, not
  afterthoughts — measured against a stock-theme baseline, with keyboard
  support, focus states, reduced-motion handling and contrast checks.

## 4. The steps taken

| Phase | What happened |
|---|---|
| **Recon & spec** | Audited the design file, wrote a fix-list, locked the design tokens and a per-section spec before any code. |
| **Setup & data** | Locked decisions (currency, data sources, badges), prepared seed data and custom content definitions. |
| **Build** | Shared snippets first, then the five sections, then the homepage wiring. |
| **QA & hardening** | Automated pixel checks at four screen widths, accessibility scans, contrast matrix, live-storefront smoke checks, performance reference. |
| **Delivery** | Docs, evidence, and this IP-protected package. |

## 5. What was fixed along the way

- Dead buttons and links became real add-to-cart and navigation behaviour.
- Hardcoded products, prices and review copy became platform data.
- Autoplaying carousels got pause-on-hover/focus and reduced-motion handling.
- A heavy scroll-jacked background was rebuilt to be fast and stable.
- Contrast and heading-order issues were corrected.

## 6. What I would do with more time

- Build the remaining "bonus" sections of the design (header, ingredients,
  footer, etc.).
- Integrate a real reviews app instead of merchant-editable aggregate numbers.
- Refine the scroll-scene background system further.

## 7. Honest gaps

- The theme-editor stress test and the final performance re-run against the
  live store still need a human with store credentials to complete.
- The store itself was not seeded with real products, so live rendering of
  shop/combos/bundles data is unverified end-to-end.

---

*Prepared as part of the Purelane Shopify rebuild. Confidential — for review
only. Full source, exact figures, and credentials are not part of this
package.*
