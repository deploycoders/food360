import { Router, type Request, type Response } from "express";
import { supabaseAdmin } from "@food360/database";
import { hasPermission } from "@food360/types";

export const categoriesRouter: Router = Router();

interface CategoryBody {
  name?: unknown;
  sort_order?: unknown;
  is_active?: unknown;
}

function canReadActiveCategories(role: Parameters<typeof hasPermission>[0]) {
  return (
    hasPermission(role, "menu.view") || hasPermission(role, "orders.create")
  );
}

/**
 * GET /api/v1/categories/active
 * Obtener las categorías activas del restaurante.
 * Permite consultarlas a quienes pueden crear comandas.
 */
categoriesRouter.get("/active", async (req: Request, res: Response) => {
  const restaurantId = req.restaurantId;

  if (!restaurantId) {
    return res.status(401).json({
      success: false,
      error: "Restaurant not found in authenticated session",
    });
  }

  if (!canReadActiveCategories(req.userRole)) {
    return res.status(403).json({
      success: false,
      error: "You do not have permission to view active categories",
    });
  }

  try {
    const { data, error } = await supabaseAdmin
      .from("categories")
      .select("*")
      .eq("restaurant_id", restaurantId)
      .eq("is_active", true)
      .order("sort_order", { ascending: true })
      .order("name", { ascending: true });

    if (error) throw error;

    return res.json({
      success: true,
      data: data ?? [],
    });
  } catch (error: unknown) {
    console.error("Error obteniendo categorías activas:", error);

    return res.status(500).json({
      success: false,
      error: "Unable to retrieve active categories",
    });
  }
});

/**
 * GET /api/v1/categories
 * Obtener todas las categorías del restaurante autenticado.
 */
categoriesRouter.get("/", async (req: Request, res: Response) => {
  const restaurantId = req.restaurantId;

  if (!restaurantId) {
    return res.status(401).json({
      success: false,
      error: "Restaurant not found in authenticated session",
    });
  }

  if (!hasPermission(req.userRole, "menu.view")) {
    return res.status(403).json({
      success: false,
      error: "You do not have permission to view categories",
    });
  }

  try {
    const { data, error } = await supabaseAdmin
      .from("categories")
      .select("*")
      .eq("restaurant_id", restaurantId)
      .order("sort_order", { ascending: true })
      .order("name", { ascending: true });

    if (error) throw error;

    return res.json({
      success: true,
      data: data ?? [],
    });
  } catch (error: unknown) {
    console.error("Error obteniendo categorías:", error);

    return res.status(500).json({
      success: false,
      error: "Unable to retrieve categories",
    });
  }
});

/**
 * POST /api/v1/categories
 * Crear una categoría.
 */
categoriesRouter.post("/", async (req: Request, res: Response) => {
  const restaurantId = req.restaurantId;
  const body = (req.body ?? {}) as CategoryBody;

  if (!restaurantId) {
    return res.status(401).json({
      success: false,
      error: "Restaurant not found in authenticated session",
    });
  }

  if (!hasPermission(req.userRole, "categories.manage")) {
    return res.status(403).json({
      success: false,
      error: "You do not have permission to manage categories",
    });
  }

  const name = typeof body.name === "string" ? body.name.trim() : "";
  const sortOrder = body.sort_order === undefined ? 0 : body.sort_order;

  if (!name) {
    return res.status(400).json({
      success: false,
      error: "Category name is required",
    });
  }

  if (
    typeof sortOrder !== "number" ||
    !Number.isSafeInteger(sortOrder) ||
    sortOrder < 0
  ) {
    return res.status(400).json({
      success: false,
      error: "sort_order must be a non-negative integer",
    });
  }

  try {
    const { data, error } = await supabaseAdmin
      .from("categories")
      .insert({
        restaurant_id: restaurantId,
        name,
        sort_order: sortOrder,
        is_active: true,
      })
      .select("*")
      .single();

    if (error) throw error;

    return res.status(201).json({
      success: true,
      data,
    });
  } catch (error: unknown) {
    console.error("Error creando categoría:", error);

    return res.status(500).json({
      success: false,
      error: "Unable to create category",
    });
  }
});

/**
 * PATCH /api/v1/categories/:id
 * Actualizar nombre, orden o estado.
 */
