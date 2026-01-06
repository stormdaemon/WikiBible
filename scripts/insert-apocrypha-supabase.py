"""
Script d'insertion des données apocryphes dans Supabase
Utilise les données traduites générées par import-apocrypha-mcp.py
"""

import os
import sys
import json
import time
from typing import Dict, List
import requests

# Fix Windows console encoding
if sys.platform == 'win32':
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8')

from dotenv import load_dotenv
load_dotenv()

SUPABASE_URL = os.getenv('NEXT_PUBLIC_SUPABASE_URL', '')
SUPABASE_KEY = os.getenv('NEXT_PUBLIC_SUPABASE_ANON_KEY', '')

if not SUPABASE_URL or not SUPABASE_KEY:
    print("❌ Erreur: Variables d'environnement manquantes")
    sys.exit(1)

SUPABASE_BASE = f"{SUPABASE_URL}/rest/v1"
HEADERS = {
    'apikey': SUPABASE_KEY,
    'Authorization': f'Bearer {SUPABASE_KEY}',
    'Content-Type': 'application/json',
    'Prefer': 'return=minimal'
}

def insert_book(book: Dict) -> str:
    """Insère un livre apocryphe et retourne son ID"""
    try:
        # Préparer les données du livre
        book_data = {
            'name': book['name'],
            'name_fr': book['name_fr'],
            'slug': book['slug'],
            'source': book['source'],
            'source_id': book.get('source_id'),
            'category': book.get('category'),
            'chapters': book.get('chapters', 1),
            'description': book.get('description'),
            'description_fr': book.get('description_fr'),
            'original_lang': book.get('original_lang', 'en'),
        }

        # Insérer le livre
        response = requests.post(
            f"{SUPABASE_BASE}/apocryphal_books",
            headers=HEADERS,
            json=book_data
        )
        response.raise_for_status()

        # Récupérer l'UUID du livre créé
        location = response.headers.get('Location')
        if location:
            # Extraire l'UUID depuis l'en-tête Location
            book_uuid = location.split('/')[-1]
            return book_uuid
        else:
            # Fallback: requérir le livre par slug
            time.sleep(0.5)
            response = requests.get(
                f"{SUPABASE_BASE}/apocryphal_books?slug=eq.{book['slug']}&select=id",
                headers=HEADERS
            )
            response.raise_for_status()
            data = response.json()
            if data and len(data) > 0:
                return data[0]['id']
            else:
                raise Exception("Impossible de récupérer l'UUID du livre")

    except Exception as e:
        print(f"  ✗ Erreur insertion livre: {e}")
        return None

def insert_verses(book_id: str, verses: List[Dict]) -> bool:
    """Insère les versets en lot dans Supabase"""
    try:
        # Préparer les versets
        verses_data = []
        for v in verses:
            verses_data.append({
                'book_id': book_id,
                'chapter': v['chapter'],
                'verse': v['verse'],
                'text_original': v['text_original'],
                'text_fr': v['text_fr'],
                'translation_id': 'auto'
            })

        # Insérer par lots de 100
        batch_size = 100
        for i in range(0, len(verses_data), batch_size):
            batch = verses_data[i:i + batch_size]
            response = requests.post(
                f"{SUPABASE_BASE}/apocryphal_verses",
                headers=HEADERS,
                json=batch
            )
            response.raise_for_status()
            print(f"    ✓ Insertion lot {i//batch_size + 1}/{(len(verses_data) + batch_size - 1)//batch_size}")

        return True

    except Exception as e:
        print(f"  ✗ Erreur insertion versets: {e}")
        return False

def main():
    """Fonction principale"""
    print("\n" + "=" * 60)
    print("📥 INSERTION DES DONNÉES APOCRYPHES DANS SUPABASE")
    print("=" * 60)

    # Charger le fichier JSON
    if not os.path.exists('apocrypha-import-data.json'):
        print("❌ Erreur: Fichier 'apocrypha-import-data.json' non trouvé")
        print("   Exécutez d'abord: python scripts/import-apocrypha-mcp.py")
        sys.exit(1)

    with open('apocrypha-import-data.json', 'r', encoding='utf-8') as f:
        all_books = json.load(f)

    print(f"📚 {len(all_books)} livres à insérer")
    print(f"🔗 Supabase: {SUPABASE_URL}")
    print("=" * 60)

    # Demander confirmation
    confirm = input("\n⚠️  Cette opération va insérer des données dans Supabase. Continuer? (o/n): ")
    if confirm.lower() != 'o':
        print("❌ Annulation")
        sys.exit(0)

    success_count = 0
    for i, book in enumerate(all_books, 1):
        print(f"\n[{i}/{len(all_books)}] {book['name_fr']}")

        # Insérer le livre
        book_id = insert_book(book)
        if not book_id:
            print(f"  ✗ Erreur lors de l'insertion du livre")
            continue

        print(f"  ✓ Livre inséré (ID: {book_id})")

        # Insérer les versets
        verse_count = len(book.get('verses', []))
        print(f"  📝 Insertion de {verse_count} versets...")
        if insert_verses(book_id, book.get('verses', [])):
            print(f"  ✅ {verse_count} versets insérés!")
            success_count += 1
        else:
            print(f"  ✗ Erreur lors de l'insertion des versets")

        # Délai entre les livres
        time.sleep(1)

    print("\n" + "=" * 60)
    print(f"✅ {success_count}/{len(all_books)} livres insérés avec succès")
    print("=" * 60)

if __name__ == '__main__':
    main()
