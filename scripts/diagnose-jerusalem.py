"""
Script de diagnostic pour analyser le format du PDF de la Bible de Jérusalem
Ce script va extraire des échantillons de pages pour comprendre le formatage
"""

import os
import sys
import re

# Fix Windows console encoding
if sys.platform == 'win32':
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8')

def diagnose_pdf(pdf_path: str, sample_pages: int = 50) -> None:
    """Analyse le PDF et montre des échantillons de lignes"""
    print(f"🔍 Diagnostic du PDF: {pdf_path}\n")
    print("="*80)

    try:
        import pdfplumber
    except ImportError:
        print("❌ pdfplumber n'est pas installé")
        print("Installez-le avec: pip install pdfplumber")
        sys.exit(1)

    if not os.path.exists(pdf_path):
        print(f"❌ Fichier PDF non trouvé: {pdf_path}")
        sys.exit(1)

    with pdfplumber.open(pdf_path) as pdf:
        total_pages = len(pdf.pages)
        print(f"📄 Total pages: {total_pages}\n")

        # Analyser les premières pages pour comprendre la structure
        pages_to_analyze = min(sample_pages, total_pages)

        print(f"📖 Analyse des {pages_to_analyze} premières pages...\n")

        for page_num in range(1, pages_to_analyze + 1):
            page = pdf.pages[page_num - 1]
            text = page.extract_text()

            if not text:
                continue

            lines = text.split('\n')

            print(f"\n{'='*80}")
            print(f"PAGE {page_num}")
            print(f"{'='*80}\n")

            # Afficher les 30 premières lignes non vides
            count = 0
            for i, line in enumerate(lines):
                line = line.strip()
                if not line:
                    continue

                count += 1
                if count > 30:
                    break

                # Afficher la ligne avec son numéro
                print(f"{i+1:3d}: {line[:100]}")  # Limiter à 100 chars

                # Détecter les patterns potentiels
                if re.match(r'^[0-9A-ZÂÊÎÔÛÀÙÇÉÈ\s]+$', line) and len(line) < 30:
                    print(f"     ⚠️  POSSIBLE NOM DE LIVRE")

                if re.match(r'^Chapitre\s+\d+', line, re.IGNORECASE):
                    print(f"     ⚠️  CHAPITRE")

                if re.match(r'^\d+$', line):
                    print(f"     ⚠️  NUMÉRO SEUL (chapitre?)")

                if re.match(r'^[\w\s\'\-]+?\s+\d+[\.,]\s*\d+', line):
                    print(f"     ⚠️  POSSIBLE VERSET")

            # Demander à l'utilisateur de continuer
            if page_num % 5 == 0:
                input(f"\n⏸️  Appuyez sur Entrée pour continuer...")

def find_verse_patterns(pdf_path: str) -> None:
    """Cherche tous les patterns possibles de versets dans le PDF"""
    print(f"\n\n{'='*80}")
    print("🔍 RECHERCHE DE PATTERNS DE VERSETS")
    print(f"{'='*80}\n")

    try:
        import pdfplumber
    except ImportError:
        return

    with pdfplumber.open(pdf_path) as pdf:
        verse_patterns = {}

        for page_num, page in enumerate(pdf.pages[:100], 1):  # 100 premières pages
            text = page.extract_text()
            if not text:
                continue

            lines = text.split('\n')

            for line in lines:
                line = line.strip()
                if not line or len(line) < 5:
                    continue

                # Pattern 1: "Livre Chapitre, Verset Texte"
                if re.match(r'^[\w\s\'\-]+?\s+\d+[\.,]\s*\d+', line):
                    if 'pattern1' not in verse_patterns:
                        verse_patterns['pattern1'] = []
                    if len(verse_patterns['pattern1']) < 10:
                        verse_patterns['pattern1'].append(line[:80])

                # Pattern 2: "Chapitre, Verset Texte" (sans nom du livre)
                if re.match(r'^\d+[\.,]\s*\d+\s+.+', line):
                    if 'pattern2' not in verse_patterns:
                        verse_patterns['pattern2'] = []
                    if len(verse_patterns['pattern2']) < 10:
                        verse_patterns['pattern2'].append(line[:80])

                # Pattern 3: "Verset. Texte" (numéro seul au début)
                if re.match(r'^\d+\.\s+.+', line):
                    if 'pattern3' not in verse_patterns:
                        verse_patterns['pattern3'] = []
                    if len(verse_patterns['pattern3']) < 10:
                        verse_patterns['pattern3'].append(line[:80])

        # Afficher les résultats
        for pattern_name, examples in verse_patterns.items():
            print(f"\n📋 {pattern_name.upper()}:")
            print("-" * 80)
            for ex in examples:
                print(f"  {ex}")

def main():
    pdf_path = r"D:\Users\sebas\Desktop\dossier THEO\wikibible\scripts\Bible_de_Jerusalem.pdf"

    print("🔬 DIAGNOSTIC DE LA BIBLE DE JÉRUSALEM")
    print("="*80)

    # Étape 1: Diagnostiquer le format
    diagnose_pdf(pdf_path, sample_pages=20)

    # Étape 2: Trouver les patterns de versets
    find_verse_patterns(pdf_path)

    print("\n\n" + "="*80)
    print("✅ Diagnostic terminé!")
    print("="*80)

if __name__ == "__main__":
    main()
