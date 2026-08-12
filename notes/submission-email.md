# Submission email (draft)

**To:** nj@troopod.io
**Subject:** AI Product Engineer Assignment - Sargaprasad

---

Hi Troopod team,

Here's my submission for the AI Product Engineer build assignment — turning the Purelane prototype homepage into production Shopify sections on stock Dawn.

**Deliverables**

- **Dev store:** URL: `<PASTE DEV STORE URL — e.g. your-store.myshopify.com>` · Password: `<PASTE STORE PASSWORD>` (omitted from the repo, per the brief)
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

- Dev-store validation (theme-editor stress test, final Lighthouse) is still pending — the store credentials above unlock `notes/performance-baseline.md` and the Part 4 checklist.
- The Part 3 commit (sections + snippets are written) lands right after the asset layer (CSS/JS) and homepage template finish.
- Three a11y fixes are queued from the audit (micro-label contrast, nav-dot target size, a heading for #reviews) and go into the build next.

Happy to walk through anything. Thanks for reading.

Best,
Sargaprasad
