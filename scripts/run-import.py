"""
Script complet d'import des textes apocryphes avec traduction automatique
Utilise l'API MyMemory gratuita (sans clé) pour la traduction
"""

import os
import sys
import requests
import time
import json
from typing import List, Dict, Optional
from dotenv import load_dotenv

# Fix Windows console encoding
if sys.platform == 'win32':
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8')

# Charger les variables d'environnement
load_dotenv()

SUPABASE_URL = os.getenv('NEXT_PUBLIC_SUPABASE_URL', '')
SUPABASE_KEY = os.getenv('NEXT_PUBLIC_SUPABASE_ANON_KEY', '')

if not SUPABASE_URL or not SUPABASE_KEY:
    print("❌ Erreur: Variables d'environnement manquantes")
    print("Créez un fichier .env.local avec:")
    print("  NEXT_PUBLIC_SUPABASE_URL=votre_url_supabase")
    print("  NEXT_PUBLIC_SUPABASE_ANON_KEY=votre_clé_anon")
    sys.exit(1)

# Configuration Supabase
SUPABASE_BASE = f"{SUPABASE_URL}/rest/v1"

# Headers pour Supabase
HEADERS = {
    'apikey': SUPABASE_KEY,
    'Authorization': f'Bearer {SUPABASE_KEY}',
    'Content-Type': 'application/json',
    'Prefer': 'return=representation'
}

# Mapping des livres apocryphes
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

def translate_to_french(text: str, max_retries: int = 3) -> str:
    """
    Traduit un texte vers le français utilisant l'API MyMemory gratuite
    """
    if not text or not text.strip():
        return text

    # Nettoyer le texte
    text = text.strip()

    # Si le texte contient déjà un marqueur de traduction, le retourner
    if text.startswith('[TRADUCTION FR]') or text.startswith('[FR]'):
        return text.replace('[TRADUCTION FR] ', '').replace('[FR] ', '')

    try:
        # Utiliser l'API MyMemory (gratuite, sans clé)
        url = 'https://api.mymemory.translated.net/get'
        params = {
            'q': text,
            'langpair': 'en|fr'
        }

        response = requests.get(url, params=params, timeout=10)
        response.raise_for_status()
        data = response.json()

        if data['responseStatus'] == 200:
            translated = data['responseData']['translatedText']
            print(f"  ✓ Traduit: {text[:50]}...")
            return translated
        else:
            print(f"  ⚠ Erreur traduction: {data.get('responseDetails', 'Erreur inconnue')}")
            return text

    except Exception as e:
        print(f"  ⚠ Erreur traduction: {e}")
        return text

def fetch_from_getbible(book_nr: int) -> Optional[Dict]:
    """Récupère un livre depuis get.bible API"""
    try:
        url = f"https://api.getbible.net/v2/kjva/{book_nr}.json"
        response = requests.get(url, timeout=30)
        response.raise_for_status()
        return response.json()
    except Exception as e:
        print(f"  ✗ Erreur récupération livre {book_nr}: {e}")
        return None

def create_book_supabase(book: Dict, source: str) -> Optional[Dict]:
    """Crée un livre apocryphe dans Supabase via REST API"""
    try:
        book_data = {
            'name': book['name'],
            'name_fr': book['name_fr'],
            'slug': book['slug'],
            'source': source,
            'source_id': 'kjva' if source == 'getbible' else 'sefaria',
            'category': book['category'],
            'chapters': 0,  # Sera mis à jour après
            'description': f"Apocryphal book: {book['name']}",
            'description_fr': f"Livre apocryphe: {book['name_fr']}",
            'original_lang': 'en',
        }

        response = requests.post(
            f"{SUPABASE_BASE}/apocryphal_books",
            headers=HEADERS,
            json=book_data
        )
        response.raise_for_status()
        return response.json()
    except Exception as e:
        print(f"  ✗ Erreur création livre: {e}")
        return None

