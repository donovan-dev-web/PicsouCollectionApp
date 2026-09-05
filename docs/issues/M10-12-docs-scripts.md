---
title: "[Docs] M10-12 Tokens + scripts gh M-10"
labels: [documentation, size/s]
milestone: "M-10 — Refonte UI/UX"
---

# Contexte

Tracer M-10 dans la doc + outiller la création GitHub (`gh`).

# Tâche

- `docs/design/M10-TOKENS.md` : tokens finaux (couleurs light/dark, typo, spacing, statuts inversés).
- `docs/08-USER-STORIES.md` : ajouter § US-UX-01..06.
- `docs/11-ROADMAP.md` + `docs/09-ISSUE.md` : insérer M-10 → v0.9.0 (M-09 → v1.0.0).
- `scripts/m10-create-milestone.sh` + `scripts/m10-create-issues.sh` (`gh milestone create`,
  `gh issue create --body-file docs/issues/M10-*.md`), exécutables.
- `CHANGELOG.md` : entrée `## [Unreleased] — M-10`.

# Critères de fin (DoD)

- [ ] `bash scripts/m10-create-issues.sh --dry-run` liste 12 issues sans erreur
- [ ] Doc et roadmap cohérentes (M-10 avant M-09)

# Tests

- Shellcheck / `bash -n` sur scripts.
