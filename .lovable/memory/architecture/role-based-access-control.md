---
name: Role Based Access Control
description: RBAC tiers (user/admin/super_admin), unified smart login, sidebar view switcher, env-aware Turnstile (test keys on dev/preview, real on prod), super-admin Turnstile settings page, account lockout, audit trail
type: feature
---

The Role-Based Access Control (RBAC) system uses a `user_roles` table with three tiers stored in the `app_role` enum: `user`, `admin`, and `super_admin`. Regular admins manage subscriptions, view audit trails, and inspect activity logs. Only super-admins may grant or revoke the admin role, clear active account lockouts, and edit the `turnstile_config` table. The earliest existing admin is auto-promoted to super-admin during bootstrap.

**Unified login (no tabs).** A single sign-in form posts to `secure-login` with `{ email, password, captcha_token, hostname }`. The function verifies a Cloudflare Turnstile CAPTCHA, checks `account_lockouts`, then `signInWithPassword`. On success it returns `{ session, roles: { is_admin, is_super_admin, default_destination } }` where `default_destination` is `"choose"` for admins (client renders `<DestinationPicker />` with two big cards: Continue as User → `/`, Continue as Admin → `/admin`) and `"user"` for non-admins (auto-navigate to `/`). Failed attempts go to `login_attempts`; 5+ in 10 min (per email OR per IP) trigger a 15-min lockout. The `check_login_lockout` SECURITY DEFINER RPC powers the live `MM:SS` countdown without leaking account existence. Tokens are single-use; the widget resets after every submit.

**View switcher.** Admins see a "View Mode" segmented control in the sidebar with two pills (👤 User → `/`, 🛡️ Admin → `/admin`). The active pill highlights based on `useLocation().pathname.startsWith("/admin")`. Switches happen client-side — no re-authentication.

**Env-aware Turnstile.** `src/lib/turnstileEnv.ts` detects `dev | preview | prod` from `window.location.hostname`. Dev/preview use Cloudflare's always-pass test site key (`1x00000000000000000000AA`); prod uses the real key (`0x4AAAAAADCjpQiKqCjVRmYL`). The edge function mirrors this server-side via `turnstile_config` (super-admin-managed table seeded with one row per env). Test secret `1x0000000000000000000000000000000AA` is used for dev/preview; prod falls back to the `TURNSTILE_SECRET_KEY` env var if the DB row is empty/disabled. This eliminates 110200 hostname errors on Lovable preview links.

**Diagnostics.** `turnstile-diagnose` edge function inspects current hostname, environment, DB config presence, hostname whitelisting, and live `siteverify` results. Surfaced via `<TurnstileDiagnostics />` on the login page (collapsible "Having trouble?") and on the Turnstile Settings admin page.

**Super-admin pages.** `/admin/turnstile` (sidebar entry: "Turnstile Settings", Sliders icon) lets super-admins edit site/secret keys, allowed hostnames, enabled flag, and notes for each environment without touching code or redeploying. RLS on `turnstile_config` blocks all non-super-admin access; edge functions read via service role.

**Admin actions.** `admin-manage` writes every privileged op (`update_plan`, `grant_admin`, `revoke_admin`, `clear_lockout`) to `admin_audit_log` with actor `user_id` and IP. Admins see only their own entries; super-admins see all. The Admin dashboard surfaces this via `<AdminAuditTrail />` (all admins) and `<AdminLockouts />` (super-admin only). Make-Admin/Remove-Admin buttons are tooltip-disabled for regular admins.

Helper hooks: `useIsAdmin()`, `useIsSuperAdmin()`. SQL helpers: `has_role(uuid, app_role)`, `has_super_admin(uuid)` — both NULL-guarded, SECURITY DEFINER, `search_path = public`.
