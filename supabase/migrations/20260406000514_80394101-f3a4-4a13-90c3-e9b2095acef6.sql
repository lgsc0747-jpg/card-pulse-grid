-- Remove the overly permissive public SELECT policy on user_subscriptions
DROP POLICY IF EXISTS "Public can read subscription plan" ON public.user_subscriptions;