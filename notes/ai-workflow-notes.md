# AI workflow notes — what we delegated, where it failed, what to systematise

Honest account of how the AI agents were used on this build and what we'd change for the next twenty.

---

## What we delegated (and how)

| Step | Delegated to | Prompt/mechanism | Outcome |
|---|---|---|---|
| Recon | Bash + grep/sed agents | Map file structure, extract each section's HTML/CSS/JS by line range | Accurate inventory (tokens, sections, media queries, both style blocks) |
| Spec authoring | Spec-writing model (this session) | Write `specs/*.md` from the extracted source, settings-first | 456 lines of specs; every setting named with a prototype default |
| QA harness | Code-writing agent | Puppeteer-core + installed Chrome; axe-core; contrast script | One-command pixel/axe/contrast/perf toolkit (`scripts/px-check/`) |
| Browser interaction | Browser-use agent (Chrome DevTools) | Tab-walk, focus checks, heading map, landmarks, console | Found the h1→h5 skip and confirmed dots are focusable |
| Verification | Bash agents | Grep spot-checks of every transcribed value | Caught entity-encoded ₹ and `<br>`-split H1 before they leaked into specs |

## Where it failed (and how we caught it)

1. **Agent timeouts on heavy work.** The first pixel-capture runs timed out at the 30 s default (Chrome launch + 4 viewport loads + full-page screenshots ≈ 2–4 min). Fix: know your agent's runtime budget and set `timeout_seconds` explicitly. Two wasted runs before this was clear.
2. **Tool-call truncation.** A large `str_replace` payload got truncated and failed twice. Fix: split edits into smaller, independent calls. The error was loud and recoverable, but it cost a round-trip.
3. **Param-nesting mistake.** Spawning a basher with `params.params` (nested) rejected the whole call. Fix: match the agent's schema exactly — cheap, but it halts the pipeline.
4. **Literal-string false negatives in verification.** Grepping for "Clean That Lasts" and "You save ₹398" returned nothing because the source uses `<br>` splits and `&#8377;` entities. The rendered text was right; the check was wrong. Lesson: verify *rendered* output (browser), not source literals.
5. **Speculative data in a script.** My first contrast matrix included a pair (accent-on-teal) that isn't actually used in the design — a guess, not evidence. Caught during review. Lesson: scripts must only test real token combinations from the audit.
6. **Parallel writers collided on shared state.** Parts 3 and 4 ran in different sessions on the same repo. We kept them clean by making commits **file-scoped** (Part 4 committed only its own paths; Part 3's in-flight files were left unstaged). It worked, but only because we agreed the rule up front.

## What we'd systematise for twenty more of these

1. **The spec template** (`specs/*.md`: layout → anatomy → behaviour → schema settings with defaults → breakpoints → edge cases → QA checkpoints). The single highest-leverage artifact: agents build from it, QA verifies against it, and the notes section writes itself.
2. **The one-command QA harness** (`scripts/px-check/`). `PX_URL=<store> node capture.js`, `node axe.js`, `python contrast.py` — identical commands every project. Add a `pixelmatch` diff step next time.
3. **The metaobject recipe** (`data/`): definitions as JSON in-repo, applied via Admin — same for every DTC brand.
4. **Reduced-motion emulation for all pixel captures** — deterministic frames, no mid-animation flakiness.
5. **Commit-per-part discipline with file-scoped staging** — parallel agents can't collide, and the assignment's "clean commit history" stays intact.
6. **Baseline-before-you-build** — capture stock-Dawn Lighthouse *before* writing any section (still pending dev store here; the command is documented and ready).
