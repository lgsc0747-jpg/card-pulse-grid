// Sends a branded welcome email via Resend (workspace connector).
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const GATEWAY_URL = "https://connector-gateway.lovable.dev/resend";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    if (!LOVABLE_API_KEY || !RESEND_API_KEY) throw new Error("Email service not configured");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("Unauthorized");

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } },
    );
    const { data: userData } = await supabase.auth.getUser();
    const user = userData.user;
    if (!user?.email) throw new Error("No user email");

    const { display_name } = (await req.json().catch(() => ({}))) as { display_name?: string };
    const name = display_name || user.user_metadata?.full_name || "there";

    const html = `<!doctype html><html><body style="margin:0;padding:0;background:#ffffff;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#0f172a">
<div style="max-width:560px;margin:0 auto;padding:32px 24px">
  <h1 style="font-size:22px;margin:0 0 16px;font-weight:600">Welcome to Handshake, ${name} 👋</h1>
  <p style="font-size:15px;line-height:1.55;color:#475569;margin:0 0 16px">
    Your digital identity is ready. Tap your card, share your link, or build a custom landing page —
    everything you need lives in one workspace.
  </p>
  <p style="margin:24px 0">
    <a href="https://handshake-card.lovable.app" style="display:inline-block;background:#0f172a;color:#fff;padding:12px 20px;border-radius:12px;text-decoration:none;font-weight:500;font-size:14px">Open your dashboard</a>
  </p>
  <p style="font-size:12px;color:#94a3b8;margin:32px 0 0">— The Handshake team</p>
</div></body></html>`;

    const r = await fetch(`${GATEWAY_URL}/emails`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
        "X-Connection-Api-Key": RESEND_API_KEY,
      },
      body: JSON.stringify({
        from: "Handshake <onboarding@resend.dev>",
        to: [user.email],
        subject: "Welcome to Handshake",
        html,
      }),
    });
    const data = await r.json();
    if (!r.ok) throw new Error(`Resend ${r.status}: ${JSON.stringify(data)}`);

    return new Response(JSON.stringify({ ok: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ ok: false, error: String(e) }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
