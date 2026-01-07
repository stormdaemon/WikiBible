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

## 🔍 DIAGNOSTIC: Identifier les Versets Manquants

### Problème Constaté (2025-01-07)

Les traductions **Crampon** et **Jérusalem** ont des **versets manquants** dans plusieurs chapitres.
Exemple: Luc 1 a 66 versets importés mais devrait en avoir 80 (manque 1:27-35, etc.)

### Requête SQL de Diagnostic Complet

```sql
-- Trouver tous les chapitres avec des versets manquants
WITH book_chapter_verse_counts AS (
  SELECT
    bb.slug,
    bb.name,
    bv.chapter,
    COUNT(*) as actual_verse_count,
    MIN(bv.verse) as min_verse,
    MAX(bv.verse) as max_verse
  FROM bible_books bb
  JOIN bible_verses bv ON bb.id = bv.book_id
  WHERE bv.translation_id = 'jerusalem'  -- ou 'crampon'
  GROUP BY bb.slug, bb.name, bv.chapter
)
SELECT
  slug,
  name,
  chapter,
  actual_verse_count,
  max_verse,
  (max_verse - actual_verse_count) as missing_count,
  CASE
    WHEN max_verse - actual_verse_count > 0 THEN '⚠️ VERSETS MANQUANTS'
    ELSE '✅ OK'
  END as status
FROM book_chapter_verse_counts
WHERE max_verse - actual_verse_count > 0
ORDER BY (max_verse - actual_verse_count) DESC;
```

### Résultats du Diagnostic (2025-01-07)

**Exemples de chapitres affectés pour la traduction 'jerusalem':**

| Livre | Chapitre | Versets importés | Dernier verset | Manquants |
|-------|----------|------------------|----------------|-----------|
| Lamentations | 3 | 13 | 64 | **51 versets** |
| Baruch | 6 | 38 | 72 | **34 versets** |
| Proverbes | 31 | 3 | 31 | **28 versets** |
| Job | 39 | 5 | 30 | **25 versets** |
| Luc | 1 | 66 | 80 | **14 versets** ⚠️ |
| Luc | 4 | 26 | 44 | **18 versets** |
| Genèse | 31 | 37 | 53 | **16 versets** |

---

## 🩹 Méthode de Complétion des Versets Manquants

### Étape 1: Identifier les versets manquants pour un chapitre donné

```sql
-- Exemple: Trouver les versets manquants de Luc 1 pour Jérusalem
WITH expected_verses AS (
  SELECT generate_series(1, 80) as verse  -- Luc 1 a 80 versets
),
actual_verses AS (
  SELECT verse
  FROM bible_verses
  WHERE translation_id = 'jerusalem'
    AND book_id = (SELECT id FROM bible_books WHERE slug = 'luc')
    AND chapter = 1
)
SELECT ev.verse as missing_verse
FROM expected_verses ev
LEFT JOIN actual_verses av ON ev.verse = av.verse
WHERE av.verse IS NULL
ORDER BY ev.verse;
```

### Étape 2: Script TypeScript pour Completer les Versets Manquants

```typescript
// scripts/complete-missing-verses.ts
import { config } from 'dotenv';
config({ path: '.env.local' });

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // ou ANON_KEY avec droits INSERT
);

interface GetBibleVerse {
  chapter: number;
  verse: number;
  text: string;
}

interface GetBibleChapter {
  chapter: number;
  verses: GetBibleVerse[];
}

interface GetBibleBook {
  nr: number;
  name: string;
  chapters: GetBibleChapter[];
}

/**
 * Récupère les versets manquants depuis GetBible API
 * pour une traduction donnée
 */
async function fetchMissingVerses(
  translation: string,
  bookSlug: string,
  chapter: number,
  missingVerses: number[]
): Promise<GetBibleVerse[]> {
  // Trouver le numéro de livre GetBible
  const booksResponse = await fetch(`https://api.getbible.net/v2/${translation}.json`);
  const booksData = await booksResponse.json();

  // Mapper notre slug vers le nom de livre GetBible
  const bookNameMap: Record<string, string> = {
    'luc': 'Luke',
    'genese': 'Genesis',
    'exode': 'Exodus',
    // ... ajouter tous les mappings
  };

  const bookName = bookNameMap[bookSlug];
  if (!bookName) {
    throw new Error(`Livre ${bookSlug} non trouvé dans le mapping`);
  }

  // Trouver le numéro de livre
  const book = booksData.books.find((b: any) => b.name === bookName);
  if (!book) {
    throw new Error(`Livre ${bookName} non trouvé dans GetBible`);
  }

  // Récupérer le chapitre complet
  const chapterResponse = await fetch(
    `https://api.getbible.net/v2/${translation}/${book.nr}/${chapter}.json`
  );
  const chapterData: GetBibleChapter = await chapterResponse.json();

  // Filtrer uniquement les versets manquants
  const missingVersesData = chapterData.verses.filter(v =>
    missingVerses.includes(v.verse)
  );

  return missingVersesData;
}

