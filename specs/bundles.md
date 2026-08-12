# 04 — Bundles Spec (`#bundles`)

Prototype reference: `purelane-homepage.html` lines 1196–1248 (HTML), 388–402 (`.tiers`/`.tier` CSS), 573–578 (`.tierpix`), V2 overrides at 738–746, 760 media block. Data model: `bundle` metaobject (plan.md Part 2d).

## Layout

- **Panel wrapper** (`.glass.sec-pad`, `margin-bottom:16px`): kicker "Build your bundle", H2 `.d2` "One box. Every room.", lede "Mix and match across kitchen, laundry, home and skin. One flat price, no code needed, free shipping either way." (`.lede` centered, `margin:0 auto`).
- **Tiers grid `.tiers`:** `display:grid; gap:14px; grid-template-columns:1fr`; **≥760px: `repeat(3,1fr)`**. Reveal stagger `.rv`, `.rv-d2`, `.rv-d3` (middle card delayed).

## Tier card (`.glass.tier`) — shared `purelane-bundle-card` snippet

`padding:24px 22px`, hover `translateY(-5px)`. Highlight `.best`: border `rgba(201,118,29,.46)` + ring `0 0 0 1px rgba(201,118,29,.24)` (prototype marks the middle tier "Most popular").

1. **`.tag`** pill (9.5px/800/.16em uppercase, `padding:5px 11px`, radius 999px, `margin-bottom:14px`): bg `rgba(201,118,29,.14)`, border `rgba(201,118,29,.34)`, `color:#4f7d10`. Values: "Starter", "Most popular", "Whole home".
2. **`.tierpix`** art strip (`aria-hidden`): `height:78px` (70px ≤760px), `padding:8px 6px`, `border-radius:14px`, flex `align-items:flex-end; justify-content:center; gap:2px`, bg `linear-gradient(162deg, rgba(255,255,255,.54), rgba(236,230,247,.34))`, border `rgba(75,58,143,.11)`, `margin:-4px 0 16px`. Arts 62px tall (54px ≤760px); 5-product tier `.five` → 54px (46px ≤760px); `drop-shadow(0 5px 8px rgba(0,74,66,.13))`.
3. **`.qty`**: Outfit 800, **52px** (44px ≤760px), `line-height:.9`, `letter-spacing:-.03em`, `color:var(--surface)`; `<small>` 14px/600/.1em uppercase paper-3 ("Products").
4. **`.price`**: Outfit 700 **27px** accent `#b8701c`, `margin:16px 0 4px`; `<s>` 14px paper-3 (compare-at).
5. **Per-product line**: 12px `.body-s` ("Flat ₹174 per product") — **computed** `price ÷ count` rounded to whole rupee.
6. **`.ul` bullets**: `margin:16px 0 20px; display:grid; gap:8px`; each `li` 13px paper-2, check SVG 14px accent-green (`#4f7d10`), `margin-top:4px`.
7. **`.btn`** full-width (`justify-content:center`): primary on the highlighted tier (with arrow), ghost otherwise. Label "Build this box" → link to shop/bundle builder.

## Data model — `bundle` metaobject

| Field | Type | Notes |
|---|---|---|
| `name` | single_line_text_field | Tier name / title |
| `tag` | single_line_text_field | "Starter" / "Most popular" / "Whole home" |
| `products` | product reference list | Art strip (order preserved) |
| `price` | number (decimal) | Flat bundle price |
| `compare_at_price` | number (decimal) | MRP sum for strikethrough |
| `bullets` | list of single_line_text_field | Check list (2–3 items) |
| `highlight` | boolean | `.best` ring + primary CTA |
| `cta_label` | single_line_text_field | Default "Build this box" |
| `cta_link` | url | Default `#shop` |

Per-product line and strikethrough savings computed in Liquid (`price/count`, `compare − price`). **Count derived from `products` list** — marketing can't desync the number and the art.

### Seed bundles (prototype values)

| Tier | Tag | Products | Price/Compare | Flat | Bullets |
|---|---|---|---|---|---|
| Starter 2 | Starter | Tap + Kitchen (combo2 art) | ₹349 / ₹598 | ₹174 | Pick any two products · Free shipping across India |
| 3 (middle) | Most popular | Kitchen, Tap, Dishwash | ₹499 / ₹897 | ₹166 | Pick any three products · Covers kitchen and laundry · Free shipping across India |
| Whole home 5 | Whole home | Kitchen, Tap, Floor, Toilet, Laundry | ₹799 / ₹1,495 | ₹160 | Pick any five products · Every room in one order · Free shipping across India |

## Schema settings

- `kicker` — "Build your bundle"; `heading` — "One box. Every room."; `lede` (textarea)
- `bundle_wrapper_style`: `panel_tint` (color, transparent), `panel_radius` (range 16–32, default 26)
- `bundles` (metaobject_reference list) — order = tier order; `limit` (range 1–6, default 3)
- `per_product_prefix` — "Flat "; `per_product_suffix` — " per product"
- `background_tint` (color, transparent); `padding_top/bottom`; `color_scheme`

## Behaviour

- Hover lift on all tiers; reveal stagger (middle tier delayed by design).
- CTA: real link (`#shop` / bundle builder page) — production resolves the prototype's dead anchor per the fix-list.

## Edge cases & a11y

- Tier with 1 product: strip renders a single art (no layout shift).
- Deleted product in list: art placeholder, card stays intact.
- Long tier name: H3 wraps (uppercase, `line-height:1.1`).
- **A11y:** `.tierpix` is `aria-hidden` (decorative); price announced with per-product line; bullets are a real `<ul>`; highlight communicated by visual ring + "Most popular" tag text (not colour alone); focus ring visible on CTA.
- **Theme-editor:** adding/removing bundles re-renders; `highlight` toggles cleanly; reduced-motion disables reveal transforms.

## QA checkpoints (pixel)

3-col at ≥760 / stacked below; `.tierpix` 78px with 62px arts baseline-aligned (`align-items:flex-end`, gap 2px); `.five` shrink (54px); qty 52px with 14px small; price 27px accent + 14px `s`; bullet gap 8px, check 14px; `.best` ring `0 0 0 1px rgba(201,118,29,.24)`; middle-card delay vs siblings.
