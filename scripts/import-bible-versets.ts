/**
 * Script d'import des versets de la Bible depuis scrollmapper/bible_databases
 * Traduction: Crampon 1923 (catholique française)
 * Source: https://github.com/scrollmapper/bible_databases
 */

// IMPORTANT: Charger .env.local AVANT tout import qui utilise process.env
import { config } from 'dotenv';
config({ path: '.env.local' });

import { createClient } from '@supabase/supabase-js';

// Créer un client admin pour lire les livres (seulement pour le mapping)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

interface ScrollmapperVerse {
  verse: number;
  text: string;
}

interface ScrollmapperChapter {
  chapter: number;
  verses: ScrollmapperVerse[];
}

interface ScrollmapperBook {
  name: string;
  chapters: ScrollmapperChapter[];
}

interface ScrollmapperData {
  translation: string;
  books: ScrollmapperBook[];
}

interface BibleBook {
  id: string;
  slug: string;
  name_en: string;
}

// Mapping des noms de livres scrollmapper vers nos slugs
const bookNameMapping: Record<string, string> = {
  'Genesis': 'genese',
  'Exodus': 'exode',
  'Leviticus': 'levitique',
  'Numbers': 'nombres',
  'Deuteronomy': 'deuterome',
  'Joshua': 'josue',
  'Judges': 'juges',
  'Ruth': 'ruth',
  '1 Samuel': '1-samuel',
  '2 Samuel': '2-samuel',
  'I Samuel': '1-samuel',
  'II Samuel': '2-samuel',
  '1 Kings': '1-rois',
  '2 Kings': '2-rois',
  'I Kings': '1-rois',
  'II Kings': '2-rois',
  '1 Chronicles': '1-chroniques',
  '2 Chronicles': '2-chroniques',
  'I Chronicles': '1-chroniques',
  'II Chronicles': '2-chroniques',
  'Ezra': 'esdras',
  'Nehemiah': 'nehemie',
  'Tobit': 'tobie',
  'Judith': 'judith',
  'Esther': 'ester',
  'Job': 'job',
  'Psalms': 'psaumes',
  'Proverbs': 'proverbes',
  'Ecclesiastes': 'ecclesiaste',
  'Song of Songs': 'cantique',
  'Song of Solomon': 'cantique',
  'Wisdom': 'sagesse',
  'Sirach': 'siracide',
  'Isaiah': 'eesaie',
  'Jeremiah': 'jeremie',
  'Lamentations': 'lamentations',
  'Baruch': 'baruch',
  'Ezekiel': 'ezechiel',
  'Daniel': 'daniel',
  'Hosea': 'oslee',
  'Joel': 'joel',
  'Amos': 'amos',
  'Obadiah': 'abdias',
  'Jonah': 'jonas',
  'Micah': 'michee',
  'Nahum': 'nahum',
  'Habakkuk': 'habacuc',
  'Zephaniah': 'sophonie',
  'Haggai': 'aggee',
  'Zechariah': 'zacharie',
  'Malachi': 'malachie',
  '1 Maccabees': '1-macchabees',
  '2 Maccabees': '2-macchabees',
  'I Maccabees': '1-macchabees',
  'II Maccabees': '2-macchabees',
  'Matthew': 'matthieu',
  'Mark': 'marc',
  'Luke': 'luc',
  'John': 'jean',
  'Acts': 'actes',
  'Romans': 'romains',
  '1 Corinthians': '1-corinthiens',
  '2 Corinthians': '2-corinthiens',
  'I Corinthians': '1-corinthiens',
  'II Corinthians': '2-corinthiens',
  'Galatians': 'galates',
  'Ephesians': 'ephesiens',
  'Philippians': 'philippiens',
  'Colossians': 'colossiens',
  '1 Thessalonians': '1-thesaloniciens',
  '2 Thessalonians': '2-thesaloniciens',
  'I Thessalonians': '1-thesaloniciens',
  'II Thessalonians': '2-thesaloniciens',
  '1 Timothy': '1-timothee',
  '2 Timothy': '2-timothee',
  'I Timothy': '1-timothee',
  'II Timothy': '2-timothee',
  'Titus': 'tite',
  'Philemon': 'philemon',
  'Hebrews': 'hebreux',
  'James': 'jacques',
  '1 Peter': '1-pierre',
  '2 Peter': '2-pierre',
  'I Peter': '1-pierre',
  'II Peter': '2-pierre',
  '1 John': '1-jean',
  '2 John': '2-jean',
  '3 John': '3-jean',
  'I John': '1-jean',
  'II John': '2-jean',
  'III John': '3-jean',
  'Jude': 'jude',
  'Revelation': 'apocalypse',
  'Revelation of John': 'apocalypse',
};

