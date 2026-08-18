# Community forum deployment checklist

## 1. Database

For a new Supabase project, run `community_posts.sql` first only if you intend
to retain the legacy anonymous board, then run `forum_schema.sql` once in the
Supabase SQL Editor. Do not rerun it after it succeeds: it contains policies
and triggers intended for initial setup.

Before continuing, verify these exist in Table Editor: `community_categories`,
`profiles`, `community_topics`, `community_replies`, `community_reports`,
`community_reactions`, `community_suspensions`, and `community_moderation_log`.

## 2. Auth and storage

In Supabase Authentication, enable Email sign-in and configure these redirect
URLs for both staging and production:

- `http://localhost:4321/community`
- `https://YOUR-VERCEL-PREVIEW.vercel.app/community`
- `https://YOUR-DOMAIN/community`

The schema creates the public `community-images` bucket. Confirm its 5 MB MIME
limit and the owner-prefix upload policy before allowing uploads.

## 3. Edge Function

Deploy `supabase/functions/community-forum` and set the server-only secret:

```text
SUPABASE_SERVICE_ROLE_KEY=...
```

Never put this key in Vercel or a `PUBLIC_` variable. The function uses the
standard Supabase URL/anon-key environment values supplied by the platform.

## 4. Vercel

Add these environment variables to Preview and Production:

```text
PUBLIC_SUPABASE_URL=https://PROJECT.supabase.co
PUBLIC_SUPABASE_PUBLISHABLE_KEY=...
```

Deploy a Preview first. Then add its `/community` URL to Supabase Auth before
testing the magic-link flow.

## 5. First administrator

After the administrator signs in once and has a row in `profiles`, grant the
role in Supabase SQL Editor:

```sql
insert into public.community_roles (user_id, role)
values ('AUTH-USER-UUID', 'admin')
on conflict (user_id) do update set role = excluded.role;
```

## 6. Staging acceptance checks

1. Guest can read but cannot submit, react, report, edit, or delete.
2. Member can create a topic, upload an allowed image, reply, edit/delete only
   their own content, and is rate-limited for repeated submissions.
3. A reply cannot use a parent from another topic.
4. An admin can hide/restore/lock/delete content, suspend a member, and see an
   audit-log row for each action.
5. Test XSS and unsafe-link input such as `<img onerror=alert(1)>` and
   `javascript:alert(1)`; it must be rejected or shown as inert text.
6. Run `supabase test db` after installing/configuring the Supabase CLI locally.

## Rollback

Do not drop forum tables during a rollback. Disable Community navigation or
redeploy the previous Vercel build, then investigate from the moderation log.
