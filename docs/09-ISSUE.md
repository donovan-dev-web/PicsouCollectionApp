# 🦆 Picsou Collection — Gestion des Issues GitHub (Workflow Agile)

> **Document de référence — v1.0**
>
> Ce document définit la méthode agile de suivi du projet via GitHub : transformation des user stories en tâches (issues), organisation en milestones, labels, branches, pull requests, releases et kanban (GitHub Projects).

---

## Table des matières

1. [Objectif](#1-objectif)
2. [Les éléments GitHub utilisés](#2-les-éléments-github-utilisés)
3. [Du backlog aux issues](#3-du-backlog-aux-issues)
4. [Modèle d'issue](#4-modèle-dissue)
5. [Labels](#5-labels)
6. [Milestones](#6-milestones)
7. [Branches (Git Flow)](#7-branches-git-flow)
8. [Pull Requests](#8-pull-requests)
9. [Releases](#9-releases)
10. [Kanban (GitHub Projects)](#10-kanban-github-projects)
11. [Workflow complet de bout en bout](#11-workflow-complet-de-bout-en-bout)
12. [Règles de vie du backlog](#12-règles-de-vie-du-backlog)
13. [Checklist de démarrage](#13-checklist-de-démarrage)

---

## 1. Objectif

Transformer les **user stories** (voir `08-USER-STORIES.md`) en **tâches actionnables** (issues GitHub) et les suivre via un **board Kanban** (GitHub Projects), organisé par **milestones** correspondant aux phases de la roadmap (voir `11-ROADMAP.md`).

L'objectif est de pouvoir répondre en continu à trois questions :
- **Quoi** faire ensuite ? (*backlog ordonné*)
- Qui/quoi est **en cours** ? (*board*)
- **Quand** cela sera-t-il livré ? (*milestones / releases*)

---

## 2. Les éléments GitHub utilisés

| Élément | Rôle |
|---|---|
| **Issue** | Une tâche unitaire issue d'une user story |
| **Label** | Type, priorité, statut, complexité |
| **Milestone** | Regroupement par phase / objectif |
| **Project (Kanban)** | Suivi visuel des issues |
| **Branch** | Branche de travail (Git Flow : `feature/*`, `release/*`) |
| **Pull Request** | Validation et intégration du code |
| **Release** | Version livrée du produit |
| **Tag** | Marquage d'une version (`v0.1.0`) |

---

## 3. Du backlog aux issues

### 3.1 Principe
Une **user story** n'est pas directement une issue. Elle est découpée en **tâches** (issues) lorsque l'équipe l'engage dans un milestone.

### 3.2 Exemple de découpage

**User story** `US-ID-02 — Scanner un code-barres` peut produire les issues :

| Issue | Tâche |
|---|---|
| `US-ID-02` | Intégrer `expo-camera` et demander la permission |
| `US-ID-02` | Afficher le preview caméra avec réticule |
| `US-ID-02` | Détecter et lire un EAN-13/ISBN |
| `US-ID-02` | Rechercher l'édition en base + afficher code inconnu |

### 3.3 Règle de découpage
- Chaque issue doit être **petite** (idéalement < 1 jour de travail) ;
- Chaque issue doit avoir un **objectif clair** et des **critères de fin** ;
- Une issue dont l'effort dépasse 2 jours est subdivisée.

---

## 4. Modèle d'issue

Chaque issue suit un **template** cohérent avec la user story source.

### 4.1 Template d'issue de tâche

```markdown
---
title: "[Epique] Description de la tâche"
labels: [to-do]
milestone: "M-0X — <phase>"
assignees: ""
---

# Contexte

Lien vers la user story source : #<US>
Lien vers la spécification fonctionnelle : #<section>

# Tâche

<Description précise de ce qu'il faut faire>

# Critères de fin (DoD)

- [ ] <critère 1>
- [ ] <critère 2>

# Tests

- Quels tests unitaires / composants ajouter ?
- Comment vérifier manuellement ?
```

### 4.2 Template d'issue de bug

```markdown
---
title: "[Bug] <description>"
labels: [bug, to-do]
milestone: ""
assignees: ""
---

# Comportement attendu
<...>

# Comportement observé
<...>

# Reproduction
1. <étape>
2. <étape>

# Environnement
- Appareil / version Android
- Version de l'application

# Correctif proposé
<...>
```

---

## 5. Labels

### 5.1 Labels par type

| Label | Couleur | Usage |
|---|---|---|
| `bug` | rouge | Défaut signalé |
| `enhancement` | vert | Amélioration / fonctionnalité |
| `documentation` | bleu | Écriture de documentation |
| `refactor` | violet | Refactoring sans changement de comportement |
| `test` | orange | Travail spécifique aux tests |
| `infra` | gris | Build, CI/CD, config |

### 5.2 Labels par priorité

| Label | Couleur | Usage |
|---|---|---|
| `priority-high` | rouge | Priorité immédiate |
| `priority-medium` | orange | Priorité normale |
| `priority-low` | jaune | Peut attendre |

### 5.3 Labels de statut (suivi kanban)

| Label | Usage |
|---|---|
| `to-do` | À faire (backlog) |
| `in-progress` | En cours |
| `in-review` | En revue / PR ouverte |
| `blocked` | Bloqué (tâche dépendante) |
| `done` | Terminé |

> Les labels de statut peuvent être gérés automatiquement par **GitHub Projects** (champs de statut) plutôt que par labels.

### 5.4 Labels par épique

| Label | Usage |
|---|---|
| `epic/db` | Base de données |
| `epic/accueil` | Accueil |
| `epic/collection` | Ajout & collection |
| `epic/identification` | Identification |
| `epic/backup` | Export / Import |
| `epic/quality` | Qualité & publication |

### 5.5 Labels de complexité (facultatif)

| Label | Usage |
|---|---|
| `size/s` | Petite (≤ 0,5 j) |
| `size/m` | Moyenne (≤ 1 j) |
| `size/l` | Grande (> 1 j, à découper) |

---

## 6. Milestones

Les milestones correspondent aux **phases de la roadmap** (`11-ROADMAP.md`).

| Milestone | Titre | Objectif |
|---|---|---|
| `M-01` | Initialisation technique | Projet Expo opérationnel sur téléphone |
| `M-02` | Base de données | Persistance et CRUD collection |
| `M-03` | Interface principale | Écrans accueil, collection, paramètres |
| `M-04` | Scan code-barres | Identification par code-barres |
| `M-04R` | Retours test physique | Corrections & améliorations UX post-test v0.4.0 |
| `M-05` | Caméra / OCR | Identification par OCR |
| `M-06` | Parcours complet | Identification → Possédé / Absent |
| `M-07` | Export / Import | Sauvegarde et restauration JSON |
| `M-07R` | Retours test physique (v0.7.0) | Corrections post-test v0.7.0 : OCR ciblé, validation, format CSV |
| `M-08` | Optimisation & qualité | Performance, tests, couverture |
| `M-10` | Refonte UI/UX « Vault Lisible » | SafeZone, contraste AA, TabBar icônes, parcours <3s → v0.9.0 |
| `M-10R` | Retours test physique (M-10) | Import CSV, drawer + tabs, form clavier, torche/FAB/safezone → v0.9.1 |
| `M-10R2` | 2ᵉ passe retours test physique | SafeZone drawer, permission caméra + onboarding 1er lancement, popup résultat, form valider header, paramètres sous-menus, header fiche, tri collection, OCR numéro, écran Recherche → v0.9.2 (livrée, PR #176) |
| `M-09` | Tests terrain & publication | Validation réelle, build Play Store → v1.0.0 (M09-01 panneau recherche #177) |

### Règle d'attribution
- Chaque milestone a une **date de fin cible** (indicative) et une **description** ;
- Seules les issues engagées dans le milestone actif sont travaillées ;
- Un milestone est fermé lorsqu'une **release** le couvre.

### 6.1 Registre des issues par milestone

Chaque fichier `docs/issues/<issue>.md` correspond à une **issue GitHub** (lien
`#<numéro>`). Ce registre référence l'ensemble des issues des milestones UI/UX
(M-10, M-10R, M-10R2, M-09). Statut : `Done` = livré / `Écarté` = wontfix /
`À faire` = backlog.

**Milestone M-10 « Vault Lisible » (v0.9.0) — issues #140 à #151** · détails
[`docs/issues/M10-MILESTONE.md`](issues/M10-MILESTONE.md)

| Issue | Doc | GitHub | Statut |
|---|---|---|---|
| M10-01 — Tokens + typo + contraste | [`M10-01-tokens-contraste.md`](issues/M10-01-tokens-contraste.md) | #140 | Done |
| M10-02 — SafeZone globale | [`M10-02-safezone.md`](issues/M10-02-safezone.md) | #141 | Done |
| M10-03 — TabBar icônes + routes Stack | [`M10-03-tabbar-icones.md`](issues/M10-03-tabbar-icones.md) | #142 | Done |
| M10-04 — Accueil cockpit brocante | [`M10-04-accueil.md`](issues/M10-04-accueil.md) | #143 | Done |
| M10-05 — Collection : filtres + pagination + carte | [`M10-05-collection.md`](issues/M10-05-collection.md) | #144 | Done |
| M10-06 — Fiche + Edit | [`M10-06-fiche.md`](issues/M10-06-fiche.md) | #145 | Done |
| M10-07 — Scan barcode + multiple + result | [`M10-07-scan-barcode-result.md`](issues/M10-07-scan-barcode-result.md) | #146 | Done |
| M10-08 — Scan camera OCR + manuel | [`M10-08-scan-camera-manual.md`](issues/M10-08-scan-camera-manual.md) | #147 | Done |
| M10-09 — Settings backup | [`M10-09-settings.md`](issues/M10-09-settings.md) | #148 | Done |
| M10-10 — Accessibilité + lisibilité | [`M10-10-a11y.md`](issues/M10-10-a11y.md) | #149 | Done |
| M10-11 — Empty / Loading / Error + Toast | [`M10-11-etats.md`](issues/M10-11-etats.md) | #150 | Done |
| M10-12 — Docs + scripts gh | [`M10-12-docs-scripts.md`](issues/M10-12-docs-scripts.md) | #151 | Done |

**Milestone M-10R « Retours test physique M-10 » (v0.9.1) — issues #153 à #163** · détails
[`docs/issues/M10R-MILESTONE.md`](issues/M10R-MILESTONE.md)

| Issue | Doc | GitHub | Statut |
|---|---|---|---|
| M10R-01 — Import CSV : sélecteur bloque les `.csv` | [`M10R-01-import-csv.md`](issues/M10R-01-import-csv.md) | #153 | Done |
| M10R-02 — Accueil : CTA Scanner/Ajouter au-dessus des récents | [`M10R-02-accueil-cta.md`](issues/M10R-02-accueil-cta.md) | #154 | Done |
| M10R-03 — Tabs : Accueil \| Scan \| Collection | [`M10R-03-tabs.md`](issues/M10R-03-tabs.md) | #155 | Écarté (wontfix) |
| M10R-04 — Menu latéral (drawer) permanent + liens directs | [`M10R-04-drawer.md`](issues/M10R-04-drawer.md) | #156 | Done |
| M10R-05 — Drawer : section éditions dynamique repliable | [`M10R-05-drawer-editions.md`](issues/M10R-05-drawer-editions.md) | #157 | Done |
| M10R-06 — Formulaire : champs Mois/Année non scrollables | [`M10R-06-form-scroll.md`](issues/M10R-06-form-scroll.md) | #158 | Done |
| M10R-07 — Formulaire : spacer clavier pour atteindre Notes | [`M10R-07-form-keyboard.md`](issues/M10R-07-form-keyboard.md) | #159 | Done |
| M10R-08 — Torche caméra (OCR + code-barres) | [`M10R-08-torch.md`](issues/M10R-08-torch.md) | #160 | Done |
| M10R-09 — OCR texte stylisé : guidage + replis | [`M10R-09-ocr-guidance.md`](issues/M10R-09-ocr-guidance.md) | #161 | Done |
| M10R-10 — Accès rapide scan global (header) | [`M10R-10-scan-fab.md`](issues/M10R-10-scan-fab.md) | #162 | Done |
| M10R-11 — OCR : bouton code-barres masqué par la gesture bar | [`M10R-11-ocr-safezone.md`](issues/M10R-11-ocr-safezone.md) | #163 | Done |

**Milestone M-10R2 « 2ᵉ passe retours test physique » (v0.9.2) — issues #166 à #175** · détails
[`docs/issues/M10R2-MILESTONE.md`](issues/M10R2-MILESTONE.md)

| Issue | Doc | GitHub | Statut |
|---|---|---|---|
| M10R2-01 — Drawer latéral : pas de SafeZone | [`M10R2-01-drawer-safezone.md`](issues/M10R2-01-drawer-safezone.md) | #167 | Done |
| M10R2-02 — Permission caméra 1er lancement + écran partagé | [`M10R2-02-camera-permission.md`](issues/M10R2-02-camera-permission.md) | #168 | Done |
| M10R2-03 — Popup « Couverture reconnue » : espacement boutons | [`M10R2-03-result-popup-spacing.md`](issues/M10R2-03-result-popup-spacing.md) | #169 | Done |
| M10R2-04 — Formulaire : icône Valider dans le header | [`M10R2-04-form-submit-header.md`](issues/M10R2-04-form-submit-header.md) | #171 | Done |
| M10R2-05 — Premier lancement : onboarding + permission | [`M10R2-05-first-launch-onboarding.md`](issues/M10R2-05-first-launch-onboarding.md) | #170 | Done |
| M10R2-06 — Paramètres : sous-menus + retour GitHub | [`M10R2-06-settings-submenus.md`](issues/M10R2-06-settings-submenus.md) | #173 | Done |
| M10R2-07 — Fiche magazine : header menu/titre/scan | [`M10R2-07-detail-header.md`](issues/M10R2-07-detail-header.md) | #166 | Done |
| M10R2-08 — Collection : bouton Tri (numéro ↑/↓) | [`M10R2-08-collection-sort.md`](issues/M10R2-08-collection-sort.md) | #172 | Done |
| M10R2-09 — OCR : numéro affiné (« N° ») + textes stylisés | [`M10R2-09-ocr-number-detection.md`](issues/M10R2-09-ocr-number-detection.md) | #174 | Done |
| M10R2-10 — Saisie manuelle flux identification → Recherche | [`M10R2-10-manual-search-flow.md`](issues/M10R2-10-manual-search-flow.md) | #175 | Done |

**Milestone M-09 « Tests terrain & publication » (→ v1.0.0)** · nouvelles issues ouvertes pendant la Phase 9

| Issue | Doc | GitHub | Statut |
|---|---|---|---|
| M09-01 — Collection : panneau de recherche repliable (bouton Rechercher) | [`M09-01-collection-search-panel.md`](issues/M09-01-collection-search-panel.md) | #177 | À faire (PR en cours) |

---

## 7. Branches (Git Flow)

Le projet adopte **Git Flow** :

| Branche | Usage |
|---|---|
| `main` | Code de production, stable, protégée |
| `develop` | Intégration des fonctionnalités terminées |
| `feature/*` | Développement d'une fonctionnalité (issue) |
| `release/*` | Préparation d'une version (tests, corrections) |
| `hotfix/*` | Correctif urgent sur `main` |

### Conventions de nommage des branches

```
feature/<issue-id>-<slug>
release/v<version>
hotfix/<issue-id>-<slug>
```

### Exemple
```
feature/12-scan-ean13
feature/18-export-json
release/v0.1.0
```

### Règles
- Une **feature branch** est créée depuis `develop` ;
- Un **hotfix branch** est créé depuis `main` ;
- `main` et `develop` sont **protégées** (pas de push direct) ;
- Une branche est fusionnée via une **pull request**.

---

## 8. Pull Requests

### 8.1 Règles
- Une PR référence l'**issue** qu'elle résout (`Closes #12`) ;
- Une PR est faite vers `develop` (ou `main` pour un hotfix) ;
- La branche doit passer la **CI** (voir `10-CI-CD.md`) : lint, typecheck, tests, coverage ;
- Une revue est effectuée avant fusion ;
- Le titre suit un convention : `feat:`, `fix:`, `docs:`, `refactor:`, `test:`.

### 8.2 Template de PR

```markdown
# Description

<Ce que cette PR fait>

Résout : #<issue>

# Changements

- <changement>

# Tests effectués

- [ ] Tests unitaires passent
- [ ] Typecheck passe
- [ ] Manuel : <description>

# Boîte à cocher

- [ ] Code relu
- [ ] Documentation mise à jour si nécessaire
```

---

## 9. Releases

### 9.1 Versionnage sémantique
Le projet suit le **Semantic Versioning** (`MAJOR.MINOR.PATCH`) :

- **MAJOR** : changement incompatible ;
- **MINOR** : nouvelle fonctionnalité rétro-compatible ;
- **PATCH** : correction de bug.

### 9.2 Création d'une release
1. Créer une branche `release/vX.Y.Z` depuis `develop` ;
2. Tests et corrections finales ;
3. Fusionner `release/*` dans `main` **et** `develop` ;
4. Tagguer `main` avec `vX.Y.Z` ;
5. Publier la **release** GitHub avec notes de version ;
6. Mettre à jour le `CHANGELOG.md`.

### 9.3 Cible
- Des releases `v0.x.0` pendant le développement (pré-1.0) ;
- Aucune release publique stable avant la validation du MVP.

---

## 10. Kanban (GitHub Projects)

### 10.1 Projet
Un seul **Project** (board) "Picsou Collection" pour le suivi.

### 10.2 Colonnes / Statuts

| Colonne | Issues |
|---|---|
| **Backlog** | Toutes les issues non engagées |
| **To Do** | Issues du milestone actif, prêtes à être engagées |
| **In Progress** | Travail en cours (max 2-3 simultanées) |
| **In Review** | PR ouverte / en attente de revue |
| **Done** | Terminé et fusionné |

### 10.3 Vue
- **Board view** : suivi quotidien du travail en cours ;
- **Roadmap view** : planification par milestones ;
- **Table view** : filtrage par label, assignee, milestone.

### 10.4 Automatisation
Utiliser les **workflows natifs de GitHub Projects** pour déplacer automatiquement les issues en fonction des événements (ex. création d'une PR liée → In Review).

---

## 11. Workflow complet de bout en bout

```
┌─────────────────────────────────────────────────────────────┐
│ 1. Backlog : issues créées à partir des user stories         │
│    (labels épique + priorité, dans le backlog)              │
└─────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│ 2. Planification : issues assignées au milestone courant     │
│    → déplacées vers "To Do"                                  │
└─────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│ 3. Engagement : pick une issue → In Progress                 │
│    → créer branch feature/#id-slug depuis develop            │
└─────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│ 4. Développement : code + tests → commit → push              │
└─────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│ 5. Pull Request : "Closes #id" → CI → revue → In Review      │
└─────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│ 6. Fusion dans develop → issue → Done                        │
└─────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│ 7. Release : release/* → main → tag vX.Y.Z → GitHub Release  │
└─────────────────────────────────────────────────────────────┘
```

---

## 12. Règles de vie du backlog

- Le **backlog** est régulièrement revu et ordonné par priorité ;
- Une issue est **engagée** uniquement dans le milestone actif ;
- Une issue bloquée reçoit le label `blocked` et une note de dépendance ;
- Le **DoD** (Definition of Done) d'une issue est respecté : code + tests + CI verte ;
- Toute nouvelle demande non prioritaire rejoint le **backlog** sans perturber le travail en cours.

### Rappel du DoD (Definition of Done)
- Code implémenté et fonctionnel ;
- Tests unitaires/composants écrits et verts ;
- `lint` et `typecheck` sans erreur ;
- CI verte ;
- Issue fermée et branch fusionnée ;
- Documentation mise à jour si nécessaire.

---

## 13. Checklist de démarrage

À l'initialisation du dépôt GitHub, configurer :

- [ ] **Labels** : types, priorités, épiques, complexité (section 5) ;
- [ ] **Milestones** : M-01 à M-10 (+ `M-04R`, `M-07R`, `M-10R`, `M-10R2`) (section 6) ;
- [ ] **Project** : board Kanban "Picsou Collection" (section 10) ;
- [ ] **Branch protection** sur `main` et `develop` (section 7) ;
- [ ] **Templates d'issue** (bug + tâche) via `.github/ISSUE_TEMPLATE/` ;
- [ ] **Template de PR** via `.github/PULL_REQUEST_TEMPLATE.md` ;
- [ ] **Workflows GitHub** : CI (section `10-CI-CD.md`), automatisation Projects ;
- [ ] **Release** initiale `v0.0.0` en point de départ.

---

## Récapitulatif

| Élément | Valeur |
|---|---|
| Workflow | Git Flow (main / develop / feature / release / hotfix) |
| Outil de suivi | GitHub Projects (Kanban) |
| Découpage | User story → issues → tasks |
| Labels | types, priorités, épiques, complexité, statuts |
| Milestones | M-01 à M-10 (+ `M-04R`, `M-07R`, `M-10R`, `M-10R2`) (phases roadmap) |
| Versionnage | Semantic Versioning |
| PR | Template + CI + revue + DoD |
