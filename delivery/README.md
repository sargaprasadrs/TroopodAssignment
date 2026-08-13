# Purelane — Shareable Delivery Package (IP-protected)

Everything in this folder is **safe to share**. The theme source code is not
here, exact business figures are not in the documents, and every visual carries
a watermark.

| File | What it is | Protection |
|---|---|---|
| `purelane-preview.html` | Read-only, watermarked copy of the design — the thing you link to | Diagonal watermark across the whole page; copy / cut / right-click / drag / print / save blocked in-browser |
| `purelane-demo.webm` | Short demo video of the project working | Recorded **from the watermarked preview**, so the watermark is in the video itself |
| `Purelane_Strategy_Summary.pdf` | High-level strategy & steps | No code, no master file, no exact figures |
| `screenshots/*.png` | Watermarked captures at 375 / 768 / 1024 / 1440 | Diagonal watermark + corner badge on every image |
| `README.md` | This guide | — |

**Not included (by design):** `sections/`, `snippets/`, `assets/`, `data/`,
store credentials, and the master design file. Those stay in the private repo.

---

## How to share a read-only link

1. Host `purelane-preview.html` on any static host — **Netlify Drop**
   (drag-and-drop, free), **GitHub Pages**, Cloudflare Pages, or a simple
   `python -m http.server` on a server you control.
2. Send the resulting URL (e.g. `https://your-name.netlify.app/purelane-preview.html`).
3. Optionally password-protect it (Netlify: site settings → access control)
   so only the intended reviewer can open it.

The page itself blocks the casual ways to copy content:

- **Copying** — text selection, Ctrl/Cmd+C, copy/cut events, and right-click are disabled.
- **Printing** — the print stylesheet replaces the page with the watermark notice.
- **Downloading** — the design is a single self-contained HTML file with no
  external assets; images are inline and drag/save is blocked; there is no
  downloadable source bundle behind the link.

## Honest limitations

- **Nothing in plain HTML is true DRM.** A determined person can always
  screenshot the screen, use browser devtools, or disable JavaScript. The
  protections are *deterrence*, not encryption. What genuinely protects the
  work is that **the source is never shared** — the link only shows a rendered
  page.
- The demo video and screenshots are watermarked so that even if they are
  re-shared, the origin is visible.

## Redacting exact numbers

The preview keeps the design fully visible so reviewers can evaluate it. If you
want a *redacted* preview (prices/ratings blurred), rebuild it with:

```bash
node scripts/watermark.js --in purelane-homepage.html \
  --out preview/purelane-preview.html \
  --blur ".pr, .sp, s, .price"
```

then re-run `scripts/package-delivery.sh`.

---

*Confidential — for review only. © Purelane prototype build. Do not redistribute.*
