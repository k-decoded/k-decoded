-- Run this once in Supabase: SQL Editor -> New query -> Run.
create table if not exists public.post_views (
  slug text primary key check (char_length(slug) between 1 and 80),
  view_count bigint not null default 0
);

alter table public.post_views enable row level security;

create policy "Anyone can read view counts"
  on public.post_views for select
  to anon, authenticated
  using (true);

-- No insert/update policy for anon/authenticated: writes only happen
-- through increment_post_view() below, which runs as security definer
-- and bypasses RLS, so direct client writes stay closed off.

create or replace function public.increment_post_view(post_slug text)
returns bigint
language plpgsql
security definer
set search_path = public
as $$
declare
  new_count bigint;
begin
  insert into public.post_views (slug, view_count)
  values (post_slug, 1)
  on conflict (slug) do update
    set view_count = post_views.view_count + 1
  returning view_count into new_count;
  return new_count;
end;
$$;

grant execute on function public.increment_post_view(text) to anon, authenticated;
