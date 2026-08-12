# 01 — Hero Section Spec (`section.hero`)

Prototype reference: `purelane-homepage.html` lines 945–1000 (HTML), 207–250 (CSS), 328–430 (stage CSS), hero JS in 1567–1715. Target palette: V2 light (see `00-tokens.md`).

## Layout

Desktop (≥901px): full-viewport-height stage (`min-height:100svh`), content bottom-aligned (`align-items:flex-end`, `padding:150px 0 var(--sec-y)`). Three layers inside `.hero-grid` (max-width 1180, padding 0 18px):

1. **Left column (`.hero-copy`, max-width 600px; 470px ≤1200px):** H1 → rule divider → lede → CTA row → mobile badge strip.
2. **Right product stage (`.hero-prod`):** absolutely positioned `right:2%; bottom:28px; width:min(50vw,560px)` (≤1200px: `min(44vw,440px); right:3%`).
3. **Right-edge trust badges (`.badges`, ≥901px only):** vertical rail `right:18px; top:50%; translateY(-50%); width:96px`.

**≤900px:** stage becomes in-flow below the copy (`position:relative; width:min(88vw,420px); margin:20px auto 0`; ≤420px: `min(92vw,360px)`), hero `padding-top:132px` (118px ≤760px), `.badges` hidden, `.badgestrip` shown.

**Background wash (`.hero::before`):** desktop `linear-gradient(102deg, rgba(255,255,255,.80), rgba(255,255,255,.50) 30%, rgba(255,255,255,.12) 54%, transparent 68%)`; ≤900px vertical `rgba(255,255,255,.62)/.34/.66` version.

## Anatomy (copy)

- **H1** `.d1`: "Clean That Lasts" with "Lasts" wrapped in `.lime` (accent). Break after "That" (`Clean<br>That<br><span class="lime">Lasts</span>`).
- **Rule** `.rule` (max-width 270px, gap 13px, margin 0 0 20px): hairline `linear-gradient(90deg, rgba(75,58,143,.34), transparent)` + leaf SVG (16px, accent) + hairline.
- **Lede** `.lede`: "Homecare that works on the toughest grime, made from plants. Kind to your home, your family and the world outside it."
- **CTA row** `.hero-cta` (gap 11px, margin-top 26px): `.btn-primary` "Shop now" + arrow SVG (anchor `#shop`); `.btn-ghost` "How it works" (anchor `#how`).
- **Trust badges (desktop rail):** 3 × `.badge` (icon in 38px circle + 2-line label, 8.5px/700/.11em uppercase): "Plant powered", "Safe for kids & pets", "Zero harsh chemicals". Dividers between badges.
- **Badge strip (≤900px):** 3 × `.glass-2` tiles (icon 18px accent-green + 8.5px label): "Plant powered", "Kids & pet safe", "Zero harsh chem". Margin-top 24px; ≤420px font 8px.

## Product stage (`.hstage`)

- Height `clamp(380px, 74svh, 680px)` (≤900px: `clamp(300px,44svh,430px)`), 3 slides absolutely stacked, `.on` fades in (`.85s var(--ease)`).
- **Slide 1 (1 bottle):** art 100% height.
- **Slide 2 (2 bottles):** back bottle 80% (`margin-right:-8%`), front 97%.
- **Slide 3 (3 bottles):** heights 75/97/79%, negative margins ±8% for a tight grouped stack, staggered enter delays `.06/.30/.54s` per art item.
- Each slide: product art (height-driven, `background-size:contain`, `drop-shadow(0 14px 22px rgba(0,74,66,.15))`) + **price tag** `.ptag` (`glass-2`, radius 16px, `padding:11px 14px 12px`, `max-width:52%`; ≤900px: `padding:9px 12px 10px`, radius 14px, `max-width:58%`) positioned `left:0; bottom:2%`:
  - `.lbl` (9px, 800, .17em, accent): slide label
  - `.val`: strong 23px Outfit surface (20px ≤900px) + `s` 12px paper-3
  - `.cut` pill (8.4px, accent-green on `rgba(201,118,29,.16)` bg, border `rgba(201,118,29,.36)`): offer line
- **Dots `.hdots`** under the stage (gap 7px, margin-top 8px): 6px circles `rgba(75,58,143,.22)`; active = 20px pill `#b8701c`. Keyboard-operable buttons with `aria-label` ("Show 1 product" / "Show 2 products" / "Show 3 products").

