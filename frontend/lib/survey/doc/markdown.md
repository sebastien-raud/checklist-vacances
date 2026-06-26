# Détails de la syntaxe markdown étendue

Les quiz et sondages utilisent une syntaxe markdown étendue. Ce document présente les principales caractéristiques.

La syntaxe est présentée pour les quiz, les différences pour les sondages sont précisées.

## Sommaire

- [Détails de la syntaxe markdown étendue](#détails-de-la-syntaxe-markdown-étendue)
  - [Sommaire](#sommaire)
  - [Format markdown](#format-markdown)
    - [Configuration](#configuration)
    - [Personnaliser les questions : types de champs](#personnaliser-les-questions--types-de-champs)
      - [Champs `input` : saisie](#champs-input--saisie)
      - [Champs `checkbox` : case à cocher](#champs-checkbox--case-à-cocher)
      - [Champs `radio` : case de choix](#champs-radio--case-de-choix)
      - [Champs `select` : sélection](#champs-select--sélection)
    - [Personnaliser les champs](#personnaliser-les-champs)
      - [Attributs](#attributs)
      - [Indiquer la bonne réponse](#indiquer-la-bonne-réponse)
      - [Lier des libellés `label` aux champs](#lier-des-libellés-label-aux-champs)
    - [Options de configuration](#options-de-configuration)
      - [Globales : configuration du quiz](#globales--configuration-du-quiz)
      - [Locales : configuration par question](#locales--configuration-par-question)

---

## Format markdown

Le contenu markdown peut commencer par une configuration générale du quiz en YAML.

Les questions sont séparées par une ligne de 4 tirets `----`.

Exemple :

```markdown
----
# configuration
title: Le Web
----

## Question 1

Qui est l'inventeur du WWW ?

- (( ) Tim Broners-Lew)
- ((X) Tim Berners-Lee)
- (( ) Tim O-thea)
- (( ) Obi-Wan Kenobi)

----

## Question 2

Quelles sont les inventions à l'origine du Web ?

- [[X] Les URLs]
- [[ ] Les liens hypertextes]
- [[X] Le protocole HTTP]
- [[X] Le langage HTML]
```

Chaque question peut avoir sa propre configuration au format YAML dans un bloc compris entre trois tirets `---` situé en début de question :

```markdown
----
# configuration
title: Le Web
----

## Question 1

Qui est l'inventeur du WWW ?

- (( ) Tim Broners-Lew)
- ((X) Tim Berners-Lee)
- (( ) Tim O-thea)
- (( ) Obi-Wan Kenobi)

----

---
shuffleChoices: true
---

## Question 2

Quelles sont les inventions à l'origine du Web ?

- [[X] Les URLs]
- [[ ] Les liens hypertextes]
- [[X] Le protocole HTTP]
- [[X] Le langage HTML]
```

### Configuration

Les blocs de configuration sont au format YAML. C'est un sous-ensemble du YAML.

Les blocs de configuration sont situés en entête :

- du quiz
- des blocs de questions.

La configuration est optionnelle. Elle permet d'ajouter des options.

Un bloc de configuration est contenu entre deux lignes de 3 tirets `---`.

Exemple de configuration globale du quiz :

```markdown
---
title: Linux
shuffleQuestions: true
---

## Question 1

____{value="Linus"} Torvalds est l'inventeur du système d'exploitation 
{{ "": "", "unix": "UNIX", "(x)linux": "Linux", "macos": "macOS", "windows": "Windows" }}.
```

Exemple de configuration globale du quiz et des questions :

```markdown
---
title: Linux
shuffleQuestions: true
---

---
questionsType: dragAndDrop
---

## Question 1

____{value="Linus"} Torvalds est l'inventeur du système d'exploitation 
{{ "": "", "unix": "UNIX", "(x)linux": "Linux", "macos": "macOS", "windows": "Windows" }}.

----

---
questionsType: dragAndDrop
---

## Question 2

Complétez les trous :

____{value="Linux"} est un ____{value="système d’exploitation"} 
de type ____{value="UNIX"} créé en 1991 par ____{value="Linus"} Torvalds.

```

### Personnaliser les questions : types de champs

La syntaxe markdown étendue permet de gérer tous les types de champs HTML :

| Markdown                       | Description                          | Rendu HTML                                                  |
| ---                            | ---                                  | ---                                                         |
| `____`                         | Champ texte (input)                  | `<input type="text" id="input-1" name="input-1">`           |
| `____{#email type=email}`      | Input avec attributs                 | `<input type="email" id="email" name="email">`              |
| `____@email{#email}`           | Input avec type et attributs         | `<input type="email" id="email" name="email">`              |
| `____@textarea`                | Champ texte long (textarea)          | `<textarea id="input-1" name="input-1"></textarea>`         |
| `{{ "val": "Label" }}`         | Liste déroulante (select)            | `<select id="select-1" name="select-1">...</select>`        |
| `[[ ] Option]`                 | Case à cocher (checkbox)             | `<input type="checkbox" id="checkbox-1" name="checkbox-1">` |
| `(( ) Option)`                 | Bouton radio                         | `<input type="radio" id="radio-1" name="radio-1">`          |

#### Champs `input` : saisie

Les champs `input` (sauf `checkbox` et `radio`) commencent par 4 tirets-bas `____`.

Le type de champ par défaut est `text`.

On peut personnaliser le type de façon simple par la syntaxe `@type` :

- `____@text` : `<input type="text"`, champ texte simple
- `____@color` : `<input type="color"`, champ sélecteur de couleur
- `____@date` : `<input type="date"`, champ sélecteur de date
- `____@email` : `<input type="email"`, champ e-mail
- `____@number` : `<input type="number"`, champ numérique
- `____@password` : `<input type="password"`, champ mot de passe
- `____@tel` : `<input type="tel"`, champ numéro de téléphone
- `____@url` : `<input type="url"`, champ adresse Web
- `____@textarea` : `<textarea`, champ texte long

On peut indiquer la valeur de l'élément (la bonne réponse) par la syntaxe : `{value="bonne réponse"}`. Par exemple :

`____{value="Linux"}` indique un champ texte simple dont la bonne réponse est "Linux".

#### Champs `checkbox` : case à cocher

Les champs `checkbox` utilisent la syntaxe `[[ ] libellé]`.

Attention à bien respecter l'espace dans les crochets intérieurs :

- `[[ ] libellé]` 👌
- `[[] libellé]` ❌

Si la case à cocher contient la bonne valeur, on peut sélectionner la case avec un `x` (minuscule ou majuscule) :

- `[[x] libellé]`

Le libellé peut contenir du formatage markdown :

- `[[x] *operating system*]`

Les cases à cocher peuvent-être dans un même bloc (paragraphe, liste). Dans ce cas elles sont liées (même nom).

#### Champs `radio` : case de choix

Les champs `radio` utilisent la syntaxe `(( ) libellé)`.

Attention à bien respecter l'espace dans les parenthèses intérieures :

- `(( ) libellé)` 👌
- `(() libellé)` ❌

Si la case de choix contient la bonne valeur, on peut sélectionner la case avec un `x` (minuscule ou majuscule) :

- `((x) libellé)`

Le libellé peut contenir du formatage markdown :

- `((x) *operating system*)`

Les cases de choix peuvent-être dans un même bloc (paragraphe, liste). Dans ce cas elles sont liées (même nom).

#### Champs `select` : sélection

Les champs de sélection utilisent la syntaxe `{{ "valeur1": "Libellé 1", "valeur2": "Libellé 2" }}`.

Le champ est compris entre deux paires d'accolades ouvrantes-fermantes.

Les couples valeur-libellé sont séparés par des virgules.

La valeur est séparée du libellé par le caractère deux-points `:`.

La valeur et le libellé doivent être entre double-quotes `"` ou simple-quote `'`.

On peut indiquer la bonne valeur par la syntaxe `(x)` au début de la valeur : `{{ "": "&nbsp;", "(x)us": "Ubuntu Server", "lm": "Linux Mint", "kl": "Kali Linux", "mj": "Manjaro" }}`.  
Ici la bonne réponse est la valeur "us" (libellé "Ubuntu Server").

### Personnaliser les champs

#### Attributs

Le système donne par défaut des propriétés aux champs (nom `name`, identifiant `id`).

Tout est personnalisable en utilisant, à la suite du champ, la syntaxe `{attribut1="valeur1", attribut2="valeur2"}`.

On peut utiliser les attributs HTML classiques.

Les raccourcis de syntaxe `#id` et `.class` sont disponibles.

Exemples :

```markdown
Donner le nom du créateur de Linux : 
____{#linuxAuthor, .sm-text, value="Linus Torvalds"}
```

Donne le code :

```html
<p>
  Donner le nom du créateur de Linux :
  <input type="text" id="linuxAuthor" class="sm-text" value="Linus Torvalds">
</p>
```

Cette syntaxe est disponible pour tous les éléments.

#### Indiquer la bonne réponse

| Type de champ               | Syntaxe de bonne réponse       |
| ---                         | ---                            |
| Saisie / `input`            | `{value="réponse"}`            |
| Case à cocher / `checkbox`  | `[[x] libellé]`                |
| Case de choix / `radio`     | `((x) libellé)`                |
| Sélection / `select`        | `{{ "(x)valeur": "libellé" }}` |

> [!NOTE]
> La bonne réponse ne s'affiche pas dans le rendu HTML visible par l'utilisateur. Mais elle est utilisée par le système pour évaluer la réponse de l'utilisateur.

> [!NOTE]
> Cette syntaxe est également utilisable dans les sondages pour indiquer une valeur par défaut.

#### Lier des libellés `label` aux champs

Avec les champs `checkbox` et `radio` les libellés sont automatiquement liés aux champs :

```markdown
- [[x] Linux]
- [[ ] UNIX]
- [[ ] macOS]
```

Donne le code HTML final :

```html
<ul>
  <li>
    <label>
      <input type="checkbox" id="checkbox-1" name="checkbox-group-1[]"> 
      Linux
    </label>
  </li>
  <li>
    <label>
      <input type="checkbox" id="checkbox-2" name="checkbox-group-1[]"> 
      UNIX
    </label>
  </li>
  <li>
    <label>
      <input type="checkbox" id="checkbox-3" name="checkbox-group-1[]"> 
      macOS
    </label>
  </li>
</ul>
```

Pour lier un champ de saisie `input` ou un champ de sélection `select` à un libellé il faut utiliser la syntaxe `libellé = ____`.

La suite de caractères espace ` `, égale `=`, espace ` ` entre le libellé et le champ (`input` ou `select`) permet de faire le lien.

Exemple :

```markdown
Le super-utilisateur sous Linux s’appelle = ____{value="root"}.
```

Donne le code HTML final :

```html
<p>
  <label>
    Le super-utilisateur sous Linux s’appelle 
    <input type="text" id="input-1" name="input-1">
  </label>.
</p>
```

Ou encore :

```markdown
Cette distribution est principalement orientée serveur : = {{ "": "&nbsp;", "(x)us": "Ubuntu Server", "lm": "Linux Mint", "kl": "Kali Linux", "mj": "Manjaro" }}.
```

Donne le code HTML final :

```html
<p>
  <label>
    Cette distribution est principalement orientée serveur : 
    <select id="select-1" name="select-1">
      <option value="">&nbsp;</option>
      <option value="us">Ubuntu Server</option>
      <option value="lm">Linux Mint</option>
      <option value="kl">Kali Linux</option>
      <option value="mj">Manjaro</option>
    </select>
  </label>.
</p>
```

> [!NOTE]
> C'est une bonne pratique d'accessibilité de lier les libellés aux champs.

### Options de configuration

#### Globales : configuration du quiz

- title : titre du quiz, optionnel
- uid : identifiant unique du quiz, optionnel
- version : version du quiz, optionnel

Si une des options de configuration est indiquée, elle est reportée dans le schéma JSON de l'utilisateur.

Exemple de configuration globale :

```markdown
---
title: Linux et le Web
uid: dqskglmds-01-fqs-01
version: 1.1
---

## Question 1

Quelle est...
```

#### Locales : configuration par question

Par défaut il n'y a pas de configuration par question.
