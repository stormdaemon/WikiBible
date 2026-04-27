create or replace function public.get_missing_verses(
  p_book_slug text,
  p_chapter integer,
  p_translation_id text
)
returns table (
  verse_number integer,
  book_id uuid,
  crampon_text text
)
language sql
security definer
set search_path = public
as $$
  with reference_verses as (
    select distinct on (v.verse)
      v.verse,
      v.book_id,
      v.text as reference_text
    from public.bible_verses v
    join public.bible_books b on v.book_id = b.id
    where b.slug = p_book_slug
      and v.chapter = p_chapter
      and v.translation_id in ('crampon', 'jerusalem', 'vulgate', 'septante', 'grec')
    order by
      v.verse,
      case v.translation_id
        when 'crampon' then 1
        when 'jerusalem' then 2
        when 'vulgate' then 3
        when 'septante' then 4
        when 'grec' then 5
        else 100
      end
  ),
  translation_verses as (
    select v.verse
    from public.bible_verses v
    join public.bible_books b on v.book_id = b.id
    where b.slug = p_book_slug
      and v.chapter = p_chapter
      and v.translation_id = p_translation_id
  )
  select
    rv.verse as verse_number,
    rv.book_id,
    rv.reference_text as crampon_text
  from reference_verses rv
  left join translation_verses tv on rv.verse = tv.verse
  where tv.verse is null
  order by rv.verse;
$$;

grant execute on function public.get_missing_verses(text, integer, text) to anon, authenticated;
