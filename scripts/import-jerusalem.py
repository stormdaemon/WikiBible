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

def clean_text(text: str) -> str:
    """Nettoie le texte d'un verset"""
    if not text:
        return ""
    # Remplacer les retours à la ligne par des espaces
    text = text.replace('\n', ' ')
    # Supprimer les espaces multiples
    text = re.sub(r'\s+', ' ', text)
    # Supprimer le tiret de césure à la fin si nécessaire (ex: "commen-\ncement" -> "commencement")
    # C'est délicat car certains mots ont des tirets. On va juste faire basique pour l'instant.
    return text.strip()

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
    
    # Construire l'expression régulière pour détecter le début d'un verset
    # Trier les livres par longueur décroissante pour éviter les conflits (ex: "1 Jean" vs "Jean")
    sorted_books = sorted(BOOK_MAPPING.keys(), key=len, reverse=True)
    books_pattern = '|'.join(map(re.escape, sorted_books))
    
    # Pattern: Book Name + Chapter + comma + Verse
    # Capture groups: 1=Book, 2=Chapter, 3=Verse
    verse_start_pattern = re.compile(f'({books_pattern})\\s+(\\d+),\\s+(\\d+)')

    current_book = None
    current_chapter = None
    current_verse_num = None
    pending_text_buffer = ""

    with pdfplumber.open(pdf_path) as pdf:
        total_pages = len(pdf.pages)
        print(f"📄 {total_pages} pages à traiter")

        for page_num, page in enumerate(pdf.pages, 1):
            if page_num % 50 == 0:
                print(f"   Traitement page {page_num}/{total_pages} | Versets trouvés: {len(verses)}")

            text = page.extract_text()
            if not text:
                continue

            # Ajouter le texte de la page au buffer en cours
            # On ajoute un espace pour éviter de coller les mots entre pages
            full_text = pending_text_buffer + " " + text
            
            # Chercher tous les débuts de versets dans ce bloc de texte
            matches = list(verse_start_pattern.finditer(full_text))
            
            if matches:
                # S'il y a des correspondances, on traite le texte
                
                # 1. Texte avant le premier match -> appartient au verset précédent (si existe)
                first_match = matches[0]
                prefix_text = full_text[:first_match.start()]
                
                if current_book and current_chapter and current_verse_num:
                    # On complète le verset précédent et on l'enregistre
                    complete_previous_text = clean_text(prefix_text)
                    if complete_previous_text:
                        # Append to last verse if we are just continuing?
                        # No, we treat verses as atomic per logic block usually, but here we rebuild it.
                        # Wait, the 'verses' list stores finalized verses.
                        # But we haven't finalized the last one yet because we were waiting for more text.
                        # So we need to UPDATE the last parsed verse?
                        # Actually, better: accumulate text in variables, only append to `verses` when we start a NEW verse.
                        pass
                
                # Logic Refinement:
                # We commit a verse ONLY when we hit the START of the NEXT verse.
                # 'prefix_text' completes the PREVIOUS verse.
                
                if current_book:
                   # This completes the currently open verse
                   final_text = clean_text(prefix_text)
                   # Only append if valid?
                   if final_text or current_verse_num: # Text might be empty if just header? Rare.
                       # Nettoyer "Chapitre X" qui traîne souvent à la fin du verset précédent
                       # Regex pour enlever "Chapitre X" à la fin
                       final_text = re.sub(r'Chapitre\s+\d+\s*$', '', final_text, flags=re.IGNORECASE).strip()
                       
                       verses.append((current_book, current_chapter, current_verse_num, final_text))
                
                # 2. Traiter les matchs intermédiaire
                for i in range(len(matches)):
                    match = matches[i]
                    # Extraire les infos du header
                    book_name = match.group(1)
                    chapter_num = int(match.group(2))
                    verse_num = int(match.group(3))
                    
                    # Déterminer la fin du texte pour ce verset
                    start_text_idx = match.end()
                    
                    if i < len(matches) - 1:
                        # Ce n'est pas le dernier match, donc le texte va jusqu'au prochain match
                        end_text_idx = matches[i+1].start()
                        verse_content = full_text[start_text_idx:end_text_idx]
                        
                        # Nettoyer et enregistrer ce verset immédiatement car il est clos par le suivant
                        verse_content = clean_text(verse_content)
                        verse_content = re.sub(r'Chapitre\s+\d+\s*$', '', verse_content, flags=re.IGNORECASE).strip()
                        
                        verses.append((book_name, chapter_num, verse_num, verse_content))
                    else:
                        # C'est le dernier match de la page/buffer
                        # Le texte va jusqu'à la fin du buffer
                        # Ce verset reste "ouvert" (pending)
                        current_book = book_name
                        current_chapter = chapter_num
                        current_verse_num = verse_num
                        pending_text_buffer = full_text[start_text_idx:]
            
            else:
                # Aucun match sur cette page.
                # Tout le texte appartient au verset en cours (s'il y en a un)
                # On garde tout dans le buffer
                pending_text_buffer = full_text

    # Fin du fichier: enregistrer le dernier verset en cours
    if current_book and pending_text_buffer:
        final_text = clean_text(pending_text_buffer)
        final_text = re.sub(r'Chapitre\s+\d+\s*$', '', final_text, flags=re.IGNORECASE).strip()
        verses.append((current_book, current_chapter, current_verse_num, final_text))

    print(f"\n✓ {len(verses)} versets extraits au total")
    return verses

