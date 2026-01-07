"""
Script de complétion de la Bible de Jérusalem depuis gratis.bible
Scrape le site web pour récupérer les versets manquants
"""

import os, sys, re
import time
from dotenv import load_dotenv
import requests
from bs4 import BeautifulSoup

load_dotenv('.env.local')

SUPABASE_URL = os.getenv('NEXT_PUBLIC_SUPABASE_URL', '')
SUPABASE_KEY = os.getenv('NEXT_PUBLIC_SUPABASE_ANON_KEY', '')
SUPABASE_BASE = f"{SUPABASE_URL}/rest/v1"
HEADERS = {
    'apikey': SUPABASE_KEY,
    'Authorization': f'Bearer {SUPABASE_KEY}',
    'Content-Type': 'application/json',
    'Prefer': 'return=representation'
}

# Mapping livres anglais -> slugs
BOOK_NAME_TO_SLUG = {
    'Genesis': 'genese', 'Exodus': 'exode', 'Leviticus': 'levitique', 'Numbers': 'nombres',
    'Deuteronomy': 'deuteronome', 'Joshua': 'josue', 'Judges': 'juges', 'Ruth': 'ruth',
    '1 Samuel': '1-samuel', '2 Samuel': '2-samuel', '1 Kings': '1-rois', '2 Kings': '2-rois',
    '1 Chronicles': '1-chroniques', '2 Chronicles': '2-chroniques', 'Ezra': 'esdras',
    'Nehemiah': 'nehemie', 'Esther': 'esther', 'Job': 'job', 'Psalms': 'psaumes',
    'Proverbs': 'proverbes', 'Ecclesiastes': 'ecclesiaste', 'Song of Solomon': 'cantique',
    'Isaiah': 'eesaie', 'Jeremiah': 'jeremie', 'Lamentations': 'lamentations', 'Ezekiel': 'ezechiel',
    'Daniel': 'daniel', 'Hosea': 'osee', 'Joel': 'joel', 'Amos': 'amos', 'Obadiah': 'abdias',
    'Jonah': 'jonas', 'Micah': 'michee', 'Nahum': 'nahum', 'Habakkuk': 'habacuc',
    'Zephaniah': 'sophonie', 'Haggai': 'aggee', 'Zechariah': 'zacharie', 'Malachi': 'malachie',
    'Matthew': 'matthieu', 'Mark': 'marc', 'Luke': 'luc', 'John': 'jean', 'Acts': 'actes',
    'Romans': 'romains', '1 Corinthians': '1-corinthiens', '2 Corinthians': '2-corinthiens',
    'Galatians': 'galates', 'Ephesians': 'ephesiens', 'Philippiens': 'philippiens',
    'Colossiens': 'colossiens', '1 Thessalonians': '1-thesaloniciens', '2 Thessalonicians': '2-thesaloniciens',
    '1 Timothy': '1-timothee', '2 Timothy': '2-timothee', 'Titus': 'tite', 'Philemon': 'philemon',
    'Hebrews': 'hebreux', 'James': 'jacques', '1 Peter': '1-pierre', '2 Peter': '2-pierre',
    '1 John': '1-jean', '2 John': '2-jean', '3 John': '3-jean', 'Jude': 'jude',
    'Revelation': 'apocalypse', 'Tobit': 'tobie', 'Judith': 'judith', 'Wisdom': 'sagesse',
    'Sirach': 'siracide', 'Baruch': 'baruch', '1 Maccabees': '1-macchabees', '2 Maccabees': '2-macchabees'
}

def fetch_books():
    print("Fetching books...")
    response = requests.get(f"{SUPABASE_BASE}/bible_books", headers=HEADERS, params={'order': 'position'})
    if response.status_code != 200:
        print(f"ERROR: {response.status_code}")
        sys.exit(1)
    return {b['slug']: b['id'] for b in response.json()}

def fetch_existing_verses(book_slug):
    response = requests.get(
        f"{SUPABASE_BASE}/bible_verses",
        headers=HEADERS,
        params={'book_slug': f'eq.{book_slug}', 'translation_id': 'eq.jerusalem', 'select': 'chapter,verse'}
    )
    if response.status_code == 200:
        return set((v['chapter'], v['verse']) for v in response.json())
    return set()

