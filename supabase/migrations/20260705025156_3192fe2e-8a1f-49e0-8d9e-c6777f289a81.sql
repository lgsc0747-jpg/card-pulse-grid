
CREATE OR REPLACE FUNCTION public.get_org_personas(_org_id uuid)
RETURNS TABLE(
  id uuid, user_id uuid, slug text, label text, display_name text,
  headline text, avatar_url text, accent_color text, secondary_color text,
  landing_bg_color text, background_preset text, background_image_url text,
  is_active boolean, is_private boolean, updated_at timestamptz, created_at timestamptz,
  owner_name text, owner_username text, owner_avatar text,
  page_count int, block_count int
)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  WITH member_ids AS (
    SELECT user_id FROM public.organization_members WHERE organization_id = _org_id
  ), allowed AS (
    SELECT public.is_org_member(auth.uid(), _org_id) AS ok
  )
  SELECT
    p.id, p.user_id, p.slug, p.label, p.display_name,
    p.headline, p.avatar_url, p.accent_color, p.secondary_color,
    p.landing_bg_color, p.background_preset, p.background_image_url,
    p.is_active, p.is_private, p.updated_at, p.created_at,
    pr.display_name, pr.username, pr.avatar_url,
    COALESCE((SELECT count(*)::int FROM public.site_pages sp WHERE sp.persona_id = p.id), 0),
    COALESCE((SELECT count(*)::int FROM public.page_blocks pb
              JOIN public.site_pages sp2 ON sp2.id = pb.page_id
              WHERE sp2.persona_id = p.id), 0)
  FROM public.personas p
  JOIN member_ids m ON m.user_id = p.user_id
  LEFT JOIN public.profiles pr ON pr.user_id = p.user_id
  WHERE (SELECT ok FROM allowed) IS TRUE
  ORDER BY p.updated_at DESC NULLS LAST, p.created_at DESC;
$$;

GRANT EXECUTE ON FUNCTION public.get_org_personas(uuid) TO authenticated;
