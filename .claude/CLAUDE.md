# 🇻🇦 Wiki Catholic - Project Memory & Agentic Rules
# Date: 2025-12-29 | Stack: Next 16.1, React 19.2, Tailwind v4, Supabase (MCP)

## 🎯 Vision & Theology
- **Project**: A full-scale Wikipedia clone for the Catholic world.
- **Strict Canon**: 73 books (Catholic Bible). Deuterocanonical books (Tobit, Judith, etc.) are mandatory.
- **Workflow**: Vibe Coding with high-frequency context synchronization.

## 🛠 MCP & Tooling (Critical)
- **Supabase MCP**: USE the `supabase-mcp` tool for every database operation. 
- **DB First**: Never assume a table structure. Query it using MCP before generating Server Actions or Types.
- **Migrations**: All DB changes must be executed via `supabase migration new` and applied via MCP.

## 🔄 The "7-Step Micro-Context" Loop
For EVERY task (even micro-coding), you MUST follow this loop:
1. **MCP Schema Sync**: Use Supabase MCP to fetch the current DB state.
2. **File Context**: List files in the target directory to ensure Next.js 16 conventions.
3. **Requirement Validation**: Confirm if the feature aligns with the 73-book Catholic Canon.
4. **Drafting Intent**: Describe the logic in 2 sentences.
5. **Type Generation**: Ensure TypeScript interfaces match the MCP-fetched DB schema.
6. **Execution**: Write the code (React 19 Server Actions, Tailwind v4).
7. **Post-Check**: Verify with MCP that the logic and DB constraints are still in sync.

## 🏗 Stack Implementation Rules
- **Framework**: Next.js 16.1 (App Router ONLY).
- **React 19.2**: Use `use()` for data fetching in Client Components, `action` prop in forms.
- **Tailwind v4**: CSS-first. All themes in `app/globals.css` using `@theme`. NO `tailwind.config.js` unless requested.
- **Netlify**: Ensure edge-compatibility for Server Actions.

## 📖 Catholic Bible Data Logic
- **Bible Table Structure**: 
  - `bible_verses` (uuid, book_id, chapter, verse, text, translation_id)
  - `bible_books` (id, name, testament, position) -> Position 1 to 73.
- **Source**: Fetch from `scripts/import-bible.ts` using Catholic sources (Crampon or AELF).
- **Wikipedia Logic**: 
  - Articles must have `revision_id` for history. 
  - Every verse mention `[[John 3:16]]` must be parsed as a link to `/bible/john/3/16`.

## 📜 Coding Style
- **Server Actions**: Exported from `src/app/actions.ts`.
- **Naming**: PascalCase for components, kebab-case for files.
- **Safety**: Use Zod for validating Server Action inputs.