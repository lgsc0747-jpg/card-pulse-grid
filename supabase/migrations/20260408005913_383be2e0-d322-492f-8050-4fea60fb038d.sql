
ALTER TABLE public.personas ADD COLUMN IF NOT EXISTS avatar_position jsonb DEFAULT '{"x":50,"y":50,"scale":100}'::jsonb;

ALTER TABLE public.order_items ADD COLUMN IF NOT EXISTS variant_info text DEFAULT NULL;
