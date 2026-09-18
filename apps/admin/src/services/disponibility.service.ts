import { createClient } from "@/lib/supabase/client";
import type { DisponibilityItem } from "@/types/disponibility";

/**
 * Forma en la que Supabase devuelve la relación products -> categories.
 * Aunque cada producto tenga una sola categoría, la relación llega como array.
 */
interface ProductRow {
  id: string;
  name: string;
  price: number;
  is_out_of_stock: boolean | null;
  preparation_time_minutes: number | null;
  category: {
    name: string;
  }[];
}

export async function getDisponibilityItems(
  restaurantId: string,
): Promise<DisponibilityItem[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("products")
    .select(
      `
        id,
        name,
        price,
        is_out_of_stock,
        preparation_time_minutes,
        category:categories (
          name
        )
      `,
    )
    .eq("restaurant_id", restaurantId)
    .eq("is_active", true)
    .order("name", { ascending: true });

  if (error) {
    throw new Error(`No se pudieron obtener los productos: ${error.message}`);
  }

  const products = (data ?? []) as ProductRow[];

  return products.map((product) => ({
    id: product.id,
    name: product.name,
    category: product.category?.[0]?.name ?? "Sin categoría",
    price: Number(product.price),
    isAvailable: !(product.is_out_of_stock ?? false),
    preparationTime:
      product.preparation_time_minutes != null
        ? `${product.preparation_time_minutes} min`
        : undefined,
  }));
}

export async function updateProductAvailability(
  productId: string,
  restaurantId: string,
  isAvailable: boolean,
): Promise<void> {
  const supabase = createClient();

  const { error } = await supabase
    .from("products")
    .update({
      is_out_of_stock: !isAvailable,
      updated_at: new Date().toISOString(),
    })
    .eq("id", productId)
    .eq("restaurant_id", restaurantId);

  if (error) {
    throw new Error(
      `No se pudo actualizar la disponibilidad: ${error.message}`,
    );
  }
}

export async function updateAllProductsAvailability(
  restaurantId: string,
  isAvailable: boolean,
): Promise<void> {
  const supabase = createClient();

  const { error } = await supabase
    .from("products")
    .update({
      is_out_of_stock: !isAvailable,
      updated_at: new Date().toISOString(),
    })
    .eq("restaurant_id", restaurantId)
    .eq("is_active", true);

  if (error) {
    throw new Error(
      `No se pudo actualizar la disponibilidad: ${error.message}`,
    );
  }
}
