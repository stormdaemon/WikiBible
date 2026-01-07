"""
Script de backup de la base de données Supabase
Dump toutes les tables dans un fichier SQL
"""

import os
import sys
import subprocess
from dotenv import load_dotenv

load_dotenv(dotenv_path='.env.local')

SUPABASE_URL = os.getenv('NEXT_PUBLIC_SUPABASE_URL', '')
SUPABASE_PASSWORD = os.getenv('SUPABASE_SERVICE_ROLE_KEY', '')

if not SUPABASE_URL:
    print("❌ Erreur: NEXT_PUBLIC_SUPABASE_URL manquant")
    sys.exit(1)

# Extraire les infos de connexion depuis l'URL
# Format: postgresql://postgres:[password]@[host]:[port]/[database]
if 'postgresql://' in SUPABASE_URL:
    # Supabase utilise le format: postgresql://postgres.xxxx:password@host:port/database
    import re
    match = re.search(r'postgresql://postgres\.([^:]+):([^@]+)@([^:]+):(\d+)/(.+)', SUPABASE_URL)
    if match:
        project_id, password, host, port, database = match.groups()
    else:
        print("❌ Erreur: Format URL Supabase non reconnu")
        sys.exit(1)
else:
    print("❌ Erreur: Format URL non reconnu")
    sys.exit(1)

# Créer le nom de fichier avec timestamp
from datetime import datetime
timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
backup_file = f'wikibible_backup_{timestamp}.sql'

print(f"📦 Backup de WikiBible")
print(f"   Base: {database}")
print(f"   Hôte: {host}")
print(f"   Fichier: {backup_file}")
print("=" * 70)

# Utiliser pg_dump (disponible avec PostgreSQL)
try:
    # Commande pg_dump
    cmd = [
        'pg_dump',
        f'postgresql://postgres.{project_id}:{password}@{host}:{port}/{database}',
        '--format=plain',
        '--no-owner',
        '--no-acl',
        '--verbose',
        '--file=' + backup_file
    ]

    print("🚀 Lancement de pg_dump...")
    result = subprocess.run(cmd, capture_output=True, text=True)

    if result.returncode == 0:
        file_size = os.path.getsize(backup_file) / (1024 * 1024)  # Size in MB
        print(f"✅ Backup réussi !")
        print(f"   Fichier: {backup_file}")
        print(f"   Taille: {file_size:.2f} MB")
        print(f"\n💡 Pour restaurer:")
        print(f"   psql {database} < {backup_file}")
    else:
        print(f"❌ Erreur lors du backup:")
        print(result.stderr)
        sys.exit(1)

except FileNotFoundError:
    print("❌ pg_dump n'est pas installé.")
    print("💡 Solution alternative: utiliser pg_dump depuis Docker:")
    print(f"   docker run --rm -v %s:/data postgres:15 pg_dump")
    sys.exit(1)
except Exception as e:
    print(f"❌ Erreur: {e}")
    sys.exit(1)
