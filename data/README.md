# data/ — how to apply (dev store)

Apply in this order in the Shopify Admin. Everything here is committed; nothing is store-specific. Data model reconciled against `specs/` (Part 1) — the build consumes exactly these fields.

## 1. Products — `seed-products.csv`

Admin → Products → Import → upload the CSV. Gives 10 products with the three required edge cases:

- Sold out: `washing-machine-cleaner-tablets` (qty 0, policy deny)
- No image: `magic-eraser-sponges` (blank `Image Src`; card renders the SVG art fallback)
- Very long title: `bio-enzyme-floor-tile-cleaner-concentrate` (card clamps it)

Badge tags are set: `bestseller`, `toprated`, `new`. Compare-at prices are set on every product so the %-off / "You save" rows have real data.

`Image Src` is intentionally blank for all — the `purelane-product-art` snippet is the placeholder/fallback. Upload real product photography in Admin when available (hero LCP benefits from a real `fetchpriority` image).

## 2. Collection for the shop grid

Admin → Products → Collections → New. Recommended: automated collection **"Shop"** = product tag `bestseller` (or a manual collection of all 10). Select this collection in the `#shop` section setting.

## 3. Metaobject definitions — `metaobjects/`

Admin → Settings → Custom data → Metaobjects → Create. Create four definitions using the JSON in `data/metaobjects/` (`combo`, `combo_item`, `bundle`, `review`), then add entries from Admin:

- **Combos** (`combo` referencing `combo_item`s): the five seed combos from `specs/combos.md` — Kitchen essentials (₹499/₹897, Most popular), Laundry care bundle (₹499/₹947), Complete home bundle (₹799/₹1,495, highlighted), Bathroom deep clean (₹499/₹897), Hard water solution kit (₹349/₹598). Set `price`/`compare_at_price`; leave one combo without a compare-at to verify the save-row hiding rule.
- **Bundles:** Starter 2 / Most popular 3 / Whole home 5 tiers (prices/comparisons/bullets from `specs/bundles.md`), `highlight` on the middle tier.
- **Reviews:** the 5 seed cards from `specs/reviews.md`, ratings 5, `verified` true.

Definitions can be created programmatically via the Admin GraphQL API (`metaobjectDefinitionCreate`) if preferred; the JSON mirrors the definition payload.

## 4. Badge metafield — `metafields/product-badge.json`

Admin → Settings → Custom data → Metafields → Products → Add definition with namespace `custom`, key `badge` (JSON in `data/metafields/`). Optional — tag badges work without it.
