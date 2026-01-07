# 📖 Guide d'Importation Biblique via GetBible API
*Wiki Catholic Project - Data Import Strategy*

**Date**: 2025-01-07
**API Documentation**: https://getbible.life/docs
**API Base URL**: `https://api.getbible.net/v2/`

---

## 🌍 Translations Disponibles pour Wiki Catholic

### ✅ 1. Ancien Testament en Hébreu (Massorétique)

#### Option A: Aleppo Codex ⭐ RECOMMANDÉ
- **Code API**: `aleppo`
- **Nom complet**: Aleppo Codex
- **Langue**: Hébreu biblique (hbo)
- **Description**: Le Codex d'Alep, manuscrit hébreu le plus autoritaire du texte massorétique
- **Couverture**: 39 livres (Ancien Testament protestant/canon hébreu)
- **URL API**: `https://api.getbible.net/v2/aleppo.json`
- **Structure**:
  ```
  https://api.getbible.net/v2/aleppo.json                    # Toute la traduction
  https://api.getbible.net/v2/aleppo/[book_nr].json         # Un livre
  https://api.getbible.net/v2/aleppo/[book_nr]/[chapter].json # Un chapitre
  ```

#### Option B: Westminster Leningrad Codex
- **Code API**: `codex`
- **Nom complet**: Westminster Leningrad Codex
- **Langue**: Hébreu biblique (hbo)
- **Description**: Codex de Leningrad, texte massorétique complet
- **Couverture**: 39 livres
- **URL API**: `https://api.getbible.net/v2/codex.json`

---

### ✅ 2. Ancien Testament en Grec (Septante)

