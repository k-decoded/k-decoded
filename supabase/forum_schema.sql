-- Community forum v1. Apply after community_posts.sql. This migration is
-- additive: the legacy flat discussion table remains untouched for migration
-- and rollback.

create table if not exists public.community_categories (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9-]{1,80}$'),
  name text not null check (char_length(name) between 1 and 80),
  description text not null default '',
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

insert into public.community_categories (slug, name, description, sort_order)
values
  ('beauty', 'K-Beauty', 'Skincare routines, product recommendations, and beauty finds.', 1),
  ('travel', 'Travel', 'Itineraries, transit, neighbourhoods, and trip planning.', 2),
  ('language', 'Language Exchange', 'Korean practice, phrases, and study tips.', 3),
  ('general', 'General Chat', 'Everything Korea-related that does not fit another board.', 4)
on conflict (slug) do nothing;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null check (char_length(display_name) between 2 and 32),
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.community_roles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role text not null default 'member' check (role in ('member', 'moderator', 'admin')),
  granted_at timestamptz not null default now(),
  granted_by uuid references auth.users(id) on delete set null
);

create table if not exists public.community_topics (
  id uuid primary key default gen_random_uuid(),
  category_id uuid not null references public.community_categories(id),
  author_id uuid references auth.users(id) on delete set null,
  author_name_snapshot text not null check (char_length(author_name_snapshot) between 2 and 32),
  title text not null check (char_length(title) between 3 and 160),
  body text not null check (char_length(body) between 1 and 10000),
  image_path text check (char_length(image_path) between 1 and 500),
  tags text[] not null default '{}'::text[] check (cardinality(tags) <= 5),
  status text not null default 'visible' check (status in ('visible', 'hidden', 'deleted', 'pending', 'rejected')),
  is_locked boolean not null default false,
  is_pinned boolean not null default false,
  view_count bigint not null default 0 check (view_count >= 0),
  reply_count integer not null default 0 check (reply_count >= 0),
  last_activity_at timestamptz not null default now(),
  last_activity_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table if not exists public.community_replies (
  id uuid primary key default gen_random_uuid(),
  topic_id uuid not null references public.community_topics(id) on delete cascade,
  parent_reply_id uuid references public.community_replies(id) on delete set null,
  author_id uuid references auth.users(id) on delete set null,
  author_name_snapshot text not null check (char_length(author_name_snapshot) between 2 and 32),
  body text not null check (char_length(body) between 1 and 10000),
  status text not null default 'visible' check (status in ('visible', 'hidden', 'deleted', 'pending', 'rejected')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table if not exists public.community_reactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  target_type text not null check (target_type in ('topic', 'reply')),
  target_id uuid not null,
  reaction text not null check (reaction in ('like', 'helpful', 'insightful')),
  created_at timestamptz not null default now(),
  unique (user_id, target_type, target_id, reaction)
);

create table if not exists public.community_topic_views (
  id uuid primary key default gen_random_uuid(),
  topic_id uuid not null references public.community_topics(id) on delete cascade,
  viewer_id uuid references auth.users(id) on delete set null,
  visitor_key_hash text,
  viewed_at timestamptz not null default now(),
  check (viewer_id is not null or visitor_key_hash is not null)
);

create table if not exists public.community_reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid not null references auth.users(id) on delete cascade,
  target_type text not null check (target_type in ('topic', 'reply')),
  target_id uuid not null,
  reason text not null check (char_length(reason) between 3 and 1000),
  status text not null default 'open' check (status in ('open', 'reviewed', 'closed')),
  created_at timestamptz not null default now(),
  reviewed_at timestamptz,
  reviewed_by uuid references auth.users(id) on delete set null
);

create table if not exists public.community_moderation_log (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references auth.users(id) on delete set null,
  action text not null,
  target_type text not null check (target_type in ('topic', 'reply')),
  target_id uuid not null,
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists community_topics_visible_activity_idx on public.community_topics (last_activity_at desc, id desc) where status = 'visible';
create index if not exists community_topics_category_activity_idx on public.community_topics (category_id, last_activity_at desc, id desc) where status = 'visible';
create index if not exists community_topics_author_idx on public.community_topics (author_id, created_at desc);
create index if not exists community_topics_tags_idx on public.community_topics using gin (tags);
create index if not exists community_replies_topic_parent_idx on public.community_replies (topic_id, parent_reply_id, created_at asc) where status = 'visible';
create index if not exists community_replies_author_idx on public.community_replies (author_id, created_at desc);
create index if not exists community_replies_parent_idx on public.community_replies (parent_reply_id, created_at asc);
create index if not exists community_reactions_target_idx on public.community_reactions (target_type, target_id);
create index if not exists community_topic_views_topic_idx on public.community_topic_views (topic_id, viewed_at desc);
create index if not exists community_reports_open_idx on public.community_reports (created_at asc) where status = 'open';

alter table public.community_categories enable row level security;
alter table public.profiles enable row level security;
alter table public.community_roles enable row level security;
alter table public.community_topics enable row level security;
alter table public.community_replies enable row level security;
alter table public.community_reactions enable row level security;
alter table public.community_topic_views enable row level security;
alter table public.community_reports enable row level security;
alter table public.community_moderation_log enable row level security;

create policy "Public can read active categories" on public.community_categories for select to anon, authenticated using (is_active);
create policy "Public can read visible profiles" on public.profiles for select to anon, authenticated using (true);
create policy "Public can read visible topics" on public.community_topics for select to anon, authenticated using (status = 'visible');
drop policy if exists "Public can read visible replies" on public.community_replies;
create policy "Public can read visible and retained replies" on public.community_replies for select to anon, authenticated using (status in ('visible', 'deleted'));

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('community-images', 'community-images', true, 5242880, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do nothing;
create policy "Members can upload own community images" on storage.objects for insert to authenticated with check (bucket_id = 'community-images' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "Public can view community images" on storage.objects for select to anon, authenticated using (bucket_id = 'community-images');

create or replace function public.community_set_updated_at()
returns trigger language plpgsql security invoker set search_path = public as $$
begin new.updated_at = now(); return new; end;
$$;
create or replace trigger community_topics_updated_at before update on public.community_topics for each row execute function public.community_set_updated_at();
create or replace trigger community_replies_updated_at before update on public.community_replies for each row execute function public.community_set_updated_at();

create or replace function public.community_validate_reply_parent()
returns trigger language plpgsql security invoker set search_path = public as $$
declare parent_topic uuid;
begin
  if new.parent_reply_id is null then return new; end if;
  if new.parent_reply_id = new.id then raise exception 'A reply cannot be its own parent'; end if;
  select topic_id into parent_topic from public.community_replies where id = new.parent_reply_id;
  if parent_topic is null or parent_topic <> new.topic_id then raise exception 'Parent reply must belong to the same topic'; end if;
  return new;
end;
$$;
create or replace trigger community_replies_validate_parent before insert or update of topic_id, parent_reply_id on public.community_replies for each row execute function public.community_validate_reply_parent();

-- Writes intentionally have no browser-facing RLS policies. The Edge Function
-- validates identity, ownership, locking, and roles, then writes with service role.
