"""
Script d'importation AMÉLIORÉ de la Bible de Jérusalem depuis le PDF
Utilise pdfplumber avec layout=True et des regex robustes
"""

import os
import sys
import re
from typing import List, Dict, Tuple
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
    sys.exit(1)

SUPABASE_BASE = f"{SUPABASE_URL}/rest/v1"
HEADERS = {
    'apikey': SUPABASE_KEY,
    'Authorization': f'Bearer {SUPABASE_KEY}',
    'Content-Type': 'application/json',
    'Prefer': 'return=representation'
}

# Même mapping que l'original
BOOK_MAPPING = {
    'Genèse': 'Genesis', 'Exode': 'Exodus', 'Lévitique': 'Leviticus',
    'Nombres': 'Numbers', 'Deutéronome': 'Deuteronomy', 'Josué': 'Joshua',
    'Juges': 'Judges', 'Ruth': 'Ruth', '1 Samuel': '1 Samuel',
    '2 Samuel': '2 Samuel', '1 Rois': '1 Kings', '2 Rois': '2 Kings',
    '1 Chroniques': '1 Chronicles', '2 Chroniques': '2 Chronicles',
    'Esdras': 'Ezra', 'Néhémie': 'Nehemiah', 'Tobie': 'Tobit',
    'Judith': 'Judith', 'Esther': 'Esther', '1 Maccabées': '1 Maccabees',
    '2 Maccabées': '2 Maccabees', 'Job': 'Job', 'Psaumes': 'Psalms',
    'Proverbes': 'Proverbs', 'Qohélet': 'Ecclesiastes',
    'Cantique': 'Song of Solomon', 'Sagesse': 'Wisdom',
    'Siracide': 'Sirach', 'Isaïe': 'Isaiah', 'Jérémie': 'Jeremiah',
    'Lamentations': 'Lamentations', 'Baruch': 'Baruch', 'Ézéchiel': 'Ezekiel',
    'Daniel': 'Daniel', 'Osée': 'Hosea', 'Joël': 'Joel', 'Amos': 'Amos',
    'Abdias': 'Obadiah', 'Jonas': 'Jonah', 'Michée': 'Micah',
    'Nahum': 'Nahum', 'Habaquuc': 'Habakkuk', 'Sophonie': 'Zephaniah',
    'Aggée': 'Haggai', 'Zacharie': 'Zechariah', 'Malachie': 'Malachi',
    'Matthieu': 'Matthew', 'Marc': 'Mark', 'Luc': 'Luke', 'Jean': 'John',
    'Actes': 'Acts', 'Romains': 'Romans', '1 Corinthiens': '1 Corinthians',
    '2 Corinthiens': '2 Corinthians', 'Galates': 'Galatians',
    'Éphésiens': 'Ephesians', 'Philippiens': 'Philippians',
    'Colossiens': 'Colossians', '1 Thessaloniciens': '1 Thessalonicians',
    '2 Thessaloniciens': '2 Thessalonicians', '1 Timothée': '1 Timothy',
    '2 Timothée': '2 Timothy', 'Tite': 'Titus', 'Philémon': 'Philemon',
    'Hébreux': 'Hebrews', 'Jacques': 'James', '1 Pierre': '1 Peter',
    '2 Pierre': '2 Peter', '1 Jean': '1 John', '2 Jean': '2 John',
    '3 Jean': '3 John', 'Jude': 'Jude', 'Apocalypse': 'Revelation'
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
        print(f"❌ Erreur: {response.status_code}")
        sys.exit(1)

    books = response.json()
    print(f"✓ {len(books)} livres récupérés")
    return books

def parse_pdf_improved(pdf_path: str) -> List[Tuple[str, int, int, str]]:
    """
    Version AMÉLIORÉE du parsing PDF avec layout=True et regex robustes
    """
    print(f"📖 Parsing du PDF: {pdf_path}")

    try:
        import pdfplumber
    except ImportError:
        print("❌ pdfplumber manquant: pip install pdfplumber")
        sys.exit(1)

    verses = []
    current_book = None
    current_chapter = None
    stats = {'pages': 0, 'verses': 0, 'errors': 0}

    with pdfplumber.open(pdf_path) as pdf:
        total_pages = len(pdf.pages)
        print(f"📄 {total_pages} pages à traiter\n")

        for page_num, page in enumerate(pdf.pages, 1):
            if page_num % 10 == 0:
                print(f"   Page {page_num}/{total_pages}... ({stats['verses']} versets)")

            # Utiliser layout=True pour préserver la mise en page
            text = page.extract_text(layout=True)
            if not text:
                continue

            stats['pages'] += 1
            lines = text.split('\n')

            for line in lines:
                line = line.strip()
                if not line:
                    continue

                # 1. Détecter un nouveau livre (tout en majuscules)
                if re.match(r'^[A-ZÂÊÎÔÛÀÙÇÉÈ\s]+$', line) and len(line) < 40:
                    potential_book = line.strip()
                    if potential_book in BOOK_MAPPING:
                        current_book = potential_book
                        current_chapter = None
                        print(f"📖 Livre: {current_book}")
                        continue

                # 2. Détecter "Chapitre X" ou juste "X" (numéro)
                chapter_match = re.match(r'^Chapitre\s+(\d+)', line, re.IGNORECASE)
                if chapter_match:
                    current_chapter = int(chapter_match.group(1))
                    continue

                # Numéro seul = probablement un chapitre
                if line.isdigit() and int(line) < 200:
                    current_chapter = int(line)
                    continue

                # 3. Patterns MULTIPLES pour les versets
                verse_data = None

                # Pattern A: "Genèse 1, 1 Au commencement..." (avec nom du livre)
                pattern_a = re.match(r'^([A-Z][a-zàâéèêëîïôûùüç\s\'\-]+?)\s+(\d+)[\.,]\s*(\d+)\s+(.+)$', line)
                if pattern_a:
                    book_name = pattern_a.group(1).strip()
                    if book_name in BOOK_MAPPING:
                        verse_data = (
                            book_name,
                            int(pattern_a.group(2)),
                            int(pattern_a.group(3)),
                            pattern_a.group(4).strip()
                        )
                        current_book = book_name
                        current_chapter = int(pattern_a.group(2))

                # Pattern B: "1, 2 Au commencement..." (sans nom du livre)
                if not verse_data:
                    pattern_b = re.match(r'^(\d+)[\.,]\s*(\d+)\s+(.+)$', line)
                    if pattern_b and current_book:
                        verse_data = (
                            current_book,
                            int(pattern_b.group(1)),
                            int(pattern_b.group(2)),
                            pattern_b.group(3).strip()
                        )
                        current_chapter = int(pattern_b.group(1))

                # Pattern C: "1. Au commencement..." (numéro avec point)
                if not verse_data and current_book:
                    pattern_c = re.match(r'^(\d+)\.\s+(.+)$', line)
                    if pattern_c and current_chapter:
                        verse_data = (
                            current_book,
                            current_chapter,
                            int(pattern_c.group(1)),
                            pattern_c.group(2).strip()
                        )

                # Pattern D: "1 Au commencement..." (numéro espace texte)
                if not verse_data and current_book:
                    pattern_d = re.match(r'^(\d+)\s+([A-Z].+)$', line)
                    if pattern_d and current_chapter:
                        # Vérifier que le numéro n'est pas trop grand (pas un chapitre)
                        if int(pattern_d.group(1)) < 200:
                            verse_data = (
                                current_book,
                                current_chapter,
                                int(pattern_d.group(1)),
                                pattern_d.group(2).strip()
                            )

                if verse_data:
                    book_name, chapter, verse_num, text = verse_data

                    # Nettoyer le texte
                    text = re.sub(r'\s+', ' ', text)
                    text = text[:500]

                    if text and len(text) > 2:  # Éviter les versets vides/trop courts
                        verses.append((book_name, chapter, verse_num, text))
                        stats['verses'] += 1
                else:
                    # Détection des erreurs (lignes non reconnues)
                    if len(line) > 10 and not line.startswith('http'):
                        stats['errors'] += 1

    print(f"\n✓ Parsing terminé!")
    print(f"  Pages traitées: {stats['pages']}")
    print(f"  Versets extraits: {stats['verses']}")
    print(f"  Lignes non reconnues: {stats['errors']}")

    return verses

def insert_verses(verses: List[Tuple[str, int, int, str]], books: List[Dict]) -> None:
    """Insère les versets dans Supabase par lots de 100"""
    print(f"\n💾 Insertion dans Supabase...")

    book_id_map = {book['name']: book['id'] for book in books}
    batch_size = 100
    total_inserted = 0
    errors = []

    # Supprimer d'abord les anciens versets Jérusalem pour éviter les doublons
    print("⚠️  Suppression des anciens versets Jérusalem...")
    delete_response = requests.delete(
        f"{SUPABASE_BASE}/bible_verses",
        headers=HEADERS,
        params={'translation_id': 'eq.jerusalem'}
    )
    if delete_response.status_code in [200, 204]:
        print("✓ Anciens versets supprimés")
    else:
        print("⚠️  Impossible de supprimer (peut-être aucun verset existe)")

    # Insérer les nouveaux versets
    for i in range(0, len(verses), batch_size):
        batch = verses[i:i+batch_size]
        batch_data = []

        for book_name, chapter, verse_num, text in batch:
            book_id = book_id_map.get(book_name)
            if not book_id:
                errors.append(f"Livre introuvable: {book_name}")
                continue

            batch_data.append({
                'book_id': book_id,
                'chapter': chapter,
                'verse': verse_num,
                'text': text,
                'translation_id': 'jerusalem',
                'book_slug': book_name.lower()
                    .replace(' ', '-')
                    .replace('é', 'e').replace('è', 'e')
                    .replace('à', 'a').replace('ù', 'u')
                    .replace('ô', 'o').replace('î', 'i')
                    .replace('ê', 'e').replace('â', 'a')
            })

        if not batch_data:
            continue

        response = requests.post(
            f"{SUPABASE_BASE}/bible_verses",
            headers=HEADERS,
            json=batch_data
        )

        if response.status_code == 201:
            total_inserted += len(batch_data)
            print(f"   {total_inserted}/{len(verses)} versets insérés...")
        else:
            # Ignorer les erreurs et continuer
            if response.status_code not in [400, 409]:
                print(f"   ⚠️  Erreur batch {i}: {response.status_code} (continué)")
            errors.append(f"Batch {i}: {response.status_code}")

    print(f"\n✓ {total_inserted} versets insérés avec succès")

    if errors:
        print(f"\n⚠️  {len(errors)} erreurs:")
        for err in errors[:10]:
            print(f"   - {err}")

def main():
    print("🙏 IMPORT BIBLE DE JÉRUSALEM - VERSION AMÉLIORÉE")
    print("="*80)

    pdf_path = r"D:\Users\sebas\Desktop\dossier THEO\wikibible\scripts\Bible_de_Jerusalem.pdf"

    if not os.path.exists(pdf_path):
        print(f"❌ PDF non trouvé: {pdf_path}")
        sys.exit(1)

    # 1. Récupérer les livres
    books = fetch_books()

    # 2. Parser le PDF avec les nouveaux regex
    verses = parse_pdf_improved(pdf_path)

    if not verses:
        print("❌ Aucun verset extrait!")
        sys.exit(1)

    # 3. Insérer dans Supabase
    insert_verses(verses, books)

    print("\n" + "="*80)
    print("✅ IMPORT TERMINÉ!")
    print("="*80)

if __name__ == "__main__":
    main()
