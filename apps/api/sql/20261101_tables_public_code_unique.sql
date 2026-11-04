-- Manual migration: apply through the reviewed Supabase SQL workflow.
-- Ensures public_code is unique for public QR lookups. Does not change RLS.
BEGIN;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_index AS idx
    JOIN pg_attribute AS attr
      ON attr.attrelid = idx.indrelid
     AND attr.attname = 'public_code'
     AND NOT attr.attisdropped
    WHERE idx.indrelid = 'public.tables'::regclass
      AND idx.indisunique
      AND idx.indpred IS NULL
      AND idx.indnkeyatts = 1
      AND idx.indkey[0] = attr.attnum
  ) THEN
    IF to_regclass('public.tables_public_code_unique_idx') IS NOT NULL THEN
      RAISE EXCEPTION 'tables_public_code_unique_idx exists but is not a valid unique index';
    END IF;

    CREATE UNIQUE INDEX tables_public_code_unique_idx
      ON public.tables (public_code);
  END IF;
END;
$$;

COMMIT;
