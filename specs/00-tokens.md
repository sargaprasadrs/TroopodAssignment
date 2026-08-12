# 00 — Shared Design Tokens & Components (Purelane)

Source of truth: `purelane-homepage.html`. **Target is VERSION 2 (light)** — the file's second `<style>` block (lines 641–760) overrides the dark V1 palette and is what actually renders. Do not build the dark theme.

## Fonts

| Role | Family | Weight | Notes |
|---|---|---|---|
| Display (headings, prices, big numbers) | **Outfit** | 700/800 | `text-transform: uppercase`, `letter-spacing: -0.018em` |
| Body / UI | **Inter** | 400–800 | `-webkit-font-smoothing: antialiased`, `line-height: 1.62` |

Load both via Shopify font settings (`font_picker` in `settings_schema.json`); defaults Outfit + Inter.

## Colour tokens (V2 — final rendered values)

| Token | Value | Used for |
|---|---|---|
| `--ink` | `#f4f0fb` | Page background (pale mint) |
| `--deep` | `#e2daf3` | Deeper tint |
| `--brand` | `#4b3a8f` | Primary brand ink (teal-purple) |
| `--brand-lt` | `#6b55b8` | Brand light |
| `--paper` | `#241a3d` | Body text |
| `--paper-2` | `rgba(36,26,61,.78)` | Secondary text |
| `--paper-3` | `rgba(36,26,61,.56)` | Tertiary / fine print |
| `--accent` | `#b8701c` | Accent (amber-brown, light-ground version) |
| `--accent-2` | `#c9761d` | Accent dark |
| `--surface` | `#17102b` | Headings / strong prices |
| `--g-bg` | `linear-gradient(158deg, rgba(255,255,255,.80), rgba(236,230,247,.56) 58%, rgba(222,212,240,.50))` | Glass card fill |
| `--g-line` | `rgba(75,58,143,.16)` | Glass border |
| `--g-shadow` | `0 22px 54px rgba(58,44,112,.13)` | Glass shadow |
| `--g-inset` | `inset 0 1px 0 rgba(255,255,255,.92)` | Glass highlight |
| accent-green | `#4f7d10` | Icons, pill text, check marks, small accents |
| star/lime | `#7a9c1e` | Review stars, `.st` |
| teal fill | `linear-gradient(135deg,#00706a,#004b46)` | Primary button, combo flag |
| teal ink | `#01423b` | Ghost button text, `.rcard .who b` |
| on-teal | `#f4fdf6` | Text on teal fill |

Note: `--accent` differs from V1 (`#f0a03c`); the `.lime` class = `var(--accent)`.

## Spacing & geometry

| Token | Value |
|---|---|
| `--r` (card radius) | 26px |
| `--r-sm` | 16px |
| `--maxw` | 1180px |
| `--sec-y` (section rhythm) | 34px; **22px ≤760px** |
| `--ease` | `cubic-bezier(.2,.7,.2,1)` |
| `.wrap` | `max-width:1180px; margin:0 auto; padding:0 18px` |
| `.sec` | `position:relative; padding: var(--sec-y) 0` |

## Type scale

| Class | Size |
|---|---|
| `.d1` | `clamp(48px, 8.6vw, 112px)`; **≤760px: `clamp(44px,13.5vw,64px)`**; `line-height:.87` |
| `.d2` | `clamp(30px, 4.6vw, 54px)`; `line-height:.94` |
| `.d3` | `clamp(21px, 2.5vw, 30px)`; `weight 700` |
| `.d4` | `clamp(16px, 1.6vw, 19px)`; `weight 700` |
| `.lede` | `clamp(15px, 1.35vw, 17.5px)`; `color: var(--paper-2)`; `max-width:44ch` |
| `.body-s` | `14.5px`; `color: var(--paper-2)`; `line-height:1.66` |
| `.kicker` | `11px`; `weight 700`; `letter-spacing:.22em`; uppercase; `var(--paper-3)` |

## Glass & buttons (V2)

