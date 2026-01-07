"""
Script d'importation de la Bible de Jérusalem depuis le PDF
Utilise pdfplumber pour extraire le texte et parser les versets
"""

import os
import sys
import re
import json
from typing import List, Dict, Optional, Tuple
from dotenv import load_dotenv
import requests

# Fix Windows console encoding
if sys.platform == 'win32':
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8')

# Charger les variables d'environnement
load_dotenv('.env.local')

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

# Mapping des noms de livres Français -> Anglais (pour correspondre à la DB)
BOOK_MAPPING = {
    'Genèse': 'Genesis',
    'Exode': 'Exodus',
    'Lévitique': 'Leviticus',
    'Nombres': 'Numbers',
    'Deutéronome': 'Deuteronomy',
    'Josué': 'Joshua',
    'Juges': 'Judges',
    'Ruth': 'Ruth',
    '1 Samuel': '1 Samuel',
    '2 Samuel': '2 Samuel',
    '1 Rois': '1 Kings',
    '2 Rois': '2 Kings',
    '1 Chroniques': '1 Chronicles',
    '2 Chroniques': '2 Chronicles',
    'Esdras': 'Ezra',
    'Néhémie': 'Nehemiah',
    'Tobie': 'Tobit',
    'Judith': 'Judith',
    'Esther': 'Esther',
    '1 Maccabées': '1 Maccabees',
    '2 Maccabées': '2 Maccabees',
    'Job': 'Job',
    'Psaumes': 'Psalms',
    'Proverbes': 'Proverbs',
    'Qohélet': 'Ecclesiastes',
    'Cantique': 'Song of Solomon',
    'Sagesse': 'Wisdom',
    'Siracide': 'Sirach',
    'Isaïe': 'Isaiah',
    'Jérémie': 'Jeremiah',
    'Lamentations': 'Lamentations',
    'Baruch': 'Baruch',
    'Ézéchiel': 'Ezekiel',
    'Daniel': 'Daniel',
    'Osée': 'Hosea',
    'Joël': 'Joel',
    'Amos': 'Amos',
    'Abdias': 'Obadiah',
    'Jonas': 'Jonah',
    'Michée': 'Micah',
    'Nahum': 'Nahum',
    'Habaquuc': 'Habakkuk',
    'Sophonie': 'Zephaniah',
    'Aggée': 'Haggai',
    'Zacharie': 'Zechariah',
    'Malachie': 'Malachi',
    'Matthieu': 'Matthew',
    'Marc': 'Mark',
    'Luc': 'Luke',
    'Jean': 'John',
    'Actes': 'Acts',
    'Romains': 'Romans',
    '1 Corinthiens': '1 Corinthians',
    '2 Corinthiens': '2 Corinthians',
    'Galates': 'Galatians',
    'Éphésiens': 'Ephesians',
    'Philippiens': 'Philippians',
    'Colossiens': 'Colossians',
    '1 Thessaloniciens': '1 Thessalonians',
    '2 Thessaloniciens': '2 Thessalonians',
    '1 Timothée': '1 Timothy',
    '2 Timothée': '2 Timothy',
    'Tite': 'Titus',
    'Philémon': 'Philemon',
    'Hébreux': 'Hebrews',
    'Jacques': 'James',
    '1 Pierre': '1 Peter',
    '2 Pierre': '2 Peter',
    '1 Jean': '1 John',
    '2 Jean': '2 John',
    '3 Jean': '3 John',
    'Jude': 'Jude',
    'Apocalypse': 'Revelation'
}

def fetch_books() -> List[Dict]:
    """Récupère la liste des livres depuis Supabase"""
    print("📚 Récupération des livres depuis Supabase...")

    response = requests.get(
        f"{SUPABASE_BASE}/bible_books",
        headers=HEADERS,
        params={'order': 'position'}
    )

    if response.status_code != 200:
        print(f"❌ Erreur récupération livres: {response.status_code}")
        print(response.text)
        sys.exit(1)

    books = response.json()
    print(f"✓ {len(books)} livres récupérés")
    return books

