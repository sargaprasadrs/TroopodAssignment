# 05 — Reviews Rail Spec (`#reviews`)

Prototype reference: `purelane-homepage.html` lines 1000–1014 (HTML), 471–509 (CSS), V2 overrides at 752–753, 760 media block. Data model: `review` metaobject (plan.md Part 2d).

## Layout

- **`.revband`**: `padding: var(--sec-y) 0`.
- **Head `.revhead`**: flex centered, `gap:10px 18px`, wrap, `margin-bottom:14px`. Three items:
  1. `.kicker` — "That's what they said"
  2. `.agg` — stars `★★★★★` (`.st`, 12px, `letter-spacing:.16em`, `color:#7a9c1e`) + `<b>` Outfit 16px accent "4.8" + "from 8,000+ reviews" (11.5px/700/.14em uppercase paper-2)
  3. `.agg` — "Loved by " + `<b>12 lakh+</b>` + " homes"
- **Marquee `.revrail`**: `overflow:hidden; position:relative`, edge fade mask `linear-gradient(90deg, transparent, #000 7%, #000 93%, transparent)`. Inner `.revtrack`: `display:flex; gap:12px; width:max-content`, **`animation: marq 52s linear infinite`** (40s ≤760px), `translate3d(0→-50%)` for a seamless loop.

## Review card (`.glass-2.rcard`) — shared `purelane-review-card` snippet

`flex:0 0 auto; width:284px` (250px ≤760px), `padding:15px 17px` (13px 14px ≤760px), `border-radius:18px`.

1. `.st` — 5 stars, 10.5px, `letter-spacing:.2em`, `color:#7a9c1e`, `margin-bottom:9px`
2. `h5` — Outfit 12px/700 uppercase, `letter-spacing:.05em`, surface, `margin-bottom:7px`
3. `p` — 12.6px paper-2, `line-height:1.52`, `margin-bottom:11px` (quote)
4. `.who` — 9.5px/700/.12em uppercase paper-3: check SVG 12px accent-green (`#4f7d10`) + `<b>` name (surface; **`#01423b` in V2**) + `<span>· Product name</span>`

### Seed reviews (prototype values — 5 unique, looped ×2 for the marquee)

| Stars | Headline | Quote | Name | Product |
|---|---|---|---|---|
| 5 | Works like a charm | Finally an eco option that cleans as well as the chemical detergent I used for years, and it smells better. | Anita | Laundry detergent |
| 5 | Best dishwash ever | Our old dishwash left my help with dry, cracked skin. That stopped completely after we switched. | Priya | Dishwash gel |
| 5 | Great product, great packaging | Very soft on hands with a lovely fragrance, and it feels good to be using far less plastic. | Sunita | Liquid handwash |
| 5 | Dog friendly | We switched because chemical floor cleaners were setting off my dog's allergies. No reactions since. | Rohit S. | Floor cleaner |
| 5 | Sparkling taps again | Hard water had ruined our bathroom fittings. Two sprays and the scale wipes straight off, no scrubbing. | Verified buyer | Tap cleaner |

## Behaviour

- **Autoplay marquee** (CSS animation): pauses on `.revrail:hover` and `.revrail:focus-within`. **Reduced motion: static** — rail becomes an overflow-x scrollable row (production decision; keeps content reachable).
- Loop: `.revtrack` renders the card list **twice** for the seamless −50% translate. If fewer than ~4 reviews exist, duplicate again to fill the rail width (no broken loop).
- Reveal: `.rv` on head + rail.

## Data wiring

- **Aggregates are merchant-editable section settings** (no native source without a reviews app — flagged in build notes): `rating` (4.8), `review_count_label` ("from 8,000+ reviews"), `homes_label` ("Loved by " + `homes_value` "12 lakh+" + " homes"), `kicker` ("That's what they said"), `show_stars` (true).
- **Cards from `review` metaobjects** (`reviews` reference list in schema): `author` (single-line), `product_label` (single-line, e.g. "Laundry detergent" — not tied to a product ref so marketing can write any), `rating` (number 1–5, renders star count), `headline`, `quote`, `verified` (boolean → shows check icon; prototype shows the check on every card, defaults true).

## Schema settings

- `kicker` — "That's what they said"
- Aggregates: `show_aggregates` (true); `rating` (range 0–5 step .1, 4.8); `review_count_prefix` — "from "; `review_count_suffix` — "+ reviews"; `homes_prefix` — "Loved by "; `homes_value` — "12 lakh+"; `homes_suffix` — " homes"
- `reviews` (metaobject_reference list); `speed` (range 20–90s, default 52; 40 ≤760px auto)
- `pause_on_hover` (checkbox, true); `edge_fade` (checkbox, true)
- `card_width` (range 240–320, default 284; 250 ≤760px)
- `background_tint` (color, transparent); `padding_top/bottom`; `color_scheme`

## Edge cases & a11y

- **Fewer than 2 reviews:** rail renders once, animation disabled (no visible jump).
- Zero reviews: `empty_state_text` ("Reviews will appear here…").
- **A11y:** rail region `aria-label="Customer reviews"`; cards `<article>`; `aria-hidden="true"` on the duplicated (second) card set so screen readers don't double-announce; **autoplay pause on focus-within is mandatory** (keyboard users must be able to read mid-scroll); no `tabindex` trap; stars announced as "Rated 5 out of 5" via `aria-label`.
- **Theme-editor:** adding/removing reviews re-renders the track and restarts the animation cleanly; speed setting changes take effect without rebuild.

## QA checkpoints (pixel)

Card 284×auto, radius 18, padding 15/17; mask fade edges (7%); gap 12; seamless loop (no jump at wrap, verify with a frame capture at t0 vs t1 cycle); head gap 10/18 wrap; star colour `#7a9c1e`; name `#01423b`; pause-on-hover behaviour; 250px card at ≤760px with 40s speed.
