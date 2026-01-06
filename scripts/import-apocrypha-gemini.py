"""
Script d'import des textes apocryphes avec traduction via Gemini 3 Flash
Utilise l'API get.bible pour récupérer les textes et Vertex AI pour la traduction
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

# Configuration Google Cloud
SERVICE_ACCOUNT_FILE = 'project-5c40c540-b58f-4386-874-37fcd1d6ead0.json'
PROJECT_ID = 'project-5c40c540-b58f-4386-874'
LOCATION = 'global'  # Gemini 3 Flash utilise l'endpoint global
MODEL_ID = 'gemini-3-flash-preview'

# Configuration Supabase
SUPABASE_URL = os.getenv('NEXT_PUBLIC_SUPABASE_URL', '')
SUPABASE_KEY = os.getenv('NEXT_PUBLIC_SUPABASE_ANON_KEY', '')

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

# Mapping des livres apocryphes
APOCRYPHAL_BOOKS = [
    {'nr': 67, 'name': '1 Esdras', 'name_fr': '1 Esdras', 'slug': '1-esdras', 'category': 'apocrypha'},
    {'nr': 68, 'name': '2 Esdras', 'name_fr': '2 Esdras', 'slug': '2-esdras', 'category': 'apocrypha'},
    {'nr': 69, 'name': 'Tobit', 'name_fr': 'Tobie', 'slug': 'tobit', 'category': 'deutero'},
    {'nr': 70, 'name': 'Judith', 'name_fr': 'Judith', 'slug': 'judith', 'category': 'deutero'},
    {'nr': 71, 'name': 'Additions to Esther', 'name_fr': "Additions d'Esther", 'slug': 'additions-esther', 'category': 'deutero'},
    {'nr': 73, 'name': 'Wisdom', 'name_fr': 'Sagesse', 'slug': 'sagesse', 'category': 'deutero'},
    {'nr': 74, 'name': 'Sirach', 'name_fr': 'Siracide', 'slug': 'siracide', 'category': 'deutero'},
    {'nr': 75, 'name': 'Baruch', 'name_fr': 'Baruch', 'slug': 'baruch', 'category': 'deutero'},
    {'nr': 76, 'name': 'Prayer of Azariah', 'name_fr': "Prière d'Azariah", 'slug': 'priere-azariah', 'category': 'deutero'},
    {'nr': 77, 'name': 'Susanna', 'name_fr': 'Susanne', 'slug': 'susanna', 'category': 'deutero'},
    {'nr': 78, 'name': 'Bel and the Dragon', 'name_fr': 'Bel et le Dragon', 'slug': 'bel-dragon', 'category': 'deutero'},
    {'nr': 79, 'name': 'Prayer of Manasses', 'name_fr': 'Prière de Manassé', 'slug': 'priere-manasse', 'category': 'deutero'},
    {'nr': 80, 'name': '1 Maccabees', 'name_fr': '1 Maccabées', 'slug': '1-maccabees', 'category': 'deutero'},
    {'nr': 81, 'name': '2 Maccabees', 'name_fr': '2 Maccabées', 'slug': '2-maccabees', 'category': 'deutero'},
]

# Cache de traduction
TRANSLATION_CACHE = {}
CACHE_FILE = 'translation-cache-gemini.json'

# Client Gemini (initialisé plus tard)
gemini_client = None
access_token = None

def get_access_token():
    """Obtient un token d'accès via le service account"""
    global access_token
    
    try:
        from google.oauth2 import service_account
        from google.auth.transport.requests import Request
        
        credentials = service_account.Credentials.from_service_account_file(
            SERVICE_ACCOUNT_FILE,
            scopes=['https://www.googleapis.com/auth/cloud-platform']
        )
        credentials.refresh(Request())
        access_token = credentials.token
        print(f"✓ Token d'accès obtenu")
        return True
    except ImportError:
        print("❌ Installez google-auth: pip install google-auth")
        return False
    except Exception as e:
        print(f"❌ Erreur authentification: {e}")
        return False

def load_cache():
    """Charge le cache de traduction depuis le disque"""
    global TRANSLATION_CACHE
    if os.path.exists(CACHE_FILE):
        try:
            with open(CACHE_FILE, 'r', encoding='utf-8') as f:
                TRANSLATION_CACHE = json.load(f)
                print(f"📦 Cache chargé: {len(TRANSLATION_CACHE)} traductions")
        except:
            TRANSLATION_CACHE = {}

def save_cache():
    """Sauvegarde le cache de traduction sur le disque"""
    try:
        with open(CACHE_FILE, 'w', encoding='utf-8') as f:
            json.dump(TRANSLATION_CACHE, f, ensure_ascii=False, indent=2)
    except Exception as e:
        print(f"  ⚠ Erreur sauvegarde cache: {e}")

