-- Manual migration: apply through the reviewed Supabase SQL workflow.
BEGIN;

ALTER TABLE public.restaurants
  ADD COLUMN IF NOT EXISTS public_page_published boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS public_id uuid DEFAULT gen_random_uuid(),
  ADD COLUMN IF NOT EXISTS wifi_ssid text,
  ADD COLUMN IF NOT EXISTS wifi_password text;

-- IF NOT EXISTS does not repair a column that was created by an earlier attempt.
ALTER TABLE public.restaurants
  ALTER COLUMN public_id SET DEFAULT gen_random_uuid();

UPDATE public.restaurants
SET public_id = gen_random_uuid()
WHERE public_id IS NULL;

ALTER TABLE public.restaurants
  ALTER COLUMN public_id SET NOT NULL;

DO $$
BEGIN
  -- Existing duplicate slugs must be reconciled before this index can be created.
  IF NOT EXISTS (
    SELECT 1
    FROM pg_index AS idx
    JOIN pg_attribute AS attr
      ON attr.attrelid = idx.indrelid
     AND attr.attname = 'slug'
     AND NOT attr.attisdropped
    WHERE idx.indrelid = 'public.restaurants'::regclass
      AND idx.indisunique
      AND idx.indpred IS NULL
      AND idx.indnkeyatts = 1
      AND idx.indkey[0] = attr.attnum
  ) THEN
    CREATE UNIQUE INDEX restaurants_slug_unique_idx
      ON public.restaurants (slug);
  END IF;
END;
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_index AS idx
    JOIN pg_attribute AS attr
      ON attr.attrelid = idx.indrelid
     AND attr.attname = 'public_id'
     AND NOT attr.attisdropped
    WHERE idx.indrelid = 'public.restaurants'::regclass
      AND idx.indisunique
      AND idx.indpred IS NULL
      AND idx.indnkeyatts = 1
      AND idx.indkey[0] = attr.attnum
  ) THEN
    IF to_regclass('public.restaurants_public_id_unique_idx') IS NOT NULL THEN
      RAISE EXCEPTION 'restaurants_public_id_unique_idx exists but is not a valid unique index';
    END IF;

    CREATE UNIQUE INDEX restaurants_public_id_unique_idx
      ON public.restaurants (public_id);
  END IF;
END;
$$;