/**
 * Insère les versets manquants dans Supabase
 */
async function insertMissingVerses(
  bookSlug: string,
  translation: string,
  chapter: number,
  verses: GetBibleVerse[]
) {
  // Récupérer le book_id
  const { data: book } = await supabase
    .from('bible_books')
    .select('id')
    .eq('slug', bookSlug)
    .single();

  if (!book) {
    throw new Error(`Livre ${bookSlug} non trouvé en base`);
  }

  const versesToInsert = verses.map(verse => ({
    book_id: book.id,
    book_slug: bookSlug,
    chapter: chapter,
    verse: verse.verse,
    text: verse.text,
    translation_id: translation
  }));

  const { error } = await supabase
    .from('bible_verses')
    .insert(versesToInsert);

  if (error) {
    console.error(`❌ Erreur insertion ${bookSlug} ${chapter}:`, error);
    throw error;
  }

  console.log(`✅ ${versesToInsert.length} versets insérés pour ${bookSlug} ${chapter}`);
}

/**
 * Script principal: Scan et complète tous les versets manquants
 */
async function completeAllMissingVerses(translation: string) {
  console.log(`🔍 Recherche des versets manquants pour ${translation}...`);

  // Récupérer tous les chapitres avec des versets manquants
  const { data: missingChapters, error } = await supabase
    .rpc('find_missing_verses_chapters', { p_translation: translation });

  if (error) {
    console.error('Erreur RPC:', error);
    return;
  }

  console.log(`📊 ${missingChapters?.length || 0} chapitres à compléter`);

  if (!missingChapters || missingChapters.length === 0) {
    console.log('✅ Tous les versets sont déjà complets !');
    return;
  }

  for (const chapter of missingChapters) {
    try {
      console.log(`\n📖 Traitement: ${chapter.slug} chapitre ${chapter.chapter}`);
      console.log(`   Versets manquants: ${chapter.missing_verses.join(', ')}`);

      // Récupérer les versets depuis GetBible
      const verses = await fetchMissingVerses(
        translation,
        chapter.slug,
        chapter.chapter,
        chapter.missing_verses
      );

      // Insérer dans Supabase
      await insertMissingVerses(
        chapter.slug,
        translation,
        chapter.chapter,
        verses
      );

    } catch (err) {
      console.error(`❌ Erreur pour ${chapter.slug} ${chapter.chapter}:`, err);
    }
  }

  console.log('\n✨ Complétion terminée !');
}

// Fonction RPC à créer dans Supabase (voir ci-dessous)
// Exemple: completeAllMissingVerses('jerusalem')
//          completeAllMissingVerses('crampon')
```

### Étape 3: Créer la fonction RPC dans Supabase

Cette fonction RPC identifie automatiquement tous les chapitres avec des versets manquants:

```sql
-- Fonction RPC: find_missing_verses_chapters
CREATE OR REPLACE FUNCTION find_missing_verses_chapters(p_translation TEXT)
RETURNS TABLE (
  slug TEXT,
  name TEXT,
  chapter INT,
  min_verse INT,
  max_verse INT,
  actual_count INT,
  missing_verses INT[]
) AS $$
DECLARE
  v_book_id UUID;
  v_expected_max INT;
  v_missing_array INT[];
BEGIN
  RETURN QUERY
  WITH chapter_stats AS (
    SELECT
      bb.id as book_id,
      bb.slug,
      bb.name,
      bv.chapter,
      COUNT(*) as actual_count,
      MAX(bv.verse) as max_verse,
      MIN(bv.verse) as min_verse
    FROM bible_books bb
    JOIN bible_verses bv ON bb.id = bv.book_id
    WHERE bv.translation_id = p_translation
    GROUP BY bb.id, bb.slug, bb.name, bv.chapter
  )
  SELECT
    cs.slug,
    cs.name,
    cs.chapter,
    cs.min_verse,
    cs.max_verse,
    cs.actual_count,
    -- Générer la liste des versets manquants
    (
      SELECT ARRAY_AGG(i)
      FROM generate_series(cs.min_verse, cs.max_verse) i
      WHERE NOT EXISTS (
        SELECT 1
        FROM bible_verses bv2
        WHERE bv2.book_id = cs.book_id
          AND bv2.chapter = cs.chapter
          AND bv2.verse = i
          AND bv2.translation_id = p_translation
      )
    ) as missing_verses
  FROM chapter_stats cs
  WHERE cs.max_verse - cs.actual_count > 0  -- Il y a des versets manquants
  ORDER BY (cs.max_verse - cs.actual_count) DESC;
