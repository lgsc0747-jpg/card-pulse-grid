
-- Create a security definer function to validate and insert lead captures
-- This bypasses persona RLS so anonymous visitors can submit contact forms
CREATE OR REPLACE FUNCTION public.insert_lead_capture(
  p_owner_user_id uuid,
  p_persona_id uuid,
  p_visitor_name text DEFAULT NULL,
  p_visitor_email text DEFAULT NULL,
  p_visitor_phone text DEFAULT NULL,
  p_visitor_company text DEFAULT NULL,
  p_visitor_message text DEFAULT NULL,
  p_metadata jsonb DEFAULT '{}'::jsonb
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_id uuid;
BEGIN
  -- Verify the persona exists, belongs to the owner, and is active
  IF NOT EXISTS (
    SELECT 1 FROM public.personas
    WHERE id = p_persona_id
      AND user_id = p_owner_user_id
      AND is_active = true
  ) THEN
    RAISE EXCEPTION 'Invalid persona or owner';
  END IF;

  INSERT INTO public.lead_captures (owner_user_id, persona_id, visitor_name, visitor_email, visitor_phone, visitor_company, visitor_message, metadata)
  VALUES (p_owner_user_id, p_persona_id, p_visitor_name, p_visitor_email, p_visitor_phone, p_visitor_company, p_visitor_message, p_metadata)
  RETURNING id INTO new_id;

  RETURN new_id;
END;
$$;
