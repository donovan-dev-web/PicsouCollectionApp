# 🦆 Picsou Collection

> **Document de référence du projet — version 0.2**
>
> Cette documentation regroupe les décisions fonctionnelles, UX et techniques validées à ce stade. Elle constitue la base de départ avant l'implémentation.

Application Android personnelle permettant de gérer une collection de magazines **Picsou / Disney** et surtout de vérifier rapidement, lors d'une brocante ou d'un vide-grenier, si un exemplaire a déjà été acheté.

---

## 1. Présentation du projet

### 1.1 Objectif

L'application a pour objectif de permettre à un collectionneur de :

- enregistrer facilement les magazines qu'il possède ;
- identifier rapidement un magazine trouvé en brocante ;
- vérifier s'il possède déjà **cette édition précise** ;
- éviter l'achat de doublons involontaires ;
- fonctionner **entièrement hors ligne** ;
- ne dépendre d'aucun serveur ;
- sauvegarder et restaurer sa collection via un fichier JSON.

L'application est conçue pour un **usage personnel** et n'a pas vocation à être publiée sur les stores dans un premier temps.

---

## 2. Problème à résoudre

Un collectionneur peut rencontrer plusieurs difficultés :

- il possède beaucoup de magazines ;
- plusieurs publications peuvent utiliser le même numéro ;
- plusieurs éditions d'un même numéro peuvent exister ;
- certains anciens magazines peuvent ne pas posséder de code-barres ;
- certains codes-barres peuvent ne pas être connus de l'application ;
- consulter manuellement toute sa collection en brocante est trop lent ;
- une connexion Internet ne peut pas être garantie dans une brocante.

L'application doit donc répondre à une question très simple :

> **"Est-ce que je possède déjà exactement ce magazine ?"**

Le temps nécessaire pour obtenir cette réponse doit être aussi court que possible.

---

# 3. Principes fondamentaux

Le projet repose sur les principes suivants.

### Offline First

L'application doit fonctionner sans connexion Internet.

Toutes les opérations importantes doivent être réalisables localement :

- identification ;
- recherche ;
- ajout ;
- consultation ;
- modification ;
- vérification des doublons.

Internet ne doit jamais être une dépendance fonctionnelle.

### Pas de serveur

Aucun backend n'est prévu.

Il n'y aura pas :

- d'API obligatoire ;
- de serveur de synchronisation ;
- de compte utilisateur ;
- d'authentification ;
- de système cloud obligatoire.

Cela réduit fortement :

- les coûts ;
- la maintenance ;
- les problèmes de disponibilité ;
- la complexité du projet.

### DB locale unique

La collection est stockée localement dans une base SQLite.

La base appartient entièrement à l'utilisateur.

### Sauvegarde manuelle

La sauvegarde se fait par export de la collection dans un fichier JSON.

L'utilisateur peut ensuite :

- conserver le fichier ;
- l'envoyer par mail ;
- le copier sur un ordinateur ;
- le placer dans un stockage cloud ;
- le conserver sur une clé USB ;
- le réimporter ultérieurement.

---

# 4. Plateforme et technologies

## 4.1 Plateforme cible

### Android uniquement

Le projet ne cible actuellement que Android.

Raison :

- pas de Mac disponible pour le développement iOS ;
- pas de besoin actuel de supporter iOS.

L'application sera testée principalement sur un **téléphone Android physique dédié au développement**.

---

## 4.2 Stack envisagée

### Frontend

- React Native
- Expo
- TypeScript
- Expo Router

### Base de données

- SQLite
- `expo-sqlite`

### Caméra

- `expo-camera`

Utilisation prévue :

- aperçu caméra ;
- détection de code-barres ;
- analyse du flux caméra.

### OCR

Solution native Android basée sur un moteur OCR compatible avec React Native / Expo Development Build.

**Google ML Kit Text Recognition** est une piste privilégiée.

La solution exacte devra être validée lors du développement du prototype OCR.

### Fichiers

- `expo-file-system`
- `expo-sharing`

Utilisation :

- export JSON ;
- import JSON ;
- partage du fichier de sauvegarde.

---

# 5. Pourquoi Expo Development Build

Le projet utilise Expo, mais ne repose pas uniquement sur Expo Go.

Le développement sera effectué avec un **Expo Development Build** installé directement sur le téléphone Android.

Cela permet :

- d'utiliser les modules Expo standards ;
- d'intégrer des modules natifs supplémentaires ;
- de tester les fonctionnalités caméra/OCR sur un véritable appareil ;
- de déboguer directement sur le matériel cible.

Le développement sur téléphone physique est important car les performances caméra/OCR doivent être évaluées dans les conditions réelles d'utilisation.

---

# 6. Identification d'un magazine

L'application dispose de trois méthodes d'identification.

## 6.1 Code-barres

Méthode privilégiée lorsqu'un code-barres est présent et lisible.

Flux :

```text
Caméra
  ↓
Détection code-barres
  ↓
Lecture du code
  ↓
Recherche locale
  ↓
Édition trouvée ?
```

Avantages :

- très rapide ;
- peu coûteux en ressources ;
- pas besoin de conserver une image ;
- fonctionnement hors ligne ;
- particulièrement adapté à une utilisation en brocante.

---

## 6.2 Identification par caméra / OCR

Deuxième méthode.

L'utilisateur pointe simplement la caméra vers la couverture.

L'application analyse le flux vidéo afin d'extraire des informations textuelles telles que :

```text
PICSOU MAGAZINE
N° 547
MARS 2023
```

L'image n'est pas enregistrée.

Le traitement se fait directement sur le téléphone.

### Objectif

Transformer :

```text
Flux caméra
    ↓
OCR
    ↓
Texte
    ↓
Extraction des informations
    ↓
Identification de l'édition
```

