-- Run with: supabase test db. Requires pgTAP, which Supabase's local test DB provides.
begin;
select plan(9);

select has_table('public', 'community_topics', 'topics table exists');
select has_table('public', 'community_replies', 'replies table exists');
select has_column('public', 'community_replies', 'parent_reply_id', 'replies support nesting');
select has_index('public', 'community_replies', 'community_replies_topic_parent_idx', 'reply parent lookup is indexed');
select has_index('public', 'community_topics', 'community_topics_category_activity_idx', 'category activity lookup is indexed');
select has_trigger('public', 'community_replies', 'community_replies_validate_parent', 'reply parent/topic integrity trigger exists');
select policies_are('public', 'community_topics', array['Public can read visible topics'], 'topic writes have no browser RLS policy');

select lives_ok($$
  insert into public.community_categories (id, slug, name) values ('10000000-0000-0000-0000-000000000001', 'test-forum', 'Test forum');
  insert into public.community_topics (id, category_id, author_name_snapshot, title, body) values
    ('10000000-0000-0000-0000-000000000011', '10000000-0000-0000-0000-000000000001', 'Test author', 'First test topic', 'Body'),
    ('10000000-0000-0000-0000-000000000012', '10000000-0000-0000-0000-000000000001', 'Test author', 'Second test topic', 'Body');
  insert into public.community_replies (id, topic_id, author_name_snapshot, body) values
    ('10000000-0000-0000-0000-000000000021', '10000000-0000-0000-0000-000000000011', 'Test author', 'Parent');
  insert into public.community_replies (topic_id, parent_reply_id, author_name_snapshot, body) values
    ('10000000-0000-0000-0000-000000000011', '10000000-0000-0000-0000-000000000021', 'Test author', 'Nested reply');
$$, 'nested replies in the same topic are accepted');
select throws_ok($$
  insert into public.community_replies (topic_id, parent_reply_id, author_name_snapshot, body) values
    ('10000000-0000-0000-0000-000000000012', '10000000-0000-0000-0000-000000000021', 'Test author', 'Invalid nested reply');
$$, 'P0001', 'Parent reply must belong to the same topic', 'cross-topic reply parenting is rejected');

select * from finish();
rollback;
