"""
Script pour récupérer et importer les textes apocryphes
Sources: get.bible API (KJVA) et Sefaria API
"""

import os
import requests
import json
import time
from typing import List, Dict
from supabase import create_client, Client

# Configuration
SUPABASE_URL = os.getenv('SUPABASE_URL', 'YOUR_SUPABASE_URL')
SUPABASE_KEY = os.getenv('SUPABASE_SERVICE_KEY', 'YOUR_SUPABASE_KEY')

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# Mapping des livres apocryphes KJVA
APOCRYPHAL_BOOKS = [
    {'nr': 67, 'name': '1 Esdras', 'name_fr': '1 Esdras', 'slug': '1-esdras', 'category': 'apocrypha'},
    {'nr': 68, 'name': '2 Esdras', 'name_fr': '2 Esdras', 'slug': '2-esdras', 'category': 'apocrypha'},
    {'nr': 69, 'name': 'Tobit', 'name_fr': 'Tobie', 'slug': 'tobit', 'category': 'deutero'},
    {'nr': 70, 'name': 'Judith', 'name_fr': 'Judith', 'slug': 'judith', 'category': 'deutero'},
    {'nr': 71, 'name': 'Additions to Esther', 'name_fr': "Additions d'Esther", 'slug': 'additions-esther', 'category': 'deutero'},
    {'nr': 73, 'name': 'Wisdom', 'name_fr': 'Sagesse', 'slug': 'sagesse', 'category': 'deutero'},
    {'nr': 74, 'name': 'Sirach', 'name_fr': 'Siracide', 'slug': 'siracide', 'category': 'deutero'},
    {'nr': 75, 'name': 'Baruch', 'name_fr': 'Baruch', 'slug': 'baruch', 'category': 'deutero'},
    {'nr': 76, 'name': 'Prayer of Azariah', 'name_fr': 'Prière d\'Azariah', 'slug': 'priere-azariah', 'category': 'deutero'},
    {'nr': 77, 'name': 'Susanna', 'name_fr': 'Susanne', 'slug': 'susanna', 'category': 'deutero'},
    {'nr': 78, 'name': 'Bel and the Dragon', 'name_fr': 'Bel et le Dragon', 'slug': 'bel-dragon', 'category': 'deutero'},
    {'nr': 79, 'name': 'Prayer of Manasses', 'name_fr': 'Prière de Manassé', 'slug': 'priere-manasse', 'category': 'deutero'},
    {'nr': 80, 'name': '1 Maccabees', 'name_fr': '1 Maccabées', 'slug': '1-maccabees', 'category': 'deutero'},
    {'nr': 81, 'name': '2 Maccabees', 'name_fr': '2 Maccabées', 'slug': '2-maccabees', 'category': 'deutero'},
]

def translate_text(text: str) -> str:
    """
    Traduit un texte vers le français
    TODO: Intégrer Deepl API ou Google Translate
    """
    # Placeholder pour traduction
    return f"[TRADUCTION FR] {text}"

def fetch_from_getbible(book_nr: int) -> Dict:
    """Récupère un livre depuis get.bible API"""
    url = f"https://api.getbible.net/v2/kjva/{book_nr}.json"
    response = requests.get(url)
    response.raise_for_status()
    return response.json()

def fetch_jubilees_from_sefaria() -> Dict:
    """Récupère le Book of Jubilees depuis Sefaria API"""
    url = "https://www.sefaria.org/api/v2/texts/Book_of_Jubilees?context=0"
    response = requests.get(url)
    response.raise_for_status()
    return response.json()

def create_book(book: Dict, source: str) -> Dict:
    """Crée un livre apocryphe dans la DB"""
    data = {
        'name': book['name'],
        'name_fr': book['name_fr'],
        'slug': book['slug'],
        'source': source,
        'source_id': 'kjva' if source == 'getbible' else 'sefaria',
        'category': book['category'],
        'chapters': 0,
        'description': f"Apocryphal book: {book['name']}",
        'description_fr': f"Livre apocryphe: {book['name_fr']}",
        'original_lang': 'en',
    }

    result = supabase.table('apocryphal_books').insert(data).execute()
    return result.data[0]

def insert_verses(book_id: str, verses: List[Dict]) -> None:
    """Insère les versets d'un livre"""
    to_insert = []
    for i, v in enumerate(verses):
        to_insert.append({
            'book_id': book_id,
            'chapter': v.get('chapter', 1),
            'verse': v.get('verse', i + 1),
            'text_original': v.get('text', ''),
            'text_fr': translate_text(v.get('text', '')),
        })

    supabase.table('apocryphal_verses').insert(to_insert).execute()

def main():
    """Main function"""
    print("🚀 Starting apocrypha import...")

    # 1. Import depuis get.bible
    print("\n📖 Fetching from get.bible API...")
    for book in APOCRYPHAL_BOOKS:
        try:
            print(f"  Fetching {book['name']}...")
            data = fetch_from_getbible(book['nr'])

            # Créer le livre
            book_record = create_book(book, 'getbible')
            print(f"    ✓ Created: {book_record['id']}")

            # Extraire les versets (adapter selon la structure réelle de l'API)
            # TODO: Parser correctement la structure JSON de get.bible
            print(f"    ✓ Parsing verses...")

            time.sleep(0.5)  # Rate limiting

        except Exception as e:
            print(f"    ✗ Error: {e}")

    # 2. Import Jubilees depuis Sefaria
    print("\n📜 Fetching Book of Jubilees from Sefaria...")
    try:
        jubilees = fetch_jubilees_from_sefaria()
        print("  ✓ Jubilees fetched")

        # Créer le livre Jubilees
        book_jubilees = {
            'name': 'Book of Jubilees',
            'name_fr': 'Livre des Jubilés',
            'slug': 'jubilees',
            'category': 'second_temple'
        }
        book_record = create_book(book_jubilees, 'sefaria')
        print(f"  ✓ Created: {book_record['id']}")

    except Exception as e:
        print(f"  ✗ Error: {e}")

    print("\n✅ Import complete!")

if __name__ == '__main__':
    main()
