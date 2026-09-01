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
8. [Phase 5 — Caméra / OCR](#8-phase-5--caméra--ocr)
9. [Phase 6 — Parcours complet](#9-phase-6--parcours-complet)
10. [Phase 7 — Export / Import](#10-phase-7--export--import)
11. [Phase 8 — Optimisation & qualité](#11-phase-8--optimisation--qualité)
12. [Phase 9 — Tests terrain & publication](#12-phase-9--tests-terrain--publication)
13. [Critères de sortie de chaque phase](#13-critères-de-sortie-de-chaque-phase)

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
Phase 1  ▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒  À venir
Phase 2  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░  À venir
Phase 3  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░  À venir
Phase 4  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░  À venir
Phase 5  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░  À venir
Phase 6  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░  À venir
Phase 7  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░  À venir
Phase 8  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░  À venir
Phase 9  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░  À venir
```

### 2.1 Correspondance phase ↔ milestone ↔ issues

Chaque phase de la roadmap correspond à un **milestone GitHub** (`M-0x`) et à un ensemble d'**issues** assurant le suivi dans le Kanban.

| Phase | Milestone | Issues | Nb |
|---|---|---|---|
| 0 — Cadrage | `M-00 — Cadrage, conception & documentation` | `DOC-01..15`, `DESIGN-01..02`, `ORG-01..02` | 19 |
| 1 — Initialisation | `M-01 — Initialisation technique` | `SETUP-01..10` | 10 |
| 2 — Base de données | `M-02 — Base de données` | `US-DB-01..05` | 5 |
| 3 — Interface | `M-03 — Interface principale` | `US-ACC-01..04`, `US-COL-01..05`, `US-QA-01` | 10 |
| 4 — Scan code-barres | `M-04 — Scan code-barres` | `US-ID-01..02` | 2 |
| 5 — Caméra / OCR | `M-05 — Caméra / OCR` | `US-ID-03`, `US-ID-05` | 2 |
| 6 — Parcours complet | `M-06 — Parcours complet` | `US-ID-04`, `US-ID-06`, `US-COL-06` | 3 |
| 7 — Export / Import | `M-07 — Export / Import` | `US-BK-01..03` | 3 |
| 8 — Optimisation & qualité | `M-08 — Optimisation & qualité` | `US-QA-02` | 1 |
| 9 — Tests & publication | `M-09 — Tests terrain & publication` | `US-QA-03` | 1 |
| **Total** | | | **56** |

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
| Configurer `.gitignore` | — |
| Initialiser `CHANGELOG.md` | — |

**Livrables** : projet vide, installable et débogable sur téléphone.

---

## 5. Phase 2 — Base de données

**Objectif** : Pouvoir gérer toute la collection sans caméra.

| Tâche | Story |
|---|---|
| Schéma SQL `magazines` + `collection_items` | US-DB-01 |
| Gestion des migrations (`PRAGMA user_version`) | US-DB-01 |
| Repository `magazineRepository` (CRUD) | US-DB-02, US-DB-03, US-DB-04 |
| Repository `collectionRepository` (exemplaires) | US-DB-05 |
| Service `collectionService` | — |
| Tests unitaires repositories | US-QA-02 |

**Livrables** : couche persistance testée et fonctionnelle.

---

## 6. Phase 3 — Interface principale

**Objectif** : Disposer d'une application utilisable manuellement.

| Tâche | Story |
|---|---|
| Écran Accueil (compteur + boutons + récents) | US-ACC-01, US-ACC-02, US-ACC-03, US-ACC-04 |
| Écran Ma Collection (liste + recherche) | US-COL-02 |
| Écran Fiche Magazine (détail + édition) | US-COL-03, US-COL-04, US-COL-05 |
| Navigation inférieure (tabs) | — |
| Thème clair + design system | US-QA-01 |
| États de chargement / erreur / vide | — |
| Messages de confirmation | — |

**Livrables** : application avec navigation, écrans fonctionnels, thème appliqué.

---

## 7. Phase 4 — Scan code-barres

**Objectif** : Pouvoir identifier rapidement un magazine en brocante.

| Tâche | Story |
|---|---|
| Intégrer `expo-camera` | US-ID-01 |
| Demander la permission caméra | — |
| Afficher le preview avec réticule | US-ID-02 |
| Détecter et lire un EAN-13 / ISBN | US-ID-02 |
| Rechercher l'édition par code-barres | US-ID-02 |
| Afficher code inconnu + méthodes secours | US-ID-02 |
| Tests unitaires `scanBarcode` | US-QA-02 |

**Livrables** : fonctionnalité scan code-barres opérationnelle.

---

## 8. Phase 5 — Caméra / OCR

**Objectif** : Identifier un magazine sans code-barres à partir du flux caméra.

| Tâche | Story |
|---|---|
| Valider la librairie OCR native | US-ID-03 |
| Intégrer le module OCR | US-ID-03 |
| Extraire publication / numéro / date | US-ID-03 |
| Calculer la confiance | US-ID-03 |
| Afficher les résultats + confiance | US-ID-03 |
| Proposer réessayer / saisie manuelle | US-ID-05 |
| Tests OCR (échecs de confiance) | US-QA-02 |

**Livrables** : identification OCR fonctionnelle avec gestion de confiance.

---

## 9. Phase 6 — Parcours complet

**Objectif** : Pouvoir effectuer toute l'utilisation réelle en brocante.

| Tâche | Story |
|---|---|
| Écran choix de méthode | US-ID-01 |
| Flux : scan → identification → Possédé / Absent | US-ID-02, US-ID-04 |
| Flux : OCR → identification → Possédé / Absent | US-ID-03, US-ID-04 |
| Flux : manuel → vérification → Possédé / Absent | US-COL-01, US-ID-04 |
| Gestion de l'échec → méthode suivante | US-ID-05 |
| Scan en continu (plusieurs magazines à la suite) | US-ID-06 |
| Ajout direct depuis résultat (Absent) | US-ID-04 |
| Gestion doublons | US-COL-06 |
| Saisie manuelle avec saisie code-barres | US-COL-01 |

**Livrables** : parcours d'identification complet et fluide.

---

## 10. Phase 7 — Export / Import

**Objectif** : Pouvoir sauvegarder et restaurer la collection sans serveur.

| Tâche | Story |
|---|---|
| Export SQLite → JSON (`picsou-collection` v1) | US-BK-01 |
| Partage du fichier (expo-sharing) | US-BK-01 |
| Sélection fichier (expo-document-picker) | US-BK-02 |
| Validation format / version | US-BK-02, US-BK-03 |
| Import avec remplacement complet | US-BK-02 |
| Messages d'erreur explicites | US-BK-03 |
| Tests export/import | US-QA-02 |

**Livrables** : export/import fiable et testé.

---

## 11. Phase 8 — Optimisation & qualité

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

---

## 12. Phase 9 — Tests terrain & publication

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

## 13. Critères de sortie de chaque phase

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
| 1 — Initialisation | Projet Expo opérationnel | `SETUP-01..10` | 10 |
| 2 — Base de données | Persistance SQLite | US-DB-01..05 | 5 |
| 3 — Interface | Écrans principaux | US-ACC-01..04, US-COL-01..05, US-QA-01 | 10 |
| 4 — Scan code-barres | Identification EAN-13 | US-ID-01, US-ID-02 | 2 |
| 5 — OCR | Identification par caméra | US-ID-03, US-ID-05 | 2 |
| 6 — Parcours complet | Boucle complète | US-ID-04, US-ID-06, US-COL-06 | 3 |
| 7 — Export / Import | Sauvegarde | US-BK-01..03 | 3 |
| 8 — Optimisation | Performance | US-QA-02 | 1 |
| 9 — Publication | Play Store | US-QA-03 | 1 |
| **Total** | | | **56** |
