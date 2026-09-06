#!/usr/bin/env bash
# Crée le milestone M-10R2 via gh. Usage: bash scripts/m10r2-create-milestone.sh [--dry-run]
set -euo pipefail
DRY_RUN="${1:-}"
TITLE="M-10R2 — 2ᵉ passe retours test physique (v0.9.2)"
DESC="Correctifs après test physique du build v0.9.2 (reprise M-10R) : SafeZone drawer, permission caméra + onboarding 1er lancement, popup Couverture reconnue, formulaire valider header, paramètres en sous-menus, header fiche magazine, tri collection. Spec : docs/issues/M10R2-MILESTONE.md."
if [ "$DRY_RUN" = "--dry-run" ]; then
  echo "[dry-run] gh milestone create \"$TITLE\" -d \"$DESC\""
  exit 0
fi
gh api repos/donovan-dev-web/PicsouCollectionApp/milestones -f title="$TITLE" -f description="$DESC"