def insert_verses_supabase(book_id: str, verses: List[Dict]) -> bool:
    """Insère les versets en lot dans Supabase"""
    try:
        # Préparer les données par lots de 100
        batch_size = 100
        for i in range(0, len(verses), batch_size):
            batch = verses[i:i + batch_size]
            to_insert = []

            for v in batch:
                # Traduire le texte
                text_fr = translate_to_french(v.get('text', ''))

                to_insert.append({
                    'book_id': book_id,
                    'chapter': v.get('chapter', 1),
                    'verse': v.get('verse', 1),
                    'text_original': v.get('text', ''),
                    'text_fr': text_fr,
                })

            # Insérer le lot
            response = requests.post(
                f"{SUPABASE_BASE}/apocryphal_verses",
                headers=HEADERS,
                json=to_insert
            )
            response.raise_for_status()
            print(f"  ✓ Insert lot {i//batch_size + 1}: {len(batch)} versets")

        return True
    except Exception as e:
        print(f"  ✗ Erreur insertion versets: {e}")
        return False

def extract_verses_from_getbible(book_data: Dict) -> List[Dict]:
    """
    Extrait les versets depuis la structure JSON de get.bible
    La structure peut varier, cette fonction s'adapte
    """
    verses = []

    # La structure de get.bible: books[chapters][verses]
    if 'books' in book_data:
        for book_info in book_data['books']:
            if 'chapters' in book_info:
                for chapter_info in book_info['chapters']:
                    chapter_num = chapter_info.get('chapter', 1)
                    if 'verses' in chapter_info:
                        for verse_info in chapter_info['verses']:
                            verses.append({
                                'chapter': chapter_num,
                                'verse': verse_info.get('verse', 1),
                                'text': verse_info.get('text', ''),
                            })
    return verses

def process_getbible_books():
    """Traite tous les livres depuis get.bible API"""
    print("\n📖 Import depuis get.bible API...")
    print("=" * 60)

    for i, book in enumerate(APOCRYPHAL_BOOKS, 1):
        print(f"\n[{i}/{len(APOCRYPHAL_BOOKS)}] {book['name']}")

        # Récupérer les données
        book_data = fetch_from_getbible(book['nr'])
        if not book_data:
            continue

        # Créer le livre dans Supabase
        book_record = create_book_supabase(book, 'getbible')
        if not book_record:
            continue

        print(f"  ✓ Livre créé: {book_record['id']}")

        # Extraire les versets
        verses = extract_verses_from_getbible(book_data)
        print(f"  ✓ {len(verses)} versets extraits")

        # Insérer les versets avec traduction
        if verses:
            success = insert_verses_supabase(book_record['id'], verses)
            if success:
                print(f"  ✅ Import terminé!")
            else:
                print(f"  ❌ Erreur lors de l'import")

        # Rate limiting
        time.sleep(1)

def main():
    """Fonction principale"""
    print("\n" + "=" * 60)
    print("🚀 IMPORT DES TEXTES APOCRYPHES")
    print("=" * 60)
    print(f"📍 Supabase: {SUPABASE_URL}")
    print(f"📚 Livres à importer: {len(APOCRYPHAL_BOOKS)}")
    print(f"🌐 Traduction: MyMemory API (gratuit)")
    print("=" * 60)

    # Confirmer
    print("\n⚠️  Ce script va:")
    print("  - Récupérer 14 livres apocryphes depuis get.bible API")
    print("  - Traduire automatiquement tous les textes vers le français")
    print("  - Importer les données dans Supabase")
    print(f"  - Temps estimé: ~{len(APOCRYPHAL_BOOKS) * 2} minutes")
    print("\nContinuer? (y/n): ", end='')

    try:
        if input().lower() != 'y':
            print("❌ Annulé")
            return
    except KeyboardInterrupt:
        print("\n\n❌ Annulé")
        return

    # Lancer l'import
    process_getbible_books()

    print("\n" + "=" * 60)
    print("✅ IMPORT TERMINÉ!")
    print("=" * 60)
    print("\n📄 Pages disponibles:")
    print("  - http://localhost:3000/apocrypha")
    print("  - http://localhost:3000/apocrypha/tobit")
    print("  - http://localhost:3000/apocrypha/judith")
    print("  - etc.")
    print("\n🔥 Bon courage !")

if __name__ == '__main__':
    main()
