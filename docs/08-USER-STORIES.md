# 🦆 Picsou Collection — User Stories

> **Document de référence — v1.0**
>
> Ce document recense les user stories du MVP, organisées par épique, chacune avec ses critères d'acceptation. C'est la base de la planification agile (voir `09-ISSUE.md` pour le découpage en tâches GitHub).

---

## Table des matières

1. [Méthode](#1-méthode)
2. [Format d'une user story](#2-format-dune-user-story)
3. [Épique 1 — Base de données](#3-épique-1--base-de-données)
4. [Épique 2 — Accueil](#4-épique-2--accueil)
5. [Épique 3 — Ajout & collection](#5-épique-3--ajout--collection)
6. [Épique 4 — Identification](#6-épique-4--identification)
7. [Épique 5 — Export / Import](#7-épique-5--export--import)
8. [Épique 6 — Qualité & publication](#8-épique-6--qualité--publication)
9. [Représentation graphique](#9-représentation-graphique)

---

## 1. Méthode

Chaque user story suit le format standard :

> **En tant que** `<rôle>`, **je veux** `<objectif>`, **afin de** `<bénéfice>`.

Les critères d'acceptation définissent les conditions de validation (format *Given / When / Then* simplifié).

**Persona** : *Marc*, collectionneur de magazines Disney, utilisateur principal.

---

## 2. Format d'une user story

Chaque story est identifiée par un code (ex. `US-DB-01`) et possède :
- un **titre** ;
- une **énoncé** (En tant que / Je veux / Afin de) ;
- des **critères d'acceptation** ;
- une **priorité** (haute / moyenne / basse) ;
- un lien vers l'épique.

---

## 3. Épique 1 — Base de données

### US-DB-01 — Initialiser la base
> En tant que **développeur**, je veux **initialiser la base SQLite au démarrage** afin de **pouvoir persister la collection**.

**Critères d'acceptation** :
- La base est créée automatiquement au premier lancement ;
- Les tables `magazines` et `collection_items` sont créées ;
- La version de schéma est enregistrée (`PRAGMA user_version = 1`).

**Priorité** : haute.

### US-DB-02 — Créer une édition
> En tant que **Marc**, je veux **enregistrer une nouvelle édition** afin de **l'ajouter à ma collection**.

**Critères d'acceptation** :
- Je peux saisir publication (obligatoire), numéro, édition, pays, date, code-barres ;
- Un identifiant UUID est généré ;
- Un magazine sans numéro est autorisé (hors-série) ;
- La date de création est enregistrée.

**Priorité** : haute.

### US-DB-03 — Chercher par code-barres
> En tant que **Marc**, je veux **retrouver une édition à partir de son code-barres** afin de **savoir si je la possède**.

**Critères d'acceptation** :
- Le scan d'un code-barres connu retrouve l'édition ;
- Un code-barres inconnu renvoie aucun résultat ;
- La recherche n'utilise pas les champs `notes`/`ocr_text`.

**Priorité** : haute.

### US-DB-04 — Lister la collection
> En tant que **Marc**, je veux **voir la liste de ma collection avec le nombre d'exemplaires** afin de **consulter mon inventaire**.

**Critères d'acceptation** :
- La liste est triée par publication puis numéro ;
- Chaque ligne affiche le nombre d'exemplaires ;
- La requête reste légère.

**Priorité** : haute.

### US-DB-05 — Gérer les exemplaires
> En tant que **Marc**, je veux **ajouter/modifier/supprimer un exemplaire** afin de **gérer les multiples copies d'une même édition**.

**Critères d'acceptation** :
- J'ajoute un exemplaire avec état, notes et date ;
- Je supprime un exemplaire ;
- Supprimer une édition supprime ses exemplaires (cascade).

**Priorité** : haute.

---

## 4. Épique 2 — Accueil

### US-ACC-01 — Voir le compteur
> En tant que **Marc**, je veux **voir le nombre de magazines possédés** afin de **connaître d'un coup d'œil l'état de ma collection**.

**Critères d'acceptation** :
- Le compteur affiche le nombre d'exemplaires ;
- Il se met à jour après chaque ajout.

**Priorité** : haute.

### US-ACC-02 — Accéder au scanner
> En tant que **Marc**, je veux **un bouton Scanner visible** afin de **lancer l'identification rapidement en brocante**.

**Critères d'acceptation** :
- Le bouton Scanner est proéminent et accessible en une main ;
- Il mène à l'écran de choix de méthode.

**Priorité** : haute.

### US-ACC-03 — Accéder à l'ajout
> En tant que **Marc**, je veux **un bouton Ajouter** afin de **saisir un magazine manuellement depuis l'accueil**.

**Critères d'acceptation** :
- Le bouton Ajouter mène à la saisie manuelle.

**Priorité** : haute.

### US-ACC-04 — Voir les ajouts récents
> En tant que **Marc**, je veux **voir mes derniers ajouts** afin de **suivre l'évolution de ma collection**.

**Critères d'acceptation** :
- Les derniers exemplaires ajoutés sont affichés ;
- La liste est à jour au focus de l'écran.

**Priorité** : moyenne.

---

## 5. Épique 3 — Ajout & collection

### US-COL-01 — Ajouter manuellement
> En tant que **Marc**, je veux **saisir un magazine manuellement** afin de **l'ajouter quand il n'a pas de code-barres lisible**.

**Critères d'acceptation** :
- Formulaire court (publication obligatoire, autres champs facultatifs) ;
- Le code-barres peut être saisi (optionnel) ;
- Après validation, un exemplaire est ajouté.

**Priorité** : haute.

### US-COL-02 — Rechercher dans la collection
> En tant que **Marc**, je veux **rechercher un magazine par titre ou numéro** afin de **retrouver rapidement une édition**.

**Critères d'acceptation** :
- La recherche filtre par publication ou numéro ;
- Les résultats sont affichés avec le badge de statut.

**Priorité** : haute.

### US-COL-03 — Consulter une fiche
> En tant que **Marc**, je veux **ouvrir la fiche détaillée d'un magazine** afin de **voir ses exemplaires et informations**.

**Critères d'acceptation** :
- La fiche affiche publication, numéro, édition, pays, date, code-barres ;
- Elle liste les exemplaires avec état, notes et date ;
- Elle affiche le statut Possédé/Absent.

**Priorité** : haute.

### US-COL-04 — Modifier une édition
> En tant que **Marc**, je veux **modifier les informations d'une édition** afin de **corriger une erreur de saisie**.

**Critères d'acceptation** :
- Je peux modifier publication, numéro, édition, pays, date, code-barres ;
- La date de modification est mise à jour.

**Priorité** : moyenne.

### US-COL-05 — Supprimer une édition
> En tant que **Marc**, je veux **supprimer une édition** afin de **retirer une entrée erronée**.

**Critères d'acceptation** :
- La suppression exige une confirmation ;
- Les exemplaires associés sont supprimés en cascade.

**Priorité** : moyenne.

### US-COL-06 — Gérer un doublon
> En tant que **Marc**, je veux **être averti lorsque j'ajoute une édition déjà possédée** afin de **décider librement d'ajouter un second exemplaire**.

**Critères d'acceptation** :
- Une alerte indique le nombre d'exemplaires actuels ;
- Je peux ajouter quand même ou annuler.

**Priorité** : haute.

---

## 6. Épique 4 — Identification

### US-ID-01 — Choisir la méthode
> En tant que **Marc**, je veux **choisir entre code-barres, caméra et saisie manuelle** afin de **m'adapter au magazine rencontré**.

**Critères d'acceptation** :
- Les trois méthodes sont accessibles depuis l'écran de choix.

**Priorité** : haute.

### US-ID-02 — Scanner un code-barres
> En tant que **Marc**, je veux **scanner le code-barres d'un magazine** afin de **l'identifier instantanément**.

**Critères d'acceptation** :
- La permission caméra est demandée ;
- Un EAN-13/ISBN est détecté ;
- Le code connu affiche l'édition ;
- Le code inconnu propose les méthodes de secours.

**Rappel** : le scan ne fait que **retrouver** une édition déjà en base ; il ne crée **jamais** une édition à lui seul (un code inconnu nécessite une saisie manuelle).

**Priorité** : haute.

### US-ID-06 — Scanner plusieurs magazines à la suite
> En tant que **Marc**, je veux **scanner plusieurs magazines de suite, sans fermer et rouvrir l'écran** afin de **faire le tour d'une brocante rapidement**.

**Critères d'acceptation** :
- Après un scan réussi et l'ajout d'un exemplaire, l'écran caméra reste affiché ;
- Un **pop-up de confirmation** indique le magazine ajouté à chaque scan ;
- Je peux immédiatement scanner le magazine suivant ;
- Un bouton permet d'arrêter le scan en continu ;
- Si un code-barres est inconnu, l'application me dirige vers la saisie manuelle.

**Priorité** : haute.

### US-ID-03 — Identifier par caméra/OCR
> En tant que **Marc**, je veux **pointer la caméra sur la couverture** afin de **dégager le titre et le numéro par OCR**.

**Critères d'acceptation** :
- L'OCR extrait publication, numéro, date ;
- Un niveau de confiance est affiché ;
- En cas de confiance insuffisante, une saisie manuelle est proposée ;
- Aucune image n'est enregistrée.

**Priorité** : haute.

### US-ID-04 — Voir le résultat possédé/absent
> En tant que **Marc**, je veux **savoir immédiatement si le magazine est possédé** afin de **décider en brocante sans hésiter**.

**Critères d'acceptation** :
- 🔴 Possédé : affichage du nombre d'exemplaires ;
- 🟢 Absent : bouton d'ajout direct.

**Priorité** : haute.

### US-ID-05 — Passer à la méthode suivante après échec
> En tant que **Marc**, je veux **que l'application me propose la méthode suivante après un échec** afin de **ne jamais rester bloqué**.

**Critères d'acceptation** :
- Après échec code-barres → proposition caméra puis manuelle ;
- La méthode échouée n'est pas reproposée dans le même parcours.

**Priorité** : haute.

---

## 7. Épique 5 — Export / Import

### US-BK-01 — Exporter la collection
> En tant que **Marc**, je veux **exporter ma collection en JSON** afin de **la sauvegarder et la transférer**.

**Critères d'acceptation** :
- Le fichier est au format `picsou-collection` v1 ;
- Le partage/enregistrement est proposé ;
- Toutes les éditions et exemplaires sont inclus.

**Priorité** : haute.

### US-BK-02 — Importer une collection
> En tant que **Marc**, je veux **importer un fichier JSON** afin de **restaurer ma collection sur un nouveau téléphone**.

**Critères d'acceptation** :
- Le fichier est validé (format, version, intégrité) ;
- Une confirmation requise avant remplacement ;
- La collection existante est remplacée par celle du fichier.

**Priorité** : haute.

### US-BK-03 — Gérer un fichier d'import invalide
> En tant que **Marc**, je veux **un message clair si le fichier d'import est invalide** afin de **ne pas corrompre ma collection**.

**Critères d'acceptation** :
- Un fichier au mauvais format/version est rejeté sans modifier les données ;
- Un message d'erreur explicite est affiché.

**Priorité** : moyenne.

---

## 8. Épique 6 — Qualité & publication

### US-QA-01 — Respect du design system
> En tant que **developpeur**, je veux **respecter le design system** (clair/sombre) afin de **garantir une cohérence visuelle**.

**Critères d'acceptation** :
- Les couleurs et typographies du design system sont appliquées ;
- Le mode clair et le mode sombre fonctionnent.

**Priorité** : moyenne.

### US-QA-02 — Couverture de tests
> En tant que **developpeur**, je veux **des tests unitaires et composants** afin de **garantir la fiabilité du code**.

**Critères d'acceptation** :
- Les services/repositories sont testés ;
- Les écrans critiques sont testés ;
- Un rapport de coverage est généré.

**Priorité** : haute.

### US-QA-03 — Build de production
> En tant que **developpeur**, je veux **générer un build de production** afin de **préparer la publication Play Store**.

**Critères d'acceptation** :
- EAS Build produit un AAB ;
- Le build local produit un APK ;
- L'application fonctionne en production.

**Priorité** : moyenne.

---

## 9. Représentation graphique

```
┌─────────────────── ÉPIQUES ───────────────────┐
│                                               │
│  DB ── Accueil ── Collection ── Identification│
│  Export/Import ── Qualité & Publication       │
│                                               │
└───────────────────────────────────────────────┘
                        │
                        ▼
              Découpage en tâches GitHub
              (voir 09-ISSUE.md)
                        │
                        ▼
         Milestones / Labels / Kanban (Projects)
```

---

## Récapitulatif des user stories

| Épique | Stories | Nb |
|---|---|---|
| Base de données | US-DB-01 à 05 | 5 |
| Accueil | US-ACC-01 à 04 | 4 |
| Ajout & collection | US-COL-01 à 06 | 6 |
| Identification | US-ID-01 à 06 | 6 |
| Export / Import | US-BK-01 à 03 | 3 |
| Qualité & publication | US-QA-01 à 03 | 3 |
| **Total** | | **27** |
