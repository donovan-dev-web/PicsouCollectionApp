# 🦆 Picsou Collection — Spécification Fonctionnelle

> **Document de référence — v1.0**
>
> Ce document décrit les exigences fonctionnelles de l'application, écran par écran et flux par flux. Il est la référence pour l'implémentation et les tests.

---

## Table des matières

1. [Les écrans](#1-les-écrans)
2. [Écran Accueil](#2-écran-accueil)
3. [Écran Scanner / Choix de méthode](#3-écran-scanner--choix-de-méthode)
4. [Flux Code-barres](#4-flux-code-barres)
5. [Flux Caméra / OCR](#5-flux-caméra--ocr)
6. [Flux saisie manuelle](#6-flux-saisie-manuelle)
7. [Écran Résultat](#7-écran-résultat)
8. [Gestion des doublons](#8-gestion-des-doublons)
9. [Écran Ma Collection](#9-écran-ma-collection)
10. [Fiche Magazine](#10-fiche-magazine)
11. [Écran Paramètres](#11-écran-paramètres)
12. [Export JSON](#12-export-json)
13. [Import JSON](#13-import-json)
14. [Règles transverses](#14-règles-transverses)

---

## 1. Les écrans

L'application comporte les écrans suivants (navigation Expo Router) :

| Écran | Route | Objectif |
|---|---|---|
| Accueil | `/` | Cockpit : compteur + actions principales |
| Choix méthode | `/scan` | Choix code-barres / caméra / manuel |
| Scanner code-barres | `/scan/barcode` | Scan EAN-13 / ISBN |
| Caméra / OCR | `/scan/camera` | Reconnaissance par flux caméra |
| Saisie manuelle | `/scan/manual` | Formulaire de saisie |
| Résultat | `/scan/result` | Possédé / Absent |
| Plusieurs éditions | `/scan/multiple` | Code-barres → liste d'éditions |
| Ma Collection | `/collection` | Liste, recherche, filtres |
| Fiche Magazine | `/collection/[id]` | Détail d'une édition |
| Paramètres | `/settings` | Sauvegarde, données, version |
| Export | `/settings/export` | Export JSON |
| Import | `/settings/import` | Import JSON |

---

## 2. Écran Accueil

### Objectif
Donner immédiatement au collectionneur l'état de sa collection et les deux actions principales.

### Éléments
- **Compteur** : nombre de magazines possédés (grand chiffre).
- **Boutons principaux** :
  - **Scanner** — prioritaire, jaune Picsou, pilule ;
  - **Ajouter** — secondaire.
- **Ajouts récents** : liste des derniers exemplaires ajoutés.
- **Navigation inférieure** : Accueil / Ma Collection / Paramètres.

### Comportement
- Le compteur et la liste des ajouts sont chargés depuis la base au focus de l'écran ;
- Le bouton **Scanner** mène vers `/scan` (choix de méthode) ;
- Le bouton **Ajouter** mène vers `/scan/manual` (saisie rapide).

### États
- `loading` : indicateur ;
- `data` : compteur + liste.

---

## 3. Écran Scanner / Choix de méthode

### Objectif
Proposer les trois méthodes d'identification. La barre de navigation est masquée pour concentrer l'attention.

### Éléments
```
Identifier le magazine

[ ▣ Scanner le code-barres ]
[ 📷 Identifier avec la caméra ]
[ ✎ Saisir manuellement ]

            Annuler
```

### Comportement
- Trois boutons mènent chacun vers leur flux ;
- Après un **échec** d'une méthode, le flux propose les méthodes restantes sans reproposer celle qui a échoué.

---

## 4. Flux Code-barres

### 4.1 Écran `/scan/barcode`

**Éléments** : aperçu caméra avec réticule, bouton annuler.

**Comportement** :
1. Demandé la permission caméra (au premier accès) ;
2. Détection d'un code-barres EAN-13 / ISBN ;
3. Lecture du code ;
4. Recherche locale via `magazines.barcode`.

> ### ⚠️ Point clé à retenir
> Le code-barres est un **identifiant externe**, pas une fiche complète. **Le scan seul ne crée jamais une édition.** Il ne permet que de **retrouver une édition déjà enregistrée dans la base** (par son code-barres).
> - Si le code est **connu** → on peut vérifier la possession et ajouter un exemplaire.
> - Si le code est **inconnu** → le scan seul ne suffit pas, il faut **saisir manuellement** (publication, numéro, édition, etc.) au moins une fois. C'est cette saisie qui associe le code-barres à l'édition.

### 4.2 Code connu

Si le code-barres correspond à une édition **enregistrée** dans la base, le scan transmet `id`, `publication` et `issueNumber` à l'**écran Résultat** (voir §7.1) :

```
ℹ️ → Écran Résultat « Déjà dans votre collection »
       [ Voir la fiche ] [ Scanner à nouveau ] [ Saisir manuellement ]
```

Le collectionneur peut consulter la fiche de l'édition ou continuer à scanner.

### 4.3 Code inconnu

Si le code-barres n'est associé à **aucune édition**, le scan transmet le `barcode` à l'**écran Résultat** (voir §7.2), qui propose de **saisir manuellement** l'édition (le scan seul ne crée jamais l'édition, voir §4.1) :

```
ℹ️ → Écran Résultat « Absent de la collection »
       [ Scanner à nouveau ] [ Saisir manuellement ] (code-barres pré-rempli)
```

### 4.4 Scan en continu / scan multiple

> **Origine :** retour client (UX). Proposer le scan de **plusieurs magazines à la suite**, sans fermer puis rouvrir l'écran à chaque fois.

**Comportement :**
1. L'utilisateur reste sur l'écran caméra après un scan réussi ;
2. Chaque fois qu'un exemplaire est **ajouté**, un **pop-up de confirmation** s'affiche brièvement (ex. « Picsou Magazine n°547 ajouté à la collection ») ;
3. L'utilisateur peut immédiatement scanner le magazine suivant, sans quitter l'écran ;
4. Un bouton permet d'**arrêter** le mode scan en continu.

**Règles :**
- Le scan en continu s'applique aux **code-barres déjà connus** en base ;
- Si un code-barres est **inconnu** pendant un scan en continu, l'application propose de **basculer en saisie manuelle** (le code-barres seul ne crée jamais l'édition, voir 4.1) ;
- Chaque ajout est confirmé individuellement pour éviter les doublons involontaires.

---

## 5. Flux Caméra / OCR

### 5.1 Écran `/scan/camera`

**Éléments** : flux caméra, overlay de cadrage, indicateur de traitement.

**Comportement** :
1. Analyser quelques frames / seconde (pas toutes) ;
2. Extraire le texte via OCR (publication, numéro, date) ;
3. Calculer un niveau de confiance ;
4. Arrêter l'analyse dès que le résultat est suffisamment fiable ;
5. **Aucune image n'est enregistrée** — analyse éphémère.

### 5.2 Résultat OCR

```
Picsou Magazine
N° 547
Mars 2023

Confiance : élevée

[ ✓ Confirmer ]
[ Réessayer ]
[ Saisie manuelle ]
```

### 5.3 Confiance insuffisante

```
Impossible d'identifier précisément ce magazine.

[ Réessayer avec la caméra ]
[ Saisir manuellement ]
```

L'application **ne présente jamais** une identification OCR comme certaine.

---

## 6. Flux saisie manuelle

### 6.1 Écran `/scan/manual`

**Éléments** : formulaire court.

```
Publication    [ Picsou Magazine ▼ ]
Numéro         [ 547 ]
Édition        [ Française ▼ ]
Code-barres    [ (facultatif) ]
Date           [ (facultatif) ]

[ Vérifier ]
```

### 6.2 Comportement
- `publication` obligatoire ;
- numéro, édition, code-barres, date facultatifs ;
- la recherche utilise l'ensemble des informations disponibles (jamais le seul numéro) ;
- la saisie du code-barres est **volontairement proposée** ici : c'est la seule façon d'associer un code-barres à une édition (voir `02-CONCEPTUAL-MODEL.md`).

---

## 7. Écran Résultat

> **Origine (retour test physique, #93) :** cet écran est la cible de la navigation après un scan de code-barres. Il distingue deux situations selon que le code-barres est déjà lié à une édition de la base ou non.

Le flux scanner aboutit sur `/scan/result` en transmettant par paramètres :
- `id` (éditer si le code est **connu**), `publication`, `issueNumber` ;
- `barcode` (toujours, pour récupérer la saisie manuelle en cas de code inconnu).

### 7.1 Magazine déjà possédé (code connu)

Si le code-barres correspond à une édition enregistrée, l'écran affiche `Déjà dans votre collection` avec la fiche de l'édition.

```
Déjà dans votre collection

┌───────────────────────────────┐
│          Picsou Magazine      │
│             N° 547            │
└───────────────────────────────┘

[ Voir la fiche ]
[ Scanner à nouveau ]
[ Saisir manuellement ]
```

- **Voir la fiche** → `/collection/[id]` (remplace le résultat par la fiche d'édition) ;
- **Scanner à nouveau** → `/scan/barcode` ;
- **Saisir manuellement** → `/scan/manual`.

### 7.2 Magazine non possédé (code inconnu)

Si le code-barres est **inconnu**, l'écran affiche `Absent de la collection` : le scan seul ne crée jamais l'édition (voir §4.1), il faut la saisir manuellement.

```
Absent de la collection

┌───────────────────────────────┐
│ Ce magazine n'existe pas     │
│ encore dans votre collection.│
│                               │
│ Code-barres : 3271234000011  │
└───────────────────────────────┘

[ Scanner à nouveau ]
[ Saisir manuellement ]
```

- **Scanner à nouveau** → `/scan/barcode` ;
- **Saisir manuellement** → `/scan/manual` en pré-remplissant le code-barres scanné, pour accélérer la création de l'édition.

### 7.3 Plusieurs éditions pour un même code-barres

> **Origine (retours M-04R) :** un code-barres n'est pas unique (voir §8) ; le même code peut correspondre à plusieurs éditions (numéros/éditions différents). Le flux mène alors vers `/scan/multiple`.

L'écran `/scan/multiple` affiche le **nombre d'éditions** correspondant au code scanné et une **liste cliquable** : chaque ligne mène à la fiche de l'édition correspondante.

```
Plusieurs éditions pour ce code

2 éditions trouvées
Code-barres : 3271234000011

┌───────────────────────────────┐
│  Picsou Magazine      n° 547  │
│  🔴 Possédé (1)               │
└───────────────────────────────┘
┌───────────────────────────────┐
│  Picsou Magazine      n° 548  │
│  🟢 Absent                    │
└───────────────────────────────┘

[ Scanner à nouveau ]
```

- **Chaque ligne** → `/collection/[id]` (fiche de l'édition) ;
- **Scanner à nouveau** → `/scan/barcode`.

---

## 8. Gestion des doublons

Lorsque l'utilisateur essaie d'ajouter une édition déjà possédée :

```
⚠️ Vous possédez déjà ce magazine.
Exemplaires actuels : 1

Voulez-vous ajouter un deuxième exemplaire ?

[ Ajouter quand même ]
[ Annuler ]
```

- Choix laissé à l'utilisateur ;
- chaque exemplaire conserve sa propre fiche (état, notes, date).

---

## 9. Écran Ma Collection

### Objectif
Inventaire complet et consultable de la collection.

### Éléments
- Champ de **recherche** (titre ou numéro) ;
- **Zone de listes** : chaque entrée affiche publication, numéro en grand, badge de statut (Possédé / Absent) ;
- **Bouton flottant de scanner** : lance le scan (dont le **scan en continu**, voir 4.4) grâce auquel on peut ajouter plusieurs magazines à la suite depuis la collection.

### Fonctions (MVP)
- liste ;
- recherche (par titre / publication / numéro) ;
- **filtres pertinents** : type de publication, époque (plage d'années), numéro ;
- lancement du scan (y compris scan en continu) ;
- consultation d'une édition ;
- (la modification et la suppression sont gérées dans la fiche).

> **Décision (retour client) :** le filtre par **statut de possession** est **supprimé**. La base étant construite à partir des possessions de l'utilisateur, toutes les éditions enregistrées sont de fait possédées : ce filtre n'a pas de valeur. On conserve uniquement les filtres utiles (publication, époque, numéro).

### Comportement
- la liste utilise la requête légère (pas de `notes`/`ocr_text`) ;
- le score `quantity` détermine le badge de statut.

---

## 10. Fiche Magazine

### 10.1 Écran `/collection/[id]`

**Éléments** :
- bannière de statut (Possédé 🔴 / Absent 🟢) ;
- numéro en grand ;
- chips de métadonnées (publication, édition, langue, état, date) ;
- code-barres ;
- liste des **exemplaires** avec, pour chacun : notes, date d'ajout.

> **Retour client (UX) :** l'information **essentielle** de la fiche est la réponse « possédé ou non ». Les champs de détail des exemplaires (état, notes, date) sont un **bonus**, toujours **optionnels** et jamais obligatoires. Ils ne doivent jamais ralentir le parcours principal.

### 10.2 Actions de la fiche
- **Ajouter un exemplaire** (avec état et notes optionnels) ;
- **Modifier** l'édition (publication, numéro, etc.) ;
- **Supprimer** un exemplaire ;
- **Supprimer** l'édition (cascade sur ses exemplaires), avec confirmation.

---

## 11. Écran Paramètres

```
⚙️ Paramètres

Sauvegarde
  → Exporter la collection
  → Importer une collection

Données
  → Nombre de magazines

Application
  → Version
```

- **Exporter** : génère le fichier JSON et ouvre la feuille de partage ;
- **Importer** : sélectionne un fichier, le valide, demande confirmation, puis remplace ou fusionne.

---

## 12. Export JSON

### Comportement
1. Read toutes les éditions + leurs exemplaires depuis SQLite ;
2. Construit le fichier au format `picsou-collection` v1 (voir `06-DATA-MODEL.md`) ;
3. Écrit dans un fichier temporaire (`expo-file-system`) ;
4. Propose le partage / enregistrement (`expo-sharing`).

### Règles
- export complet (toutes les éditions et exemplaires) ;
- format portable et lisible ;
- jamais une copie brute de SQLite.

---

## 13. Import JSON

### 13.1 Flux
```
Sélection du fichier
      ↓
Validation
      ↓
Vérification version
      ↓
Lecture des données
      ↓
Confirmation
      ↓
Import SQLite
```

### 13.2 Validations
L'application vérifie :
- que le fichier est bien un export de l'application (`format === "picsou-collection"`) ;
- que la version est compatible (`version === 1`) ;
- que les données sont valides et sans corruption évidente.

### 13.3 Stratégie de conflit (décision retenue)
**Remplacement complet** : après confirmation explicite, la collection existante est remplacée par celle du fichier importé.

> ⚠️ Cette stratégie écrase les données existantes. Une **validation robuste** et une **double confirmation** sont indispensables pour éviter toute perte accidentelle.

---

## 14. Règles transverses

### 14.1 Identité des données
- le numéro seul ne suffit **jamais** : l'identification combine publication + numéro + édition + langue + date.

### 14.2 Pas de persistance d'images
- les frames caméra et les résultats OCR sont éphémères.

### 14.3 Contexte hors ligne
- aucune opération ne dépend d'Internet.

### 14.4 Confirmation avant destruction
- toute suppression définitive (édition) ou remplacement (import) exige une confirmation.

### 14.5 Exactitude des statuts
- le statut Possédé/Absent est **toujours** dérivé du nombre d'exemplaires réel et non d'un champ stocké.

---

## Récapitulatif des choix fonctionnels

| Fonction | MVP |
|---|---|
| Accueil | ✅ |
| Scanner code-barres | ✅ |
| Caméra / OCR | ✅ |
| Saisie manuelle | ✅ |
| Résultat Possédé / Absent | ✅ |
| Gestion des doublons | ✅ |
| Ma Collection (liste + recherche) | ✅ |
| Fiche (modif / suppression) | ✅ |
| Export JSON | ✅ |
| Import JSON (remplacement) | ✅ |
