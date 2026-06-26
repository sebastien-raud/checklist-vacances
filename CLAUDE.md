# Checklist de vacances

## Objectifs

Application Web simple qui permet :

- de gérer une liste de choses à ne pas oublier pour un voyage
- mémoriser les données pour un voyage et pouvoir restaurer les données

## Structure

```
backend                // serveur d'API REST simple en PHP
├── data               // répertoire de stockage des données
└── index.php          // serveur d'API REST

frontend
├── lib                // bibliothèques
│   └── survey         // bibliothèque de gestion de formulaires
│       ├── survey.css // styles par défaut
│       ├── survey.js  // bibliothèque JavaScript
│       └── doc        // documentation sur l'usage de la bibliothèque
├── data               // données markdown du formulaire
│   └── checklist.md   // fichier de formulaire
├── app.js             // fichier JavaScript de gestion de l'application
├── app.css            // fichier styles de l'application
└── index.html         // fichier HTML de l'application
```

## Fonctionnement

### Backend

- API REST en PHP
- enregistrement des données au format JSON
  - dans le répertoire `/backend/data`
- seul point d'entrée : `/backend/index.php`

#### Description API

| Route           | Méthode HTTP | Action                                                                               |
| ---             | ---          | ---                                                                                  |
| `/auth`         | `POST`       | Connexion utilisateur. Données `{ login, password }`. Retourne un token.             |
| `/voyages`      | `GET`        | Liste des voyages. Token nécessaire.                                                 |
| `/voyages/{id}` | `GET`        | Données d'un voyage. Token nécessaire.                                               |
| `/voyages`      | `POST`       | Création d'un voyage. Données `{ data }` à enregistrer en JSON. Token nécessaire.    |
| `/voyages/{id}` | `PUT`        | Mise à jour d'un voyage. Données `{ data }` à enregistrer en JSON. Token nécessaire. |
| `/voyages/{id}` | `DELETE`     | Suppression d'un voyage. Token nécessaire.                                           |

#### Notes

Route `/auth` simple. Données utilisateur enregistrées dans un fichier `/data/auth.php` sous forme :

```php
<?php
return [
  { username, password_hash },
  { username, password_hash },
  ...
];
```

### Frontend

Simple, géré en JavaScript.

- Accueil : connexion si pas de token valide. Si OK : mémorisation token en localStorage.
- Liste des voyages + bouton "nouveau voyage"
- Nouveau voyage : champ de saisie de nom + formulaire voyage + bouton "Enregistrer"
- Voyage existant : nom du voyage + formulaire voyage avec données + bouton "Supprimer" + bouton "Enregistrer"

Formulaire voyage :

- utiliser la lib `survey`
- les données markdown sont dans le fichier `/frontend/data/checklist.md`
- utilisation de `getJSON()` pour récupérer les données au clique sur bouton "Enregistrer"
- restauration des données :
  - récupération via API REST
  - JavaScript pour population (populate) du formulaire.

Styles CSS :

- simple
- épuré
- responsive