END;
$$ LANGUAGE plpgsql;

-- Test rapide:
-- SELECT * FROM find_missing_verses_chapters('jerusalem');
-- SELECT * FROM find_missing_verses_chapters('crampon');
```

### Étape 4: Alternative Simple - Script Direct sans RPC

Si vous ne voulez pas créer de fonction RPC, voici une version simplifiée:

```typescript
// scripts/complete-missing-verses-simple.ts
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function findAndCompleteMissing(translation: string, bookSlug: string, chapter: number) {
  // 1. Trouver les versets manquants
  const { data: existing } = await supabase
    .from('bible_verses')
    .select('verse')
    .eq('translation_id', translation)
    .eq('book_slug', bookSlug)
    .eq('chapter', chapter);

  const existingVerses = new Set(existing?.map(v => v.verse) || []);

  // 2. Déterminer le nombre attendu (via GetBible API)
  const bookNameMap: Record<string, { name: string; nr: number }> = {
    'luc': { name: 'Luke', nr: 43 },
    'genese': { name: 'Genesis', nr: 1 },
    // ... mapping complet
  };

  const mapping = bookNameMap[bookSlug];
  if (!mapping) {
    console.log(`⚠️  Mapping non trouvé pour ${bookSlug}`);
    return;
  }

  const response = await fetch(
    `https://api.getbible.net/v2/${translation}/${mapping.nr}/${chapter}.json`
  );
  const chapterData = await response.json();

  const allVerses = chapterData.verses;
  const maxVerse = allVerses[allVerses.length - 1].verse;

  // 3. Identifier les manquants
  const missing: number[] = [];
  for (let v = 1; v <= maxVerse; v++) {
    if (!existingVerses.has(v)) {
      missing.push(v);
    }
  }

  if (missing.length === 0) {
    console.log(`✅ ${bookSlug} ${chapter} est complet`);
    return;
  }

  console.log(`📖 ${bookSlug} ${chapter}: ${missing.length} versets manquants (${missing.join(', ')})`);

  // 4. Insérer les manquants
  const missingData = allVerses.filter((v: any) => missing.includes(v.verse));

  const { data: book } = await supabase
    .from('bible_books')
    .select('id')
    .eq('slug', bookSlug)
    .single();

  const { error } = await supabase
    .from('bible_verses')
    .insert(
      missingData.map((v: any) => ({
        book_id: book!.id,
        book_slug: bookSlug,
        chapter: chapter,
        verse: v.verse,
        text: v.text,
        translation_id: translation
      }))
    );

  if (error) {
    console.error(`❌ Erreur:`, error);
  } else {
    console.log(`✅ ${missingData.length} versets insérés`);
  }
}

