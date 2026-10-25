-- Remove only the redundant QR table settings introduced on 2026-10-23.
-- Intentionally omits CASCADE so unexpected dependencies stop this migration.
BEGIN;

DROP FUNCTION IF EXISTS public.update_restaurant_qr_settings(
  uuid, smallint, boolean, boolean, numeric, text, text, boolean
);

DROP TABLE IF EXISTS public.restaurant_qr_settings;

COMMIT;
