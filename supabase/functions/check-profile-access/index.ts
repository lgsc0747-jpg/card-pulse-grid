// Lightweight gate to block URL guessing on /p/<user>/<persona>.
// Returns { allowed: true } when traffic looks like a normal tap/visit,
// { allowed: false, reason } when an IP is enumerating many strangers' profiles.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const WINDOW_MIN = 5;
const MAX_DISTINCT_PROFILES = 6; // > 6 different profiles in 5 min from the same IP = block

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const { target_user_id, source_method } = await req.json();
    if (!target_user_id) {
      return new Response(JSON.stringify({ allowed: false, reason: "missing_target" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("cf-connecting-ip") ||
      "0.0.0.0";

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // Trust direct NFC / QR taps — never throttle them.
    const trustedSource = source_method === "nfc" || source_method === "qr";

    if (!trustedSource) {
      const { data: count } = await supabase.rpc("count_distinct_profiles_by_ip", {
        _ip: ip, _minutes: WINDOW_MIN,
      });
      if ((count ?? 0) >= MAX_DISTINCT_PROFILES) {
        return new Response(JSON.stringify({
          allowed: false,
          reason: "rate_limited",
          message: "Too many profile lookups from this network. Please try again later.",
        }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
    }

    await supabase.rpc("record_profile_view_attempt", {
      _ip: ip, _target: target_user_id, _source: source_method ?? null,
    });

    return new Response(JSON.stringify({ allowed: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ allowed: true, error: String(e) }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
