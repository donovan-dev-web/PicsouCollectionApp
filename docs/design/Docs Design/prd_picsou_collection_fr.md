# 🦆 Picsou Collection — Document de Référence (PRD)

## 1. Résumé Exécutif
**Picsou Collection** est une application Android dédiée aux collectionneurs de bandes dessinées Disney (*Picsou Magazine*, *Super Picsou Géant*, etc.). L'application résout le "dilemme du chineur" : aider les collectionneurs à déterminer instantanément s'ils possèdent déjà un numéro spécifique tout en parcourant les étals en temps réel, souvent sans connexion internet.

Le projet suit une philosophie "Local-First, Privacy-First", ne nécessitant aucun serveur, aucun compte et aucune collecte de données obligatoire.

---

## 2. Vision et Objectifs
*   **Rapidité** : Identifier un magazine en moins de 3 secondes.
*   **Fiabilité** : Fonctionne à 100 % hors ligne dans les zones reculées (brocantes, vide-greniers).
*   **Simplicité** : Interface minimaliste centrée sur le statut "Possédé" vs "Manquant".
*   **Souveraineté** : Les utilisateurs sont propriétaires de leurs données via un stockage local SQLite et des exports JSON.

---

## 3. Public Cible
*   **Collectionneurs assidus** : Utilisateurs possédant des milliers de magazines ayant besoin d'une gestion d'inventaire précise.
*   **Chineurs occasionnels** : Utilisateurs qui achètent occasionnellement des magazines et souhaitent éviter les doublons.

---

## 4. Exigences Fonctionnelles

### 4.1 Moteur d'Identification
L'application doit proposer trois méthodes pour identifier un magazine :
1.  **Scanner de Code-barres** : Méthode principale. Scanne les codes EAN/ISBN pour trouver des correspondances dans la base de données locale.
2.  **Caméra/OCR (v0.2+)** : Méthode secondaire. Extrait le texte (Titre, Numéro, Date) de la couverture pour identifier les numéros sans code-barres.
3.  **Saisie Manuelle** : Méthode de secours. Recherche par nom de publication et numéro de parution.

### 4.2 Gestion de la Collection
*   **Suivi du Statut** : Indicateurs visuels pour "DÉJÀ POSSÉDÉ" et "MANQUANT".
*   **Gestion des Exemplaires** : Prise en charge de plusieurs copies du même numéro (ex: différents états ou variantes).
*   **Fiches Détaillées** : Stockage de l'état (TBE, EM, etc.), date d'achat, prix et notes personnelles.

### 4.3 Recherche et Découverte
*   **Recherche Globale** : Rechercher dans toute la collection ou dans l'univers connu des parutions.
*   **Filtrage Avancé** : Filtrer par type de publication, époque (plage d'années) et statut de possession.

### 4.4 Portabilité des Données
*   **Export JSON** : Générer un fichier portable contenant l'intégralité de la collection.
*   **Import JSON** : Restaurer ou fusionner des collections à partir d'un fichier de sauvegarde.
*   **Pas de Cloud** : Pas de synchronisation obligatoire ; gestion manuelle des fichiers uniquement.

---

## 5. Interface Utilisateur et Expérience

### 5.1 Systèmes de Design
*   **Vault & Venture (Mode Clair)** : Professionnel, propre, contrasté.
*   **Obsidian Vault (Mode Sombre)** : Atmosphérique, premium, reposant pour les yeux.
*   **Couleurs de Marque** : Bleu Marine Profond (#001b3d) et Jaune Picsou (#fdd835).

### 5.2 Écrans Clés
*   **Accueil** : Accès rapide au Scan, à l'Ajout et aux ajouts récents.
*   **Identification** : Interface centrée sur la caméra pour un scan rapide.
*   **Ma Collection** : Vue liste/grille des magazines possédés avec filtres puissants.
*   **Détails (Fiche Magazine)** : Analyse approfondie des métadonnées d'un numéro et des exemplaires possédés.
*   **Paramètres** : Statistiques et outils de sauvegarde/restauration.

---

## 6. Stack Technique
*   **Framework** : React Native avec Expo (Development Build).
*   **Navigation** : Expo Router.
*   **Base de données** : SQLite (`expo-sqlite`).
*   **Caméra** : `expo-camera`.
*   **OCR** : Google ML Kit Text Recognition (Android Native).
*   **Stockage** : Local uniquement, données structurées + blobs de métadonnées JSON.

---

## 7. Roadmap et Phases
*   **Phase 1 (MVP)** : Architecture SQLite de base, ajout manuel et scan de code-barres.
*   **Phase 2 (UX/UI)** : Harmonisation des modes Sombre/Clair et filtrage de la collection.
*   **Phase 3 (Intelligence)** : Intégration de l'OCR pour les magazines sans code-barres.
*   **Phase 4 (Écosystème)** : Assets pour les stores, supports marketing et bêta-test.

---

## 8. Métriques de Succès
*   **Utilité** : 0 % d'achats de doublons accidentels signalés par les utilisateurs.
*   **Performance** : Du lancement de l'application au scanner actif en moins de 1,5 seconde.
*   **Sécurité des Données** : Taux de réussite de 100 % sur les tests d'import/export JSON.