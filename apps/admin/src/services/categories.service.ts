import { apiFetch } from "@/lib/api-client";
import type { Category } from "@/types/menu";

type ApiResponse<T> = {
  success: boolean;
  data: T;
  error?: string;
};

type CategoryRow = {
  id: string;
  restaurant_id: string | null;
  name: string;
  sort_order: number | null;
  is_active: boolean;
  created_at: string | null;
  updated_at: string | null;
};

function mapCategory(row: CategoryRow): Category {
  return {
    id: row.id,
    restaurantId: row.restaurant_id ?? "",
    name: row.name,
    sortOrder: row.sort_order ?? 0,
    isActive: row.is_active,
    createdAt: row.created_at ?? undefined,
    updatedAt: row.updated_at ?? undefined,
  };
}

export async function getCategories(
  _restaurantId: string,
): Promise<Category[]> {
  const response = await apiFetch<ApiResponse<CategoryRow[]>>("/categories");

  return (response.data ?? []).map(mapCategory);
}

export async function getActiveCategories(
  _restaurantId: string,
): Promise<Category[]> {
  const response =
    await apiFetch<ApiResponse<CategoryRow[]>>("/categories/active");

  return (response.data ?? []).map(mapCategory);
}

export async function createCategory(
  _restaurantId: string,
  category: {
    name: string;
    sortOrder?: number;
  },
): Promise<Category> {
  const response = await apiFetch<ApiResponse<CategoryRow>>("/categories", {
    method: "POST",
    body: JSON.stringify({
      name: category.name.trim(),
      sort_order: category.sortOrder ?? 0,
    }),
  });

  return mapCategory(response.data);
}

export async function updateCategory(
  categoryId: string,
  updates: {
    name?: string;
    sortOrder?: number;
    isActive?: boolean;
  },
): Promise<Category> {
  const payload: Record<string, unknown> = {};

  if (updates.name !== undefined) {
    payload.name = updates.name.trim();
  }

  if (updates.sortOrder !== undefined) {
    payload.sort_order = updates.sortOrder;
  }

  if (updates.isActive !== undefined) {
    payload.is_active = updates.isActive;
  }

  const response = await apiFetch<ApiResponse<CategoryRow>>(
    `/categories/${encodeURIComponent(categoryId)}`,
    {
      method: "PATCH",
      body: JSON.stringify(payload),
    },
  );

  return mapCategory(response.data);
}

export async function toggleCategoryStatus(
  categoryId: string,
  isActive: boolean,
): Promise<Category> {
  const response = await apiFetch<ApiResponse<CategoryRow>>(
    `/categories/${encodeURIComponent(categoryId)}/status`,
    {
      method: "PATCH",
      body: JSON.stringify({
        is_active: isActive,
      }),
    },
  );

  return mapCategory(response.data);
}

export async function deleteCategory(categoryId: string): Promise<void> {
  await apiFetch<ApiResponse<{ id: string }>>(
    `/categories/${encodeURIComponent(categoryId)}`,
    {
      method: "DELETE",
    },
  );
}
