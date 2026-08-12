#!/usr/bin/env bash
# =============================================================================
# deploy-theme.sh — assemble + push + publish the Purelane theme to a dev store
# =============================================================================
# This repo contains only the CUSTOM parts of a Shopify theme (sections,
# snippets, assets, homepage template). A Shopify theme also needs Dawn's
# stock files (layout/, config/, locales/, templates/*.json, etc.) before it
# can be uploaded. This script:
#
#   1. pulls stock Dawn via `shopify theme init`
#   2. overlays our Purelane sections / snippets / assets / index.json
#   3. pushes the result as a NEW unpublished theme named "Purelane Dawn"
#   4. publishes it as the store's live theme
#
# Usage:
#   ./scripts/deploy-theme.sh                # uses STORE or prompts
#   STORE=purelane-dev-rzcwvlkv ./scripts/deploy-theme.sh
#
# Requirements:
#   - Shopify CLI installed & authenticated (shopify login)
#   - bash, git
# =============================================================================
set -euo pipefail

STORE="${STORE:-}"
THEME_NAME="${THEME_NAME:-Purelane Dawn}"
BUILD_DIR="$(mktemp -d)"
REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

trap 'rm -rf "$BUILD_DIR"' EXIT

if [ -z "$STORE" ]; then
  read -r -p "Store (e.g. purelane-dev-rzcwvlkv): " STORE
fi

echo "==> 1/3 Assembling stock Dawn + Purelane custom files"
(
  cd "$BUILD_DIR"
  shopify theme init dawn-base >/dev/null 2>&1
  cp "$REPO_ROOT"/sections/purelane-*.liquid dawn-base/sections/
  cp "$REPO_ROOT"/snippets/purelane-*.liquid dawn-base/snippets/
  cp "$REPO_ROOT"/assets/purelane.css "$REPO_ROOT"/assets/purelane.js dawn-base/assets/
  cp "$REPO_ROOT"/templates/index.json dawn-base/templates/index.json
)

echo "==> 2/3 Pushing to '$THEME_NAME' on $STORE"
cd "$BUILD_DIR/dawn-base"
shopify theme push --unpublished --theme "$THEME_NAME" --store "$STORE"

echo "==> 3/3 Publishing as live theme"
THEME_ID="$(shopify theme list --store "$STORE" --json | node -e "
  let d=''; process.stdin.on('data',c=>d+=c).on('end',()=>{
    const t=JSON.parse(d).find(t=>t.name===process.argv[1]&&t.role!=='development');
    if(!t){console.error('theme not found');process.exit(1)}
    console.log(t.id)
  })" "$THEME_NAME")"
shopify theme publish -t "$THEME_ID" --store "$STORE" -f

echo
echo "✔ Deployed. Live at https://$STORE.myshopify.com"
