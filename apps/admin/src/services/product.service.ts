import { apiFetch } from "@/lib/api-client";
import type { Product } from "@/types/menu";

type ApiResponse<T> = {
  success: boolean;
  data: T;
  error?: string;
};

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

export async function getProducts(_restaurantId: string): Promise<Product[]> {
  const response = await apiFetch<ApiResponse<ProductRow[]>>("/products");

  return (response.data ?? []).map(mapProduct);
}

export async function getActiveProducts(
  _restaurantId: string,
): Promise<Product[]> {
  const response =
    await apiFetch<ApiResponse<ProductRow[]>>("/products/active");

  return (response.data ?? []).map(mapProduct);
}

export async function createProduct(
  _restaurantId: string,
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
  const response = await apiFetch<ApiResponse<ProductRow>>("/products", {
    method: "POST",
    body: JSON.stringify({
      category_id: product.categoryId ?? null,
      name: product.name.trim(),
      description: product.description ?? null,
      price: product.price,
      preparation_time_minutes: product.preparationTimeMinutes ?? null,
      image_url: product.imageUrl ?? null,
      is_3d: product.is3d ?? false,
      glb_url: product.glbUrl ?? null,
      usdz_url: product.usdzUrl ?? null,
    }),
  });

  return mapProduct(response.data);
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
  const payload: Record<string, unknown> = {};

  if (updates.categoryId !== undefined) {
    payload.category_id = updates.categoryId;
  }

  if (updates.name !== undefined) {
    payload.name = updates.name.trim();
  }

  if (updates.description !== undefined) {
    payload.description = updates.description;
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

  const response = await apiFetch<ApiResponse<ProductRow>>(
    `/products/${encodeURIComponent(productId)}`,
    {
      method: "PATCH",
      body: JSON.stringify(payload),
    },
  );

  return mapProduct(response.data);
}

export async function toggleProductAvailability(
  productId: string,
  isOutOfStock: boolean,
): Promise<Product> {
  const response = await apiFetch<ApiResponse<ProductRow>>(
    `/products/${encodeURIComponent(productId)}/availability`,
    {
      method: "PATCH",
      body: JSON.stringify({
        is_out_of_stock: isOutOfStock,
      }),
    },
  );

  return mapProduct(response.data);
}

export async function deleteProduct(productId: string): Promise<Product> {
  const response = await apiFetch<ApiResponse<ProductRow>>(
    `/products/${encodeURIComponent(productId)}`,
    {
      method: "DELETE",
    },
  );

  return mapProduct(response.data);
}
