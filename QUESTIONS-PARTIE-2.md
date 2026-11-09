# Partie 2 : Réponses aux questions

## 1. Pourquoi copier les fichiérs de dépendances avant le code ? Que devient le cache des couches quand on modifie une ligne de code ?

Docker met en cache chaque couche de l'image. On copie donc d'abord les fichiers de dépendance pour éviter de les réinstaller aà chaque modification de code.

## 2. Que contient l'image finale de l'API ?

L'image finale contient : 
    - Python et ses dépendances.
    - Le code de l'API.
    - Un utilisateur non-root (app).
Les tests, le cache pip et le ".env" local sont exclus car ils sont inutiles en production.

Le multi-stage permet de garder uniquement les éléments nécéssaires.

## 3. Pourquoi éviter le root ? Pourquoi nginx écoute sur 8080 et pas sur 0080 ?

    - ROOT : Limiter les droit du conteur réduit les risque en cas d'attaque (Principe du moindre privilège).

    - Port 8080 : Les ports inférieur à 1024 nécessitent des privilèges élevés sous LINUX.

 ## 4. Comment l'API trouve-t-elle la base dans Compose ? Pourquoi localhost ne marche pas entre conteneurs ?

 Docker compose utilise un réseau partagé où chaque service est accessible par son nom.

 L'API utilise donc "db:5432" pour joindre PostgreSQL

 "localhost" ne fonctionne pas car il désigne uniquement le conteneur actuel.

 ## 5. Comment l'API trouve-t-elle la base dans Compose ? Pourquoi localhost ne marche pas entre conteneurs ?

 L'API risque de ne pas réussir à se connecter et de planter

 Pour évité cela, on utilise : 
    - Healthcheck : vérifie que PostgreSQL est prêt.
    - Depends_on : attend que la base soit déclarée "healthy" avant de démarrer l'API.

## 6. Où sont stockées les données après l'arrèt de la stack ?

Les données sont stockées dans le volume Docker "db-data".
    -"docker compose down" :  les conteneurs sont supprimés mais les données sont conservées.
    - "docker compose down -v" : les volumes sont supprimés et les données sont perdues.
Au redémarrage, la base est donc vide si le volume a été supprimé.  