// Exemple d'utilisation
// findAndCompleteMissing('jerusalem', 'luc', 1);
// findAndCompleteMissing('jerusalem', 'luc', 4);
```

### Mapping Complet des Livres (Slug → GetBible)

```typescript
const BOOK_MAPPING: Record<string, { name: string; nr: number }> = {
  // Ancien Testament
  'genese': { name: 'Genesis', nr: 1 },
  'exode': { name: 'Exodus', nr: 2 },
  'levitique': { name: 'Leviticus', nr: 3 },
  'nombres': { name: 'Numbers', nr: 4 },
  'deuteronome': { name: 'Deuteronomy', nr: 5 },
  'josue': { name: 'Joshua', nr: 6 },
  'juges': { name: 'Judges', nr: 7 },
  'ruth': { name: 'Ruth', nr: 8 },
  '1-samuel': { name: '1 Samuel', nr: 9 },
  '2-samuel': { name: '2 Samuel', nr: 10 },
  '1-rois': { name: '1 Kings', nr: 11 },
  '2-rois': { name: '2 Kings', nr: 12 },
  '1-chroniques': { name: '1 Chronicles', nr: 13 },
  '2-chroniques': { name: '2 Chronicles', nr: 14 },
  'esdras': { name: 'Ezra', nr: 15 },
  'nehemie': { name: 'Nehemiah', nr: 16 },
  'esther': { name: 'Esther', nr: 17 },
  'job': { name: 'Job', nr: 18 },
  'psaumes': { name: 'Psalms', nr: 19 },
  'proverbes': { name: 'Proverbs', nr: 20 },
  'ecclesiaste': { name: 'Ecclesiastes', nr: 21 },
  'cantique': { name: 'Song of Solomon', nr: 22 },
  'esaie': { name: 'Isaiah', nr: 23 },
  'jeremie': { name: 'Jeremiah', nr: 24 },
  'lamentations': { name: 'Lamentations', nr: 25 },
  'ezechiel': { name: 'Ezekiel', nr: 26 },
  'daniel': { name: 'Daniel', nr: 27 },
  'osee': { name: 'Hosea', nr: 28 },
  'joel': { name: 'Joel', nr: 29 },
  'amos': { name: 'Amos', nr: 30 },
  'abdias': { name: 'Obadiah', nr: 31 },
  'jonas': { name: 'Jonah', nr: 32 },
  'michee': { name: 'Micah', nr: 33 },
  'nahum': { name: 'Nahum', nr: 34 },
  'habacuc': { name: 'Habakkuk', nr: 35 },
  'sophonie': { name: 'Zephaniah', nr: 36 },
  'aggee': { name: 'Haggai', nr: 37 },
  'zacharie': { name: 'Zechariah', nr: 38 },
  'malachie': { name: 'Malachi', nr: 39 },

  // Deutérocanoniques
  'tobie': { name: 'Tobit', nr: 40 },
  'judith': { name: 'Judith', nr: 41 },
  'sagesse': { name: 'Wisdom', nr: 42 },
  'siracide': { name: 'Sirach', nr: 43 },
  'baruch': { name: 'Baruch', nr: 44 },
  '1-macchabees': { name: '1 Maccabees', nr: 45 },
  '2-macchabees': { name: '2 Maccabees', nr: 46 },

  // Nouveau Testament
  'matthieu': { name: 'Matthew', nr: 47 },
  'marc': { name: 'Mark', nr: 48 },
  'luc': { name: 'Luke', nr: 49 },
  'jean': { name: 'John', nr: 50 },
  'actes': { name: 'Acts', nr: 51 },
  'romains': { name: 'Romans', nr: 52 },
  '1-corinthiens': { name: '1 Corinthians', nr: 53 },
  '2-corinthiens': { name: '2 Corinthians', nr: 54 },
  'galates': { name: 'Galatians', nr: 55 },
  'ephesiens': { name: 'Ephesians', nr: 56 },
  'philippiens': { name: 'Philippians', nr: 57 },
  'colossiens': { name: 'Colossians', nr: 58 },
  '1-thesaloniciens': { name: '1 Thessalonians', nr: 59 },
  '2-thesaloniciens': { name: '2 Thessalonians', nr: 60 },
  '1-timothee': { name: '1 Timothy', nr: 61 },
  '2-timothee': { name: '2 Timothy', nr: 62 },
  'tite': { name: 'Titus', nr: 63 },
  'philemon': { name: 'Philemon', nr: 64 },
  'hebreux': { name: 'Hebrews', nr: 65 },
  'jacques': { name: 'James', nr: 66 },
  '1-pierre': { name: '1 Peter', nr: 67 },
  '2-pierre': { name: '2 Peter', nr: 68 },
  '1-jean': { name: '1 John', nr: 69 },
  '2-jean': { name: '2 John', nr: 70 },
  '3-jean': { name: '3 John', nr: 71 },
  'jude': { name: 'Jude', nr: 72 },
  'apocalypse': { name: 'Revelation', nr: 73 }
};
```

### Résumé de la Procédure de Complétion

1. **Exécuter le diagnostic SQL** pour identifier tous les chapitres avec des versets manquants
2. **Pour chaque chapitre affecté**:
   - Récupérer les données complètes depuis GetBible API
   - Identifier les versets manquants (trous dans la séquence)
   - Insérer uniquement les versets manquants
3. **Vérifier** avec la requête de diagnostic que tout est complet
4. **Répéter** pour l'autre traduction (crampon/jerusalem)

---

**Document créé pour le projet Wiki Catholic - Date: 2025-01-07**
**Mis à jour avec méthode de complétion des versets manquants**
