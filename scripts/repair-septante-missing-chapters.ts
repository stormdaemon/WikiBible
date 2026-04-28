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

type SourceVerse = {
  ref: string;
  greek: string;
  french: string;
};

type BibleVerseInsert = {
  book_id: string;
  book_slug: string;
  chapter: number;
  verse: number;
  text: string;
  translation_id: "septante" | "grec";
};

const PROJECT_REF = process.env.SUPABASE_PROJECT_REF ?? "gsqodedelzzbcqefoneb";
const SOURCE_DIR = path.resolve("tmp", "theotex-septuaginta", "html");
const BACKUP_DIR = path.resolve(
  "tmp",
  "theotex-septuaginta",
  "repair-backup",
  new Date().toISOString().replace(/[:.]/g, "-"),
);

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

function decodeEntities(value: string) {
  return value
    .replace(/&nbsp;/g, " ")
    .replace(/&#160;/g, " ")
    .replace(/&thinsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, "\"")
    .replace(/&#39;/g, "'");
}

function cleanVerseText(html: string) {
  return decodeEntities(html.replace(/<[^>]+>/g, " "))
    .replace(/\s+/g, " ")
    .trim();
}

async function parseTheoTexChapter(bookDir: string, fileName: string): Promise<SourceVerse[]> {
  const html = await readFile(path.join(SOURCE_DIR, bookDir, fileName), "utf8");
  const rows: SourceVerse[] = [];
  const versePattern =
    /<tr valign="top">\s*<td[^>]*>\s*<div class="num">([0-9]+[a-z]?)<\/div><\/td>\s*<td><div class="vg">([\s\S]*?)<\/div><\/td>\s*<td[^>]*><\/td>\s*<td><div class="vf">([\s\S]*?)<\/div><\/td>/g;

  for (const match of html.matchAll(versePattern)) {
    rows.push({
      ref: match[1],
      greek: cleanVerseText(match[2]),
      french: cleanVerseText(match[3]),
    });
  }

  return rows;
}

function byRefs(rows: SourceVerse[], refs: string[]) {
  const rowByRef = new Map(rows.map((row) => [row.ref, row]));
  return refs.map((ref) => {
    const row = rowByRef.get(ref);
    if (!row) throw new Error(`Missing TheoTeX source verse ${ref}.`);
    return row;
  });
}

function alphaRefs(rows: SourceVerse[], start: string, end: string) {
  const startIndex = rows.findIndex((row) => row.ref === start);
  const endIndex = rows.findIndex((row) => row.ref === end);
  if (startIndex === -1 || endIndex === -1 || startIndex > endIndex) {
    throw new Error(`Invalid TheoTeX alpha range ${start}-${end}.`);
  }

  return rows.slice(startIndex, endIndex + 1).filter((row) => /[a-z]/.test(row.ref));
}

function toRows(
  sourceRows: SourceVerse[],
  book: BibleBook,
  chapter: number,
  firstVerse: number,
  translation: "septante" | "grec",
): BibleVerseInsert[] {
  return sourceRows.map((sourceRow, index) => ({
    book_id: book.id,
    book_slug: book.slug,
    chapter,
    verse: firstVerse + index,
    text: translation === "septante" ? sourceRow.french : sourceRow.greek,
    translation_id: translation,
  }));
}

async function fetchBooks() {
  const books = await querySupabase<BibleBook>(
    "select id, slug, name, chapters from public.bible_books where slug in ('ester', 'malachie') order by position;",
  );
  const bySlug = new Map(books.map((book) => [book.slug, book]));
  const esther = bySlug.get("ester");
  const malachi = bySlug.get("malachie");

  if (!esther || !malachi) throw new Error("Missing Esther or Malachie in bible_books.");
  if (esther.chapters < 16) throw new Error(`Esther has ${esther.chapters} chapters, expected at least 16.`);
  if (malachi.chapters < 4) throw new Error(`Malachie has ${malachi.chapters} chapters, expected at least 4.`);

  return { esther, malachi };
}

async function buildRepairRows(): Promise<BibleVerseInsert[]> {
  const { esther, malachi } = await fetchBooks();
  const esther1 = await parseTheoTexChapter("esther", "esther_1.html");
  const esther3 = await parseTheoTexChapter("esther", "esther_3.html");
  const esther4 = await parseTheoTexChapter("esther", "esther_4.html");
  const esther5 = await parseTheoTexChapter("esther", "esther_5.html");
  const esther8 = await parseTheoTexChapter("esther", "esther_8.html");
  const esther10 = await parseTheoTexChapter("esther", "esther_10.html");
  const malachi3 = await parseTheoTexChapter("malachie", "malachie_3.html");

  const additions = [
    { book: esther, chapter: 10, firstVerse: 4, source: alphaRefs(esther10, "3a", "3k") },
    { book: esther, chapter: 11, firstVerse: 1, source: [...byRefs(esther10, ["3l"]), ...alphaRefs(esther1, "1a", "1l")] },
    { book: esther, chapter: 12, firstVerse: 1, source: alphaRefs(esther1, "1m", "1r") },
    { book: esther, chapter: 13, firstVerse: 1, source: [...alphaRefs(esther3, "13a", "13g"), ...alphaRefs(esther4, "17a", "17i")] },
    { book: esther, chapter: 14, firstVerse: 1, source: alphaRefs(esther4, "17k", "17z") },
    { book: esther, chapter: 15, firstVerse: 1, source: alphaRefs(esther5, "1a", "2b") },
    { book: esther, chapter: 16, firstVerse: 1, source: alphaRefs(esther8, "12a", "12x") },
  ];

  const malachiChapter4 = byRefs(malachi3, ["19", "20", "21", "24", "22", "23"]);
  const rows: BibleVerseInsert[] = [];

  for (const translation of ["septante", "grec"] as const) {
    for (const addition of additions) {
      rows.push(...toRows(addition.source, addition.book, addition.chapter, addition.firstVerse, translation));
    }

    rows.push(...toRows(malachiChapter4, malachi, 4, 1, translation));
  }

  return rows;
}

async function backupTargetRows() {
  await mkdir(BACKUP_DIR, { recursive: true });
  const rows = await querySupabase(
    `
    select *
    from public.bible_verses
    where translation_id in ('septante', 'grec')
      and (
        (book_slug = 'ester' and chapter between 10 and 16)
        or (book_slug = 'malachie' and chapter = 4)
      )
    order by translation_id, book_slug, chapter, verse;
    `,
  );

  await writeFile(path.join(BACKUP_DIR, "bible_verses_septante_repair_target.json"), JSON.stringify(rows, null, 2), "utf8");
}

function toInsertSql(rows: BibleVerseInsert[]) {
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

async function applyRepair(rows: BibleVerseInsert[]) {
  await querySupabase(`
    begin;

    delete from public.bible_verses
    where translation_id in ('septante', 'grec')
      and (
        (book_slug = 'ester' and chapter = 10 and verse >= 4)
        or (book_slug = 'ester' and chapter between 11 and 16)
        or (book_slug = 'malachie' and chapter = 4)
      );

    ${toInsertSql(rows)}

    commit;
  `);
}

async function validateRepair() {
  return querySupabase<{
    translation_id: string;
    book_slug: string;
    chapter: number;
    verse_count: number;
  }>(`
    select translation_id, book_slug, chapter, count(*)::int as verse_count
    from public.bible_verses
    where translation_id in ('septante', 'grec')
      and (
        (book_slug = 'ester' and chapter between 10 and 16)
        or (book_slug = 'malachie' and chapter = 4)
      )
    group by translation_id, book_slug, chapter
    order by translation_id, book_slug, chapter;
  `);
}

async function validateMissingOfficialOldTestamentChapters() {
  return querySupabase<{
    translation_id: string;
    book_slug: string;
    chapter: number;
  }>(`
    with target_translations as (
      select unnest(array['septante', 'grec']) as translation_id
    ),
    expected_chapters as (
      select b.slug as book_slug, generate_series(1, b.chapters) as chapter
      from public.bible_books b
      where b.position between 1 and 46
    ),
    existing_chapters as (
      select distinct translation_id, book_slug, chapter
      from public.bible_verses
      where translation_id in ('septante', 'grec')
    )
    select t.translation_id, e.book_slug, e.chapter
    from target_translations t
    cross join expected_chapters e
    left join existing_chapters v
      on v.translation_id = t.translation_id
     and v.book_slug = e.book_slug
     and v.chapter = e.chapter
    where v.chapter is null
    order by t.translation_id, e.book_slug, e.chapter;
  `);
}

async function main() {
  const rows = await buildRepairRows();
  console.log(`Prepared ${rows.length} Septante repair rows.`);

  await backupTargetRows();
  console.log(`Backup written to ${BACKUP_DIR}`);

  await applyRepair(rows);
  console.log("Repair applied.");

  const repairCounts = await validateRepair();
  console.table(repairCounts);

  const missing = await validateMissingOfficialOldTestamentChapters();
  if (missing.length > 0) {
    console.table(missing);
    throw new Error(`${missing.length} Septante OT chapters are still missing.`);
  }

  console.log("No missing Septante OT chapters remain for Bible Septante and Bible Septante Grec.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
