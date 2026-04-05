
-- 1. Restrict profiles SELECT to owner-only (public lookups use get_public_profile RPC)
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;

CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- 2. Remove user self-update on subscriptions (only admins should change plans)
DROP POLICY IF EXISTS "Users can update their own subscription" ON public.user_subscriptions;

-- 3. Remove user self-insert on subscriptions (handled by trigger on auth.users)
DROP POLICY IF EXISTS "Users can insert their own subscription" ON public.user_subscriptions;
