# 🦆 Picsou Collection — Politique de Confidentialité

> **Document — v1.0**
>
> Ce document constitue la politique de confidentialité de l'application Picsou Collection. Il est destiné à être publié sur le **Google Play Store** (exigence) et à informer les utilisateurs de la gestion de leurs données.

---

## 1. Résumé

**Picsou Collection ne collecte aucune donnée personnelle.** L'application fonctionne **entièrement hors ligne** et ne communique avec aucun serveur.

---

## 2. Données collectées

| Type de donnée | Collectée | Stockée | Transmise |
|---|---|---|---|
| Données de collection (magazines) | Non | Localement (SQLite) | Non |
| Photos / images | Non | Non (éphémères) | Non |
| Données personnelles (nom, email, etc.) | Non | Non | Non |
| Localisation | Non | Non | Non |
| Identifiants publicitaires | Non | Non | Non |
| Logs / statistiques d'usage | Non | Non | Non |
| Données bancaires | Non | Non | Non |

---

## 3. Explication détaillée

### 3.1 Fonctionnement hors ligne
L'application est conçue pour être utilisée **sans aucune connexion internet**. Toutes les fonctionnalités (identification, recherche, ajout, consultation) fonctionnent localement sur votre téléphone.

### 3.2 Aucun serveur
Il n'existe **aucun serveur** ni infrastructure externe. Vos données ne quittent jamais votre appareil.

### 3.3 Caméra et images
La caméra est utilisée uniquement pour :
- **scanner des codes-barres** (EAN-13 / ISBN) ;
- **analyser la couverture** via la reconnaissance de texte (OCR) pour extraire des informations.

Les images capturées sont **éphémères** : elles sont analysées puis **immédiatement supprimées**. **Aucune image n'est enregistrée** ni stockée durablement.

### 3.4 Base de données locale
Votre collection est stockée dans une base de données **locale** (SQLite) dans l'espace de stockage de l'application. Elle reste **sous votre contrôle** sur votre appareil.

### 3.5 Export de sauvegarde
Si vous le souhaitez, vous pouvez **exporter** votre collection dans un fichier JSON portable. Cette opération est **initiée exclusivement par vous** et partage le fichier via le système de partage Android standard.

### 3.6 Import de restauration
Vous pouvez **importer** un fichier de sauvegarde JSON. L'application valide le fichier et **demande votre confirmation** avant de remplacer les données existantes.

---

## 4. Confidentialité des données

- **Aucune donnée n'est vendue** à des tiers ;
- **Aucune donnée n'est partagée** avec des tiers ;
- **Aucune publicité** ni suivi publicitaire ;
- **Aucun compte utilisateur** ni authentification requis ;
- **Aucune donnée personnelle** nécessaire pour utiliser l'application.

---

## 5. Droits de l'utilisateur

L'utilisateur garde un **contrôle total** sur ses données :
- **Souveraineté** : les données vivent sur son téléphone ;
- **Portabilité** : export JSON à tout moment ;
- **Suppression** : désinstaller l'application supprime entièrement les données locales (aucune copie n'existe ailleurs).

---

## 6. Sécurité des données

Les mesures de sécurité sont détaillées dans `SECURITY.md`. Points principaux :
- aucun serveur → aucune exposition réseau ;
- aucune image stockée ;
- import validé et soumis à confirmation ;
- export contrôlé par l'utilisateur.

---

## 7. Contact

Pour toute question relative à la confidentialité, ouvrir une issue GitHub sur le dépôt du projet.

---

**Dernière mise à jour :** [date]
