
-- Drop order_items first (depends on orders and products)
DROP TABLE IF EXISTS public.order_items CASCADE;

-- Drop orders (depends on personas)
DROP TABLE IF EXISTS public.orders CASCADE;

-- Drop product_variant_images (depends on product_variants)
DROP TABLE IF EXISTS public.product_variant_images CASCADE;

-- Drop product_variants (depends on products)
DROP TABLE IF EXISTS public.product_variants CASCADE;

-- Drop product_images (depends on products)
DROP TABLE IF EXISTS public.product_images CASCADE;

-- Drop products
DROP TABLE IF EXISTS public.products CASCADE;

-- Remove gcash_qr_url from personas
ALTER TABLE public.personas DROP COLUMN IF EXISTS gcash_qr_url;