#### Septuaginta (LXX) - Rahlfs ⭐ SEULE SOURCE COMPLÈTE AVEC DEUTÉROCANONIQUES
- **Code API**: `lxx`
- **Nom complet**: OT LXX Accented (Septuagint, Morphologically Tagged Rahlfs')
- **Langue**: Grec ancien (grc)
- **Description**: Septante avec morphologie (édition Rahlfs)
- **Couverture**: **54 livres** ✅ INCLUT LES LIVRES DEUTÉROCANONIQUES
- **URL API**: `https://api.getbible.net/v2/lxx.json`
- **Structure**:
  ```
  https://api.getbible.net/v2/lxx/[1-54]/[1-150].json
  ```

**⚠️ IMPORTANT**: La Septante est la SEULE traduction grecque qui contient tous les livres deutérocanoniques (Tobie, Judith, Sagesse, Siracide, Baruch, 1-2 Maccabées).

**Exemple de texte** (Genèse 1:1):
```
ἐν ἀρχῇ ἐποίησεν ὁ θεὸς τὸν οὐρανὸν καὶ τὴν γῆν
"Au commencement Dieu fit le ciel et la terre"
```

---

### ✅ 3. Nouveau Testament en Grec

#### Option A: Textus Receptus ⭐ TRADITIONNEL
- **Code API**: `textusreceptus`
- **Nom complet**: NT Textus Receptus (1550 1894) Parsed
- **Langue**: Grec ancien (grc)
- **Description**: Textus Receptus (éditions 1550/1894) avec morphologie
- **Couverture**: 27 livres (Nouveau Testament complet)
- **URL API**: `https://api.getbible.net/v2/textusreceptus.json`

#### Option B: Tischendorf 8th Edition ⭐ CRITIQUE
- **Code API**: `tischendorf`
- **Nom complet**: NT Tischendorf 8th Ed
- **Langue**: Grec ancien (grc)
- **Description**: Édition critique du GNT par Tischendorf
- **Couverture**: 27 livres
- **URL API**: `https://api.getbible.net/v2/tischendorf.json`

#### Option C: Westcott & Hort with UBS4 variants
- **Code API**: `westcotthort`
- **Nom complet**: NT Westcott Hort UBS4 variants Parsed
- **Langue**: Grec ancien (grc)
- **Description**: Westcott & Hort avec variantes NA27/UBS4
- **Couverture**: 27 livres
- **URL API**: `https://api.getbible.net/v2/westcotthort.json`

**💡 RECOMMANDATION**: Utiliser **Textus Receptus** pour la tradition ou **Tischendorf** pour la critique.

---

### ✅ 4. Vulgata Latine (COMPLETE OT + NT) ⭐

- **Code API**: `vulgate`
- **Nom complet**: Vulgata Clementina
- **Langue**: Latin (la)
- **Description**: Clementine Vulgate (traduction latine officielle de l'Église catholique)
- **Couverture**: **73 livres** ✅ BIBLE COMPLÈTE AVEC DEUTÉROCANONIQUES
- **URL API**: `https://api.getbible.net/v2/vulgate.json`
- **Structure**:
  ```
  https://api.getbible.net/v2/vulgate.json                    # Toute la Vulgate
  https://api.getbible.net/v2/vulgate/[1-73]/[chapter].json
  ```

**⚠️ TRÈS IMPORTANT**: La Vulgate est la SEULE traduction qui contient les **73 livres catholiques complets** dans une seule API.

**Exemple de texte** (Genèse 1:1):
```
In principio creavit Deus caelum et terram
"Au commencement Dieu créa le ciel et la terre"
```

---

## 📋 Mapping des Livres (Numérotation API)

### Ancien Testament (1-54 dans LXX, 1-50 dans Vulgate)

| Numéro | Nom Hébreu | Nom LXX (Grec) | Nom Vulgate (Latin) |
|--------|-----------|----------------|---------------------|
| 1 | Bereshit | Genesis | Genesis |
| 2 | Shemot | Exodus | Exodus |
| 3 | Vayikra | Leviticus | Leviticus |
| 4 | Bamidbar | Numbers | Numeri |
| 5 | Devarim | Deuteronomy | Deuteronomium |
| ... | ... | ... | ... |
| **DEUTÉROCANONIQUES** |
| ? | Tobit | Tobit | Tobias |
| ? | Judith | Judith | Iudith |
| ? | Wisdom | Wisdom (of Solomon) | Sapientiae |
| ? | Sirach | Sirach | Ecclesiasticus |
| ? | Baruch | Baruch | Baruch |
| ? | 1 Maccabees | 1 Maccabees | 1 Machabaeorum |
| ? | 2 Maccabees | 2 Maccabees | 2 Machabaeorum |

### Nouveau Testament (1-27)

| Numéro | Nom Grec | Nom Latin |
|--------|----------|-----------|
| 1 | Matthew | Matthaeus |
| 2 | Mark | Marcus |
| 3 | Luke | Lucas |
| 4 | John | Ioannes |
| 5 | Acts | Actus |
| 6-18 | Pauline Epistles | Epistolae Paulinae |
| 19-21 | Catholic Epistles | Epistolae Catholicae |
| 22-26 | General Epistles | Epistolae Catholicae |
| 27 | Revelation | Apocalypsis |

---

## 🔧 Méthode d'Importation

### Étape 1: Récupérer les métadonnées

```typescript
// Exemple: Vulgate complète
const response = await fetch('https://api.getbible.net/v2/vulgate.json');
const data = await response.json();

console.log(data.translation);  // "Vulgata Clementina"
console.log(data.books.length); // 73 livres
```

### Étape 2: Importer livre par livre

```typescript
// Exemple: Genèse (livre 1) en Vulgate
const response = await fetch('https://api.getbible.net/v2/vulgate/1.json');
const book = await response.json();

// Structure retournée:
{
  "book_nr": 1,
  "book_name": "Genesis",
  "chapters": [
    {
      "chapter": 1,
      "verses": [
        {
          "chapter": 1,
          "verse": 1,
          "name": "Genesis 1:1",
          "text": "In principio creavit Deus caelum et terram"
        }
      ]
    }
  ]
}
```

### Étape 3: Nettoyer le texte (si nécessaire)

Les traductions avec morphologie (LXX, Textus Receptus) incluent des tags XML:

```typescript
// Texte avec tags:
// "<w lemma=\"strong:G7225\" morph\"Hebrew/...>ἐν</w> <w>ἀρχῇ</w>..."

// Nettoyage:
function cleanText(text: string): string {
  return text
    .replace(/<w[^>]*>([^<]*)<\/w>/g, '$1')  // Extraire le texte des tags <w>
    .replace(/<[^>]+>/g, '')                  // Supprimer tous les tags restants
    .trim();
}
```

### Étape 4: Insérer dans Supabase

```typescript
// Schéma suggéré:
interface BibleVerse {
  id: string;                  // UUID
  book_id: number;             // 1-73
  chapter: number;             // 1-150
  verse: number;               // 1-176
  text: string;                // Texte nettoyé
  translation_id: string;      // 'vulgate', 'lxx', 'aleppo', etc.
  original_text?: string;      // Texte brut avec morphologie (optionnel)
  created_at: timestamp;
}

// Server Action (app/actions.ts):
'use server';

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function importBibleTranslation(
  translationId: string,
  maxBooks?: number
) {
  // Fetch translation metadata
  const metaResponse = await fetch(
    `https://api.getbible.net/v2/${translationId}.json`
  );
  const meta = await metaResponse.json();

  const booksToImport = maxBooks
    ? meta.books.slice(0, maxBooks)
    : meta.books;

  for (const book of booksToImport) {
    const bookResponse = await fetch(
      `https://api.getbible.net/v2/${translationId}/${book.nr}.json`
    );
    const bookData = await bookResponse.json();

    for (const chapter of bookData.chapters) {
      const verses = chapter.verses.map((verse: any) => ({
        book_id: book.nr,
        chapter: chapter.chapter,
        verse: verse.verse,
        text: cleanText(verse.text),
        translation_id: translationId
      }));

      // Bulk insert
      await supabase
        .from('bible_verses')
        .insert(verses);
    }
  }

  return { success: true, imported: booksToImport.length };
}
```

---

## 📊 Résumé des Imports Recommandés

Pour **Wiki Catholic** (Canon de 73 livres), voici la stratégie optimale:

| Langue | Traduction | Code API | Couverture | Priorité |
|--------|-----------|----------|------------|----------|
| **Latin** | Vulgata Clementina | `vulgate` | ✅ 73 livres complets | ⭐⭐⭐ OBLIGATOIRE |
| **Grec** | Septuaginta (LXX) | `lxx` | ✅ 54 livres (OT + deutéro) | ⭐⭐⭐ RECOMMANDÉ |
| **Grec** | Textus Receptus | `textusreceptus` | ✅ 27 livres (NT) | ⭐⭐ RECOMMANDÉ |
| **Hébreu** | Aleppo Codex | `aleppo` | ⚠️ 39 livres (sans deutéro) | ⭐ OPTIONNEL |
| **Hébreu** | Leningrad Codex | `codex` | ⚠️ 39 livres (sans deutéro) | ⭐ OPTIONNEL |

**⚠️ NOTE IMPORTANTE**: Les textes hébreux (Aleppo, Leningrad) ne contiennent PAS les livres deutérocanoniques car ils ne font pas partie du canon hébreu massorétique. Pour les livres deutérocanoniques en langue originale, utiliser la Septante (grec) ou la Vulgate (latin).

---

## 🚀 Script d'Importation Complet

```typescript
// scripts/import-bible-originals.ts
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const TRANSLATIONS = [
  { id: 'vulgate', name: 'Vulgata Clementina', type: 'complete' },
  { id: 'lxx', name: 'Septuaginta', type: 'ot' },
  { id: 'textusreceptus', name: 'Textus Receptus', type: 'nt' },
  { id: 'aleppo', name: 'Aleppo Codex', type: 'ot-hebrew' },
] as const;