def translate_batch_gemini(texts: List[str]) -> List[str]:
    """Traduit un lot de textes via Gemini 3 Flash"""
    global access_token
    
    if not texts:
        return []
    
    # Vérifier le cache d'abord
    results = []
    texts_to_translate = []
    indices_to_translate = []
    
    for i, text in enumerate(texts):
        if text in TRANSLATION_CACHE:
            results.append(TRANSLATION_CACHE[text])
        else:
            results.append(None)
            texts_to_translate.append(text)
            indices_to_translate.append(i)
    
    if not texts_to_translate:
        return results
    
    # Préparer le prompt pour traduction en batch
    prompt = """Tu es un traducteur biblique expert. Traduis les versets suivants de l'anglais vers le français.
Conserve le style solennel et biblique. Réponds UNIQUEMENT avec les traductions, une par ligne, dans le même ordre.
Ne numérote pas les lignes. Ne rajoute aucun commentaire.

Versets à traduire:
"""
    for i, text in enumerate(texts_to_translate):
        prompt += f"{text}\n---\n"
    
    try:
        # Pour global, l'URL est différente (pas de préfixe région)
        if LOCATION == 'global':
            url = f"https://aiplatform.googleapis.com/v1/projects/{PROJECT_ID}/locations/{LOCATION}/publishers/google/models/{MODEL_ID}:generateContent"
        else:
            url = f"https://{LOCATION}-aiplatform.googleapis.com/v1/projects/{PROJECT_ID}/locations/{LOCATION}/publishers/google/models/{MODEL_ID}:generateContent"
        
        headers = {
            'Authorization': f'Bearer {access_token}',
            'Content-Type': 'application/json'
        }
        
        payload = {
            "contents": [{
                "role": "user",
                "parts": [{"text": prompt}]
            }],
            "generationConfig": {
                "temperature": 0.3,
                "maxOutputTokens": 65536  # Max pour Gemini 3 Flash
            }
        }
        
        response = requests.post(url, headers=headers, json=payload, timeout=600)  # Timeout augmenté
        response.raise_for_status()
        
        data = response.json()
        translated_text = data['candidates'][0]['content']['parts'][0]['text']
        
        # Parser les traductions (séparées par ---)
        translations = [t.strip() for t in translated_text.split('---') if t.strip()]
        
        # Si le nombre ne correspond pas, on utilise la réponse brute découpée par lignes
        if len(translations) != len(texts_to_translate):
            translations = [t.strip() for t in translated_text.split('\n') if t.strip()]
        
        # Remplir les résultats et le cache
        for i, idx in enumerate(indices_to_translate):
            if i < len(translations):
                results[idx] = translations[i]
                TRANSLATION_CACHE[texts_to_translate[i]] = translations[i]
            else:
                results[idx] = texts_to_translate[i]  # Fallback: texte original
        
        return results
        
    except Exception as e:
        print(f"    ⚠ Erreur traduction Gemini: {e}")
        # Fallback: retourner les textes originaux
        for i, idx in enumerate(indices_to_translate):
            results[idx] = texts_to_translate[i]
        return results

def fetch_from_getbible(book_nr: int):
    """Récupère un livre depuis get.bible API"""
    try:
        url = f"https://api.getbible.net/v2/kjva/{book_nr}.json"
        response = requests.get(url, timeout=30)
        response.raise_for_status()
        return response.json()
    except Exception as e:
        print(f"  ✗ Erreur récupération livre {book_nr}: {e}")
        return None

def extract_verses(book_data: Dict) -> List[Dict]:
    """Extrait les versets depuis la structure JSON de get.bible"""
    verses = []
    if 'chapters' in book_data:
        for chapter_info in book_data['chapters']:
            chapter_num = chapter_info.get('chapter', 1)
            if 'verses' in chapter_info:
                for verse_info in chapter_info['verses']:
                    verses.append({
                        'chapter': verse_info.get('chapter', chapter_num),
                        'verse': verse_info.get('verse', 1),
                        'text': verse_info.get('text', ''),
                    })
    return verses

def insert_book(book: Dict) -> str:
    """Insère un livre et retourne son ID"""
    try:
        book_data = {
            'name': book['name'],
            'name_fr': book['name_fr'],
            'slug': book['slug'],
            'source': 'getbible',
            'source_id': 'kjva',
            'category': book.get('category'),
            'chapters': book.get('chapters', 1),
            'description': f"Apocryphal book: {book['name']}",
            'description_fr': f"Livre apocryphe: {book['name_fr']}",
            'original_lang': 'en',
        }

        response = requests.post(
            f"{SUPABASE_BASE}/apocryphal_books",
            headers=HEADERS,
            json=book_data
        )
        response.raise_for_status()

        # Récupérer l'UUID
        time.sleep(0.5)
        response = requests.get(
            f"{SUPABASE_BASE}/apocryphal_books?slug=eq.{book['slug']}&select=id",
            headers=HEADERS
        )
        response.raise_for_status()
        data = response.json()
        if data and len(data) > 0:
            return data[0]['id']
        raise Exception("UUID non trouvé")

    except Exception as e:
        print(f"  ✗ Erreur insertion livre: {e}")
        return None

