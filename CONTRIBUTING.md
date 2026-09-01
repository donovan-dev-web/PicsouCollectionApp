# Contribuer à Picsou Collection

> Merci de vous intéresser à ce projet. Ce document décrit les conventions de contribution.

---

## Prérequis

- Node.js 20+
- npm
- Expo CLI (`npm install -g expo-cli`)
- EAS CLI (`npm install -g eas-cli`)
- Téléphone Android physique pour les tests caméra/OCR

---

## Démarrage

```bash
git clone https://github.com/<auteur>/PicsouCollectionApp.git
cd PicsouCollectionApp
npm install
npx expo start
```

Pour le Development Build sur téléphone :
```bash
npx expo run:android
```

---

## Branches

| Branche | Usage |
|---|---|
| `main` | Code de production, stable |
| `develop` | Intégration des fonctionnalités |
| `feature/<id>-<slug>` | Développement d'une fonctionnalité |
| `release/v<version>` | Préparation d'une release |
| `hotfix/<id>-<slug>` | Correctif urgent |

### Convention de nommage des branches

```
feature/12-scan-ean13
release/v0.1.0
hotfix/25-crash-import
```

---

## Commits

Le projet suit la convention **Conventional Commits** :

| Type | Usage |
|---|---|
| `feat:` | Nouvelle fonctionnalité |
| `fix:` | Correction de bug |
| `docs:` | Documentation |
| `refactor:` | Refactoring sans changement de comportement |
| `test:` | Ajout ou modification de tests |
| `chore:` | Tâche de maintenance (deps, config) |

### Exemple

```
feat: ajouter le scan EAN-13 via expo-camera
fix: corriger la recherche par code-barres null
docs: mettre à jour la roadmap
```

---

## Code

### Lint et typecheck

Avant de commiter, toujours vérifier :

```bash
npm run lint        # Vérification ESLint
npm run typecheck   # Vérification TypeScript
```

### Style

- TypeScript strict activé ;
- Nommage : `camelCase` pour les variables/fonctions, `PascalCase` pour les types/composants React ;
- Aucun commentaire inutile (le code doit être lisible) ;
- Les imports sont triés : externes puis internes.

### Tests

```bash
npm test                    # Mode watch
npm run test:coverage       # Rapport de couverture
```

Toute nouvelle fonctionnalité doit inclure des tests.

---

## Pull Requests

### Avant de créer une PR

1. La CI doit être verte (lint + typecheck + tests) ;
2. La branche doit être à jour avec `develop` ;
3. La documentation doit être mise à jour si nécessaire.

### Template de PR

```markdown
# Description

<Résumé des changements>

Résout : #<issue>

# Changements

- <changement 1>
- <changement 2>

# Tests

- [ ] Tests unitaires passent
- [ ] Typecheck passe
- [ ] Manuel : <description>

# Checklist

- [ ] Code relu
- [ ] Documentation mise à jour
```

---

## Workflow

```
1. Créer une issue (ou s'assigner à une existante)
2. Créer une feature branch depuis develop
3. Développer + tests + commits conventional
4. Pousser et créer une PR
5. Attendre la revue et la CI verte
6. Fusionner dans develop
```

---

## Structure du projet

```
src/
├── database/          # SQLite, migrations, repositories
├── identification/    # Scan barcode, OCR, service
├── collection/        # Service de collection
├── backup/            # Export/import JSON
├── store/             # Zustand stores
├── components/        # Composants réutilisables
├── theme/             # Design system
├── types/             # Types de domaine
└── utils/             # Utilitaires
```

---

## Documentation

La documentation technique se trouve dans `docs/`. Toute modification technique doit inclure la mise à jour du document correspondant.

| Document | Contenu |
|---|---|
| `00-GLOSSAIRE.md` | Définition des termes du projet |
| `01-VISION.md` | Vision produit |
| `02-CONCEPTUAL-MODEL.md` | Entités et règles métier |
| `03-TECHNICAL-SPEC.md` | Stack technique |
| `04-FONCTIONAL-SPEC.md` | Spécifications fonctionnelles |
| `05-ARCHITECTURE.md` | Architecture logicielle |
| `06-DATA-MODEL.md` | Modèle de données |
| `07-DATABASE-SCHEMA.md` | Schéma SQLite |
| `08-USER-STORIES.md` | User stories |
| `09-ISSUE.md` | Workflow agile |
| `10-CI-CD.md` | Pipeline CI/CD |
| `11-ROADMAP.md` | Roadmap |
| `12-TESTING.md` | Stratégie de tests |
| `13-PRIVACY.md` | Politique de confidentialité |

---

Merci de contribuer de manière constructive et respectueuse.