categoriesRouter.patch("/:id", async (req: Request, res: Response) => {
  const restaurantId = req.restaurantId;
  const { id } = req.params;
  const body = (req.body ?? {}) as CategoryBody;

  if (!restaurantId) {
    return res.status(401).json({
      success: false,
      error: "Restaurant not found in authenticated session",
    });
  }

  if (!hasPermission(req.userRole, "categories.manage")) {
    return res.status(403).json({
      success: false,
      error: "You do not have permission to manage categories",
    });
  }

  const payload: Record<string, unknown> = {};

  if ("name" in body) {
    if (typeof body.name !== "string" || !body.name.trim()) {
      return res.status(400).json({
        success: false,
        error: "Category name cannot be empty",
      });
    }

    payload.name = body.name.trim();
  }

  if ("sort_order" in body) {
    if (
      typeof body.sort_order !== "number" ||
      !Number.isSafeInteger(body.sort_order) ||
      body.sort_order < 0
    ) {
      return res.status(400).json({
        success: false,
        error: "sort_order must be a non-negative integer",
      });
    }

    payload.sort_order = body.sort_order;
  }

  if ("is_active" in body) {
    if (typeof body.is_active !== "boolean") {
      return res.status(400).json({
        success: false,
        error: "is_active must be a boolean",
      });
    }

    payload.is_active = body.is_active;
  }

  if (Object.keys(payload).length === 0) {
    return res.status(400).json({
      success: false,
      error: "At least one valid field is required",
    });
  }

  try {
    const { data, error } = await supabaseAdmin
      .from("categories")
      .update(payload)
      .eq("id", id)
      .eq("restaurant_id", restaurantId)
      .select("*")
      .maybeSingle();

    if (error) throw error;

    if (!data) {
      return res.status(404).json({
        success: false,
        error: "Category not found",
      });
    }

    return res.json({
      success: true,
      data,
    });
  } catch (error: unknown) {
    console.error("Error actualizando categoría:", error);

    return res.status(500).json({
      success: false,
      error: "Unable to update category",
    });
  }
});

/**
 * PATCH /api/v1/categories/:id/status
 * Activar o desactivar categoría.
 */
categoriesRouter.patch("/:id/status", async (req: Request, res: Response) => {
  const restaurantId = req.restaurantId;
  const { id } = req.params;
  const { is_active } = req.body as {
    is_active?: unknown;
  };

  if (!restaurantId) {
    return res.status(401).json({
      success: false,
      error: "Restaurant not found in authenticated session",
    });
  }

  if (!hasPermission(req.userRole, "categories.manage")) {
    return res.status(403).json({
      success: false,
      error: "You do not have permission to manage categories",
    });
  }

  if (typeof is_active !== "boolean") {
    return res.status(400).json({
      success: false,
      error: "is_active must be a boolean",
    });
  }

  try {
    const { data, error } = await supabaseAdmin
      .from("categories")
      .update({ is_active })
      .eq("id", id)
      .eq("restaurant_id", restaurantId)
      .select("*")
      .maybeSingle();

    if (error) throw error;

    if (!data) {
      return res.status(404).json({
        success: false,
        error: "Category not found",
      });
    }

    return res.json({
      success: true,
      data,
    });
  } catch (error: unknown) {
    console.error("Error cambiando estado de categoría:", error);

    return res.status(500).json({
      success: false,
      error: "Unable to update category status",
    });
  }
});

/**
 * DELETE /api/v1/categories/:id
 * Eliminar categoría únicamente si no tiene productos asociados.
 */
categoriesRouter.delete("/:id", async (req: Request, res: Response) => {
  const restaurantId = req.restaurantId;
  const { id } = req.params;

  if (!restaurantId) {
    return res.status(401).json({
      success: false,
      error: "Restaurant not found in authenticated session",
    });
  }

  if (!hasPermission(req.userRole, "categories.manage")) {
    return res.status(403).json({
      success: false,
      error: "You do not have permission to manage categories",
    });
  }

  try {
    // Evitar eliminar una categoría que todavía tiene productos.
    const { count, error: productsError } = await supabaseAdmin
      .from("products")
      .select("id", { count: "exact", head: true })
      .eq("restaurant_id", restaurantId)
      .eq("category_id", id);

    if (productsError) throw productsError;

    if ((count ?? 0) > 0) {
      return res.status(409).json({
        success: false,
        error:
          "This category has products assigned. Reassign those products before deleting it.",
      });
    }

    const { data, error } = await supabaseAdmin
      .from("categories")
      .delete()
      .eq("id", id)
      .eq("restaurant_id", restaurantId)
      .select("id")
      .maybeSingle();

    if (error) throw error;

    if (!data) {
      return res.status(404).json({
        success: false,
        error: "Category not found",
      });
    }

    return res.json({
      success: true,
      data: { id: data.id },
    });
  } catch (error: unknown) {
    console.error("Error eliminando categoría:", error);

    return res.status(500).json({
      success: false,
      error: "Unable to delete category",
    });
  }
});
