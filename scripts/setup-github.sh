#!/usr/bin/env bash
#
# setup-github.sh
# ---------------------------------------------------------
# Initialise le dépôt GitHub Picsou Collection :
#   - Labels (23)   : types, priorités, statuts, épiques, tailles
#   - Milestones (9): M-01..M-09 (phases de la roadmap)
#   - Issues (27)   : une par user story (US-*)
#   - Kanban        : ajout des issues au GitHub Project v2
#
# Usage:
#   bash scripts/setup-github.sh
#
# Prérequis:
#   - gh authentifié avec scopes: repo, read:project, write:project
#   - gh auth refresh -h github.com -s project
#
# Idempotent: relançable sans créer de doublons.
# ---------------------------------------------------------

set -euo pipefail

REPO="${REPO:-donovan-dev-web/PicsouCollectionApp}"
PROJECT_NUMBER="${PROJECT_NUMBER:-5}"   # "Picsou Collection"
PROJECT_OWNER="${PROJECT_OWNER:-donovan-dev-web}"

echo "==> Dépôt cible : $REPO"
echo "==> Projet kanban (v2) n°$PROJECT_NUMBER (owner: $PROJECT_OWNER)"

# ---------------------------------------------------------
# 1. VERIFICATIONS
# ---------------------------------------------------------
if ! command -v gh >/dev/null 2>&1; then
  echo "Erreur: gh (GitHub CLI) n'est pas installé." >&2
  exit 1
fi

if ! gh auth status >/dev/null 2>&1; then
  echo "Erreur: gh n'est pas authentifié." >&2
  echo "Lancez: gh auth login" >&2
  exit 1
fi

echo "  - Authentification OK."

# ---------------------------------------------------------
# 2. LABELS
# ---------------------------------------------------------
echo "==> Création des labels..."

declare -a LABELS=(
  # Types
  "bug:#d73a4a:Défaut signalé"
  "enhancement:#a2eeef:Amélioration / fonctionnalité"
  "documentation:#0075ca:Écriture de documentation"
  "refactor:#d4c5f9:Refactoring sans changement de comportement"
  "test:#1d76db:Travail spécifique aux tests"
  "infra:#8b949e:Build, CI/CD, config"
  # Priorités
  "priority-high:#b60205:Priorité immédiate"
  "priority-medium:#fbca04:Priorité normale"
  "priority-low:#fef2c0:Peut attendre"
  # Statuts (suivi kanban)
  "to-do:#c5def5:À faire (backlog)"
  "in-progress:#fbca04:En cours"
  "in-review:#c5def5:En revue / PR ouverte"
  "blocked:#b60205:Bloqué (tâche dépendante)"
  "done:#0e8a16:Terminé"
  # Épiques
  "epic/db:#0e8a16:Base de données"
  "epic/accueil:#1f883d:Accueil"
  "epic/collection:#013cd0:Ajout & collection"
  "epic/identification:#bf3997:Identification"
  "epic/backup:#5319e7:Export / Import"
  "epic/quality:#fb8d34:Qualité & publication"
  # Tailles
  "size/s:#e7deeb:Petite (≤ 0.5 j)"
  "size/m:#e7deeb:Moyenne (≤ 1 j)"
  "size/l:#e7deeb:Grande (> 1 j, à découper)"
)

for entry in "${LABELS[@]}"; do
  IFS=':' read -r name color desc <<<"$entry"
  if gh api "/repos/$REPO/labels/$name" >/dev/null 2>&1; then
    echo "  - label '$name' déjà présent."
  else
    gh label create "$name" -R "$REPO" -c "${color#\#}" -d "$desc" >/dev/null
    echo "  - label '$name' créé."
  fi
done

# ---------------------------------------------------------
# 3. MILESTONES
# ---------------------------------------------------------
echo "==> Création des milestones..."

create_milestone() {
  local title="$1" desc="$2" due="$3"

  # Vérification via l'API REST (la commande `gh milestone` n'existe pas)
  local exists
  exists=$(gh api "/repos/$REPO/milestones" --jq ".[] | select(.title == \"$title\") | .title" 2>/dev/null || true)
  if [[ -n "$exists" ]]; then
    echo "  - milestone '$title' déjà présent."
    return
  fi

  local data="{\"title\":\"$title\",\"description\":\"$desc\""
  if [[ -n "$due" ]]; then
    data+=",\"due_on\":\"${due}T23:59:59Z\""
  fi
  data+="}"

  gh api --method POST "/repos/$REPO/milestones" --input <(printf '%s' "$data") >/dev/null
  echo "  - milestone '$title' créé."
}

