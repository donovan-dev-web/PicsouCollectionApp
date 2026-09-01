# Changelog

> Toutes les changements notables de Picsou Collection sont documentés ici.
>
> Format basé sur [Keep a Changelog](https://keepachangelog.com/fr/1.0.0/).
> Versionnage selon [Semantic Versioning](https://semver.org/lang/fr/).

---

## [0.1.0] — 2026-09-01

> Première release technique : socle du projet opérationnel, **build Android installable et testé sur téléphone** (M-01).

### Added
- Projet Expo SDK 57 à la racine du dépôt (template nettoyé) — `SETUP-01`
- TypeScript strict — `SETUP-02`
- Expo Router (navigation par fichiers + route `+not-found`) — `SETUP-03`
- Couche base de données `expo-sqlite` (SQLite locale, WAL, foreign_keys) — `SETUP-04`
- Gestion d'état Zustand — `SETUP-05`
- ESLint + Prettier (config, scripts, step CI) — `SETUP-06`
- Jest + couverture (`jest-expo`) : 7 tests / 3 suites, **100 % de couverture**, seuils globaux 70 % — `SETUP-07`
- EAS Build (`eas.json` : profils `development` / `preview` / `production`, channels, submit) + `expo-updates` — `SETUP-08`
- Setup GitHub (Kanban, templates, script) — `SETUP-09`
- Vérification `expo-doctor` intégrée à la CI (**21/21 checks**) — `SETUP-11`
- CI GitHub Actions : `typecheck → lint → format → doctor → tests → couverture`
- Documentation technique complète (`docs/` : glossaire, vision, specs, architecture, roadmap…)
- README, CONTRIBUTING, SECURITY, CHANGELOG

### Changed
- Verrouillé `npm` à la **10.9.4** (`packageManager`) — lockfile compatible EAS/CI
- `@types/jest` aligné sur la version attendue par Expo SDK 57 (29.5.14)
- Schéma DB v1 documenté : 2 tables (`magazines`, `collection_items`), barcode en colonne de `magazines`, OCR intégré au MVP

### Fixed
- Lockfile `npm ci` incompatible entre npm 11 (local) et npm 10 (EAS/CI) — régénéré avec `npm@10.9.4`
- `eas-cli` retiré des devDependencies (usage global / `npx`, version épinglée via `cli.version` dans `eas.json`)

---

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