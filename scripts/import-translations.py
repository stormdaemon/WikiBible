"""
Script d'import des traductions bibliques depuis scrollmapper/bible_databases
Supporte KJV, ASV, BBE, WEB, YLT depuis le dépôt GitHub
"""

import os
import sys
import requests
import time
import json
from typing import Dict, List
from dotenv import load_dotenv

# Charger les variables d'environnement
load_dotenv(dotenv_path='.env.local')

# Fix Windows console encoding
if sys.platform == 'win32':
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8')

# Configuration Supabase
SUPABASE_URL = os.getenv('NEXT_PUBLIC_SUPABASE_URL', 'https://gsqodedelzzbcqefoneb.supabase.co')
SUPABASE_KEY = os.getenv('SUPABASE_SERVICE_ROLE_KEY', os.getenv('NEXT_PUBLIC_SUPABASE_ANON_KEY', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdzcW9kZWRlbHp6YmNxZWZvbmViIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE3NTgxOTYsImV4cCI6MjA3NzMzNDE5Nn0.T67qlLmAFTFgTcqpUR-XaTGrsY6ZySoyof9UEteXDJI'))

if not SUPABASE_URL or not SUPABASE_KEY:
    print("❌ Erreur: Variables d'environnement Supabase manquantes")
    sys.exit(1)

SUPABASE_BASE = f"{SUPABASE_URL}/rest/v1"
HEADERS = {
    'apikey': SUPABASE_KEY,
    'Authorization': f'Bearer {SUPABASE_KEY}',
    'Content-Type': 'application/json',
    'Prefer': 'return=minimal'
}

# Base URL pour les fichiers bruts GitHub
SCROLLMAPPER_RAW_BASE = "https://raw.githubusercontent.com/scrollmapper/bible_databases/master/formats/txt"

# Traductions disponibles depuis scrollmapper (anglais)
TRANSLATIONS = [
    {'id': 'kjv', 'file': 'KJV.txt', 'name': 'King James Version'},
    {'id': 'asv', 'file': 'ASV.txt', 'name': 'American Standard Version'},
    {'id': 'bbe', 'file': 'BBE.txt', 'name': 'Bible in Basic English'},
    {'id': 'akjv', 'file': 'AKJV.txt', 'name': 'American King James Version'},
    {'id': 'ylt', 'file': 'YLT.txt', 'name': "Young's Literal Translation"},
]

# Mapping des livres scrollmapper vers nos IDs
# Ce mapping sera construit dynamiquement
BOOK_MAPPING = {}
POSITION_MAPPING = {}

def build_book_mapping():
    """Construit le mapping entre les noms de livres scrollmapper et nos UUIDs"""
    max_retries = 3
    for attempt in range(max_retries):
        try:
            print(f"  Tentative {attempt + 1}/{max_retries}...")
            response = requests.get(
                f"{SUPABASE_BASE}/bible_books?select=id,name,slug,position",
                headers=HEADERS,
                timeout=30
            )
            response.raise_for_status()
            books = response.json()

            for book in books:
                # Créer plusieurs variantes de noms
                BOOK_MAPPING[book['name'].lower()] = book['id']
                BOOK_MAPPING[book['slug'].lower()] = book['id']
                # Variante anglaise commune
                name_en = book.get('name_en', book['name']).lower()
                if name_en:
                    BOOK_MAPPING[name_en] = book['id']
                
                # Mapping par position
                if book.get('position'):
                    POSITION_MAPPING[book['position']] = book['id']

            print(f"✓ Mapping construit: {len(BOOK_MAPPING)} variantes de noms, {len(POSITION_MAPPING)} positions trouvées")
            # Debug des positions pour vérifier
            # print(f"  Mapping positions: {sorted(POSITION_MAPPING.keys())}")
            return True
        except Exception as e:
            print(f"  ⚠ Erreur tentative {attempt + 1}: {e}")
            if attempt < max_retries - 1:
                import time
                time.sleep(2)
            else:
                print(f"❌ Erreur construction mapping après {max_retries} tentatives")
                return False

def fetch_translation_file(filename: str) -> List[Dict]:
    """Télécharge un fichier de traduction depuis GitHub"""
    try:
        url = f"{SCROLLMAPPER_RAW_BASE}/{filename}"
        print(f"  📥 Téléchargement: {url}")
        response = requests.get(url, timeout=60)
        response.raise_for_status()

        # Parser le fichier
        # Format: [chapter:verse] Text
        # Avec des marqueurs ### Book Name
        verses = []
        current_book = None
        current_book_num = 0

        for line in response.text.split('\n'):
            line = line.strip()
            if not line:
                continue

            # Marqueur de nom de livre
            if line.startswith('### '):
                current_book = line[4:].strip()
                # Trouver le numéro du livre dans notre base
                # On utilisera la position pour faire correspondre
                current_book_num += 1
                print(f"    📖 Livre détecté: {current_book} (Position {current_book_num})")
                continue

            # Format de verset [chapter:verse]
            if line.startswith('[') and '] ' in line:
                try:
                    verse_marker_end = line.index(']')
                    verse_ref = line[1:verse_marker_end]  # chapter:verse
                    text = line[verse_marker_end + 2:]  # Texte après "] "

                    if ':' in verse_ref:
                        chapter_str, verse_str = verse_ref.split(':')
                        chapter = int(chapter_str)
                        verse = int(verse_str)

                        verses.append({
                            'book_num': current_book_num,
                            'chapter': chapter,
                            'verse': verse,
                            'text': text
                        })
                except (ValueError, IndexError) as e:
                    # Ignorer les lignes mal formatées
                    continue

        print(f"  ✓ {len(verses)} versets extraits")
        return verses

    except Exception as e:
        print(f"  ❌ Erreur téléchargement {filename}: {e}")
        return []

# Fonction get_book_id_by_position supprimée car remplacée par le cache POSITION_MAPPING

def insert_verses_batch(translation_id: str, verses: List[Dict]) -> bool:
    """Insère les versets par lots"""
    try:
        # Préparer les données avec mapping des positions vers UUIDs
        verses_data = []
        skipped = 0

        for v in verses:
            # Utilisation du cache au lieu de faire une requête API par verset
            book_id = POSITION_MAPPING.get(v['book_num'])
            
            if not book_id:
                # Log seulement la première fois pour chaque livre manquant pour éviter le spam
                if v['book_num'] not in [x.get('missing_book_num') for x in getattr(insert_verses_batch, 'logs', [])]:
                     print(f"  ❌ ERREUR CRITIQUE: Livre position {v['book_num']} non trouvé dans la base Supabase!")
                     if not hasattr(insert_verses_batch, 'logs'): insert_verses_batch.logs = []
                     insert_verses_batch.logs.append({'missing_book_num': v['book_num']})
                skipped += 1
                continue

            verses_data.append({
                'book_id': book_id,
                'chapter': v['chapter'],
                'verse': v['verse'],
                'text': v['text'],
                'translation_id': translation_id,
                'book_slug': None  # Sera mis à jour par un trigger si nécessaire
            })

        if skipped > 0:
            print(f"  ⚠ {skipped} versets ignorés (livre non trouvé)")

        if not verses_data:
            print(f"  ⚠ Aucun verset à insérer")
            return False

        # Insérer par lots de 500
        batch_size = 500
        for i in range(0, len(verses_data), batch_size):
            batch = verses_data[i:i + batch_size]
            response = requests.post(
                f"{SUPABASE_BASE}/bible_verses",
                headers=HEADERS,
                json=batch
            )
            response.raise_for_status()
            print(f"    ✓ Lot {i//batch_size + 1}/{(len(verses_data) + batch_size - 1)//batch_size}")

        print(f"  ✅ {len(verses_data)} versets insérés")
        return True

    except Exception as e:
        print(f"  ❌ Erreur insertion: {e}")
        return False

def main():
    """Fonction principale"""
    print("\n" + "=" * 70)
    print("🚀 IMPORT DES TRADUCTIONS BIBLIQUES (SCROLLMAPPER)")
    print("=" * 70)
    print(f"📚 Traductions: {len(TRANSLATIONS)}")
    print(f"💾 Base: {SUPABASE_URL}")
    print("=" * 70)

    # Construire le mapping des livres
    print("\n📖 Construction du mapping des livres...")
    if not build_book_mapping():
        sys.exit(1)

    print(f"\n⚠️  Ce script va importer les traductions depuis:")
    for t in TRANSLATIONS:
        print(f"  - {t['name']} ({t['id']})")

    print("\n🚀 Lancement automatique de l'import...")
    # Pas de confirmation nécessaire en mode automatique

    success_count = 0
    total_verses = 0

    for i, translation in enumerate(TRANSLATIONS, 1):
        print(f"\n{'=' * 70}")
        print(f"[{i}/{len(TRANSLATIONS)}] {translation['name']}")
        print('=' * 70)

        # Vérifier si déjà importée
        try:
            response = requests.get(
                f"{SUPABASE_BASE}/bible_verses?translation_id=eq.{translation['id']}&select=id",
                headers=HEADERS
            )
            if response.json() and len(response.json()) > 0:
                print(f"  ⚠ Traduction déjà importée ({len(response.json())} versets)")
                print(f"  ↳ Réimport automatique (suppression des anciens versets)...")
                # if choice.lower() != 'o':
                #     print("  ↳ Passé")
                #     continue
                # Supprimer les anciens versets
                print(f"  🗑️ Suppression des anciens versets...")
                requests.delete(
                    f"{SUPABASE_BASE}/bible_verses?translation_id=eq.{translation['id']}",
                    headers={**HEADERS, 'Prefer': 'return=representation'}
                )
        except:
            pass

        # Télécharger
        print(f"  📥 Téléchargement depuis GitHub...")
        verses = fetch_translation_file(translation['file'])
        if not verses:
            print(f"  ⚠ Passé (erreur ou fichier vide)")
            continue

        # Insérer
        print(f"  💾 Insertion dans Supabase...")
        if insert_verses_batch(translation['id'], verses):
            success_count += 1
            total_verses += len(verses)
        else:
            print(f"  ❌ Erreur lors de l'insertion")

        # Délai respectueux
        time.sleep(1)

    print("\n" + "=" * 70)
    print(f"✅ IMPORT TERMINÉ!")
    print(f"   📚 Traductions importées: {success_count}/{len(TRANSLATIONS)}")
    print(f"   📝 Versets totaux: {total_verses}")
    print("=" * 70)

if __name__ == '__main__':
    main()
