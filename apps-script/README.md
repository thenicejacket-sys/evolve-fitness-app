# Export bilan → Google Sheets (script personnel)

L'app Evolve peut exporter le bilan directement dans **ton** Drive sous forme de Google Sheet
(tuile « Bilan → Sheets »). Pour ça, chaque utilisateur déploie SON propre petit script
Google Apps Script — l'URL du script n'est **jamais** dans le code de l'app : elle est saisie
une fois dans l'app et stockée uniquement sur l'appareil.

## Déploiement (5 minutes, une seule fois)

1. Ouvre https://script.google.com connecté au compte Google où tu veux recevoir les bilans.
2. « Nouveau projet » → colle le contenu de `ExportBilan.gs` (remplace tout).
3. (Recommandé) Mets une valeur secrète dans `TOKEN` (ex. `"evolve-8k2j..."`).
4. « Déployer » → « Nouveau déploiement » → type **Application Web** :
   - Exécuter en tant que : **Moi**
   - Qui a accès : **Tout le monde** (obligatoire — sinon l'app ne peut pas poster)
5. Autorise les accès demandés (Drive + Sheets) — l'écran « application non validée »
   est normal pour un script perso : Paramètres avancés → Accéder au projet.
6. Copie l'**URL d'application Web** (`https://script.google.com/macros/s/…/exec`).
   Si tu as mis un TOKEN : ajoute `?token=TA_VALEUR` à la fin.
7. Dans l'app : « Actions rapides » → « Bilan → Sheets » → colle cette URL (une seule fois).

## Pièges connus (vécus sur le script de réservation Atomea)

- **Toute modification du code exige un NOUVEAU déploiement** (ou « Gérer les déploiements »
  → modifier → nouvelle version). L'URL `/exec` ne sert que la version déployée, pas le brouillon.
- L'accès doit être « **Tout le monde** », pas « Tout le monde disposant d'un compte Google »
  (sinon la requête de l'app reçoit une page de login HTML).
- Premier appel parfois lent (~5-8 s, démarrage à froid) : c'est normal.

## Ce que fait le script

Reçoit `{name, sheets:[{name, rows[][]}]}`, crée un Google Sheet avec les 3 feuilles du bilan
(« Bilan séries », « Programme ajusté », « Lisez-moi (agent) »), le range dans le dossier
Drive « Evolve Bilans », et renvoie `{ok:true, url}` que l'app affiche (ouvrir / copier).