async function fetchBibleData(): Promise<ScrollmapperData> {
  console.log('📥 Téléchargement de la Bible Crampon depuis scrollmapper...\n');

  const response = await fetch('https://raw.githubusercontent.com/scrollmapper/bible_databases/master/formats/json/FreCrampon.json');

  if (!response.ok) {
    throw new Error(`Erreur HTTP: ${response.status}`);
  }

  const data = await response.json();
  console.log(`✅ Données téléchargées: ${data.books.length} livres\n`);
  return data;
}

async function importBibleVerses() {
  console.log('📖 Import des versets de la Bible Crampon 1923...\n');

  const supabase = createClient(supabaseUrl, supabaseKey);

  // Récupérer tous les livres de notre DB pour le mapping book_id
  const { data: books, error: booksError } = await supabase
    .from('bible_books')
    .select('id, slug, name_en');

  if (booksError) {
    console.error('❌ Erreur lors de la récupération des livres:', booksError);
    return;
  }

  // Créer un mapping slug -> id
  const bookIdMap = new Map(books!.map(book => [book.slug, book.id]));

  // Télécharger les données de la Bible
  const bibleData = await fetchBibleData();

  let totalVerses = 0;
  let skippedCount = 0;
  const versesToInsert: Array<{
    book_id: string;
    book_slug: string;
    chapter: number;
    verse: number;
    text: string;
    translation_id: string;
  }> = [];

  // Préparer tous les versets d'abord
  for (const scrollmapperBook of bibleData.books) {
    const slug = bookNameMapping[scrollmapperBook.name];

    if (!slug) {
      console.log(`⚠️  Livre non mappé: ${scrollmapperBook.name}`);
      skippedCount++;
      continue;
    }

    const bookId = bookIdMap.get(slug);

    if (!bookId) {
      console.log(`⚠️  Livre introuvable dans la DB: ${scrollmapperBook.name} (${slug})`);
      skippedCount++;
      continue;
    }

    console.log(`✅ ${scrollmapperBook.name} (${slug}) - ${scrollmapperBook.chapters.length} chapitres`);

    for (const chapterData of scrollmapperBook.chapters) {
      for (const verseData of chapterData.verses) {
        versesToInsert.push({
          book_id: bookId,
          book_slug: slug,
          chapter: chapterData.chapter,
          verse: verseData.verse,
          text: verseData.text.trim(),
          translation_id: 'crampon',
        });
        totalVerses++;
      }
    }
  }

  console.log(`\n📊 Total versets à insérer: ${totalVerses}`);
  console.log(`📊 Livres ignorés: ${skippedCount}/73\n`);

  // Insérer via SQL direct avec MCP
  console.log('📤 Insertion par lots de 1000 versets...');

  let successCount = 0;
  let errorCount = 0;
  const batchSize = 1000;

  for (let i = 0; i < versesToInsert.length; i += batchSize) {
    const batch = versesToInsert.slice(i, i + batchSize);

    // Construire la requête SQL d'insertion
    const values = batch.map(v =>
      `('${v.book_id}', '${v.book_slug}', ${v.chapter}, ${v.verse}, ${escapeLiteral(v.text)}, 'crampon')`
    ).join(',\n');

    const sql = `
      INSERT INTO bible_verses (book_id, book_slug, chapter, verse, text, translation_id)
      VALUES
${values}
      ON CONFLICT DO NOTHING;
    `;

    try {
      // Utiliser fetch pour appeler l'API REST Supabase directement
      const response = await fetch(`${supabaseUrl}/rest/v1/bible_verses`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
          'Prefer': 'resolution=ignore-duplicates'
        },
        body: JSON.stringify(batch)
      });

      if (!response.ok) {
        const error = await response.text();
        console.error(`❌ Erreur lot ${i / batchSize + 1}:`, error);
        errorCount += batch.length;
      } else {
        successCount += batch.length;
        if ((i / batchSize + 1) % 10 === 0) {
          console.log(`   ✅ Progression: ${successCount}/${totalVerses} versets insérés`);
        }
      }
    } catch (err) {
      console.error(`❌ Erreur lot ${i / batchSize + 1}:`, err);
      errorCount += batch.length;
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log(`✨ Import terminé!`);
  console.log(`   📊 Total traité: ${totalVerses} versets`);
  console.log(`   ✅ Succès: ${successCount} versets`);
  console.log(`   ❌ Erreurs: ${errorCount} versets`);
  console.log(`   ⚠️  Ignorés: ${skippedCount} livres`);
  console.log('='.repeat(60));
}

// Fonction utilitaire pour échapper les littéraux SQL
function escapeLiteral(str: string): string {
  return str.replace(/'/g, "''");
}

// Exécuter l'import
importBibleVerses().catch(console.error);
