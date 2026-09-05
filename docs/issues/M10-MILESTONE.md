# M-10 — Refonte UI/UX « Vault Lisible » (v0.9.0)

> Milestone **avant M-09** (publication → v1.0.0). Objectif : véritable amélioration
> UI/UX — SafeZone, accessibilité WCAG AA, lisibilité plein soleil, TabBar à icônes,
> cohérence Vault & Venture (clair) / Obsidian Vault (sombre).
>
> GitHub : milestone **#13** — issues **#140 à #151** (créées le 2026-09-05,
> voir `scripts/m10-create-*.sh`).

## Objectifs

- [ ] SafeArea partout (encoche, gesture bar, tabBar, caméra `top:48` en dur supprimé)
- [ ] Contraste texte ≥ 4.5:1 (fini `#FDD835` en texte sur fond clair)
- [ ] TabBar à icônes Expo Vector Icons (Feather), actif visible clair + sombre
- [ ] Cibles tactiles ≥ 44px, `hitSlop:8`, feedbacks `ripple` + pressed
- [ ] Sémantique inversée : Possédé = vert/bleu positif, Absent = neutre/gris
- [ ] Parcours brocante < 3s à 1 main : Scanner prioritaire, empty/loading/error + CTA
- [ ] CI verte : lint + typecheck + tests (seuil 80 %) + test device clair/sombre

## Issues

| Issue | Titre | Labels | Taille | GitHub |
|---|---|---|---|---|
| M10-01 | Tokens + typo + contraste | `enhancement, priority-high, epic/quality` | M | #140 |
| M10-02 | SafeZone globale | `enhancement, priority-high` | M | #141 |
| M10-03 | TabBar + icônes + routes Stack | `enhancement, priority-high, epic/accueil` | M | #142 |
| M10-04 | Accueil cockpit brocante | `enhancement, epic/accueil` | M | #143 |
| M10-05 | Collection : filtres + pagination + carte | `enhancement, epic/collection` | M | #144 |
| M10-06 | Fiche + Edit | `enhancement, epic/collection` | S | #145 |
| M10-07 | Scan barcode + multiple + result | `enhancement, epic/identification` | L (2 PR) | #146 |
| M10-08 | Scan camera OCR + manual | `enhancement, epic/identification` | M | #147 |
| M10-09 | Settings backup | `enhancement, epic/backup` | S | #148 |
| M10-10 | Accessibilité + lisibilité | `enhancement, priority-high` | M | #149 |
| M10-11 | Empty/Loading/Error + Toast | `enhancement` | M | #150 |
| M10-12 | Docs + scripts gh | `documentation` | S | #151 |

## User Stories associées (voir `docs/08-USER-STORIES.md` § UX)

US-UX-01 (contraste) → M10-01 · US-UX-02 (SafeZone) → M10-02 ·
US-UX-03 (icônes/menu) → M10-03 · US-UX-04 (parcours <3s) → M10-04..08 ·
US-UX-05 (a11y) → M10-10 · US-UX-06 (empty/error) → M10-11.

## Critères de sortie (cf. 11-ROADMAP §15)

Toutes issues Done, tests verts, typecheck + lint OK, test manuel device
clair/sombre + petit écran + encoche, doc maj, `develop` livrée, tag `v0.9.0`.