create_milestone "M-00 — Cadrage, conception & documentation" "Cadrage, docs, design, organisation (terminé)" "2026-08-31"
create_milestone "M-01 — Initialisation technique" "Projet Expo opérationnel sur téléphone" "2026-09-30"
create_milestone "M-02 — Base de données" "Persistance et CRUD collection" "2026-10-31"
create_milestone "M-03 — Interface principale" "Écrans accueil, collection, paramètres" "2026-11-30"
create_milestone "M-04 — Scan code-barres" "Identification par code-barres" "2026-12-31"
create_milestone "M-05 — Caméra / OCR" "Identification par OCR" "2027-01-31"
create_milestone "M-06 — Parcours complet" "Identification → Possédé / Absent" "2027-02-28"
create_milestone "M-07 — Export / Import" "Sauvegarde et restauration JSON" "2027-03-31"
create_milestone "M-08 — Optimisation & qualité" "Performance, tests, couverture" "2027-04-30"
create_milestone "M-09 — Tests terrain & publication" "Validation réelle, build Play Store" "2027-05-31"

# ---------------------------------------------------------
# 4. ISSUES (1 issue = 1 user story)
# ---------------------------------------------------------
echo "==> Création des issues..."

# Format: id|Épique-titre|milestone|labels|énoncé|critères
declare -a ISSUES=(
  # ---- Épique 1 — Base de données (M-02) ----
  "US-DB-01|[DB] Initialiser la base|M-02 — Base de données|epic/db,priority-high,to-do|En tant que **developpeur**, je veux **initialiser la base SQLite au démarrage** afin de **pouvoir persister la collection**.|- La base est créée automatiquement au premier lancement||- Les tables \`magazines\` et \`collection_items\` sont créées||- La version de schéma est enregistrée (\`PRAGMA user_version = 1\`)"
  "US-DB-02|[DB] Créer une édition|M-02 — Base de données|epic/db,priority-high,to-do|En tant que **Marc**, je veux **enregistrer une nouvelle édition** afin de **l'ajouter à ma collection**.|- Je peux saisir publication (obligatoire), numéro, édition, pays, date, code-barres||- Un identifiant UUID est généré||- Un magazine sans numéro est autorisé (hors-série)||- La date de création est enregistrée"
  "US-DB-03|[DB] Chercher par code-barres|M-02 — Base de données|epic/db,priority-high,to-do|En tant que **Marc**, je veux **retrouver une édition à partir de son code-barres** afin de **savoir si je la possède**.|- Le scan d'un code-barres connu retrouve l'édition||- Un code-barres inconnu renvoie aucun résultat||- La recherche n'utilise pas les champs \`notes\`/\`ocr_text\`"
  "US-DB-04|[DB] Lister la collection|M-02 — Base de données|epic/db,priority-high,to-do|En tant que **Marc**, je veux **voir la liste de ma collection avec le nombre d'exemplaires** afin de **consulter mon inventaire**.|- La liste est triée par publication puis numéro||- Chaque ligne affiche le nombre d'exemplaires||- La requête reste légère"
  "US-DB-05|[DB] Gérer les exemplaires|M-02 — Base de données|epic/db,priority-high,to-do|En tant que **Marc**, je veux **ajouter/modifier/supprimer un exemplaire** afin de **gérer les multiples copies d'une même édition**.|- J'ajoute un exemplaire avec état, notes et date||- Je supprime un exemplaire||- Supprimer une édition supprime ses exemplaires (cascade)"

  # ---- Épique 2 — Accueil (M-03) ----
  "US-ACC-01|[Accueil] Voir le compteur|M-03 — Interface principale|epic/accueil,priority-high,to-do|En tant que **Marc**, je veux **voir le nombre de magazines possédés** afin de **connaître d'un coup d'œil l'état de ma collection**.|- Le compteur affiche le nombre d'exemplaires||- Il se met à jour après chaque ajout"
  "US-ACC-02|[Accueil] Accéder au scanner|M-03 — Interface principale|epic/accueil,priority-high,to-do|En tant que **Marc**, je veux **un bouton Scanner visible** afin de **lancer l'identification rapidement en brocante**.|- Le bouton Scanner est proéminent et accessible en une main||- Il mène à l'écran de choix de méthode"
  "US-ACC-03|[Accueil] Accéder à l'ajout|M-03 — Interface principale|epic/accueil,priority-high,to-do|En tant que **Marc**, je veux **un bouton Ajouter** afin de **saisir un magazine manuellement depuis l'accueil**.|- Le bouton Ajouter mène à la saisie manuelle"
  "US-ACC-04|[Accueil] Voir les ajouts récents|M-03 — Interface principale|epic/accueil,priority-medium,to-do|En tant que **Marc**, je veux **voir mes derniers ajouts** afin de **suivre l'évolution de ma collection**.|- Les derniers exemplaires ajoutés sont affichés||- La liste est à jour au focus de l'écran"

  # ---- Épique 3 — Ajout & collection (M-03) ----
  "US-COL-01|[Collection] Ajouter manuellement|M-03 — Interface principale|epic/collection,priority-high,to-do|En tant que **Marc**, je veux **saisir un magazine manuellement** afin de **l'ajouter quand il n'a pas de code-barres lisible**.|- Formulaire court (publication obligatoire, autres champs facultatifs)||- Le code-barres peut être saisi (optionnel)||- Après validation, un exemplaire est ajouté"
  "US-COL-02|[Collection] Rechercher dans la collection|M-03 — Interface principale|epic/collection,priority-high,to-do|En tant que **Marc**, je veux **rechercher un magazine par titre ou numéro** afin de **retrouver rapidement une édition**.|- La recherche filtre par publication ou numéro||- Les résultats sont affichés avec le badge de statut"
  "US-COL-03|[Collection] Consulter une fiche|M-03 — Interface principale|epic/collection,priority-high,to-do|En tant que **Marc**, je veux **ouvrir la fiche détaillée d'un magazine** afin de **voir ses exemplaires et informations**.|- La fiche affiche publication, numéro, édition, pays, date, code-barres||- Elle liste les exemplaires avec état, notes et date||- Elle affiche le statut Possédé/Absent"
  "US-COL-04|[Collection] Modifier une édition|M-03 — Interface principale|epic/collection,priority-medium,to-do|En tant que **Marc**, je veux **modifier les informations d'une édition** afin de **corriger une erreur de saisie**.|- Je peux modifier publication, numéro, édition, pays, date, code-barres||- La date de modification est mise à jour"
  "US-COL-05|[Collection] Supprimer une édition|M-03 — Interface principale|epic/collection,priority-medium,to-do|En tant que **Marc**, je veux **supprimer une édition** afin de **retirer une entrée erronée**.|- La suppression exige une confirmation||- Les exemplaires associés sont supprimés en cascade"
  "US-COL-06|[Collection] Gérer un doublon|M-06 — Parcours complet|epic/collection,priority-high,to-do|En tant que **Marc**, je veux **être averti lorsque j'ajoute une édition déjà possédée** afin de **décider librement d'ajouter un second exemplaire**.|- Une alerte indique le nombre d'exemplaires actuels||- Je peux ajouter quand même ou annuler"

  # ---- Épique 4 — Identification ----
  "US-ID-01|[Identification] Choisir la méthode|M-04 — Scan code-barres|epic/identification,priority-high,to-do|En tant que **Marc**, je veux **choisir entre code-barres, caméra et saisie manuelle** afin de **m'adapter au magazine rencontré**.|- Les trois méthodes sont accessibles depuis l'écran de choix"
  "US-ID-02|[Identification] Scanner un code-barres|M-04 — Scan code-barres|epic/identification,priority-high,to-do|En tant que **Marc**, je veux **scanner le code-barres d'un magazine** afin de **l'identifier instantanément**.|- La permission caméra est demandée||- Un EAN-13/ISBN est détecté||- Le code connu affiche l'édition||- Le code inconnu propose les méthodes de secours||- **Rappel** : le scan ne fait que **retrouver** une édition déjà en base ; il ne crée jamais une édition à lui seul."
  "US-ID-03|[Identification] Identifier par caméra/OCR|M-05 — Caméra / OCR|epic/identification,priority-high,to-do|En tant que **Marc**, je veux **pointer la caméra sur la couverture** afin de **dégager le titre et le numéro par OCR**.|- L'OCR extrait publication, numéro, date||- Un niveau de confiance est affiché||- En cas de confiance insuffisante, une saisie manuelle est proposée||- Aucune image n'est enregistrée"
  "US-ID-04|[Identification] Voir le résultat possédé/absent|M-06 — Parcours complet|epic/identification,priority-high,to-do|En tant que **Marc**, je veux **savoir immédiatement si le magazine est possédé** afin de **décider en brocante sans hésiter**.|- 🔴 Possédé : affichage du nombre d'exemplaires||- 🟢 Absent : bouton d'ajout direct"
  "US-ID-05|[Identification] Passer à la méthode suivante après échec|M-05 — Caméra / OCR|epic/identification,priority-high,to-do|En tant que **Marc**, je veux **que l'application me propose la méthode suivante après un échec** afin de **ne jamais rester bloqué**.|- Après échec code-barres → proposition caméra puis manuelle||- La méthode échouée n'est pas reproposée dans le même parcours"
  "US-ID-06|[Identification] Scanner plusieurs magazines à la suite|M-06 — Parcours complet|epic/identification,priority-high,to-do|En tant que **Marc**, je veux **scanner plusieurs magazines de suite, sans fermer et rouvrir l'écran** afin de **faire le tour d'une brocante rapidement**.|- Après un scan réussi et l'ajout d'un exemplaire, l'écran caméra reste affiché||- Un **pop-up de confirmation** indique le magazine ajouté à chaque scan||- Je peux immédiatement scanner le magazine suivant||- Un bouton permet d'arrêter le scan en continu||- Si un code-barres est inconnu, l'application me dirige vers la saisie manuelle"

  # ---- Épique 5 — Export / Import (M-07) ----
  "US-BK-01|[Backup] Exporter la collection|M-07 — Export / Import|epic/backup,priority-high,to-do|En tant que **Marc**, je veux **exporter ma collection en JSON** afin de **la sauvegarder et la transférer**.|- Le fichier est au format \`picsou-collection\` v1||- Le partage/enregistrement est proposé||- Toutes les éditions et exemplaires sont inclus"
  "US-BK-02|[Backup] Importer une collection|M-07 — Export / Import|epic/backup,priority-high,to-do|En tant que **Marc**, je veux **importer un fichier JSON** afin de **restaurer ma collection sur un nouveau téléphone**.|- Le fichier est validé (format, version, intégrité)||- Une confirmation requise avant remplacement||- La collection existante est remplacée par celle du fichier"
  "US-BK-03|[Backup] Gérer un fichier d'import invalide|M-07 — Export / Import|epic/backup,priority-medium,to-do|En tant que **Marc**, je veux **un message clair si le fichier d'import est invalide** afin de **ne pas corrompre ma collection**.|- Un fichier au mauvais format/version est rejeté sans modifier les données||- Un message d'erreur explicite est affiché"

  # ---- Épique 6 — Qualité & publication ----
  "US-QA-01|[Quality] Respect du design system|M-03 — Interface principale|epic/quality,priority-medium,to-do|En tant que **developpeur**, je veux **respecter le design system** (clair/sombre) afin de **garantir une cohérence visuelle**.|- Les couleurs et typographies du design system sont appliquées||- Le mode clair et le mode sombre fonctionnent"
  "US-QA-02|[Quality] Couverture de tests|M-08 — Optimisation & qualité|epic/quality,priority-high,to-do|En tant que **developpeur**, je veux **des tests unitaires et composants** afin de **garantir la fiabilité du code**.|- Les services/repositories sont testés||- Les écrans critiques sont testés||- Un rapport de coverage est généré"
  "US-QA-03|[Quality] Build de production|M-09 — Tests terrain & publication|epic/quality,priority-medium,to-do|En tant que **developpeur**, je veux **générer un build de production** afin de **préparer la publication Play Store**.|- EAS Build produit un AAB||- Le build local produit un APK||- L'application fonctionne en production"
)

