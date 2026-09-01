# Politique de sécurité — Picsou Collection

> Ce document décrit les mesures de sécurité et de confidentialité de l'application.

---

## Principes fondamentaux

Picsou Collection est une application **offline-first** qui ne collecte aucune donnée personnelle.

---

## Données collectées

| Donnée | Collectée ? | Stockée ? | Envoyée ? |
|---|---|---|---|
| Données de collection | Non | Locale (SQLite) | Non |
| Photos / images | Non | Non (éphémères) | Non |
| Données personnelles | Non | Non | Non |
| Code-barres scannés | Non | Locale (SQLite) | Non |
| Texte OCR | Non | Locale (SQLite) | Non |
| Logs / telemetry | Non | Non | Non |

---

## Mesures de sécurité

### 1. Aucun serveur
L'application ne communique avec aucun serveur externe pour fonctionner. Toutes les opérations sont locales.

### 2. Aucune image stockée
La caméra est utilisée uniquement pour :
- scanner des codes-barres ;
- fournir des frames éphémères à l'OCR.

Les images temporaires sont supprimées immédiatement après analyse et **ne sont jamais persistées**.

### 3. Données 100 % locales
La base SQLite est stockée dans l'espace de stockage de l'application. Elle ne quitte jamais l'appareil sauf :
- **export explicite** par l'utilisateur (fichier JSON) ;
- **sauvegarde système** de l'appareil (opérée par le système d'exploitation).

### 4. Export sous contrôle
L'export JSON est initié **uniquement** par l'utilisateur. Le fichier est partagé via les mécanismes natifs du système d'exploitation (partage Android). L'application n'envoie jamais de données automatiquement.

### 5. Import validé
L'import de fichier JSON est soumis à des validations strictes :
- vérification du format (`picsou-collection`) ;
- vérification de la version ;
- validation de la structure des données ;
- confirmation explicite de l'utilisateur avant remplacement.

### 6. Aucune authentification
L'application ne nécessite aucun compte, mot de passe ni connexion réseau.

---

## Vulnerabilités connues

Aucune vulnérabilité connue à ce stade.

Pour signaler une vulnérabilité, merci d'ouvrir une issue GitHub avec le label `security`.

---

## Contact

Pour toute question de sécurité, ouvrir une issue GitHub ou contacter le mainteneur.
