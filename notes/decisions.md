# Part 2b — Locked decisions

All five decisions from the plan are locked. Overrides only via explicit sign-off in Part 1's spec review.

1. **Currency: INR (₹).** The prototype is INR throughout. Set the dev store to INR at creation so Liquid `money` filters render `₹` and pixel-accuracy holds. Fallback if INR is unavailable on the store: render currency-agnostic and flag the deviation in `notes/build-notes.md`.
2. **Review aggregates are merchant-editable settings, not data.** "4.8 / 8,000+ / 12 lakh+" has no native platform source without a reviews app. Expose rating, review-count and homes-copy as section settings with the prototype values as defaults. Individual review cards come from `review` metaobjects.
3. **Badges come from product tags.** `bestseller`, `toprated`, `new` tags drive pill badges via a tag → label mapping in the shop section schema. `custom.badge` metafield exists as a per-product override (data/metafields/product-badge.json). Marketing manages tags in Admin, zero developer help.
4. **Savings are computed, never hardcoded.** "You save ₹X" and %-off derive from `compare_at_price` vs `price` in Liquid. If a combo/bundle has no compare-at prices, the save row hides itself. No savings values in seed data — only `price` + `compare_at_price` on products.
5. **Add to Cart uses Dawn's native `product-form`** with real cart-adding behaviour. Never a dead button.

Status: all five locked (currency applied once the dev store exists).
