/**
 * Script d'import des 73 livres de la Bible Catholique
 * Ancien Testament: 46 livres
 * Nouveau Testament: 27 livres
 */

import { supabase } from '../lib/supabase';

interface BibleBook {
  name: string;
  name_en: string;
  testament: 'old' | 'new';
  position: number;
  chapters: number;
  is_deuterocanonical: boolean;
}

// Les 73 livres du canon catholique
const catholicBibleBooks: BibleBook[] = [
  // === ANCIEN TESTAMENT (46 livres) ===

  // Pentateuque (5 livres)
  { name: 'Genèse', name_en: 'Genesis', testament: 'old', position: 1, chapters: 50, is_deuterocanonical: false },
  { name: 'Exode', name_en: 'Exodus', testament: 'old', position: 2, chapters: 40, is_deuterocanonical: false },
  { name: 'Lévitique', name_en: 'Leviticus', testament: 'old', position: 3, chapters: 27, is_deuterocanonical: false },
  { name: 'Nombres', name_en: 'Numbers', testament: 'old', position: 4, chapters: 36, is_deuterocanonical: false },
  { name: 'Deutéronome', name_en: 'Deuteronomy', testament: 'old', position: 5, chapters: 34, is_deuterocanonical: false },

  // Livres historiques (16 livres)
  { name: 'Josué', name_en: 'Joshua', testament: 'old', position: 6, chapters: 24, is_deuterocanonical: false },
  { name: 'Juges', name_en: 'Judges', testament: 'old', position: 7, chapters: 21, is_deuterocanonical: false },
  { name: 'Ruth', name_en: 'Ruth', testament: 'old', position: 8, chapters: 4, is_deuterocanonical: false },
  { name: '1 Samuel', name_en: '1 Samuel', testament: 'old', position: 9, chapters: 31, is_deuterocanonical: false },
  { name: '2 Samuel', name_en: '2 Samuel', testament: 'old', position: 10, chapters: 24, is_deuterocanonical: false },
  { name: '1 Rois', name_en: '1 Kings', testament: 'old', position: 11, chapters: 22, is_deuterocanonical: false },
  { name: '2 Rois', name_en: '2 Kings', testament: 'old', position: 12, chapters: 25, is_deuterocanonical: false },
  { name: '1 Chroniques', name_en: '1 Chronicles', testament: 'old', position: 13, chapters: 29, is_deuterocanonical: false },
  { name: '2 Chroniques', name_en: '2 Chronicles', testament: 'old', position: 14, chapters: 36, is_deuterocanonical: false },
  { name: 'Esdras', name_en: 'Ezra', testament: 'old', position: 15, chapters: 10, is_deuterocanonical: false },
  { name: 'Néhémie', name_en: 'Nehemiah', testament: 'old', position: 16, chapters: 13, is_deuterocanonical: false },
  { name: 'Tobie', name_en: 'Tobit', testament: 'old', position: 17, chapters: 14, is_deuterocanonical: true },
  { name: 'Judith', name_en: 'Judith', testament: 'old', position: 18, chapters: 16, is_deuterocanonical: true },
  { name: 'Esther', name_en: 'Esther', testament: 'old', position: 19, chapters: 16, is_deuterocanonical: false },
  { name: '1 Maccabées', name_en: '1 Maccabees', testament: 'old', position: 20, chapters: 16, is_deuterocanonical: true },
  { name: '2 Maccabées', name_en: '2 Maccabees', testament: 'old', position: 21, chapters: 15, is_deuterocanonical: true },

  // Livres poétiques et sapientiaux (7 livres)
  { name: 'Job', name_en: 'Job', testament: 'old', position: 22, chapters: 42, is_deuterocanonical: false },
  { name: 'Psaumes', name_en: 'Psalms', testament: 'old', position: 23, chapters: 150, is_deuterocanonical: false },
  { name: 'Proverbes', name_en: 'Proverbs', testament: 'old', position: 24, chapters: 31, is_deuterocanonical: false },
  { name: 'Ecclésiaste', name_en: 'Ecclesiastes', testament: 'old', position: 25, chapters: 12, is_deuterocanonical: false },
  { name: 'Cantique des Cantiques', name_en: 'Song of Songs', testament: 'old', position: 26, chapters: 8, is_deuterocanonical: false },
  { name: 'Sagesse', name_en: 'Wisdom', testament: 'old', position: 27, chapters: 19, is_deuterocanonical: true },
  { name: 'Siracide', name_en: 'Sirach', testament: 'old', position: 28, chapters: 51, is_deuterocanonical: true },

  // Prophètes (18 livres)
  { name: 'Isaïe', name_en: 'Isaiah', testament: 'old', position: 29, chapters: 66, is_deuterocanonical: false },
  { name: 'Jérémie', name_en: 'Jeremiah', testament: 'old', position: 30, chapters: 52, is_deuterocanonical: false },
  { name: 'Lamentations', name_en: 'Lamentations', testament: 'old', position: 31, chapters: 5, is_deuterocanonical: false },
  { name: 'Baruch', name_en: 'Baruch', testament: 'old', position: 32, chapters: 6, is_deuterocanonical: true },
  { name: 'Ézéchiel', name_en: 'Ezekiel', testament: 'old', position: 33, chapters: 48, is_deuterocanonical: false },
  { name: 'Daniel', name_en: 'Daniel', testament: 'old', position: 34, chapters: 14, is_deuterocanonical: false },
  { name: 'Osée', name_en: 'Hosea', testament: 'old', position: 35, chapters: 14, is_deuterocanonical: false },
  { name: 'Joël', name_en: 'Joel', testament: 'old', position: 36, chapters: 4, is_deuterocanonical: false },
  { name: 'Amos', name_en: 'Amos', testament: 'old', position: 37, chapters: 9, is_deuterocanonical: false },
  { name: 'Abdias', name_en: 'Obadiah', testament: 'old', position: 38, chapters: 1, is_deuterocanonical: false },
  { name: 'Jonas', name_en: 'Jonah', testament: 'old', position: 39, chapters: 4, is_deuterocanonical: false },
  { name: 'Michée', name_en: 'Micah', testament: 'old', position: 40, chapters: 7, is_deuterocanonical: false },
  { name: 'Nahum', name_en: 'Nahum', testament: 'old', position: 41, chapters: 3, is_deuterocanonical: false },
  { name: 'Habacuc', name_en: 'Habakkuk', testament: 'old', position: 42, chapters: 3, is_deuterocanonical: false },
  { name: 'Sophonie', name_en: 'Zephaniah', testament: 'old', position: 43, chapters: 3, is_deuterocanonical: false },
  { name: 'Aggée', name_en: 'Haggai', testament: 'old', position: 44, chapters: 2, is_deuterocanonical: false },
  { name: 'Zacharie', name_en: 'Zechariah', testament: 'old', position: 45, chapters: 14, is_deuterocanonical: false },
  { name: 'Malachie', name_en: 'Malachi', testament: 'old', position: 46, chapters: 4, is_deuterocanonical: false },

  // === NOUVEAU TESTAMENT (27 livres) ===

  // Évangiles (4 livres)
  { name: 'Matthieu', name_en: 'Matthew', testament: 'new', position: 47, chapters: 28, is_deuterocanonical: false },
  { name: 'Marc', name_en: 'Mark', testament: 'new', position: 48, chapters: 16, is_deuterocanonical: false },
  { name: 'Luc', name_en: 'Luke', testament: 'new', position: 49, chapters: 24, is_deuterocanonical: false },
  { name: 'Jean', name_en: 'John', testament: 'new', position: 50, chapters: 21, is_deuterocanonical: false },

  // Histoire apostolique (1 livre)
  { name: 'Actes des Apôtres', name_en: 'Acts', testament: 'new', position: 51, chapters: 28, is_deuterocanonical: false },

  // Épîtres de Paul (13 épîtres)
  { name: 'Romains', name_en: 'Romans', testament: 'new', position: 52, chapters: 16, is_deuterocanonical: false },
  { name: '1 Corinthiens', name_en: '1 Corinthians', testament: 'new', position: 53, chapters: 16, is_deuterocanonical: false },
  { name: '2 Corinthiens', name_en: '2 Corinthians', testament: 'new', position: 54, chapters: 13, is_deuterocanonical: false },
  { name: 'Galates', name_en: 'Galatians', testament: 'new', position: 55, chapters: 6, is_deuterocanonical: false },
  { name: 'Éphésiens', name_en: 'Ephesians', testament: 'new', position: 56, chapters: 6, is_deuterocanonical: false },
  { name: 'Philippiens', name_en: 'Philippians', testament: 'new', position: 57, chapters: 4, is_deuterocanonical: false },
  { name: 'Colossiens', name_en: 'Colossians', testament: 'new', position: 58, chapters: 4, is_deuterocanonical: false },
  { name: '1 Thessaloniciens', name_en: '1 Thessalonians', testament: 'new', position: 59, chapters: 5, is_deuterocanonical: false },
  { name: '2 Thessaloniciens', name_en: '2 Thessalonians', testament: 'new', position: 60, chapters: 3, is_deuterocanonical: false },
  { name: '1 Timothée', name_en: '1 Timothy', testament: 'new', position: 61, chapters: 6, is_deuterocanonical: false },
  { name: '2 Timothée', name_en: '2 Timothy', testament: 'new', position: 62, chapters: 4, is_deuterocanonical: false },
  { name: 'Tite', name_en: 'Titus', testament: 'new', position: 63, chapters: 3, is_deuterocanonical: false },
  { name: 'Philémon', name_en: 'Philemon', testament: 'new', position: 64, chapters: 1, is_deuterocanonical: false },

  // Épître aux Hébreux
  { name: 'Hébreux', name_en: 'Hebrews', testament: 'new', position: 65, chapters: 13, is_deuterocanonical: false },

  // Épîtres catholiques (7 épîtres)
  { name: 'Jacques', name_en: 'James', testament: 'new', position: 66, chapters: 5, is_deuterocanonical: false },
  { name: '1 Pierre', name_en: '1 Peter', testament: 'new', position: 67, chapters: 5, is_deuterocanonical: false },
  { name: '2 Pierre', name_en: '2 Peter', testament: 'new', position: 68, chapters: 3, is_deuterocanonical: false },
  { name: '1 Jean', name_en: '1 John', testament: 'new', position: 69, chapters: 5, is_deuterocanonical: false },
  { name: '2 Jean', name_en: '2 John', testament: 'new', position: 70, chapters: 1, is_deuterocanonical: false },
  { name: '3 Jean', name_en: '3 John', testament: 'new', position: 71, chapters: 1, is_deuterocanonical: false },
  { name: 'Jude', name_en: 'Jude', testament: 'new', position: 72, chapters: 1, is_deuterocanonical: false },

  // Apocalypse
  { name: 'Apocalypse', name_en: 'Revelation', testament: 'new', position: 73, chapters: 22, is_deuterocanonical: false },
];