def scrape_chapter(book_name, chapter_num):
    """Scrape un chapitre depuis gratis.bible"""
    # URL pattern: https://gratis.bible/fr/dejer/GENESIS/1.htm
    book_url_name = book_name.upper().replace(' ', '_')
    url = f"https://gratis.bible/fr/dejer/{book_url_name}/{chapter_num}.htm"

    try:
        response = requests.get(url, timeout=10)
        if response.status_code != 200:
            print(f"    ERROR HTTP {response.status_code} for {url}")
            return []

        soup = BeautifulSoup(response.text, 'html.parser')
        verses = []

        # Trouver tous les versets
        # Le format est typiquement: <p class="verse"><sup>1</sup>Texte...</p>
        for p in soup.find_all('p', class_='verse'):
            # Extraire le numéro
            sup = p.find('sup')
            if sup:
                try:
                    verse_num = int(sup.text.strip())
                    # Supprimer le sup et obtenir le texte
                    sup.decompose()
                    verse_text = p.get_text(strip=True)
                    verse_text = re.sub(r'^\d+\s*', '', verse_text)  # Enlever le numéro au début
                    verse_text = re.sub(r'\s+', ' ', verse_text)  # Nettoyer espaces

                    if verse_text:
                        verses.append({
                            'chapter': chapter_num,
                            'verse': verse_num,
                            'text': verse_text
                        })
                except ValueError:
                    continue

        return verses

    except Exception as e:
        print(f"    ERROR scraping {url}: {e}")
        return []

def main():
    print("="*60)
    print("Completing Jerusalem Bible from gratis.bible")
    print("="*60)

    book_id_map = fetch_books()

    # Ordre des livres sur le site
    books_order = [
        'Genesis', 'Exodus', 'Leviticus', 'Numbers', 'Deuteronomy',
        'Joshua', 'Judges', 'Ruth', '1 Samuel', '2 Samuel',
        '1 Kings', '2 Kings', '1 Chronicles', '2 Chronicles', 'Ezra', 'Nehemiah',
        'Esther', 'Job', 'Psalms', 'Proverbs', 'Ecclesiastes', 'Song of Solomon',
        'Isaiah', 'Jeremiah', 'Lamentations', 'Ezekiel', 'Daniel',
        'Hosea', 'Joel', 'Amos', 'Obadiah', 'Jonah', 'Micah', 'Nahum', 'Habakkuk',
        'Zephaniah', 'Haggai', 'Zechariah', 'Malachi',
        'Matthew', 'Mark', 'Luke', 'John', 'Acts',
        'Romans', '1 Corinthians', '2 Corinthians', 'Galatians', 'Ephesians',
        'Philippians', 'Colossians', '1 Thessalonians', '2 Thessalonicians',
        '1 Timothy', '2 Timothy', 'Titus', 'Philemon', 'Hebrews', 'James',
        '1 Peter', '2 Peter', '1 John', '2 John', '3 John', 'Jude', 'Revelation',
        'Tobit', 'Judith', 'Wisdom', 'Sirach', 'Baruch', '1 Maccabees', '2 Maccabees'
    ]

    total_inserted = 0
    total_skipped = 0
    books_processed = 0

    for book_name in books_order:
        slug = BOOK_NAME_TO_SLUG.get(book_name)
        if not slug:
            print(f"\nSKIP: {book_name} - no slug mapping")
            continue

        book_id = book_id_map.get(slug)
        if not book_id:
            print(f"\nSKIP: {book_name} - no book_id")
            continue

        books_processed += 1
        print(f"\n[{books_processed}] {book_name} ({slug})")

        existing = fetch_existing_verses(slug)
        print(f"  Existing: {len(existing)} verses")

        # Scraper les chapitres (1-150 max)
        for chapter in range(1, 151):
            verses_data = scrape_chapter(book_name, chapter)

            if not verses_data:
                if chapter <= 50:  # Afficher seulement les 50 premiers chapitres
                    print(f"    Chapter {chapter}: no verses found")
                continue

            verses_to_insert = []
            for v in verses_data:
                if (v['chapter'], v['verse']) in existing:
                    total_skipped += 1
                    continue

                verses_to_insert.append({
                    'book_id': book_id,
                    'book_slug': slug,
                    'chapter': v['chapter'],
                    'verse': v['verse'],
                    'text': v['text'],
                    'translation_id': 'jerusalem'
                })

            if verses_to_insert:
                # Insérer par lot de 50
                for i in range(0, len(verses_to_insert), 50):
                    batch = verses_to_insert[i:i+50]
                    response = requests.post(
                        f"{SUPABASE_BASE}/bible_verses",
                        headers=HEADERS,
                        json=batch
                    )
                    if response.status_code == 201:
                        total_inserted += len(batch)
                        print(f"    Chapter {chapter}: +{len(batch)} (total: {total_inserted})")
                    else:
                        print(f"    ERROR Chapter {chapter}: {response.status_code}")

            # Délai pour ne pas surcharger le serveur
            time.sleep(0.5)

    print("\n" + "="*60)
    print(f"DONE: {books_processed} books, {total_inserted} inserted, {total_skipped} skipped")
    print("="*60)

if __name__ == "__main__":
    main()
