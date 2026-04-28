import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import path from "node:path";

type DbBook = {
  id: string;
  slug: string;
  name: string;
  position: number;
  chapters: number;
};

type VerseRow = {
  book_id: string;
  book_slug: string;
  chapter: number;
  verse: number;
  text: string;
  translation_id: string;
};

const PROJECT_REF = "gsqodedelzzbcqefoneb";
const TRANSLATION_ID = "hebreu";
const TRANSLATION_NAME = "Bible Hébraïque";
const SOURCE_DIR = path.join(process.cwd(), "tmp", "hebrew-wlc", "usfm");
const OUT_DIR = path.join(process.cwd(), "tmp", "hebrew-wlc");
const DRY_RUN = !process.argv.includes("--apply");

const USFM_TO_DB_SLUG: Record<string, string> = {
  GEN: "genese",
  EXO: "exode",
  LEV: "levitique",
  NUM: "nombres",
  DEU: "deuterome",
  JOS: "josue",
  JDG: "juges",
  RUT: "ruth",
  "1SA": "1-samuel",
  "2SA": "2-samuel",
  "1KI": "1-rois",
  "2KI": "2-rois",
  "1CH": "1-chroniques",
  "2CH": "2-chroniques",
  EZR: "esdras",
  NEH: "nehemie",
  EST: "ester",
  JOB: "job",
  PSA: "psaumes",
  PRO: "proverbes",
  ECC: "ecclesiaste",
  SNG: "cantique",
  ISA: "eesaie",
  JER: "jeremie",
  LAM: "lamentations",
  EZK: "ezechiel",
  DAN: "daniel",
  HOS: "oslee",
  JOL: "joel",
  AMO: "amos",
  OBA: "abdias",
  JON: "jonas",
  MIC: "michee",
  NAM: "nahum",
  HAB: "habacuc",
  ZEP: "sophonie",
  HAG: "aggee",
  ZEC: "zacharie",
  MAL: "malachie",
};

function getSupabaseToken() {
  const config = JSON.parse(readFileSync(".mcp.json", "utf8"));
  const authorization = config?.mcpServers?.supabase?.headers?.Authorization;
  if (!authorization) {
    throw new Error("Missing Supabase MCP authorization in .mcp.json");
  }

  return authorization.replace(/^Bearer\s+/i, "");
}

async function query<T = Record<string, unknown>>(sql: string): Promise<T[]> {
  const token = getSupabaseToken();
  const response = await fetch(`https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query: sql }),
  });

  const body = await response.text();
  if (!response.ok) {
    throw new Error(`Supabase query failed ${response.status}: ${body}`);
  }

  return body ? JSON.parse(body) : [];
}

function sqlString(value: string) {
  return `'${value.replace(/'/g, "''")}'`;
}