def parse_pdf_text(pdf_path: str) -> List[Tuple[str, int, int, str]]:
    """
    Extrait et parse le texte du PDF de la Bible de Jérusalem
    Retourne: List[(book_name, chapter, verse, text)]
    """
    print(f"📖 Ouverture du PDF: {pdf_path}")

    try:
        import pdfplumber
    except ImportError:
        print("❌ pdfplumber n'est pas installé")
        print("Installez-le avec: pip install pdfplumber")
        sys.exit(1)

    verses = []
    current_book = None
    current_chapter = None

    with pdfplumber.open(pdf_path) as pdf:
        total_pages = len(pdf.pages)
        print(f"📄 {total_pages} pages à traiter")

        for page_num, page in enumerate(pdf.pages, 1):
            if page_num % 10 == 0:
                print(f"   Page {page_num}/{total_pages}...")

            text = page.extract_text()
            if not text:
                continue

            lines = text.split('\n')

            for line in lines:
                line = line.strip()
                if not line:
                    continue

                # Pattern pour détecter un nouveau livre: "GENÈSE" ou "1 SAMUEL"
                book_match = re.match(r'^([0-9A-ZÂÊÎÔÛÀÙÇÉÈ\s]+)$', line)
                if book_match and len(line) < 30:
                    potential_book = book_match.group(1).strip()
                    # Vérifier si c'est dans notre mapping
                    if potential_book in BOOK_MAPPING:
                        current_book = potential_book
                        current_chapter = None
                        print(f"\n📖 Livre trouvé: {current_book}")
                        continue

                # Pattern pour détecter chapitre: "Chapitre 1" ou "1"
                chapter_match = re.match(r'^Chapitre\s+(\d+)$', line, re.IGNORECASE)
                if chapter_match:
                    current_chapter = int(chapter_match.group(1))
                    continue

                # Pattern pour détecter numéro seul au début (chapitre)
                if line.isdigit() and current_book:
                    current_chapter = int(line)
                    continue

                # Pattern pour verset: "Genèse 3, 17 A l'homme, il dit..."
                verse_match = re.match(r'^([\w\s\'\-]+?)\s+(\d+),\s+(\d+)\s+(.+)$', line)
                if verse_match:
                    book_match = verse_match.group(1).strip()
                    chapter_num = int(verse_match.group(2))
                    verse_num = int(verse_match.group(3))
                    verse_text = verse_match.group(4).strip()

                    # Vérifier que le livre correspond
                    if book_match in BOOK_MAPPING:
                        current_book = book_match
                        current_chapter = chapter_num

                        # Nettoyer le texte
                        verse_text = re.sub(r'\s+', ' ', verse_text)  # Espaces multiples
                        verse_text = verse_text[:500]  # Limiter la longueur si nécessaire

                        if verse_text:
                            verses.append((current_book, current_chapter, verse_num, verse_text))

    print(f"\n✓ {len(verses)} versets extraits")
    return verses

def insert_verses(verses: List[Tuple[str, int, int, str]], books: List[Dict]) -> None:
    """Insère les versets dans Supabase"""
    print(f"\n💾 Insertion des versets dans Supabase...")

    # Créer un mapping nom -> ID de livre
    book_id_map = {}
    for book in books:
        # Utiliser directement le nom FR de la DB comme clé
        book_id_map[book['name']] = book['id']

    # Préparer les données en lots
    batch_size = 100
    total_inserted = 0
    errors = []

    for i in range(0, len(verses), batch_size):
        batch = verses[i:i+batch_size]
        batch_data = []

        for book_name, chapter, verse_num, text in batch:
            book_id = book_id_map.get(book_name)
            if not book_id:
                errors.append(f"Livre non trouvé: {book_name}")
                continue

            batch_data.append({
                'book_id': book_id,
                'chapter': chapter,
                'verse': verse_num,
                'text': text,
                'translation_id': 'jerusalem',
                'book_slug': book_name.lower().replace(' ', '-').replace('é', 'e').replace('è', 'e').replace('à', 'a').replace('ù', 'u').replace('ô', 'o').replace('î', 'i').replace('ê', 'e')
            })

        if not batch_data:
            continue

        # Insérer le batch
        response = requests.post(
            f"{SUPABASE_BASE}/bible_verses",
            headers=HEADERS,
            json=batch_data
        )

        if response.status_code == 201:
            total_inserted += len(batch_data)
            print(f"   {total_inserted}/{len(verses)} versets insérés...")
        else:
            print(f"❌ Erreur insertion batch: {response.status_code}")
            print(response.text[:500])
            errors.append(f"Batch {i}-{i+len(batch)}: {response.status_code}")

    print(f"\n✓ {total_inserted} versets insérés avec succès")

    if errors:
        print(f"\n⚠ {len(errors)} erreurs:")
        for error in errors[:10]:  # Afficher les 10 premières
            print(f"   - {error}")
        if len(errors) > 10:
            print(f"   ... et {len(errors)-10} autres")

def main():
    print("🙏 Importation de la Bible de Jérusalem\n")
    print("="*60)

    # Chemin du PDF
    pdf_path = r"D:\Users\sebas\Desktop\dossier THEO\wikibible\scripts\Bible_de_Jerusalem.pdf"

    if not os.path.exists(pdf_path):
        print(f"❌ Fichier PDF non trouvé: {pdf_path}")
        sys.exit(1)

    # Étape 1: Récupérer les livres
    books = fetch_books()

    # Étape 2: Parser le PDF
    verses = parse_pdf_text(pdf_path)

    if not verses:
        print("❌ Aucun verset extrait du PDF")
        sys.exit(1)

    # Étape 3: Insérer dans Supabase
    insert_verses(verses, books)

    print("\n" + "="*60)
    print("✅ Importation terminée avec succès!")

if __name__ == "__main__":
    main()