# ---------------------------------------------------------
# Issues complémentaires (hors user stories) :
#   - DOC-* / DESIGN-* : cadrage, conception et documentation (M-00, terminé)
#   - SETUP-*          : initialisation technique du projet (M-01)
# ---------------------------------------------------------
# Format: id|Titre|milestone|labels|description|tâches (||)
declare -a ISSUES_EXTRA=(
  # ---- M-00 — Cadrage, conception & documentation (terminé) ----
  "DOC-01|Rédiger le glossaire (docs/00-GLOSSAIRE)|M-00 — Cadrage, conception & documentation|documentation,done|Rédiger et tenir à jour le glossaire du projet (domaine, technique, agile).|- Définir les termes du domaine (édition, exemplaire, publication, hors-série)||- Définir les termes techniques (migration, repository, OCR, EAN-13)||- Ajouter le glossaire à la table des docs du CONTRIBUTING"
  "DOC-02|Rédiger la vision produit (docs/01-VISION)|M-00 — Cadrage, conception & documentation|documentation,done|Rédiger le document de vision produit et les promesses.||- Définir le problème et la cible (collectionneurs Disney)||- Énoncer les promesses (rapidité, fiabilité, simplicité, souveraineté)"
  "DOC-03|Rédiger le modèle conceptuel (docs/02)|M-00 — Cadrage, conception & documentation|documentation,done|Rédiger le modèle conceptuel : entités et règles métier.||- Définir les entités (magazine, édition, exemplaire)||- Énoncer les règles métier clés"
  "DOC-04|Rédiger la spécification technique (docs/03)|M-00 — Cadrage, conception & documentation|documentation,done|Rédiger la spécification technique : stack React Native + Expo.||- Fixer la stack (Expo, TypeScript, SQLite, camera, OCR ML Kit, Zustand)||- Documenter les contraintes offline"
  "DOC-05|Rédiger la spécification fonctionnelle (docs/04)|M-00 — Cadrage, conception & documentation|documentation,done|Rédiger la spécification fonctionnelle (écrans, flux, règles).||- Décrire les écrans et parcours||- Clarifier le rôle du code-barres (retrouver, ne jamais créer)||- Documenter le scan en continu et les filtres utiles"
  "DOC-06|Rédiger l'architecture logicielle (docs/05)|M-00 — Cadrage, conception & documentation|documentation,done|Rédiger le document d'architecture.||- Décrire la couche database / repositories / services||- Décrire la navigation et la gestion d'état"
  "DOC-07|Rédiger le modèle de données (docs/06)|M-00 — Cadrage, conception & documentation|documentation,done|Rédiger le modèle de données.||- Définir les entités et leurs relations||- Justifier la simplification à 2 tables"
  "DOC-08|Rédiger le schéma de base de données (docs/07)|M-00 — Cadrage, conception & documentation|documentation,done|Rédiger le schéma SQLite (2 tables : magazines, collection_items).||- Documenter les tables, colonnes et contraintes||- Documenter PRAGMA user_version"
  "DOC-09|Rédiger les user stories MVP (docs/08)|M-00 — Cadrage, conception & documentation|documentation,done|Rédiger les 27 user stories organisées par épique.||- Rédiger les critères d'acceptation||- Définir les priorités"
  "DOC-10|Rédiger le workflow agile (docs/09-ISSUE)|M-00 — Cadrage, conception & documentation|documentation,done|Rédiger le document de gestion des issues, labels, milestones, kanban.||- Définir les labels, milestones et templates||- Documenter le déclenchement du Kanban"
  "DOC-11|Rédiger la stratégie CI/CD (docs/10)|M-00 — Cadrage, conception & documentation|documentation,done|Rédiger la stratégie CI/CD (GitHub Actions + EAS Build).||- Documenter le workflow CI||- Documenter les secrets et la protection de branches"
  "DOC-12|Rédiger la roadmap (docs/11-ROADMAP)|M-00 — Cadrage, conception & documentation|documentation,done|Rédiger la roadmap par phases.||- Définir les phases 0 à 9||- Associer user stories et critères de sortie"
  "DOC-13|Rédiger la stratégie de tests (docs/12-TESTING)|M-00 — Cadrage, conception & documentation|documentation,done|Rédiger la stratégie de tests (catégories A et B).||- Définir les catégories de tests||- Fixer les seuils de couverture"
  "DOC-14|Rédiger la politique de confidentialité (docs/13-PRIVACY)|M-00 — Cadrage, conception & documentation|documentation,done|Rédiger la politique de confidentialité (100 % local).||- Documenter l'absence de serveur et d'images stockées"
  "DOC-15|Rédiger les fichiers racine (README, CONTRIBUTING, SECURITY, CHANGELOG)|M-00 — Cadrage, conception & documentation|documentation,done|Créer et compléter les fichiers racine du dépôt.||- README aligné sur la doc||- CONTRIBUTING avec table des docs||- SECURITY et CHANGELOG initiaux"
  "DESIGN-01|Définir le design system (clair & sombre)|M-00 — Cadrage, conception & documentation|enhancement,done|Définir le design system : chartes Vault & Venture (clair) et Obsidian Vault (sombre).||- Définir palette, typographies et composants||- Documenter les deux environnements visuels"
  "DESIGN-02|Réaliser les maquettes (7 écrans × clair/sombre)|M-00 — Cadrage, conception & documentation|enhancement,done|Réaliser les maquettes des 7 écrans en version claire et sombre.||- Maquetter accueil, ajout, identification, collection, fiche, paramètres, recherche||- Fournir les prototypes visuels provisoires"
  "ORG-01|Organiser la présentation client/UX|M-00 — Cadrage, conception & documentation|documentation,done|Rédiger la présentation générale orientée client.||- Présenter le projet, les fonctionnalités et le parcours UX||- Intégrer les retours client (scan en continu, filtres, code-barres)"   "ORG-02|Configurer le dépôt GitHub (branches, kanban, labels, milestones)|M-00 — Cadrage, conception & documentation|infra,done|Préparer le dépôt pour le suivi agile : branches, projet kanban, labels, milestones.|- Créer le GitHub Project v2 « Picsou Collection »||- Activer la protection des branches main et develop||- Configurer templates issues/PR et workflow CI"

  # ---- M-01 — Initialisation technique (à faire) ----
  "SETUP-01|Créer le projet Expo|M-01 — Initialisation technique|infra,to-do|Créer le projet React Native avec Expo.||- Générer l'application Expo (Router)||- Vérifier le lancement sur téléphone"
  "SETUP-02|Configurer TypeScript strict|M-01 — Initialisation technique|infra,to-do|Activer le mode strict de TypeScript.||- Configurer tsconfig strict||- Ajouter le script typecheck"
  "SETUP-03|Configurer Expo Router|M-01 — Initialisation technique|infra,to-do|Configurer la navigation par fichiers (Expo Router).||- Mettre en place la structure des routes||- Vérifier la navigation entre écrans"
  "SETUP-04|Installer expo-sqlite|M-01 — Initialisation technique|infra,to-do|Installer et configurer expo-sqlite.||- Ajouter la dépendance||- Préparer l'initialisation au démarrage"
  "SETUP-05|Installer Zustand (gestion d'état)|M-01 — Initialisation technique|infra,to-do|Installer Zustand pour la gestion d'état global.||- Ajouter la dépendance||- Définir les stores de base"
  "SETUP-06|Configurer ESLint + Prettier|M-01 — Initialisation technique|infra,to-do|Configurer les outils de qualité de code.||- Configurer ESLint||- Configurer Prettier||- Ajouter le script lint"
  "SETUP-07|Configurer Jest et la couverture|M-01 — Initialisation technique|test,to-do|Configurer Jest + React Native Testing Library.||- Initialiser la config Jest||- Ajouter une config de couverture (>80 %)"
  "SETUP-08|Configurer EAS Build (eas.json)|M-01 — Initialisation technique|infra,to-do|Configurer le build de production EAS.||- Créer eas.json (profils dev/preview/production)||- Vérifier la génération d'un AAB"
  "SETUP-09|Configurer le setup GitHub (script kanban)|M-01 — Initialisation technique|infra,done|Automatiser la création des labels, milestones, issues et l'association au kanban.|- Créer le script d'initialisation idempotent||- Créer labels, milestones, 27 user stories + issues complémentaires||- Associer toutes les issues au GitHub Project v2"
  "SETUP-10|Tester l'installation sur téléphone|M-01 — Initialisation technique|infra,to-do|Vérifier l'installation et le débogage sur un téléphone Android physique.|- Lancer le développement build sur téléphone||- Valider le fonctionnement de base"
)