### Contraintes

L'OCR doit :

- être suffisamment rapide ;
- fonctionner hors ligne ;
- ne pas enregistrer les images ;
- limiter la consommation CPU ;
- ne pas bloquer l'interface ;
- ne pas analyser inutilement chaque frame à pleine résolution.

L'analyse pourra être effectuée uniquement sur certaines frames du flux caméra.

---

## 6.3 Saisie manuelle

Dernière méthode.

Elle est utilisée :

- si aucun code-barres n'est présent ;
- si le code-barres est illisible ;
- si l'OCR échoue ;
- si la couverture est trop abîmée ;
- si l'utilisateur préfère simplement saisir les informations.

La saisie doit rester courte.

Informations principales :

- publication ;
- numéro ;
- édition ;
- éventuellement date ;
- éventuellement pays.

---

# 7. Ordre des méthodes

Les trois méthodes sont accessibles directement depuis l'écran d'identification.

L'utilisateur n'est jamais obligé de suivre un parcours imposé.

```text
Identifier le magazine

[ Scanner le code-barres ]

[ Identifier avec la caméra ]

[ Saisir manuellement ]
```

Cependant, après un échec, l'application propose les méthodes restantes.

Exemple :

```text
Code-barres inconnu

[ Essayer avec la caméra ]

[ Saisir manuellement ]
```

Il n'est pas nécessaire de reproposer une méthode qui vient déjà d'échouer.

---

# 8. Identification ≠ présence dans la collection

Une distinction fondamentale est faite entre :

### Identification

> "Quel est ce magazine ?"

et :

### Collection

> "Est-ce que je possède cette édition ?"

Le fonctionnement est donc :

```text
Méthode d'identification
        ↓
Identification de l'édition
        ↓
Recherche dans SQLite
        ↓
┌───────────────┬───────────────┐
│               │               │
Présent         Absent
│               │
🔴 Possédé      🟢 Non possédé
```

Cela permet de conserver une architecture propre et indépendante de la méthode utilisée pour identifier le magazine.

---

# 9. Ne pas identifier uniquement par numéro

Le numéro seul ne constitue **jamais** un identifiant suffisamment fiable.

Exemple :

```text
Picsou Magazine n°30
Super Picsou Géant n°30
Les Trésors de Picsou n°30
```

Ces magazines sont différents.

Il peut également exister plusieurs éditions d'un même numéro.

L'identification logique doit donc prendre en compte plusieurs informations :

```text
Publication
+
Numéro
+
Édition
+
Pays
+
Date éventuelle
```

Le système doit utiliser un identifiant interne propre à l'édition.

Exemple :

```text
issue_id = UUID
```

Le numéro reste une information descriptive et non la clé primaire.

---

# 10. La base ne cherche pas à cataloguer tous les Picsou

Le projet **ne cherche pas à construire une base exhaustive de toutes les publications Disney/Picsou existantes**.

C'est une décision importante.

Il existe potentiellement :

- des milliers de magazines ;
- des éditions spéciales ;
- des hors-séries ;
- des publications contenant des histoires Picsou sans être des magazines Picsou ;
- des éditions étrangères ;
- des rééditions.

Construire une base mondiale serait disproportionné pour une application personnelle.

## Approche retenue

La base se construit progressivement à partir de la collection de l'utilisateur.

Exemple :

```text
Collection initiale

Picsou Magazine #500
Picsou Magazine #501
Super Picsou Géant #12
...
```

Lorsqu'un nouveau magazine est rencontré :

```text
Identification
      ↓
Édition connue ?
   ┌──┴──┐
  oui   non
   ↓     ↓
utiliser créer
   │     │
   └──┬──┘
      ↓
Ajouter à la collection
```

---

# 11. Architecture des données

La base de données utilise **SQLite via `expo-sqlite`**, mais avec une architecture volontairement hybride :

- les informations essentielles et fréquemment recherchées sont stockées dans des colonnes SQLite normales ;
- les informations complémentaires et susceptibles d'évoluer sont regroupées dans une zone JSON ;
- les relations restent limitées aux cas réellement utiles ;
- aucune base de données NoSQL externe ni serveur n'est nécessaire.

L'objectif n'est donc pas de reproduire une architecture relationnelle complexe, mais de conserver les avantages de SQLite tout en gardant une structure de données flexible.

## 11.1 Principes

La donnée centrale est l'**édition** d'un magazine.

```text
Magazine / édition
│
├── informations essentielles
│   ├── publication
│   ├── numéro
│   ├── édition
│   ├── pays
│   └── date
│
├── codes-barres
│
├── détails / métadonnées JSON
│
└── exemplaires possédés
```

Une distinction stricte est conservée entre :

- **publication** : la série, par exemple `Picsou Magazine` ;
- **édition** : un numéro précis dans une édition donnée ;
- **exemplaire** : le magazine physique réellement possédé.

Le numéro seul ne constitue donc jamais un identifiant.

---

## 11.2 `magazines`

Table principale contenant les informations nécessaires à l'identification, à la recherche et à l'affichage de la collection.

```text
magazines
────────────────────────────────
id
publication
issue_number
edition
country
publication_date
created_at
updated_at
```

### Rôle

Cette table est utilisée pour :

- afficher rapidement la collection ;
- rechercher un magazine ;
- identifier une édition ;
- trier et filtrer ;
- fournir les informations essentielles sans charger les détails.

### Exemple

```text
id:               UUID
publication:      Picsou Magazine
issue_number:     547
edition:          standard
country:          FR
publication_date: 2023-03
```

Les champs fréquemment recherchés restent des colonnes SQLite normales afin de permettre des index efficaces.

---

## 11.3 `magazine_barcodes`

