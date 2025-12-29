/**
 * Wiki Parser - Convertit les liens [[reference]] en liens hypertexte
 * Supporte les formats:
 * - [[Jean 3:16]] -> lien vers /bible/jean/3/16
 * - [[Matthieu 5]] -> lien vers /bible/matthieu/5
 * - [[Article Title]] -> lien vers /wiki/article-title
 */

export function parseWikiLinks(content: string): string {
  // Pattern pour capturer les liens wiki
  const wikiLinkPattern = /\[\[([^\]]+)\]\]/g;

  return content.replace(wikiLinkPattern, (match, reference) => {
    const trimmedRef = reference.trim();

    // Vérifier si c'est une référence biblique (contient un chiffre)
    if (/\d/.test(trimmedRef)) {
      return parseBibleReference(trimmedRef);
    }

    // Sinon, c'est un lien vers un article wiki
    return parseWikiArticleReference(trimmedRef);
  });
}

function parseBibleReference(reference: string): string {
  // Pattern pour les références bibliques: "Livre Chapitre:Verset" ou "Livre Chapitre"
  const biblePattern = /^([A-Za-zÀ-ÿ\s]+)\s+(\d+)(?::(\d+))?$/;
  const match = reference.match(biblePattern);

  if (!match) {
    return `<a href="/search?q=${encodeURIComponent(reference)}" class="text-accent hover:underline">[[${reference}]]</a>`;
  }

  const [, book, chapter, verse] = match;
  const slug = bookToSlug(book.trim());
  const chapterNum = parseInt(chapter);

  if (verse) {
    // Lien vers un verset spécifique
    return `<a href="/bible/${slug}/${chapterNum}/${verse}" class="text-accent hover:underline font-medium">${reference}</a>`;
  } else {
    // Lien vers un chapitre entier
    return `<a href="/bible/${slug}/${chapterNum}" class="text-accent hover:underline font-medium">${reference}</a>`;
  }
}

function parseWikiArticleReference(title: string): string {
  const slug = titleToSlug(title);
  return `<a href="/wiki/${slug}" class="text-accent hover:underline font-medium">${title}</a>`;
}

function bookToSlug(bookName: string): string {
  // Mapping des livres bibliques vers leurs slugs
  const bookMapping: Record<string, string> = {
    'Genèse': 'geneses',
    'Exode': 'exode',
    'Lévitique': 'levitique',
    'Nombres': 'nombres',
    'Deutéronome': 'deuterome',
    'Josué': 'josue',
    'Juges': 'juges',
    'Ruth': 'ruth',
    '1 Samuel': '1-samuel',
    '2 Samuel': '2-samuel',
    '1 Rois': '1-rois',
    '2 Rois': '2-rois',
    '1 Chroniques': '1-chroniques',
    '2 Chroniques': '2-chroniques',
    'Esdras': 'esdras',
    'Néhémie': 'nehemie',
    'Tobie': 'tobie',
    'Judith': 'judith',
    'Esther': 'esther',
    '1 Maccabées': '1-maccabees',
    '2 Maccabées': '2-maccabees',
    'Job': 'job',
    'Psaumes': 'psaumes',
    'Proverbes': 'proverbes',
    'Ecclésiaste': 'ecclesiaste',
    'Cantique des Cantiques': 'cantique-des-cantiques',
    'Sagesse': 'sagesse',
    'Siracide': 'siracide',
    'Isaïe': 'isaie',
    'Jérémie': 'jeremie',
    'Lamentations': 'lamentations',
    'Baruch': 'baruch',
    'Ézéchiel': 'ezechiel',
    'Daniel': 'daniel',
    'Osée': 'osee',
    'Joël': 'joel',
    'Amos': 'amos',
    'Abdias': 'abdias',
    'Jonas': 'jonas',
    'Michée': 'michee',
    'Nahum': 'nahum',
    'Habacuc': 'habacuc',
    'Sophonie': 'sophonie',
    'Aggée': 'aggee',
    'Zacharie': 'zacharie',
    'Malachie': 'malachie',
    'Matthieu': 'matthieu',
    'Marc': 'marc',
    'Luc': 'luc',
    'Jean': 'jean',
    'Actes des Apôtres': 'actes',
    'Romains': 'romains',
    '1 Corinthiens': '1-corinthiens',
    '2 Corinthiens': '2-corinthiens',
    'Galates': 'galates',
    'Éphésiens': 'ephesiens',
    'Philippiens': 'philippiens',
    'Colossiens': 'colossiens',
    '1 Thessaloniciens': '1-thessaloniciens',
    '2 Thessaloniciens': '2-thessaloniciens',
    '1 Timothée': '1-timothee',
    '2 Timothée': '2-timothee',
    'Tite': 'tite',
    'Philémon': 'philemon',
    'Hébreux': 'hebreux',
    'Jacques': 'jacques',
    '1 Pierre': '1-pierre',
    '2 Pierre': '2-pierre',
    '1 Jean': '1-jean',
    '2 Jean': '2-jean',
    '3 Jean': '3-jean',
    'Jude': 'jude',
    'Apocalypse': 'apocalypse',
  };

  return bookMapping[bookName] || titleToSlug(bookName);
}

function titleToSlug(title: string): string {
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export function extractWikiLinks(content: string): string[] {
  const pattern = /\[\[([^\]]+)\]\]/g;
  const links: string[] = [];
  let match;

  while ((match = pattern.exec(content)) !== null) {
    links.push(match[1].trim());
  }

  return links;
}
