<div align="center">

# 🦆 Picsou Collection

### Gérez vos magazines Disney — sans doublons, sans internet, sans faux pas

![Platform](https://img.shields.io/badge/Plateforme-Android-g?style=for-the-badge&logo=android&logoColor=white&color=3DDC84)
![Framework](https://img.shields.io/badge/React%20Native-Expo-blue?style=for-the-badge&logo=react&logoColor=white&color=61DAFB)
![Database](https://img.shields.io/badge/Base%20de%20donne%CC%81es-Locale%20SQLite-orange?style=for-the-badge&logo=sqlite&logoColor=white&color=47A248)
![Offline](https://img.shields.io/badge/Offline%20First-100%25-brightgreen?style=for-the-badge&logo=cloud-offline&color=2E7D32)
![Status](https://img.shields.io/badge/Statut-En%20de%CC%81veloppement-informational?style=for-the-badge&color=00629E)
![Version](https://img.shields.io/badge/Version-0.7.1-yellow?style=for-the-badge&color=FDD835)

<br/>

> ## 📖 **Présentation générale du projet**
>
> Retrouvez l'ensemble du projet — présentation, fonctionnalités, parcours UX, maquettes,
> design system et documentations — dans le document de présentation complet :
>
> ### 👉 **[Lire la présentation complète →](docs/presentation_picsou_collection.md)**

<br/>

</div>

---

## ✨ À propos

**Picsou Collection** est une application Android dédiée aux collectionneurs de bandes dessinées Disney (*Picsou Magazine*, *Super Picsou Géant*, *Mickey Parade*, etc.).

Son rôle : permettre à un collectionneur de **savoir instantanément s'il possède déjà un magazine** au moment précis où il le tient entre les mains — au milieu d'une brocante, sans connexion internet.

> **« Est-ce que je possède déjà exactement ce magazine ? »**

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
- **🔁 Scan en continu** — scanner plusieurs magazines à la suite sans s'arrêter, avec confirmation à chaque ajout.
- **📚 Ma Collection** — inventaire avec recherche globale, filtres utiles (type de publication, époque/années, numéro) et tri.
- **📇 Fiche Magazine** — détail d'une édition ; les détails de fiche (état, notes, date) sont optionnels.
- **♻️ Gestion des doublons** — alerte puis choix de l'utilisateur (ajout d'un second exemplaire possible).
- **📊 Paramètres** — statistiques, export/import de sauvegarde (JSON / CSV), thème, langue.

> **Clarification importante** : un code-barres ne crée jamais une édition à lui seul. Il sert uniquement à retrouver une édition **déjà présente dans la base** ; à défaut, la saisie manuelle prend le relais.

---

## 🎨 Design system

Deux environnements visuels, chacun avec sa charte graphique détaillée dans le dossier `docs/design/Charte Graphique/` :

| | **Vault & Venture** | **Obsidian Vault** |
|---|---|---|
| **Mode** | Clair — optimisé plein air | Sombre — premium & atmosphérique |

**Palette de marque** : Bleu Marine Profond `#001b3d` · Jaune Picsou `#fdd835` · Rouge (Possédé) · Vert (Manquant) · Bleu Canard (navigation).

**Typographie à trois voix** : `anybody` (chiffres/numéros), `hankenGrotesk` (interface), `jetbrainsMono` (données & libellés).

Les maquettes (7 écrans × versions clair & sombre) se trouvent dans le dossier `docs/design/Maquette Screen/`.

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
PicsouCollectionApp/
│
├── README.md                       ← Vous êtes ici
├── docs/                           ← Documentation complète
│   ├── 00-GLOSSAIRE.md … 13-PRIVACY.md
│   ├── presentation_picsou_collection.md
│   └── design/                     ← Chartes, maquettes, marketing
│
├── src/                            ← Code source (React Native + Expo)
│   ├── app/               # Expo Router (écrans + navigation)
│   │   ├── _layout.tsx
│   │   ├── index.tsx
│   │   └── +not-found.tsx
│   ├── constants/         # Thème & constantes (co-localisés avec leurs tests)
│   ├── database/          # SQLite (initialisation, migrations)
│   ├── store/             # Zustand stores
│   └── __tests__/         # Tests Jest (co-localisés)
│
├── eas.json               # Profils EAS Build (development / preview / production)
├── package.json           # Scripts & dépendances
└── CONTRIBUTING.md        # Conventions de contribution
```

---

## 🛠️ Stack technique

| Domaine | Technologie |
|---|---|
| **Framework** | React Native + Expo (Development Build) |
| **Langage** | TypeScript (strict) |
| **Navigation** | Expo Router |
| **Base de données** | SQLite (`expo-sqlite`) |
| **État** | Zustand |
| **Caméra** | `expo-camera` |
| **OCR** | Google ML Kit Text Recognition (`expo-mlkit-ocr`) |
| **Fichiers** | `expo-file-system` + `expo-sharing` |
| **Tests** | Jest (`jest-expo`) + `expo-doctor` |
| **Build / CI** | EAS Build (development / preview / production) + Git Flow, GitHub Actions |

---

## 🛣️ Roadmap

| Phase | Contenu | Statut |
|---|---|---|
| **0 — Cadrage** | Problème, offline, stack, UX | ✅ Terminé |
| **1 — Initialisation** | Projet Expo, TypeScript, Router, SQLite, EAS, CI | ✅ Terminé — **v0.1.0** |
| **2 — Base de données** | Migrations, repositories, gestion collection | ✅ Terminé — **v0.2.0** |
| **3 — Interface principale** | Accueil, collection, ajout, paramètres, navigation | ✅ Terminé — **v0.3.0** |
| **4 — Scan code-barres** | Intégration caméra, détection, recherche | ✅ Terminé — **v0.4.0** |
| **4R — Retours test** | Fiabilisation scan, saisie assistée, collection | ✅ Terminé — **v0.4.1** |
| **5 — Caméra / OCR** | Librairie OCR (`expo-mlkit-ocr`), extraction, confiance | ✅ Terminé — **v0.5.0** |
| **6 — Parcours complet** | Scan en continu, identification → Possédé / Manquant, gestion doublons | ✅ Terminé — **v0.6.0** |
| **7 — Export / Import** | Format JSON v1, partage, restauration | ✅ Terminé — **v0.7.0** |
| **7R — Retours test** | OCR ciblé (surcouche + validation), confiance assouplie, export/import JSON ou CSV | ✅ Terminé — **v0.7.1** |
| **8 — Optimisation & qualité** | Performance, requêtes, couverture de tests | ⬜ À venir |
| **9 — Tests terrain & publication** | Vrais magazines, Play Store | ⬜ À venir |

Détail complet : [docs/11-ROADMAP.md](docs/11-ROADMAP.md)

---

## 📄 Documentation

La documentation complète du projet se trouve dans [`docs/`](docs/), organisée en documents numérotés et référencés entre eux :

| Document | Contenu |
|---|---|
| [00-GLOSSAIRE.md](docs/00-GLOSSAIRE.md) | Définition des termes du projet |
| [01-VISION.md](docs/01-VISION.md) | Vision produit |
| [02-CONCEPTUAL-MODEL.md](docs/02-CONCEPTUAL-MODEL.md) | Entités et règles métier |
| [03-TECHNICAL-SPEC.md](docs/03-TECHNICAL-SPEC.md) | Stack technique |
| [04-FONCTIONAL-SPEC.md](docs/04-FONCTIONAL-SPEC.md) | Spécifications fonctionnelles |
| [05-ARCHITECTURE.md](docs/05-ARCHITECTURE.md) | Architecture logicielle |
| [06-DATA-MODEL.md](docs/06-DATA-MODEL.md) | Modèle de données |
| [07-DATABASE-SCHEMA.md](docs/07-DATABASE-SCHEMA.md) | Schéma SQLite (2 tables) |
| [08-USER-STORIES.md](docs/08-USER-STORIES.md) | User stories |
| [09-ISSUE.md](docs/09-ISSUE.md) | Workflow agile |
| [10-CI-CD.md](docs/10-CI-CD.md) | Pipeline CI/CD |
| [11-ROADMAP.md](docs/11-ROADMAP.md) | Roadmap |
| [12-TESTING.md](docs/12-TESTING.md) | Stratégie de tests |
| [13-PRIVACY.md](docs/13-PRIVACY.md) | Politique de confidentialité |
| [presentation_picsou_collection.md](docs/presentation_picsou_collection.md) | Présentation générale (client / UX) |

---

## 🤝 Contribuer

Ce projet est avant tout un **projet personnel** conçu pour un usage individuel. Toutefois, les retours et suggestions constructives sont les bienvenus.

**Philosophie du projet :**

> *Petit, rapide, local et fiable.*

Toute nouvelle fonctionnalité est évaluée à l'aune d'une question simple : *« Améliore-t-elle vraiment l'expérience "je suis devant un magazine, est-ce que je l'ai déjà ?" ? »*

Les conventions (branches, commits, PR, lint/typecheck) sont détaillées dans [CONTRIBUTING.md](CONTRIBUTING.md).

---

<div align="center">

**🦆 Complétez votre coffre-fort, un magazine à la fois.**

</div>
