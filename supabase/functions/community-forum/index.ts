import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const headers = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type", "Content-Type": "application/json" };
const respond = (body: Record<string, unknown>, status = 200) => new Response(JSON.stringify(body), { status, headers });
// Forum content is plain text. Strip markup/control characters before storage;
// clients must still render it as text, never as HTML.
const clean = (value: unknown, max: number) => typeof value === "string"
  ? value.normalize("NFKC").replace(/<[^>]*>/g, "").replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "").trim().slice(0, max)
  : "";
const validStatus = (value: string) => ["visible", "hidden", "deleted", "pending", "rejected"].includes(value);

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") return new Response("ok", { headers });
  if (request.method !== "POST") return respond({ error: "Method not allowed" }, 405);
  const authHeader = request.headers.get("Authorization");
  if (!authHeader) return respond({ error: "Sign in required" }, 401);

  const url = Deno.env.get("SUPABASE_URL")!;
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const userClient = createClient(url, anonKey, { global: { headers: { Authorization: authHeader } } });
  const { data: { user } } = await userClient.auth.getUser();
  if (!user || user.is_anonymous) return respond({ error: "Sign in with a permanent account to post" }, 401);
  let input: Record<string, unknown>; try { input = await request.json(); } catch { return respond({ error: "Invalid request" }, 400); }
  const admin = createClient(url, serviceKey);
  const { data: profile } = await admin.from("profiles").select("display_name").eq("id", user.id).maybeSingle();
  const action = clean(input.action, 40);
  if (action === "upsert-profile") {
    const displayName = clean(input.display_name, 32);
    if (displayName.length < 2) return respond({ error: "A display name of at least 2 characters is required" }, 400);
    const { error } = await admin.from("profiles").upsert({ id: user.id, display_name: displayName, updated_at: new Date().toISOString() });
    return error ? respond({ error: "Could not save profile" }, 500) : respond({ ok: true });
  }
  if (!profile) return respond({ error: "Complete your profile before posting" }, 400);
  const { data: membership } = await admin.from("community_roles").select("role").eq("user_id", user.id).maybeSingle();
  const isAdmin = membership?.role === "admin";

  if (action === "create-topic") {
    const title = clean(input.title, 160), body = clean(input.body, 10000), categorySlug = clean(input.category_slug, 80);
    const imagePath = clean(input.image_path, 500) || null;
    const tags = Array.isArray(input.tags) ? [...new Set(input.tags.map(tag => clean(tag, 30).toLowerCase()).filter(tag => /^[a-z0-9-]{2,30}$/.test(tag)))].slice(0, 5) : [];
    if (title.length < 6) return respond({ error: "Use a more descriptive title (at least 6 characters).", field: "title" }, 400);
    if (!categorySlug) return respond({ error: "Choose a category.", field: "category" }, 400);
    if (body.length < 20) return respond({ error: "Add a little more detail (at least 20 characters).", field: "body" }, 400);
    if (imagePath && !imagePath.startsWith(`${user.id}/`)) return respond({ error: "Invalid image upload.", field: "image" }, 400);
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000).toISOString();
    const { count: recentCount } = await admin.from("community_topics").select("id", { count: "exact", head: true }).eq("author_id", user.id).gte("created_at", tenMinutesAgo);
    if ((recentCount ?? 0) >= 3) return respond({ error: "Please wait a few minutes before starting another discussion.", field: "form" }, 429);
    const { data: duplicate } = await admin.from("community_topics").select("id").eq("author_id", user.id).eq("title", title).eq("body", body).gte("created_at", new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()).maybeSingle();
    if (duplicate) return respond({ error: "You already posted this discussion.", field: "form" }, 409);
    const { data: category } = await admin.from("community_categories").select("id").eq("slug", categorySlug).eq("is_active", true).maybeSingle();
    if (!category) return respond({ error: "Invalid category" }, 400);
    const { data, error } = await admin.from("community_topics").insert({ category_id: category.id, author_id: user.id, author_name_snapshot: profile.display_name, title, body, image_path: imagePath, tags, last_activity_by: user.id }).select("id, category_id").single();
    return error ? respond({ error: "Could not create discussion" }, 500) : respond({ id: data.id }, 201);
  }

  if (action === "create-reply") {
    const topicId = clean(input.topic_id, 80), parentId = clean(input.parent_reply_id, 80) || null, body = clean(input.body, 10000);
    if (!topicId || !body) return respond({ error: "Reply text is required" }, 400);
    const { data: topic } = await admin.from("community_topics").select("id,is_locked,status").eq("id", topicId).maybeSingle();
    if (!topic || topic.status !== "visible") return respond({ error: "Discussion unavailable" }, 404);
    if (topic.is_locked && !isAdmin) return respond({ error: "This discussion is locked" }, 403);
    if (parentId) { const { data: parent } = await admin.from("community_replies").select("topic_id").eq("id", parentId).maybeSingle(); if (!parent || parent.topic_id !== topicId) return respond({ error: "Invalid parent reply" }, 400); }
    const { data, error } = await admin.from("community_replies").insert({ topic_id: topicId, parent_reply_id: parentId, author_id: user.id, author_name_snapshot: profile.display_name, body }).select("id").single();
    if (error) return respond({ error: "Could not create reply" }, 500);
    await admin.from("community_topics").update({ reply_count: (await admin.from("community_replies").select("id", { count: "exact", head: true }).eq("topic_id", topicId).eq("status", "visible")).count ?? 0, last_activity_at: new Date().toISOString(), last_activity_by: user.id }).eq("id", topicId);
    return respond({ id: data.id }, 201);
  }

  if (action === "update-topic" || action === "delete-topic" || action === "moderate-topic") {
    const id = clean(input.id, 80); const { data: topic } = await admin.from("community_topics").select("author_id").eq("id", id).maybeSingle();
    if (!topic) return respond({ error: "Discussion not found" }, 404);
    if (action === "moderate-topic" && !isAdmin) return respond({ error: "Administrator permission required" }, 403);
    if (!isAdmin && topic.author_id !== user.id) return respond({ error: "Not permitted" }, 403);
    const moderationStatus = clean(input.status, 16);
    if (action === "moderate-topic" && !validStatus(moderationStatus)) return respond({ error: "Invalid moderation status" }, 400);
    const patch = action === "delete-topic" ? { status: "deleted", deleted_at: new Date().toISOString() } : action === "moderate-topic" ? { status: moderationStatus, is_locked: input.is_locked === true } : { title: clean(input.title, 160), body: clean(input.body, 10000) };
    const { error } = await admin.from("community_topics").update({ ...patch, updated_at: new Date().toISOString() }).eq("id", id);
    return error ? respond({ error: "Could not update discussion" }, 500) : respond({ ok: true });
  }
  if (action === "update-reply" || action === "delete-reply" || action === "moderate-reply") {
    const id = clean(input.id, 80);
    const { data: reply } = await admin.from("community_replies").select("author_id,topic_id").eq("id", id).maybeSingle();
    if (!reply) return respond({ error: "Reply not found" }, 404);
    if (action === "moderate-reply" && !isAdmin) return respond({ error: "Administrator permission required" }, 403);
    if (!isAdmin && reply.author_id !== user.id) return respond({ error: "Not permitted" }, 403);
    const moderationStatus = clean(input.status, 16);
    if (action === "moderate-reply" && !validStatus(moderationStatus)) return respond({ error: "Invalid moderation status" }, 400);
    const patch = action === "delete-reply"
      ? { status: "deleted", deleted_at: new Date().toISOString() }
      : action === "moderate-reply"
        ? { status: moderationStatus }
        : { body: clean(input.body, 10000) };
    if (action === "update-reply" && !(patch as { body: string }).body) return respond({ error: "Reply text is required" }, 400);
    const { error } = await admin.from("community_replies").update({ ...patch, updated_at: new Date().toISOString() }).eq("id", id);
    if (error) return respond({ error: "Could not update reply" }, 500);
    const { count } = await admin.from("community_replies").select("id", { count: "exact", head: true }).eq("topic_id", reply.topic_id).eq("status", "visible");
    await admin.from("community_topics").update({ reply_count: count ?? 0, last_activity_at: new Date().toISOString(), last_activity_by: user.id }).eq("id", reply.topic_id);
    return respond({ ok: true });
  }
  if (action === "report-content") {
    const targetType = clean(input.target_type, 10), targetId = clean(input.target_id, 80), reason = clean(input.reason, 1000);
    if ((targetType !== "topic" && targetType !== "reply") || !targetId || reason.length < 3) return respond({ error: "A reason is required" }, 400);
    const { error } = await admin.from("community_reports").insert({ reporter_id: user.id, target_type: targetType, target_id: targetId, reason });
    return error ? respond({ error: "Could not submit report" }, 500) : respond({ ok: true }, 201);
  }
  if (action === "toggle-reaction") {
    const targetType = clean(input.target_type, 10), targetId = clean(input.target_id, 80), reaction = clean(input.reaction, 20);
    if ((targetType !== "topic" && targetType !== "reply") || !targetId || !["like", "helpful", "insightful"].includes(reaction)) return respond({ error: "Invalid reaction" }, 400);
    const { data: existing } = await admin.from("community_reactions").select("id").eq("user_id", user.id).eq("target_type", targetType).eq("target_id", targetId).eq("reaction", reaction).maybeSingle();
    const { error } = existing ? await admin.from("community_reactions").delete().eq("id", existing.id) : await admin.from("community_reactions").insert({ user_id: user.id, target_type: targetType, target_id: targetId, reaction });
    return error ? respond({ error: "Could not update reaction" }, 500) : respond({ active: !existing });
  }
  return respond({ error: "Unsupported action" }, 400);
});
