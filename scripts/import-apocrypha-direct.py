"""
Script complet d'import des textes apocryphes avec traduction et insertion directe dans Supabase
Utilise l'API MyMemory (gratuite) et l'API REST Supabase
"""

import os
import sys
import requests
import time
import json
from typing import Dict, List
from dotenv import load_dotenv

# Charger les variables d'environnement AVANT de les utiliser
load_dotenv(dotenv_path='.env.local')

# Fix Windows console encoding
if sys.platform == 'win32':
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8')

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

# Configuration Supabase
SUPABASE_URL = os.getenv('NEXT_PUBLIC_SUPABASE_URL', '')
SUPABASE_KEY = os.getenv('NEXT_PUBLIC_SUPABASE_ANON_KEY', '')

if not SUPABASE_URL or not SUPABASE_KEY:
    print("❌ Erreur: Variables d'environnement manquantes")
    print("Créez un fichier .env.local avec:")
    print("  NEXT_PUBLIC_SUPABASE_URL=votre_url_supabase")
    print("  NEXT_PUBLIC_SUPABASE_ANON_KEY=votre_clé_anon")
    sys.exit(1)

SUPABASE_BASE = f"{SUPABASE_URL}/rest/v1"
HEADERS = {
    'apikey': SUPABASE_KEY,
    'Authorization': f'Bearer {SUPABASE_KEY}',
    'Content-Type': 'application/json',
    'Prefer': 'return=minimal'
}

# Cache de traduction
TRANSLATION_CACHE = {}
CACHE_FILE = 'translation-cache.json'

def load_cache():
    """Charge le cache de traduction depuis le disque"""
    global TRANSLATION_CACHE
    if os.path.exists(CACHE_FILE):
        try:
            with open(CACHE_FILE, 'r', encoding='utf-8') as f:
                TRANSLATION_CACHE = json.load(f)
                print(f"📦 Cache chargé: {len(TRANSLATION_CACHE)} traductions")
        except:
            TRANSLATION_CACHE = {}

def save_cache():
    """Sauvegarde le cache de traduction sur le disque"""
    try:
        with open(CACHE_FILE, 'w', encoding='utf-8') as f:
            json.dump(TRANSLATION_CACHE, f, ensure_ascii=False, indent=2)
    except Exception as e:
        print(f"  ⚠ Erreur sauvegarde cache: {e}")

def translate_to_french(text: str) -> str:
    """Traduit un texte vers le français avec cache"""
    if not text or not text.strip():
        return text

    text = text.strip()

    # Vérifier le cache
    if text in TRANSLATION_CACHE:
        return TRANSLATION_CACHE[text]

    # Traduire via l'API
    for attempt in range(3):
        try:
            url = 'https://api.mymemory.translated.net/get'
            params = {'q': text, 'langpair': 'en|fr'}
            response = requests.get(url, params=params, timeout=10)

            if response.status_code == 429:
                wait_time = (attempt + 1) * 5
                print(f"  ⏸ Rate limit - Attente {wait_time}s...")
                sys.stdout.flush()
                time.sleep(wait_time)
                continue

            response.raise_for_status()
            data = response.json()

            if data['responseStatus'] == 200:
                translated = data['responseData']['translatedText']
                # Mettre en cache
                TRANSLATION_CACHE[text] = translated
                if len(TRANSLATION_CACHE) % 50 == 0:
                    save_cache()  # Sauvegarde périodique
                return translated
            else:
                return text

        except Exception as e:
            if attempt < 2:
                time.sleep(3)
                continue
            return text

    return text

def fetch_from_getbible(book_nr: int):
    """Récupère un livre depuis get.bible API"""
    try:
        url = f"https://api.getbible.net/v2/kjva/{book_nr}.json"
        response = requests.get(url, timeout=30)
        response.raise_for_status()
        return response.json()
    except Exception as e:
        print(f"  ✗ Erreur récupération livre {book_nr}: {e}")
        return None

def extract_verses(book_data: Dict) -> List[Dict]:
    """Extrait les versets depuis la structure JSON de get.bible"""
    verses = []
    if 'chapters' in book_data:
        for chapter_info in book_data['chapters']:
            chapter_num = chapter_info.get('chapter', 1)
            if 'verses' in chapter_info:
                for verse_info in chapter_info['verses']:
                    verses.append({
                        'chapter': verse_info.get('chapter', chapter_num),
                        'verse': verse_info.get('verse', 1),
                        'text': verse_info.get('text', ''),
                    })
    return verses

