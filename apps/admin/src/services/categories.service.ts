import { createClient } from "@/lib/supabase/client";
import type { Category } from "@/types/menu";

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

/**
 * Obtiene todas las categorías visibles para el usuario actual.
 *
 * RLS se encarga de devolver únicamente las categorías
 * del restaurante al que pertenece el usuario.
 */
export async function getCategories(): Promise<Category[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true });

  if (error) {
    console.error("Error obteniendo categorías:", error);
    throw new Error(error.message);
  }

  return ((data ?? []) as CategoryRow[]).map(mapCategory);
}

/**
 * Obtiene únicamente las categorías activas.
 */
export async function getActiveCategories(): Promise<Category[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .eq("is_active", true)
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true });

  if (error) {
    console.error("Error obteniendo categorías activas:", error);
    throw new Error(error.message);
  }

  return ((data ?? []) as CategoryRow[]).map(mapCategory);
}

/**
 * Crear una nueva categoría.
 *
 * restaurant_id se envía explícitamente porque es necesario
 * saber a qué restaurante pertenece el nuevo registro.
 *
 * RLS valida que el usuario tenga permisos sobre ese restaurante.
 */
export async function createCategory(
  restaurantId: string,
  category: {
    name: string;
    sortOrder?: number;
  },
): Promise<Category> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("categories")
    .insert({
      restaurant_id: restaurantId,
      name: category.name.trim(),
      sort_order: category.sortOrder ?? 0,
      is_active: true,
    })
    .select()
    .single();

  if (error) {
    console.error("Error creando categoría:", error);
    throw new Error(error.message);
  }

  return mapCategory(data as CategoryRow);
}

/**
 * Actualizar una categoría.
 */
export async function updateCategory(
  categoryId: string,
  updates: {
    name?: string;
    sortOrder?: number;
    isActive?: boolean;
  },
): Promise<Category> {
  const supabase = createClient();

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

  const { data, error } = await supabase
    .from("categories")
    .update(payload)
    .eq("id", categoryId)
    .select()
    .single();

  if (error) {
    console.error("Error actualizando categoría:", error);
    throw new Error(error.message);
  }

  return mapCategory(data as CategoryRow);
}

/**
 * Activa o desactiva una categoría.
 */
export async function toggleCategoryStatus(
  categoryId: string,
  isActive: boolean,
): Promise<Category> {
  return updateCategory(categoryId, {
    isActive,
  });
}
