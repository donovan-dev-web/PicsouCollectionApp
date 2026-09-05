#!/usr/bin/env bash
# Crée les 12 issues M-10 via gh. Usage: bash scripts/m10-create-issues.sh [--dry-run]
set -euo pipefail
DRY_RUN="${1:-}"
MILESTONE="M-10 — Refonte UI/UX « Vault Lisible »"
declare -A ISSUES=(
  ["[UI] M10-01 Tokens + typo + contraste WCAG AA"]="docs/issues/M10-01-tokens-contraste.md enhancement,priority-high,epic/quality,size/m,to-do"
  ["[UI] M10-02 SafeZone globale"]="docs/issues/M10-02-safezone.md enhancement,priority-high,size/m,to-do"
  ["[UI] M10-03 TabBar à icônes + routes Stack"]="docs/issues/M10-03-tabbar-icones.md enhancement,priority-high,epic/accueil,size/m,to-do"
  ["[UX] M10-04 Accueil cockpit brocante"]="docs/issues/M10-04-accueil.md enhancement,epic/accueil,size/m,to-do"
  ["[UX] M10-05 Collection filtres + pagination + carte"]="docs/issues/M10-05-collection.md enhancement,epic/collection,size/m,to-do"
  ["[UX] M10-06 Fiche + Edit"]="docs/issues/M10-06-fiche.md enhancement,epic/collection,size/s,to-do"
  ["[UX] M10-07 Scan barcode + multiple + result"]="docs/issues/M10-07-scan-barcode-result.md enhancement,epic/identification,size/l,to-do"
  ["[UX] M10-08 Scan camera OCR + saisie manuelle"]="docs/issues/M10-08-scan-camera-manual.md enhancement,epic/identification,size/m,to-do"
  ["[UX] M10-09 Settings backup"]="docs/issues/M10-09-settings.md enhancement,epic/backup,size/s,to-do"
  ["[A11y] M10-10 Accessibilité + lisibilité"]="docs/issues/M10-10-a11y.md enhancement,priority-high,size/m,to-do"
  ["[UI] M10-11 Empty/Loading/Error + Toast"]="docs/issues/M10-11-etats.md enhancement,size/m,to-do"
  ["[Docs] M10-12 Tokens + scripts gh"]="docs/issues/M10-12-docs-scripts.md documentation,size/s,to-do"
)
for title in "${!ISSUES[@]}"; do
  # shellcheck disable=SC2086
  read -r body labels <<< "${ISSUES[$title]}"
  if [ "$DRY_RUN" = "--dry-run" ]; then
    echo "[dry-run] gh issue create --title \"$title\" --label \"$labels\" --milestone \"$MILESTONE\" --body-file $body"
  else
    gh issue create --title "$title" --label "$labels" --milestone "$MILESTONE" --body-file "$body"
  fi
done
