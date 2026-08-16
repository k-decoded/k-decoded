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

  const userClient = createClient(supabaseUrl, publishableKey, {
    global: { headers: { Authorization: authHeader } },
  });
  const { data: { user }, error: userError } = await userClient.auth.getUser();
  // Supabase returns the anonymous marker on the user record, not in
  // app_metadata. Accept the documented provider fallback as well.
  const isAnonymous = user?.is_anonymous === true || user?.app_metadata?.provider === "anonymous";
  if (userError || !user || !isAnonymous) {
    console.error("Anonymous user validation failed", userError?.message ?? "not an anonymous user");
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

  // A deliberately small local filter for clearly hateful or threatening
  // language. It keeps the community usable without sending visitor content to
  // a paid third-party service. Matches are held for manual review.
  const blockedLanguage = [
    /\b(?:n[i1]gg(?:a|er|ers?)|f[a@]gg?[o0]t|k[i1]ke|sp[i1]c|ch[i1]nk|wetback)\b/i,
    /\b(?:kill|hurt|attack)\s+(?:yourself|yourselves|all\s+(?:women|men|muslims|jews|gays|lesbians|trans(?:gender)?\s+people))\b/i,
    /\b(?:go\s+back|should\s+die)\b.{0,40}\b(?:country|where\s+you\s+came\s+from|muslims|jews|gays|lesbians|trans(?:gender)?\s+people)\b/i,
  ];
  const flagged = blockedLanguage.some((pattern) => pattern.test(body));

  const adminClient = createClient(supabaseUrl, serviceRoleKey);
  const { error: insertError } = await adminClient.from("community_posts").insert({
    topic_slug: topicSlug,
    author_id: user.id,
    author_name: authorName,
    body,
    status: flagged ? "pending" : "approved",
  });
  if (insertError) {
    console.error("Could not save community post", insertError.message);
    return reply({ error: "Could not save post" }, 500);
  }
  return reply({ status: flagged ? "pending" : "approved" });
});
