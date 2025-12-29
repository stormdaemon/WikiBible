/**
 * Script d'import des versets de la Bible
 * Source de secours: Bible de l'Epée (fr_apee.json) via thiagobodruk/bible
 * Car l'URL originale est morte.
 */

import { config } from 'dotenv';
config({ path: '.env.local' });

import { createClient } from '@supabase/supabase-js';
import type { Database } from '../lib/database.types';

// Utiliser la clé ANON (car j'ai donné les droits INSERT temporaires via SQL)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabaseAdmin = createClient<Database>(
  supabaseUrl,
  supabaseKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

// Structure du JSON thiagobodruk
interface ApeeBook {
  abbrev: string;
  chapters: string[][]; // Tableau de tableaux de strings (versets)
  name: string;
}

// Mapping des noms (approximatif pour matcher nos slugs)
// Mapping des noms (JSON Anglais -> Slugs DB)
const bookNameMapping: Record<string, string> = {
  'Genesis': 'genese',
  'Exodus': 'exode',
  'Leviticus': 'levitique',
  'Numbers': 'nombres',
  'Deuteronomy': 'deuteronome',
  'Joshua': 'josue',
  'Judges': 'juges',
  'Ruth': 'ruth',
  '1 Samuel': '1-samuel',
  '2 Samuel': '2-samuel',
  '1 Kings': '1-rois',
  '2 Kings': '2-rois',
  '1 Chronicles': '1-chroniques',
  '2 Chronicles': '2-chroniques',
  'Ezra': 'esdras',
  'Nehemiah': 'nehemie',
  'Esther': 'esther',
  'Job': 'job',
  'Psalms': 'psaumes',
  'Proverbs': 'proverbes',
  'Ecclesiastes': 'ecclesiaste',
  'Song of Solomon': 'cantique-des-cantiques',
  'Isaiah': 'esaie',
  'Jeremiah': 'jeremie',
  'Lamentations': 'lamentations',
  'Ezekiel': 'ezechiel',
  'Daniel': 'daniel',
  'Hosea': 'osee',
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
  'Matthew': 'matthieu',
  'Mark': 'marc',
  'Luke': 'luc',
  'John': 'jean',
  'Acts': 'actes',
  'Romans': 'romains',
  '1 Corinthians': '1-corinthiens',
  '2 Corinthians': '2-corinthiens',
  'Galatians': 'galates',
  'Ephesians': 'ephesiens',
  'Philippians': 'philippiens',
  'Colossians': 'colossiens',
  '1 Thessalonians': '1-thessaloniciens',
  '2 Thessalonians': '2-thessaloniciens',
  '1 Timothy': '1-timothee',
  '2 Timothy': '2-timothee',
  'Titus': 'tite',
  'Philemon': 'philemon',
  'Hebrews': 'hebreux',
  'James': 'jacques',
  '1 Peter': '1-pierre',
  '2 Peter': '2-pierre',
  '1 John': '1-jean',
  '2 John': '2-jean',
  '3 John': '3-jean',
  'Jude': 'jude',
  'Revelation': 'apocalypse'
};

/*
 Mapping inverse ou manuel pour gérer les divergences de noms
 thiagobodruk names -> our slugs
*/
function getSlug(jsonName: string): string | undefined {
  if (bookNameMapping[jsonName]) return bookNameMapping[jsonName];
  // Essais heuristiques
  const n = jsonName.toLowerCase();
  if (n.startsWith('actes')) return 'actes';
  return undefined;
}

async function fetchBibleData(): Promise<ApeeBook[]> {
  console.log('📥 Téléchargement de la Bible Epée...\n');
  const response = await fetch('https://raw.githubusercontent.com/thiagobodruk/bible/master/json/fr_apee.json');
  if (!response.ok) throw new Error(`Erreur HTTP: ${response.status}`);
  return await response.json();
}

async function importBibleVerses() {
  console.log('📖 Import des versets...\n');

  // Récupérer tous les livres par slug pour le mapping
  const { data: books } = await supabaseAdmin.from('bible_books').select('id, slug');
  const bookIdMap = new Map(books?.map(b => [b.slug, b.id]));

  const bibleData = await fetchBibleData();
  let totalVerses = 0;
  let successCount = 0;

  for (const bookData of bibleData) {
    const slug = getSlug(bookData.name);

    if (!slug) {
      console.log(`⚠️  Ignoré (nom inconnu): ${bookData.name}`);
      continue;
    }

    const bookId = bookIdMap.get(slug);
    if (!bookId) {
      console.log(`⚠️  Livre non trouvé en DB: ${slug}`);
      continue;
    }

    let versesToInsert: any[] = [];

    // bookData.chapters est un tableau de tableau de string
    if (bookData.chapters && Array.isArray(bookData.chapters)) {
      bookData.chapters.forEach((chapterVerses, chapterIndex) => {
        const chapterNum = chapterIndex + 1;
        if (Array.isArray(chapterVerses)) {
          chapterVerses.forEach((verseText, verseIndex) => {
            const verseNum = verseIndex + 1;
            versesToInsert.push({
              book_id: bookId,
              book_slug: slug,
              chapter: chapterNum,
              verse: verseNum,
              text: verseText,
              translation_id: 'apee'
            });
          });
        }
      });
    }

    console.log(`Traitement de ${bookData.name} - ${versesToInsert.length} versets trouvés.`);

    if (versesToInsert.length === 0) {
      console.warn(`⚠️ 0 versets trouvés pour ${bookData.name} (Structure JSON suspecte?)`);
    }

    // Batch insert
    for (let i = 0; i < versesToInsert.length; i += 1000) {
      const batch = versesToInsert.slice(i, i + 1000);
      try {
        const { error } = await supabaseAdmin.from('bible_verses').insert(batch).select('id');
        if (error) {
          console.error(`❌ Erreur insert ${bookData.name} lot ${i}:`, error.message, error.details, error.hint);
        } else {
          successCount += batch.length;
        }
      } catch (err) {
        console.error(`❌ Exception insert ${bookData.name}:`, err);
      }
    }
    totalVerses += versesToInsert.length;
  }

  console.log(`\n✨ Import terminé: ${successCount} / ${totalVerses} versets importés.`);
}

importBibleVerses().catch(console.error);
