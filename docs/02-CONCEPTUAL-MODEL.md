# 🦆 Picsou Collection — Modèle Conceptuel

> **Document de référence — v1.0**
>
> Ce document décrit le modèle conceptuel du domaine : les entités, leurs relations, les règles métier et les flux d'identification. Il est indépendant de toute implémentation technique.

---

## Table des matières

1. [Vue d'ensemble](#1-vue-densemble)
2. [Les concepts fondamentaux](#2-les-concepts-fondamentaux)
3. [Hiérarchie des entités](#3-hiérarchie-des-entités)
4. [Entités et attributs](#4-entités-et-attributs)
5. [Relations entre entités](#5-relations-entre-entités)
6. [La notion de code-barres](#6-la-notion-de-code-barres)
7. [Règles métier](#7-règles-métier)
8. [Le processus d'identification](#8-le-processus-didentification)
9. [Le principe Possédé / Absent](#9-le-principe-possédé--absent)
10. [Exemples concrets](#10-exemples-concrets)

---

## 1. Vue d'ensemble

Le domaine est construit autour d'une distinction fondamentale entre **trois niveaux d'abstraction** :

1. **Publication** — la série (ex. *Picsou Magazine*) ;
2. **Édition** — un numéro précis dans une édition donnée (ex. *Picsou Magazine n°547, édition standard FR*) ;
3. **Exemplaire** — le magazine physique réellement possédé.

```
Publication
    │
    └── Édition (un numéro précis)
            │
            └── Exemplaire (exemplaires physiques possédés)
```

Cette distinction est le cœur du modèle. Le **numéro seul ne suffit jamais** à identifier une édition.

---

## 2. Les concepts fondamentaux

### 2.1 Publication
La série de magazines. Exemples : *Picsou Magazine*, *Super Picsou Géant*, *Mickey Parade*, *Les Trésors de Picsou*.

### 2.2 Édition
Un magazine précis et unique : une combinaison de **publication + numéro + édition + pays + date**. C'est l'entité centrale qui porte l'identifiant interne (`issue_id`).

### 2.3 Exemplaire
L'exemplaire physique réellement possédé, rattaché à une édition. Chaque exemplaire a son propre état, ses notes et sa date d'ajout.

### 2.4 Code-barres
Identifiant externe (EAN-13 ou ISBN) permettant de retrouver une édition. Un code-barres **n'identifie pas** un exemplaire physique.

---

## 3. Hiérarchie des entités

```
PUBLICATION (série)
     │
     │  1:N
     ▼
ÉDITION (magazine précis)
     │
     ├── 1:N  Code-barres
     └── 1:N  Exemplaires
```

---

## 4. Entités et attributs

### 4.1 Publication — (implicite)
La publication est représentée textuellement par le champ `publication` de l'édition (normalisé en minuscules). Elle n'est volontairement **pas** une table séparée du modèle conceptuel, pour rester simple et flexible. Une validation visuelle de la publication reste possible via la saisie assistée.

| Attribut | Type | Description |
|---|---|---|
| `name` | string | Nom de la série (ex. "Picsou Magazine") |

> **Décision :** la publication est un attribut de l'édition, pas une entité référentielle. Cela évite une table supplémentaire sans apport fonctionnel pour un usage personnel.

### 4.2 Édition (entité centrale `magazines`)

| Attribut | Type | Obligatoire | Description |
|---|---|---|---|
| `id` | UUID | ✅ | Identifiant interne unique de l'édition |
| `publication` | string | ✅ | Nom de la série |
| `issueNumber` | number | ❌ | Numéro (facultatif, certains hors-séries) |
| `edition` | string | ❌ | Édition (ex. "standard", "spéciale") |
| `country` | string | ❌ | Code pays (ex. "FR") |
| `publicationDate` | string | ❌ | Date ISO (ex. "2023-03") |
| `barcode` | string | ❌ | Code-barres principal |
| `createdAt` | ISO 8601 | ✅ | Date de création |
| `updatedAt` | ISO 8601 | ✅ | Date de modification |

### 4.3 Exemplaire (entité `collection_items`)

| Attribut | Type | Obligatoire | Description |
|---|---|---|---|
| `id` | UUID | ✅ | Identifiant unique de l'exemplaire |
| `magazineId` | UUID | ✅ | Référence vers l'édition |
| `condition` | string | ❌ | État (ex. "bon", "moyen") |
| `notes` | string | ❌ | Notes personnelles |
| `dateAdded` | ISO 8601 | ✅ | Date d'ajout de l'exemplaire |

---

## 5. Relations entre entités

```
magazines ─┬── 1:N ──> code-barres        (dans edition.barcode)
           │
           └── 1:N ──> collection_items   (exemplaires possédés)
```

### 5.1 Édition → Code-barres
Une édition peut avoir **au plus un code-barres principal** dans le MVP (attribut `barcode`). Le passage à plusieurs codes-barres par édition est une évolution possible.

### 5.2 Édition → Exemplaires
Une édition peut avoir **zéro ou plusieurs** exemplaires. Le nombre d'exemplaires s'obtient en comptant les `collection_items`.

---

## 6. La notion de code-barres

### 6.1 Formats supportés
- **EAN-13** : format principal des magazines Disney récents ;
- **ISBN** : pour les magazines ayant un ISBN.

### 6.2 Règles
- Un code-barres est un **identifiant externe** : il permet de retrouver une édition ;
- Un code-barres ne désigne **pas** un exemplaire physique ;
- Un code-barres donné correspond à **au plus une** édition dans la base locale.

### 6.3 Origine des codes-barres
La seule source d'enrichissement des codes-barres est **l'ajout manuel** : l'utilisateur associe manuellement un code-barres à une édition. Il n'existe pas de base pré-remplie ni d'API externe.

> **Conséquence opérationnelle :** le premier scan d'une édition inconnue échoue (`code-barres inconnu`), puis l'utilisateur l'ajoute manuellement avec son code-barres, et les scans suivants fonctionnent. Ce flux doit être guidé par l'UI.

---

## 7. Règles métier

### R1 — Identifiant interne
Chaque édition possède un identifiant interne (`UUID`), indépendant du numéro, du code-barres, de la publication et de la date.

### R2 — Le numéro seul n'est jamais suffisant
L'identification combine toujours le maximum d'informations disponibles :
```
Publication + Numéro + Édition + Pays + Date
```

### R3 — Un code-barres unique vers une édition
Dans la base locale, un code-barres ne peut pointer que vers une seule édition.

### R4 — Une édition peut avoir plusieurs exemplaires
Posséder deux exemplaires du même numéro est permis et légitime.

### R5 — Une édition inconnue peut être créée
La base se construit progressivement. Lorsqu'une édition est inconnue, elle peut être créée. La création d'une édition à partir d'une identification automatique (code-barres/OCR) doit être **confirmée** par l'utilisateur avant persistance.

### R6 — Gestion des doublons sans jugement
Si l'utilisateur ajoute une édition déjà possédée, l'application l'avertit puis lui laisse le choix d'ajouter un second exemplaire.

### R7 — Aucun stockage d'images
Les images utilisées pour l'OCR ou le scan sont éphémères et jamais persistées.

### R8 — Confiance OCR
Une identification OCR n'est jamais présentée comme certaine : un niveau de confiance explicite est affiché. En cas de confiance insuffisante, l'utilisateur peut réessayer ou saisir manuellement.

---

## 8. Le processus d'identification

### 8.1 Vue générale

```
Méthode d'identification
        ↓
Identification de l'édition
        ↓
Recherche dans la collection (SQLite)
        ↓
┌───────────────┬───────────────┐
│               │               │
Possédé         Absent
│               │
🔴 POSSÉDÉ      🟢 ABSENT
```

### 8.2 Identification ≠ présence dans la collection
Une distinction fondamentale est maintenue entre :
- **Identification** : *« Quel est ce magazine ? »*
- **Collection** : *« Est-ce que je possède cette édition ? »*

Cette séparation permet de conserver une architecture propre, indépendante de la méthode utilisée.

### 8.3 L'ordre des méthodes en cas d'échec
```
Code-barres inconnu
      ↓
[ Essayer avec la caméra (OCR) ]
      ↓
[ Saisir manuellement ]
```

L'utilisateur vient de proche en proche sur la méthode qui fonctionne. Une méthode qui vient d'échouer n'est pas reproposée.

---

## 9. Le principe Possédé / Absent

Après identification de l'édition :

| Condition | Résultat |
|---|---|
| `nombre d'exemplaires = 0` | 🟢 **Absent** — proposer l'ajout |
| `nombre d'exemplaires > 0` | 🔴 **Possédé** — afficher le nombre d'exemplaires, proposer l'ajout volontaire d'un doublon |

---

## 10. Exemples concrets

### Exemple 1 — Deux publications, même numéro (légitime confusion)

```
Picsou Magazine     → n° 30, édition standard, FR
Super Picsou Géant  → n° 30, édition standard, FR
```

Ce sont **deux éditions différentes** (deux `id` distincts). L'utilisateur peut posséder l'une, l'autre, ou les deux.

### Exemple 2 — Édition à plusieurs exemplaires

```
Picsou Magazine n°547 (une seule édition)
    ├── Exemplaire 1 : état "bon", acheté 0,50 € à Lille
    └── Exemplaire 2 : état "moyen", acheté en brocante
```

### Exemple 3 — Édition avec code-barres

```
Picsou Magazine n°547, édition standard, FR
    └── barcode : 3271234567890 (EAN-13)
```

Le scan de `3271234567890` retrouve l'édition, puis le statut Possédé/Absent est déduit des exemplaires.

---

## 11. Récapitulatif des décisions conceptuelles

| Sujet | Décision |
|---|---|
| Publication | Attribut texte de l'édition, pas une table |
| Édition | Entité centrale, identifiée par `UUID` |
| Exemplaire | Entité physique possédée |
| Numéro seul | Jamais suffisant |
| Code-barres | Attribut `barcode` (1 max par édition dans le MVP) |
| OCR | Inclus dans le MVP, avec confiance |
| Export JSON | Format portable indépendant du schéma SQL |
| Doublons | Autorisés |
| Images | Aucune conservée |
