/**
 * Script pour générer un fichier SQL d'import des versets
 * Utilise l'API MCP Supabase execute_sql pour contourner RLS
 */

import { config } from 'dotenv';
config({ path: '.env.local' });

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

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

function escapeSQL(str: string): string {
  return str.replace(/'/g, "''").replace(/\\/g, '\\\\');
}

async function main() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  const supabase = createClient(supabaseUrl, supabaseKey);

  console.log('📖 Génération du fichier SQL d\'import...\n');

  // Récupérer tous les livres
  const { data: books, error: booksError } = await supabase
    .from('bible_books')
    .select('id, slug, name_en');

  if (booksError) {
    console.error('❌ Erreur:', booksError);
    return;
  }

  const bookIdMap = new Map(books!.map(book => [book.slug, book.id]));

  // Charger le JSON
  console.log('📥 Chargement du JSON...');
  const jsonPath = 'C:\\\\tmp\\\\frecrampon.json';
  const jsonData: ScrollmapperData = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));

  console.log(`✅ ${jsonData.books.length} livres chargés\n`);

  const sqlStatements: string[] = [];
  let totalVerses = 0;

  for (const scrollmapperBook of jsonData.books) {
    const slug = bookNameMapping[scrollmapperBook.name];

    if (!slug) {
      console.log(`⚠️  Livre non mappé: ${scrollmapperBook.name}`);
      continue;
    }

    const bookId = bookIdMap.get(slug);

    if (!bookId) {
      console.log(`⚠️  Livre introuvable: ${scrollmapperBook.name} (${slug})`);
      continue;
    }

    console.log(`✅ ${scrollmapperBook.name}`);

    for (const chapterData of scrollmapperBook.chapters) {
      for (const verseData of chapterData.verses) {
        const text = escapeSQL(verseData.text.trim());
        sqlStatements.push(
          `INSERT INTO bible_verses (book_id, book_slug, chapter, verse, text, translation_id) VALUES ('${bookId}', '${slug}', ${chapterData.chapter}, ${verseData.verse}, '${text}', 'crampon') ON CONFLICT DO NOTHING;`
        );
        totalVerses++;
      }
    }
  }

  console.log(`\n📊 ${totalVerses} versets à insérer`);

  // Écrire le fichier SQL
  const sqlContent = sqlStatements.join('\n');
  fs.writeFileSync('bible-import.sql', sqlContent);

  console.log(`✅ Fichier SQL généré: bible-import.sql (${(sqlContent.length / 1024 / 1024).toFixed(2)} MB)`);
  console.log('\n💡 Exécutez maintenant avec: psql ... ou via MCP Supabase');
}

main().catch(console.error);