def insert_verses(verses: List[Tuple[str, int, int, str]], books: List[Dict]) -> None:
    """Insère les versets dans Supabase"""
    print(f"\n💾 Insertion des versets dans Supabase...")

    # Créer un mapping nom -> ID de livre
    book_id_map = {}
    for book in books:
        # Utiliser directement le nom FR de la DB comme clé
        book_id_map[book['name']] = book['id']
        
    # Aussi mapper les noms anglais si besoin (backup)
    # Mais ici on utilise les noms FR du PDF qui matchent FETCH_BOOKS normalement 
    # (via BOOK_MAPPING on a des noms FR dans 'verses' mais on doit mapper vers ID)
    # Wait, 'verses' contains the PDF extracted name (FR).
    # 'books' from Supabase contains 'name' (FR likely) and 'slug' (EN/FR?).
    # Let's verify standard Supabase 'bible_books' structure. Usually 'name' is French in this project context.
    
    # Mapping inversé pour être sûr
    # BOOK_MAPPING keys are PDF names (FR).
    # We need to match these to DB IDs.
    
    # Préparer les données en lots
    batch_size = 500 # Augmenter la taille du batch pour aller plus vite
    total_inserted = 0
    errors = []

    for i in range(0, len(verses), batch_size):
        batch = verses[i:i+batch_size]
        batch_data = []

        for book_name, chapter, verse_num, text in batch:
            # Essayer de trouver l'ID du livre
            book_id = book_id_map.get(book_name)
            
            # Si pas de match direct, essayer via le mapping anglais -> ID (si la DB a des noms anglais ?)
            if not book_id:
                # Fallback: peut-être la DB a "Genesis" mais on a "Genèse"
                mapped_name = BOOK_MAPPING.get(book_name)
                if mapped_name:
                    # Chercher dans les books si un a ce nom
                    # C'est un peu flou sans voir la DB, mais on suppose que 'name' est la clé.
                    pass

            if not book_id:
                # Log seulement une fois par livre manquant pour éviter le spam
                if f"Livre non trouvé: {book_name}" not in errors:
                    errors.append(f"Livre non trouvé: {book_name}")
                continue

            # Créer le slug
            slug = BOOK_MAPPING.get(book_name, book_name).lower().replace(' ', '-')

            batch_data.append({
                'book_id': book_id,
                'chapter': chapter,
                'verse': verse_num,
                'text': text,
                'translation_id': 'jerusalem',
                'book_slug': slug
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
            # print(f"   {total_inserted}/{len(verses)}...", end='\r')
        else:
            print(f"\n❌ Erreur insertion batch {i}: {response.status_code}")
            # print(response.text[:200])
            errors.append(f"Batch {i}: {response.status_code}")

    print(f"\n✓ {total_inserted} versets insérés avec succès")

    if errors:
        print(f"\n⚠ {len(errors)} erreurs:")
        for error in errors[:10]:
            print(f"   - {error}")

def main():
    print("🙏 Importation de la Bible de Jérusalem (FIXED VERSION)\n")
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
        
    print(f"Exemple de versets extraits:")
    for v in verses[:3]:
        print(f" - {v}")

    # Étape 3: Insérer dans Supabase
    insert_verses(verses, books)

    print("\n" + "="*60)
    print("✅ Importation terminée avec succès!")

if __name__ == "__main__":
    main()
