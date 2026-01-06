"""
Script d'import des textes apocryphes avec traduction automatique
Utilise l'API MyMemory gratuita (sans clé) pour la traduction
"""

import os
import sys
import requests
import time
import json
from typing import List, Dict, Optional

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

    for attempt in range(max_retries):
        try:
            # Utiliser l'API MyMemory (gratuite, sans clé)
            url = 'https://api.mymemory.translated.net/get'
            params = {
                'q': text,
                'langpair': 'en|fr'
            }

            response = requests.get(url, params=params, timeout=10)

            # Gérer le rate limit (429)
            if response.status_code == 429:
                wait_time = (attempt + 1) * 5  # 5s, 10s, 15s
                print(f"  ⏸ Rate limit - Attente {wait_time}s...")
                time.sleep(wait_time)
                continue

            response.raise_for_status()
            data = response.json()

            if data['responseStatus'] == 200:
                translated = data['responseData']['translatedText']
                print(f"  ✓ Traduit: {text[:50]}...")
                return translated
            else:
                print(f"  ⚠ Erreur traduction: {data.get('responseDetails', 'Erreur inconnue')}")
                return text

        except requests.exceptions.RequestException as e:
            if attempt < max_retries - 1:
                wait_time = (attempt + 1) * 3
                print(f"  ⚠ Erreur {e} - Retry {attempt + 1}/{max_retries} (attente {wait_time}s)...")
                time.sleep(wait_time)
                continue
            print(f"  ✗ Erreur traduction finale: {e}")
            return text

    return text  # Fallback après tous les essais

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

def extract_verses_from_getbible(book_data: Dict):
    """
    Extrait les versets depuis la structure JSON de get.bible
    Structure: {chapters: [{chapter: 1, verses: [{chapter, verse, text}, ...]}]}
    """
    verses = []

    # Structure directe de get.bible API v2
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

def main():
    """Fonction principale"""
    print("\n" + "=" * 60)
    print("🚀 GÉNÉRATION DES FICHIERS D'IMPORT APOCRYPHES")
    print("=" * 60)
    print(f"📚 Livres à importer: {len(APOCRYPHAL_BOOKS)}")
    print(f"🌐 Traduction: MyMemory API (gratuit)")
    print("=" * 60)

    all_books = []

    for i, book in enumerate(APOCRYPHAL_BOOKS, 1):
        print(f"\n[{i}/{len(APOCRYPHAL_BOOKS)}] {book['name']}")

        # Récupérer les données
        book_data = fetch_from_getbible(book['nr'])
        if not book_data:
            continue

        # Extraire les versets
        verses = extract_verses_from_getbible(book_data)
        print(f"  ✓ {len(verses)} versets extraits")

        # Traduire les versets
        translated_verses = []
        print(f"  🔤 Traduction en cours...")
        for idx, v in enumerate(verses, 1):
            if idx % 10 == 0:
                print(f"    Progression: {idx}/{len(verses)} versets...")
            text_fr = translate_to_french(v.get('text', ''))
            translated_verses.append({
                'chapter': v['chapter'],
                'verse': v['verse'],
                'text_original': v['text'],
                'text_fr': text_fr,
            })
            # Délai entre chaque traduction pour éviter le rate limit
            time.sleep(0.5)

        # Créer le livre avec les versets
        book_record = {
            'name': book['name'],
            'name_fr': book['name_fr'],
            'slug': book['slug'],
            'source': 'getbible',
            'source_id': 'kjva',
            'category': book['category'],
            'chapters': len(set(v['chapter'] for v in translated_verses)),
            'description': f"Apocryphal book: {book['name']}",
            'description_fr': f"Livre apocryphe: {book['name_fr']}",
            'original_lang': 'en',
            'verses': translated_verses
        }
        all_books.append(book_record)
        print(f"  ✅ Import terminé!")

        # Rate limiting
        time.sleep(1)

    # Sauvegarder en JSON
    output_file = 'apocrypha-import-data.json'
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(all_books, f, ensure_ascii=False, indent=2)

    print("\n" + "=" * 60)
    print(f"✅ {len(all_books)} livres exportés dans {output_file}")
    print("=" * 60)
    print("\n📄 Utilisez les fichiers SQL générés pour l'import dans Supabase")
    print("🔥 Bon courage !")

if __name__ == '__main__':
    main()
