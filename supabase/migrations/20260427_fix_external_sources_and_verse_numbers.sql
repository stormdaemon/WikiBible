alter table public.external_sources
add column if not exists description text;

create or replace function public.get_verse_numbers(
  p_book_id uuid,
  p_chapter integer,
  p_source_type text default 'bible'
)
returns table (
  verse_number integer
)
language sql
security definer
set search_path = public
as $$
  select distinct source.verse as verse_number
  from public.bible_verses as source
  where p_source_type in ('bible', 'contributive')
    and source.book_id = p_book_id
    and source.chapter = p_chapter

  union

  select distinct source.verse as verse_number
  from public.apocryphal_verses as source
  where p_source_type = 'apocryphal'
    and source.book_id = p_book_id
    and source.chapter = p_chapter

  order by verse_number;
$$;

grant execute on function public.get_verse_numbers(uuid, integer, text) to anon, authenticated;
