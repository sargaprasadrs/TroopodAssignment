# 03 — Best-Selling Combos Spec (`#combos`)

Prototype reference: `purelane-homepage.html` lines 1181–1196 (HTML), 510–549 (CSS), V2 overrides at 738–744. Data model: `combo` + `combo_item` metaobjects (see Part 2d of plan.md; definitions in `data/`).

## Layout

- **Panel head**: kicker "Pre-built to save you money", H2 `.d2` "Best selling combos", rule, lede "Swipe through the boxes people order most. Each one is already priced below buying the same products on their own."
- **Rail `.comborail`:** `display:flex; gap:14px; overflow-x:auto; overflow-y:hidden; scroll-snap-type:x mandatory`, cards `scroll-snap-align:start`; negative margins to bleed to screen edges `margin:0 -18px; padding:4px 18px 14px` (≤760px: `0 -14px; 4px 14px 12px`); scrollbar hidden (`scrollbar-width:none` + `::-webkit-scrollbar{display:none}`).
- **Swipe cue** `.swipecue` ("Swipe for more combos", arrow icon, 10px/700/.16em paper-3, accent icon) + **`.railnote`** (12px, paper-3, max-width 62ch, centered): "Tapping 'Shop bundle' opens the bundle picker with these products already added. You can still swap anything before you pay."

## Combo card (`.glass.combo`) — shared `purelane-combo-card` snippet

`flex:0 0 302px` (268px ≤760px), flex column, `padding:0`, hover `translateY(-5px)`. Highlight variant `.hero-combo`: `border-color:rgba(201,118,29,.46)`, ring `box-shadow:0 22px 54px rgba(58,44,112,.14), 0 0 0 1px rgba(201,118,29,.24), var(--g-inset)`.

1. **`.tray`** (product stack): `padding:14px 14px 13px`, `border-bottom:1px solid rgba(75,58,143,.12)`, background `linear-gradient(162deg, rgba(255,255,255,.56), rgba(236,230,247,.34))`, `position:relative`.
   - `.save` pill (inline-block, 9.5px/800/.12em, `margin-bottom:13px`): bg `rgba(255,255,255,.84)`, border `rgba(201,118,29,.34)`, `color:#4f7d10`. Prototype values: "You save ₹398" / "You save ₹448" / "Biggest saving".
   - `.flag` (absolute `top:14px; right:14px`, 8.6px/800/.1em pill): teal `linear-gradient(135deg,#00706a,#004b46)`, `color:#f4fdf6`. Values: "Most popular", "Best value".
   - `.stack`: `flex; align-items:flex-end; gap:3px`. Per item (`.it`): art `.pimg` 66px (56px ≤760px) with `drop-shadow(0 5px 8px rgba(0,74,66,.13))` + 2-line caption 8.6px/600; placeholder `.tile` (dashed border 44×66px, icon) for missing art; `.plus` separators (9px, accent, `padding-bottom:30px`).
2. **`.body`** (`padding:15px 16px 18px`, flex column, `flex:1`): H3 Outfit 16px/700 uppercase (`line-height:1.1`); `.cnt` 10.5px/700/.12em paper-3 ("3 products"); `.inc` 12.4px paper-2 `line-height:1.55` ("Includes: …", `flex:1`); `.prow` price row (strong 25px Outfit 800 surface / `s` 13px paper-3 / `em` save pill 9.5px, bg `rgba(201,118,29,.14)`, border `.34`, `color:#4f7d10`); `.fine` 10.4px paper-3 ("Inclusive of all taxes · COD available"); `.btn` full-width ("Shop bundle" + arrow; **primary** on the highlighted combo, ghost otherwise).

## Data model — `combo` metaobject

| Field | Type | Notes |
|---|---|---|
| `name` | single_line_text_field | Card H3 |
| `description` | multi_line_text_field | `.inc` "Includes: …" copy |
| `items` | metaobject_reference (list of `combo_item`) | Tray stack, order preserved |
| `price` | number (decimal) | Deal price (₹) |
| `compare_at_price` | number (decimal) | Sum of product MRPs |
| `save_line` | single_line_text_field | `.save` pill text |
| `flag` | single_line_text_field | Optional `.flag` ("Most popular") |
| `highlight` | boolean | `.hero-combo` ring + primary CTA |
| `fine_print` | single_line_text_field | Default "Inclusive of all taxes · COD available" |
| `cta_label` | single_line_text_field | Default "Shop bundle" |
| `cta_link` | url | Where "Shop bundle" goes (bundle page / cart with products) |

`combo_item` metaobject: `product` (product reference) + `caption` (single_line_text_field, e.g. "Cuts grease instantly"). Item art renders from the product image, else `purelane-product-art` fallback; missing item → `.tile` placeholder.

**Savings are computed, never hardcoded:** save ₹ = `compare_at_price − price`; both from the metaobject (marketing sets them); no Liquid string literals.

### Seed combos (prototype values for seeding)

| Name | Items | Price/Compare | Save | Flag |
|---|---|---|---|---|
| Kitchen essentials | Kitchen, Dishwash, Tap | ₹499 / ₹897 | ₹398 | Most popular |
| Laundry care bundle | Laundry, Conditioner(tile), WM cleaner | ₹499 / ₹947 | ₹448 | — |
| Complete home bundle | Kitchen, Floor, Handwash | ₹799 / ₹1,495 | ₹696 | Best value (highlighted, primary CTA) |
| Bathroom deep clean | Toilet, Tap, Eraser | ₹499 / ₹897 | ₹398 | — |
| Hard water solution kit | Tap, Toilet | ₹349 / ₹598 | ₹249 | — |

## Schema settings

- `kicker` — "Pre-built to save you money"; `heading` — "Best selling combos"; `lede` (textarea)
- `show_swipe_cue` (checkbox, true); `swipe_cue_text` — "Swipe for more combos"
- `show_rail_note` (checkbox, true); `rail_note` (textarea)
- `card_width` (range 240–360, default 302; 268 on ≤760 via media rule)
- `save_currency_prefix` — "You save "; `save_label_suffix` — "" (allows "Biggest saving" style)
- `background_tint` (color, transparent); `padding_top/bottom`; `color_scheme`
- `combo_count_override` (range 1–8, default 0 = show all from `combos` metaobject list selection: `combos` (metaobject_reference list) — marketing curates which combos appear and their order)

## Behaviour

- Horizontal scroll-snap rail (touch swipe + trackpad + arrow keys via `tabindex="0"` rail and `keydown` arrows — production addition).
- Reveal: `.rv` on panel head and rail.
- Hover lift on cards; highlight card keeps ring.
- Reduced motion: no reveal transforms.

## Edge cases & a11y

- Combo with a deleted/unpublished product: item falls back to art placeholder; never a Liquid error or empty card.
- Zero combos: `empty_state_text` ("Add combos from the metafields section…") shown.
- **A11y:** rail is a region with `aria-label="Best selling combos"`; cards `<article>`; price row announced as a unit; CTA is a real link; hidden scrollbar still keyboard-scrollable (arrow keys); focus within rail doesn't trap.
- **Theme-editor resilience:** adding/removing a combo or item mid-session re-renders cleanly; animation observers unobserve after reveal.

## QA checkpoints (pixel)

Card 302px snap start; tray padding 14/14/13; art 66px + caption 8.6px + plus 9px alignment (`align-items:flex-end`); save/flag pill metrics; `.prow` baseline (25/13/9.5); `.fine` 10.4px; highlight ring `0 0 0 1px rgba(201,118,29,.24)`; rail negative margins bleed at 375/768/1440.
