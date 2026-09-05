# M-10R — Retours test physique M-10 (v0.9.1)

> Milestone correctif **après test physique du build preview M-10**, avant M-09.
> Convention `R` comme `M-04R` / `M-07R` (voir `docs/09-ISSUE.md` §6, `docs/11-ROADMAP.md`).
> 7 retours terrain → 11 issues (< 1 j chacune), User Stories US-UX-07..12.
>
> GitHub : milestone **#14** — issues **#153 à #163**
> (voir `scripts/m10r-create-*.sh`).

## Retours terrain → Issues

| # | Retour test physique | Issue | Labels | Taille | GitHub |
|---|---|---|---|---|---|
| 1 | Import CSV : sélecteur bloque les `.csv` (mauvais format) | M10R-01 | `bug, priority-high, epic/backup` | S | #153 |
| 2 | Accueil : Scanner/Ajouter sous les récents (scroll requis) | M10R-02 | `enhancement, epic/accueil` | S | #154 |
| 3 | Tabs : passer à Accueil \| Scan \| Collection | M10R-03 | `enhancement, priority-high, epic/accueil` | M | #155 |
| 3 | Menu latéral permanent + liens directs + sous-catégories | M10R-04 | `enhancement, priority-high` | M | #156 |
| 3 | Drawer : section éditions dynamique repliable | M10R-05 | `enhancement, epic/collection` | M | #157 |
| 4 | Formulaire : Mois/Année non scrollables | M10R-06 | `bug, epic/collection` | S | #158 |
| 4 | Formulaire : clavier masque Notes (spacer manquant) | M10R-07 | `enhancement, epic/collection` | S | #159 |
| 5 | OCR : texte stylisé comics mal lu | M10R-09 | `enhancement, epic/identification` | M | #161 |
| 5 | Caméra : pas de torche (faible lumière) | M10R-08 | `enhancement, epic/identification` | S | #160 |
| 6 | Accès scan trop profond depuis Collection/Fiche | M10R-10 | `enhancement, priority-high` | M | #162 |
| 7 | OCR : bouton code-barres sous la gesture bar | M10R-11 | `bug, priority-high, epic/identification` | S | #163 |

## Causes racine (qualifiées dans le code)

1. `native-file-gateway.ts:57` : `getDocumentAsync({ type: 'text/csv' })` — MIME non reconnu par les gestionnaires Android → fichiers grisés.
2. `(tabs)/index.tsx` : CTA après `recentSection` (+ `marginTop:auto` fragile).
3. `(tabs)/_layout.tsx` : onglets Accueil/Collection/Paramètres, zéro `Drawer` (dép. absente).
4. `select-field.tsx` : `FlatList` imbriquée dans le `ScrollView` du formulaire (conflit de scroll) ; pas de spacer bas clavier.
5. ML Kit texte standard faible sur typographies display ; pas de `enableTorch`, pas de guidage.
6. Aucun FAB dans `src/` (grep Ø).
7. `scan/camera.tsx:693` : `secondaryButton` en flux sous la caméra, sans `marginBottom` insets.

## User Stories associées (voir `docs/08-USER-STORIES.md` §10)

US-UX-07 (import CSV) → M10R-01 · US-UX-08 (CTA sans scroll) → M10R-02 ·
US-UX-09 (drawer + tabs) → M10R-03..05 · US-UX-10 (formulaire clavier) → M10R-06/07 ·
US-UX-11 (OCR réel) → M10R-08/09 · US-UX-12 (scan permanent) → M10R-10/11.

## Critères de sortie (cf. 11-ROADMAP §critères)

Toutes issues Done, CI verte, test physique de validation (import CSV réel,
drawer, formulaire au clavier, torche, FAB, gesture bar), tag `v0.9.1`.
