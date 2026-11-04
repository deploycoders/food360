-- Migration: 20261103_create_public_order_rpc.sql
-- Transaccional RPC function para la creación pública de órdenes en Food360.
-- Aplicar mediante el flujo de trabajo revisado de Supabase SQL.

BEGIN;

CREATE OR REPLACE FUNCTION public.create_public_order(
  p_restaurant_public_id uuid,
  p_origin text,
  p_table_public_code text,
  p_customer_name text,
  p_customer_phone text,
  p_items jsonb
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_restaurant_id uuid;
  v_table_id uuid := NULL;
  v_table_number integer := NULL;
  v_customer_id uuid;
  v_order_id uuid;
  v_origin text;
  v_clean_name text;
  v_clean_phone text;
  v_total_amount numeric(10, 2) := 0;
  v_item_count integer := 0;
  v_item record;
  v_product record;
  v_item_subtotal numeric(10, 2);
BEGIN
  -- 1. Validar restaurante publicado
  IF p_restaurant_public_id IS NULL THEN
    RAISE EXCEPTION 'INVALID_RESTAURANT_ID' USING ERRCODE = 'P0002';
  END IF;

  SELECT id INTO v_restaurant_id
  FROM public.restaurants
  WHERE public_id = p_restaurant_public_id
    AND public_page_published = true;

  IF v_restaurant_id IS NULL THEN
    RAISE EXCEPTION 'RESTAURANT_NOT_FOUND' USING ERRCODE = 'P0002';
  END IF;

  -- 2. Validar origen
  v_origin := UPPER(TRIM(COALESCE(p_origin, '')));
  IF v_origin NOT IN ('DINE_IN', 'TAKEAWAY', 'DELIVERY') THEN
    RAISE EXCEPTION 'INVALID_ORIGIN' USING ERRCODE = '22023';
  END IF;

  -- 3. Validar mesa si es DINE_IN
  IF v_origin = 'DINE_IN' THEN
    IF p_table_public_code IS NULL OR TRIM(p_table_public_code) = '' THEN
      RAISE EXCEPTION 'TABLE_REQUIRED_FOR_DINE_IN' USING ERRCODE = '22023';
    END IF;

    SELECT id, table_number INTO v_table_id, v_table_number
    FROM public.tables
    WHERE public_code = TRIM(p_table_public_code)
      AND restaurant_id = v_restaurant_id;

    IF v_table_id IS NULL THEN
      RAISE EXCEPTION 'TABLE_NOT_FOUND' USING ERRCODE = 'P0002';
    END IF;
  ELSE
    v_table_id := NULL;
    v_table_number := NULL;
  END IF;

  -- 4. Validar datos del cliente
  v_clean_name := TRIM(COALESCE(p_customer_name, ''));
  v_clean_phone := TRIM(COALESCE(p_customer_phone, ''));

  IF v_clean_name = '' OR length(v_clean_name) < 2 OR length(v_clean_name) > 100 THEN
    RAISE EXCEPTION 'INVALID_CUSTOMER_NAME' USING ERRCODE = '22023';
  END IF;

  IF v_clean_phone = '' OR length(v_clean_phone) < 7 OR length(v_clean_phone) > 20 THEN
    RAISE EXCEPTION 'INVALID_CUSTOMER_PHONE' USING ERRCODE = '22023';
  END IF;

  -- 5. Validar array de artículos
  IF p_items IS NULL OR jsonb_typeof(p_items) != 'array' OR jsonb_array_length(p_items) = 0 THEN
    RAISE EXCEPTION 'ITEMS_EMPTY' USING ERRCODE = '22023';
  END IF;

  IF jsonb_array_length(p_items) > 50 THEN
    RAISE EXCEPTION 'TOO_MANY_ITEMS' USING ERRCODE = '22023';
  END IF;

  -- 6. Resolver o insertar cliente para este restaurante
  SELECT id INTO v_customer_id
  FROM public.customers
  WHERE restaurant_id = v_restaurant_id
    AND phone = v_clean_phone
  ORDER BY created_at ASC
  LIMIT 1;

  IF v_customer_id IS NULL THEN
    BEGIN
      INSERT INTO public.customers (restaurant_id, phone, full_name)
      VALUES (v_restaurant_id, v_clean_phone, v_clean_name)
      RETURNING id INTO v_customer_id;
    EXCEPTION WHEN unique_violation THEN
      SELECT id INTO v_customer_id
      FROM public.customers
      WHERE restaurant_id = v_restaurant_id
        AND phone = v_clean_phone
      ORDER BY created_at ASC
      LIMIT 1;
    END;
  END IF;

  -- 7. Validar cada producto, disponibilidad y calcular total
  FOR v_item IN SELECT * FROM jsonb_to_recordset(p_items) AS x(product_id uuid, quantity integer)
  LOOP
    IF v_item.product_id IS NULL THEN
      RAISE EXCEPTION 'INVALID_PRODUCT_ID' USING ERRCODE = '22023';
    END IF;

    IF v_item.quantity IS NULL OR v_item.quantity <= 0 OR v_item.quantity > 99 THEN
      RAISE EXCEPTION 'INVALID_QUANTITY' USING ERRCODE = '22003';
    END IF;

    SELECT id, name, price, is_active, is_out_of_stock INTO v_product
    FROM public.products
    WHERE id = v_item.product_id
      AND restaurant_id = v_restaurant_id;

    IF NOT FOUND THEN
      RAISE EXCEPTION 'PRODUCT_NOT_FOUND: %', v_item.product_id USING ERRCODE = 'P0002';
    END IF;

    IF NOT v_product.is_active THEN
      RAISE EXCEPTION 'PRODUCT_INACTIVE: %', v_product.name USING ERRCODE = 'P0001';
    END IF;

    IF v_product.is_out_of_stock THEN
      RAISE EXCEPTION 'PRODUCT_OUT_OF_STOCK: %', v_product.name USING ERRCODE = 'P0001';
    END IF;

    v_item_subtotal := ROUND((v_product.price * v_item.quantity)::numeric, 2);
    v_total_amount := v_total_amount + v_item_subtotal;
    v_item_count := v_item_count + v_item.quantity;
  END LOOP;

  -- 8. Insertar la orden con estado inicial PENDING
  INSERT INTO public.orders (
    restaurant_id,
    customer_id,
    table_id,
    origin,
    status,
    total_amount
  ) VALUES (
    v_restaurant_id,
    v_customer_id,
    v_table_id,
    v_origin,
    'PENDING',
    v_total_amount
  ) RETURNING id INTO v_order_id;

  -- 9. Insertar líneas de la orden (order_items)
  FOR v_item IN SELECT * FROM jsonb_to_recordset(p_items) AS x(product_id uuid, quantity integer)
  LOOP
    SELECT name, price INTO v_product
    FROM public.products
    WHERE id = v_item.product_id;

    INSERT INTO public.order_items (
      order_id,
      product_id,
      product_name,
      quantity,
      unit_price
    ) VALUES (
      v_order_id,
      v_item.product_id,
      v_product.name,
      v_item.quantity,
      v_product.price
    );
  END LOOP;

  -- 10. Devolver resultado estructurado
  RETURN jsonb_build_object(
    'order_id', v_order_id,
    'origin', v_origin,
    'table_number', v_table_number,
    'status', 'PENDING',
    'total_amount', v_total_amount,
    'item_count', v_item_count
  );
END;
$$;

-- Seguridad: Revocar acceso público y otorgar exclusivamente a service_role
REVOKE EXECUTE ON FUNCTION public.create_public_order(uuid, text, text, text, text, jsonb) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.create_public_order(uuid, text, text, text, text, jsonb) FROM anon;
REVOKE EXECUTE ON FUNCTION public.create_public_order(uuid, text, text, text, text, jsonb) FROM authenticated;
GRANT EXECUTE ON FUNCTION public.create_public_order(uuid, text, text, text, text, jsonb) TO service_role;

COMMIT;

