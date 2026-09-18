import { createClient } from "@/lib/supabase/client";
import type { Product } from "@/types/menu";

type ProductRow = {
  id: string;
  restaurant_id: string | null;
  category_id: string | null;
  name: string;
  description: string | null;
  price: number | string;
  preparation_time_minutes: number | null;
  image_url: string | null;
  is_3d: boolean;
  glb_url: string | null;
  usdz_url: string | null;
  is_active: boolean;
  is_out_of_stock: boolean;
  deactivation_reason: string | null;
  created_at: string | null;
  updated_at: string | null;
};
type ActiveProductRow = ProductRow & {
  category: {
    id: string;
    name: string;
    is_active: boolean;
  };
};

export function mapProduct(row: ProductRow): Product {
  return {
    id: row.id,
    restaurantId: row.restaurant_id ?? "",
    categoryId: row.category_id,

    name: row.name,
    description: row.description,
    price: Number(row.price),

    preparationTimeMinutes: row.preparation_time_minutes,

    imageUrl: row.image_url,

    is3d: row.is_3d,
    glbUrl: row.glb_url,
    usdzUrl: row.usdz_url,

    isActive: row.is_active,
    isOutOfStock: row.is_out_of_stock,
    deactivationReason: row.deactivation_reason,

    createdAt: row.created_at ?? undefined,
    updatedAt: row.updated_at ?? undefined,
  };
}

export async function getProducts(restaurantId: string): Promise<Product[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("restaurant_id", restaurantId)
    .order("name", { ascending: true });

  if (error) {
    console.error("Error obteniendo productos:", error);
    throw new Error(error.message);
  }

  return ((data ?? []) as ProductRow[]).map(mapProduct);
}

export async function getActiveProducts(
  restaurantId: string,
): Promise<Product[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("products")
    .select(
      `
      *,
      category:categories!inner (
        id,
        name,
        is_active
      )
    `,
    )
    .eq("restaurant_id", restaurantId)
    .eq("is_active", true)
    .eq("categories.is_active", true)
    .order("name", { ascending: true });

  if (error) {
    console.error("Error obteniendo productos activos:", error);
    throw new Error(error.message);
  }

  return ((data ?? []) as ProductRow[]).map(mapProduct);
}

export async function createProduct(
  restaurantId: string,
  product: {
    categoryId?: string | null;
    name: string;
    description?: string | null;
    price: number;
    preparationTimeMinutes?: number | null;
    imageUrl?: string | null;
    is3d?: boolean;
    glbUrl?: string | null;
    usdzUrl?: string | null;
  },
): Promise<Product> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("products")
    .insert({
      restaurant_id: restaurantId,
      category_id: product.categoryId ?? null,
      name: product.name.trim(),
      description: product.description?.trim() || null,
      price: product.price,
      preparation_time_minutes: product.preparationTimeMinutes ?? null,
      image_url: product.imageUrl ?? null,
      is_3d: product.is3d ?? false,
      glb_url: product.glbUrl ?? null,
      usdz_url: product.usdzUrl ?? null,
      is_active: true,
      is_out_of_stock: false,
      deactivation_reason: null,
    })
    .select()
    .single();

  if (error) {
    console.error("Error creando producto:", error);
    throw new Error(error.message);
  }

  return mapProduct(data as ProductRow);
}

export async function updateProduct(
  productId: string,
  updates: {
    categoryId?: string | null;
    name?: string;
    description?: string | null;
    price?: number;
    preparationTimeMinutes?: number | null;
    imageUrl?: string | null;
    is3d?: boolean;
    glbUrl?: string | null;
    usdzUrl?: string | null;
    isActive?: boolean;
    isOutOfStock?: boolean;
    deactivationReason?: string | null;
  },
): Promise<Product> {
  const supabase = createClient();

  const payload: Record<string, unknown> = {};

  if (updates.categoryId !== undefined) {
    payload.category_id = updates.categoryId;
  }

  if (updates.name !== undefined) {
    payload.name = updates.name.trim();
  }

  if (updates.description !== undefined) {
    payload.description = updates.description?.trim() || null;
  }

  if (updates.price !== undefined) {
    payload.price = updates.price;
  }

  if (updates.preparationTimeMinutes !== undefined) {
    payload.preparation_time_minutes = updates.preparationTimeMinutes;
  }

  if (updates.imageUrl !== undefined) {
    payload.image_url = updates.imageUrl;
  }

  if (updates.is3d !== undefined) {
    payload.is_3d = updates.is3d;
  }

  if (updates.glbUrl !== undefined) {
    payload.glb_url = updates.glbUrl;
  }

  if (updates.usdzUrl !== undefined) {
    payload.usdz_url = updates.usdzUrl;
  }

  if (updates.isActive !== undefined) {
    payload.is_active = updates.isActive;
  }

  if (updates.isOutOfStock !== undefined) {
    payload.is_out_of_stock = updates.isOutOfStock;
  }

  if (updates.deactivationReason !== undefined) {
    payload.deactivation_reason = updates.deactivationReason;
  }

  const { data, error } = await supabase
    .from("products")
    .update(payload)
    .eq("id", productId)
    .select()
    .single();

  if (error) {
    console.error("Error actualizando producto:", error);
    throw new Error(error.message);
  }

  return mapProduct(data as ProductRow);
}

export async function toggleProductAvailability(
  productId: string,
  isOutOfStock: boolean,
): Promise<Product> {
  return updateProduct(productId, {
    isOutOfStock,
  });
}

export async function deleteProduct(productId: string): Promise<Product> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("products")
    .update({
      is_active: false,
    })
    .eq("id", productId)
    .select()
    .single();

  if (error) {
    console.error("Error desactivando producto:", error);
    throw new Error(error.message);
  }

  return mapProduct(data as ProductRow);
}