Les codes-barres sont séparés de la table principale.

```text
magazine_barcodes
────────────────────────────────
id
magazine_id
barcode
```

Relation :

```text
magazines
    │
    │ 1:N
    ▼
magazine_barcodes
```

Cette séparation permet à une même édition de posséder plusieurs codes-barres connus.

```text
Picsou Magazine #547
    │
    ├── 1234567890123
    ├── 9876543210987
    └── ...
```

Le champ `barcode` possède un index unique afin que la recherche par scan soit immédiate.

> Un code-barres est considéré comme un identifiant externe permettant de retrouver une édition. Il n'identifie pas un exemplaire physique.

---

## 11.4 `magazine_details`

Les informations moins importantes pour la recherche sont séparées afin de conserver une table principale légère.

```text
magazine_details
────────────────────────────────
magazine_id
metadata
notes
ocr_text
created_at
updated_at
```

`metadata` est un objet JSON libre permettant d'enregistrer des informations supplémentaires sans devoir modifier le schéma SQL à chaque évolution.

Exemple :

```json
{
  "subtitle": "Le magazine de Picsou",
  "specialEdition": false,
  "coverVariant": "standard",
  "detectedDate": "2023-03",
  "additionalInformation": {}
}
```

`ocr_text` peut conserver, si cela est utile, le texte brut obtenu lors d'une identification par OCR. Il ne contient pas d'image.

Cette table est chargée uniquement lorsque l'utilisateur ouvre la fiche détaillée d'un magazine ou lorsqu'une opération nécessite ces informations.

---

## 11.5 `collection_items`

Cette table représente les exemplaires physiques réellement possédés.

```text
collection_items
────────────────────────────────
id
magazine_id
condition
notes
date_added
```

Relation :

```text
magazines
    │
    │ 1:N
    ▼
collection_items
```

Un même magazine peut donc avoir plusieurs exemplaires :

```text
Picsou Magazine #547
│
├── Exemplaire 1
│   └── État : bon
│
└── Exemplaire 2
    └── État : moyen
```

Il n'est pas nécessaire de stocker un champ `quantity` : le nombre d'exemplaires est obtenu en comptant les lignes de `collection_items`.

Cela permet à chaque exemplaire d'avoir ses propres informations.

---

## 11.6 Vue logique complète

```text
                         ┌───────────────────┐
                         │     MAGAZINES     │
                         ├───────────────────┤
                         │ id                │
                         │ publication       │
                         │ issue_number      │
                         │ edition           │
                         │ country           │
                         │ publication_date  │
                         └─────────┬─────────┘
                                   │
                 ┌─────────────────┼──────────────────┐
                 │                 │                  │
                 │ 1:N             │ 1:1              │ 1:N
                 ▼                 ▼                  ▼
       ┌─────────────────┐ ┌───────────────┐ ┌──────────────────┐
       │ MAGAZINE_       │ │ MAGAZINE_     │ │ COLLECTION_      │
       │ BARCODES        │ │ DETAILS       │ │ ITEMS            │
       ├─────────────────┤ ├───────────────┤ ├──────────────────┤
       │ id              │ │ magazine_id   │ │ id               │
       │ magazine_id     │ │ metadata JSON │ │ magazine_id      │
       │ barcode         │ │ notes         │ │ condition        │
       └─────────────────┘ │ ocr_text      │ │ notes            │
                           └───────────────┘ │ date_added       │
                                            └──────────────────┘
```

Cette architecture conserve seulement les relations utiles.

---

# 12. Schéma SQLite définitif

Le schéma cible du MVP est le suivant.

## 12.1 Table `magazines`

```sql
CREATE TABLE IF NOT EXISTS magazines (
    id TEXT PRIMARY KEY NOT NULL,
    publication TEXT NOT NULL,
    issue_number INTEGER,
    edition TEXT,
    country TEXT,
    publication_date TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);
```

### Contraintes et règles

- `id` : UUID généré localement par l'application ;
- `publication` : obligatoire ;
- `issue_number` : facultatif car certaines publications peuvent être hors-série ou utiliser une autre forme de numérotation ;
- `edition` : facultative ;
- `country` : code pays ou valeur libre normalisée par l'application ;
- `publication_date` : texte ISO lorsque connue, par exemple `2023-03-01` ou `2023-03` selon la précision disponible ;
- `created_at` et `updated_at` : timestamps ISO 8601.

Le numéro n'est jamais utilisé comme clé primaire.

---

## 12.2 Table `magazine_barcodes`

```sql
CREATE TABLE IF NOT EXISTS magazine_barcodes (
    id TEXT PRIMARY KEY NOT NULL,
    magazine_id TEXT NOT NULL,
    barcode TEXT NOT NULL UNIQUE,

    FOREIGN KEY (magazine_id)
        REFERENCES magazines(id)
        ON DELETE CASCADE
);
```

### Index

```sql
CREATE INDEX IF NOT EXISTS idx_magazine_barcodes_magazine_id
ON magazine_barcodes(magazine_id);
```

La contrainte `UNIQUE(barcode)` garantit qu'un code-barres enregistré ne peut pas être associé à plusieurs éditions dans la base.

---

## 12.3 Table `magazine_details`

```sql
CREATE TABLE IF NOT EXISTS magazine_details (
    magazine_id TEXT PRIMARY KEY NOT NULL,
    metadata TEXT,
    notes TEXT,
    ocr_text TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,

    FOREIGN KEY (magazine_id)
        REFERENCES magazines(id)
        ON DELETE CASCADE
);
```

### Format JSON

Le champ `metadata` contient un objet JSON sérialisé.

Exemple :

```json
{
  "subtitle": null,
  "specialEdition": false,
  "coverVariant": null,
  "additionalInformation": {}
}
```