async function importBibleBooks() {
  console.log('📖 Import des 73 livres de la Bible Catholique...\n');

  // Vérifier combien de livres existent déjà
  const { data: existingBooks, count } = await supabase
    .from('bible_books')
    .select('id', { count: 'exact' });

  console.log(`📚 Livres existants: ${count || 0}/73`);

  if (count && count > 0) {
    console.log('⚠️  La table contient déjà des livres. Voulez-vous continuer l\'import? (y/n)');
    return;
  }

  // Importer les livres
  let successCount = 0;
  let errorCount = 0;

  for (const book of catholicBibleBooks) {
    try {
      const { error } = await supabase
        .from('bible_books')
        .insert({
          name: book.name,
          name_en: book.name_en,
          testament: book.testament,
          position: book.position,
          chapters: book.chapters,
          is_deuterocanonical: book.is_deuterocanonical,
        });

      if (error) {
        console.error(`❌ Erreur pour ${book.name}:`, error.message);
        errorCount++;
      } else {
        console.log(`✅ ${book.position}. ${book.name} (${book.chapters} chapitres)${book.is_deuterocanonical ? ' 🟡 Deutérocanonique' : ''}`);
        successCount++;
      }
    } catch (err) {
      console.error(`❌ Erreur pour ${book.name}:`, err);
      errorCount++;
    }
  }

  console.log(`\n✨ Import terminé: ${successCount} succès, ${errorCount} erreurs`);

  // Vérifier le total
  const { count: finalCount } = await supabase
    .from('bible_books')
    .select('id', { count: 'exact', head: true });

  console.log(`📚 Total livres dans la base: ${finalCount}/73`);
}

// Exécuter l'import
importBibleBooks().catch(console.error);