function cleanVerseText(raw: string) {
  return raw
    .replace(/\\f\b[\s\S]*?\\f\*/g, " ")
    .replace(/\\x\b[\s\S]*?\\x\*/g, " ")
    .replace(/\\w\s+([^|\\]*?)(?:\|[^\\]*?)?\\w\*/g, "$1")
    .replace(/\\zaln-[se]\b[\s\S]*?\\\*/g, " ")
    .replace(/\\[a-z0-9]+-?\d*\*?/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function parseUsfm(filePath: string) {
  const content = readFileSync(filePath, "utf8");
  const id = content.match(/^\\id\s+(\S+)/m)?.[1];
  if (!id) {
    throw new Error(`Missing \\id in ${filePath}`);
  }

  const parts = content.split(/(?=\\c\s+\d+|\\v\s+\d+)/g);
  const verses: Array<{ id: string; chapter: number; verse: number; text: string }> = [];
  let chapter = 0;

  for (const part of parts) {
    const chapterMatch = part.match(/^\\c\s+(\d+)/);
    if (chapterMatch) {
      chapter = Number(chapterMatch[1]);
      continue;
    }

    const verseMatch = part.match(/^\\v\s+(\d+)\s*([\s\S]*)$/);
    if (!verseMatch || chapter === 0) {
      continue;
    }

    const verse = Number(verseMatch[1]);
    const text = cleanVerseText(verseMatch[2]);
    if (text) {
      verses.push({ id, chapter, verse, text });
    }
  }

  return verses;
}

async function backupTarget() {
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  const dir = path.join(OUT_DIR, "backup", stamp);
  mkdirSync(dir, { recursive: true });

  const translations = await query(`select * from bible_translations where slug = ${sqlString(TRANSLATION_ID)};`);
  const verses = await query(`select * from bible_verses where translation_id = ${sqlString(TRANSLATION_ID)} order by book_slug, chapter, verse;`);

  writeFileSync(path.join(dir, "bible_translations_hebreu.json"), JSON.stringify(translations, null, 2), "utf8");
  writeFileSync(path.join(dir, "bible_verses_hebreu.json"), JSON.stringify(verses, null, 2), "utf8");

  return { dir, translations: translations.length, verses: verses.length };
}

async function insertRows(rows: VerseRow[]) {
  const batchSize = 500;
  for (let index = 0; index < rows.length; index += batchSize) {
    const batch = rows.slice(index, index + batchSize);
    const values = batch.map((row) => `(
      gen_random_uuid(),
      ${sqlString(row.book_id)},
      ${row.chapter},
      ${row.verse},
      ${sqlString(row.text)},
      ${sqlString(row.translation_id)},
      ${sqlString(row.book_slug)}
    )`).join(",");

    await query(`
      insert into bible_verses (id, book_id, chapter, verse, text, translation_id, book_slug)
      values ${values};
    `);

    console.log(`Inserted ${Math.min(index + batchSize, rows.length)} / ${rows.length}`);
  }
}

async function main() {
  if (!existsSync(SOURCE_DIR)) {
    throw new Error(`Missing source directory: ${SOURCE_DIR}`);
  }

  mkdirSync(OUT_DIR, { recursive: true });

  const books = await query<DbBook>("select id, slug, name, position, chapters from bible_books order by position;");
  const booksBySlug = new Map(books.map((book) => [book.slug, book]));
  const files = readdirSync(SOURCE_DIR).filter((file) => file.endsWith(".usfm")).sort();
  const rows: VerseRow[] = [];
  const stats: Array<{ id: string; slug: string; name: string; chapters: number; verses: number }> = [];
  const missing: string[] = [];

  for (const file of files) {
    const parsed = parseUsfm(path.join(SOURCE_DIR, file));
    if (parsed.length === 0) {
      continue;
    }

    const sourceId = parsed[0].id;
    const slug = USFM_TO_DB_SLUG[sourceId];
    const book = slug ? booksBySlug.get(slug) : undefined;
    if (!book) {
      missing.push(`${sourceId} (${file})`);
      continue;
    }

    const chapters = Math.max(...parsed.map((verse) => verse.chapter));
    stats.push({ id: sourceId, slug, name: book.name, chapters, verses: parsed.length });
    for (const verse of parsed) {
      rows.push({
        book_id: book.id,
        book_slug: book.slug,
        chapter: verse.chapter,
        verse: verse.verse,
        text: verse.text,
        translation_id: TRANSLATION_ID,
      });
    }
  }

  const duplicateKeys = new Set<string>();
  const seen = new Set<string>();
  for (const row of rows) {
    const key = `${row.book_slug}:${row.chapter}:${row.verse}`;
    if (seen.has(key)) duplicateKeys.add(key);
    seen.add(key);
  }

  const summary = {
    dryRun: DRY_RUN,
    source: "https://ebible.org/Scriptures/hboWLC_usfm.zip",
    sourceDescription: "Westminster Leningrad Codex Hebrew OT from the Open Scriptures Hebrew Bible Project",
    attribution: "Credit Open Scriptures Hebrew Bible Project for the source text.",
    files: files.length,
    mappedBooks: stats.length,
    verses: rows.length,
    missing,
    duplicateKeys: Array.from(duplicateKeys).slice(0, 20),
    stats,
  };

  writeFileSync(path.join(OUT_DIR, "hebrew-wlc-verses.json"), JSON.stringify(rows, null, 2), "utf8");
  writeFileSync(path.join(OUT_DIR, "hebrew-wlc-summary.json"), JSON.stringify(summary, null, 2), "utf8");
  console.log(JSON.stringify(summary, null, 2));

  if (DRY_RUN) {
    return;
  }
  if (missing.length || duplicateKeys.size || stats.length !== Object.keys(USFM_TO_DB_SLUG).length) {
    throw new Error("Refusing to apply because mapping is incomplete or duplicate keys exist.");
  }

  const backup = await backupTarget();
  console.log(`Backup written to ${backup.dir} (${backup.translations} translations, ${backup.verses} verses).`);

  await query(`
    insert into bible_translations (name, slug, language, type, is_active)
    values (${sqlString(TRANSLATION_NAME)}, ${sqlString(TRANSLATION_ID)}, 'hbo', 'official', true)
    on conflict (slug) do update set
      name = excluded.name,
      language = excluded.language,
      type = excluded.type,
      is_active = excluded.is_active;
  `);
  await query(`delete from bible_verses where translation_id = ${sqlString(TRANSLATION_ID)};`);
  await insertRows(rows);

  const verification = await query(`
    select
      count(*)::int as verses,
      count(distinct book_id)::int as books,
      count(distinct (book_id, chapter))::int as chapters,
      count(*) - count(distinct (book_id, chapter, verse)) as duplicate_coordinates
    from bible_verses
    where translation_id = ${sqlString(TRANSLATION_ID)};
  `);
  console.log(JSON.stringify({ applied: true, verification }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
