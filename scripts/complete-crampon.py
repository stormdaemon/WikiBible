import os, sys, xml.etree.ElementTree as ET, re
from dotenv import load_dotenv
import requests

load_dotenv('.env.local')

SUPABASE_URL = os.getenv('NEXT_PUBLIC_SUPABASE_URL', '')
SUPABASE_KEY = os.getenv('NEXT_PUBLIC_SUPABASE_ANON_KEY', '')
SUPABASE_BASE = f"{SUPABASE_URL}/rest/v1"
HEADERS = {'apikey': SUPABASE_KEY, 'Authorization': f'Bearer {SUPABASE_KEY}', 'Content-Type': 'application/json', 'Prefer': 'return=representation'}

# Mapping book number -> French name (according to Catholic Bible order)
BOOK_NUMBER_TO_NAME = {
    1: 'Genèse', 2: 'Exode', 3: 'Lévitique', 4: 'Nombres', 5: 'Deutéronome',
    6: 'Josué', 7: 'Juges', 8: 'Ruth', 9: '1 Samuel', 10: '2 Samuel',
    11: '1 Rois', 12: '2 Rois', 13: '1 Chroniques', 14: '2 Chroniques',
    15: 'Esdras', 16: 'Néhémie', 17: 'Tobie', 18: 'Judith', 19: 'Esther',
    20: '1 Maccabées', 21: '2 Maccabées', 22: 'Job', 23: 'Psaumes', 24: 'Proverbes',
    25: 'Qohélet', 26: 'Cantique', 27: 'Sagesse', 28: 'Siracide', 29: 'Isaïe',
    30: 'Jérémie', 31: 'Lamentations', 32: 'Baruch', 33: 'Ézéchiel', 34: 'Daniel',
    35: 'Osée', 36: 'Joël', 37: 'Amos', 38: 'Abdias', 39: 'Jonas',
    40: 'Michée', 41: 'Nahum', 42: 'Habaquuc', 43: 'Sophonie', 44: 'Aggée',
    45: 'Zacharie', 46: 'Malachie', 47: 'Matthieu', 48: 'Marc', 49: 'Luc',
    50: 'Jean', 51: 'Actes', 52: 'Romains', 53: '1 Corinthiens', 54: '2 Corinthiens',
    55: 'Galates', 56: 'Éphésiens', 57: 'Philippiens', 58: 'Colossiens', 59: '1 Thessaloniciens',
    60: '2 Thessaloniciens', 61: '1 Timothée', 62: '2 Timothée', 63: 'Tite', 64: 'Philémon',
    65: 'Hébreux', 66: 'Jacques', 67: '1 Pierre', 68: '2 Pierre', 69: '1 Jean',
    70: '2 Jean', 71: '3 Jean', 72: 'Jude', 73: 'Apocalypse'
}

BOOK_NAME_TO_SLUG = {
    'Genèse': 'genese', 'Exode': 'exode', 'Lévitique': 'levitique', 'Nombres': 'nombres', 'Deutéronome': 'deuteronome',
    'Josué': 'josue', 'Juges': 'juges', 'Ruth': 'ruth', '1 Samuel': '1-samuel', '2 Samuel': '2-samuel',
    '1 Rois': '1-rois', '2 Rois': '2-rois', '1 Chroniques': '1-chroniques', '2 Chroniques': '2-chroniques',
    'Esdras': 'esdras', 'Néhémie': 'nehemie', 'Tobie': 'tobie', 'Judith': 'judith', 'Esther': 'esther',
    '1 Maccabées': '1-macchabees', '2 Maccabées': '2-macchabees', 'Job': 'job', 'Psaumes': 'psaumes', 'Proverbes': 'proverbes',
    'Qohélet': 'ecclesiaste', 'Cantique': 'cantique', 'Sagesse': 'sagesse', 'Siracide': 'siracide', 'Isaïe': 'eesaie',
    'Jérémie': 'jeremie', 'Lamentations': 'lamentations', 'Baruch': 'baruch', 'Ézéchiel': 'ezechiel', 'Daniel': 'daniel',
    'Osée': 'osee', 'Joël': 'joel', 'Amos': 'amos', 'Abdias': 'abdias', 'Jonas': 'jonas',
    'Michée': 'michee', 'Nahum': 'nahum', 'Habaquuc': 'habacuc', 'Sophonie': 'sophonie', 'Aggée': 'aggee',
    'Zacharie': 'zacharie', 'Malachie': 'malachie', 'Matthieu': 'matthieu', 'Marc': 'marc', 'Luc': 'luc',
    'Jean': 'jean', 'Actes': 'actes', 'Romains': 'romains', '1 Corinthiens': '1-corinthiens', '2 Corinthiens': '2-corinthiens',
    'Galates': 'galates', 'Éphésiens': 'ephesiens', 'Philippiens': 'philippiens', 'Colossiens': 'colossiens', '1 Thessaloniciens': '1-thesaloniciens',
    '2 Thessaloniciens': '2-thesaloniciens', '1 Timothée': '1-timothee', '2 Timothée': '2-timothee', 'Tite': 'tite', 'Philémon': 'philemon',
    'Hébreux': 'hebreux', 'Jacques': 'jacques', '1 Pierre': '1-pierre', '2 Pierre': '2-pierre', '1 Jean': '1-jean',
    '2 Jean': '2-jean', '3 Jean': '3-jean', 'Jude': 'jude', 'Apocalypse': 'apocalypse'
}