Le JSON est volontairement flexible. Les données utilisées pour les recherches fréquentes ne doivent cependant pas être placées uniquement dans `metadata`.

---

## 12.4 Table `collection_items`

```sql
CREATE TABLE IF NOT EXISTS collection_items (
    id TEXT PRIMARY KEY NOT NULL,
    magazine_id TEXT NOT NULL,
    condition TEXT,
    notes TEXT,
    date_added TEXT NOT NULL,

    FOREIGN KEY (magazine_id)
        REFERENCES magazines(id)
        ON DELETE CASCADE
);
```

### Index

```sql
CREATE INDEX IF NOT EXISTS idx_collection_items_magazine_id
ON collection_items(magazine_id);
```

Une ligne correspond à un exemplaire physique.

---

## 12.5 Index de recherche

Les recherches principales doivent être indexées.

```sql
CREATE INDEX IF NOT EXISTS idx_magazines_publication_issue
ON magazines(publication, issue_number);

CREATE INDEX IF NOT EXISTS idx_magazines_publication
ON magazines(publication);

CREATE INDEX IF NOT EXISTS idx_magazines_issue_number
ON magazines(issue_number);

CREATE UNIQUE INDEX IF NOT EXISTS idx_magazine_barcodes_barcode
ON magazine_barcodes(barcode);
```

Le point critique est la recherche par code-barres :

```text
Barcode
   ↓
idx_magazine_barcodes_barcode
   ↓
magazine_id
   ↓
magazines
   ↓
collection_items
```

La requête doit rester très légère et ne jamais charger inutilement les détails JSON ou le texte OCR.

---

# 13. Requêtes principales

## 13.1 Recherche par code-barres

```sql
SELECT
    m.id,
    m.publication,
    m.issue_number,
    m.edition,
    m.country,
    m.publication_date
FROM magazine_barcodes b
JOIN magazines m ON m.id = b.magazine_id
WHERE b.barcode = ?;
```

Cette requête permet d'identifier rapidement l'édition.

---

## 13.2 Vérification de présence dans la collection

Après identification de `magazine_id` :

```sql
SELECT COUNT(*) AS quantity
FROM collection_items
WHERE magazine_id = ?;
```

Interprétation :

```text
quantity = 0
→ 🟢 Non possédé

quantity > 0
→ 🔴 Déjà possédé
```

Le nombre exact d'exemplaires peut également être affiché.

---

## 13.3 Liste légère de la collection

L'écran principal de collection ne récupère que les informations essentielles :

```sql
SELECT
    m.id,
    m.publication,
    m.issue_number,
    m.edition,
    m.country,
    m.publication_date,
    COUNT(c.id) AS quantity
FROM magazines m
LEFT JOIN collection_items c
    ON c.magazine_id = m.id
GROUP BY m.id
ORDER BY m.publication, m.issue_number;
```

Les détails ne sont récupérés qu'à l'ouverture de la fiche.

---

## 13.4 Fiche détaillée

Lorsque l'utilisateur ouvre une édition :

```text
magazines
    +
magazine_details
    +
collection_items
```

Les trois sources peuvent être chargées séparément ou via une requête ciblée selon l'implémentation du repository.

---

# 14. Règles métier liées à la DB

## 14.1 Une édition possède un identifiant interne

Chaque édition possède un UUID unique.

```text
magazine.id
```

Il est indépendant :

- du numéro ;
- du code-barres ;
- du nom de publication ;
- de la date.

---

## 14.2 Une édition peut avoir plusieurs codes-barres

```text
magazine
   │
   ├── barcode A
   ├── barcode B
   └── barcode C
```

---

## 14.3 Un code-barres ne peut pointer que vers une édition

Dans la base locale :

```text
barcode unique → magazine
```

---

## 14.4 Une édition peut avoir plusieurs exemplaires

```text
magazine
   │
   ├── collection_item 1
   ├── collection_item 2
   └── collection_item 3
```

---

## 14.5 Le numéro seul n'est jamais suffisant

La logique d'identification doit prendre en compte autant d'informations que possible :

```text
publication
+
issue_number
+
edition
+
country
+
publication_date
```

Le niveau de précision dépend des informations réellement disponibles.

---

## 14.6 Une édition inconnue peut être créée

La base n'est pas un catalogue exhaustif.

Lorsqu'un nouveau magazine est identifié :

```text
Identification
      ↓
Édition connue ?
   ┌──┴──┐
  oui   non
   ↓     ↓
utiliser créer
   │     │
   └──┬──┘
      ↓
Ajouter l'exemplaire
```

La création d'une nouvelle édition doit cependant être confirmée par l'utilisateur lorsque l'identification provient d'une méthode automatique.

---

# 15. Architecture de données et performance

La séparation des données répond à deux objectifs :

### Recherche rapide

Les données essentielles sont directement indexables :

```text
publication
issue_number
edition
country
publication_date
barcode
```

### Chargement progressif

Les données détaillées :

```text
metadata
notes
ocr_text
```

ne sont pas nécessaires pour afficher la liste ou effectuer un scan.

Le principe est :

```text
Liste
 ↓
données essentielles uniquement

Ouverture d'une fiche
 ↓
données détaillées

Scan
 ↓
barcode → édition → collection
```

Cette séparation améliore surtout la simplicité des requêtes et la maîtrise des données chargées. Pour une collection de quelques milliers de magazines, SQLite restera très performant même sans cette optimisation ; elle est donc avant tout une décision d'architecture propre et évolutive.

---

# 16. Export JSON v1 mis à jour

Le format d'export reste indépendant de l'implémentation SQLite.

Exemple :

