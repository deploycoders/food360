import { createClient } from "@/lib/supabase/client";

interface AvailabilityProductRow {
  id: string;
  restaurant_id: string;
  category_id: string | null;
  name: string;
  price: number | string;
  preparation_time_minutes: number | null;
  image_url: string | null;
  is_active: boolean;
  is_out_of_stock: boolean;
}

export interface AvailabilityProduct {
  id: string;
  restaurant_id: string;
  category_id: string | null;
  name: string;
  price: number;
  preparation_time_minutes: number | null;
  image_url: string | null;
  is_active: boolean;
  is_out_of_stock: boolean;
}

export async function getAvailabilityProducts(
  restaurantId: string,
): Promise<AvailabilityProduct[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("products")
    .select(
      `
      id,
      restaurant_id,
      category_id,
      name,
      price,
      preparation_time_minutes,
      image_url,
      is_active,
      is_out_of_stock
    `,
    )
    .eq("restaurant_id", restaurantId)
    .eq("is_active", true)
    .order("name", { ascending: true });

  if (error) {
    console.error("Error obteniendo disponibilidad:", error);
    throw new Error(error.message);
  }

  return ((data ?? []) as AvailabilityProductRow[]).map((product) => ({
    id: product.id,
    restaurant_id: product.restaurant_id,
    category_id: product.category_id,
    name: product.name,
    price: Number(product.price),
    preparation_time_minutes: product.preparation_time_minutes,
    image_url: product.image_url,
    is_active: product.is_active,
    is_out_of_stock: product.is_out_of_stock,
  }));
}

export async function updateProductAvailability(
  productId: string,
  isOutOfStock: boolean,
): Promise<AvailabilityProduct> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("products")
    .update({
      is_out_of_stock: isOutOfStock,
      updated_at: new Date().toISOString(),
    })
    .eq("id", productId)
    .select(
      `
      id,
      restaurant_id,
      category_id,
      name,
      price,
      preparation_time_minutes,
      image_url,
      is_active,
      is_out_of_stock
    `,
    )
    .single();

  if (error) {
    console.error("Error actualizando disponibilidad:", error);
    throw new Error(error.message);
  }

  const product = data as AvailabilityProductRow;

  return {
    id: product.id,
    restaurant_id: product.restaurant_id,
    category_id: product.category_id,
    name: product.name,
    price: Number(product.price),
    preparation_time_minutes: product.preparation_time_minutes,
    image_url: product.image_url,
    is_active: product.is_active,
    is_out_of_stock: product.is_out_of_stock,
  };
}

export async function setAllProductsAvailability(
  restaurantId: string,
  isOutOfStock: boolean,
): Promise<void> {
  const supabase = createClient();

  const { error } = await supabase
    .from("products")
    .update({
      is_out_of_stock: isOutOfStock,
      updated_at: new Date().toISOString(),
    })
    .eq("restaurant_id", restaurantId)
    .eq("is_active", true);

  if (error) {
    console.error("Error actualizando disponibilidad global:", error);

    throw new Error(error.message);
  }
}
