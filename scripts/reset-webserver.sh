#!/usr/bin/env bash
set -euo pipefail

if [ "$(id -u)" -ne 0 ]; then
  echo "Exécute ce script avec sudo."
  exit 1
fi

echo "Arrêt des services web..."

systemctl stop nginx apache2 2>/dev/null || true
systemctl disable nginx apache2 2>/dev/null || true

echo "Désinstallation de Nginx et Apache..."

apt-get purge -y 'nginx*' 'apache2*'

echo "Nettoyage des dépendances inutilisées..."

apt-get autoremove -y

echo "Réinitialisation terminée."
