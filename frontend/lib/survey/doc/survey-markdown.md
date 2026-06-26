# survey-markdown — Documentation

## Sommaire

- [survey-markdown — Documentation](#survey-markdown--documentation)
  - [Sommaire](#sommaire)
  - [Usage](#usage)
    - [API JavaScript](#api-javascript)
    - [userData](#userdata)
  - [Format markdown](#format-markdown)
    - [Types de champs disponibles](#types-de-champs-disponibles)
  - [Configuration](#configuration)
    - [Globale](#globale)
    - [Par question](#par-question)
  - [CSS](#css)
  - [Plugins](#plugins)

---

## Usage

Inclure le composant :

```html
<head>
    <script type="module" src="./dist/survey-markdown/survey.js"></script>
</head>
```

Trois modes d'utilisation :

**Inline** :

```html
<survey-markdown>
    <script type="text/markdown">
## Êtes-vous satisfait ?

- (( ) Oui)
- (( ) Non)
  </script>
</survey-markdown>
```

**Depuis un fichier** :

```html
<survey-markdown src="./survey1.md"></survey-markdown>
```

**Par JavaScript** :

```html
<survey-markdown id="survey"></survey-markdown>
<script>
    const survey = document.getElementById('survey');
    survey.setMarkdown(`## Question`);
</script>
```

Toutes les questions sont affichées simultanément sur une seule page. Un bouton **Envoyer** en bas collecte les réponses.

### API JavaScript

| Méthode / propriété | Description                               |
| ---                 | ---                                       |
| `use(plugin)`       | Enregistre un ou plusieurs plugins        |
| `setMarkdown(md)`   | Charge un contenu markdown                |
| `reset(resetAll?)`  | Relance le sondage                        |
| `getJSON()`         | Retourne `userData` (réponses collectées) |
| `submit()`          | Soumet le sondage par programme           |
| Événement `submit`  | Déclenché à la soumission du sondage      |

### userData

```javascript
{
  uid: "...",        // identifiant défini en config
  title: "...",      // titre défini en config
  version: "...",    // version définie en config
  totalQuestions: 5, // nombre total de questions
  answers: [         // tableau indexé par question
    {
        "input-1": "valeur saisie"
    },
    {
        "checkbox-group-1": ["val1", "val2"]
    },
    ...
  ]
}
```

---

## Format markdown

Le format est **identique à celui de `quiz-markdown`** : mêmes champs, même syntaxe YAML, même séparateur `----` .

La différence principale : il n'y a pas de notion de bonne réponse. Les marqueurs `{value="..."}` , `[[x] ...]` et `((x) ...)` peuvent être présents pour indiquer des valeurs par défaut.

```markdown
---
title: Sondage de satisfaction
uid: survey-satisfaction-001
version: 1.0
---

## Comment évaluez-vous votre expérience ?

- (( ) Très satisfait)
- (( ) Satisfait)
- (( ) Neutre)
- (( ) Insatisfait)

----

## Quels aspects avez-vous appréciés ?

- [[ ] Facilité d'utilisation]
- [[ ] Rapidité]
- [[ ] Support]

----

## Commentaires

____@textarea
```

### Types de champs disponibles

Identiques à `quiz-markdown` — voir [`doc/quiz-markdown.md`](./quiz-markdown.md#types-de-champs).

---

## Configuration

### Globale

Bloc YAML en tête de document, délimité par `---` .

| Clé           | Description                                            |
| ---           | ---                                                    |
| `title`       | Titre du sondage                                       |
| `uid`         | Identifiant unique                                     |
| `version`     | Numéro de version                                      |
| `i18n.submit` | Libellé du bouton d'envoi (défaut : `Envoyer` )        |
| `i18n.sent`   | Message de confirmation (défaut : `Sondage envoyé !` ) |

Exemple :

```markdown
---
title: Enquête utilisateurs
uid: enquete-001
version: 2.0
i18n:
  submit: Valider mes réponses
  sent: Merci pour votre participation !
---
```

### Par question

Bloc YAML en début de bloc de question, délimité par `---` .

Dépend des plugins actifs.

---

## CSS

Sélecteur de base : `survey-markdown` .

```css
survey-markdown {
  ...
}

survey-markdown article {
  ...
}

survey-markdown form {
  ...
}

survey-markdown [data-type="questions"]>button {
  ...
}

/* bouton Envoyer */
survey-markdown [data-type="questions"]>p {
  ...
}

/* message de confirmation */
```

Un exemple de CSS de démarrage est disponible dans [`styles/survey.css`](../styles/survey.css).

---

## Plugins

Le système de plugins de `survey-markdown` est identique à celui de `quiz-markdown` — voir [`doc/plugins.md`](./plugins.md).

Les hooks disponibles sont adaptés au cycle de vie du sondage :

| Hook                         | Quand                                     |
| ---                          | ---                                       |
| `beforeLoad` / `afterLoad`   | Avant/après le chargement complet         |
| `beforeParse` / `afterParse` | Avant/après le parsing du markdown        |
| `beforePrepareHtmlQuestions` | Avant la construction des articles HTML   |
| `afterPrepareHtmlQuestions`  | Après la construction des articles HTML   |
| `beforeDisplaySurvey`        | Avant l'affichage de toutes les questions |
| `afterDisplaySurvey`         | Après l'affichage de toutes les questions |
| `beforeSubmit`               | Avant la collecte des réponses            |
| `afterSubmit`                | Après la collecte des réponses            |
| `beforeDestroy`              | Avant la suppression du composant         |
| `addCSS`                     | Injection de CSS par le plugin            |

> [!NOTE]
> Par défaut, toutes les questions sont sur une seule page. Un futur plugin "multi-pages" pourra modifier ce comportement via les hooks `beforeDisplaySurvey` / `afterDisplaySurvey` .
