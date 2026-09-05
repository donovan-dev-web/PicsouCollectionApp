#!/usr/bin/env bash
# Crée le milestone M-10R via gh. Usage: bash scripts/m10r-create-milestone.sh [--dry-run]
set -euo pipefail
DRY_RUN="${1:-}"
TITLE="M-10R — Retours test physique (v0.9.1)"
DESC="Correctifs après test physique du build preview M-10 (PR #152) : import CSV, CTA sans scroll, tabs Accueil/Scan/Collection + drawer, formulaire au clavier, torche/guidage OCR, FAB scan, safezone OCR. Spec : docs/issues/M10R-MILESTONE.md."
if [ "$DRY_RUN" = "--dry-run" ]; then
  echo "[dry-run] gh milestone create \"$TITLE\" -d \"$DESC\""
  exit 0
fi
gh api repos/donovan-dev-web/PicsouCollectionApp/milestones -f title="$TITLE" -f description="$DESC"
