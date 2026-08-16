import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const headers = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Content-Type": "application/json",
};

const reply = (body: Record<string, unknown>, status = 200) =>
  new Response(JSON.stringify(body), { status, headers });

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") return new Response("ok", { headers });
  if (request.method !== "POST") return reply({ error: "Method not allowed" }, 405);

  const authHeader = request.headers.get("Authorization");
  if (!authHeader) return reply({ error: "Unauthenticated" }, 401);

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const publishableKey = Deno.env.get("SUPABASE_ANON_KEY")!;
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const openAiKey = Deno.env.get("OPENAI_API_KEY");
  if (!openAiKey) return reply({ error: "Moderation is not configured" }, 503);

  const userClient = createClient(supabaseUrl, publishableKey, {
    global: { headers: { Authorization: authHeader } },
  });
  const { data: { user }, error: userError } = await userClient.auth.getUser();
  if (userError || !user || user.app_metadata?.is_anonymous !== true) {
    return reply({ error: "Unauthenticated" }, 401);
  }

  let input: { topic_slug?: unknown; author_name?: unknown; body?: unknown };
  try { input = await request.json(); } catch { return reply({ error: "Invalid request" }, 400); }
  const topicSlug = typeof input.topic_slug === "string" ? input.topic_slug.trim() : "";
  const authorName = typeof input.author_name === "string" ? input.author_name.trim() : "";
  const body = typeof input.body === "string" ? input.body.trim() : "";
  if (!topicSlug || topicSlug.length > 80 || authorName.length < 2 || authorName.length > 32 || !body || body.length > 1000) {
    return reply({ error: "Invalid post" }, 400);
  }

  const moderation = await fetch("https://api.openai.com/v1/moderations", {
    method: "POST",
    headers: { Authorization: `Bearer ${openAiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({ model: "omni-moderation-latest", input: body }),
  });
  if (!moderation.ok) return reply({ error: "Moderation is temporarily unavailable" }, 503);
  const result = await moderation.json();
  const flagged = result.results?.[0]?.flagged === true;

  const adminClient = createClient(supabaseUrl, serviceRoleKey);
  const { error: insertError } = await adminClient.from("community_posts").insert({
    topic_slug: topicSlug,
    author_id: user.id,
    author_name: authorName,
    body,
    status: flagged ? "pending" : "approved",
  });
  if (insertError) return reply({ error: "Could not save post" }, 500);
  return reply({ status: flagged ? "pending" : "approved" });
});
