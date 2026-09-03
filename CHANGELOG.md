# Changelog

> Toutes les changements notables de Picsou Collection sont documentés ici.
>
> Format basé sur [Keep a Changelog](https://keepachangelog.com/fr/1.0.0/).
> Versionnage selon [Semantic Versioning](https://semver.org/lang/fr/).

---

## [0.5.0] — 2026-09-03

> Cinquième release : **retours du test sur appareil physique post-v0.4.0** — fiabilisation du scan, saisie assistée et gestion de la collection (M-04R).

### Added
- **Écran résultat après scan** et **scan accessible depuis le formulaire** de saisie — `US-COL-08`
- **Lecture robuste multi-format** des codes-barres (alphanumériques non tronqués, vote majoritaire anti faux-positifs) — `US-ID-07`
- **Saisie assistée avec suggestions** anti-doublons et date Année/Mois — `US-COL-07`
- **Ajouts récents cliquables** vers la fiche de l'édition — `US-ACC-05`
- **Pagination de la collection** (20/page) et **filtres par numéro et édition** — `US-COL-09`, `US-COL-10`
- **Bascule manuelle du thème** clair/sombre, persistée en base et réglable depuis les paramètres — `US-SET-01`
- Champ **Langue** (ex-pays) et **État** sur l'édition ; **code-barres autorisé en doublon** (un même code peut correspondre à des numéros/éditions différents) — retours M-04R
- Tests et couverture étendus sur scan, formulaire, thème, fiche et collection

### Changed
- Migration de schéma **v3** : `country` → `language`, `condition` déplacé de `collection_items` vers `magazines` (l'état caractérise l'édition)
- Migration de schéma **v4** : index `idx_magazines_barcode` passé en **non unique**
- Formulaire : zone « Plus de détails » **scrollable** (accès au bouton d'enregistrement sans refermer la section)
- Formulaire : **affichage des erreurs de soumission** sous le formulaire au lieu d'un échec silencieux

### Fixed
- Correction du **test flaky FOREIGN KEY** (`error.code` + garde `PRAGMA foreign_keys`) pour des tests DB stables en CI

---

## [0.4.0] — 2026-09-02

> Quatrième release technique : **scan code-barres** pour identifier une édition en brocante (M-04).

### Added
- **Choix de la méthode d'identification** : écran `/scan` proposant code-barres, caméra/OCR et saisie manuelle, avec annulation — `US-ID-01`
- **Scan code-barres** (`/scan/barcode`) : permission caméra, preview avec réticule, détection EAN-13 / Code128 / ITF-14 / UPC-A — `US-ID-02`
- **Lecture et validation EAN-13 / ISBN** (checksum ISBN-13, ISBN-10 avec `X`) — `US-ID-02`
- **Recherche de l'édition par code-barres** via `IdentificationService` (résultats `found` / `unknown` / `invalid`) — `US-ID-02`
- **Code inconnu + méthodes secours** (« Scanner à nouveau » / « Saisir manuellement ») — `US-ID-02`
- **Caméra / OCR placeholder** (`/scan/camera`) avec repli vers les autres méthodes (à compléter en M-05) — `US-ID-01`
- Tests unitaires `scanBarcode` et `IdentificationService`, tests des écrans (mocks caméra) — `US-QA-02`

### Changed
- Injection de `IdentificationService` dans les dépendances (`Dependencies.identificationService`)
- `test-db` : `foreign_keys` sans `journal_mode=WAL` (WAL inutile sur `:memory:`) pour des tests DB stables en CI

---

## [0.3.0] — 2026-09-02

> Troisième release technique : **interface principale de gestion de la collection** (M-03).

### Added
- **Accueil** : compteur d'exemplaires possédés et section « Ajouts récents » (rechargés au focus) — `US-ACC-01`, `US-ACC-04`
- **Scanner** : bouton proéminent vers le choix de méthode, et **saisie manuelle** (formulaire réutilisable) — `US-ACC-02`, `US-ACC-03`
- **Formulaire de saisie manuelle** (publication obligatoire, champs facultatifs → `NULL`) ; ajout crée l'édition **et** son premier exemplaire — `US-COL-01`
- **Ma Collection** : navigation **onglets** (Accueil / Collection / Paramètres), recherche par **titre ou numéro**, badge de statut (Possédé 🔴 / Absent 🟢) — `US-COL-02`
- **Fiche d'une édition** : infos complètes, statut, nombre et liste des exemplaires — `US-COL-03`
- **Modifier** une édition (formulaire pré-rempli, `updated_at` rafraîchi) — `US-COL-04`
- **Supprimer** une édition avec **confirmation**, exemplaires supprimés en cascade — `US-COL-05`
- **Design system clair/sombre** (`useThemeColors` + tokens light/dark) appliqué à toute l'interface — `US-QA-01`
- Injection de dépendances (DI) pour repo `magazine` / `collection`, store Zustand et singletons testables — `US-ACC-01`

### Changed
- `MagazineRepository.update(id, input)` et `findById(id)` (+ copies) ajoutés pour la gestion de la collection
- Migration des écrans et composants vers l'API de thème dynamique (suppression des `Colors.light` en dur)

---

## [0.2.0] — 2026-09-02

> Deuxième release technique : **couche de persistance complète** pour gérer la collection sans caméra (M-02).

### Added
- Schéma SQLite v1 (`magazines` + `collection_items`) via `expo-sqlite` — `US-DB-01`
- Moteur de migrations (`PRAGMA user_version`) — `US-DB-01`
- `magazineRepository` : `create`, `findByBarcode`, `list` (tri + quantité), `delete` — `US-DB-02`, `US-DB-03`, `US-DB-04`
- `collectionRepository` : `addCopy`, `countByMagazine`, `listByMagazine`, `deleteCopy` — `US-DB-05`
- Suppression en cascade d'une édition → supprime ses exemplaires (FK `ON DELETE CASCADE`) — `US-DB-05`
- Tests d'intégration sur **vrai SQLite en mémoire** (`better-sqlite3`) : 29 tests / 7 suites, **100 % de couverture** — `US-QA-02`

### Changed
- Versions Expo alignées sur le SDK : `expo ~57.0.19`, `expo-router ~57.0.18`, `expo-linking ~57.0.9`, `expo-updates ~57.0.21` (expo-doctor 21/21)
- Lockfile régénéré avec `npm@10.9.4` (compatibilité EAS/CI vérifiée via `npm ci`)

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