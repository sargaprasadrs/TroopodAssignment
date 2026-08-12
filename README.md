# Purelane — Shopify Theme Rebuild

**Troopod · AI Product Engineer assignment** — take a static design prototype and turn it into production Shopify theme sections a merchant's marketing team can run without a developer.

> **The design is the spec. The code is not.** Reproduce the visual output exactly; where the underlying HTML/CSS is wrong for production, fix it and say why.

---

## 📍 Where we are

```mermaid
flowchart LR
    A["Part 1 · Recon & Spec"] --> B["Part 2 · Setup & Data"]
    B --> C["Part 3 · Build"]
    C --> D["Part 4 · QA & Hardening"]
    D --> E["Part 5 · Delivery"]

    A:::done
    B:::done
    C:::done
    D:::done
    E:::done

    classDef done fill:#15803d,stroke:#052e16,color:#fff
```

| Part | Scope | Status |
|---|---|---|
| **1 · Recon & Spec** | Design audit, fix-list, five pixel-accurate section specs | ✅ Committed |
| **2 · Setup & Data** | Locked decisions, seed data, metaobject definitions | ✅ Committed — store activation needs dev-store credentials |
| **3 · Build** | Five sections + shared snippets + assets + homepage template | ✅ Committed |
| **4 · QA & Hardening** | Pixel harness, axe, contrast, perf reference | ✅ Committed — live store checks (4b/4d) pending dev store |
| **5 · Delivery** | Build/AI-workflow notes, submission draft | ✅ Committed + pushed to GitHub — email waits on dev-store creds |

---

## 🎯 The mission

`purelane-homepage.html` (1716 lines, ~148 KB) is a fast-built design prototype for a plant-based homecare brand — single file, no dependencies, not written with Shopify in mind. We turn **five of its sections** into merchant-editable, data-driven Shopify sections on **stock Dawn**:

| # | Section | Prototype anchor | What it is |
|---|---|---|---|
| 01 | **Hero** | `section.hero` | Trust badges, headline, 3-slide product stage with price tags + dots |
| 02 | **Shop / product grid** | `#shop` | Collection-driven cards: badge, rating, price row, Add to cart |
| 03 | **Best-selling combos** | `#combos` | Snap-scroll rail of curated product groups |
| 04 | **Bundles** | `#bundles` | Starter / Most popular / Whole home tier cards |
| 05 | **Reviews rail** | `#reviews` | Auto-marquee of review cards with aggregates |

Everything else in the file (header, ingredients, proof, footer…) is bonus and ships only if the five pass QA.

---

## 🧱 Architecture

Every section is a schema-first Liquid section; cards they share live in reusable snippets.

```mermaid
flowchart TB
    subgraph shared["Reusable snippets"]
        PH["purelane-panel-head"]
        PC["purelane-product-card"]
        CC["purelane-combo-card"]
        BC["purelane-bundle-card"]
        RC["purelane-review-card"]
        PA["purelane-product-art"]
    end

    H["purelane-hero"] --> PH
    H --> PA
    S["purelane-shop"] --> PH
    S --> PC
    C["purelane-combos"] --> PH
    C --> CC
    C --> PC
    B["purelane-bundles"] --> PH
    B --> BC
    R["purelane-reviews"] --> PH
    R --> RC
    PA -. "art fallback" .-> PC
    PA -. "art fallback" .-> CC
    PA -. "art fallback" .-> BC
```

**One key discovery during recon:** the prototype ships **two style blocks**. The dark "V1" palette is fully overridden by a "VERSION 2 — brand colours (light)" block, so the actually-rendered design is the light mint theme. All specs target **V2** (`specs/00-tokens.md`).

---

## 🗃️ Data model

Products, prices and content come from the platform. Where Shopify has no native field, we solved it with metaobjects so marketing can add/swap content in Admin without a developer.

```mermaid
erDiagram
    PRODUCT ||--o{ COMBO_ITEM : "featured in"
    COMBO ||--|{ COMBO_ITEM : "contains"
    COMBO_ITEM }o--|| PRODUCT : "references"
    BUNDLE }o--o{ PRODUCT : "includes"
    REVIEW }o--o| PRODUCT : "mentions"
    PRODUCT ||--o| PRODUCT_BADGE : "optional override"
```

- **`combo` + `combo_item`** → curated product groups with deal pricing; savings computed in Liquid (`compare_at − price`), never hardcoded
- **`bundle`** → tier cards; per-product line computed as `price ÷ count`
- **`review`** → marquee cards (stars, headline, quote, author, verified)
- **Badges** → driven by product tags (`bestseller` / `toprated` / `new`) with a `custom.badge` metafield override
- **Review aggregates** ("4.8 · 8,000+ · 12 lakh+") → merchant-editable section settings, since the platform has no native source without a reviews app

