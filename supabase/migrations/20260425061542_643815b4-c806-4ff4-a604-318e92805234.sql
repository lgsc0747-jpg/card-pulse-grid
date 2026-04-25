-- 1. Create turnstile_config table
CREATE TABLE public.turnstile_config (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  environment text NOT NULL UNIQUE CHECK (environment IN ('dev', 'preview', 'prod')),
  site_key text NOT NULL,
  secret_key text NOT NULL,
  allowed_hostnames text[] NOT NULL DEFAULT ARRAY[]::text[],
  enabled boolean NOT NULL DEFAULT true,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 2. Enable RLS
ALTER TABLE public.turnstile_config ENABLE ROW LEVEL SECURITY;

-- 3. Super-admin only policies
CREATE POLICY "Super admins can view turnstile config"
  ON public.turnstile_config FOR SELECT
  TO authenticated
  USING (public.has_super_admin(auth.uid()));

CREATE POLICY "Super admins can insert turnstile config"
  ON public.turnstile_config FOR INSERT
  TO authenticated
  WITH CHECK (public.has_super_admin(auth.uid()));

CREATE POLICY "Super admins can update turnstile config"
  ON public.turnstile_config FOR UPDATE
  TO authenticated
  USING (public.has_super_admin(auth.uid()));

CREATE POLICY "Super admins can delete turnstile config"
  ON public.turnstile_config FOR DELETE
  TO authenticated
  USING (public.has_super_admin(auth.uid()));

-- 4. Updated_at trigger
CREATE TRIGGER update_turnstile_config_updated_at
  BEFORE UPDATE ON public.turnstile_config
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 5. Seed default rows
-- Test keys: 1x00000000000000000000AA always passes; 1x0000000000000000000000000000000AA secret always passes.
INSERT INTO public.turnstile_config (environment, site_key, secret_key, allowed_hostnames, enabled, notes)
VALUES
  (
    'dev',
    '1x00000000000000000000AA',
    '1x0000000000000000000000000000000AA',
    ARRAY['localhost', '127.0.0.1'],
    true,
    'Cloudflare test keys — always pass. Used on localhost.'
  ),
  (
    'preview',
    '1x00000000000000000000AA',
    '1x0000000000000000000000000000000AA',
    ARRAY['lovable.app', 'lovableproject.com'],
    true,
    'Cloudflare test keys — always pass. Used on Lovable preview hosts.'
  ),
  (
    'prod',
    '0x4AAAAAADCjpQiKqCjVRmYL',
    'PLACEHOLDER_SET_VIA_ADMIN_UI',
    ARRAY['handshake-card.lovable.app'],
    true,
    'Production keys. Update secret_key via the admin UI.'
  );