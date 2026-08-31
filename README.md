<div align="center">

# 🦆 Picsou Collection

### Gérez vos magazines Disney — sans doublons, sans internet, sans faux pas

![Platform](https://img.shields.io/badge/Plateforme-Android-g?style=for-the-badge&logo=android&logoColor=white&color=3DDC84)
![Framework](https://img.shields.io/badge/React%20Native-Expo-blue?style=for-the-badge&logo=react&logoColor=white&color=61DAFB)
![Database](https://img.shields.io/badge/Base%20de%20donne%CC%81es-Locale%20SQLite-orange?style=for-the-badge&logo=sqlite&logoColor=white&color=47A248)
![Offline](https://img.shields.io/badge/Offline%20First-100%25-brightgreen?style=for-the-badge&logo=cloud-offline&color=2E7D32)
![Status](https://img.shields.io/badge/Statut-Prototype-informational?style=for-the-badge&color=00629E)
![Version](https://img.shields.io/badge/Version-0.2-yellow?style=for-the-badge&color=FDD835)

<br/>

> ## 📖 **Présentation générale du projet**
>
> Retrouvez l'ensemble du projet — présentation, fonctionnalités, parcours UX, maquettes,
> design system et documentations — dans le document de présentation complet :
>
> ### 👉 **[Lire la présentation complète →](Docs%20Design/presentation_picsou_collection.md)**

<br/>

</div>

---

## ✨ À propos

**Picsou Collection** est une application Android dédiée aux collectionneurs de bandes dessinées Disney (*Picsou Magazine*, *Super Picsou Géant*, *Mickey Parade*, etc.).

Son rôle : permettre à un collectionneur de **savoir instantanément s'il possède déjà un magazine** au moment précis où il le tient entre les mains — au milieu d'une brocante, sans connexion internet.

> **« Est-ce que je possède déjà exactement ce magazine ? »**

---

## 🧭 Table des matières

- [✨ À propos](#-à-propos)
- [🚀 Les promesses](#-les-promesses)
- [🔍 Principales fonctionnalités](#-principales-fonctionnalités)
- [🎨 Design system](#-design-system)
- [📐 Les maquettes](#-les-maquettes)
- [🛡️ Confidentialité & données](#️-confidentialité--données)
- [📂 Structure du projet](#-structure-du-projet)
- [🛠️ Stack technique](#️-stack-technique)
- [🛣️ Roadmap](#️-roadmap)
- [📄 Documentation](#-documentation)
- [🤝 Contribuer](#-contribuer)

---

## 🚀 Les promesses

| | Promesse | Détail |
|---|---|---|
| ⚡ | **Rapidité** | Identifier un magazine en moins de 3 secondes |
| 🛰️ | **Fiabilité** | Fonctionne à 100 % hors ligne (brocantes, vide-greniers) |
| 🧭 | **Simplicité** | Interface minimaliste centrée sur « Possédé » vs « Manquant » |
| 🔐 | **Souveraineté** | Vos données vivent sur votre téléphone, sauvegardées en JSON portable |

---

## 🔍 Principales fonctionnalités

- **🏠 Accueil** — compteur de collection, actions Scanner/Ajouter, ajouts récents.
- **🔍 Identification** — trois méthodes complémentaires : **code-barres**, **caméra/OCR**, **saisie manuelle**.
- **📚 Ma Collection** — inventaire avec recherche globale, filtres avancés et tri.
- **📇 Fiche Magazine** — détail d'une édition : état, date, notes, multiples exemplaires.
- **📊 Paramètres** — statistiques, export/import de sauvegarde, thème, langue.
- **♻️ Gestion des doublons** — alerte puis choix de l'utilisateur (ajout d'un second exemplaire possible).

---

## 🎨 Design system

Deux environnements visuels, chacun avec sa charte graphique détaillée dans le dossier `Charte Graphique/` :

| | **Vault & Venture** | **Obsidian Vault** |
|---|---|---|
| **Mode** | Clair — optimisé plein air | Sombre — premium & atmosphérique |
| **Lien** | [`Charte Graphique/vault_venture/DESIGN.md`](Charte%20Graphique/vault_venture/DESIGN.md) | [`Charte Graphique/obsidian_vault/DESIGN.md`](Charte%20Graphique/obsidian_vault/DESIGN.md) |

**Palette de marque** : Bleu Marine Profond `#001b3d` · Jaune Picsou `#fdd835` · Rouge (Possédé) · Vert (Manquant) · Bleu Canard (navigation).

**Typographie à trois voix** : `anybody` (chiffres/numéros), `hankenGrotesk` (interface), `jetbrainsMono` (données & libellés).

---

## 📐 Les maquettes

L'ensemble des maquettes (7 écrans × versions clair & sombre) se trouve dans le dossier `Maquette Screen/`.

| Écran | Version Clair | Version Sombre |
|---|---|---|
| **Accueil** | [accueil](Maquette%20Screen/accueil/code.html) | [accueil sombre](Maquette%20Screen/accueil_sombre_fr/code.html) |
| **Ajouter à la collection** | [ajouter](Maquette%20Screen/ajouter_la_collection/code.html) | [ajouter sombre](Maquette%20Screen/ajouter_la_collection_sombre_harmonis/code.html) |
| **Identifier** | [identifier](Maquette%20Screen/identifier/code.html) | [identifier sombre](Maquette%20Screen/identifier_sombre/code.html) |
| **Ma Collection** | [ma collection](Maquette%20Screen/ma_collection/code.html) | [ma collection sombre](Maquette%20Screen/ma_collection_sombre_fr/code.html) |
| **Fiche Magazine** | [fiche magazine](Maquette%20Screen/fiche_magazine/code.html) | [fiche magazine sombre](Maquette%20Screen/fiche_magazine_sombre_fr/code.html) |
| **Paramètres** | [paramètres](Maquette%20Screen/param_tres/code.html) | [paramètres sombre](Maquette%20Screen/param_tres_sombre_fr/code.html) |
| **Recherche avancée** | [recherche](Maquette%20Screen/rechercher_dans_la_base_harmonis/code.html) | [recherche sombre](Maquette%20Screen/rechercher_dans_la_base_sombre/code.html) |

> ⚠️ **Maquettes provisoires** — prototypes visuels destinés à prévisualiser une base de l'application, et **non** des maquettes pixel-perfect à reproduire telles quelles.

---

## 🛡️ Confidentialité & données

- **Offline first** : toutes les opérations fonctionnent sans internet ;
- **Aucun serveur** : pas de compte, pas de synchronisation cloud obligatoire ;
- **Aucune image stockée** : la caméra sert uniquement à l'analyse éphémère ;
- **100 % local** : la base appartient entièrement à l'utilisateur ;
- **Sauvegarde portable** : export/import en JSON, contrôle total de vos données.

---

## 📂 Structure du projet

```
stitch_application_interface_prototype/
│
├── README.md                       ← Vous êtes ici
│
├── Charte Graphique/
│   ├── vault_venture/
│   │   └── DESIGN.md               ← Design system (mode clair)
│   └── obsidian_vault/
│       └── DESIGN.md               ← Design system (mode sombre)
│
├── Docs Design/
│   ├── presentation_picsou_collection.md   ← Présentation générale
│   ├── prd_picsou_collection_fr.md         ← PRD (Product Requirements Document)
│   ├── picsou_collection_v0.2.md           ← Spécification technique v0.2
│   ├── composants_du_magasin_d_applications_fr.md  ← Composants store
│   └── aso_metadata_picsou_collection_fr.md        ← Métadonnées ASO
│
├── Maquette Screen/
│   ├── accueil/                     ← Écran Accueil (clair) + sombre
│   ├── ajouter_la_collection/       ← Écran Ajouter
│   ├── identifier/                  ← Écran Identifier
│   ├── ma_collection/               ← Écran Ma Collection
│   ├── fiche_magazine/              ← Écran Fiche Magazine
│   ├── param_tres/                  ← Écran Paramètres
│   └── rechercher_dans_la_base_*/   ← Écran Recherche avancée
│       (chaque dossier contient code.html + screen.png)
│
└── Marketing Branding/
    └── screenshot_*.png             ← Assets marketing pour le store
```

---

## 🛠️ Stack technique

| Domaine | Technologie |
|---|---|
| **Framework** | React Native + Expo (Development Build) |
| **Langage** | TypeScript |
| **Navigation** | Expo Router |
| **Base de données** | SQLite (`expo-sqlite`) |
| **Caméra** | `expo-camera` |
| **OCR** | Google ML Kit Text Recognition |
| **Fichiers** | `expo-file-system` + `expo-sharing` |

---

## 🛣️ Roadmap

| Phase | Contenu | Statut |
|---|---|---|
| **0 — Cadrage** | Problème, offline, stack, UX | ✅ Terminé |
| **1 — Initialisation** | Projet Expo, TypeScript, Router, SQLite | ⬜ À venir |
| **2 — Base de données** | Migrations, repositories, gestion collection | ⬜ À venir |
| **3 — Interface principale** | Accueil, collection, ajout, paramètres, navigation | ⬜ À venir |
| **4 — Scanner code-barres** | Intégration caméra, détection, recherche | ⬜ À venir |
| **5 — OCR** | Librairie OCR, extraction, confiance | ⬜ À venir |
| **6 — Parcours complet** | Identification → Possédé / Manquant | ⬜ À venir |
| **7 — Export/Import** | Format JSON v1, partage, restauration | ⬜ À venir |
| **8 — Optimisation** | Performance, requêtes, index | ⬜ À venir |
| **9 — Tests terrain** | Vrais magazines, conditions réelles | ⬜ À venir |

---

## 📄 Documentation

| Document | Description | Lien |
|---|---|---|
| **Présentation générale** | Projet, fonctionnalités, UX, maquettes | [📖 Lire →](Docs%20Design/presentation_picsou_collection.md) |
| **PRD** | Exigences produit & vision | [PRD →](Docs%20Design/prd_picsou_collection_fr.md) |
| **Spécification v0.2** | Référence technique complète | [v0.2 →](Docs%20Design/picsou_collection_v0.2.md) |
| **Composants store** | Livrables pour la fiche du store | [Store →](Docs%20Design/composants_du_magasin_d_applications_fr.md) |
| **ASO** | Optimisation App Store & Google Play | [ASO →](Docs%20Design/aso_metadata_picsou_collection_fr.md) |

---

## 🤝 Contribuer

Ce projet est avant tout un **projet personnel** conçu pour un usage individuel. Toutefois, les retours et suggestions constructives sont les bienvenus.

**Philosophie du projet :**

> *Petit, rapide, local et fiable.*

Toute nouvelle fonctionnalité est évaluée à l'aune d'une question simple : *« Améliore-t-elle vraiment l'expérience "je suis devant un magazine, est-ce que je l'ai déjà ?" ? »*

---

<div align="center">

**🦆 Complétez votre coffre-fort, un magazine à la fois.**

</div>
