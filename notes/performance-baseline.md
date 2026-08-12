# Performance baseline — stock Dawn

**Status:** pending dev store + `shopify theme dev`.

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

## Baseline (to fill once the store runs)

| Metric | Baseline (stock Dawn) | Final (Part 4) | Delta |
|---|---|---|---|
| LCP | TBD | | |
| CLS | TBD | | |
| INP | TBD | | |
| TBT | TBD | | |

Device / throttling profile and exact URL must be identical between runs. Record the profile here once captured.
