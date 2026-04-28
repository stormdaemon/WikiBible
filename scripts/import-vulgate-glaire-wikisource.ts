import { mkdir, readFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { config } from "dotenv";

config({ path: ".env" });
config({ path: ".env.local" });

type BibleBook = {
  id: string;
  slug: string;
  name: string;
  chapters: number;
};

type BookSource = {
  slug: string;
  title: string;
};

type VerseRow = {
  book_id: string;
  book_slug: string;
  chapter: number;
  verse: number;
  text: string;
  translation_id: typeof TRANSLATION_ID;
};

const PROJECT_REF = process.env.SUPABASE_PROJECT_REF ?? "gsqodedelzzbcqefoneb";
const TRANSLATION_ID = "vulgate-fr";
const TRANSLATION_NAME = "Bible Vulgate Française";
const SOURCE_ROOT = "La sainte Bible selon la Vulgate (J.-B. Glaire)";
const WIKISOURCE_API = "https://fr.wikisource.org/w/api.php";
const OUT_DIR = path.resolve("tmp", "vulgate-glaire-wikisource");
const BACKUP_DIR = path.join(OUT_DIR, "backup", new Date().toISOString().replace(/[:.]/g, "-"));

const BOOK_SOURCES: BookSource[] = [
  { slug: "genese", title: "Genèse" },
  { slug: "exode", title: "Exode" },
  { slug: "levitique", title: "Lévitique" },
  { slug: "nombres", title: "Nombres" },
  { slug: "deuterome", title: "Deutéronome" },
  { slug: "josue", title: "Josué" },
  { slug: "juges", title: "Juges" },
  { slug: "ruth", title: "Ruth" },
  { slug: "1-samuel", title: "I Rois" },
  { slug: "2-samuel", title: "II Rois" },
  { slug: "1-rois", title: "III Rois" },
  { slug: "2-rois", title: "IV Rois" },
  { slug: "1-chroniques", title: "I Paralipomènes" },
  { slug: "2-chroniques", title: "II Paralipomènes" },
  { slug: "esdras", title: "I Esdras" },
  { slug: "nehemie", title: "II Esdras" },
  { slug: "tobie", title: "Tobie" },
  { slug: "judith", title: "Judith" },
  { slug: "ester", title: "Esther" },
  { slug: "1-macchabees", title: "I Machabées" },
  { slug: "2-macchabees", title: "II Machabées" },
  { slug: "job", title: "Job" },
  { slug: "psaumes", title: "Psaumes" },
  { slug: "proverbes", title: "Proverbes" },
  { slug: "ecclesiaste", title: "Ecclésiaste" },
  { slug: "cantique", title: "Cantique" },
  { slug: "sagesse", title: "Sagesse" },
  { slug: "siracide", title: "Ecclésiastique" },
  { slug: "eesaie", title: "Isaïe" },
  { slug: "jeremie", title: "Jérémie" },
  { slug: "lamentations", title: "Lamentations" },
  { slug: "baruch", title: "Baruch" },
  { slug: "ezechiel", title: "Ézéchiel" },
  { slug: "daniel", title: "Daniel" },
  { slug: "oslee", title: "Osée" },
  { slug: "joel", title: "Joël" },
  { slug: "amos", title: "Amos" },
  { slug: "abdias", title: "Abdias" },
  { slug: "jonas", title: "Jonas" },
  { slug: "michee", title: "Michée" },
  { slug: "nahum", title: "Nahum" },
  { slug: "habacuc", title: "Habacuc" },
  { slug: "sophonie", title: "Sophonie" },
  { slug: "aggee", title: "Aggée" },
  { slug: "zacharie", title: "Zacharie" },
  { slug: "malachie", title: "Malachie" },
  { slug: "matthieu", title: "Matthieu" },
  { slug: "marc", title: "Marc" },
  { slug: "luc", title: "Luc" },
  { slug: "jean", title: "Jean" },
  { slug: "actes", title: "Actes des Apôtres" },
  { slug: "romains", title: "Romains" },
  { slug: "1-corinthiens", title: "I Corinthiens" },
  { slug: "2-corinthiens", title: "II Corinthiens" },
  { slug: "galates", title: "Galates" },
  { slug: "ephesiens", title: "Éphésiens" },
  { slug: "philippiens", title: "Philippiens" },
  { slug: "colossiens", title: "Colossiens" },
  { slug: "1-thesaloniciens", title: "I Thessaloniciens" },
  { slug: "2-thesaloniciens", title: "II Thessaloniciens" },
  { slug: "1-timothee", title: "I Timothée" },
  { slug: "2-timothee", title: "II Timothée" },
  { slug: "tite", title: "Tite" },
  { slug: "philemon", title: "Philémon" },
  { slug: "hebreux", title: "Hébreux" },
  { slug: "jacques", title: "Jacques" },
  { slug: "1-pierre", title: "I Pierre" },
  { slug: "2-pierre", title: "II Pierre" },
  { slug: "1-jean", title: "I Jean" },
  { slug: "2-jean", title: "II Jean" },
  { slug: "3-jean", title: "III Jean" },
  { slug: "jude", title: "Jude" },
  { slug: "apocalypse", title: "Apocalypse" },
];

function sqlString(value: string) {
  return `'${value.replace(/'/g, "''")}'`;
}

async function readMcpToken(): Promise<string> {
  if (process.env.SUPABASE_ACCESS_TOKEN) return process.env.SUPABASE_ACCESS_TOKEN;

  const mcpPath = path.resolve(".mcp.json");
  if (!existsSync(mcpPath)) throw new Error("Missing SUPABASE_ACCESS_TOKEN or .mcp.json.");

  const raw = await readFile(mcpPath, "utf8");
  const mcpConfig = JSON.parse(raw);
  const header = mcpConfig?.mcpServers?.supabase?.headers?.Authorization;
  if (typeof header !== "string") throw new Error("Missing .mcp.json Supabase Authorization header.");

  return header.replace(/^Bearer\s+/i, "");
}

async function querySupabase<T>(query: string): Promise<T[]> {
  const token = await readMcpToken();
  const response = await fetch(`https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query }),
  });

  if (!response.ok) {
    throw new Error(`Supabase SQL failed: ${response.status} ${await response.text()}\nQuery:\n${query}`);
  }

  const json = await response.json();
  return Array.isArray(json) ? json : [json];
}

async function fetchBooks() {
  const books = await querySupabase<BibleBook>("select id, slug, name, chapters from public.bible_books order by position;");
  return new Map(books.map((book) => [book.slug, book]));
}

function decodeEntities(value: string) {
  return value
    .replace(/&#160;|&nbsp;/g, " ")
    .replace(/&#32;/g, " ")
    .replace(/&#8239;|&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, "\"")
    .replace(/&#39;/g, "'")
    .replace(/&#95;/g, "_")
    .replace(/&[lr]squo;/g, "’")
    .replace(/&[lr]dquo;/g, "\"");
}

function htmlToText(value: string) {
  return decodeEntities(
    value
      .replace(/<sup\b[\s\S]*?<\/sup>/g, "")
      .replace(/<span class="mw-editsection"[\s\S]*?<\/span>/g, "")
      .replace(/<style\b[\s\S]*?<\/style>/g, "")
      .replace(/<script\b[\s\S]*?<\/script>/g, "")
      .replace(/<br\s*\/?>/g, "\n")
      .replace(/<\/p>\s*<p[^>]*>/g, "\n")
      .replace(/<\/div>\s*<div[^>]*>/g, "\n")
      .replace(/<[^>]+>/g, " "),
  )
    .replace(/\[\s*\d+\s*\]/g, "")
    .replace(/\s+\n/g, "\n")
    .replace(/\n\s+/g, "\n")
    .replace(/[ \t]+/g, " ")
    .trim();
}

function parseChapters(html: string) {
  const headingPattern = /<h[3-5]\b[^>]*id="(?:CHAPITRE|PSAUME)_(PREMIER|\d+)(?=[\._\["])[^"]*"[\s\S]*?<\/h[3-5]>/g;
  const headings = [...html.matchAll(headingPattern)].map((match) => ({
    chapter: match[1] === "PREMIER" ? 1 : Number(match[1]),
    start: match.index ?? 0,
    end: (match.index ?? 0) + match[0].length,
  }));

  const chapters = new Map<number, Array<{ verse: number; text: string }>>();
  for (let i = 0; i < headings.length; i++) {
    const current = headings[i];
    const next = headings[i + 1];
    const rawSegment = html.slice(current.end, next?.start ?? html.length);
    const segment = rawSegment
      .replace(/<div class="mw-references-wrap[\s\S]*?(?=<h[3-5]\b|$)/g, "")
      .replace(/<ol class="references"[\s\S]*?<\/ol>/g, "");
    const text = htmlToText(segment);
    const versePattern = /(?:^|\n)\s*(\d+)\.\s+([\s\S]*?)(?=\n\s*\d+\.\s+|$)/g;
    const verses: Array<{ verse: number; text: string }> = [];

    for (const match of text.matchAll(versePattern)) {
      const parenthesizedVerse = match[2].match(/^\((\d+)\)\.\s*/);
      const verse = parenthesizedVerse ? Number(parenthesizedVerse[1]) : Number(match[1]);
      const verseText = match[2]
        .replace(/^\((\d+)\)\.\s*/, "")
        .replace(/\n+/g, " ")
        .replace(/\s+/g, " ")
        .trim();

      if (verseText) verses.push({ verse, text: verseText });
    }

    chapters.set(current.chapter, verses);
  }

  return chapters;
}

async function fetchWikisourceHtml(source: BookSource) {
  const page = `${SOURCE_ROOT}/${source.title}`;
  const url = `${WIKISOURCE_API}?action=parse&format=json&formatversion=2&prop=text&page=${encodeURIComponent(page)}`;
  const response = await fetch(url, {
    headers: {
      "User-Agent": "WikiBible import script (https://wikibible.fr)",
    },
  });

  if (!response.ok) throw new Error(`Wikisource fetch failed for ${page}: ${response.status}`);

  const json = await response.json();
  if (!json.parse?.text) {
    throw new Error(`Wikisource page not found or unparsable: ${page} ${JSON.stringify(json.error || {})}`);
  }

  return json.parse.text as string;
}

async function parseAllRows() {
  const books = await fetchBooks();
  const rows: VerseRow[] = [];
  const report: Array<{ slug: string; title: string; chapters: number; verses: number; expectedChapters: number }> = [];

  for (const source of BOOK_SOURCES) {
    const book = books.get(source.slug);
    if (!book) throw new Error(`Missing DB book for slug ${source.slug}`);

    const html = await fetchWikisourceHtml(source);
    const chapters = parseChapters(html);
    let verseCount = 0;

    for (const [chapter, verses] of [...chapters.entries()].sort((a, b) => a[0] - b[0])) {
      for (const verse of verses) {
        rows.push({
          book_id: book.id,
          book_slug: book.slug,
          chapter,
          verse: verse.verse,
          text: verse.text,
          translation_id: TRANSLATION_ID,
        });
        verseCount++;
      }
    }

    report.push({
      slug: source.slug,
      title: source.title,
      chapters: chapters.size,
      verses: verseCount,
      expectedChapters: book.chapters,
    });
    console.log(`${source.slug}: ${chapters.size} chapters, ${verseCount} verses`);
  }

  await mkdir(OUT_DIR, { recursive: true });
  await writeFile(path.join(OUT_DIR, "vulgate-glaire-verses.json"), JSON.stringify(rows, null, 2), "utf8");
  await writeFile(path.join(OUT_DIR, "vulgate-glaire-report.json"), JSON.stringify(report, null, 2), "utf8");

  return { rows, report };
}

async function backupExisting() {
  await mkdir(BACKUP_DIR, { recursive: true });

  const translation = await querySupabase(
    `select * from public.bible_translations where slug = ${sqlString(TRANSLATION_ID)};`,
  );
  const verses = await querySupabase(
    `select * from public.bible_verses where translation_id = ${sqlString(TRANSLATION_ID)} order by book_slug, chapter, verse;`,
  );

  await writeFile(path.join(BACKUP_DIR, "bible_translations_vulgate_fr.json"), JSON.stringify(translation, null, 2), "utf8");
  await writeFile(path.join(BACKUP_DIR, "bible_verses_vulgate_fr.json"), JSON.stringify(verses, null, 2), "utf8");
}

function insertRowsSql(rows: VerseRow[]) {
  const values = rows
    .map(
      (row) =>
        `(${sqlString(row.book_id)}::uuid, ${sqlString(row.book_slug)}, ${row.chapter}, ${row.verse}, ${sqlString(row.text)}, ${sqlString(row.translation_id)})`,
    )
    .join(",\n");

  return `
    insert into public.bible_verses (book_id, book_slug, chapter, verse, text, translation_id)
    values
    ${values};
  `;
}

async function applyImport(rows: VerseRow[]) {
  await querySupabase(`
    insert into public.bible_translations (name, slug, language, type, is_active)
    values (${sqlString(TRANSLATION_NAME)}, ${sqlString(TRANSLATION_ID)}, 'Français', 'official', true)
    on conflict (slug) do update
      set name = excluded.name,
          language = excluded.language,
          type = excluded.type,
          is_active = excluded.is_active;
  `);

  await querySupabase(`delete from public.bible_verses where translation_id = ${sqlString(TRANSLATION_ID)};`);

  const chunkSize = 750;
  for (let i = 0; i < rows.length; i += chunkSize) {
    const chunk = rows.slice(i, i + chunkSize);
    await querySupabase(insertRowsSql(chunk));
    console.log(`Inserted ${Math.min(i + chunkSize, rows.length)} / ${rows.length}`);
  }
}

async function validateImport() {
  const counts = await querySupabase<{
    translation_id: string;
    books: number;
    chapters: number;
    verses: number;
  }>(`
    select translation_id, count(distinct book_slug)::int as books, count(distinct (book_slug, chapter))::int as chapters, count(*)::int as verses
    from public.bible_verses
    where translation_id = ${sqlString(TRANSLATION_ID)}
    group by translation_id;
  `);

  const unavailable = await querySupabase<{
    book_slug: string;
    chapter: number;
  }>(`
    with expected as (
      select slug as book_slug, generate_series(1, chapters) as chapter
      from public.bible_books
    ),
    existing as (
      select distinct book_slug, chapter
      from public.bible_verses
      where translation_id = ${sqlString(TRANSLATION_ID)}
    )
    select expected.book_slug, expected.chapter
    from expected
    left join existing
      on existing.book_slug = expected.book_slug
     and existing.chapter = expected.chapter
    where existing.chapter is null
    order by expected.book_slug, expected.chapter;
  `);

  return { counts, unavailable };
}

async function main() {
  const dryRun = process.argv.includes("--dry-run");
  const { rows, report } = await parseAllRows();

  console.table(report.filter((item) => item.chapters !== item.expectedChapters));
  console.log(`Parsed ${rows.length} verses from Wikisource Glaire.`);

  if (dryRun) return;

  await backupExisting();
  console.log(`Backup written to ${BACKUP_DIR}`);

  await applyImport(rows);

  const validation = await validateImport();
  console.table(validation.counts);
  console.table(validation.unavailable);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