def insert_book(book: Dict) -> str:
    """Insère un livre et retourne son ID"""
    try:
        book_data = {
            'name': book['name'],
            'name_fr': book['name_fr'],
            'slug': book['slug'],
            'source': 'getbible',
            'source_id': 'kjva',
            'category': book.get('category'),
            'chapters': book.get('chapters', 1),
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

        # Récupérer l'UUID
        time.sleep(0.5)
        response = requests.get(
            f"{SUPABASE_BASE}/apocryphal_books?slug=eq.{book['slug']}&select=id",
            headers=HEADERS
        )
        response.raise_for_status()
        data = response.json()
        if data and len(data) > 0:
            return data[0]['id']
        raise Exception("UUID non trouvé")

    except Exception as e:
        print(f"  ✗ Erreur insertion livre: {e}")
        return None

def insert_verses(book_id: str, verses: List[Dict]) -> bool:
    """Insère les versets par lots"""
    try:
        # Préparer les données
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

        return True

    except Exception as e:
        print(f"  ✗ Erreur insertion versets: {e}")
        return False

def main():
    """Fonction principale"""
    print("\n" + "=" * 70)
    print("🚀 IMPORT COMPLET DES TEXTES APOCRYPHES")
    print("=" * 70)
    print(f"📚 Livres: {len(APOCRYPHAL_BOOKS)}")
    print(f"🌐 Traduction: MyMemory API (avec cache)")
    print(f"💾 Base: {SUPABASE_URL}")
    print("=" * 70)

    # Charger le cache
    load_cache()

    print("\n⚠️  ATTENTION: Ce script va:")
    print("  1. Récupérer les textes depuis get.bible API")
    print("  2. Traduire tous les versets en français")
    print("  3. Insérer les données dans Supabase")
    print(f"\n📦 Cache actuel: {len(TRANSLATION_CACHE)} traductions")

    confirm = input("\nContinuer? (o/n): ")
    if confirm.lower() != 'o':
        print("❌ Annulation")
        sys.exit(0)

    success_count = 0
    total_verses = 0

    for i, book in enumerate(APOCRYPHAL_BOOKS, 1):
        print(f"\n{'=' * 70}")
        print(f"[{i}/{len(APOCRYPHAL_BOOKS)}] {book['name_fr']}")
        print('=' * 70)

        # Récupérer
        print(f"  📥 Récupération depuis get.bible...")
        book_data = fetch_from_getbible(book['nr'])
        if not book_data:
            continue

        # Extraire
        verses = extract_verses(book_data)
        print(f"  ✓ {len(verses)} versets extraits")
        sys.stdout.flush()

        # Traduire
        print(f"  🔤 Traduction en cours...")
        sys.stdout.flush()
        translated_verses = []
        for idx, v in enumerate(verses, 1):
            if idx % 10 == 0:
                print(f"    {idx}/{len(verses)}...", end='\r')
                sys.stdout.flush()
            text_fr = translate_to_french(v['text'])
            translated_verses.append({
                'chapter': v['chapter'],
                'verse': v['verse'],
                'text_original': v['text'],
                'text_fr': text_fr,
            })
            time.sleep(0.3)  # Respecter l'API

        print(f"  ✓ {len(translated_verses)} versets traduits")

        # Insérer le livre
        print(f"  💾 Insertion dans Supabase...")
        book_id = insert_book({
            'name': book['name'],
            'name_fr': book['name_fr'],
            'slug': book['slug'],
            'category': book['category'],
            'chapters': len(set(v['chapter'] for v in translated_verses)),
        })

        if not book_id:
            continue

        print(f"  ✓ Livre inséré (ID: {book_id[:8]}...)")

        # Insérer les versets
        if insert_verses(book_id, translated_verses):
            print(f"  ✅ {len(translated_verses)} versets insérés!")
            success_count += 1
            total_verses += len(translated_verses)
        else:
            print(f"  ✗ Erreur lors de l'insertion des versets")

        # Sauvegarder le cache
        save_cache()

        # Délai entre les livres
        time.sleep(2)

    # Sauvegarde finale du cache
    save_cache()

    print("\n" + "=" * 70)
    print(f"✅ IMPORT TERMINÉ!")
    print(f"   📚 Livres importés: {success_count}/{len(APOCRYPHAL_BOOKS)}")
    print(f"   📝 Versets totaux: {total_verses}")
    print(f"   📦 Traductions en cache: {len(TRANSLATION_CACHE)}")
    print("=" * 70)

if __name__ == '__main__':
    main()
