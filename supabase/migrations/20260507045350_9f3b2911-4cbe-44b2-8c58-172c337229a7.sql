
-- Get member profiles for an org (visible to any member of the org)
CREATE OR REPLACE FUNCTION public.get_org_member_profiles(_org_id uuid)
RETURNS TABLE (
  membership_id uuid,
  user_id uuid,
  role public.org_role,
  display_name text,
  username text,
  avatar_url text,
  created_at timestamptz
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT om.id, om.user_id, om.role, p.display_name, p.username, p.avatar_url, om.created_at
  FROM public.organization_members om
  LEFT JOIN public.profiles p ON p.user_id = om.user_id
  WHERE om.organization_id = _org_id
    AND public.is_org_member(auth.uid(), _org_id);
$$;

-- Invite a user (by username or public email) into an organization
CREATE OR REPLACE FUNCTION public.invite_org_member(
  _org_id uuid,
  _identifier text,
  _role public.org_role DEFAULT 'member'
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_role public.org_role;
  v_user uuid;
  v_id uuid;
  v_ident text := lower(trim(_identifier));
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  v_role := public.org_role_of(auth.uid(), _org_id);
  IF v_role IS NULL OR v_role NOT IN ('owner','admin') THEN
    RAISE EXCEPTION 'Insufficient permissions';
  END IF;

  IF _role = 'owner' THEN
    RAISE EXCEPTION 'Cannot assign owner role via invite';
  END IF;

  SELECT user_id INTO v_user
  FROM public.profiles
  WHERE lower(username) = v_ident OR lower(email_public) = v_ident
  LIMIT 1;

  IF v_user IS NULL THEN
    RAISE EXCEPTION 'No user found for "%". Ask them to sign up and set a username first.', _identifier;
  END IF;

  INSERT INTO public.organization_members (organization_id, user_id, role, invited_by)
  VALUES (_org_id, v_user, _role, auth.uid())
  ON CONFLICT (organization_id, user_id) DO UPDATE SET role = EXCLUDED.role
  RETURNING id INTO v_id;

  RETURN v_id;
END;
$$;
