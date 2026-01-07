"""
Script de test pour analyser la structure du PDF de la Bible de Jérusalem
"""

import sys
import re

if sys.platform == 'win32':
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

import pdfplumber

pdf_path = r"D:\Users\sebas\Desktop\dossier THEO\wikibible\scripts\Bible_de_Jerusalem.pdf"

print("🔍 Analyse de la structure du PDF...")
print("="*80)

with pdfplumber.open(pdf_path) as pdf:
    print(f"📄 Total pages: {len(pdf.pages)}\n")

    # Analyser les 5 premières pages
    for page_num in [1, 10, 50, 100, 200]:
        if page_num > len(pdf.pages):
            break

        print(f"\n{'='*80}")
        print(f"PAGE {page_num}")
        print('='*80)

        page = pdf.pages[page_num - 1]
        text = page.extract_text()

        if text:
            lines = text.split('\n')
            print(f"Nombre de lignes: {len(lines)}")
            print("\n--- 20 premières lignes ---")
            for i, line in enumerate(lines[:20], 1):
                print(f"{i:3}: {repr(line)}")  # repr() pour voir les caractères invisibles
        else:
            print("Pas de texte extrait")

    # Chercher des patterns de versets connus
    print(f"\n{'='*80}")
    print("RECHERCHE DE PATTERNS")
    print('='*80)

    test_verses = [
        "Genèse 1:1",
        "Jean 3:16",
        "Psaume 23",
    ]

    for ref in test_verses:
        print(f"\n🔎 Recherche: {ref}")
        for page_num, page in enumerate(pdf.pages[:100], 1):  # Premieres 100 pages
            text = page.extract_text()
            if text and ref.split()[0].lower() in text.lower():
                lines = text.split('\n')
                for i, line in enumerate(lines):
                    if ref.split()[0].lower() in line.lower():
                        print(f"   Page {page_num}, ligne {i}: {line[:100]}")
                        break
                break
