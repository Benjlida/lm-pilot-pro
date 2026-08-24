# LM Pilot Pro UAD — Pack PWA installable

Ce dossier contient la couche PWA de LM Pilot Pro. Le moteur métier et les données restent dans Google Apps Script.

## URL Apps Script utilisée

https://script.google.com/a/macros/leroymerlin.fr/s/AKfycbxnVjiuKP8PbK86oAwpYb1K7_wgyCt73jN6BHemP2CRfv9QuA7u7uA7B3de_A3kf5eX/exec

## Fichiers

- `index.html` : coque installable plein écran qui affiche LM Pilot.
- `manifest.webmanifest` : nom, mode standalone, icônes et raccourcis.
- `service-worker.js` : cache de la coque PWA et page de secours.
- `offline.html` : message hors connexion.
- `icons/` : icônes 192, 512 et maskable.
- `firebase.json` : configuration facultative pour Firebase Hosting.

## Option A — GitHub Pages

1. Créer un dépôt GitHub, par exemple `lm-pilot-pro`.
2. Envoyer le contenu de ce dossier à la racine du dépôt.
3. Dans GitHub : Settings > Pages.
4. Source : `Deploy from a branch`.
5. Branche : `main`, dossier `/root`.
6. Attendre l'URL HTTPS fournie par GitHub Pages.
7. Ouvrir cette URL dans Microsoft Edge ou Chrome.
8. Cliquer sur Installer l'application.

Important : si le compte Google d'entreprise bloque l'ouverture dans l'iframe, utiliser le bouton "Ouvrir LM Pilot" de secours.

## Option B — Firebase Hosting

Pré-requis : Node.js et Firebase CLI autorisés.

```bash
npm install -g firebase-tools
firebase login
firebase init hosting
firebase deploy
```

Lors de `firebase init hosting`, utiliser ce dossier comme dossier public et ne pas écraser `index.html`.

## Installation sur Windows

Une fois la PWA publiée sur une adresse HTTPS :

- Microsoft Edge : menu `...` > Applications > Installer LM Pilot Pro UAD.
- Chrome : icône d'installation dans la barre d'adresse ou menu > Installer LM Pilot Pro UAD.

Ensuite l'application peut être épinglée au Bureau, au menu Démarrer et à la barre des tâches.

## Raccourcis intégrés

Le manifeste expose :
- Pilotage du jour
- Affichage équipe TV
- Dashboard Performance

## Limite hors connexion

La coque de l'application peut s'ouvrir hors connexion, mais les données LM Pilot restent en ligne car elles proviennent de Google Apps Script et de Google Sheets.
