# M-10R2 — 2ᵉ passe retours test physique (v0.9.2)

> Milestone correctif **après test physique du build v0.9.2** (reprise M-10R).
> Seconde passe de retours terrain : SafeZone du drawer, onboarding premier
> lancement + permission caméra, refonte écran paramètres, header fiche, tri de
> la collection.
>
> GitHub : milestone **M-10R2 — 2ᵉ passe retours test physique (v0.9.2)** —
> issues **M10R2-01 à M10R2-08**
> (voir `scripts/m10r2-create-*.sh`).

## Retours terrain → Issues

| # | Retour test physique | Issue | Labels | Taille | Domaine |
|---|---|---|---|---|---|
| 1 | Drawer latéral : pas de SafeZone (en-tête sous l'encoche) | M10R2-01 (#167) | `bug, priority-high` | S | Nav |
| 2 | Permission caméra demandée trop tard + écran sans SafeZone | M10R2-02 (#168) | `enhancement, priority-high` | M | Identification |
| 3 | Popup « Couverture reconnue » : espacement buttons | M10R2-03 (#169) | `bug, priority-high` | S | Identification |
| 4 | Formulaire : bouton Enregistrer en bas de scroll | M10R2-04 (#171) | `enhancement, priority-high` | S | Collection |
| 5 | Premier lancement : pas d'écran de présentation | M10R2-05 (#170) | `enhancement, priority-high` | L | Accueil |
| 6 | Paramètres : pas de sous-menus, aucun retour GitHub | M10R2-06 (#173) | `enhancement, priority-medium` | L | Paramètres |
| 7 | Fiche magazine : pas de header menu/scan | M10R2-07 (#166) | `enhancement, priority-high` | S | Nav |
| 8 | Collection : pas de tri (numéro ↑/↓) | M10R2-08 (#172) | `enhancement, priority-medium` | M | Collection |
| 9 | OCR : faux numéros (années/pages) + textes stylisés non lus | M10R2-09 (#174) | `bug, priority-high` | M | Identification |
| 10 | « Saisir manuellement » du flux identification → écran Recherche | M10R2-10 (#175) | `enhancement, priority-high` | M | Identification |

## Décisions de conception (post-test physique v0.9.2)

- **M10R2-01 Drawer SafeZone** : le `DrawerMenu` custom n'applique aucun inset
  (`src/components/drawer-content.tsx` — header `padding: Spacing.four` fixe,
  panneau `top:0/bottom:0`). Sur téléphone à encoche, le titre du drawer et le
  premier item passent sous la barre de statut. Fix : `useSafeAreaInsets`,
  `paddingTop: insets.top` sur le header, `paddingBottom: insets.bottom` sur le
  panneau.
- **M10R2-02 Permission caméra** : la permission est demandée au moment d'ouvrir
  un écran caméra (`useCameraPermissions` dans `camera.tsx`, `barcode.tsx`,
  `form-barcode.tsx`), et les états loading/denied sont rendus dans un
  `<View style={styles.container}>` sans `Screen`/insets (texte sous la barre de
  statut). Fix proposé en deux volets :
  1. **Demander au premier lancement** : dans le parcours d'onboarding
     (M10R2-05), demander la permission caméra avant l'accès à l'accueil ;
  2. **Écran de demande partagé + SafeZone** : factoriser un état permission
     commun (composant réutilisé par les 3 écrans caméra) rendu dans un
     `Screen` avec insets (encoche + gesture bar).
- **M10R2-04 Formulaire** : le bouton `Enregistrer` est dans le flux du
  `ScrollView` (`magazine-form.tsx:303-311`) — à, ou sous la ligne de flottaison
  petit écran. Cible retenue : **icône `Valider` (`check`) dans le header, en
  haut à droite**, toujours visible (comme discuté lors du test), le bouton
  plein largeur restant en pied de formulaire.
- **M10R2-05 Onboarding** : aucune notion de premier lancement dans l'app
  (grep Ø) — pas de flag store/settings. À créer : `onboarding` (écran de
  présentation branding : fonctionnalités / description / utilisation) + bouton
  **« Commencer »** → **écran de demande d'autorisation caméra** → accueil.
  Persister un flag (ex. `onboarding_done`) dans la table `settings` (clé/valeur
  générique déjà présente) ; redirect conditionnel dans le layout racine.
- **M10R2-06 Paramètres** : l'écran n'a que 2 sections (Apparence, Sauvegarde).
  Refonte en sous-menus : **Apparence**, **Sauvegarde**, **Accessibilité**,
  **Rapport bug / idée / suggestion** (→ ouvre la page discussions du repo
  GitHub dans le navigateur, `expo-linking`) + inventaire des options
  pertinentes par catégorie (ex. échelle de texte, animations).
- **M10R2-07 Fiche** : `collection/[id]/index.tsx` est un modal Stack sans
  header visible (`headerShown:false` global, `_layout.tsx:37`). Ajouter le même
  `AppHeader` (burger / titre / scan) que les écrans tabs pour une navigation
  fluide + accès scan depuis la fiche.
- **M10R2-09 OCR** : le repli `extractIssueNumber` de `ocrTextParser.ts:81-97`
  accepte tout nombre isolé (hors années) ; or le numéro d'exemplaire est
  **toujours précédé de « N° »** sur les couvertures. → prioriser strictement les
  préfixes (`N°`, `No`, `numéro`, `issue`), renforcer les exclusions (dates
  complètes, « 52 pages », prix). Volet reconnaissance : textes stylisés non
  lus par `expo-mlkit-ocr` (capture brute dans `mlKitOcrEngine.ts`) → zoom/
  recadrage, capture haute résolution, vote multi-frames (pattern code-barres).
- **M10R2-10 Saisie manuelle** : `/scan` (`method-manual` → `/scan/manual`) et
  drawer (« Saisie manuelle » → `/scan/manual`) se comportent comme un **ajout**
  alors qu'on est dans le **flux identification**. → nouvel écran de recherche
  `/scan/search` (champs publication + numéro, réutilise
  `findByPublicationAndIssue`) ; **trouvé** → résultat (Possédé/Absent) ;
  **non trouvé** → repli `/scan/manual` pré-rempli (publication/numéro). Le
  bouton « Ajouter » de l'accueil reste un ajout (inchangé).

## User Stories associées (voir `docs/08-USER-STORIES.md` §10)

US-UX-13 (SafeZone drawer, M10R2-01) · US-UX-14 (permission caméra, M10R2-02) ·
US-UX-15 (popup résultat, M10R2-03) · US-UX-16 (formulaire valider, M10R2-04) ·
US-UX-17 (onboarding 1er lancement, M10R2-05) · US-UX-18 (paramètres + retour,
M10R2-06) · US-UX-19 (header fiche, M10R2-07) · US-UX-20 (tri collection,
M10R2-08) · US-UX-21 (OCR numéro affiné, M10R2-09) · US-UX-22 (recherche
manuelle flux identification, M10R2-10).

## Critères de sortie (cf. 11-ROADMAP §critères)

Toutes issues Done, CI verte, test physique de validation (drawer SafeZone,
onboarding + permission, formulaire valider header, paramètres sous-menus +
lien GitHub, fiche header, tri collection), tag `v0.9.3`.