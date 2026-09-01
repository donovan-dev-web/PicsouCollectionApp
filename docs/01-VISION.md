# 🦆 Picsou Collection — Vision

> **Document fondateur du projet — v1.0**
>
> Ce document définit la vision produit, les objectifs, la philosophie et les critères de succès de Picsou Collection. Il constitue la référence pour toute décision future.

---

## Table des matières

1. [Résumé en une phrase](#1-résumé-en-une-phrase)
2. [Le problème](#2-le-problème)
3. [La solution](#3-la-solution)
4. [Les objectifs du projet](#4-les-objectifs-du-projet)
5. [Les non-objectifs](#5-les-non-objectifs)
6. [La philosophie](#6-la-philosophie)
7. [Le public cible](#7-le-public-cible)
8. [Les promesses de l'expérience](#8-les-promesses-de-lexpérience)
9. [Les principes fondamentaux](#9-les-principes-fondamentaux)
10. [Les critères de succès](#10-les-critères-de-succès)
11. [La stratégie de publication](#11-la-stratégie-de-publication)
12. [Le positionnement](#12-le-positionnement)
13. [La vision à long terme](#13-la-vision-à-long-terme)

---

## 1. Résumé en une phrase

**Picsou Collection** est une application Android qui permet à un collectionneur de magazines Disney de savoir instantanément, en brocante et sans connexion internet, s'il possède déjà exactement le magazine qu'il tient entre les mains.

---

## 2. Le problème

Un collectionneur de magazines Disney (*Picsou Magazine*, *Super Picsou Géant*, *Mickey Parade*, *Les Trésors de Picsou*, etc.) fait face à des difficultés concrètes :

- il possède **beaucoup de magazines**, parfois plusieurs milliers ;
- **plusieurs publications** peuvent utiliser le **même numéro** (le n°30 de *Picsou Magazine* n'est pas le n°30 de *Super Picsou Géant*) ;
- **plusieurs éditions** d'un même numéro peuvent exister (france, italienne, spéciales, rééditions) ;
- certains **anciens magazines n'ont pas de code-barres** ;
- certains **codes-barres ne sont pas répertoriés** dans les bases publiques ;
- **consulter sa collection manuellement en brocante est trop lent** ;
- une **connexion internet ne peut pas être garantie** au fond d'un vide-grenier.

Le résultat, bien connu du collectionneur : **l'achat de doublons involontaires**, souvent découvert trop tard, une fois rentré à la maison.

### La question fondamentale

> **« Est-ce que je possède déjà exactement ce magazine ? »**

Toutes les fonctionnalités de l'application sont évaluées à l'aune de cette question.

---

## 3. La solution

Picsou Collection transforme un geste quotidien — sortir son téléphone — en une réponse fiable et immédiate.

L'application repose sur **trois méthodes complémentaires d'identification** :

| Méthode | Quand | Privilégiée |
|---|---|---|
| **Scan code-barres** (EAN-13 / ISBN) | Code-barres présent et lisible | ✅ Oui |
| **Caméra / OCR** | Pas de code-barres, couverture exploitable | Non, mais intégrée au MVP |
| **Saisie manuelle** | Toutes les autres situations | Non, secours ultime |

Chaque méthode aboutit au même résultat : l'identification de l'édition, puis la vérification de sa présence dans la collection (**Possédé** 🔴 / **Absent** 🟢).

---

## 4. Les objectifs du projet

### 4.1 Objectif produit
Fournir un outil de terrain fiable, rapide et hors ligne pour vérifier la possession d'un magazine.

### 4.2 Objectif personnel de l'auteur
Ce projet est avant tout un **projet personnel** conçu pour un usage individuel. Il s'inscrit dans une démarche d'apprentissage et de démonstration de compétences.

### 4.3 Objectif de publication
L'application a pour objectif final la **publication sur le Google Play Store**, dans une perspective de **portfolio professionnel**. Cela conditionne :

- la qualité et la maintenabilité du code ;
- la documentation ;
- la couverture de tests ;
- la politique de confidentialité ;
- les métadonnées du store (ASO).

---

## 5. Les non-objectifs

Pour rester fidèle à la philosophie *petite, rapide, locale et fiable*, l'application **renonce volontairement** à :

- tout **serveur** et toute **synchronisation cloud** obligatoire ;
- tout **compte utilisateur** et toute **authentification** ;
- un **catalogue mondial** exhaustif de toutes les publications ;
- la **reconnaissance de couverture** par comparaison d'images ;
- le **stockage permanent des photos** ;
- toute **dépendance obligatoire à Internet** ;
- le support **iOS** (non prévu, faute de matériel et de besoin).

> Ce ne sont pas des oublis : ce sont des **décisions de conception assumées**.

---

## 6. La philosophie

> **Petit, rapide, local et fiable.**

Le projet ne cherche pas à être une plateforme universelle de gestion de collections. Il résout un problème concret et précis.

Chaque fonctionnalité est évaluée à l'aune d'une question simple :

> *« Améliore-t-elle vraiment l'expérience "je suis devant un magazine, est-ce que je l'ai déjà ?" ? »*

Si elle ajoute de la complexité sans améliorer cette expérience, elle reste secondaire.

---

## 7. Le public cible

### 7.1 Public principal
Le créateur du projet lui-même, collectionneur de magazines Disney.

### 7.2 Public secondaire
Tout collectionneur de magazines Disney/Picsou présentant le même besoin, susceptible de télécharger l'application depuis le Play Store.

### 7.3 Persona type

> **Marc, 45 ans, collectionneur depuis 30 ans.**
> Possède ~1 500 magazines. Chaque week-end, il fait les brocantes. Devant un carton, il sort son téléphone, scanne la couverture, et veut savoir immédiatement s'il possède déjà le numéro. Pas de réseau fiable. Il veut une réponse en moins de 3 secondes, sans saisie fastidieuse.

---

## 8. Les promesses de l'expérience

### ⚡ Rapidité
Identifier un magazine en **moins de 3 secondes**. Le temps entre la sortie du téléphone et la réponse doit être minimal.

### 🛰️ Fiabilité
Fonctionne **100 % hors ligne**, dans toutes les conditions — brocantes, vide-greniers, sous-sols.

### 🧭 Simplicité
Interface **minimaliste**, centrée sur la question *« Possédé »* ou *« Manquant »*. Rien de superflu entre l'utilisateur et la réponse.

### 🔐 Souveraineté
L'utilisateur est **propriétaire de ses données**. Elles vivent sur son téléphone, avec sauvegarde en fichier JSON portable.

---

## 9. Les principes fondamentaux

### 9.1 Offline First
Toutes les opérations — identification, recherche, ajout, consultation, modification, vérification des doublons — fonctionnent **sans aucune connexion internet**. Internet n'est **jamais** une dépendance fonctionnelle.

### 9.2 Pas de serveur
Aucun backend, aucune API obligatoire, aucune synchronisation cloud, aucun compte utilisateur. Cela simplifie l'expérience et garantit la confidentialité.

### 9.3 Base locale unique
Toute la collection est stockée **sur le téléphone**, dans une base SQLite.

### 9.4 Sauvegarde manuelle et portable
La sauvegarde se fait par **export dans un fichier JSON**. L'utilisateur garde le contrôle total : conservation, envoi par mail, copie sur ordinateur, réimport.

### 9.5 Base construite avec l'utilisateur
La base **ne cherche pas à cataloguer tous les Picsou du monde**. Elle se construit progressivement à partir de la collection réelle de l'utilisateur.

### 9.6 Aucune image conservée
La caméra sert uniquement à analyser des images **éphémères** (code-barres ou frames OCR). Aucune image n'est stockée.

---

## 10. Les critères de succès

L'application sera considérée comme réussie si le collectionneur peut :

### En préparant sa collection
1. ouvrir l'application ;
2. ajouter ses magazines ;
3. les enregistrer localement ;
4. exporter sa collection.

### En brocante
1. ouvrir l'application ;
2. appuyer sur **Scanner** ;
3. choisir **code-barres** ou **caméra** ;
4. pointer le téléphone ;
5. obtenir rapidement une identification ;
6. savoir immédiatement si le magazine est **déjà possédé** ;
7. changer de méthode si l'identification échoue ;
8. saisir manuellement si nécessaire.

### En cas de problème
1. réimporter le fichier de sauvegarde ;
2. retrouver sa collection intacte.

---

## 11. La stratégie de publication

### 11.1 Objectif final
Publication sur le **Google Play Store** dans le cadre d'un portfolio professionnel.

### 11.2 Implications
- Les métadonnées ASO et les captures d'écran existent déjà (`Docs Design/`) ;
- Une **politique de confidentialité** est requise (voir `13-PRIVACY.md`) ;
- La qualité de code et la couverture de tests sont des priorités (voir `12-TESTING.md`) ;
- Le build de production utilise **EAS Build** (voir `03-TECHNICAL-SPEC.md`) ;
- L'application doit être utilisable par un **tiers** sans documentation (onboarding implicite).

### 11.3 Non-engagement
La publication est un **objectif**, pas une date limite. Le projet avance par petites itérations stables. La publication interviendra lorsque la qualité et la stabilité le permettront.

---

## 12. Le positionnement

| Critère | Picsou Collection |
|---|---|
| Cible | Collectionneurs Disney/Picsou |
| Plateforme | Android |
| Mode de fonctionnement | 100 % hors ligne |
| Base de données | Locale (SQLite) |
| Identification | Code-barres + OCR + manuel |
| Données | Propriété de l'utilisateur |
| Sauvegarde | Export JSON portable |
| Serveur | Aucun |
| Images | Aucune conservée |

---

## 13. La vision à long terme

La vision n'est pas de créer un catalogue mondial, mais d'offrir un **outil de confiance** qui s'améliore avec son utilisateur.

### Évolutions possibles (au-delà du MVP)
- Amélioration de la précision de l'OCR ;
- Recherche avancée et statistiques ;
- Optimisations de performance pour grandes collections ;
- Affinage UX/UI.

### Évolutions explicitement exclues
- Reconnaissance de couverture par comparaison d'images ;
- Synchronisation cloud ;
- Multi-comptes.

### Le fil conducteur
À chaque étape, une seule question :

> *« Est-ce que je possède déjà exactement ce magazine ? »*

---

<div align="center">

**🦆 Complétez votre coffre-fort, un magazine à la fois.**

</div>
