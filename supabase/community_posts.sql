-- Run this once in Supabase: SQL Editor -> New query -> Run.
create table if not exists public.community_posts (
  id uuid primary key default gen_random_uuid(),
  topic_slug text not null check (char_length(topic_slug) between 1 and 80),
  author_id uuid not null references auth.users(id) on delete cascade,
  author_name text not null check (char_length(author_name) between 2 and 32),
  body text not null check (char_length(body) between 1 and 1000),
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  created_at timestamptz not null default now()
);

create index if not exists community_posts_public_by_topic
  on public.community_posts (topic_slug, created_at desc)
  where status = 'approved';

alter table public.community_posts enable row level security;

create policy "Anyone can read approved community posts"
  on public.community_posts for select
  to anon, authenticated
  using (status = 'approved');

create policy "Anonymous visitors can submit pending posts"
  on public.community_posts for insert
  to authenticated
  with check (
    auth.uid() = author_id
    and (auth.jwt() ->> 'is_anonymous')::boolean is true
    and status = 'pending'
  );

-- Approve or reject submissions from the Supabase Table Editor. Do not add
-- client-side update/delete policies: moderation stays owner-controlled.
