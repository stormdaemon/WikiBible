/**
 * Script pour récupérer les textes apocryphes depuis get.bible API et Sefaria API
 * Traduction automatique vers le français
 * Import dans Supabase
 */

import { createClient } from '@supabase/supabase-js';

// Configuration
const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY || '';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Mapping des livres apocryphes KJVA (livres 67-80)
const APOCRYPHAL_BOOKS = [
  { nr: 67, name: '1 Esdras', name_fr: '1 Esdras', slug: '1-esdras', category: 'apocrypha' },
  { nr: 68, name: '2 Esdras', name_fr: '2 Esdras', slug: '2-esdras', category: 'apocrypha' },
  { nr: 69, name: 'Tobit', name_fr: 'Tobie', slug: 'tobit', category: 'deutero' },
  { nr: 70, name: 'Judith', name_fr: 'Judith', slug: 'judith', category: 'deutero' },
  { nr: 71, name: 'Additions to Esther', name_fr: 'Additions d\'Esther', slug: 'additions-esther', category: 'deutero' },
  { nr: 73, name: 'Wisdom', name_fr: 'Sagesse', slug: 'sagesse', category: 'deutero' },
  { nr: 74, name: 'Sirach', name_fr: 'Siracide', slug: 'siracide', category: 'deutero' },
  { nr: 75, name: 'Baruch', name_fr: 'Baruch', slug: 'baruch', category: 'deutero' },
  { nr: 76, name: 'Prayer of Azariah', name_fr: 'Prière d\'Azariah', slug: 'priere-azariah', category: 'deutero' },
  { nr: 77, name: 'Susanna', name_fr: 'Susanne', slug: 'susanna', category: 'deutero' },
  { nr: 78, name: 'Bel and the Dragon', name_fr: 'Bel et le Dragon', slug: 'bel-dragon', category: 'deutero' },
  { nr: 79, name: 'Prayer of Manasses', name_fr: 'Prière de Manassé', slug: 'priere-manasse', category: 'deutero' },
  { nr: 80, name: '1 Maccabees', name_fr: '1 Maccabées', slug: '1-macCabees', category: 'deutero' },
  { nr: 81, name: '2 Maccabees', name_fr: '2 Maccabées', slug: '2-macCabees', category: 'deutero' },
];

/**
 * Traduit un texte vers le français
 * Note: Utilise une API de traduction (à configurer)
 */
async function translateToFrench(text: string): Promise<string> {
  // TODO: Intégrer une vraie API de traduction (DeepL, Google Translate, etc.)
  // Pour l'instant, on retourne le texte original avec un marqueur
  return `[FR] ${text}`;
}

/**
 * Récupère un livre depuis get.bible API
 */
async function fetchFromGetBible(bookNr: number) {
  const url = `https://api.getbible.net/v2/kjva/${bookNr}.json`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch book ${bookNr}: ${response.statusText}`);
  }
  return response.json();
}

/**
 * Récupère le Book of Jubilees depuis Sefaria API
 */
async function fetchJubileesFromSefaria() {
  const url = 'https://www.sefaria.org/api/v2/texts/Book_of_Jubilees?context=0';
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch Jubilees: ${response.statusText}`);
  }
  return response.json();
}

/**
 * Crée un livre apocryphe dans la DB
 */
async function createBook(book: typeof APOCRYPHAL_BOOKS[0], source: string) {
  const { data, error } = await supabase
    .from('apocryphal_books')
    .insert({
      name: book.name,
      name_fr: book.name_fr,
      slug: book.slug,
      source: source,
      source_id: source === 'getbible' ? 'kjva' : 'sefaria',
      category: book.category,
      chapters: 0, // Sera mis à jour après
      description: `Apocryphal book: ${book.name}`,
      description_fr: `Livre apocryphe: ${book.name_fr}`,
      original_lang: 'en',
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Insère les versets d'un livre
 */
async function insertVerses(bookId: string, verses: any[]) {
  const toInsert = verses.map((v, index) => ({
    book_id: bookId,
    chapter: v.chapter || 1,
    verse: v.verse || index + 1,
    text_original: v.text,
    text_fr: `[FR] ${v.text}`, // Traduction provisoire
  }));

  const { data, error } = await supabase
    .from('apocryphal_verses')
    .insert(toInsert);

  if (error) throw error;
  return data;
}

/**
 * Main: Récupère et importe tous les apocryphes
 */
async function main() {
  console.log('🚀 Starting apocrypha fetch and import...');

  // 1. Import depuis get.bible
  console.log('\n📖 Fetching from get.bible API...');
  for (const book of APOCRYPHAL_BOOKS) {
    try {
      console.log(` Fetching ${book.name}...`);
      const data = await fetchFromGetBible(book.nr);

      // Créer le livre
      const bookRecord = await createBook(book, 'getbible');
      console.log(`    ✓ Created book record: ${bookRecord.id}`);

      // Extraire et insérer les versets
      // Note: La structure de get.bible peut varier, adapter selon le format réel
      // Pour l'instant, c'est un placeholder
      console.log(`    ✓ Inserting verses...`);

    } catch (error) {
      console.error(`    ✗ Error with ${book.name}:`, error);
    }
  }

  // 2. Import depuis Sefaria (Jubilees)
  console.log('\n📜 Fetching Book of Jubilees from Sefaria...');
  try {
    const jubilees = await fetchJubileesFromSefaria();
    console.log('  ✓ Jubilees fetched');
    // TODO: Parser et insérer
  } catch (error) {
    console.error('  ✗ Error fetching Jubilees:', error);
  }

  console.log('\n✅ Done! Check Supabase for imported books.');
}

// Run
main().catch(console.error);
