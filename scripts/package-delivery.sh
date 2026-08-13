#!/usr/bin/env bash
# =============================================================================
# package-delivery.sh — assemble the IP-protected, shareable delivery/ folder
# =============================================================================
# Every artifact that leaves this repo goes through this pipeline, so the
# protections are always baked in:
#
#   1. WATERMARK   — delivery/purelane-preview.html is a read-only copy of the
#                    design with a semi-transparent diagonal watermark across
#                    the whole page (copy/print/drag/download blocked in-browser)
#   2. RECORD      — delivery/purelane-demo.webm is a short demo video of the
#                    project working (recorded FROM the watermarked preview)
#   3. READ-ONLY   — the preview + this README explain how to host it and share
#                    a view-only link (no source is ever included)
#   4. BLUR        — delivery/ contains screenshots and docs only; the theme
#                    source (sections/, snippets/, assets/, data/) is excluded,
#                    and the summary PDF carries no exact figures
#   5. SUMMARISE   — delivery/Purelane_Strategy_Summary.pdf is a high-level
#                    strategy PDF with no code and no master file
#
# Usage:
#   ./scripts/package-delivery.sh          # build anything missing, refresh stamps
#   FORCE=1 ./scripts/package-delivery.sh  # rebuild preview + video + pdf too
# =============================================================================
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"
DELIVERY="$ROOT/delivery"
mkdir -p "$DELIVERY/screenshots" "$ROOT/preview"

echo "==> 1/5 Watermarked read-only preview"
if [ ! -f preview/purelane-preview.html ] || [ "${FORCE:-0}" = "1" ]; then
  node scripts/watermark.js --in purelane-homepage.html --out preview/purelane-preview.html
fi
cp preview/purelane-preview.html "$DELIVERY/purelane-preview.html"
echo "    copied -> delivery/purelane-preview.html"

echo "==> 2/5 Watermarked screenshots (JPEG for a small shareable package)"
if ls scripts/px-check/prototype/*.png >/dev/null 2>&1; then
  node scripts/watermark.js --stamp scripts/px-check/prototype/*.png --out-dir "$DELIVERY/screenshots" --jpg
else
  echo "    (no prototype captures found — run scripts/px-check/capture.js first, or skip)"
fi

echo "==> 3/5 Demo video (recorded from the watermarked preview)"
if [ ! -f "$DELIVERY/purelane-demo.webm" ] || [ "${FORCE:-0}" = "1" ]; then
  node scripts/px-check/record-demo.js
fi

echo "==> 4/5 High-level strategy PDF (no code, no exact figures)"
if [ ! -f "$DELIVERY/Purelane_Strategy_Summary.pdf" ] || [ "${FORCE:-0}" = "1" ]; then
  node scripts/make-pdf.js
fi

echo "==> 5/5 Share guide"
if [ ! -f "$DELIVERY/README.md" ]; then
  echo "    delivery/README.md already committed — keeping it"
fi

echo
echo "✔ Package ready in delivery/ — source code is NOT included:"
du -sh "$DELIVERY"/* | sort -k2
echo
echo "  Share: zip delivery/ or host delivery/purelane-preview.html and send the link."
echo "  See delivery/README.md for read-only-link instructions and limitations."
