# Partie 1 : réponses aux questions

## 1. Que se passe-t-il si quelqu'un pousse directement un code cassé sur `main` ? Comment l'empêcher ?

`main` est la branche de référence : c'est elle qu'on tague, qu'on déploie et dont chaque nouveau développeur part. Un push direct de code cassé, sans relecture ni vérification, a plusieurs conséquences :

- tous les développeurs qui récupèrent `main` héritent du code cassé ;
- une release ou un déploiement lancé depuis `main` publie la panne ;
- il devient difficile de savoir quel commit a introduit le problème et qui l'a validé.

**Comment l'empêcher :** protéger la branche `main` (Settings → Branches, ou Rulesets) :

- exiger une **pull request** avant tout merge, donc pas de push direct ;
- appliquer la règle **aux administrateurs aussi** (sinon le propriétaire du dépôt peut la contourner) ;
- à partir de la partie 3, exiger que les **jobs de la CI soient verts** avant de pouvoir merger.

Le workflow de référence est le **GitHub Flow** : une branche par changement, une PR, une vérification, puis le merge.

## 2. Quels fichiers ne doivent jamais être commités ? Le `.gitignore` les couvre-t-il tous ?

Ne doivent jamais être commités :

| Catégorie | Exemples | Pourquoi |
|---|---|---|
| **Secrets et configuration locale** | `.env`, clés API, mots de passe, certificats | Une fois poussés, ils restent dans l'historique Git, même après suppression |
| **Dépendances installées** | `node_modules/`, `.venv/` | Lourdes, reconstructibles depuis `package.json` et `requirements.txt` |
| **Artefacts de build** | `dist/`, `build/`, `__pycache__/`, `*.pyc` | Générés, spécifiques à la machine |
| **Rapports et caches d'outils** | `.pytest_cache/`, `.ruff_cache/`, `coverage/`, `playwright-report/`, `test-results/` | Générés à chaque exécution |
| **Fichiers d'éditeur ou d'OS** | `.vscode/` (selon les cas), `.idea/`, `.DS_Store` | Propres à chaque poste |

On commite en revanche un **`.env.example`** avec des valeurs d'exemple (jamais de vrais secrets), pour documenter les variables nécessaires.

**Le `.gitignore` les couvre-t-il tous ?** Oui, pour l'essentiel. Le `.gitignore` du dépôt contient :

- les secrets : `.env` et `.env.act`, avec l'exception `!.env.example` pour garder le fichier d'exemple ;
- Python : `.venv/`, `venv/`, `__pycache__/`, `*.py[cod]`, `.pytest_cache/`, `.ruff_cache/`, `.coverage`, `htmlcov/`, `*.db` ;
- Node et front : `node_modules/`, `dist/`, `coverage/`, `playwright-report/`, `test-results/`, `*.tsbuildinfo` ;
- éditeurs et système : `.idea/`, `.vscode/*` (sauf `extensions.json`), `.DS_Store`, `*.log`.

Vérification faite avec `git ls-files | grep -i env` : seul `frontend/src/vite-env.d.ts` ressort. C'est un fichier de types TypeScript, pas un fichier de secrets, donc aucun `.env` n'est suivi par Git.

Limite : un `.gitignore` n'agit que sur les fichiers **pas encore suivis**. Si un secret avait déjà été commité, l'ignorer ne suffirait plus : il faudrait le **révoquer** (changer le mot de passe ou la clé), puis le retirer de l'historique.

## 3. Quelle différence entre un tag léger et un tag annoté ? Lequel pour une version ?

- **Tag léger** (`git tag v0.1.0`) : un simple pointeur vers un commit, sans métadonnées.
- **Tag annoté** (`git tag -a v0.1.0 -m "message"`) : un objet Git à part entière, qui contient l'auteur, la date, un message, et peut être signé.

**Pour une version, on utilise un tag annoté** : il garde la trace de qui a publié la version, quand et pourquoi, et c'est celui que privilégient les outils de release (`git describe`, par exemple, ne prend en compte que les tags annotés par défaut).

## 4. Un nouveau bouton, c'est un `feat` ou un `fix` ? Quel numéro de version change ?

C'est un **`feat`** : on ajoute une fonctionnalité qui n'existait pas. Un `fix` corrige un comportement qui ne marchait pas comme prévu.

Avec le versionnage sémantique (**semver**, `MAJEUR.MINEUR.CORRECTIF`) :

| Type de changement | Numéro qui change | Exemple |
|---|---|---|
| `fix` : correction de bug | **Correctif** (patch) | 0.1.0 → 0.1.1 |
| `feat` : nouvelle fonctionnalité compatible | **Mineur** (minor) | 0.1.0 → 0.2.0 |
| Changement qui casse la compatibilité (`feat!`, `BREAKING CHANGE`) | **Majeur** (major) | 0.1.0 → 1.0.0 |

Un nouveau bouton fait donc passer, par exemple, de `0.1.0` à `0.2.0`.
