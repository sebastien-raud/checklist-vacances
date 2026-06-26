# Compte-rendu — Checklist Vacances

## Ce qui a été réalisé

Application Web complète de gestion de checklist de voyage, conforme aux spécifications de `CLAUDE.md`.

---

## Structure créée

```
backend/
├── data/
│   ├── auth.php          // utilisateurs (admin/admin)
│   ├── tokens.json       // tokens actifs (généré à l'usage)
│   └── voyages/          // un fichier JSON par voyage
└── index.php             // API REST

frontend/
├── lib/survey/           // bibliothèque fournie (inchangée)
├── data/
│   └── checklist.md      // checklist en 6 sections
├── index.html
├── app.js
└── app.css
```

---

## Backend — `backend/index.php`

API REST PHP avec routage via `PATH_INFO`.

| Route              | Méthode  | Action                        |
|--------------------|----------|-------------------------------|
| `/auth`            | `POST`   | Connexion → retourne un token |
| `/voyages`         | `GET`    | Liste des voyages             |
| `/voyages`         | `POST`   | Création d'un voyage          |
| `/voyages/{id}`    | `GET`    | Données d'un voyage           |
| `/voyages/{id}`    | `PUT`    | Mise à jour d'un voyage       |
| `/voyages/{id}`    | `DELETE` | Suppression d'un voyage       |

**Authentification** : token Bearer généré avec `random_bytes(32)`, stocké dans `data/tokens.json`, expiration 24h.

**Stockage** : chaque voyage est un fichier `data/voyages/{id}.json` contenant `{ name, data }` où `data` est le résultat de `getJSON()`.

**Utilisateurs** : définis dans `data/auth.php` avec hash bcrypt (`password_hash`).

Identifiants par défaut : `admin` / `admin`.

---

## Frontend

### `data/checklist.md`

Checklist en 6 sections avec des cases à cocher (`[[ ] item]`) et un champ notes (`____@textarea`) :

1. Documents
2. Vêtements
3. Hygiène et santé
4. Électronique
5. Avant de partir
6. Notes

Configurée avec `i18n.submit: Enregistrer` et `i18n.sent: "Voyage enregistré !"` pour intégrer le bouton de soumission de la lib `survey`.

### `app.js`

Trois vues gérées en JS pur : connexion, liste, formulaire voyage.

**Points techniques notables :**

- `setMarkdown()` est **synchrone** dans la lib `survey` : le formulaire est dans le DOM immédiatement après l'appel, sans besoin d'attente asynchrone.
- `getJSON()` n'est disponible qu'**après** soumission du formulaire (la lib collecte les données dans `userData` uniquement au clic sur le bouton). Le bouton natif de `<survey-markdown>` (renommé "Enregistrer" via i18n) déclenche l'événement `submit` sur l'élément — on récupère les données dans ce handler avec `getJSON()`, puis on sauvegarde via l'API.
- **Populate** : les cases à cocher ont pour `value` leur **indice** dans le groupe (0, 1, 2…), tel que défini dans le source de la lib.

- **Bug corrigé — noms d'éléments non stables entre deux `setMarkdown()`** : le parseur markdown (`ks`) est une instance globale créée une seule fois au chargement du module. Les compteurs qui génèrent les noms (`checkbox-group-1`, `checkbox-group-2`…) s'incrémentent à chaque appel à `setMarkdown()` sans jamais se réinitialiser. Ainsi, les noms du formulaire à la première ouverture d'un voyage diffèrent de ceux à la réouverture, ce qui rendait le populate inopérant.

  **Solution** : `populateSurvey()` n'utilise plus les noms pour chercher les éléments. Elle exploite la **position** : `answers[i]` (indexé par question) est apparié à l'article `i` du survey, et les valeurs de `answers[i]` (dans leur ordre JSON d'insertion) sont appariées aux éléments du formulaire de cet article (dans leur ordre DOM). La structure du checklist étant toujours identique, cet ordre est stable indépendamment des numéros générés.

### `app.css`

Design épuré, responsive, cohérent avec les variables CSS de `survey.css`.

---

## Accès

- URL : `http://localhost/dev/todolist-vacances/frontend/`
- Identifiants : `admin` / `admin`
