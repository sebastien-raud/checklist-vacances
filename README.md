# Checklist Vacances

Application web pour gérer et sauvegarder une checklist de voyage en famille.  
Chaque voyage est nommé, rempli, puis sauvegardé et consultable à tout moment.

---

## Fonctionnalités

- Connexion sécurisée par token (24 h)
- Liste de voyages sauvegardés
- Création, modification et suppression de voyages
- Checklist interactive par famille (documents, vêtements, hygiène, électronique…)
- Restauration complète des réponses d'un voyage existant
- Interface responsive, sans dépendance externe

---

## Stack

| Couche    | Technologie                            |
| --------- | -------------------------------------- |
| Backend   | PHP (API REST, fichiers JSON)          |
| Frontend  | HTML + CSS + JavaScript vanilla        |
| Composant | `survey-markdown` (web component maison) |

---

## Structure

```
backend/
├── data/
│   ├── auth.php          # Utilisateurs (username + password_hash)
│   ├── tokens.json       # Tokens actifs
│   └── voyages/          # Un fichier JSON par voyage
└── index.php             # Point d'entrée de l'API REST

frontend/
├── lib/survey/           # Web component survey-markdown
│   ├── survey.js
│   ├── survey.css
│   └── doc/              # Documentation de la bibliothèque
├── data/
│   └── checklist.md      # Définition du formulaire (Markdown)
├── app.js                # Logique applicative
├── app.css               # Styles
└── index.html            # Page unique
```

---

## Installation

### Prérequis

- Serveur web avec PHP 8+
- Droits d'écriture sur `backend/data/`

### Déploiement

1. Cloner ou copier le projet dans le répertoire web :
   ```bash
   git clone <repo> /var/www/html/dev/todolist-vacances
   ```

2. S'assurer que le répertoire de données est accessible en écriture :
   ```bash
   chmod 775 backend/data
   ```

3. Configurer les utilisateurs dans `backend/data/auth.php` :
   ```php
   <?php
   return [
       ['username' => 'admin', 'password_hash' => password_hash('monMotDePasse', PASSWORD_DEFAULT)],
   ];
   ```

4. Vérifier l'URL de l'API dans `frontend/app.js` (ligne 1) :
   ```js
   const API = 'http://localhost/dev/todolist-vacances/backend/index.php';
   ```

---

## API REST

Tous les endpoints (sauf `/auth`) nécessitent un header `Authorization: Bearer <token>`.

| Route             | Méthode  | Description                                     |
| ----------------- | -------- | ----------------------------------------------- |
| `/auth`           | `POST`   | Connexion. Corps : `{ login, password }`         |
| `/voyages`        | `GET`    | Liste des voyages (triés par date de modification) |
| `/voyages`        | `POST`   | Créer un voyage. Corps : `{ name, data }`        |
| `/voyages/{id}`   | `GET`    | Détails d'un voyage                             |
| `/voyages/{id}`   | `PUT`    | Mettre à jour un voyage. Corps : `{ name, data }` |
| `/voyages/{id}`   | `DELETE` | Supprimer un voyage                             |

### Exemple — connexion

```bash
curl -X POST http://localhost/dev/todolist-vacances/backend/index.php/auth \
  -H "Content-Type: application/json" \
  -d '{"login":"admin","password":"monMotDePasse"}'
# → {"token":"abc123..."}
```

---

## Checklist

Le formulaire est défini dans `frontend/data/checklist.md` au format `survey-markdown`.  
Il suffit d'éditer ce fichier pour modifier les sections et les champs.

Sections actuelles :
- Documents (passeport, billet, permis, carte bancaire…)
- Vêtements
- Hygiène et santé
- Électronique
- Avant de partir
- Notes libres

### Ajouter un champ checkbox

```markdown
- [[ ] Mon nouvel élément]
```

### Ajouter une colonne par personne dans un tableau

```markdown
| Élément | Prénom |
| ---     | :---:  |
| Chose   | [[ ] &nbsp;] |
```

Voir `frontend/lib/survey/doc/survey-markdown.md` pour la documentation complète.

---

## Données

Chaque voyage est stocké dans un fichier `backend/data/voyages/<id>.json` :

```json
{
  "name": "Barcelone 2025",
  "data": {
    "uid": "checklist-vacances-001",
    "answers": [...]
  }
}
```

Les tokens actifs sont conservés dans `backend/data/tokens.json` et expirés automatiquement après 24 h.