```json
{
  "format": "picsou-collection",
  "version": 1,
  "exportedAt": "2026-08-30T14:30:00Z",

  "magazines": [
    {
      "id": "magazine-uuid",
      "publication": "Picsou Magazine",
      "issueNumber": 547,
      "edition": "standard",
      "country": "FR",
      "publicationDate": "2023-03",

      "barcodes": [
        "1234567890123"
      ],

      "details": {
        "metadata": {},
        "notes": null,
        "ocrText": null
      },

      "copies": [
        {
          "id": "copy-uuid",
          "condition": "good",
          "notes": "Acheté en brocante",
          "dateAdded": "2026-08-30T14:30:00Z"
        }
      ]
    }
  ]
}
```

Le JSON est donc lisible et portable, sans exposer inutilement la structure interne des tables.

---

# 17. Conséquences sur l'architecture TypeScript

Les repositories peuvent être simplifiés et regroupés autour de l'entité principale :

```text
src/
├── database/
│   ├── schema.ts
│   ├── migrations.ts
│   ├── database.ts
│   └── repositories/
│       ├── magazineRepository.ts
│       ├── barcodeRepository.ts
│       ├── detailsRepository.ts
│       └── collectionRepository.ts
```

Les types principaux pourront être :

```ts
type Magazine = {
  id: string;
  publication: string;
  issueNumber?: number;
  edition?: string;
  country?: string;
  publicationDate?: string;
  createdAt: string;
  updatedAt: string;
};

type MagazineDetails = {
  magazineId: string;
  metadata?: Record<string, unknown>;
  notes?: string;
  ocrText?: string;
  createdAt: string;
  updatedAt: string;
};

type CollectionItem = {
  id: string;
  magazineId: string;
  condition?: string;
  notes?: string;
  dateAdded: string;
};

type MagazineBarcode = {
  id: string;
  magazineId: string;
  barcode: string;
};
```

Les types exacts seront définis lors de l'implémentation et devront rester alignés avec le schéma SQLite.

---

# 18. Décision d'architecture DB

La décision est maintenant :

> **SQLite via `expo-sqlite`, avec une architecture hybride légère et orientée document.**

Nous n'utilisons pas :

- AsyncStorage comme DB principale ;
- MMKV comme DB principale ;
- Realm ;
- WatermelonDB ;
- serveur ;
- synchronisation ;
- base NoSQL externe.

SQLite reste responsable de la persistance et des recherches structurées, tandis que JSON apporte la flexibilité nécessaire aux métadonnées.

Cette décision doit être considérée comme la base technique du projet jusqu'à preuve qu'un besoin réel impose de la remettre en cause.

---

# 12. Architecture logique

L'application doit séparer les responsabilités.

```text
UI
│
├── Scanner
├── Collection
├── Ajout
└── Paramètres
        │
        ↓
Services
│
├── IdentificationService
├── CollectionService
└── BackupService
        │
        ↓
SQLite
```

---

# 13. IdentificationService

Le service d'identification centralise les différentes méthodes.

API conceptuelle :

```ts
identifyByBarcode(barcode)
identifyByOCR(text)
identifyManually(data)
```

Les différentes méthodes doivent retourner une structure commune.

Exemple :

```ts
type MagazineIdentification = {
  publication: string;
  issueNumber?: number;
  edition?: string;
  country?: string;
  publicationDate?: string;
  barcode?: string;
  confidence: number;
};
```

L'interface utilisateur n'a donc pas besoin de savoir comment l'identification a été obtenue.

---

# 14. Gestion de la confiance

Une identification automatique ne doit pas nécessairement être considérée comme certaine.

L'OCR peut produire des erreurs.

Exemple :

```text
N° 547
```

peut être interprété comme :

```text
N° 547
N° 547
N° 547
```

Le système doit pouvoir déterminer si l'identification est suffisamment fiable.

Exemple :

```text
Identification probable

Picsou Magazine
N° 547

Confiance : élevée

[ Confirmer ]
[ Ce n'est pas ça ]
```

En cas de confiance insuffisante :

```text
Impossible d'identifier précisément ce magazine.

[ Réessayer avec la caméra ]
[ Saisir manuellement ]
```

L'application ne doit jamais inventer une identification avec certitude.

---

# 15. Expérience utilisateur

L'application doit être pensée pour une utilisation **très rapide en brocante**.

Objectif :

> Sortir le téléphone → scanner → obtenir une réponse.

Le nombre d'écrans et d'actions doit être limité.

---

# 16. Écran d'accueil

L'accueil doit proposer immédiatement les deux actions principales.

```text
┌───────────────────────────────┐
│        🦆 MA COLLECTION       │
│                               │
│         1 247 magazines       │
│                               │
│   ┌────────────────────────┐  │
│   │      📷 SCANNER         │  │
│   └────────────────────────┘  │
│                               │
│   ┌────────────────────────┐  │
│   │       ➕ AJOUTER         │  │
│   └────────────────────────┘  │
│                               │
│   Ma collection         ⚙️   │
└───────────────────────────────┘
```

### Scanner

Utilisé principalement en brocante.

### Ajouter

Utilisé pour enregistrer un magazine dans la collection.

---

# 17. Écran d'identification

Les trois méthodes sont immédiatement disponibles.

```text
┌───────────────────────────────┐
│          Identifier           │
│                               │
│ Comment identifier ce         │
│ magazine ?                    │
│                               │
│ [ ▣ Scanner le code-barres ]  │
│                               │
│ [ 📷 Identifier avec caméra ] │
│                               │
│ [ ✎ Saisir manuellement ]     │
│                               │
│             Annuler           │
└───────────────────────────────┘
```

---

# 18. Flux Code-barres

```text
Accueil
   ↓
Scanner
   ↓
Scanner code-barres
   ↓
Code détecté
   ↓
Recherche locale
```

