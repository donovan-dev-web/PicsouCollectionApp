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
9. [Épique 7 — Paramètres](#9-épique-7--paramètres)
10. [Représentation graphique](#10-représentation-graphique)

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
- Je peux saisir publication (obligatoire), numéro, édition, langue, état, date, code-barres ;
- Un identifiant UUID est généré ;
- Un magazine sans numéro est autorisé (hors-série) ;
- La date de création est enregistrée.

**Priorité** : haute.

### US-DB-03 — Chercher par code-barres
> En tant que **Marc**, je veux **retrouver une édition à partir de son code-barres** afin de **savoir si je la possède**.

**Critères d'acceptation** :
- Le scan d'un code-barres connu retrouve l'édition ;
- Un code-barres inconnu renvoie aucun résultat ;
- Si plusieurs éditions partagent le même code-barres, la recherche renvoie **toutes** les éditions (avec leur nombre d'exemplaires) ;
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
- J'ajoute un exemplaire avec notes et date ;
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

### US-ACC-05 — Ouvrir une fiche depuis les ajouts récents
> En tant que **Marc**, je veux **appuyer sur un ajout récent** afin de **ouvrir directement la fiche du magazine concerné**.

**Critères d'acceptation** :
- Chaque élément de la section « Ajouts récents » est tapable ;
- Un appui mène à la fiche détaillée du magazine.

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
- La fiche affiche publication, numéro, édition, langue, état, date, code-barres ;
- Elle liste les exemplaires avec notes et date ;
- Elle affiche le statut Possédé/Absent.

**Priorité** : haute.

### US-COL-04 — Modifier une édition
> En tant que **Marc**, je veux **modifier les informations d'une édition** afin de **corriger une erreur de saisie**.

**Critères d'acceptation** :
- Je peux modifier publication, numéro, édition, langue, état, date, code-barres ;
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

**Statut (M-06)** : à l'ajout d'une édition **déjà possédée**, l'écran résultat et le **scan en continu** affichent « **Exemplaires actuels : N** » avec les choix **Ajouter quand même / Annuler**. Ajout possible d'un second exemplaire (chaque exemplaire garde sa propre fiche via `addExistingCopy`).

**Priorité** : haute.

### US-COL-07 — Saisie assistée avec suggestions
> En tant que **Marc**, je veux **des suggestions pendant la saisie manuelle** afin de **gagner du temps et éviter les doublons ou les différences de casse** (édition, nom, langue…).

**Critères d'acceptation** :
- Des suggestions apparaissent dès le début de la frappe sur certains champs (publication, édition, langue) ;
- Je peux choisir une suggestion pour remplir le champ ;
- Une même valeur écrite différemment (casse) n'est pas dupliquée.

**Priorité** : haute.

### US-COL-08 — Formulaire complet en deux sections
> En tant que **Marc**, je veux **un formulaire de saisie complet, découpé en deux sections** afin de **saisir l'essentiel rapidement et avoir accès aux détails seulement si besoin**.

**Critères d'acceptation** :
- Tous les champs du modèle sont présents (publication, numéro, édition, langue, date, code-barres, état, notes…) ;
- La section principale contient les informations obligatoires/essentielles ;
- Un bouton « Plus de détails » déplie la section des champs optionnels ;
- Le champ date se saisit via des listes déroulantes Année / Mois ;
- Le code-barres peut être saisi manuellement **ou scanné** depuis le formulaire (bouton scan).

**Priorité** : haute.

### US-COL-09 — Paginer la collection
> En tant que **Marc**, je veux **afficher la collection par pages** afin de **ne pas charger les milliers de magazines d'un coup**.

**Critères d'acceptation** :
- La liste charge par pages de 20 magazines ;
- Une pagination numérotée est affichée sous la liste pour naviguer ;
- Changer de page recharge la liste sans casser le tri.

**Priorité** : haute.

### US-COL-10 — Filtrer la collection par numéro et édition
> En tant que **Marc**, je veux **filtrer la collection par numéro et par édition** afin de **retrouver précisément une édition**.

**Critères d'acceptation** :
- Le champ de recherche textuel est remplacé par un champ **numéro** ;
- À côté, une liste déroulante des **éditions** (option « Toutes les éditions » par défaut) ;
- Les résultats sont affichés avec le badge de statut.

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
- Le code inconnu propose les méthodes de secours ;
- Un code connu correspondant à **plusieurs éditions** affiche le **nombre d'éditions** et une **liste cliquable** menant à chaque fiche.

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

**Statut (M-06)** : mode **scan en continu** sur `/scan/barcode` (bouton « Scan en continu » ou `?continuous=1`). Après un scan **connu**, l'écran caméra reste affiché : édition **déjà possédée** → confirmation doublon ; édition **absente** → ajout direct ; puis **pop-up « Ajouté à la collection »** → « Scanner le suivant ». Un **code inconnu** propose la **saisie manuelle**. Bouton « **Arrêter le scan en continu** ».

**Priorité** : haute.

### US-ID-03 — Identifier par caméra/OCR
> En tant que **Marc**, je veux **pointer la caméra sur la couverture** afin de **dégager le titre et le numéro par OCR**.

**Critères d'acceptation** :
- L'OCR extrait publication, numéro, date ;
- Un niveau de confiance est affiché ;
- En cas de confiance insuffisante, une saisie manuelle est proposée ;
- Aucune image n'est enregistrée.

**Statut (M-05)** : le pipeline logique est livré et testé (`ocrTextParser`, `identificationService.identifyByOCR`, écran `/scan/camera`). La reconnaissance brute repose sur `MlKitOcrEngine` (**expo-mlkit-ocr**, on-device), branché par défaut dans `dependencies.initialize()`. **Validé sur téléphone physique** (v0.5.0). Avec repli code-barres en confiance insuffisante et pré-remplissage de la saisie manuelle.

**Priorité** : haute.

### US-ID-04 — Voir le résultat possédé/absent
> En tant que **Marc**, je veux **savoir immédiatement si le magazine est possédé** afin de **décider en brocante sans hésiter**.

**Critères d'acceptation** :
- 🔴 Possédé : affichage du nombre d'exemplaires ;
- 🟢 Absent : bouton d'ajout direct.

**Statut (M-06)** : l'écran `/scan/result` charge l'édition et affiche **🔴 Possédé (N)** (nombre d'exemplaires) avec « **Ajouter un exemplaire** », ou **🟢 Absent** avec « **Ajouter à la collection** » (ajout direct). Pour un code inconnu, la saisie manuelle est proposée.

**Priorité** : haute.

### US-ID-05 — Passer à la méthode suivante après échec
> En tant que **Marc**, je veux **que l'application me propose la méthode suivante après un échec** afin de **ne jamais rester bloqué**.

**Critères d'acceptation** :
- Après échec code-barres → proposition caméra puis manuelle ;
- La méthode échouée n'est pas reproposée dans le même parcours.

**Priorité** : haute.

### US-ID-07 — Lecture robuste et multi-format du code-barres
> En tant que **Marc**, je veux **un scan fiable même pour les magazines au format de code-barres moins standard** afin de **ne pas rater une édition**.

**Critères d'acceptation** :
- Les codes-barres **alphanumériques / symboles** sont lus sans conversion numérique (un code commençant par `0` n'est pas tronqué) ;
- Le format de lecture n'est pas limité à EAN-13 : les formats non standard sont acceptés ;
- Plusieurs lectures d'un même scan sont réalisées et le code **le plus récurrent** est retenu pour éviter les faux positifs (lecture trop rapide, orientation) ;
- La recherche n'est lancée qu'après stabilisation de la lecture.

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

## 9. Épique 7 — Paramètres

### US-SET-01 — Basculer le thème manuellement
> En tant que **Marc**, je veux **choisir le thème clair ou sombre manuellement** afin de **forcer un affichage même si le thème système diffère**.

**Critères d'acceptation** :
- Un réglage est disponible dans les Paramètres pour choisir le thème (système / clair / sombre) ;
- Le choix manuel prime sur le thème système ;
- Le choix est mémorisé entre les lancements.

**Priorité** : moyenne.

---

## 10. Représentation graphique

```
┌─────────────────── ÉPIQUES ───────────────────┐
│                                               │
│  DB ── Accueil ── Collection ── Identification│
│  Export/Import ── Paramètres ── Qualité       │
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
| Accueil | US-ACC-01 à 05 | 5 |
| Ajout & collection | US-COL-01 à 10 | 10 |
| Identification | US-ID-01 à 07 | 7 |
| Export / Import | US-BK-01 à 03 | 3 |
| Paramètres | US-SET-01 | 1 |
| Qualité & publication | US-QA-01 à 03 | 3 |
| **Total** | | **34** |
