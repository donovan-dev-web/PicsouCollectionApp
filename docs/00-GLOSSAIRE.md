# 🦆 Picsou Collection — Glossaire

> **Document de référence — v1.0**
>
> Ce document regroupe tous les termes employés dans la documentation et explique ce qu'ils désignent **dans le contexte de ce projet**. Il sert de référence commune pour éviter toute ambiguïté.

---

## Comment utiliser ce glossaire

Chaque entrée précise :
- le **terme** (avec l'éventuel acronyme) ;
- la **définition** générale brève ;
- la **signification spécifique dans le contexte Picsou Collection**.

Le glossaire est organisé en trois parties :
1. [Termes du domaine](#1-termes-du-domaine) — les concepts métier de la collection de magazines ;
2. [Termes techniques](#2-termes-techniques) — les notions d'architecture, de code et de données ;
3. [Termes agiles & outils](#3-termes-agiles--outils) — le vocabulaire de gestion de projet et GitHub.

---

## 1. Termes du domaine

### Publication
**Général :** série de magazines éditée régulièrement.

**Contexte :** la série à laquelle appartient un magazine, par exemple *Picsou Magazine*, *Super Picsou Géant*, *Mickey Parade*, *Les Trésors de Picsou*. Dans le modèle de données, la publication est représentée par le champ texte `publication` de l'édition (elle n'est pas une table séparée).

### Édition
**Général :** version particulière d'une publication.

**Contexte :** **l'entité centrale** du projet. Une édition est la combinaison unique de *publication + numéro + édition + langue + date*. Elle possède un identifiant interne (`id`, un UUID) indépendant du numéro ou du code-barres. Exemple : *Picsou Magazine n°547, édition standard, FR*. Une édition peut avoir zéro, un ou plusieurs exemplaires, et porte son **état** (`condition`).

### Numéro
**Général :** valeur numérique attribuée à un magazine dans une série.

**Contexte :** champ descriptif `issue_number` de l'édition. **Le numéro seul ne suffit jamais** à identifier une édition (le n°30 de Picsou Magazine ≠ le n°30 de Super Picsou Géant). Le numéro n'est jamais une clé primaire.

### Exemplaire
**Général :** copie physique d'une publication.

**Contexte :** **l'exemplaire physique réellement possédé**, rattaché à une édition via `collection_items`. Chaque exemplaire a ses notes et sa date d'ajout ; l'état est porté par l'édition (`magazines.condition`). La possession de plusieurs exemplaires d'une même édition est permise.

### Code-barres
**Général :** représentation optique lisible par machine d'un identifiant (EAN, ISBN, etc.).

**Contexte :** **identifiant externe** d'une édition, permettant de la retrouver par scan. Les formats pris en charge sont **EAN-13** et **ISBN**. Un code-barres ne désigne **pas** un exemplaire physique. Un même code peut également correspondre à **plusieurs éditions/numéros** (certains codes ne reflètent pas un numéro exact), la base autorise donc des doublons. Représenté par le champ `barcode`.

### Identification combinée
**Contexte :** la combinaison `Publication + Numéro + Édition + Langue + Date` permettant une identification fiable. C'est la **règle d'or** qui garantit la fiabilité, au lieu de se fier au numéro seul.

### Possédé / Absent
**Contexte :** les deux états du résultat d'identification.
- **Possédé** (🔴) : l'édition a au moins un exemplaire dans la collection ;
- **Absent** (🟢) : l'édition n'a aucun exemplaire.

Le statut est **toujours dérivé** du nombre réel d'exemplaires, jamais d'un champ stocké.

### Doublon (volontaire)
**Contexte :** le fait de posséder plusieurs exemplaires de la même édition. Autorisé et géré sans jugement : l'application avertit l'utilisateur et lui laisse le choix d'ajouter un second exemplaire.

### OCR (Reconnaissance optique de caractères)
**Général :** technique d'extraction de texte à partir d'images.

**Contexte :** méthode d'identification par caméra. L'application analyse des frames éphémères de la couverture pour extraire la publication, le numéro et la date. **Aucune image n'est enregistrée.** Le résultat est accompagné d'un **niveau de confiance**.

### Confiance
**Contexte :** valeur (0..1) indiquant la fiabilité d'une identification automatique (OCR notamment). En cas de confiance insuffisante, l'application le dit honnêtement et propose de réessayer ou de saisir manuellement. L'application n'invente jamais une identification avec certitude.

---

## 2. Termes techniques

### SQLite
**Général :** moteur de base de données relationnelle embarquée, légère et sans serveur.

**Contexte :** **base de données locale** de l'application, via `expo-sqlite`. Pour un volume modéré (moins de ~5 000 magazines), elle est très performante même sans optimisation agressive.

### Schéma
**Général :** définition structurelle d'une base de données (tables, colonnes, index).

**Contexte :** le schéma cible du MVP comporte **2 tables** : `magazines` (édition) et `collection_items` (exemplaire). La version de schéma est stockée dans `PRAGMA user_version`.

### Migration
**Général :** procédure de passage d'une version de schéma à une autre.

**Contexte :** scripts appliqués dans l'ordre pour faire évoluer la base sans perte de données. Tout changement de structure incrémente la version.

### Repository
**Général :** couche logicielle isolant l'accès aux données du reste de l'application.

**Contexte :** **seule porte d'entrée vers SQLite**. Aucun écran n'accède directement à la base. Les repositories font le mapping entre les noms de colonnes SQL (`snake_case`) et les types TypeScript (`camelCase`).

### Service
**Général :** couche logique métier intermédiaire entre l'UI et les repositories.

**Contexte :** dans Picsou Collection : `IdentificationService`, `CollectionService` et le module `backup` (export/import). Ils centralisent la logique métier.

### Store (Zustand)
**Général :** gestion d'état applicatif.

**Contexte :** la source de vérité reste **SQLite** ; les stores Zustand (`useCollectionStore`, `useSettingsStore`, etc.) servent de cache/état UI synchronisé avec la base.

### TypeScript
**Général :** sur-ensemble typé de JavaScript.

**Contexte :** le langage du projet, en mode strict. Les types de domaine sont définis dans `06-DATA-MODEL.md`.

### Expo / React Native
**Général :** frameworks de développement d'applications mobiles cross-platform.

**Contexte :** React Native est le framework, Expo le toolkit. Le **Development Build** est installé sur un téléphone Android physique pour tester caméra/OCR en conditions réelles.

### Expo Router
**Général :** bibliothèque de navigation basée sur les fichiers pour React Native/Expo.

**Contexte :** navigation par arborescence de fichiers dans `app/` (accueil, scan, collection, settings).

### EAS Build
**Général :** service cloud d'Expo pour construire des builds.

**Contexte :** utilisé pour générer l'**AAB** (Android App Bundle) de production pour le Play Store. Le build local (Gradle) reste disponible pour le développement.

### Development Build
**Contexte :** build Expo compilé nativement, installé sur le téléphone de développement. Il permet d'intégrer des modules natifs (comme l'OCR ML Kit) et de déboguer sur le matériel réel.

### API (Application Programming Interface)
**Contexte :** interface de programmation. **Picsou Collection n'utilise aucune API externe obligatoire.**

---

## 3. Termes agiles & outils

### Agile
**Général :** méthodologie itérative de gestion de projet, orientée valeur et adaptation continue.

**Contexte :** le projet découpe les user stories en **tâches** (issues) suivies via un **kanban** GitHub Projects. Chaque fonctionnalité est validée par des **critères d'acceptation**.

### User Story
**Général :** description d'une fonctionnalité vue du point de vue de l'utilisateur.

**Context :** format *« En tant que ... je veux ... afin de ... »*. Les user stories du projet sont listées dans `08-USER-STORIES.md` avec leurs critères d'acceptation.

### Critères d'acceptation
**Général :** conditions précises qui déterminent qu'une user story ou une tâche est terminée et valide.

**Contexte :** servent de base aux **tests orientés utilisateur** (Catégorie B de la stratégie de test) : ils valident que le code fait bien ce que l'utilisateur attend.

### Issue
**Général :** entité de suivi d'une tâche/un bug dans GitHub.

**Contexte :** une **tâche unitaire** issue d'une user story. Elle est suivie via labels, milestones et le kanban. Les bugs utilisent un modèle dédié.

### Milestone
**Général :** jalon regroupant plusieurs issues, avec une échéance.

**Contexte :** correspond aux **phases de la roadmap** (M-01 à M-09). Les issues d'un milestone constituent le périmètre de la phase en cours.

### Label
**Général :** étiquette de tri sur une issue (type, priorité, épique, etc.).

**Contexte :** utilisés pour filtrer le backlog : types (`bug`, `enhancement`, `docs`, `refactor`, `test`, `infra`), priorités, épiques (`epic/db`, `epic/accueil`, ...) et complexité.

### Épique (epic)
**Général :** regroupement de plusieurs user stories autour d'un même thème.

**Contexte :** les épiques du projet : DB, Accueil, Ajout & collection, Identification, Export/Import, Qualité & publication.

### Backlog
**Général :** ensemble ordonné des tâches non encore engagées.

**Contexte :** colonne initiale du kanban ; toute demande non prioritaire y rejoint.

### Kanban
**Général :** méthode visuelle de gestion du travail en flux (colonnes de statut).

**Contexte :** le **GitHub Projects** "Picsou Collection" avec colonnes Backlog / To Do / In Progress / In Review / Done.

### Git Flow
**Général :** modèle de branches pour l'organisation du versionning.

**Contexte :** branches `main`, `develop`, `feature/*`, `release/*`, `hotfix/*`. `main` et `develop` sont protégées.

### Pull Request (PR)
**Général :** demande de validation et d'intégration d'un changement de code dans une branche.

**Contexte :** toute fonctionnalité est fusionnée via une PR référençant l'issue, passant la CI et faisant l'objet d'une revue.

### CI / CD (Intégration/Déploiement continus)
**Général :** automatisation des contrôles (CI) et de la livraison (CD).

**Contexte :** via GitHub Actions : typecheck, lint, tests, coverage, et build EAS de production. Une PR ne fusionne que si la CI est verte.

### Release
**Général :** version livrée d'une application, avec notes de version.

**Contexte :** une version est taguée `vX.Y.Z` (Semantic Versioning) sur `main` et publiée comme GitHub Release. Le `CHANGELOG.md` suit les changements.

### Tag
**Contexte :** marqueur Git d'un commit correspondant à une version (`v0.1.0`).

### Semantic Versioning (SemVer)
**Général :** convention de versionnage `MAJOR.MINOR.PATCH`.

**Contexte :** MAJOR = changement incompatible, MINOR = nouvelle fonctionnalité rétro-compatible, PATCH = correction de bug.

### Coverage (Couverture de tests)
**Général :** pourcentage de code exécuté par les tests.

**Contexte :** seuils cibles : global ≥ 80 %, services ≥ 85 %, composants critiques ≥ 70 %. Rapport généré par la CI.

### Report (Rapport)
**Contexte :** document/artefact de suivi (couverture, santé). Généré par la CI et archivé.

---

## Récapitulatif

| Partie | Contenu |
|---|---|
| 1. Termes du domaine | Publication, édition, exemplaire, code-barres, possession, doublon, OCR, confiance |
| 2. Termes techniques | SQLite, schéma, migration, repository, service, store, stack mobile, build |
| 3. Termes agiles & outils | User story, issue, milestone, label, kanban, Git Flow, PR, CI/CD, release, coverage |
