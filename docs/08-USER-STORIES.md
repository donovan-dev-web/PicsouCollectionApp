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
10. [Épique 8 — UI/UX M-10](#10-épique-8--uiux-m-10)
11. [Épique 9 — OCR interactif & fiabilisation](#11-épique-9--ocr-interactif--fiabilisation)
12. [Représentation graphique](#12-représentation-graphique)
13. [Récapitulatif des user stories](#13-récapitulatif-des-user-stories)

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

### US-ID-08 — Afficher les champs reconnus en surcouche caméra (scan ciblé)
> En tant que **Marc**, je veux **voir par-dessus la caméra les champs (nom, numéro, édition) reconnus par l'OCR** afin de **pointer précisément chaque information et d'éviter les erreurs de lecture ou une confiance insuffisante (lumière, qualité du magazine)**.

**Critères d'acceptation** :
- La surcouche caméra affiche des zones/étiquettes **« Nom »**, **« Numéro »**, **« Édition »** ;
- Chaque champ est **complété en direct** par l'OCR dès sa détection ;
- La recherche n'est lancée que lorsque **nom + numéro** minimum sont détectés ;
- L'utilisateur peut pointer successivement **nom → numéro → édition** pour affiner chaque champ ;
- Si la lecture **globale** de la couverture ne donne pas une confiance suffisante, l'application propose de **scanner en pointant plus précisément** les informations.

**Priorité** : haute.

### US-ID-09 — Vérifier, corriger et valider les informations détectées (outrepasser la confiance)
> En tant que **Marc**, je veux **voir les informations détectées et pouvoir les corriger ou les confirmer manuellement** afin de **continuer même quand la confiance de l'OCR est insuffisante**.

**Critères d'acceptation** :
- En cas de confiance insuffisante, les informations détectées (**publication, numéro, date**) sont **affichées** pour vérification manuelle ;
- L'utilisateur peut **corriger** un champ avant de rechercher ;
- Il peut **confirmer** les informations et **outrepasser le niveau de confiance** s'il les juge correctes, lançant alors la recherche ;
- Le message « confiance insuffisante » est accompagné de cette possibilité de **valider / corriger**, pas uniquement de réessayer.

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
**Statut (M-07)** : livré et testé — `BackupService.exportCollection()` sérialise toutes les éditions + exemplaires au format `picsou-collection` v1 ; le partage est proposé via `expo-sharing` (section Sauvegarde des Paramètres).

### US-BK-02 — Importer une collection
> En tant que **Marc**, je veux **importer un fichier JSON** afin de **restaurer ma collection sur un nouveau téléphone**.

**Critères d'acceptation** :
- Le fichier est validé (format, version, intégrité) ;
- Une confirmation requise avant remplacement ;
- La collection existante est remplacée par celle du fichier.

**Priorité** : haute.
**Statut (M-07)** : livré et testé — le fichier est **validé** (format, version, intégrité) avant toute action, une **double confirmation** est demandée puis la collection existante est **remplacée** par celle du fichier (`importCollection`, en transaction).

### US-BK-03 — Gérer un fichier d'import invalide
> En tant que **Marc**, je veux **un message clair si le fichier d'import est invalide** afin de **ne pas corrompre ma collection**.

**Critères d'acceptation** :
- Un fichier au mauvais format/version est rejeté sans modifier les données ;
- Un message d'erreur explicite est affiché.

**Priorité** : moyenne.
**Statut (M-07)** : livré et testé — tout fichier au mauvais format/version ou mal formé est **rejeté sans toucher aux données** (`InvalidBackupError`) avec un **message explicite** affiché dans l'écran Paramètres.

### US-BK-04 — Exporter en choisissant le format (JSON / CSV)
> En tant que **Marc**, je veux **choisir le format d'export (JSON ou CSV)** afin de **sauvegarder selon mon besoin (sauvegarde complète ou tableur)**.

**Critères d'acceptation** :
- Le bouton **« Exporter »** affiche une **sélection de format (JSON / CSV)** ;
- L'export est généré au format choisi (JSON : `picsou-collection` v1 ; CSV : colonnes standard du modèle) ;
- Le fichier résultant est cohérent avec le format (extension, séparateur).

**Priorité** : moyenne.

### US-BK-05 — Importer en choisissant le format (JSON / CSV)
> En tant que **Marc**, je veux **choisir le format d'import (JSON ou CSV)** afin de **restaurer la collection depuis un fichier dont je connais le format**.

**Critères d'acceptation** :
- Le bouton **« Importer »** affiche une **sélection de format (JSON / CSV)** ;
- Le fichier sélectionné est validé selon le format choisi (JSON : `picsou-collection` ; CSV : **en-têtes attendus**) ;
- En cas d'incohérence format/fichier, un **message d'erreur explicite** est affiché **sans modifier les données** ;
- Le remplacement reste soumis à la **double confirmation**.

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
> En tant que **developpeur**, je veux **générer un build de production (APK de release)** afin de **publier la version finale (v1.0.0)**.

**Critères d'acceptation** :
- Le build local produit un APK installable ;
- Le profil EAS `preview` produit l'APK de la release finale ;
- L'application fonctionne en production ;
- L'APK est publié comme **GitHub Release** téléchargeable.

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

## 10. Épique 8 — UI/UX M-10 « Vault Lisible »

### US-UX-01 — Texte contrasté WCAG AA
> En tant que **Marc en plein soleil**, je veux **un texte contrasté (≥ 4.5:1)** afin de **lire compteur et N° sans plisser les yeux**.

**Critères d'acceptation** :
- *Given* thème clair, *When* j'affiche Accueil/carte/fiche, *Then* aucun texte jaune `#FDD835` sur fond clair ;
- `accent` réservé aux fonds de boutons (avec `accentText`) et fonds sombres.

**Priorité** : haute. → M10-01.

### US-UX-02 — SafeZone (encoche + gesture bar)
> En tant que **Marc avec un téléphone à encoche**, je veux **aucun bouton masqué** afin de **pouvoir agir à 1 main**.

**Critères d'acceptation** :
- *Given* encoche + gesture bar, *When* j'ouvre chaque écran, *Then* titres/boutons/pagination visibles (insets) ;
- Caméra : aucun `top:48` en dur, réticule responsive.

**Priorité** : haute. → M10-02.

### US-UX-03 — Menu à icônes
> En tant que **Marc**, je veux **reconnaître Accueil/Collection/Paramètres par icône** afin de **naviguer sans lire**.

**Critères d'acceptation** :
- *Given* la TabBar, *When* je regarde, *Then* icônes Feather 24px + labels, actif visible clair/sombre ;
- Deep-link `/scan` → Annuler ne donne jamais écran vide.

**Priorité** : haute. → M10-03.

### US-UX-04 — Parcours brocante < 3s
> En tant que **Marc en brocante**, je veux **scanner en < 3s avec feedback** afin de **ne pas rater une vente**.

**Critères d'acceptation** :
- *Given* caméra ouverte, *When* je scanne, *Then* spinner → résultat + toast, permission refusée → `Ouvrir réglages` en 1 tap ;
- Possédé = vert positif, Absent = neutre (sémantique inversée validée).

**Priorité** : haute. → M10-04..08.

### US-UX-05 — Accessibilité lecteur d'écran
> En tant que **Marc malvoyant (VoiceOver/TalkBack, texte 200 %)**, je veux **labels + cibles 44px** afin d'**utiliser l'app sans aide**.

**Critères d'acceptation** :
- *Given* lecteur d'écran, *When* je navigue, *Then* 0 emoji UI, rôles + hints, cibles ≥ 44px.

**Priorité** : haute. → M10-10.

### US-UX-06 — Jamais bloqué (vide/erreur)
> En tant que **Marc**, je veux **un CTA clair face à vide/erreur** afin de **ne jamais être bloqué**.

**Critères d'acceptation** :
- *Given* base vide / erreur / chargement, *When* j'affiche l'écran, *Then* Empty/Error/Loading + CTA, chaque ajout → toast succès.

**Priorité** : moyenne. → M10-11.

### US-UX-07 — Importer un CSV depuis le stockage
> En tant que **Marc**, je veux **sélectionner mon fichier `.csv` dans le sélecteur système** afin de **peupler/restaurer ma collection**.

**Critères d'acceptation** :
- *Given* un CSV v1 sur le téléphone, *When* j'importe en CSV, *Then* le fichier est sélectionnable et importé (remplacement + récap) ;
- *Given* un fichier non conforme, *Then* rejet explicite sans toucher aux données.

**Priorité** : haute. → M-10R / M10R-01 (retour test physique n°1).

### US-UX-08 — CTA sans scroll
> En tant que **Marc en brocante**, je veux **Scanner/Ajouter visibles sans scroller** afin de **répondre en < 3 s à 1 main**.

**Critères d'acceptation** :
- *Given* l'ouverture de l'Accueil (petit écran), *When* je regarde, *Then* Scanner est visible sans scroll.

**Priorité** : haute. → M-10R / M10R-02 (retour n°2).

### US-UX-09 — Navigation drawer + tabs
> En tant que **Marc**, je veux **un menu latéral permanent et des onglets Accueil/Scan/Collection** afin de **rejoindre chaque fonction en 1-2 taps**.

**Critères d'acceptation** :
- *Given* n'importe quel écran principal, *When* j'ouvre le drawer, *Then* liens directs + sous-catégories Scan (OCR / code-barres / manuel) + éditions dynamiques repliables ;
- *Given* une édition, *When* je la choisis, *Then* la collection s'ouvre pré-filtrée.

**Priorité** : haute. → M-10R / M10R-03..05 (retour n°3).

### US-UX-10 — Formulaire utilisable au clavier
> En tant que **Marc**, je veux **choisir Mois/Année et relire Notes pendant la frappe** afin de **saisir sans lutte contre le clavier**.

**Critères d'acceptation** :
- *Given* le formulaire, *When* j'ouvre Année (40 options), *Then* la liste scrolle au pouce ;
- *When* je tape dans Notes, *Then* le champ reste visible au-dessus du clavier.

**Priorité** : haute. → M-10R / M10R-06/07 (retour n°4).

### US-UX-11 — OCR en conditions réelles
> En tant que **Marc (brocante sombre, couverture comics)**, je veux **une torche et un guidage vers les replis** afin d'**identifier malgré le texte stylisé**.

**Critères d'acceptation** :
- *Given* faible lumière, *When* je scanne, *Then* je peux allumer la torche ;
- *Given* un lettrage illisible, *Then* un conseil + code-barres/manuel sont visibles en < 5 s.

**Priorité** : haute. → M-10R / M10R-08/09 (retour n°5).

### US-UX-12 — Accès scan permanent et sûr
> En tant que **Marc**, je veux **un bouton scan flottant sur chaque page et des boutons hors gesture bar** afin de **scanner sans naviguer ni rater ma cible**.

**Critères d'acceptation** :
- *Given* Accueil/Collection/Fiche/Paramètres, *When* je veux scanner, *Then* 1 tap sur le FAB ;
- *Given* la page OCR, *Then* « Scanner le code-barres » est au-dessus de la gesture bar.

**Priorité** : haute. → M-10R / M10R-10/11 (retours n°6/7).

### US-UX-13 — Drawer SafeZone
> En tant que **Marc avec un téléphone à encoche**, je veux **un menu latéral qui respecte la barre de statut** afin de **lire le titre et le premier lien sans que rien soit masqué**.

**Critères d'acceptation** :
- *Given* téléphone à encoche + gesture bar, *When* j'ouvre le drawer, *Then* titre/items visibles (insets top) et dernier item au-dessus de la gesture bar.

**Priorité** : haute. → M-10R2 / M10R2-01 (retour n°1).

### US-UX-14 — Permission caméra expliquée et SafeZone
> En tant que **Marc**, je veux **qu'on me demande la caméra au démarrage avec un écran propre** afin de **ne pas être bloqué au moment de scanner**.

**Critères d'acceptation** :
- *Given* le premier lancement, *When* je complète l'onboarding, *Then* la permission caméra est demandée avant l'accueil ;
- *Given* un écran caméra (OCR/code-barres/formulaire), *When* la permission manque, *Then* écran dédié SafeZone avec « Autoriser la caméra » / « Ouvrir les réglages ».

**Priorité** : haute. → M-10R2 / M10R2-02 (retour n°2).

### US-UX-15 — Popup « Couverture reconnue » lisible
> En tant que **Marc**, je veux **des boutons bien espacés quand la couverture est reconnue** afin de **confirmer ou réessayer sans erreur de tap**.

**Critères d'acceptation** :
- *Given* OCR couverture reconnue, *When* le popup s'affiche, *Then* actions espacées (≥ 16px), scrollable si besoin, SafeZone respectée ;
- *Given* petit écran, *When* le contenu est long, *Then* le card reste utilisable.

**Priorité** : haute. → M-10R2 / M10R2-03 (retour n°3).

### US-UX-16 — Formulaire : valider sans scroller
> En tant que **Marc**, je veux **enregistrer un magazine depuis le haut de l'écran** afin de **terminer la saisie sans scroller jusqu'en bas**.

**Critères d'acceptation** :
- *Given* le formulaire d'ajout/édition, *When* je suis en haut de l'écran, *Then* une icône `Valider` est dans le header ;
- *Given* publication vide, *When* je regarde le bouton, *Then* il est désactivé avec la raison affichée.

**Priorité** : haute. → M-10R2 / M10R2-04 (retour n°4).

### US-UX-17 — Premier lancement guidé
> En tant que **nouvel utilisateur**, je veux **une présentation courte de l'app au premier lancement** afin de **comprendre les fonctionnalités et commencer sereinement**.

**Critères d'acceptation** :
- *Given* 1er lancement, *When* j'ouvre l'app, *Then* écran(s) de présentation (fonctionnalités / utilisation) avec bouton « Commencer » ;
- *Then* demande de permission caméra (M10R2-02) si applicable → accueil ;
- *Given* lancement suivant, *When* j'ouvre l'app, *Then* accueil direct (flag persisté).

**Priorité** : haute. → M-10R2 / M10R2-05 (retour n°5).

### US-UX-18 — Paramètres organisés + retour utilisateur
> En tant que **Marc**, je veux **des paramètres clairs par catégorie et un moyen de signaler un problème ou une idée** afin de **configurer l'app et faire remonter des retours**.

**Critères d'acceptation** :
- *Given* l'écran Paramètres, *When* je le consulte, *Then* sous-menus (Apparence, Sauvegarde, Accessibilité, Aide & retours) ;
- *Given* « Signaler un bug / idée / suggestion », *When* je tape, *Then* les Discussions GitHub s'ouvrent dans le navigateur.

**Priorité** : moyenne. → M-10R2 / M10R2-06 (retour n°6).

### US-UX-19 — Fiche magazine : header navigation + scan
> En tant que **Marc**, je veux **naviguer depuis une fiche sans revenir à la liste** afin de **consulter une fiche puis scanner sans étapes superflues**.

**Critères d'acceptation** :
- *Given* une fiche magazine, *When* je regarde le haut, *Then* header burger/titre/scan + retour explicite du modal.

**Priorité** : haute. → M-10R2 / M10R2-07 (retour n°7).

### US-UX-20 — Trier la collection
> En tant que **Marc**, je veux **trier ma collection (numéros croissant/décroissant, etc.)** afin de **retrouver vite une série chez moi ou en brocante**.

**Critères d'acceptation** :
- *Given* la page Collection, *When* je choisis un tri, *Then* la liste change d'ordre (numéro ↑/↓…) en combinant les filtres ;
- *Given* filtres actifs, *When* je change le tri, *Then* la pagination repart de la page 1.

**Priorité** : moyenne. → M-10R2 / M10R2-08 (retour n°8).

### US-UX-21 — OCR : numéro d'exemplaire fiable
> En tant que **Marc**, je veux **que l'OCR ne retienne que le vrai numéro d'exemplaire (précédé de « N° »)** afin de **ne pas lancer une recherche sur une année ou un nombre de pages**, et **que les textes stylisés soient mieux reconnus**.

**Critères d'acceptation** :
- *Given* une couverture avec année, nb de pages et « N° 547 », *When* l'OCR
  traite le texte, *Then* `issueNumber = 547` (ni 2024, ni 52) ;
- *Given* un titre stylisé, *When* je le scanne, *Then* la publication est lue
  sans atteindre le repli code-barres ;
- *Then* la recherche reste déclenchée sur **nom + numéro** (US-ID-08).

**Priorité** : haute. → M-10R2 / M10R2-09 (retour n°9).

### US-UX-22 — Recherche manuelle dans le flux identification
> En tant que **Marc**, je veux **que « Saisir manuellement » (écran de choix / drawer) mène à une recherche** afin de **savoir si je possède déjà un magazine avant d'en ajouter un**.

**Critères d'acceptation** :
- *Given* l'écran de choix de scan ou le drawer, *When* je choisis « Saisir manuellement », *Then* un **écran de recherche** s'ouvre (publication + numéro) ;
- *Given* le magazine existe, *When* je recherche, *Then* résultat Possédé/Absent (Voir la fiche / Ajouter exemplaire) ;
- *Given* le magazine n'existe pas, *When* je recherche, *Then* proposition « Saisir manuellement » menant au **formulaire pré-rempli** ;
- *Given* l'accueil, *When* je tape « Ajouter », *Then* le formulaire d'ajout reste ouvert (inchangé).

**Priorité** : haute. → M-10R2 / M10R2-10 (retour n°10).

### US-UX-23 — Recherche repliable dans la collection
> En tant que **Marc**, je veux **voir ma collection sans être encombré par les filtres de recherche** afin de **consulter mes magazines d'un coup d'œil, puis affiner seulement quand c'est nécessaire**.

**Critères d'acceptation** :
- *Given* la page Collection, *When* elle s'ouvre, *Then* les filtres sont **repliés** (seul le bouton jaune « Rechercher » est visible) ;
- *Given* le bouton « Rechercher », *When* je tape, *Then* un panneau se déplie avec **Numéro + Tri côte à côte** et **Édition** en dessous ;
- *Given* un filtre édition issu du drawer, *When* l'écran s'ouvre, *Then* le panneau est déplié avec le pré-filtre appliqué ;
- *Given* des filtres actifs, *When* je tape « Effacer les filtres », *Then* la liste revient complète (retour page 1).

**Priorité** : moyenne. → M-09 / M09-01 (#177) (retour test physique v0.9.2).

---

## 11. Épique 9 — OCR interactif & fiabilisation (M-12)

> Évolution du flux OCR de l'Épique 4 : l'application lit la couverture,
> **analyse des candidats** (titre, numéro/tome, année, pages, prix…) avec un
> **niveau de confiance**, **propose automatiquement** les champs fiables et
> ne fait **intervenir Marc que pour les zones ambiguës**, sélectionnées parmi
> la liste des textes détectés. Cible : livrée dans la **v1.0.0** (**M-12 / M-12R**,
> issues #205-#212, #215).

### US-OCR-01 — Préparer la photo avant la lecture (prétraitement)
> En tant que **Marc**, je veux **que la photo de la couverture soit retravaillée (redimensionnement, contraste) avant la reconnaissance** afin de **maximiser les chances de lecture, même sur une couverture stylisée**.

**Critères d'acceptation** :
- un prétraitement (redimensionnement + contraste) est appliqué avant la reconnaissance ;
- aucune image n'est enregistrée (analyse éphémère, R14.2) ;
- la lecture est plus fiable qu'à l'écran nu sur les couvertures fortement stylisées.

**Statut (M-12)** : livré ✅ ([M12-01 (#205)](https://github.com/donovan-dev-web/PicsouCollectionApp/issues/205), v1.0.0).

**Priorité** : haute.

### US-OCR-02 — Lire le texte ET sa position (bounding boxes)
> En tant que **Marc**, je veux **que l'application connaisse non seulement le texte de la couverture mais aussi où se trouve chaque texte sur la photo** afin de **pointer précisément l'information correcte** en cas d'ambiguïté.

**Critères d'acceptation** :
- l'OCR retourne le texte **et** la position (bounding box) de chaque zone détectée ;
- les positions sont exprimées dans un référentiel exploitable par l'écran ;
- le moteur reste abstrait (`OcrEngine`) et la CI reste verte sans module natif.

**Statut (M-12)** : livré ✅ ([M12-02 (#206)](https://github.com/donovan-dev-web/PicsouCollectionApp/issues/206), v1.0.0).

**Priorité** : haute.

### US-OCR-03 — Comprendre ce que dit la couverture (candidats + confiance)
> En tant que **Marc**, je veux **que l'application distingue le titre, le numéro/tome/issue, l'année, voire le prix ou le nombre de pages** afin de **ne pas confondre « 125 » (numéro) avec « 192 PAGES », « €8,50 » ou « 2026 »**.

**Critères d'acceptation** :
- pour chaque champ (titre, numéro/tome, année, éditeur…) une liste de **candidats** est produite avec un **niveau de confiance** ;
- les règles métier discriminent : `192 PAGES` ≠ numéro, `€8,50` = prix, `2026` = année, `TOME 12` / `N° 125` = numéro ;
- le module est testable sans dépendance matérielle.

**Statut (M-12)** : livré ✅ ([M12-03 (#207)](https://github.com/donovan-dev-web/PicsouCollectionApp/issues/207), v1.0.0).

**Priorité** : haute.

### US-OCR-04 — Proposer automatiquement les champs fiables
> En tant que **Marc**, je veux **que l'application pré-remplisse les champs dont elle est sûre (ex. `Titre ✓ VOGUE`, `Numéro ✓ 125`, `Année ✓ 2026`)** afin de **valider d'un coup d'œil sans tout relire**.

**Critères d'acceptation** :
- un seuil de confiance déclenche la proposition automatique d'un champ ;
- en cas de candidats à confiance proche, **aucune** proposition automatique (validation utilisateur requise) ;
- les propositions restent **toujours** modifiables.

**Statut (M-12)** : livré ✅ ([M12-04 (#208)](https://github.com/donovan-dev-web/PicsouCollectionApp/issues/208), v1.0.0).

**Priorité** : moyenne.

### US-OCR-05 — Choisir la bonne zone sur la photo
> En tant que **Marc**, je veux **voir la photo avec les textes détectés et choisir le bon texte** afin de **dire à l'application où se trouve l'information** quand un champ est ambigu ou multiple.

**Critères d'acceptation** :
- après la capture, un écran intermédiaire affiche la photo + les textes détectés ;
- chaque texte détecté est **cliquable** (choix par liste, validé sur device — le tap direct sur l'image étant imprécis) ;
- aucune image n'est enregistrée.

**Statut (M-12)** : livré ✅ ([M12-05 (#209)](https://github.com/donovan-dev-web/PicsouCollectionApp/issues/209), v1.0.0).

**Priorité** : haute.

### US-OCR-06 — Sélectionner une zone pour un champ et corriger vite
> En tant que **Marc**, je veux **associer une zone au titre, au numéro/tome ou à l'année et remplacer rapidement une proposition** afin de **corriger sans ressaisir tout le formulaire**.

**Critères d'acceptation** :
- une zone peut être sélectionnée comme **titre**, **numéro/tome/issue** ou **année/date** ;
- une proposition automatique peut être **remplacée** par une autre zone ou une saisie directe ;
- les champs non identifiés restent vides (jamais de blocage) ;
- la correction prend au plus 2-3 gestes par champ.

**Statut (M-12)** : livré ✅ ([M12-06 (#210)](https://github.com/donovan-dev-web/PicsouCollectionApp/issues/210), v1.0.0).

**Priorité** : haute.

### US-OCR-07 — Rechercher / ajouter avec les valeurs validées
> En tant que **Marc**, je veux **rechercher avec le titre+numéro validés ou ajouter même si une information manque** afin de **conclure en brocante sans refaire une saisie complète**.

**Critères d'acceptation** :
- les valeurs validées déclenchent la recherche → résultat Possédé / Absent ;
- information absente → saisie manuelle **pré-remplie** avec ce qui est connu (pas de blocage) ;
- plusieurs candidats possibles → l'utilisateur choisit (jamais de choix automatique hasardeux).

**Statut (M-12)** : livré ✅ ([M12-07 (#211)](https://github.com/donovan-dev-web/PicsouCollectionApp/issues/211), v1.0.0).

**Priorité** : moyenne.

### US-OCR-08 — Fiabiliser sur de vraies couvertures (tests terrain + règles)
> En tant que **Marc**, je veux **que l'OCR soit renforcé sur les magazines, BD, comics et couvertures stylisées, nombreux nombres ou textes inclinés** afin de **limiter les erreurs et corrections manuelles**.

**Critères d'acceptation** :
- un **jeu de test** de couvertures réelles est constitué (magazines, BD/comics, stylisées, textes inclinés, « plusieurs nombres ») ;
- les **erreurs OCR** et les **erreurs de classification des champs** sont mesurées et consignées ;
- les règles métier (US-OCR-03) et les seuils (US-OCR-04) sont ajustés à partir des mesures ;
- la synthèse est documentée (`docs/12-TESTING.md`).

**Statut (M-12)** : livré ✅ ([M12-08 (#212)](https://github.com/donovan-dev-web/PicsouCollectionApp/issues/212), v1.0.0).

**Priorité** : moyenne.

---

## 12. Représentation graphique

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

## 13. Récapitulatif des user stories

| Épique | Stories | Nb |
|---|---|---|
| Base de données | US-DB-01 à 05 | 5 |
| Accueil | US-ACC-01 à 05 | 5 |
| Ajout & collection | US-COL-01 à 10 | 10 |
| Identification | US-ID-01 à 09 | 9 |
| Export / Import | US-BK-01 à 05 | 5 |
| Paramètres | US-SET-01 | 1 |
| Qualité & publication | US-QA-01 à 03 | 3 |
| UI/UX M-10 | US-UX-01 à 06 | 6 |
| UI/UX M-10R (retours terrain) | US-UX-07 à 12 | 6 |
| UI/UX M-10R2 (2ᵉ passe retours) | US-UX-13 à 22 | 10 |
| UI/UX M-09 (tests terrain) | US-UX-23 | 1 |
| OCR interactif & fiabilisation (M-12) | US-OCR-01 à 08 | 8 |
| **Total** | | **69** |
