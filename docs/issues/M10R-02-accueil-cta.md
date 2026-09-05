---
title: "[UX] M10R-02 Accueil : CTA Scanner/Ajouter au-dessus des récents"
labels: [enhancement, epic/accueil, size/s, to-do]
milestone: "M-10R — Retours test physique (v0.9.1)"
---

# Contexte

US-UX-08. Test physique : en brocante, Scanner/Ajouter sont **sous** « Ajouts
récents » (`src/app/(tabs)/index.tsx`, CTA après `recentSection` + `marginTop:auto`
fragile) → scroll requis à 1 main, réponse < 3 s compromise.

# Tâche

- Remonter le bloc CTA (Scanner primaire 56px + Ajouter outline) **au-dessus** de
  « Ajouts récents », sous le compteur ;
- Supprimer `marginTop:auto` (ordre de flux robuste, `Screen` + SafeZone inchangés) ;
- Conserver testIDs (`scan-button`, `add-button`, `recent-item`, `recent-empty-cta`)
  et labels d'accessibilité.

# Critères de fin (DoD)

- [ ] Scanner accessible sans scroll à l'ouverture (petit écran 5")
- [ ] `lint` + `typecheck` verts, tests Accueil verts (ordre CTA avant récents)