def insert_verses(book_id: str, verses: List[Dict]) -> bool:
    """Insère les versets par lots"""
    try:
        # Préparer les données
        verses_data = []
        for v in verses:
            verses_data.append({
                'book_id': book_id,
                'chapter': v['chapter'],
                'verse': v['verse'],
                'text_original': v['text_original'],
                'text_fr': v['text_fr'],
                'translation_id': 'gemini-3-flash'
            })

        # Insérer par lots de 100
        insert_batch_size = 500  # Batch d'insertion aussi augmenté
        for i in range(0, len(verses_data), insert_batch_size):
            batch = verses_data[i:i + insert_batch_size]
            response = requests.post(
                f"{SUPABASE_BASE}/apocryphal_verses",
                headers=HEADERS,
                json=batch
            )
            response.raise_for_status()
            print(f"    ✓ Lot {i//insert_batch_size + 1}/{(len(verses_data) + insert_batch_size - 1)//insert_batch_size}")

        return True

    except Exception as e:
        print(f"  ✗ Erreur insertion versets: {e}")
        return False

def main():
    """Fonction principale"""
    print("\n" + "=" * 70)
    print("🚀 IMPORT APOCRYPHES AVEC GEMINI 3 FLASH")
    print("=" * 70)
    print(f"📚 Livres: {len(APOCRYPHAL_BOOKS)}")
    print(f"🤖 Modèle: {MODEL_ID}")
    print(f"💾 Base: {SUPABASE_URL}")
    print("=" * 70)

    # Authentification Google Cloud
    print("\n🔐 Authentification Google Cloud...")
    if not get_access_token():
        sys.exit(1)

    # Charger le cache
    load_cache()

    print("\n⚠️  Ce script va:")
    print("  1. Récupérer les textes depuis get.bible API")
    print("  2. Traduire par lots via Gemini 3 Flash")
    print("  3. Insérer les données dans Supabase")
    print(f"\n📦 Cache actuel: {len(TRANSLATION_CACHE)} traductions")

    confirm = input("\nContinuer? (o/n): ")
    if confirm.lower() != 'o':
        print("❌ Annulation")
        sys.exit(0)

    success_count = 0
    total_verses = 0

    for i, book in enumerate(APOCRYPHAL_BOOKS, 1):
        print(f"\n{'=' * 70}")
        print(f"[{i}/{len(APOCRYPHAL_BOOKS)}] {book['name_fr']}")
        print('=' * 70)

        # Récupérer
        print(f"  📥 Récupération depuis get.bible...")
        book_data = fetch_from_getbible(book['nr'])
        if not book_data:
            continue

        # Extraire
        verses = extract_verses(book_data)
        print(f"  ✓ {len(verses)} versets extraits")
        sys.stdout.flush()

        # Traduire par lots de 800 versets
        print(f"  🔤 Traduction via Gemini 3 Flash...")
        sys.stdout.flush()
        
        translated_verses = []
        batch_size = 300  # Batch réduit à 300 (sécurité timeout)
        
        for batch_start in range(0, len(verses), batch_size):
            batch_end = min(batch_start + batch_size, len(verses))
            batch = verses[batch_start:batch_end]
            
            texts = [v['text'] for v in batch]
            translations = translate_batch_gemini(texts)
            
            for j, v in enumerate(batch):
                translated_verses.append({
                    'chapter': v['chapter'],
                    'verse': v['verse'],
                    'text_original': v['text'],
                    'text_fr': translations[j] if j < len(translations) else v['text'],
                })
            
            print(f"    Traduit: {batch_end}/{len(verses)}", end='\r')
            sys.stdout.flush()
            time.sleep(0.5)  # Rate limiting prudent avec gros batches

        print(f"  ✓ {len(translated_verses)} versets traduits    ")

        # Insérer le livre
        print(f"  💾 Insertion dans Supabase...")
        book_id = insert_book({
            'name': book['name'],
            'name_fr': book['name_fr'],
            'slug': book['slug'],
            'category': book['category'],
            'chapters': len(set(v['chapter'] for v in translated_verses)),
        })

        if not book_id:
            continue

        print(f"  ✓ Livre inséré (ID: {book_id[:8]}...)")

        # Insérer les versets
        if insert_verses(book_id, translated_verses):
            print(f"  ✅ {len(translated_verses)} versets insérés!")
            success_count += 1
            total_verses += len(translated_verses)
        else:
            print(f"  ✗ Erreur lors de l'insertion des versets")

        # Sauvegarder le cache
        save_cache()

        # Délai entre les livres
        time.sleep(1)

    # Sauvegarde finale du cache
    save_cache()

    print("\n" + "=" * 70)
    print(f"✅ IMPORT TERMINÉ!")
    print(f"   📚 Livres importés: {success_count}/{len(APOCRYPHAL_BOOKS)}")
    print(f"   📝 Versets totaux: {total_verses}")
    print(f"   📦 Traductions en cache: {len(TRANSLATION_CACHE)}")
    print("=" * 70)

if __name__ == '__main__':
    main()