function cleanText(text: string): string {
  return text
    .replace(/<w[^>]*>([^<]*)<\/w>/g, '$1')
    .replace(/<[^>]+>/g, '')
    .trim();
}

async function importTranslation(translationId: string) {
  console.log(`📖 Importing ${translationId}...`);

  const metaResponse = await fetch(
    `https://api.getbible.net/v2/${translationId}.json`
  );
  const meta = await metaResponse.json();

  console.log(`📚 Found ${meta.books.length} books`);

  let totalVerses = 0;

  for (const book of meta.books) {
    console.log(`  📖 Book ${book.nr}: ${book.name}`);

    const bookResponse = await fetch(
      `https://api.getbible.net/v2/${translationId}/${book.nr}.json`
    );
    const bookData = await bookResponse.json();

    for (const chapter of bookData.chapters) {
      const verses = chapter.verses.map((verse: any) => ({
        book_id: book.nr,
        chapter: chapter.chapter,
        verse: verse.verse,
        text: cleanText(verse.text),
        translation_id: translationId
      }));

      const { error } = await supabase
        .from('bible_verses')
        .insert(verses);

      if (error) {
        console.error(`❌ Error inserting ${translationId} ${book.nr}:${chapter.chapter}:`, error);
      } else {
        totalVerses += verses.length;
      }
    }
  }

  console.log(`✅ Imported ${totalVerses} verses from ${translationId}`);
  return totalVerses;
}

async function main() {
  for (const translation of TRANSLATIONS) {
    await importTranslation(translation.id);
  }
}

main();
```

---

## ⚡ Performance & Rate Limiting

L'API GetBible n'a pas de rate limiting documenté, mais il est recommandé de:

1. **Importer livre par livre** avec un délai entre les requêtes:
   ```typescript
   await new Promise(resolve => setTimeout(resolve, 100)); // 100ms delay
   ```

2. **Utiliser le bulk insert** de Supabase pour minimiser les allers-retours DB

3. **Vérifier les doublons** avant l'insert:
   ```typescript
   const { data: existing } = await supabase
     .from('bible_verses')
     .select('id')
     .eq('translation_id', translationId)
     .eq('book_id', bookId)
     .eq('chapter', chapter)
     .eq('verse', verse);
   ```

---

## 📝 Notes Théologiques

### Canon Catholique (73 livres)
- **39 livres** de l'Ancien Testament hébreu
- **7 livres deutérocanoniques** (Tobie, Judith, Sagesse, Siracide, Baruch, 1-2 Maccabées)
- **27 livres** du Nouveau Testament

### Sources Originales
- **AT Hébreu**: Texte massorétique (Aleppo/Leningrad) - 39 livres seulement
- **AT Grec**: Septante (LXX) - 54 livres avec deutérocanoniques
- **NT Grec**: Textus Receptus, Tischendorf, Westcott-Hort - 27 livres
- **Complet Latin**: Vulgata - 73 livres complets

### Priorité d'Import
1. **Vulgate** (source officielle de l'Église catholique)
2. **Septante** (AT grec avec deutérocanoniques)
3. **Textus Receptus** (NT grec traditionnel)
4. **Aleppo** (AT hébreu, sans deutérocanoniques)

---

## 🔗 Ressources

- **GetBible API Docs**: https://getbible.life/docs
- **API Endpoint**: https://api.getbible.net/v2/
- **Translations List**: https://api.getbible.net/v2/translations.json
- **Supabase MCP**: Utiliser `supabase-mcp` pour toutes les opérations DB

---

**Document créé pour le projet Wiki Catholic - Date: 2025-01-07**
