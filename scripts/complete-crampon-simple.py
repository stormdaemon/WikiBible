import os, sys, xml.etree.ElementTree as ET, re
from dotenv import load_dotenv
import requests

load_dotenv('.env.local')

SUPABASE_URL = os.getenv('NEXT_PUBLIC_SUPABASE_URL', '')
SUPABASE_KEY = os.getenv('NEXT_PUBLIC_SUPABASE_ANON_KEY', '')
SUPABASE_BASE = f"{SUPABASE_URL}/rest/v1"
HEADERS = {'apikey': SUPABASE_KEY, 'Authorization': f'Bearer {SUPABASE_KEY}', 'Content-Type': 'application/json', 'Prefer': 'return=representation'}

BOOK_SLUG_MAP = {'Genèse': 'genese', 'Exode': 'exode', 'Lévitique': 'levitique', 'Nombres': 'nombres', 'Deutéronome': 'deuteronome', 'Josué': 'josue', 'Juges': 'juges', 'Ruth': 'ruth', '1 Samuel': '1-samuel', '2 Samuel': '2-samuel', '1 Rois': '1-rois', '2 Rois': '2-rois', '1 Chroniques': '1-chroniques', '2 Chroniques': '2-chroniques', 'Esdras': 'esdras', 'Néhémie': 'nehemie', 'Esther': 'esther', 'Job': 'job', 'Psaumes': 'psaumes', 'Proverbes': 'proverbes', 'Qohélet': 'ecclesiaste', 'Cantique': 'cantique', 'Isaïe': 'eesaie', 'Jérémie': 'jeremie', 'Lamentations': 'lamentations', 'Ézéchiel': 'ezechiel', 'Daniel': 'daniel', 'Osée': 'osee', 'Joël': 'joel', 'Amos': 'amos', 'Abdias': 'abdias', 'Jonas': 'jonas', 'Michée': 'michee', 'Nahum': 'nahum', 'Habaquuc': 'habacuc', 'Sophonie': 'sophonie', 'Aggée': 'aggee', 'Zacharie': 'zacharie', 'Malachie': 'malachie', 'Tobie': 'tobie', 'Judith': 'judith', 'Sagesse': 'sagesse', 'Siracide': 'siracide', 'Baruch': 'baruch', '1 Maccabées': '1-macchabees', '2 Maccabées': '2-macchabees', 'Matthieu': 'matthieu', 'Marc': 'marc', 'Luc': 'luc', 'Jean': 'jean', 'Actes': 'actes', 'Romains': 'romains', '1 Corinthiens': '1-corinthiens', '2 Corinthiens': '2-corinthiens', 'Galates': 'galates', 'Éphésiens': 'ephesiens', 'Philippiens': 'philippiens', 'Colossiens': 'colossiens', '1 Thessaloniciens': '1-thesaloniciens', '2 Thessaloniciens': '2-thesaloniciens', '1 Timothée': '1-timothee', '2 Timothée': '2-timothee', 'Tite': 'tite', 'Philémon': 'philemon', 'Hébreux': 'hebreux', 'Jacques': 'jacques', '1 Pierre': '1-pierre', '2 Pierre': '2-pierre', '1 Jean': '1-jean', '2 Jean': '2-jean', '3 Jean': '3-jean', 'Jude': 'jude', 'Apocalypse': 'apocalypse'}

def fetch_books():
    print("Fetching books...")
    response = requests.get(f"{SUPABASE_BASE}/bible_books", headers=HEADERS, params={'order': 'position'})
    if response.status_code != 200:
        print(f"ERROR: {response.status_code}")
        sys.exit(1)
    return response.json()

def fetch_existing_verses(book_slug):
    response = requests.get(f"{SUPABASE_BASE}/bible_verses", headers=HEADERS, params={'book_slug': f'eq.{book_slug}', 'translation_id': 'eq.crampon', 'select': 'chapter,verse'})
    if response.status_code == 200:
        return set((v['chapter'], v['verse']) for v in response.json())
    return set()

def main():
    print("Completing Crampon Bible from XML")
    xml_path = r"D:\Users\sebas\Desktop\dossier THEO\wikibible\scripts\crampon.xml"
    
    if not os.path.exists(xml_path):
        print(f"ERROR: File not found {xml_path}")
        sys.exit(1)

    books = fetch_books()
    book_id_map = {b['slug']: b['id'] for b in books}
    
    tree = ET.parse(xml_path)
    root = tree.getroot()
    
    total_inserted = 0
    total_skipped = 0
    
    for testament in root.findall('.//testament'):
        print(f"\nTestament: {testament.get('name')}")
        
        for book in testament.findall('BOOK'):
            name_elem = book.find('NAME')
            book_name = name_elem.text if name_elem is not None else "UNKNOWN"
            print(f"\n{book_name}")
            
            if book_name not in BOOK_SLUG_MAP:
                print(f"  SKIP: No mapping for {book_name}")
                continue
            
            slug = BOOK_SLUG_MAP[book_name]
            book_id = book_id_map.get(slug)
            
            if not book_id:
                print(f"  SKIP: Book ID not found for {slug}")
                continue
            
            existing = fetch_existing_verses(slug)
            print(f"  Existing verses: {len(existing)}")
            
            for chapter in book.findall('CHAPTER'):
                chap_num = int(chapter.get('bnumber'))
                verses_to_insert = []
                
                for verse in chapter.findall('VERS'):
                    verse_num = int(verse.get('vnumber'))
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
                            print(f"    Chapter {chap_num}: +{len(batch)} verses (total: {total_inserted})")
                        else:
                            print(f"    ERROR Chapter {chap_num}: {response.status_code}")
    
    print(f"\nDone: {total_inserted} inserted, {total_skipped} skipped")

if __name__ == "__main__":
    main()