def fetch_books():
    print("Fetching books from Supabase...")
    response = requests.get(f"{SUPABASE_BASE}/bible_books", headers=HEADERS, params={'order': 'position'})
    if response.status_code != 200:
        print(f"ERROR: {response.status_code}")
        sys.exit(1)
    books = response.json()
    print(f"OK: {len(books)} books")
    return {b['slug']: b['id'] for b in books}

def fetch_existing_verses(book_slug):
    response = requests.get(f"{SUPABASE_BASE}/bible_verses", headers=HEADERS, params={'book_slug': f'eq.{book_slug}', 'translation_id': 'eq.crampon', 'select': 'chapter,verse'})
    if response.status_code == 200:
        return set((v['chapter'], v['verse']) for v in response.json())
    return set()

def main():
    print("="*60)
    print("Completing Crampon Bible from XML")
    print("="*60)

    xml_path = r"D:\Users\sebas\Desktop\dossier THEO\wikibible\scripts\crampon.xml"
    if not os.path.exists(xml_path):
        print(f"ERROR: File not found {xml_path}")
        sys.exit(1)

    book_id_map = fetch_books()

    tree = ET.parse(xml_path)
    root = tree.getroot()

    total_inserted = 0
    total_skipped = 0
    books_processed = 0

    for testament in root.findall('.//testament'):
        print(f"\nTestament: {testament.get('name')}")

        for book in testament.findall('book'):
            book_number = int(book.get('number'))

            if book_number not in BOOK_NUMBER_TO_NAME:
                print(f"  SKIP: Book number {book_number} not in mapping")
                continue

            book_name = BOOK_NUMBER_TO_NAME[book_number]
            slug = BOOK_NAME_TO_SLUG.get(book_name)

            if not slug:
                print(f"  SKIP: No slug for {book_name}")
                continue

            book_id = book_id_map.get(slug)
            if not book_id:
                print(f"  SKIP: Book ID not found for {slug}")
                continue

            books_processed += 1
            print(f"\n[{book_number}] {book_name} ({slug})")

            existing = fetch_existing_verses(slug)
            print(f"  Existing: {len(existing)} verses")

            chapters_processed = 0
            for chapter in book.findall('chapter'):
                chap_num = int(chapter.get('number'))
                verses_to_insert = []

                for verse in chapter.findall('verse'):
                    verse_num = int(verse.get('number'))
                    verse_text = verse.text

                    if not verse_text:
                        continue

                    if (chap_num, verse_num) in existing:
                        total_skipped += 1
                        continue

                    verse_text = re.sub(r'\s+', ' ', verse_text).strip()
                    verses_to_insert.append({
                        'book_id': book_id,
                        'book_slug': slug,
                        'chapter': chap_num,
                        'verse': verse_num,
                        'text': verse_text,
                        'translation_id': 'crampon'
                    })

                if verses_to_insert:
                    for i in range(0, len(verses_to_insert), 100):
                        batch = verses_to_insert[i:i+100]
                        response = requests.post(f"{SUPABASE_BASE}/bible_verses", headers=HEADERS, json=batch)
                        if response.status_code == 201:
                            total_inserted += len(batch)
                            print(f"    Chapter {chap_num}: +{len(batch)} (total: {total_inserted})")
                        else:
                            print(f"    ERROR Chapter {chap_num}: {response.status_code}")
                            print(f"    {response.text[:200]}")

                chapters_processed += 1

    print("\n" + "="*60)
    print(f"DONE: {books_processed} books, {total_inserted} inserted, {total_skipped} skipped")
    print("="*60)

if __name__ == "__main__":
    main()