## Code connu

```text
Magazine trouvé

Picsou Magazine
N° 547
Édition française

🔴 DÉJÀ POSSÉDÉ

[ ✓ C'est bien ce magazine ]

[ Essayer une autre méthode ]
```

La confirmation permet de vérifier visuellement que l'identification correspond bien au magazine physique.

---

## Code inconnu

```text
Code-barres inconnu

Aucune correspondance trouvée
dans votre collection.

[ Identifier avec la caméra ]

[ Saisir manuellement ]
```

---

# 19. Flux caméra / OCR

```text
Accueil
   ↓
Scanner
   ↓
Identifier avec caméra
   ↓
Flux caméra
   ↓
OCR
   ↓
Extraction d'informations
   ↓
Identification
```

Exemple :

```text
PICSOU MAGAZINE
N° 547
MARS 2023
```

Résultat :

```text
Picsou Magazine
N° 547
Mars 2023

[ ✓ Confirmer ]

[ Réessayer ]

[ Saisie manuelle ]
```

---

# 20. Flux saisie manuelle

Formulaire minimal :

```text
Publication
[ Picsou Magazine ▼ ]

Numéro
[ 547 ]

Édition
[ Française ▼ ]

Date
[ facultatif ]

[ Vérifier ]
```

La recherche utilise l'ensemble des informations disponibles.

---

# 21. Résultat : magazine déjà possédé

```text
┌───────────────────────────────┐
│       🔴 DÉJÀ POSSÉDÉ         │
│                               │
│       Picsou Magazine         │
│             N° 547            │
│                               │
│       Édition française       │
│                               │
│       Exemplaire(s) : 1       │
│                               │
│ [ Fermer ]                    │
└───────────────────────────────┘
```

L'objectif est que le collectionneur puisse prendre sa décision immédiatement.

---

# 22. Résultat : magazine non possédé

```text
┌───────────────────────────────┐
│       🟢 NON POSSÉDÉ          │
│                               │
│       Picsou Magazine         │
│             N° 548            │
│                               │
│       Édition française       │
│                               │
│ [ Ajouter à la collection ]   │
│                               │
│ [ Fermer ]                    │
└───────────────────────────────┘
```

---

# 23. Ajout d'un doublon volontaire

Si l'utilisateur essaie d'ajouter une édition déjà possédée :

```text
⚠️ Vous possédez déjà ce magazine.

Exemplaires actuels : 1

Voulez-vous ajouter un deuxième exemplaire ?

[ Ajouter quand même ]

[ Annuler ]
```

Cela permet de conserver plusieurs exemplaires d'une même édition.

---

# 24. Collection

L'écran collection permet de consulter ce qui est enregistré.

Fonctions prévues :

- liste ;
- recherche ;
- filtres ;
- tri ;
- consultation d'une édition ;
- modification ;
- suppression.

Exemple :

```text
Ma collection

🔎 Rechercher...

Picsou Magazine
N° 547

Picsou Magazine
N° 548

Super Picsou Géant
N° 120
```

---

# 25. Paramètres

Les paramètres doivent rester simples.

```text
⚙️ Paramètres

Sauvegarde
  → Exporter la collection
  → Importer une collection

Données
  → Nombre de magazines

Application
  → Version
```

---

# 26. Export JSON

L'export ne doit pas être une copie brute de SQLite.

Il doit produire un format portable et indépendant de l'implémentation interne.

Exemple :

```json
{
  "format": "picsou-collection",
  "version": 1,
  "exportedAt": "2026-08-30T14:30:00Z",
  "publications": [],
  "issues": [],
  "issueBarcodes": [],
  "collection": []
}
```

## Version du format

Le fichier doit contenir :

```text
version: 1
```

Cela permettra de faire évoluer la structure de la DB dans le futur.

Exemple :

```text
JSON v1
  ↓
Migration
  ↓
SQLite actuelle
```

---

# 27. Import JSON

Lors de l'import :

```text
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

L'application doit vérifier :

- que le fichier est bien un export de l'application ;
- que la version est compatible ;
- que les données sont valides ;
- qu'il n'y a pas de corruption évidente.

Une confirmation doit être affichée avant de remplacer ou fusionner les données existantes.

---

# 28. Pas de photos stockées

Décision importante :

**L'application ne conserve pas les images utilisées pour l'identification.**

La caméra sert uniquement à :

- scanner le code-barres ;
- fournir des frames à l'OCR.

Une fois l'analyse terminée, les images temporaires sont supprimées / jamais persistées.

Avantages :

- très faible consommation de stockage ;
- DB légère ;
- pas de sauvegarde d'images ;
- pas de serveur ;
- pas de synchronisation ;
- traitement rapide.

---

# 29. Performance

L'application est destinée à être utilisée sur un téléphone Android potentiellement peu performant.

Priorités :

1. réactivité de l'interface ;
2. démarrage rapide ;
3. scanner rapide ;
4. OCR raisonnablement rapide ;
5. faible consommation mémoire ;
6. faible consommation de stockage ;
7. fonctionnement hors ligne.

### Caméra

Le flux caméra doit rester fluide.

L'OCR ne doit pas nécessairement être exécuté sur toutes les frames.

Architecture indicative :

```text
Caméra : 30 FPS
       │
       ├── Affichage : continu
       │
       └── OCR : quelques frames / seconde
                         ↓
                 résultat suffisamment
                 fiable
                         ↓
                   arrêt analyse
