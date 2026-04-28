create or replace function public.get_official_bible_translations()
returns table (
  id text,
  name text,
  sort_order integer
)
language sql
security definer
set search_path = public
as $$
  select
    translation.slug as id,
    translation.name,
    case translation.slug
      when 'crampon' then 1
      when 'jerusalem' then 2
      when 'septante' then 3
      when 'grec' then 4
      when 'vulgate' then 5
      when 'vulgate-fr' then 6
      else 100
    end as sort_order
  from public.bible_translations as translation
  where translation.is_active = true
    and translation.type = 'official'
    and translation.slug in ('crampon', 'jerusalem', 'septante', 'grec', 'vulgate', 'vulgate-fr')
  order by sort_order;
$$;

grant execute on function public.get_official_bible_translations() to anon, authenticated;
