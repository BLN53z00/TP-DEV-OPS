# Contribuer à DropZone

## Branches
Jamais de commit direct sur `main`. Nommage : `feat/...`, `fix/...`, `docs/...`, `chore/...`, `ci/...`, `test/...`.

## Commits
Format Conventional Commits : `type(portée optionnelle): description`.
Exemples : `feat: add drop countdown`, `fix(api): reject sold-out orders`.

## Cycle d'une pull request
1. Créer une branche depuis `main` à jour
2. Commiter, pousser, ouvrir une PR
3. Attendre que la CI soit verte (dès la partie 3)
4. Merger dans `main`, supprimer la branche

## Versions
Semver : `feat` = version mineure, `fix` = patch, changement cassant = majeure.
EOF