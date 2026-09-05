---
title: "[UX] M10-07 Scan barcode + multiple + result (PR1+PR2)"
labels: [enhancement, epic/identification, size/l]
milestone: "M-10 — Refonte UI/UX"
---

# Contexte

`scan/barcode.tsx` (518 lignes), `form-barcode.tsx`, `multiple.tsx`, `result.tsx` :
permission refusée sans `Ouvrir réglages`, hint sans spinner, stabilisateur 3 frames
non expliqué, `pendingCard top:30%` sans backdrop/scroll/✕, `pendingMagazine` jaune
illisible, `result` **rouge=Possédé / vert=Absent** (inversé, à corriger — validé),
3-4 boutons même style, `handleAddCopy` sans await/feedback, `multiple` sans retry/CTA.

# Tâche

PR1 — caméra + permissions :
- Permission refusée → texte + bouton `Ouvrir réglages (Linking.openSettings())`.
- Hint + `ActivityIndicator` + progression stabilisateur (`●●○`), réticule responsive (M10-02).
- `pendingCard` : backdrop dim, `ScrollView`, bouton `✕`, `maxHeight`, SafeArea.

PR2 — sémantique + result/multiple :
- **Inverser** : Possédé = vert/succès (`#1B7F3B` light / `#7BC67E` dark, fond `#E6F4EA` /
  wash sombre) + icône `check-circle Feather` ; Absent = neutre/gris-bleu + icône `x-circle`.
  Appliquer à `StatusBadge` + `result` + bannières. Supprimer emojis 🔴🟢.
- `result` : hiérarchie `Ajouter (primaire) > Voir fiche > Scanner à nouveau`,
  `await addExistingCopy + Toast`, retry si `detail` null, scroll petit écran.
- `multiple` : loading spinner, error + `Réessayer`, empty + CTA `Saisir manuellement`,
  `numberOfLines`, `push` → retour avec refresh.

# Critères de fin (DoD)

- [ ] Sémantique verte partout, contrastes AA
- [ ] Permission → réglages en 1 tap
- [ ] Tests scan/result/multiple maj (doublon, ajout direct, inconnu)

# Tests

- Permission denied, stabilisateur, ajout await, inversion couleurs (light/dark).
- Manuel : brocante, code inconnu → manuel pré-rempli, continu + doublon.
