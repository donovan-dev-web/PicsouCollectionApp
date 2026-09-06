---
title: "[Nav] M10R-03 Tabs : Accueil | Scan | Collection"
labels: [enhancement, priority-high, epic/accueil, size/m, to-do]
milestone: "M-10R — Retours test physique (v0.9.1)"
---

# Contexte

US-UX-09. Test physique : le scan est le geste premier (brocante) mais n'a pas
d'entrée directe. Cible initiale : TabBar **Accueil | Scan | Collection** —
`src/app/(tabs)/_layout.tsx` actuel : Accueil/Collection/Paramètres.

# Décision finale (wontfix)

L'issue est **fermée en `wontfix`** après décision de conception post-test :
la TabBar reste **Accueil | Collection | Paramètres** et l'accès direct au scan
est couvert par :
- le **lien scan discret du header commun** (`AppHeader`, à droite) — M10R-10 (§#162) ;
- le CTA Scanner primaire de l'Accueil (M10-04 + M10R-02) ;
- le drawer (M10R-04) qui donne aussi accès direct aux sous-écrans de scan.

Un onglet Scan central a été écarté pour ne pas encombrer la TabBar et
considérant que le scan reste atteignable en ≤ 1 tap partout.

# Tâche (abandonnée)

- ~~Remplacer l'onglet Collection→Scan : ordre Accueil, Scan, Collection ; l'onglet
  Scan ouvre `/scan` (choix OCR/Code-barres/Manuel, M10-03)~~ ;
- ~~Paramètres sort des tabs → accessible via drawer (M10R-04)~~ ;
- ~~Icônes Feather : `home`, `crop`, `book-open` ; badge compteur collection~~.

# Critères de fin (DoD) — non applicables

Fermée sans implémentation. Voir M10R-04/M10R-10 pour les alternatives retenues.
