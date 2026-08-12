# Submission email (draft)

**To:** nj@troopod.io
**Subject:** AI Product Engineer Assignment - Sargaprasad

---

Hi Troopod team,

Here's my submission for the AI Product Engineer build assignment — turning the Purelane prototype homepage into production Shopify sections on stock Dawn.

**Deliverables**

- **Dev store:** URL: **https://purelane-dev-rzcwvlkv.myshopify.com** · Password: **_(fill in at send time — never committed to the repo)_**
- **GitHub repo (commit history intact):** https://github.com/sargaprasadrs/TroopodAssignment
- **Metafield / metaobject definitions:** `data/` (combo, combo-item, bundle, review; product badge metafield; seed-products.csv)
- **Build notes:** `notes/build-notes.md` — what's wrong with the original file, what we changed and why, what we'd do with more time
- **AI workflow notes:** `notes/ai-workflow-notes.md` — what was delegated, where the agents failed, what we'd systematise

**Short version of the build**

- Five sections, schema-first, on stock Dawn; every copy/colour/CTA is a merchant setting with the prototype's values as defaults.
- Products, prices and savings are real Shopify data (savings computed, never hardcoded); combos/bundles/reviews run on metaobjects marketing can edit in Admin.
- Shared card snippets across sections; Add to Cart uses Dawn's native product form (no dead buttons).
- QA: pixel harness + axe + contrast matrix + Lighthouse are in `scripts/px-check/` with the prototype baseline recorded (perf 74 / LCP 4.3 s — the prototype's scene system is the main CWV culprit, rebuilt as a static tint).

**Straight talk on gaps**

- **The theme is live** (Purelane Dawn, published on the store above) and all five sections render at 375/768/1024/1440 — verified with the pixel harness against the deployed build (`theme check`: 52 files, zero offenses).
- **The store is not yet seeded** — the homepage's shop/combos grids render empty until the products from `data/seed-products.csv` are imported and the combo/bundle/review metaobjects are created in Admin (steps in `data/README.md`). I'd do this right before you review; it's ~15 minutes of Admin clicks.
- The theme-editor stress test and the final Lighthouse on the live storefront are the last QA items; both are documented with exact steps and ready to run.
- One stock-Dawn a11y note: Dawn's new header cart link has no accessible name (inline SVG only) — one-line fix (add `aria-label`), not in our five sections.

Happy to walk through anything. Thanks for reading.

Best,
Sargaprasad
