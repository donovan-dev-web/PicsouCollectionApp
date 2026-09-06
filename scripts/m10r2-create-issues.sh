#!/usr/bin/env bash
# Crée les 8 issues M-10R2 via gh. Usage: bash scripts/m10r2-create-issues.sh [--dry-run]
set -euo pipefail
DRY_RUN="${1:-}"
MILESTONE="M-10R2 — 2ᵉ passe retours test physique (v0.9.2)"
declare -A ISSUES=(
  ["[Bug] M10R2-01 Drawer latéral : pas de SafeZone (en-tête sous l'encoche)"]="docs/issues/M10R2-01-drawer-safezone.md bug,priority-high,size/s,to-do"
  ["[UX] M10R2-02 Permission caméra : demandée au 1er lancement + écran partagé SafeZone"]="docs/issues/M10R2-02-camera-permission.md enhancement,priority-high,epic/identification,size/m,to-do"
  ["[Bug] M10R2-03 Popup « Couverture reconnue » : espacement des boutons"]="docs/issues/M10R2-03-result-popup-spacing.md bug,priority-high,epic/identification,size/s,to-do"
  ["[UX] M10R2-04 Formulaire : bouton Enregistrer accessible sans scroll (icône header)"]="docs/issues/M10R2-04-form-submit-header.md enhancement,priority-high,epic/collection,size/s,to-do"
  ["[UX] M10R2-05 Premier lancement : écran de présentation (onboarding) + permission caméra"]="docs/issues/M10R2-05-first-launch-onboarding.md enhancement,priority-high,size/l,to-do"
  ["[UX] M10R2-06 Paramètres : refonte en sous-menus (Apparence, Sauvegarde, Accessibilité, Retour)"]="docs/issues/M10R2-06-settings-submenus.md enhancement,priority-medium,size/l,to-do"
  ["[Nav] M10R2-07 Fiche magazine : header menu/titre/scan (app-header)"]="docs/issues/M10R2-07-detail-header.md enhancement,priority-high,epic/collection,size/s,to-do"
  ["[UX] M10R2-08 Collection : bouton Tri (numéros croissant/décroissant)"]="docs/issues/M10R2-08-collection-sort.md enhancement,priority-medium,epic/collection,size/m,to-do"
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