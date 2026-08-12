# data/ — how to apply (dev store)

Apply in this order in the Shopify Admin. Everything here is committed; nothing is store-specific.

## 1. Products — `seed-products.csv`

Admin → Products → Import → upload the CSV. Gives 10 products with the three required edge cases:

- Sold out: `washing-machine-cleaner-tablets` (qty 0, policy deny)
- No image: `magic-eraser-sponges` (blank `Image Src`; card renders the SVG art fallback)
- Very long title: `bio-enzyme-floor-tile-cleaner-concentrate` (card clamps it)

Badge tags are set: `bestseller`, `toprated`, `new`. Compare-at prices are set on every product so the %-off / "You save" rows have real data.

`Image Src` is intentionally blank for all — Part 3's `purelane-product-art.liquid` is the placeholder/fallback. Upload real product photography in Admin when available (hero LCP benefits from a real `fetchpriority` image).

## 2. Collection for the shop grid

Admin → Products → Collections → New. Recommended: automated collection **"Shop"** = product tag `bestseller` (or a manual collection of all 10). Select this collection in the `#shop` section setting.

## 3. Metaobject definitions — `metaobjects/`

Admin → Settings → Custom data → Metaobjects → Create. Create three definitions using the JSON in `data/metaobjects/` (`combo`, `bundle`, `review`), then add entries from Admin:

- **Combos:** 2–3 product groups referencing seeded products; set `is_most_popular` on one; leave compare-at-free combos to verify the save-row hiding rule (decision 4).
- **Bundles:** Starter 2 / Most popular 3 / Whole home 5 tiers with bullets and CTA labels.
- **Reviews:** 6–8 cards, ratings 4–5, mix of verified true/false, referencing seeded products where sensible.

Definitions can be created programmatically via the Admin GraphQL API (`metaobjectDefinitionCreate`) if preferred; the JSON mirrors the definition payload.

## 4. Badge metafield — `metafields/product-badge.json`

Admin → Settings → Custom data → Metafields → Products → Add definition with namespace `custom`, key `badge` (JSON in `data/metafields/`). Optional — tag badges work without it.
