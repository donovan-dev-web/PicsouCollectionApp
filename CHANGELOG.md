# Changelog

> Toutes les changements notables de Picsou Collection sont documentés ici.
>
> Format basé sur [Keep a Changelog](https://keepachangelog.com/fr/1.0.0/).
> Versionnage selon [Semantic Versioning](https://semver.org/lang/fr/).

---

## [Unreleased]

### Added
- Documentation technique complète (`docs/`)
- User stories et workflow agile (`docs/08-USER-STORIES.md`, `docs/09-ISSUE.md`)
- CI/CD avec GitHub Actions (`docs/10-CI-CD.md`)
- Roadmap par phases (`docs/11-ROADMAP.md`)
- CONTRIBUTING.md, SECURITY.md, CHANGELOG.md

### Changed
- Schéma DB simplifié : 2 tables (`magazines`, `collection_items`) au lieu de 4
- Barcode intégré en colonne de `magazines` (1 édition = 0 ou 1 barcode dans le MVP)
- Table `magazine_details` supprimée, champs inlines dans `magazines`
- OCR intégré au MVP (décision revue)

---

## [0.1.0] — YYYY-MM-DD

> Première release technique (à définir lors de la publication initiale).

### Added
- Initialisation du projet Expo
- TypeScript strict
- Expo Router
- SQLite (`expo-sqlite`)
- Zustand
- Schéma DB v1
- Écran Accueil
- Écran Ma Collection
- Écran Fiche Magazine
- Écran Paramètres
- Navigation inférieure
- Scan code-barres (EAN-13 / ISBN)
- Caméra / OCR
- Saisie manuelle
- Parcours complet d'identification
- Export JSON v1
- Import JSON avec remplacement
- Tests unitaires et composants
- Coverage ≥ 80%

---

<!-- Ajouter ici les releases suivantes suivant le format : -->
<!--
## [X.Y.Z] — YYYY-MM-DD

### Added
- ...

### Changed
- ...

### Fixed
- ...

### Removed
- ...
-->
