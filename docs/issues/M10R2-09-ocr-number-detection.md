---
title: "[Bug] M10R2-09 OCR : détection du numéro affinée (préfixe « N° ») + reconnaissance texte stylisé"
labels: [bug, priority-high, epic/identification, size/m, to-do]
milestone: "M-10R2 — 2ᵉ passe retours test physique (v0.9.2)"
---

# Contexte

Test physique v0.9.2 — retour terrain OCR : la détection du numéro d'exemplaire
capture **tous les nombres** de la couverture, y compris parfois des **années**,
des **numéros de pages** ou d'autres valeurs. Or le numéro d'exemplaire est
**toujours précédé de « N° »** : on peut donc affiner la détection pour éviter
les faux positifs. Par ailleurs, la reconnaissance échoue sur certains textes
**légèrement stylisés / dessinés** : améliorer la détection/reconnaissance.

# État actuel

- `src/identification/ocr/ocrTextParser.ts` :
  - `ISSUE_PATTERNS` (l.33-37) reconnaît déjà `N° 123`, `No`/`numéro`… mais le
    **repli** `extractIssueNumber` (l.81-97) accepte ensuite **toute ligne de
    1-4 chiffres isolée** (excluant seulement les années `19xx`/`20xx`) — c'est
    lui qui attrape les faux positifs (nb de pages, autre chiffre isolé).
  - Priorités : le premier pattern qui matche gagne, sans notion de « N° = plus
    fiable que nombre seul ».
- `src/identification/ocr/mlKitOcrEngine.ts` : `recognizeText(uri)` utilise
  `expo-mlkit-ocr` brut (texte unique), aucun paramètre de qualité / pas de
  post-traitement — les textes stylisés (titres dessinés, encres faibles)
  reviennent vides ou erronés.

# Tâche

## Volet A — Affiner la détection du numéro (parser)

1. **Prioriser le préfixe « N° »** : changer `extractIssueNumber` pour traiter
   **d'abord** les occurrences préfixées (`N°`, `No`, `numéro`, `issue`…) et
   **ne retenir le repli « nombre isolé » qu'en dernier recours**, avec des
   exclusions renforcées :
   - années `19xx`/`20xx` (déjà exclues) mais aussi dates complètes
     (`janvier 2024`, `no 2024`…) ;
   - nombres candidats situés sur une ligne de **nombre de pages** (ex.
     « 52 pages ») ;
   - prix (ex. « 3,50 € ») et tout nb de longueur ≠ attendue après le mot « N° ».
2. Si plusieurs `N°` existent, retenir celui suffisamment proche du titre /
   publication (garde-fou anti numéro de poche-au-bidon).
3. Conserver la règle `isConfident` (nom + numéro) telle quelle.

## Volet B — Améliorer la reconnaissance des textes stylisés

1. **Investigations** sur le build dev (physique) avec `expo-mlkit-ocr` :
   - recadrage / zoom sur la zone de titre avant `recognizeText` (l'OCR par
     vignette complète dilue les petites encres) ;
   - essayer une **capture haute résolution** (`takePictureAsync`) plutôt que
     la frame basse résolution si pertinent (`useCameraPermissions` +
     `CameraView` dans `camera.tsx`) ;
   - qualité de l'image (expo-image-manipulator : contraste/netteté) si le module
     le permet ;
   - **vote multi-frames** sur texte partiel (conservateur : ne garder que si ≥2
     lectures concordantes) — pattern déjà présent pour le code-barres.
2. Documenter dans `docs/05-ARCHITECTURE.md § OCR` les réglages retenus.
3. Ne pas casser le repli code-barres en confiance faible (M-05).

# Critères de fin (DoD)

- [x] Année, nombre de pages, prix ne sont **jamais** retenus comme numéro
- [x] « N° 547 » (couverture lue) retenu correctement sur 10v10 tests parser
- [x] Textes stylisés du test physique : taux de lecture significativement
      amélioré (ou repli documenté et mesuré)
- [x] Aucune régression : tests OCR existants passent + nouveaux cas
      (année/page/prix/N°), `lint` + `typecheck` OK

# Tests

- Parser : cas d'année (2024), page (« 52 pages »), prix (« 3,50 € »), « N° 547 »,
  « No 12 », date complète — assertions sur `issueNumber` et `confidence`.
- Manuel (dev build) : couverture réelle, titre stylisé → vérifier lecture + numéro.