# 🦆 Picsou Collection — Roadmap

> **Document de référence — v1.0**
>
> Ce document présente la roadmap du projet par phases, avec les jalons, livrables et critères d'avancement de chaque étape.

---

## Table des matières

1. [Principes](#1-principes)
2. [Vue d'ensemble](#2-vue-densemble)
3. [Phase 0 — Cadrage](#3-phase-0--cadrage)
4. [Phase 1 — Initialisation technique](#4-phase-1--initialisation-technique)
5. [Phase 2 — Base de données](#5-phase-2--base-de-données)
6. [Phase 3 — Interface principale](#6-phase-3--interface-principale)
7. [Phase 4 — Scan code-barres](#7-phase-4--scan-code-barres)
8. [Phase 4R — Retours test physique](#8-phase-4r--retours-test-physique)
9. [Phase 5 — Caméra / OCR](#9-phase-5--caméra--ocr)
10. [Phase 6 — Parcours complet](#10-phase-6--parcours-complet)
11. [Phase 7 — Export / Import](#11-phase-7--export--import)
12. [Phase 7R — Retours test physique (v0.7.0)](#12-phase-7r--retours-test-physique-v070)
13. [Phase 8 — Optimisation & qualité](#13-phase-8--optimisation--qualité)
14. [Phase 9 — Tests terrain & publication](#14-phase-9--tests-terrain--publication)
15. [Critères de sortie de chaque phase](#15-critères-de-sortie-de-chaque-phase)

---

## 1. Principes

- Chaque phase se termine par un **milestone** validé ;
- L'avancement est suivi via **GitHub Projects** (Kanban) ;
- Chaque release produit un **tag Git** ;
- Le passage à la phase suivante requiert les **critères de sortie** de la phase actuelle ;
- Les phases peuvent être **légèrement modifiées** en cours de route ( ajout de tâches).

---

## 2. Vue d'ensemble

```
Phase 0  ██████████████████████████████  Terminé ✓
Phase 1  ██████████████████████████████  Terminé ✓ (v0.1.0)
Phase 2  ██████████████████████████████  Terminé ✓ (v0.2.0)
Phase 3  ██████████████████████████████  Terminé ✓ (v0.3.0)
Phase 4  ██████████████████████████████  Terminé ✓ (v0.4.0)
Phase 4R ██████████████████████████████  Terminé ✓ (v0.4.1)
Phase 5  ██████████████████████████████  Terminé ✓ (v0.5.0)
Phase 6  ██████████████████████████████  Terminé ✓ (v0.6.0)
Phase 7  ██████████████████████████████  Terminé ✓ (v0.7.0)
Phase 8  ██████████████████████████████  Terminé ✓ (v0.8.0)
Phase 10 ░░░░░░░░░░░░░░░░░░░░░░░░░░░░  À venir (M-10 → v0.9.0)
Phase 9  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░  À venir (M-09 → v1.0.0)
```

### 2.1 Correspondance phase ↔ milestone ↔ issues

Chaque phase de la roadmap correspond à un **milestone GitHub** (`M-0x`) et à un ensemble d'**issues** assurant le suivi dans le Kanban.

| Phase | Milestone | Issues | Nb |
|---|---|---|---|
| 0 — Cadrage | `M-00 — Cadrage, conception & documentation` | `DOC-01..15`, `DESIGN-01..02`, `ORG-01..02` | 19 |
| 1 — Initialisation | `M-01 — Initialisation technique` | `SETUP-01..11` | 11 |
| 2 — Base de données | `M-02 — Base de données` | `US-DB-01..05` | 5 |
| 3 — Interface | `M-03 — Interface principale` | `US-ACC-01..04`, `US-COL-01..05`, `US-QA-01` | 10 |
| 4 — Scan code-barres | `M-04 — Scan code-barres` | `US-ID-01..02` | 2 |
| 4R — Retours test | `M-04R — Retours test physique` | `US-ACC-05`, `US-COL-07..10`, `US-ID-07`, `US-SET-01` | 7 |
| 5 — Caméra / OCR | `M-05 — Caméra / OCR` | `US-ID-03`, `US-ID-05` | 2 |
| 6 — Parcours complet | `M-06 — Parcours complet` | `US-ID-04`, `US-ID-06`, `US-COL-06` | 3 |
| 7 — Export / Import | `M-07 — Export / Import` | `US-BK-01..03` | 3 |
| 7R — Retours test | `M-07R — Retours test physique (v0.7.0)` | `US-ID-08..09` *(1 bug)*, `US-BK-04..05` | 5 |
| 8 — Optimisation | `M-08 — Optimisation & qualité` | `US-QA-02`, #136 | 2 |
| 10 — Refonte UI/UX | `M-10 — Refonte UI/UX « Vault Lisible »` | `US-UX-01..06` (issues M10-01..12) | 12 |
| 9 — Tests & publication | `M-09 — Tests terrain & publication` | `US-QA-03` | 1 |
| **Total** | | | **70** |

---

## 3. Phase 0 — Cadrage

**Statut : Terminé ✓**

| Tâche | Statut |
|---|---|
| Définir le problème et les promesses | ✓ |
| Choisir la stack technique | ✓ |
| Définir l'architecture DB | ✓ |
| Définir le format d'export/import | ✓ |
| Documenter les spécifications | ✓ |

**Livrables** : documents `docs/01` à `docs/13`, LICENSE, maquettes, design system, présentation client.

**Issues de suivi (M-00)** : `DOC-01..15` (rédaction des documents), `DESIGN-01..02` (design system & maquettes), `ORG-01..02` (présentation client & configuration du dépôt). **Toutes clôturées.**

---

## 4. Phase 1 — Initialisation technique

**Statut : Terminé ✓** — livré en **release `v0.1.0`**.

**Objectif** : Obtenir une application Expo vide, opérationnelle sur un téléphone Android physique.

| Tâche | Issue |
|---|---|
| Créer le projet Expo | `SETUP-01` |
| Configurer TypeScript strict | `SETUP-02` |
| Configurer Expo Router | `SETUP-03` |
| Installer `expo-sqlite` | `SETUP-04` |
| Installer `zustand` | `SETUP-05` |
| Configurer ESLint + Prettier | `SETUP-06` |
| Configurer Jest | `SETUP-07` |
| Configurer EAS Build (eas.json) | `SETUP-08` |
| Configurer le setup GitHub (script kanban) | `SETUP-09` |
| Test d'installation sur téléphone | `SETUP-10` |
| Ajouter `expo-doctor` aux checks CI | `SETUP-11` |
| Configurer `.gitignore` | — |
| Initialiser `CHANGELOG.md` | — |

**Livrables** : projet vide, installable et débogable sur téléphone ; CI complète (typecheck, lint, format, doctor, tests, couverture) ; **build `preview` installé et démarré sur Android** pour la validation `SETUP-10`.

---

## 5. Phase 2 — Base de données

**Objectif** : Pouvoir gérer toute la collection sans caméra.

**Statut : Terminé ✓** — livré en **release `v0.2.0`**.

| Tâche | Story |
|---|---|
| Schéma SQL `magazines` + `collection_items` | US-DB-01 |
| Gestion des migrations (`PRAGMA user_version`) | US-DB-01 |
| Repository `magazineRepository` (CRUD) | US-DB-02, US-DB-03, US-DB-04 |
| Repository `collectionRepository` (exemplaires) | US-DB-05 |
| Service `collectionService` | — |
| Tests unitaires repositories | US-QA-02 |

**Livrables** : couche persistance testée et fonctionnelle (29 tests / 7 suites, 100 % couverture).

---

## 6. Phase 3 — Interface principale

**Objectif** : Disposer d'une application utilisable manuellement.

**Statut : Terminé ✓** — livré en **release `v0.3.0`**.

| Tâche | Story |
|---|---|
| Écran Accueil (compteur + boutons + récents) | US-ACC-01, US-ACC-02, US-ACC-03, US-ACC-04 |
| Écran Ma Collection (liste + recherche) | US-COL-02 |
| Écran Fiche Magazine (détail + édition) | US-COL-03, US-COL-04, US-COL-05 |
| Navigation inférieure (tabs) | — |
| Thème clair + design system | US-QA-01 |
| États de chargement / erreur / vide | — |
| Messages de confirmation | — |

**Livrables** : application avec navigation, écrans fonctionnels, thème appliqué (**94 tests / 18 suites, ~99 % de couverture**).

---

## 7. Phase 4 — Scan code-barres

**Objectif** : Pouvoir identifier rapidement un magazine en brocante.

**Statut : Terminé ✓** — livré en **release `v0.4.0`**.

| Tâche | Story |
|---|---|
| Intégrer `expo-camera` | US-ID-01 |
| Demander la permission caméra | — |
| Afficher le preview avec réticule | US-ID-02 |
| Détecter et lire un EAN-13 / ISBN | US-ID-02 |
| Rechercher l'édition par code-barres | US-ID-02 |
| Afficher code inconnu + méthodes secours | US-ID-02 |
| Tests unitaires `scanBarcode` | US-QA-02 |

**Livrables** : fonctionnalité scan code-barres opérationnelle (**121 tests / 22 suites, ~98,5 % de couverture**).

---

## 8. Phase 4R — Retours test physique

**Objectif** : Intégrer les retours du test sur appareil physique post-v0.4.0, stabiliser le scan et fiabiliser la saisie avant l'OCR.

**Statut : Terminé ✓** — livré en **release `v0.4.1`**.

| Tâche | Story |
|---|---|
| Aligner M-04 avec la doc (écran résultat + bouton scan dans le formulaire) | US-COL-08 |
| Lecture robuste multi-format du code-barres (alphanumérique, non tronqué, vote majoritaire anti faux-positifs) | US-ID-07 |
| Saisie assistée avec suggestions anti-doublons | US-COL-07 |
| Formulaire complet en deux sections + date Année/Mois | US-COL-08 |
| Ajouts récents cliquables vers la fiche | US-ACC-05 |
| Pagination de la collection (20/page) | US-COL-09 |
| Filtrer la collection par numéro et édition | US-COL-10 |
| Bascule manuelle du thème clair/sombre | US-SET-01 |

**Livrables** : application corrigée sur les points relevés en condition réelle, prête à accueillir l'OCR (**177 tests / 29 suites, ~96 % de couverture**).

---

## 9. Phase 5 — Caméra / OCR

**Objectif** : Identifier un magazine sans code-barres à partir du flux caméra.

**Statut : Terminé ✓ (release `v0.5.0`)** — le pipeline logique (parsing, confiance, écran `/scan/camera`, repli US-ID-05) est livré et **entièrement testé**. Le module natif **`expo-mlkit-ocr`** (Google ML Kit, on-device) est **installé et branché** (plugins configurés dans `app.json`, `MlKitOcrEngine` par défaut dans `dependencies.initialize()`, capture photo via `takePictureAsync`), et la reconnaissance brute a été **validée sur téléphone physique** (dev build `eas build`). Deux correctifs post-test intégrés : **repli code-barres** en confiance insuffisante et **pré-remplissage** de la saisie manuelle avec les infos OCR (publication / numéro / année).

| Tâche | Story | Statut |
|---|---|---|
| Valider la librairie OCR native | US-ID-03 | Fait (`expo-mlkit-ocr`, validé device) |
| Intégrer le module OCR | US-ID-03 | Fait (`MlKitOcrEngine` par défaut, plugin configuré) |
| Extraire publication / numéro / date | US-ID-03 | Fait (parser testé) |
| Calculer la confiance | US-ID-03 | Fait (`ocrTextParser`) |
| Afficher les résultats + confiance | US-ID-03 | Fait (écran `/scan/camera`) |
| Proposer réessayer / saisie manuelle | US-ID-05 | Fait (confiance faible / inconnu) |
| Repli code-barres (confiance faible) | US-ID-05 | Fait (retour test physique) |
| Pré-remplir saisie manuelle avec l'OCR | US-ID-05 | Fait (publication / numéro / année) |
| Tests OCR (échecs de confiance) | US-QA-02 | Fait (parser, service, écran) |

**Livrables** : identification OCR + module natif branché (`expo-mlkit-ocr`) — validé sur téléphone physique (**211 tests / 31 suites, ~93 % de couverture**).

---

## 10. Phase 6 — Parcours complet

**Objectif** : Pouvoir effectuer toute l'utilisation réelle en brocante.

**Statut : Terminé ✓ (release `v0.6.0`)** — les étapes manquantes (résultat possédé/absent avec compte, gestion des doublons, scan en continu) sont livrées et testées. La boucle complète scan → identification → Possédé / Absent → ajout est fluidifiée.

| Tâche | Story | Statut |
|---|---|---|
| Écran choix de méthode | US-ID-01 | Fait (M-04) |
| Flux : scan → identification → Possédé / Absent | US-ID-02, US-ID-04 | Fait (résultat avec compte + ajout direct) |
| Flux : OCR → identification → Possédé / Absent | US-ID-03, US-ID-04 | Fait (M-05 + résultat) |
| Flux : manuel → vérification → Possédé / Absent | US-COL-01, US-ID-04 | Fait |
| Gestion de l'échec → méthode suivante | US-ID-05 | Fait (M-05) |
| Scan en continu (plusieurs magazines à la suite) | US-ID-06 | Fait (écran caméra maintenu, confirmation à chaque ajout) |
| Ajout direct depuis résultat (Absent) | US-ID-04 | Fait (« Ajouter à la collection ») |
| Gestion doublons | US-COL-06 | Fait (alerte « Exemplaires actuels : N », Ajouter quand même / Annuler) |
| Saisie manuelle avec saisie code-barres | US-COL-01 | Fait (bouton scan du formulaire) |

**Livrables** : parcours d'identification complet et fluide — **220 tests / 31 suites, ~94 % de couverture**.

---

## 11. Phase 7 — Export / Import

**Objectif** : Pouvoir sauvegarder et restaurer la collection sans serveur.

**Statut : Terminé ✓ (release `v0.7.0`)** — le service `BackupService`, la validation stricte (format / version / intégrité), la **double confirmation** et le **remplacement complet en transaction** sont livrés et testés.

| Tâche | Story | Statut |
|---|---|---|
| Export SQLite → JSON (`picsou-collection` v1) | US-BK-01 | Fait (`BackupService.exportCollection`) |
| Partage du fichier (expo-sharing) | US-BK-01 | Fait (`NativeFileGateway.writeExport`) |
| Sélection fichier (expo-document-picker) | US-BK-02 | Fait (`NativeFileGateway.pickAndReadJson`) |
| Validation format / version | US-BK-02, US-BK-03 | Fait (rejet via `InvalidBackupError`) |
| Import avec remplacement complet | US-BK-02 | Fait (`importCollection`, transaction) |
| Messages d'erreur explicites | US-BK-03 | Fait (écran Paramètres, section Sauvegarde) |
| Tests export/import | US-QA-02 | Fait (**242 tests / 33 suites, ~94 % de couverture**) |

**Livrables** : export/import fiable et testé — **242 tests / 33 suites, ~94 % de couverture**.

---

## 12. Phase 7R — Retours test physique (v0.7.0)

**Objectif** : corriger les retours du **test physique sur la release `v0.7.0`** — améliorer l'OCR (surcouche de scan ciblé, validation manuelle) et enrichir l'export/import (choix du format JSON / CSV).

**Statut : Terminé ✓ (release `v0.7.1`)** — issues livrées et clôturées (#125 → #129).

| Tâche | Story | Statut |
|---|---|---|
| Surcouche caméra (nom / numéro / édition) + scan ciblé | US-ID-08 | ✅ Livré |
| Recherche lancée après détection nom + numéro minimum | US-ID-08 | ✅ Livré |
| Affichage des infos détectées en confiance insuffisante | US-ID-09 | ✅ Livré |
| Correction / confirmation manuelle (outrepasser la confiance) | US-ID-09 | ✅ Livré |
| Règle déterministe de confiance trop stricte (message récurrent) | (bug) | ✅ Livré |
| Export avec choix du format (JSON / CSV) | US-BK-04 | ✅ Livré |
| Import avec choix du format (JSON / CSV) + vérification | US-BK-05 | ✅ Livré |

**Livrables** : OCR plus fiable et exploitable en conditions réelles ; sauvegarde au choix JSON ou CSV.

---

## 13. Phase 8 — Optimisation & qualité

**Objectif** : Application performante, couverture de tests satisfaisante.

| Tâche | Story |
|---|---|
| Mesurer et optimiser le démarrage | — |
| Optimiser les requêtes SQLite | — |
| Limiter le traitement caméra / OCR | — |
| Tests sur téléphone peu performant | — |
| Tests avec collection volumineuse | — |
| Atteindre les seuils de coverage | US-QA-02 |
| Vérifier consommation mémoire / stockage | — |

**Livrables** : application optimisée, couverture ≥ 80 %.

**Statut : Terminé ✓ (release `v0.8.0`)** — livraison `perf(collection)` (#137) :
- démarrage **parallèle** (thème + résumé de collection) ;
- **accueil léger** : `loadSummary()` (`COUNT(*)` + 5 ajouts récents) au lieu de la liste complète à chaque focus ; liste complète uniquement sur l'écran « Ma Collection » ;
- OCR **déjà borné** (1 analyse / 500 ms avec garde anti-chevauchenent, `ANALYSIS_INTERVAL_MS` dans `camera.tsx`) — conforme ;
- **seuil de couverture CI fixé à 80 % global** (`US-QA-02`, #27), état mesuré ~90 % (statements 90,2 %, branches 85,4 %).

> ⏳ Tâches terrain restantes (mémoire / stockage, téléphone peu performant, collection volumineuse) : reportées en **Phase 9** — validations sur appareil réel.

---

## 14. Phase 10 — Refonte UI/UX « Vault Lisible » (M-10 → v0.9.0)

**Objectif** : véritable amélioration UI/UX avant publication — SafeZone, contraste
WCAG AA, TabBar à icônes (Expo Vector Icons Feather), sémantique Possédé=vert,
parcours brocante < 3s à 1 main.

| Tâche | Story / Issue |
|---|---|
| Tokens + typo + contraste (fini `#FDD835` en texte clair) | US-UX-01 / M10-01 |
| SafeZone globale + caméra responsive | US-UX-02 / M10-02 |
| TabBar icônes + routes Stack + fallback nav | US-UX-03 / M10-03 |
| Accueil cockpit, Collection, Fiche/Edit | US-UX-04 / M10-04..06 |
| Scan barcode/result/multiple + OCR/manual | US-UX-04 / M10-07..08 |
| Settings backup (Annuler, busy) | M10-09 |
| Accessibilité + lisibilité (0 emoji UI, 44px) | US-UX-05 / M10-10 |
| Empty/Loading/Error + Toast partagés | US-UX-06 / M10-11 |
| Docs + scripts `gh` | M10-12 |

**Livrables** : 12 issues M10-01..12, `docs/issues/M10-*.md`, `scripts/m10-*.sh`,
`docs/design/M10-TOKENS.md`. Détail : [docs/issues/M10-MILESTONE.md](issues/M10-MILESTONE.md).

**Statut : À venir** — prérequis de Phase 9.

---

## 15. Phase 9 — Tests terrain & publication

**Objectif** : Validation réelle et publication Play Store.

| Tâche | Story |
|---|---|
| Test avec magazines réels (nouveaux, anciens, abîmés) | — |
| Test en conditions réelles (brocante, réseau absent) | — |
| Corrections finales | — |
| Build AAB (EAS Build) | US-QA-03 |
| Préparer la fiche Play Store (ASO) | — |
| Publication Play Store | — |

**Livrables** : application validée et publiée.

---

## 16. Critères de sortie de chaque phase

Pour chaque phase, les critères de sortie sont :

- [ ] Toutes les tâches du milestone sont terminées ;
- [ ] Les tests sont verts (CI verte) ;
- [ ] Le typecheck passe sans erreur ;
- [ ] Le lint passe sans erreur ;
- [ ] La fonctionnalité est testée manuellement ;
- [ ] La documentation est mise à jour si nécessaire ;
- [ ] La branche `develop` contient le code livré ;
- [ ] La release (tag) est créée.

---

## Récapitulatif

| Phase | Objectif | Issues | Nb |
|---|---|---|---|
| 0 — Cadrage | Décisions techniques, docs, design, org | `DOC-*`, `DESIGN-*`, `ORG-*` | 19 |
| 1 — Initialisation | Projet Expo opérationnel | `SETUP-01..11` | 11 |
| 2 — Base de données | Persistance SQLite | US-DB-01..05 | 5 |
| 3 — Interface | Écrans principaux | US-ACC-01..04, US-COL-01..05, US-QA-01 | 10 |
| 4 — Scan code-barres | Identification EAN-13 | US-ID-01, US-ID-02 | 2 |
| 4R — Retours test | Corrections & UX post-test | US-ACC-05, US-COL-07..10, US-ID-07, US-SET-01 | 7 |
| 5 — OCR | Identification par caméra | US-ID-03, US-ID-05 | 2 |
| 6 — Parcours complet | Boucle complète | US-ID-04, US-ID-06, US-COL-06 | 3 |
| 7 — Export / Import | Sauvegarde | US-BK-01..03 | 3 |
| 7R — Retours test | Retours v0.7.0 (OCR + format) | US-ID-08..09 (1 bug), US-BK-04..05 | 5 |
| 8 — Optimisation | Performance | US-QA-02 | 1 |
| 9 — Publication | Play Store | US-QA-03 | 1 |
| **Total** | | | **69** |
