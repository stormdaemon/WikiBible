/**
 * Script de complétion des versets manquants pour Crampon et Jérusalem
 * Utilise GetBible API pour récupérer les versets manquants
 */

import { config } from 'dotenv';
config({ path: '.env.local' });

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Mapping complet des livres (slug → GetBible)
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
  'eesaie': { name: 'Isaiah', nr: 23 },
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

interface GetBibleVerse {
  chapter: number;
  verse: number;
  text: string;
}

interface GetBibleChapter {
  chapter: number;
  verses: GetBibleVerse[];
}

interface MissingChapter {
  slug: string;
  chapter: number;
  missing_verses: number[];
}

/**
 * Scan une traduction pour trouver tous les versets manquants
 */
async function scanMissingVerses(translation: string): Promise<MissingChapter[]> {
  console.log(`\n🔍 Scan des versets manquants pour ${translation}...`);

  const { data: books } = await supabase
    .from('bible_books')
    .select('id, slug, name, chapters');

  if (!books) {
    throw new Error('Impossible de récupérer les livres');
  }

  const missing: MissingChapter[] = [];

  for (const book of books) {
    const mapping = BOOK_MAPPING[book.slug];
    if (!mapping) {
      console.log(`⚠️  Mapping non trouvé pour ${book.slug}`);
      continue;
    }

    // Scanner chaque chapitre
    for (let chapter = 1; chapter <= book.chapters; chapter++) {
      // Récupérer les versets existants
      const { data: existing } = await supabase
        .from('bible_verses')
        .select('verse')
        .eq('translation_id', translation)
        .eq('book_slug', book.slug)
        .eq('chapter', chapter);

      const existingVerses = new Set(existing?.map(v => v.verse) || []);

      // Récupérer le chapitre depuis GetBible pour connaître le max
      try {
        const response = await fetch(
          `https://api.getbible.net/v2/${translation}/${mapping.nr}/${chapter}.json`
        );

        if (!response.ok) {
          console.log(`⚠️  Chapitre ${book.slug} ${chapter} non trouvé dans GetBible`);
          continue;
        }

        const chapterData: GetBibleChapter = await response.json();
        const allVerses = chapterData.verses;

        if (!allVerses || allVerses.length === 0) {
          console.log(`⚠️  Pas de versets pour ${book.slug} ${chapter}`);
          continue;
        }

        const maxVerse = allVerses[allVerses.length - 1].verse;

        // Trouver les versets manquants
        const missingVerses: number[] = [];
        for (let v = 1; v <= maxVerse; v++) {
          if (!existingVerses.has(v)) {
            missingVerses.push(v);
          }
        }

        if (missingVerses.length > 0) {
          missing.push({
            slug: book.slug,
            chapter: chapter,
            missing_verses: missingVerses
          });
        }
      } catch (err) {
        console.log(`❌ Erreur pour ${book.slug} ${chapter}:`, err);
      }

      // Petit délai pour éviter de surcharger l'API
      await new Promise(resolve => setTimeout(resolve, 50));
    }
  }

  console.log(`📊 ${missing.length} chapitres avec des versets manquants trouvés`);
  return missing;
}

/**
 * Complète les versets manquants pour un chapitre donné
 */
async function completeChapter(
  translation: string,
  slug: string,
  chapter: number,
  missingVerses: number[]
): Promise<boolean> {
  const mapping = BOOK_MAPPING[slug];
  if (!mapping) {
    console.log(`⚠️  Mapping non trouvé pour ${slug}`);
    return false;
  }

  try {
    // Récupérer le chapitre complet depuis GetBible
    const response = await fetch(
      `https://api.getbible.net/v2/${translation}/${mapping.nr}/${chapter}.json`
    );

    if (!response.ok) {
      console.log(`❌ Impossible de récupérer ${slug} ${chapter}`);
      return false;
    }

    const chapterData: GetBibleChapter = await response.json();
    const allVerses = chapterData.verses;

    // Filtrer uniquement les versets manquants
    const missingData = allVerses.filter(v => missingVerses.includes(v.verse));

    if (missingData.length === 0) {
      console.log(`⚠️  Aucun verset manquant trouvé pour ${slug} ${chapter}`);
      return false;
    }

    // Récupérer le book_id
    const { data: book } = await supabase
      .from('bible_books')
      .select('id')
      .eq('slug', slug)
      .single();

    if (!book) {
      console.log(`❌ Livre ${slug} non trouvé en base`);
      return false;
    }

    // Insérer les versets manquants
    const { error } = await supabase
      .from('bible_verses')
      .insert(
        missingData.map(v => ({
          book_id: book.id,
          book_slug: slug,
          chapter: chapter,
          verse: v.verse,
          text: v.text,
          translation_id: translation
        }))
      );

    if (error) {
      console.error(`❌ Erreur insertion ${slug} ${chapter}:`, error.message);
      return false;
    }

    console.log(`✅ ${missingData.length} versets insérés pour ${slug} ${chapter}`);
    return true;
  } catch (err) {
    console.error(`❌ Exception pour ${slug} ${chapter}:`, err);
    return false;
  }
}

/**
 * Fonction principale
 */
async function main() {
  const translations = ['crampon', 'jerusalem'];

  for (const translation of translations) {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`TRADUCTION: ${translation.toUpperCase()}`);
    console.log(`${'='.repeat(60)}`);

    // Scanner les versets manquants
    const missing = await scanMissingVerses(translation);

    if (missing.length === 0) {
      console.log(`✅ Tous les versets sont déjà complets pour ${translation} !`);
      continue;
    }

    console.log(`\n📋 Résumé des chapitres à compléter:`);
    console.log(missing.map(m => `  - ${m.slug} ${m.chapter}: ${m.missing_verses.length} versets`).join('\n'));

    // Demander confirmation
    console.log(`\n⚠️  ${missing.length} chapitres à compléter. Continuer ?`);
    // await new Promise(resolve => setTimeout(resolve, 2000)); // 2 secondes pour lire

    let successCount = 0;
    let failCount = 0;

    // Compléter chaque chapitre
    for (const chapter of missing) {
      const success = await completeChapter(
        translation,
        chapter.slug,
        chapter.chapter,
        chapter.missing_verses
      );

      if (success) {
        successCount++;
      } else {
        failCount++;
      }

      // Délai pour éviter de surcharger l'API
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    console.log(`\n✨ ${translation}: ${successCount} chapitres complétés, ${failCount} échecs`);
  }

  console.log(`\n${'='.repeat(60)}`);
  console.log('✨ COMPLÉTION TERMINÉE !');
  console.log(`${'='.repeat(60)}`);
}

main().catch(console.error);