- **`.glass`** — `background:var(--g-bg)`; `backdrop-filter:blur(24px) saturate(150%)` (16px/140% ≤760px); `border:1px solid var(--g-line)`; `border-radius:var(--r)`; `box-shadow:var(--g-shadow),var(--g-inset)`; `position:relative; overflow:hidden`; `::after` sheen `linear-gradient(115deg,rgba(255,255,255,.55),transparent 32%,transparent 74%,rgba(201,118,29,.06))`.
- **`.glass-2`** — `background:linear-gradient(158deg,rgba(255,255,255,.66),rgba(236,230,247,.44))`; `blur(18px) saturate(135%)` (12px/130% ≤760px); `border:1px solid rgba(75,58,143,.13)`; `radius:var(--r)`; `box-shadow:0 16px 38px rgba(58,44,112,.10), inset 0 1px 0 rgba(255,255,255,.86)`.
- **`.btn`** — inline-flex, `gap:10px`, `height:46px`, `padding:0 22px`, `border-radius:999px`, `font-size:12.5px`, `weight 700`, `letter-spacing:.13em`, uppercase, `transition:.35s var(--ease)`, `white-space:nowrap`; `svg` 15px.
- **`.btn-primary`** — teal fill `linear-gradient(135deg,#00706a,#004b46)`, `color:#f4fdf6`, `box-shadow:0 12px 26px rgba(0,80,74,.26), inset 0 1px 0 rgba(255,255,255,.22)`; hover `translateY(-2px)` + deeper shadow.
- **`.btn-ghost`** — `background:rgba(255,255,255,.66)`, `border:1px solid rgba(75,58,143,.22)`, `color:#01423b`, `backdrop-filter:blur(12px)`; hover bg `.9`.
- **`.btn-sm`** — `height:38px; padding:0 18px; font-size:11px; letter-spacing:.14em`.

## Reveal-on-scroll (`.rv`)

`opacity:0; transform:translateY(30px); filter:blur(7px); transition:.95s var(--ease)` → `.in` resets. Stagger: `.rv-d1` .09s … `.rv-d5` .45s (0.09s steps). Driven by IntersectionObserver (`rootMargin: 0 0 -12% 0`, `threshold: .12`, unobserve after reveal). **Reduced motion: elements render visible instantly (no transform/blur).**

## Page background ("scenes") — rebuild decision

Prototype: fixed full-viewport layer of 4 pale-mint gradients (`#eee7fb` base; `.s1` `linear-gradient(178deg,#fbfffb,#eafaec 24%,#d6f1dc 54%,#bfe8ca 100%)` … `.s4` deeper) crossfaded by scroll position over `[data-scene]` zones, plus animated water layers, bubbles, vignette.

**Production approach (flagged deviation, documented in build notes):** replace the scroll-jacked crossfade with a single fixed gradient background (`s1` values) set at theme level; each section exposes a `background_tint` colour setting (default transparent → inherits page bg). Remove mousemove parallax + water-layer animations for LCP/CWV; keep the design's calm mint ground. `prefers-reduced-motion` respected throughout.

## Product art

All product "art" is inline SVG / base64 bottle illustrations (`.pimg` with `background-image` per product: `--p-tap`, `--p-kitchen`, `--p-metal`, `--p-wm`, `--p-dish`, `--p-floor`, `--p-handwash`, `--p-laundry`, `--p-toilet`, `--p-eraser`, `--p-combo2`, long bottles `--p-kbtl`, `--p-tbtl`, `--p-mbtl`). Each has a set `aspect-ratio`; sizing is **height-driven** (`.pimg{background-position:center bottom; background-size:contain}`).

**Production approach:** real product images are the default source. The SVG art set ships in `snippets/purelane-product-art.liquid` as a **fallback for products without images** and as an optional merchant pick ("use art" instead of photo). See `snippets/purelane-product-art.liquid` spec notes in Part 3.

## Focus & a11y baseline

`a,button,:focus-visible{outline:2px solid var(--accent); outline-offset:3px; border-radius:6px}`. All interactive elements keyboard-operable; carousels/rails pause on focus; `prefers-reduced-motion` disables animation.
