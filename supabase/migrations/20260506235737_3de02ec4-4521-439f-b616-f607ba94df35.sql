-- Account type on profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS account_type text NOT NULL DEFAULT 'personal'
    CHECK (account_type IN ('personal', 'agency'));

-- Organizations (agency workspaces)
CREATE TABLE IF NOT EXISTS public.organizations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  owner_user_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;

-- Org membership
CREATE TYPE public.org_role AS ENUM ('owner', 'admin', 'manager', 'member');

CREATE TABLE IF NOT EXISTS public.organization_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  role public.org_role NOT NULL DEFAULT 'member',
  invited_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (organization_id, user_id)
);
ALTER TABLE public.organization_members ENABLE ROW LEVEL SECURITY;

-- Per-feature × per-resource ACL
-- resource_type: 'persona' | 'lead' | 'card' | 'page' | 'analytics' | 'org'
-- permission:    'view' | 'edit' | 'delete' | 'manage'
CREATE TABLE IF NOT EXISTS public.member_permissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  member_user_id uuid NOT NULL,
  resource_type text NOT NULL CHECK (resource_type IN ('persona','lead','card','page','analytics','org')),
  resource_id uuid,  -- NULL = applies to all resources of that type in the org
  permission text NOT NULL CHECK (permission IN ('view','edit','delete','manage')),
  granted_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (organization_id, member_user_id, resource_type, resource_id, permission)
);
ALTER TABLE public.member_permissions ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_member_perms_lookup
  ON public.member_permissions (member_user_id, resource_type, resource_id);

-- Membership helper (security definer to avoid RLS recursion)
CREATE OR REPLACE FUNCTION public.is_org_member(_user_id uuid, _org_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.organization_members
    WHERE organization_id = _org_id AND user_id = _user_id
  );
$$;

CREATE OR REPLACE FUNCTION public.org_role_of(_user_id uuid, _org_id uuid)
RETURNS public.org_role LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT role FROM public.organization_members
  WHERE organization_id = _org_id AND user_id = _user_id
  LIMIT 1;
$$;

-- Granular permission check.
-- Owners/admins implicitly have every permission.
-- Otherwise we look for an explicit grant matching (resource_id) OR
-- an org-wide grant (resource_id IS NULL) for the same resource_type.
-- 'manage' implies all lower permissions.
CREATE OR REPLACE FUNCTION public.has_org_permission(
  _user_id uuid,
  _org_id uuid,
  _resource_type text,
  _resource_id uuid,
  _permission text
) RETURNS boolean
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
DECLARE
  r public.org_role;
BEGIN
  IF _user_id IS NULL OR _org_id IS NULL THEN RETURN false; END IF;

  SELECT role INTO r FROM public.organization_members
  WHERE organization_id = _org_id AND user_id = _user_id;
  IF r IS NULL THEN RETURN false; END IF;
  IF r IN ('owner','admin') THEN RETURN true; END IF;

  RETURN EXISTS (
    SELECT 1 FROM public.member_permissions mp
    WHERE mp.organization_id = _org_id
      AND mp.member_user_id = _user_id
      AND mp.resource_type = _resource_type
      AND (mp.resource_id = _resource_id OR mp.resource_id IS NULL)
      AND (mp.permission = _permission OR mp.permission = 'manage')
  );
END;
$$;

-- RLS: organizations
CREATE POLICY "Members can view their orgs"
  ON public.organizations FOR SELECT TO authenticated
  USING (public.is_org_member(auth.uid(), id));

CREATE POLICY "Authenticated users can create orgs"
  ON public.organizations FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = owner_user_id);

CREATE POLICY "Owners/admins can update orgs"
  ON public.organizations FOR UPDATE TO authenticated
  USING (public.org_role_of(auth.uid(), id) IN ('owner','admin'));

CREATE POLICY "Owners can delete orgs"
  ON public.organizations FOR DELETE TO authenticated
  USING (public.org_role_of(auth.uid(), id) = 'owner');

-- RLS: organization_members
CREATE POLICY "Members can view org membership"
  ON public.organization_members FOR SELECT TO authenticated
  USING (public.is_org_member(auth.uid(), organization_id));

CREATE POLICY "Owners/admins manage memberships"
  ON public.organization_members FOR ALL TO authenticated
  USING (public.org_role_of(auth.uid(), organization_id) IN ('owner','admin'))
  WITH CHECK (public.org_role_of(auth.uid(), organization_id) IN ('owner','admin'));

-- RLS: member_permissions
CREATE POLICY "Members can view their own permissions"
  ON public.member_permissions FOR SELECT TO authenticated
  USING (
    member_user_id = auth.uid()
    OR public.org_role_of(auth.uid(), organization_id) IN ('owner','admin')
  );

CREATE POLICY "Owners/admins manage permissions"
  ON public.member_permissions FOR ALL TO authenticated
  USING (public.org_role_of(auth.uid(), organization_id) IN ('owner','admin'))
  WITH CHECK (public.org_role_of(auth.uid(), organization_id) IN ('owner','admin'));

-- Auto-create owner membership when an org is created
CREATE OR REPLACE FUNCTION public.handle_new_organization()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.organization_members (organization_id, user_id, role)
  VALUES (NEW.id, NEW.owner_user_id, 'owner')
  ON CONFLICT DO NOTHING;
  RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS trg_new_org ON public.organizations;
CREATE TRIGGER trg_new_org AFTER INSERT ON public.organizations
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_organization();

-- updated_at trigger for organizations
DROP TRIGGER IF EXISTS trg_orgs_updated_at ON public.organizations;
CREATE TRIGGER trg_orgs_updated_at BEFORE UPDATE ON public.organizations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();