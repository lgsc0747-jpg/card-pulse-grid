// Persists an agency message and emails the recipient(s) via Resend.
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

    const { organization_id, recipient_user_id, subject, body } = await req.json();
    if (!organization_id || !body) throw new Error("organization_id and body required");

    const userClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } },
    );
    const { data: userData } = await userClient.auth.getUser();
    const sender = userData.user;
    if (!sender) throw new Error("Unauthorized");

    // Insert message via SECURITY DEFINER RPC (validates membership)
    const { data: messageId, error: insertErr } = await userClient.rpc("send_agency_message", {
      _org_id: organization_id,
      _recipient: recipient_user_id ?? null,
      _subject: subject ?? null,
      _body: body,
    });
    if (insertErr) throw insertErr;

    // Resolve recipient emails (broadcast to all org members if no recipient)
    const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const { data: org } = await admin.from("organizations").select("name").eq("id", organization_id).single();

    let recipientEmails: string[] = [];
    if (recipient_user_id) {
      const { data } = await admin.auth.admin.getUserById(recipient_user_id);
      if (data?.user?.email) recipientEmails = [data.user.email];
    } else {
      const { data: members } = await admin.from("organization_members")
        .select("user_id").eq("organization_id", organization_id);
      for (const m of members ?? []) {
        if (m.user_id === sender.id) continue;
        const { data } = await admin.auth.admin.getUserById(m.user_id);
        if (data?.user?.email) recipientEmails.push(data.user.email);
      }
    }

    const senderName = sender.user_metadata?.full_name || sender.email;
    const html = `<!doctype html><html><body style="margin:0;padding:0;background:#ffffff;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#0f172a">
<div style="max-width:560px;margin:0 auto;padding:32px 24px">
  <p style="font-size:12px;color:#94a3b8;margin:0 0 8px;text-transform:uppercase;letter-spacing:.08em">${org?.name ?? "Workspace"}</p>
  <h1 style="font-size:20px;margin:0 0 12px;font-weight:600">${escapeHtml(subject || "New message")}</h1>
  <p style="font-size:13px;color:#64748b;margin:0 0 20px">From ${escapeHtml(senderName ?? "a teammate")}</p>
  <div style="font-size:15px;line-height:1.6;color:#0f172a;white-space:pre-wrap">${escapeHtml(body)}</div>
  <p style="margin:32px 0 0">
    <a href="https://handshake-card.lovable.app/agency" style="display:inline-block;background:#0f172a;color:#fff;padding:10px 16px;border-radius:10px;text-decoration:none;font-size:13px">Open workspace</a>
  </p>
</div></body></html>`;

    if (recipientEmails.length > 0) {
      await fetch(`${GATEWAY_URL}/emails`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${LOVABLE_API_KEY}`,
          "X-Connection-Api-Key": RESEND_API_KEY,
        },
        body: JSON.stringify({
          from: "Handshake <onboarding@resend.dev>",
          to: recipientEmails,
          subject: subject || `New message in ${org?.name ?? "workspace"}`,
          html,
        }),
      });
    }

    return new Response(JSON.stringify({ ok: true, message_id: messageId, notified: recipientEmails.length }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ ok: false, error: String(e) }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

function escapeHtml(s: string) {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));
}
