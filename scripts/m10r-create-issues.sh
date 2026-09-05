#!/usr/bin/env bash
# Crée les 11 issues M-10R via gh. Usage: bash scripts/m10r-create-issues.sh [--dry-run]
set -euo pipefail
DRY_RUN="${1:-}"
MILESTONE="M-10R — Retours test physique (v0.9.1)"
declare -A ISSUES=(
  ["[Bug] M10R-01 Import CSV : le sélecteur bloque les fichiers .csv"]="docs/issues/M10R-01-import-csv.md bug,priority-high,epic/backup,size/s,to-do"
  ["[UX] M10R-02 Accueil : CTA Scanner/Ajouter au-dessus des récents"]="docs/issues/M10R-02-accueil-cta.md enhancement,epic/accueil,size/s,to-do"
  ["[Nav] M10R-03 Tabs : Accueil | Scan | Collection"]="docs/issues/M10R-03-tabs.md enhancement,priority-high,epic/accueil,size/m,to-do"
  ["[Nav] M10R-04 Menu latéral (drawer) permanent + liens directs"]="docs/issues/M10R-04-drawer.md enhancement,priority-high,size/m,to-do"
  ["[Nav] M10R-05 Drawer : section éditions dynamique repliable"]="docs/issues/M10R-05-drawer-editions.md enhancement,epic/collection,size/m,to-do"
  ["[Bug] M10R-06 Formulaire : champs Mois/Année non scrollables"]="docs/issues/M10R-06-form-scroll.md bug,epic/collection,size/s,to-do"
  ["[UX] M10R-07 Formulaire : spacer clavier pour atteindre Notes"]="docs/issues/M10R-07-form-keyboard.md enhancement,epic/collection,size/s,to-do"
  ["[UX] M10R-08 Torche caméra (OCR + code-barres)"]="docs/issues/M10R-08-torch.md enhancement,epic/identification,size/s,to-do"
  ["[UX] M10R-09 OCR texte stylisé : guidage + replis visibles"]="docs/issues/M10R-09-ocr-guidance.md enhancement,epic/identification,size/m,to-do"
  ["[UX] M10R-10 Bouton flottant scan global (hors écrans scan)"]="docs/issues/M10R-10-scan-fab.md enhancement,priority-high,size/m,to-do"
  ["[Bug] M10R-11 OCR : bouton code-barres masqué par la gesture bar"]="docs/issues/M10R-11-ocr-safezone.md bug,priority-high,epic/identification,size/s,to-do"
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
