# 🦆 Picsou Collection

## Présentation du projet — Document grand public

> *Une application pensée pour les collectionneurs de magazines Disney/Picsou, conçue pour être utilisée en brocante, sans Internet et sans fausse note.*

---

## Table des matières

1. [Le projet en une page](#1-le-projet-en-une-page)
2. [Le problème que nous résolvons](#2-le-problème-que-nous-résolvons)
3. [Les promesses de l'expérience](#3-les-promesses-de-lexpérience)
4. [Principes fondamentaux](#4-principes-fondamentaux)
5. [Principales fonctionnalités](#5-principales-fonctionnalités)
6. [Les trois méthodes d'identification](#6-les-trois-méthodes-didentification)
7. [Parcours d'expérience utilisateur](#7-parcours-dexpérience-utilisateur)
8. [Les écrans de l'application](#8-les-écrans-de-lapplication)
9. [Une arborescence claire](#9-une-arborescence-claire)
10. [Le langage visuel](#10-le-langage-visuel)
11. [Souveraineté des données](#11-souveraineté-des-données)
12. [Confidentialité](#12-confidentialité)
13. [Les critères de réussite](#13-les-critères-de-réussite)
14. [Ce que l'application ne veut pas devenir](#14-ce-que-lapplication-ne-veut-pas-devenir)
15. [En résumé](#15-en-résumé)

---

## 1. Le projet en une page

**Picsou Collection** est une application Android dédiée aux collectionneurs de bandes dessinées Disney — *Picsou Magazine*, *Super Picsou Géant*, *Mickey Parade*, etc.

Son rôle est simple et précis : permettre à un collectionneur de **savoir instantanément s'il possède déjà un magazine** au moment précis où il le tient entre les mains — souvent au milieu d'une brocante, devant un carton, sans connexion internet.

L'application repose sur une vision claire : **petite, rapide, locale et fiable**. Elle n'est pas une plateforme universelle de gestion de collections, mais un outil de terrain qui répond à une seule question, avec une précision redoutable :

> **« Est-ce que je possède déjà exactement ce magazine ? »**

Destinée avant tout à un usage **personnel**, elle est pensée pour être utilisée d'une seule main, en pleine lumière, et pour donner une réponse en quelques secondes.

---

## 2. Le problème que nous résolvons

Un collectionneur de magazines Disney fait face à plusieurs difficultés concrètes :

- Il possède **beaucoup de magazines**, parfois plusieurs milliers ;
- **Plusieurs publications** peuvent utiliser le **même numéro** (le n°30 de Picsou Magazine n'est pas le n°30 de Super Picsou Géant) ;
- **Plusieurs éditions** d'un même numéro peuvent exister (éditions française, italienne, spéciales...) ;
- Certains **anciens magazines n'ont pas de code-barres** ;
- Certains **codes-barres ne sont pas répertoriés** ;
- Consulter sa collection **manuellement en brocante est trop lent** ;
- Une **connexion internet ne peut pas être garantie** au fond d'un vide-grenier.

Le résultat, on le connaît tous : **l'achat de doublons involontaires**, souvent découvert trop tard, une fois rentré à la maison.

**Picsou Collection** répond exactement à ce besoin en transformant un geste quotidien (sortir son téléphone) en une réponse fiable et immédiate.

---

## 3. Les promesses de l'expérience

Quatre promesses guident chaque décision de conception :

### ⚡ Rapidité
Identifier un magazine en **moins de 3 secondes**. Le temps entre le moment où l'on sort le téléphone et le moment où l'on obtient la réponse doit être minimal.

### 🛰️ Fiabilité
Fonctionne **100 % hors ligne**, dans les zones les plus reculées — brocantes, vide-greniers, sous-sols, greniers.

### 🧭 Simplicité
Une interface **minimaliste**, centrée sur la question essentielle : *« Possédé »* ou *« Manquant »*. Rien de superflu entre l'utilisateur et la réponse.

### 🔐 Souveraineté
L'utilisateur est **propriétaire de ses données**. Elles vivent sur son téléphone, et peuvent être sauvegardées dans un simple fichier portable.

---

## 4. Principes fondamentaux

Cinq principes structurent l'ensemble du projet :

### 4.1 « Offline First » (hors ligne d'abord)
L'application doit fonctionner **sans aucune connexion internet**. Toutes les opérations — identification, recherche, ajout, consultation, modification, vérification des doublons — sont réalisables localement. Internet n'est **jamais** une dépendance fonctionnelle.

### 4.2 Pas de serveur
Aucun backend, aucune API obligatoire, aucune synchronisation cloud, aucun compte utilisateur, aucune authentification. Cela simplifie l'expérience (rien à créer, rien à mémoriser) et garantit une confidentialité totale.

### 4.3 Une base locale unique
Toute la collection est stockée **sur le téléphone**. La base appartient entièrement à l'utilisateur.

### 4.4 Sauvegarde manuelle et portable
La sauvegarde se fait par **export dans un fichier JSON**. L'utilisateur garde le contrôle total : il peut le conserver, l'envoyer par courriel, le copier sur un ordinateur, le mettre sur une clé USB ou dans un cloud de son choix — et le réimporter quand il veut.

### 4.5 Une base qui se construit avec vous
Picsou Collection ne cherche **pas** à cataloguer tous les Picsou du monde. La base se construit **progressivement, à partir de la collection réelle de l'utilisateur**. Cela évite la lourdeur d'un catalogue mondial et garantit une pertinence maximale : les données correspondent exactement à ce que l'utilisateur possède.

---

## 5. Principales fonctionnalités

### 🏠 Accueil — le cockpit du collectionneur
Un accueil immédiat avec le **nombre de magazines possédés**, deux actions principales (**Scanner** et **Ajouter**) et les **ajouts récents**. On sait en un coup d'œil où l'on en est.

### 🔍 Identification — le cœur de l'application
Trois méthodes complémentaires pour identifier un magazine (détaillées à la section suivante) : **code-barres**, **caméra/OCR** et **saisie manuelle**. En cas d'échec d'une méthode, l'application propose naturellement la suivante.

### 📚 Ma Collection — l'inventaire
Une vue complète de la collection avec :
- **Recherche** globale (par titre ou numéro) ;
- **Filtres avancés** (type de publication, époque, statut de possession) ;
- **Tri** ;
- Consultation, modification et suppression d'une édition.

### 📇 Fiche Magazine — le détail qui compte
Pour chaque numéro, une fiche complète : publication, numéro, édition, pays, date, code-barres, et surtout la **liste des exemplaires possédés** avec pour chacun :
- l'**état** (Très Bon État, État Moyen, etc.) ;
- la **date d'ajout** ;
- des **notes personnelles** (ex. « acheté 0,50 € en brocante à Lille »).

### 📊 Paramètres — les données maîtrisées
Les statistiques de la collection, l'**export** et l'**import** de sauvegarde, le choix du thème (clair/sombre) et de la langue.

### ♻️ Gestion des doublons — sans jugement
Si l'utilisateur tente d'ajouter une édition déjà possédée, l'application l'avertit puis lui laisse le choix d'**ajouter un second exemplaire** s'il le souhaite. On peut très bien posséder deux exemplaires du même numéro — chacun garde alors sa propre fiche d'état.

---

## 6. Les trois méthodes d'identification

L'application propose **trois chemins** pour identifier un magazine. Ils sont tous accessibles directement depuis l'écran d'identification — l'utilisateur n'est jamais obligé de suivre un parcours imposé. En cas d'échec d'une méthode, l'application propose la méthode suivante sans jamais reproposer celle qui vient d'échouer.

### 6.1 Scanner de code-barres — la méthode reine
Méthode **privilégiée** lorsqu'un code-barres (EAN/ISBN) est présent et lisible.

**Flux :**
```
Caméra → détection du code-barres → recherche locale → édition trouvée ?
```

**Pourquoi c'est le choix n°1 :**
- très **rapide** ;
- **peu coûteux** en ressources ;
- **aucune image conservée** ;
- fonctionne **hors ligne** ;
- parfaitement adapté à une utilisation **en brocante**, une seule main, en pleine lumière.

### 6.2 Caméra / OCR — la sauvegarde intelligente
Méthode **secondaire**, précieuse pour les magazines **sans code-barres** ou aux codes abîmés.

L'utilisateur pointe simplement la caméra vers la couverture. L'application analyse le flux vidéo pour **extraire les informations textuelles** :

```
PICSOU MAGAZINE
N° 547
MARS 2023
```

**Points clés de l'expérience :**
- le traitement se fait **directement sur le téléphone**, hors ligne ;
- **aucune image n'est enregistrée** ; l'analyse est éphémère ;
- l'application n'analyse que **quelques images du flux** (pas toutes) pour préserver les performances et la fluctuité ;
- l'identification est accompagnée d'un **niveau de confiance** explicite pour ne jamais laisser croire à une certitude quand il n'y en a pas ;
- en cas de confiance insuffisante, l'application le dit honnêtement et propose de réessayer ou de saisir manuellement.

### 6.3 Saisie manuelle — la solution universelle
Dernière méthode, toujours disponible. Utilisée si :
- aucun code-barres n'est présent ;
- le code-barres est illisible ;
- l'OCR échoue ;
- la couverture est trop abîmée ;
- ou simplement si l'utilisateur préfère saisir.

Le formulaire est **volontairement court** : publication, numéro, édition, éventuellement date et pays.

### ↪️ L'ordre des méthodes en cas d'échec
```
Code-barres inconnu
      ↓
[ Essayer avec la caméra ]
      ↓
[ Saisir manuellement ]
```
L'utilisateur tombe naturellement, de proche en proche, sur la méthode qui fonctionne.

### ⚠️ Une règle d'or : jamais identifier par le numéro seul
Le numéro seul ne suffit **jamais**. Le n°30 de *Picsou Magazine*, de *Super Picsou Géant* et des *Trésors de Picsou* sont des magazines différents.

L'identification combine toujours le maximum d'informations disponibles :
```
Publication + Numéro + Édition + Pays + Date (éventuelle)
```
C'est cette rigueur qui garantit des réponses fiables — la clé de la confiance dans l'outil.

---

## 7. Parcours d'expérience utilisateur

### 7.1 Le parcours roi : identifier en brocante
Le scénario central, celui pour lequel l'application a été conçue :

```
Accueil
   ↓
Scanner
   ↓
Choix de la méthode (code-barres, caméra, manuel)
   ↓
Identification de l'édition
   ↓
Recherche dans la collection
   ↓
        ┌───────────────┬───────────────┐
        │               │               │
     🔴 POSSÉDÉ       🟢 ABSENT
        │               │
        ↓               ↓
  prendre sa          ajouter à la
  décision            collection
```

### 7.2 Les résultats en un coup d'œil

**🔴 Magazine déjà possédé :**
```
┌───────────────────────────────┐
│        🔴 DÉJÀ POSSÉDÉ         │
│                               │
│       Picsou Magazine         │
│             N° 547            │
│                               │
│       Édition française       │
│                               │
│       Exemplaire(s) : 1       │
│                               │
│      [ Fermer ]               │
└───────────────────────────────┘
```
Le collectionneur **prend sa décision immédiatement** : pas de doublon involontaire.

**🟢 Magazine non possédé :**
```
┌───────────────────────────────┐
│       🟢 NON POSSÉDÉ           │
│                               │
│       Picsou Magazine         │
│             N° 548            │
│                               │
│       Édition française       │
│                               │
│  [ Ajouter à la collection ]  │
│                               │
│       [ Fermer ]              │
└───────────────────────────────┘
```
L'utilisateur peut **ajouter le magazine en un geste**, sans quitter le contexte.

### 7.3 Ajout d'un doublon volontaire
Si l'utilisateur ajoute une édition déjà possédée, l'application l'informe puis lui laisse le choix :
```
⚠️ Vous possédez déjà ce magazine.
   Exemplaires actuels : 1

[ Ajouter quand même ]   [ Annuler ]
```

### 7.4 Le parcours de secours en cas d'échec
```
Échec d'une méthode
      ↓
Proposition de la méthode suivante
      ↓
ou saisie manuelle
```
L'utilisateur n'est **jamais bloqué**, jamais laissé sans solution.

---

## 8. Les écrans de l'application

Sept écrans structurent l'application, chacun en version **clair** et **sombre**.

### 8.1 Accueil
Compteur de collection en grand chiffre, boutons **Scanner** et **Ajouter** proéminents, liste des **ajouts récents**. Navigation inférieure : Accueil / Ma Collection / Paramètres.

### 8.2 Ajouter à la collection
Deux voies d'entrée : le **Scanner** (grand bouton) et un **formulaire** (publication, numéro, édition, pays, date). Bouton d'ajout collé en bas pour un geste final naturel.

### 8.3 Identifier
Le choix des trois méthodes, avec un **aperçu caméra** évocateur (réticule de scan animé). La barre de navigation est volontairement masquée pour concentrer l'attention sur la tâche : **identifier**.

### 8.4 Ma Collection
Vue liste à haute densité avec **recherche**, **filtres** et bouton flottant de scanner. Chaque entrée affiche la miniature, le numéro en grand et un **badge de statut** (Possédé / Manquant).

### 8.5 Fiche Magazine
La fiche détaillée : bannière de statut, numéro en grand, chips de métadonnées, informations d'édition et **liste des exemplaires** avec leur état et leurs notes.

### 8.6 Paramètres
Statistiques, **export/import** de la collection, thème, langue, version de l'application.

### 8.7 Recherche avancée
Filtres croisés : **type de publication**, **statut de possession**, **époque** (plage d'années). Résultats affichés avec badges et possibilité de tri.

---

## 9. Une arborescence claire

Le parcours est pensé pour rester **court et lisible** :

```
                      🦆 PICSOU COLLECTION
                            │
                            ▼
                      ┌───────────┐
                      │  ACCUEIL  │
                      └─────┬─────┘
                            │
             ┌──────────────┼──────────────┐
             ▼              ▼              ▼
          📷 SCANNER     ➕ AJOUTER      📚 COLLECTION
             │                              │
             ▼                              ▼
       ┌──────────────┐              ┌───────────────┐
       │ CHOIX MÉTHODE│              │ FICHE MAGAZINE│
       ├──────────────┤              └───────────────┘
       │ ▣ Code-barres│
       │ 📷 Caméra/OCR│
       │ ✎ Manuel     │
       └──────┬───────┘
              ▼
         IDENTIFICATION
              ▼
      ┌───────────────┐
      │ ÉDITION       │
      │ IDENTIFIÉE    │
      └───────┬───────┘
              ▼
      ┌───────┴───────┐
      ▼               ▼
   🔴 POSSÉDÉ      🟢 ABSENT
      │               │
      ▼               ▼
   Confirmer       Ajouter
```

**L'objectif :** une application assez rapide et simple pour être utilisée naturellement en quelques secondes devant un carton de magazines.

---

## 10. Le langage visuel

Chaque élément visuel a un rôle précis, pensé pour le **terrain** (brocante en pleine lumière) autant que pour l'élégance.

### 10.1 Deux environnements complémentaires

| | **Vault & Venture** | **Obsidian Vault** |
|---|---|---|
| Ambiance | **Mode clair** — professionnel, lumineux | **Mode sombre** — premium, atmosphérique |
| Usage | Optimisé **plein air**, contraste maximal | Reposant pour les yeux, en intérieur |
| Style | Utilitarisme moderne, surfaces nettes | Minimalisme élégant, effet verre (glassmorphism) |

### 10.2 La palette de marque
- **Bleu Marine Profond** `#001b3d` — l'ancre de la marque, la confiance ;
- **Jaune Picsou** `#fdd835` — l'action prioritaire, réservé au **Scanner** pour être visible même en plein soleil ;
- **Rouge** — le statut « Possédé », un signal d'arrêt immédiat ;
- **Vert** — le statut « Manquant », une invitation à l'achat ;
- **Bleu Canard** — la couleur professionnelle de navigation et des états actifs.

### 10.3 Une typographie à trois voix
1. **Chiffres expressifs** (police `anybody`) : les numéros de magazines et les grands titres de statut, en gras, pour un balayage ultra-rapide.
2. **Interface professionnelle** (police `hankenGrotesk`) : descriptions, métadonnées, listes.
3. **Étiquettes de données** (police `jetbrainsMono`) : monospace pour les détails techniques (ISBN, dates) et les boutons — un clin d'œil à l'aspect « utilitaire » de l'outil.

### 10.4 Des contours adaptés au terrain
Plutôt que des ombres portées (qui disparaissent au soleil), le système utilise des **couches de tons** et des **contours à faible contraste** pour rester lisible dans la lumière. L'effet « Vault » des résultats (fond flouté à 80 %) concentre toute l'attention sur la réponse rouge ou verte.

### 10.5 Des formes qui guident le geste
- Boutons principaux (Scanner, Ajouter) en forme de **pilule**, tactiles, grande zone d'appui minimale de **48 px** pour une utilisation d'une seule main en marchant ;
- **Badges de statut** aux coins vifs, comme des étiquettes d'archive ;
- **Cartes et champs de saisie** aux coins arrondis, style moderne et rassurant.

---

## 11. Souveraineté des données

La philosophie **« local-first, privacy-first »** est au cœur de l'expérience :

- la collection est stockée **localement sur le téléphone** ;
- **aucune donnée n'est envoyée sur internet** pour fonctionner ;
- la sauvegarde passe par un **export JSON portable**, indépendant de l'application elle-même ;
- l'utilisateur peut **exporter, transférer, archiver et restaurer** sa collection à tout moment — changement de téléphone, réinstallation, partage ;
- l'import valide le fichier et **demande confirmation** avant de remplacer ou fusionner les données, pour éviter toute perte accidentelle.

**En cas de problème :** exporter régulièrement sa collection → changer de téléphone → réinstaller l'application → importer le fichier → retrouver sa collection intacte.

---

## 12. Confidentialité

Une décision forte et assumée : **l'application ne conserve aucune image**.

La caméra sert uniquement à scanner le code-barres ou à fournir des images éphémères à la reconnaissance OCR. Une fois l'analyse terminée, ces images temporaires sont **supprimées et jamais enregistrées**.

Les bénéfices concrets :
- **stockage très léger** dans la mémoire du téléphone ;
- **base de données compacte** et rapide ;
- **aucune photo personnelle** en jeu ;
- **aucun serveur**, donc aucune donnée à collecter ;
- aucune donnée personnelle nécessaire pour utiliser l'application.

Les seules données qui sortent du téléphone sont **explicitement demandées par l'utilisateur** (un export volontaire).

---

## 13. Les critères de réussite

L'application sera considérée comme réussie si le collectionneur peut :

### 🏠 En préparant sa collection
1. ouvrir l'application ;
2. ajouter ses magazines ;
3. les enregistrer localement ;
4. exporter sa collection.

### 🛒 En brocante
1. ouvrir l'application ;
2. appuyer sur **Scanner** ;
3. choisir **code-barres** ou **caméra** ;
4. pointer le téléphone ;
5. obtenir rapidement une identification ;
6. savoir immédiatement si le magazine est **déjà possédé** ;
7. **changer de méthode** si l'identification échoue ;
8. **saisir manuellement** si nécessaire.

### 🛟 En cas de problème
1. réimporter le fichier de sauvegarde ;
2. retrouver sa collection intacte.

---

## 14. Ce que l'application ne veut pas devenir

Pour rester fidèle à sa philosophie *petite, rapide, locale et fiable*, l'application renonce volontairement à :

- tout **serveur** et toute **synchronisation cloud** obligatoire ;
- tout **compte utilisateur** et toute **authentification** ;
- un **catalogue mondial** exhaustif de toutes les publications ;
- la **reconnaissance de couverture** par comparaison d'images ;
- le **stockage permanent des photos** ;
- toute **dépendance obligatoire à Internet** ;
- le support **iOS** dans la première version.

Chaque future fonctionnalité sera évaluée à l'aune d'une question simple : *améliore-t-elle vraiment l'expérience « je suis devant un magazine, est-ce que je l'ai déjà ? » ?* Si elle ajoute de la complexité sans améliorer cette expérience, elle reste secondaire.

---

## 15. En résumé

**Picsou Collection, c'est :**

- ⚡ Une **identification en moins de 3 secondes** ;
- 🔍 Trois méthodes d'identification **complémentaires** (code-barres, caméra, manuel) ;
- 🛰️ **100 % hors ligne**, pensée pour la brocante ;
- 📚 Une **gestion d'inventaire** précise (état, notes, multiples exemplaires) ;
- 🔐 Une **souveraineté totale** sur les données, sauvegardées en JSON portable ;
- 🤫 Une **confidentialité absolue** — pas de photos, pas de serveur, pas de compte ;
- 🎨 Deux environnements visuels **clair et sombre**, pensés pour le terrain comme pour le confort.

> *Une application assez rapide et assez simple pour être utilisée naturellement en quelques secondes, devant un carton de magazines, sans Internet et sans infrastructure externe.*
**Complétez votre coffre-fort, un magazine à la fois. 🦆**

---

# Partie 2 — Présentation de la maquette

## 16. Aperçu des écrans

Cette seconde partie présente les **maquettes visuelles** des écrans de Picsou Collection, disponibles en version **clair** (*Vault & Venture*) et **sombre** (*Obsidian Vault*).

> ⚠️ **Nature provisoire de ces maquettes**
>
> Il est important de souligner que les maquettes présentées ci-dessous sont des **prototypes provisoires et non définitifs**. Elles ont pour unique objectif de **prévisualiser une base de ce que sera l'application** — laisser entrevoir l'ambiance, la structure et le langage visuel envisagés.
>
> Elles ne constituent **en aucun cas** une maquette réelle à reproduire au pixel près (**pixel-perfect**). De nombreux détails — espacements précis, tailles de police, iconographie, illustrations des couvertures, écrans d'état (chargement, erreur, vide), animations — resteront à affiner lors de la conception et du développement. Ces images sont donc à considérer comme une **direction visuelle**, pas comme une spécification figée.

## 17. Tableau des écrans

Chaque ligne du tableau correspond à un écran, avec sa version **Clair** et sa version **Sombre**. Les images sont intégrées directement ci-dessous (aucune navigation dans les dossiers nécessaire).

| Écran | Version Clair (PNG) | Version Sombre (PNG) |
|---|---|---|
| **Accueil** | ![Accueil - Mode clair](../Maquette%20Screen/accueil/screen.png) | ![Accueil - Mode sombre](../Maquette%20Screen/accueil_sombre_fr/screen.png) |
| **Ajouter à la collection** | ![Ajouter - Mode clair](../Maquette%20Screen/ajouter_la_collection/screen.png) | ![Ajouter - Mode sombre](../Maquette%20Screen/ajouter_la_collection_sombre_harmonis/screen.png) |
| **Identifier** | ![Identifier - Mode clair](../Maquette%20Screen/identifier/screen.png) | ![Identifier - Mode sombre](../Maquette%20Screen/identifier_sombre/screen.png) |
| **Ma Collection** | ![Ma Collection - Mode clair](../Maquette%20Screen/ma_collection/screen.png) | ![Ma Collection - Mode sombre](../Maquette%20Screen/ma_collection_sombre_fr/screen.png) |
| **Fiche Magazine** | ![Fiche Magazine - Mode clair](../Maquette%20Screen/fiche_magazine/screen.png) | ![Fiche Magazine - Mode sombre](../Maquette%20Screen/fiche_magazine_sombre_fr/screen.png) |
| **Paramètres** | ![Paramètres - Mode clair](../Maquette%20Screen/param_tres/screen.png) | ![Paramètres - Mode sombre](../Maquette%20Screen/param_tres_sombre_fr/screen.png) |
| **Recherche avancée** | ![Recherche - Mode clair](../Maquette%20Screen/rechercher_dans_la_base_harmonis/screen.png) | ![Recherche - Mode sombre](../Maquette%20Screen/rechercher_dans_la_base_sombre/screen.png) |

### 17.1 Lecture du tableau

Les **7 écrans** de l'application sont donc prévisualisés dans les deux environnements visuels :

- **Version Clair (Vault & Venture)** : optimisée pour le plein air, contrastes forts, surfaces lumineuses ;
- **Version Sombre (Obsidian Vault)** : ambiance premium et atmosphérique, surfaces sombres et effets de verre.

Pour chaque écran, on retrouve la trame complète de l'application : l'**Accueil** avec son compteur et ses actions Scanner/Ajouter, l'**ajout** de magazines, le choix des **méthodes d'identification**, la **collection** avec ses statuts Possédé/Manquant, la **fiche détaillée**, les **paramètres** et la **recherche avancée**.

> Rappel : il s'agit d'une **vision de travail**, destinée à alimenter la réflexion UI/UX et à servir de base de discussion — et non d'un rendu final à implémenter tel quel.