create_issue() {
  local entry="$1"
  IFS='|' read -r id title milestone labels enonce criteres <<<"$entry"

  # Construire le corps (toujours recalculé) selon le type d'issue
  local body
  if [[ "$id" == US-* ]]; then
    body="## Contexte\n\n**User story source** : \`$id\`\n\n## Story\n\n> $enonce\n\n## Critères d'acceptation\n\n"
  else
    body="## Contexte\n\n**Épique / milestone** : $milestone\n\n## Objectif\n\n> $enonce\n\n## Tâches\n\n"
  fi
  # Découpage sur le séparateur § (les "||" de la donnée y sont convertis)
  local crits_data="${criteres//||/§}"
  IFS='§' read -r -a crits <<<"$crits_data"
  for raw in "${crits[@]}"; do
    c="${raw#|}"
    c="${c#- }"
    [[ -z "$c" ]] && continue
    body+="- $c\n"
  done
  body+="\n## Critères de fin (DoD)\n\n- [ ] Code + tests\n- [ ] lint / typecheck OK\n- [ ] CI verte\n"

  local label_args=()
  IFS=',' read -r -a labs <<<"$labels"
  for l in "${labs[@]}"; do
    label_args+=(--label "$l")
  done

  # Idempotence : recherche d'une issue existante dont le TITRE commence exactement par "[$id]"
  local num
  num=$(gh api "/repos/$REPO/issues?state=all&per_page=200" \
    --jq ".[] | select(.title | startswith(\"[$id]\")) | .number" 2>/dev/null | head -n1)

  if [[ -n "$num" ]]; then
    # Sur `edit`, le flag s'appelle `--add-label`
    local edit_label_args=()
    for l in "${labs[@]}"; do
      edit_label_args+=(--add-label "$l")
    done
    gh issue edit "$num" -R "$REPO" \
      --milestone "$milestone" \
      --body "$(printf '%b' "$body")" \
      "${edit_label_args[@]}" >/dev/null
    echo "  - issue '$id' déjà présente (n°$num), corps/labels/milestone à jour."
    return
  fi

  gh issue create -R "$REPO" \
    --title "[$id] $title" \
    --milestone "$milestone" \
    --body "$(printf '%b' "$body")" \
    "${label_args[@]}" >/dev/null
  echo "  - issue '$id' créée."
}

