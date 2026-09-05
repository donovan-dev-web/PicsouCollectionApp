#!/usr/bin/env bash
# Crée le milestone M-10 via gh. Usage: bash scripts/m10-create-milestone.sh [--dry-run]
set -euo pipefail
DRY_RUN="${1:-}"
TITLE="M-10 — Refonte UI/UX « Vault Lisible »"
DESC="Amélioration UI/UX avant publication (v0.9.0) : SafeZone, contraste WCAG AA, TabBar à icônes Expo Vector Icons, sémantique Possédé=vert, parcours brocante <3s. Docs : docs/issues/M10-MILESTONE.md."
if [ "$DRY_RUN" = "--dry-run" ]; then
  echo "[dry-run] gh milestone create \"$TITLE\" -d \"$DESC\""
  exit 0
fi
gh milestone create "$TITLE" -d "$DESC"