### Default slide data (prototype values)

| # | Label | Price | Compare-at | Offer line |
|---|---|---|---|---|
| 1 | Single bottle | ₹200 | ₹299 | 33% off |
| 2 | Any 2 products | ₹349 | ₹598 | Save ₹249 |
| 3 | Any 3 products | ₹499 | ₹897 | Save ₹398 |

## Behaviour

- **Autoplay:** advance every **3800ms**; pause on `mouseenter`/`mouseleave` of the stage and when the stage scrolls out of view (IntersectionObserver threshold .2). Dots: click → jump, restart timer. **Reduced motion: no autoplay**, slides static (still dot-switchable).
- **Parallax (desktop ≥1024px, motion OK):** hero product translates `translate3d(mx*-16px, -f*54px + my*-10px, 0) scale(1 - f*.06)` where `f = min(scrollY/700, 1)`; opacity fades to `1 - f*.55`; `mx/my` from mousemove normalized ±1. **Rebuild decision:** keep a subtle scroll fade+rise only (mousemove parallax is a CWV/a11y risk — flag in build notes, ship reduced-motion-safe).
- **Reveal:** H1 `.rv.in`, rule `.rv-d1`, lede `.rv-d2`, CTAs `.rv-d3`, badge strip `.rv-d4`.

## Data wiring (Liquid)

- Copy strings → section settings (defaults above).
- **Slide content:** schema `blocks` (limit 3) — each slide: label text, offer line, **image picker or product picker**. Price/compare-at: settings (money) defaulting to the picked product's `price` / `compare_at_price` when a product is chosen; art-mode slides use explicit values. Real product images preferred; `purelane-product-art` used as fallback when no image.
- Slide prices render via `money` filter (store currency INR → ₹).

## Schema settings (all merchant-editable; prototype values as defaults)

- `heading` (text) — "Clean That Lasts"; `heading_accent` (text) — "Lasts"
- `lede` (textarea) — prototype lede
- `primary_cta_label` — "Shop now"; `primary_cta_link` — `#shop`
- `secondary_cta_label` — "How it works"; `secondary_cta_link` — `#how`
- `show_trust_badges` (checkbox, true) + badge 1–3: label, sub-label, icon choice (3 built-in icons)
- `show_badge_strip` (checkbox, true) + strip tile 1–3: label, icon
- `show_autoplay` (checkbox, true; ignored when reduced-motion)
- `autoplay_interval` (range 2000–8000, default 3800)
- `enable_scroll_fade` (checkbox, true)
- `background_tint` (color, transparent) — see `00-tokens.md` scenes note
- **Blocks (limit 3):** `slide` — label, offer_line, `image` (image_picker), `product` (product), `price` (money, empty = from product), `compare_at_price` (money, empty = from product)
- Global section settings: `padding_top/bottom`, `color_scheme` (Dawn standard), heading/section font overrides (or theme-level font_picker)

## Breakpoints

| Width | Change |
|---|---|
| ≤1200px | copy max-width 470px; stage `min(44vw,440px)` right 3% |
| ≤900px | stage in-flow, badges → badge strip, hero padding-top 132px, stage `clamp(300px,44svh,430px)`, ptag max-width 58% |
| ≤760px | hero padding-top 118px, d1 `clamp(44px,13.5vw,64px)`, ptag val strong 20px |
| ≤420px | stage `min(92vw,360px)`, strip 8px |

## Edge cases & a11y

- **Slide with no product + no image:** falls back to `purelane-product-art` for that art slot; never an empty stage.
- Sold-out product: tag shows but "Shop now" still links to product (stage is brand-level, not cart-level).
- **A11y:** stage is decorative visual — expose the active slide's label + price in a visually-hidden `aria-live` region; dots = real buttons (`aria-label`, active state); slides `role="img"` with `aria-label` matching the art; no tab stops on decorative art.
- Reduced motion: instant reveal, no autoplay, no scroll fade transform (fade via opacity only).

## QA checkpoints (pixel)

H1 clamp type at 375/768/1024/1440; badge rail right-edge vertical centering ≥901px; stage bottle stack overlap (±8%) matches; ptag metrics (padding, radius, max-width) at 900/420; dots pill expansion; gradient wash direction flip at 900px.
