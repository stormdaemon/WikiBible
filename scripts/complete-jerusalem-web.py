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

# Mapping livres code site -> slug
BOOK_CODE_TO_SLUG = {
    'gen': 'genese', 'exod': 'exode', 'lev': 'levitique', 'num': 'nombres',
    'deut': 'deuteronome', 'josh': 'josue', 'judg': 'juges', 'ruth': 'ruth',
    '1sam': '1-samuel', '2sam': '2-samuel', '1kgs': '1-rois', '2kgs': '2-rois',
    '1chr': '1-chroniques', '2chr': '2-chroniques', 'ezra': 'esdras',
    'neh': 'nehemie', 'esth': 'esther', 'job': 'job', 'ps': 'psaumes',
    'prov': 'proverbes', 'eccl': 'ecclesiaste', 'song': 'cantique',
    'isa': 'eesaie', 'jer': 'jeremie', 'lam': 'lamentations', 'ezek': 'ezechiel',
    'dan': 'daniel', 'hos': 'osee', 'joel': 'joel', 'amos': 'amos', 'obad': 'abdias',
    'jonah': 'jonas', 'mic': 'michee', 'nah': 'nahum', 'hab': 'habacuc',
    'zeph': 'sophonie', 'hag': 'aggee', 'zech': 'zacharie', 'mal': 'malachie',
    'matt': 'matthieu', 'mark': 'marc', 'luke': 'luc', 'john': 'jean', 'acts': 'actes',
    'rom': 'romains', '1cor': '1-corinthiens', '2cor': '2-corinthiens',
    'gal': 'galates', 'eph': 'ephesiens', 'phil': 'philippiens',
    'col': 'colossiens', '1thess': '1-thesaloniciens', '2thess': '2-thesaloniciens',
    '1tim': '1-timothee', '2tim': '2-timothee', 'titus': 'tite', 'phlm': 'philemon',
    'heb': 'hebreux', 'jas': 'jacques', '1pet': '1-pierre', '2pet': '2-pierre',
    '1john': '1-jean', '2john': '2-jean', '3john': '3-jean', 'jude': 'jude',
    'rev': 'apocalypse', 'tob': 'tobie', 'jdt': 'judith', 'wis': 'sagesse',
    'sir': 'siracide', 'bar': 'baruch', '1macc': '1-macchabees', '2macc': '2-macchabees'
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

def scrape_chapter(book_code, chapter_num):
    """Scrape un chapitre depuis gratis.bible"""
    # URL pattern: https://gratis.bible/fr/dejer/gen/1.htm
    url = f"https://gratis.bible/fr/dejer/{book_code}/{chapter_num}.htm"

    try:
        response = requests.get(url, timeout=15)
        if response.status_code != 200:
            return []

        soup = BeautifulSoup(response.text, 'html.parser')
        verses = []

        # Trouver tous les versets - le format peut varier
        # Chercher tous les paragraphes avec un numero au debut
        for p in soup.find_all('p'):
            text = p.get_text(strip=True)
            if not text:
                continue

            # Chercher un numero de verset au debut (ex: "1 ", "2 ", etc.)
            match = re.match(r'^(\d+)\s+(.+)', text)
            if match:
                try:
                    verse_num = int(match.group(1))
                    verse_text = match.group(2)
                    verse_text = re.sub(r'\s+', ' ', verse_text).strip()

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

    total_inserted = 0
    total_skipped = 0
    books_processed = 0

    for book_code, slug in BOOK_CODE_TO_SLUG.items():
        book_id = book_id_map.get(slug)
        if not book_id:
            print(f"\nSKIP: {book_code} - no book_id for {slug}")
            continue

        books_processed += 1
        print(f"\n[{books_processed}] {book_code} ({slug})")

        existing = fetch_existing_verses(slug)
        print(f"  Existing: {len(existing)} verses")

        # Scraper les chapitres (1-150 max)
        for chapter in range(1, 151):
            verses_data = scrape_chapter(book_code, chapter)

            if not verses_data:
                # Pas de versets trouves - peut etre fin du livre
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
            time.sleep(0.3)

    print("\n" + "="*60)
    print(f"DONE: {books_processed} books, {total_inserted} inserted, {total_skipped} skipped")
    print("="*60)

if __name__ == "__main__":
    main()
