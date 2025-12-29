"""
Script pour exécuter l'import SQL par lots via l'API Supabase
Contourne les limitations RLS en utilisant les batches de l'API REST
"""

import os
import requests
from dotenv import load_dotenv

load_dotenv('.env.local')

SUPABASE_URL = os.getenv('NEXT_PUBLIC_SUPABASE_URL')
SUPABASE_KEY = os.getenv('NEXT_PUBLIC_SUPABASE_ANON_KEY')

def main():
    print('📖 Exécution de l\'import SQL par lots...\n')

    with open('bible-import.sql', 'r', encoding='utf-8') as f:
        sql_lines = f.readlines()

    total = len(sql_lines)
    batch_size = 1000

    print(f'📊 {total} instructions SQL à exécuter')
    print(f'📦 Taille du lot: {batch_size}\n')

    success = 0
    errors = 0

    for i in range(0, total, batch_size):
        batch = sql_lines[i:i + batch_size]
        batch_num = i // batch_size + 1
        total_batches = (total + batch_size - 1) // batch_size

        # Exécuter chaque instruction individuellement
        for sql_line in batch:
            try:
                response = requests.post(
                    f'{SUPABASE_URL}/rest/v1/rpc/exec_sql',
                    headers={
                        'Content-Type': 'application/json',
                        'apikey': SUPABASE_KEY,
                        'Authorization': f'Bearer {SUPABASE_KEY}'
                    },
                    json={'sql': sql_line.strip()},
                    timeout=60
                )

                if response.status_code in [200, 201]:
                    success += 1
                else:
                    print(f'⚠️  Batch {batch_num}/{total_batches} - Status: {response.status_code}')
                    errors += 1

            except Exception as e:
                print(f'❌ Erreur batch {batch_num}: {e}')
                errors += 1

        if batch_num % 5 == 0:
            print(f'✅ Progression: {i + len(batch)}/{total} instructions ({success} succès, {errors} erreurs)')

    print(f'\n✨ Import terminé!')
    print(f'   ✅ Succès: {success}')
    print(f'   ❌ Erreurs: {errors}')

if __name__ == '__main__':
    main()
