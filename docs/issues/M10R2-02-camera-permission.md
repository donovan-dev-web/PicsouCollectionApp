---
title: "[UX] M10R2-02 Permission caméra : demandée au 1er lancement + écran partagé SafeZone"
labels: [enhancement, priority-high, epic/identification, size/m, to-do]
milestone: "M-10R2 — 2ᵉ passe retours test physique (v0.9.2)"
---

# Contexte

Test physique v0.9.2 : la permission caméra est demandée **au moment d'ouvrir
un écran caméra** (trop tard) et les états loading/denied sont rendus dans un
`<View style={styles.container}>` **sans `Screen` ni insets** → le texte passe
sous la barre de statut.

Écrans concernés (même motif dupliqué ×3) :
- `src/app/scan/camera.tsx` : `useCameraPermissions` (l.65), loading
  (l.226-233), denied (l.235-272) ;
- `src/app/scan/barcode.tsx` : denied (l.155-194) ;
- `src/app/scan/form-barcode.tsx` : loading (l.46-53), denied (l.55-94).

# Tâche

1. **Demander au premier lancement** (si possible) : dans le parcours
   d'onboarding M10R2-05, demander la permission caméra avant l'accès à
   l'accueil ;
2. **Factoriser un état permission commun** : composant partagé
   (ex. `CameraPermissionScreen`) utilisé par les 3 écrans caméra — variantes
   loading / `canAskAgain` (« Autoriser la caméra ») / refus définitif
   (« Ouvrir les réglages », `Linking.openSettings()`) / « Retour » ;
3. **SafeZone** : rendre ce composant dans `Screen` (insets encoche + gesture
   bar) avec la mise en page revue : titre, explication, boutons alignés
   (≥ 44px), bordure gestuelle respectée.

# Critères de fin (DoD)

- [x] Écran de permission SafeZone sur les 3 écrans caméra (encoche + gesture bar)
- [x] Plus de duplication loading/denied entre les écrans
- [x] Refus définitif → « Ouvrir les réglages » (1 tap, `Linking.openSettings()`)
- [x] `lint` + `typecheck` verts, tests (permission ask/denied à jour + composant partagé)
- [x] Permission proposée au premier lancement (via onboarding M10R2-05, #170)

# Tests

- Manuel : 1er lancement → permission proposée ; refus → réglages ; drawer scan → permission déjà accordée.
- Composant : états loading / canAskAgain / refused (rendu, labels, actions).