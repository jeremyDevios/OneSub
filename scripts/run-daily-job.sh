#!/bin/bash

# 1. Se placer dans le dossier du projet (le dossier parent de ce script)
cd "$(dirname "$0")/.."

# 2. Définir le chemin absolu vers la clé (nécessaire pour Cron)
export GOOGLE_APPLICATION_CREDENTIALS="$(pwd)/service-account.json"

# 3. Exécuter le script
# On utilise le chemin complet vers npx si possible, ou on suppose qu'il est dans le PATH
# Redirection des logs vers un fichier pour le débogage
echo "Exécution du job de notification : $(date)" >> notifications.log
npx ts-node -O '{"module":"commonjs"}' scripts/send-notifications.ts >> notifications.log 2>&1
