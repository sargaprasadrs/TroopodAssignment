# 02 — Shop / Product Grid Spec (`#shop`)

Prototype reference: `purelane-homepage.html` lines 1248–1436 (HTML), 406–425 (`.shelf`/`.card` CSS), V2 overrides at 725–730, 760 media block. Reuses `00-tokens.md` tokens/glass/buttons.

## Layout

- **Panel head** (`.panel-head`, centered, `margin-bottom:26px`): kicker "Bestsellers" (`.kicker`), H2 `.d2` "Loved by 30,000 homes" (`margin-top:12px`), rule divider (`.rule` centered, max-width 240px).
- **Grid `.shelf`:** `display:grid; gap:14px; grid-template-columns:repeat(2,1fr)`; **≥860px: `repeat(4,1fr)`**. Product cards in DOM order with reveal stagger (`.rv`, `.rv-d1`…`.rv-d3`).

## Card anatomy (`.glass.card`) — shared `purelane-product-card` snippet

`padding:16px`, flex column, `transition:.4s var(--ease)`, hover `translateY(-5px)`.

1. **`.shot`** (media box): `height:150px` (126px ≤760px), `border-radius:14px`, `margin-bottom:14px`, `display:grid; place-items:center`, `position:relative; overflow:hidden`, background `linear-gradient(160deg, rgba(255,255,255,.60), rgba(236,230,247,.42))`, border `rgba(75,58,143,.10)`. Product image height 122px (108px ≤760px), `drop-shadow(0 8px 13px rgba(0,74,66,.13))`.
2. **`.pill`** badge (top-left, `top:9px; left:9px`): 8.5px/800/.13em uppercase, `padding:4px 9px`, radius 999px, `background:rgba(255,255,255,.86)`, border `rgba(201,118,29,.34)`, `color:#4f7d10`. Values in prototype: "Best seller", "Top rated", "New".
3. **`.h4`** title: Outfit 13.5px/700 uppercase, `letter-spacing:.03em`, `color:var(--surface)`, `line-height:1.2`, `margin-bottom:7px`. **Long titles: clamp to 2 lines** (production addition for the seeded long-title product).
4. **`.rate`**: 11.5px, `color:var(--paper-2)`, `margin-bottom:10px`; `<b>` star+score in accent ("★ 4.8") + "· 237 reviews".
5. **`.pr`** price row (`margin-top:auto`): strong 18px Outfit surface (₹ price) + `s` 12px paper-3 (compare-at) + `em` 10px/800 accent ("33% off").
6. **`.btn.btn-ghost.btn-sm`** "Add to cart", `width:100%; justify-content:center` → **real `product-form`** (Dawn), qty 1, single-variant products.

## Behaviour

- Card hover lift; button hover per ghost styles.
- Reveal stagger on scroll (`.rv` + delays).
- **Add to cart:** Dawn `product-form` posts to `/cart/add` and updates the cart drawer/count (Dawn cart-drawer). No dead buttons. Sold-out state: `product-form` button becomes disabled "Sold out" (Dawn `sold_out` styling), card shows pill "Sold out".
- **No image:** render `purelane-product-art` fallback art in `.shot` (height-driven, same 122px) instead of an empty box.

## Data wiring (Liquid)

- **Collection picker** → iterate `collection.products` (limit setting, default 8).
- Price row: `product.price` / `product.compare_at_price`; %-off computed in Liquid (`compare_at - price / compare_at × 100` → "33% off"); hidden when no compare-at.
- Rating: `product.metafields.reviews.rating` + `rating_count` (see edge note) — **falls back to section-level default rating/count settings** (prototype values 4.8 / 237 etc.).
- **Badges from tags:** schema map `bestseller → Best seller`, `toprated → Top rated`, `new → New`; per-product metafield `custom.badge` (single-line) overrides tag mapping.
- Image: `product.featured_image`; alt text from product.

## Schema settings

- `collection` (collection picker)
- `products_limit` (range 1–12, default 8)
- `kicker` — "Bestsellers"; `heading` — "Loved by 30,000 homes"
- `default_rating` (range 0–5 step .1, default 4.8); `default_review_count` (number, default 237)
- Badge tag→label map: 3 × text fields (`bestseller_tag_label` "Best seller", `toprated_tag_label` "Top rated", `new_tag_label` "New") + `show_badges` checkbox
- `show_rating` (checkbox, true); `show_percent_off` (checkbox, true); `show_compare_at` (checkbox, true)
- `add_to_cart_label` — "Add to cart"; `sold_out_label` — "Sold out"
- `card` style overrides: radius, padding (grouped in a `card_style` object) — optional; defaults from tokens
- `background_tint` (color, transparent); `padding_top/bottom`; `color_scheme`

## Breakpoints

| Width | Change |
|---|---|
| ≥860px | 4 columns |
| <860px | 2 columns |
| ≤760px | `.shot` 126px, image 108px |

## Edge cases & a11y

- **Sold out product:** disabled button + "Sold out" pill (production addition; style deliberately).
- **No image:** art fallback (never empty box, no layout shift — `.shot` height reserved).
- **Very long title:** 2-line clamp with ellipsis (keeps grid rows aligned).
- Empty collection: show `empty_state_text` setting ("No products yet") instead of broken grid.
- **A11y:** cards are `<article>` with `<a>` on the image/title → product page; button labelled by text; `aria-label` on pill if empty; images `loading="lazy"` (below the fold), `decoding="async"`; price row is a proper `<dl>`-style structure or uses `aria-label` summary; focus ring per tokens.

## QA checkpoints (pixel)

4-col at ≥860 / 2-col below; `.shot` 150px with centered 122px image; pill metrics (8.5px, padding 4/9, offset 9px); price row baseline alignment (strong 18 / s 12 / em 10); button full-width 38px; long-title clamp doesn't break row height; sold-out & no-image states render intentionally.
