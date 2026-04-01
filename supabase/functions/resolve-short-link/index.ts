import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { code } = await req.json();

    if (!code || typeof code !== "string") {
      return new Response(
        JSON.stringify({ error: "code is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Look up the short link -> user_id (and optional persona_id)
    const { data: link, error: linkErr } = await supabase
      .from("short_links")
      .select("user_id, persona_id")
      .eq("code", code)
      .single();

    if (linkErr || !link) {
      return new Response(
        JSON.stringify({ error: "Short link not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get the user's current username
    const { data: profile } = await supabase
      .from("profiles")
      .select("username")
      .eq("user_id", link.user_id)
      .single();

    if (!profile?.username) {
      return new Response(
        JSON.stringify({ error: "User profile not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // If a persona is linked, get its slug
    let personaSlug: string | null = null;
    if (link.persona_id) {
      const { data: persona } = await supabase
        .from("personas")
        .select("slug")
        .eq("id", link.persona_id)
        .single();
      personaSlug = persona?.slug ?? null;
    } else {
      // Fall back to the user's active persona
      const { data: activePer } = await supabase
        .from("personas")
        .select("slug")
        .eq("user_id", link.user_id)
        .eq("is_active", true)
        .limit(1)
        .single();
      personaSlug = activePer?.slug ?? null;
    }

    return new Response(
      JSON.stringify({
        username: profile.username,
        persona_slug: personaSlug,
        user_id: link.user_id,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("resolve-short-link error:", err);
    return new Response(
      JSON.stringify({ error: "Internal error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