for entry in "${ISSUES[@]}" "${ISSUES_EXTRA[@]}"; do
  create_issue "$entry"
done

# ---------------------------------------------------------
# 5. KANBAN (GitHub Project v2)
# ---------------------------------------------------------
echo "==> Association des issues au Project v2 n°$PROJECT_NUMBER..."

# Récupération des node IDs
PROJECT_NODE_ID=$(gh project view "$PROJECT_NUMBER" --owner "$PROJECT_OWNER" --format json \
  | jq -r '.projects[0].id // .id')

if [[ -z "$PROJECT_NODE_ID" || "$PROJECT_NODE_ID" == "null" ]]; then
  echo "Erreur: impossible de récupérer le node ID du project n°$PROJECT_NUMBER." >&2
  echo "Vérifiez le script gh et le scope project." >&2
  exit 1
fi

# Ensemble des contenus (issues) déjà présents dans le projet (vérification exacte)
IN_PROJECT_IDS=$(gh api graphql \
  -f query="query { node(id: \"$PROJECT_NODE_ID\") { ... on ProjectV2 { items(first: 200) { nodes { content { ... on Issue { id } } } } } } }" \
  --jq '.data.node.items.nodes[].content.id' 2>/dev/null || true)

add_to_project() {
  local issue_number="$1"

  # Node ID de l'issue via l'API REST
  local issue_node_id
  issue_node_id=$(gh api "/repos/$REPO/issues/$issue_number" --jq '.node_id')

  # Déjà présent ?
  if grep -qF "$issue_node_id" <<<"$IN_PROJECT_IDS"; then
    echo "  - issue #$issue_number déjà dans le projet."
    return
  fi

  local q="mutation { addProjectV2ItemById(input: {projectId: \"$PROJECT_NODE_ID\", contentId: \"$issue_node_id\"}) { item { id } } }"
  if gh api graphql -f query="$q" >/dev/null 2>&1; then
    echo "  - issue #$issue_number ajoutée au projet."
  else
    echo "  - Erreur sur l'ajout de l'issue #$issue_number (déjà présente ou API)." >&2
  fi
}

for number in $(gh api "/repos/$REPO/issues?state=all&per_page=200" --jq '.[].number'); do
  add_to_project "$number"
done

# ---------------------------------------------------------
# 6. RESUME
# ---------------------------------------------------------
echo
echo "============================================="
echo "  Terminé. Récapitulatif :"
echo "============================================="
echo "  - Labels    : $(gh label list -R "$REPO" --limit 100 --json name --jq 'length')"
echo "  - Milestones: $(gh api "/repos/$REPO/milestones?state=all" --jq 'length')"
echo "  - Issues    : $(gh api "/repos/$REPO/issues?state=all&per_page=200" --jq 'length')"
echo "  - Kanban    : https://github.com/users/$PROJECT_OWNER/projects/$PROJECT_NUMBER"
echo "============================================="
