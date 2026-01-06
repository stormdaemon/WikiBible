# 📜 Script d'Import des Textes Apocryphes

Ce script récupère automatiquement les textes apocryphes depuis les API get.bible et Sefaria, les traduit en français, et les importe dans Supabase.

## 📚 Sources de Données

### get.bible API (KJVA)
- **14 livres apocryphes/deutérocanoniques**
- 1 Esdras, 2 Esdras, Tobie, Judith, Sagesse, Siracide, Baruch, etc.
- URL: `https://api.getbible.net/v2/kjva.json`

### Sefaria API
- **Book of Jubilees** (texte du Second Temple)
- URL: `https://www.sefaria.org/api/v2/texts/Book_of_Jubilees`

## 🚀 Utilisation

### 1. Installer les dépendances Python

```bash
pip install supabase requests python-dotenv
```

### 2. Configurer les variables d'environnement

Créer un fichier `.env.local` à la racine :

```bash
SUPABASE_URL=votre_url_supabase
SUPABASE_SERVICE_KEY=votre_clé_service
```

### 3. Lancer l'import

```bash
# Option A : Utiliser le script Python
python scripts/import-apocrypha.py

# Option B : Utiliser le script TypeScript (nécessite compilation)
npx tsx scripts/fetch-apocrypha.ts
```

## 📊 Structure de la Base de Données

### Table `apocryphal_books`
- `id`: UUID (primary key)
- `name`: Nom anglais (ex: "Tobit")
- `name_fr`: Nom français (ex: "Tobie")
- `slug`: Slug pour l'URL (ex: "tobit")
- `source`: 'getbible' ou 'sefaria'
- `category`: 'deutero', 'apocrypha', 'second_temple', 'dss'
- `chapters`: Nombre de chapitres
- `description`: Description anglaise
- `description_fr`: Description française

### Table `apocryphal_verses`
- `id`: UUID (primary key)
- `book_id`: Référence vers apocryphal_books
- `chapter`: Numéro de chapitre
- `verse`: Numéro de verset
- `text_original`: Texte original (anglais)
- `text_fr`: Texte français

## 🎨 Pages Disponibles

### `/apocrypha`
- Page d'accueil des textes apocryphes
- Liste organisée par catégorie
- Filtre par catégorie et recherche

### `/apocrypha/[slug]`
- Page de lecture individuelle d'un livre
- Navigation par chapitre
- Affichage bilingue (français + original)
- Lien permanent par verset

## 🌐 Traduction

Le script utilise actuellement un système de traduction placeholder. Pour activer la traduction automatique, plusieurs options :

### Option 1: DeepL API (Recommandée)
```python
import deepl

translator = deepl.Translator('YOUR_API_KEY')
result = translator.translate_text(text, target_lang='FR')
```

### Option 2: Google Translate
```python
from googletrans import Translator

translator = Translator()
result = translator.translate(text, dest='fr')
```

### Option 3: LibreTranslate (Open Source)
```python
import requests

def translate(text):
    response = requests.post('https://libretranslate.com/translate', json={
        'q': text,
        'source': 'en',
        'target': 'fr'
    })
    return response.json()['translatedText']
```

## 📝 Notes

- Les URLs GitHub initialement fournies (Sefaria-Export, dss-data, Bible-JSON) retournent toutes des 404
- Seules les API get.bible et Sefaria sont fonctionnelles
- La traduction est actuellement en placeholder (à configurer)
- Le script respecte les rate limits (500ms entre chaque requête)

## 🔄 Mise à jour

Pour ajouter de nouveaux livres :

1. Ajouter dans `APOCRYPHAL_BOOKS` (Python) ou `APOCRYPHAL_BOOKS` (TypeScript)
2. Lancer le script d'import
3. Les pages Next.js se mettront à jour automatiquement

## 🐛 Débugging

Si l'import échoue :
1. Vérifier les clés API Supabase
2. Tester les URLs API manuellement
3. Vérifier la structure JSON retournée
4. Consulter les logs dans la console