```

---

# 30. Sécurité et confidentialité

L'application ne nécessite aucune donnée personnelle.

Aucune donnée ne doit être envoyée sur Internet pour fonctionner.

Les informations de collection restent localement sur le téléphone.

Les seules données exportées sont celles explicitement demandées par l'utilisateur.

---

# 31. Architecture du projet

Arborescence indicative :

```text
src/
├── database/
│   ├── schema.ts
│   ├── migrations.ts
│   ├── database.ts
│   └── repositories/
│       ├── magazineRepository.ts
│       ├── barcodeRepository.ts
│       ├── detailsRepository.ts
│       └── collectionRepository.ts
│
├── identification/
│   ├── barcode.ts
│   ├── ocr.ts
│   └── identificationService.ts
│
├── collection/
│   └── collectionService.ts
│
├── backup/
│   ├── export.ts
│   ├── import.ts
│   └── format.ts
│
├── components/
│
├── types/
│
└── utils/
```

Navigation :

```text
app/
├── index.tsx
│
├── scan/
│   ├── index.tsx
│   ├── barcode.tsx
│   ├── camera.tsx
│   ├── manual.tsx
│   └── result.tsx
│
├── add/
│
├── collection/
│   ├── index.tsx
│   └── [id].tsx
│
└── settings/
    ├── index.tsx
    ├── export.tsx
    └── import.tsx
```

Cette structure est indicative et pourra évoluer.

---

# 32. Roadmap

## Phase 0 — Cadrage

- [x] Définir le problème
- [x] Définir l'utilisation hors ligne
- [x] Décider de ne pas utiliser de serveur
- [x] Décider d'utiliser une DB locale
- [x] Choisir SQLite via `expo-sqlite`
- [x] Choisir une architecture DB hybride légère
- [x] Décider de l'export/import JSON
- [x] Définir les trois méthodes d'identification
- [x] Définir l'approche UX générale
- [x] Définir Android comme plateforme cible
- [x] Choisir React Native + Expo comme stack

---

# Phase 1 — Initialisation technique

- [ ] Créer le projet Expo
- [ ] Configurer TypeScript
- [ ] Configurer Expo Router
- [ ] Configurer le Development Build
- [ ] Installer/configurer SQLite
- [ ] Tester l'application sur le téléphone Android

Objectif :

> Obtenir une application vide installée et débogable sur le téléphone.

---

# Phase 2 — Base de données

- [x] Définir le schéma SQLite définitif
- [ ] Créer les migrations
- [ ] Créer les repositories
- [ ] Créer les services de collection
- [ ] Implémenter ajout manuel
- [ ] Implémenter consultation
- [ ] Implémenter modification
- [ ] Implémenter suppression
- [ ] Gérer les doublons

Objectif :

> Pouvoir gérer toute la collection sans caméra.

---

# Phase 3 — Interface principale

- [ ] Écran d'accueil
- [ ] Écran collection
- [ ] Écran ajout
- [ ] Écran paramètres
- [ ] Navigation
- [ ] États de chargement
- [ ] États d'erreur
- [ ] Messages de confirmation

Objectif :

> Disposer d'une application utilisable manuellement.

---

# Phase 4 — Scanner code-barres

- [ ] Intégrer `expo-camera`
- [ ] Demander la permission caméra
- [ ] Afficher le preview
- [ ] Détecter les EAN pertinents
- [ ] Lire le code
- [ ] Rechercher dans SQLite
- [ ] Afficher résultat possédé/non possédé
- [ ] Gérer code inconnu
- [ ] Tester différents magazines

Objectif :

> Pouvoir identifier rapidement un magazine en brocante.

---

# Phase 5 — OCR

- [ ] Choisir définitivement la librairie OCR
- [ ] Intégrer le module natif
- [ ] Créer le Development Build nécessaire
- [ ] Tester le texte français
- [ ] Tester les couvertures réelles
- [ ] Extraire titre/publication
- [ ] Extraire numéro
- [ ] Extraire date lorsque disponible
- [ ] Calculer une confiance
- [ ] Afficher les résultats
- [ ] Optimiser les performances

Objectif :

> Identifier un magazine sans code-barres à partir du flux caméra.

---

# Phase 6 — Parcours complet

Implémenter le parcours :

```text
Accueil
  ↓
Scanner
  ↓
Choix méthode
  ├── Code-barres
  ├── Caméra/OCR
  └── Manuel
       ↓
Identification
       ↓
Confirmation
       ↓
Recherche collection
       ↓
┌─────────────┬─────────────┐
│             │             │
Possédé       Non possédé
│             │
🔴            🟢
```

Puis les chemins de secours :

```text
Échec
 ↓
Méthode suivante
 ↓
