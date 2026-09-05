---
title: "[Bug] M10R-01 Import CSV : le sélecteur bloque les fichiers .csv"
labels: [bug, priority-high, epic/backup, size/s, to-do]
milestone: "M-10R — Retours test physique (v0.9.1)"
---

# Comportement attendu

En tant que Marc, je veux sélectionner mon `collection-fictive.csv` (ou toute
sauvegarde CSV) depuis le stockage afin de peupler/restaurer ma collection
(US-UX-07).

# Comportement observé (test physique)

Paramètres → Importer → CSV : le sélecteur système grise les fichiers `.csv`
(« mauvais format »), import impossible.

# Reproduction

1. Placer un `.csv` valide (en-têtes v1) sur le téléphone ;
2. Paramètres → Sauvegarde → Importer → CSV ;
3. Le fichier n'est pas sélectionnable.

# Environnement

- Appareil Android physique (build preview M-10)
- Fichier : `collection-fictive.csv` (en-têtes `BACKUP_CSV_HEADERS`, valide)

# Correctif proposé

`src/backup/native-file-gateway.ts:57` : `getDocumentAsync({ type: 'text/csv' })`
n'est pas reconnu par les gestionnaires Android. Passer à une liste de types :
`['text/csv', 'text/comma-separated-values', 'application/vnd.ms-excel', '*/*']`
+ repli par extension (`.csv`, insensible à la casse) avant parsing ; le parseur
strict (`parseCsvBackup`) reste l'autorité de validation (rejet explicite si
invalide, sans toucher aux données — US-BK-03).

# Critères de fin (DoD)

- [ ] Un `.csv` v1 est sélectionnable et importé (remplacement + récap)
- [ ] Un fichier non-CSV reste rejeté avec message explicite
- [ ] `lint` + `typecheck` verts, tests `validateCollection`/`importCollection` CSV verts