CREATE TABLE IF NOT EXISTS public.restaurant_qr_settings (
  restaurant_id uuid PRIMARY KEY REFERENCES public.restaurants (id) ON DELETE CASCADE,
  table_count smallint NOT NULL DEFAULT 1 CHECK (table_count BETWEEN 1 AND 200),
  allow_self_ordering boolean NOT NULL DEFAULT false,
  require_table_number boolean NOT NULL DEFAULT true,
  service_tax_percentage numeric(5, 2) NOT NULL DEFAULT 0
    CHECK (service_tax_percentage BETWEEN 0 AND 30),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.restaurant_slug_aliases (
  slug text PRIMARY KEY,
  restaurant_id uuid NOT NULL REFERENCES public.restaurants (id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT restaurant_slug_aliases_format
    CHECK (
      slug ~ '^[a-z0-9]([a-z0-9-]{0,78}[a-z0-9])?$'
      AND slug NOT IN ('menu', 'cart', 'r')
    )
);

CREATE INDEX IF NOT EXISTS restaurant_slug_aliases_restaurant_id_idx
  ON public.restaurant_slug_aliases (restaurant_id);

ALTER TABLE public.restaurant_qr_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.restaurant_slug_aliases ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON public.restaurant_qr_settings FROM PUBLIC, anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.restaurant_qr_settings TO service_role;
REVOKE ALL ON public.restaurant_slug_aliases FROM PUBLIC, anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.restaurant_slug_aliases TO service_role;

CREATE OR REPLACE FUNCTION public.keep_restaurant_slug_alias()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  IF NEW.slug !~ '^[a-z0-9]([a-z0-9-]{0,78}[a-z0-9])?$'
    OR NEW.slug IN ('menu', 'cart', 'r') THEN
    RAISE EXCEPTION 'Restaurant slug is invalid or reserved'
      USING ERRCODE = '23514';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM public.restaurant_slug_aliases AS aliases
    WHERE aliases.slug = NEW.slug
      AND aliases.restaurant_id <> NEW.id
  ) THEN
    RAISE EXCEPTION 'Restaurant slug is already reserved'
      USING ERRCODE = '23505';
  END IF;

  IF TG_OP = 'UPDATE' THEN
    IF OLD.slug IS DISTINCT FROM NEW.slug THEN
      IF OLD.slug NOT IN ('menu', 'cart', 'r') THEN
        IF EXISTS (
          SELECT 1
          FROM public.restaurant_slug_aliases AS aliases
          WHERE aliases.slug = OLD.slug
            AND aliases.restaurant_id <> OLD.id
        ) THEN
          RAISE EXCEPTION 'Previous restaurant slug is already reserved'
            USING ERRCODE = '23505';
        END IF;

        INSERT INTO public.restaurant_slug_aliases (slug, restaurant_id)
        VALUES (OLD.slug, OLD.id)
        ON CONFLICT (slug) DO UPDATE
          SET restaurant_id = EXCLUDED.restaurant_id
          WHERE restaurant_slug_aliases.restaurant_id = EXCLUDED.restaurant_id;

        IF NOT FOUND THEN
          RAISE EXCEPTION 'Previous restaurant slug is already reserved'
            USING ERRCODE = '23505';
        END IF;
      END IF;

      DELETE FROM public.restaurant_slug_aliases
      WHERE slug = NEW.slug AND restaurant_id = NEW.id;
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS restaurants_reserve_slug_alias_insert ON public.restaurants;
CREATE TRIGGER restaurants_reserve_slug_alias_insert
  BEFORE INSERT OR UPDATE OF slug ON public.restaurants
  FOR EACH ROW EXECUTE FUNCTION public.keep_restaurant_slug_alias();

CREATE OR REPLACE FUNCTION public.prevent_restaurant_public_id_change()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.public_id IS DISTINCT FROM OLD.public_id THEN
    RAISE EXCEPTION 'Restaurant public id is immutable';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS restaurants_public_id_immutable ON public.restaurants;
CREATE TRIGGER restaurants_public_id_immutable
  BEFORE UPDATE OF public_id ON public.restaurants
  FOR EACH ROW EXECUTE FUNCTION public.prevent_restaurant_public_id_change();

CREATE OR REPLACE FUNCTION public.update_restaurant_qr_settings(
  p_restaurant_id uuid,
  p_table_count smallint,
  p_allow_self_ordering boolean,
  p_require_table_number boolean,
  p_service_tax_percentage numeric,
  p_wifi_ssid text,
  p_wifi_password text,
  p_clear_wifi_password boolean
)
RETURNS TABLE (
  table_count smallint,
  allow_self_ordering boolean,
  require_table_number boolean,
  service_tax_percentage numeric,
  wifi_ssid text,
  wifi_password_configured boolean
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  UPDATE public.restaurants AS restaurants
  SET wifi_ssid = p_wifi_ssid,
      wifi_password = CASE
        WHEN p_clear_wifi_password OR p_wifi_ssid IS NULL THEN NULL
        WHEN p_wifi_password IS NOT NULL THEN p_wifi_password
        ELSE restaurants.wifi_password
      END
  WHERE restaurants.id = p_restaurant_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Restaurant not found' USING ERRCODE = 'P0002';
  END IF;

  INSERT INTO public.restaurant_qr_settings AS current_settings (
    restaurant_id,
    table_count,
    allow_self_ordering,
    require_table_number,
    service_tax_percentage,
    updated_at
  ) VALUES (
    p_restaurant_id,
    p_table_count,
    p_allow_self_ordering,
    p_require_table_number,
    p_service_tax_percentage,
    now()
  )
  ON CONFLICT (restaurant_id) DO UPDATE
  SET table_count = EXCLUDED.table_count,
      allow_self_ordering = EXCLUDED.allow_self_ordering,
      require_table_number = EXCLUDED.require_table_number,
      service_tax_percentage = EXCLUDED.service_tax_percentage,
      updated_at = now();

  RETURN QUERY
  SELECT settings.table_count,
         settings.allow_self_ordering,
         settings.require_table_number,
         settings.service_tax_percentage,
         restaurants.wifi_ssid,
         restaurants.wifi_password IS NOT NULL
  FROM public.restaurant_qr_settings AS settings
  JOIN public.restaurants AS restaurants ON restaurants.id = settings.restaurant_id
  WHERE settings.restaurant_id = p_restaurant_id;
END;
$$;

REVOKE ALL ON FUNCTION public.update_restaurant_qr_settings(
  uuid, smallint, boolean, boolean, numeric, text, text, boolean
) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.update_restaurant_qr_settings(
  uuid, smallint, boolean, boolean, numeric, text, text, boolean
) TO service_role;

COMMIT;
