create or replace function public.get_bible_books_for_translation(p_translation_id text)
returns table (
  id uuid,
  name text,
  name_en text,
  testament text,
  "position" integer,
  chapters integer,
  is_deuterocanonical boolean,
  created_at timestamptz,
  slug text
)
language sql
security definer
set search_path = public
as $$
  select
    book.id,
    book.name,
    book.name_en,
    book.testament,
    book.position as "position",
    book.chapters,
    book.is_deuterocanonical,
    book.created_at,
    book.slug
  from public.bible_books as book
  where exists (
    select 1
    from public.bible_verses as verse
    where verse.book_id = book.id
      and verse.translation_id = p_translation_id
  )
  order by book.position;
$$;

grant execute on function public.get_bible_books_for_translation(text) to anon, authenticated;
