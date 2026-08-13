# Performance baseline — stock Dawn

**Status:** prototype reference **recorded** (Part 4, `scripts/px-check/out/lh-prototype.json`); stock-Dawn baseline + final-build re-run **pending** a password-free local preview of the dev store (`shopify theme dev`).

## Command (identical for baseline and Part 4 re-check)

```
npx lighthouse http://localhost:9292 --preset=default --output=json --output-path=notes/lighthouse-baseline.json --chrome-flags="--headless"
```

Run against the **stock Dawn** homepage at `localhost:9292` before any section work. Dev store needs a password-free local preview for this to work.

## Targets for the final build

- LCP < 2.5s
- CLS < 0.1
- INP < 200ms
- TBT recorded (no hard target; report only)

## Prototype reference (Part 4 measurement, mobile profile — full JSON in `scripts/px-check/out/lh-prototype.json`)

| Metric | Prototype | Target |
|---|---|---|
| Performance score | 74 | ≥ 90 |
| **LCP** | **4.3 s** | < 2.5 s |
| CLS | 0 | < 0.1 |
| TBT | 0 ms | — |

LCP 4.3 s on a 328 KiB single file (inline SVG/base64 art, two style blocks, fixed animated scene layer) is the strongest argument for the Part 1 rebuild decisions.

## Baseline table (to fill once the store runs)

| Metric | Baseline (stock Dawn) | Final (Part 4) | Delta |
|---|---|---|---|
| LCP | TBD | | |
| CLS | TBD | | |
| INP | TBD | | |
| TBT | TBD | | |

Device / throttling profile and exact URL must be identical between runs. Record the profile here once captured.