Definitions live in [`data/`](data/README.md) (seed CSV, metaobject JSON, badge metafield).

---

## 📋 The bar

- **Pixel-accurate** — exact layout, spacing, type, colour and behaviour from 375px up; a build, not a redesign
- **Merchant-editable** — nothing hardcoded that marketing would want to change
- **Real Shopify data** — products, prices, content from the platform
- **Reusable** — shared card snippets across sections
- **Survives the theme editor** — add/remove/reorder/reconfigure never breaks anything, animations included
- **Fast** — Core Web Vitals as a requirement, measured against a stock-Dawn baseline
- **Accessible** — keyboard, focus, contrast, reduced motion
- **Clean and reviewable** — code and commit history

---

## 🚀 How to run

### Prerequisites

- **Node.js 18+** and **Python 3.11+** — QA harness
- **Google Chrome** — pixel captures (harness drives the installed browser)
- **Shopify Partner account + development store** on stock Dawn (set to INR so ₹ renders) and the **Shopify CLI**

### 1. Get the theme on a store

```bash
# from the repo root — push the theme (sections, snippets, assets, templates) to your dev store
shopify login --store your-store.myshopify.com
shopify theme push
# or preview locally first:
shopify theme dev        # opens http://localhost:9292
```

`templates/index.json` already wires the five Purelane sections onto the homepage; add/remove/reorder them from the theme editor like any Dawn section.

### 2. Seed the store (data)

Follow [`data/README.md`](data/README.md) in order:

1. **Products** — Admin → Products → Import → `data/seed-products.csv` (10 products incl. sold-out, no-image and long-title edge cases)
2. **Collection** "Shop" (tag `bestseller`) — picked in the shop section settings
3. **Metaobject definitions** — Admin → Settings → Custom data → create from `data/metaobjects/*.json` (`combo`, `combo_item`, `bundle`, `review`), then add entries
4. **Badge metafield** — Admin → Settings → Custom data → Metafields → from `data/metafields/product-badge.json`

### 3. Run the QA harness

```bash
cd scripts/px-check
npm install

node capture.js                                  # prototype baseline @ 375/768/1024/1440
PX_URL=http://localhost:9292 node capture.js     # capture the live build instead
node axe.js                                      # WCAG 2a–22aa accessibility scan
python contrast.py                               # WCAG AA contrast matrix (V2 palette)
```

Performance reference (prototype) — or point Lighthouse at `localhost:9292` for the live build:

```bash
python -m http.server 8123 --bind 127.0.0.1 --directory ../..
npx -y lighthouse http://127.0.0.1:8123/purelane-homepage.html \
  --only-categories=performance,accessibility \
  --output=json --output-path=out/lh.json \
  --chrome-path="C:/Program Files/Google/Chrome/Application/chrome.exe"
```

Details for every command: [`scripts/px-check/README.md`](scripts/px-check/README.md).

### 4. Where the docs live

| Need | Read |
|---|---|
| Why we built it this way | [`plan.md`](plan.md) — 5-part plan, decisions, cut strategy |
| Pixel spec of every section | [`specs/`](specs/) |
| QA evidence | [`notes/qa-report.md`](notes/qa-report.md) + `scripts/px-check/out/` |
| What we'd flag / do differently | [`notes/build-notes.md`](notes/build-notes.md), [`notes/ai-workflow-notes.md`](notes/ai-workflow-notes.md) |

---

## 🗂️ Repository map

```mermaid
mindmap
  root((purelane-shopify))
    plan.md
      Five-part project plan
      48h schedule + cut strategy
    purelane-homepage.html
      Design source of truth
    specs
      Shared tokens + one spec per section
    sections
      purelane-hero / shop / combos / bundles / reviews
    snippets
      Shared cards, panel head, icons, product art, assets
    assets
      purelane.css + purelane.js
    templates
      index.json homepage wiring
    data
      seed-products.csv
      metaobjects (combo, combo_item, bundle, review)
      metafields (product badge)
    notes
      Decisions, QA report, build + AI-workflow notes, email draft
    scripts/px-check
      capture.js + axe.js + contrast.py QA harness
```

---

## 🚀 Next steps

1. Dev-store credentials → finish `notes/submission-email.md` and send to `nj@troopod.io`
2. Run the live checks once the store is up: theme-editor stress test (plan.md Part 4b) + Lighthouse re-run (`notes/performance-baseline.md`)
3. Apply the three queued a11y fixes from `notes/qa-report.md` (micro-label contrast, nav-dot target size, `#reviews` heading)
