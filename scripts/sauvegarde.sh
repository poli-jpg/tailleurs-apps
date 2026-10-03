#!/bin/bash
# Sauvegarde de la base Supabase (structure + données) dans ~/Sauvegardes-Atelier
# Usage : ./scripts/sauvegarde.sh   (le mot de passe de la base est demandé)
set -e
HOTE="aws-1-eu-west-1.pooler.supabase.com"
UTILISATEUR="postgres.ikaorfwdphwmysfosizg"

read -s -p "Mot de passe de la base : " PGPASSWORD; echo
export PGPASSWORD

DOSSIER="$HOME/Sauvegardes-Atelier"
mkdir -p "$DOSSIER"
FICHIER="$DOSSIER/atelier-$(date +%Y-%m-%d_%H%M).dump"

pg_dump -h "$HOTE" -p 5432 -U "$UTILISATEUR" -d postgres \
  --format=custom --no-owner --no-privileges \
  --schema=public --schema=auth --schema=storage -f "$FICHIER"
unset PGPASSWORD

echo "✅ Sauvegarde créée : $FICHIER ($(du -h "$FICHIER" | cut -f1))"

# On garde les 30 sauvegardes les plus récentes
ls -1t "$DOSSIER"/*.dump 2>/dev/null | tail -n +31 | while read -r ancien; do rm -- "$ancien"; done