ou saisie manuelle
```

Objectif :

> Pouvoir effectuer toute l'utilisation réelle en brocante.

---

# Phase 7 — Export / Import

- [ ] Définir format JSON v1
- [ ] Exporter SQLite vers JSON
- [ ] Partager le fichier
- [ ] Sélectionner un fichier JSON
- [ ] Valider le fichier
- [ ] Importer
- [ ] Gérer les versions
- [ ] Gérer les erreurs
- [ ] Tester restauration complète

Objectif :

> Pouvoir sauvegarder et restaurer la collection sans serveur.

---

# Phase 8 — Optimisation

- [ ] Mesurer le temps de démarrage
- [ ] Mesurer le temps de scan
- [ ] Mesurer le temps OCR
- [ ] Optimiser les requêtes SQLite
- [ ] Ajouter les index nécessaires
- [ ] Limiter les traitements caméra
- [ ] Tester sur un téléphone peu performant
- [ ] Tester avec une grosse collection
- [ ] Vérifier la consommation mémoire

---

# Phase 9 — Tests terrain

Utilisation avec de vrais magazines.

Tester :

- magazines neufs ;
- magazines anciens ;
- couvertures abîmées ;
- mauvaises lumières ;
- reflets ;
- codes-barres partiellement abîmés ;
- absence de code-barres ;
- différentes publications ;
- éditions différentes portant le même numéro ;
- doublons ;
- absence de réseau ;
- collection importante.

Objectif :

> Vérifier que l'application fonctionne réellement dans une brocante, et pas uniquement dans un environnement de développement.

---

# 33. MVP

Le MVP doit rester volontairement limité.

### Inclus

- Android ;
- React Native + Expo ;
- SQLite local ;
- accueil ;
- collection ;
- ajout manuel ;
- scan code-barres ;
- identification ;
- vérification doublon ;
- gestion de plusieurs exemplaires ;
- export JSON ;
- import JSON ;
- fonctionnement hors ligne.

### Après MVP

- OCR caméra ;
- amélioration de l'identification ;
- recherche avancée ;
- filtres ;
- statistiques ;
- amélioration UX ;
- optimisations.

La reconnaissance de couverture par comparaison d'images n'est **pas prévue**.

---

# 34. Fonctionnalités explicitement exclues

Pour conserver un projet simple :

- pas de serveur ;
- pas de synchronisation cloud ;
- pas de compte utilisateur ;
- pas d'authentification ;
- pas de catalogue mondial ;
- pas de reconnaissance de couverture par comparaison d'images ;
- pas de stockage permanent des photos ;
- pas de dépendance obligatoire à Internet ;
- pas de support iOS dans la première version.

---

# 35. Critères de réussite

L'application sera considérée comme réussie si le collectionneur peut :

### En préparant sa collection

1. ouvrir l'application ;
2. ajouter ses magazines ;
3. les enregistrer localement ;
4. exporter sa collection.

### En brocante

1. ouvrir l'application ;
2. appuyer sur Scanner ;
3. choisir code-barres ou caméra ;
4. pointer le téléphone ;
5. obtenir rapidement une identification ;
6. savoir immédiatement si le magazine est déjà possédé ;
7. changer de méthode si l'identification échoue ;
8. saisir manuellement les informations si nécessaire.

### En cas de problème

1. exporter régulièrement la DB ;
2. changer de téléphone ;
3. réinstaller l'application ;
4. importer le JSON ;
5. retrouver sa collection.

---

# 36. Philosophie générale du projet

Le projet doit rester :

> **Petit, rapide, local et fiable.**

Il ne s'agit pas de créer une plateforme de gestion de collections universelle.

Il s'agit de résoudre efficacement un problème concret :

> **"Je suis devant un magazine dans une brocante. Est-ce que je l'ai déjà ?"**

Toute nouvelle fonctionnalité doit être évaluée par rapport à cette philosophie.

Si une fonctionnalité ajoute beaucoup de complexité sans améliorer significativement cette expérience, elle doit être considérée comme secondaire.

---

# 37. Décisions actuelles

| Sujet | Décision |
|---|---|
| Plateforme | Android |
| Framework | React Native |
| Runtime | Expo |
| Développement | Development Build + téléphone physique |
| Langage | TypeScript |
| Navigation | Expo Router |
| DB | SQLite locale via `expo-sqlite` |
| Architecture DB | Hybride légère : données essentielles structurées + détails JSON |
| Tables principales | `magazines`, `magazine_barcodes`, `magazine_details`, `collection_items` |
| Recherche | Index SQLite sur les données critiques |
| Serveur | Aucun |
| Synchronisation | Aucune |
| Backup | Export JSON indépendant du schéma SQL |
| Import | JSON |
| Images | Aucune image conservée |
| Code-barres | Table dédiée + index unique |
| OCR | Identification caméra |
| Recherche manuelle | Méthode de secours |
| Reconnaissance de couverture | Non prévue |
| Fonctionnement offline | Obligatoire |
| Catalogue mondial | Non |
| Collection | Construite progressivement par l'utilisateur |
| Doublons | Autorisés |
| NoSQL externe | Non retenu : SQLite + JSON apporte la flexibilité nécessaire |
| Identification par numéro seul | Interdite |

---

# 38. Prochaine étape

Avant de commencer l'implémentation, les points suivants doivent être définis précisément :

1. **Implémentation du schéma SQLite définitif**
2. **Format JSON v1**
3. **Types TypeScript**
4. **Liste exacte des formats de codes-barres à supporter**
5. **Solution OCR Android**
6. **Structure exacte des écrans**
7. **États de chaque écran**
8. **Flux complet d'identification**
9. **Gestion des éditions ambiguës**
10. **Stratégie de migration de DB**

Une fois ces éléments définis, le développement pourra commencer sur une base stable.

---

## Vision finale

```text
                         🦆
                    PICSOU COLLECTION
                           │
                           ▼
                     ┌───────────┐
                     │  ACCUEIL  │
                     └─────┬─────┘
                           │
             ┌─────────────┼──────────────┐
             ▼             ▼              ▼
          📷 SCANNER     ➕ AJOUTER      📚 COLLECTION
             │
             ▼
       ┌─────────────────────┐
       │   CHOIX MÉTHODE     │
       ├─────────────────────┤
       │ ▣ Code-barres       │
       │ 📷 Caméra / OCR     │
       │ ✎ Manuel            │
       └──────────┬──────────┘
                  │
                  ▼
             IDENTIFICATION
                  │
                  ▼
          ┌───────────────┐
          │ ÉDITION       │
          │ IDENTIFIÉE    │
          └───────┬───────┘
                  │
                  ▼
             SQLITE LOCALE
                  │
           ┌──────┴──────┐
           ▼             ▼
       🔴 POSSÉDÉ     🟢 ABSENT
           │             │
           ▼             ▼
       Confirmer      Ajouter
```

**Objectif ultime : une application suffisamment rapide et simple pour être utilisée naturellement en quelques secondes devant un carton de magazines, sans Internet et sans infrastructure externe.**