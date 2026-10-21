import { Router, type Request, type Response } from "express";
import { supabaseAdmin } from "@food360/database";
import { hasPermission } from "@food360/types";

export const productsRouter: Router = Router();

interface ProductBody {
  category_id?: unknown;
  name?: unknown;
  description?: unknown;
  price?: unknown;
  preparation_time_minutes?: unknown;
  image_url?: unknown;
  is_3d?: unknown;
  glb_url?: unknown;
  usdz_url?: unknown;
  is_active?: unknown;
  is_out_of_stock?: unknown;
  deactivation_reason?: unknown;
}

function isNullableString(value: unknown): value is string | null {
  return value === null || typeof value === "string";
}

function canReadActiveMenu(role: Parameters<typeof hasPermission>[0]) {
  return (
    hasPermission(role, "menu.view") || hasPermission(role, "orders.create")
  );
}

async function categoryBelongsToRestaurant(
  categoryId: string,
  restaurantId: string,
): Promise<boolean> {
  const { data, error } = await supabaseAdmin
    .from("categories")
    .select("id")
    .eq("id", categoryId)
    .eq("restaurant_id", restaurantId)
    .maybeSingle();

  if (error) throw error;

  return Boolean(data);
}

/**
 * GET /api/v1/products/active
 * Productos activos de categorías activas.
 * Permite consultar el menú a quienes pueden crear comandas.
 */
productsRouter.get("/active", async (req: Request, res: Response) => {
  const restaurantId = req.restaurantId;

  if (!restaurantId) {
    return res.status(401).json({
      success: false,
      error: "Restaurant not found in authenticated session",
    });
  }

  if (!canReadActiveMenu(req.userRole)) {
    return res.status(403).json({
      success: false,
      error: "You do not have permission to view active products",
    });
  }

  try {
    const { data, error } = await supabaseAdmin
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

    if (error) throw error;

    return res.json({
      success: true,
      data: data ?? [],
    });
  } catch (error: unknown) {
    console.error("Error obteniendo productos activos:", error);

    return res.status(500).json({
      success: false,
      error: "Unable to retrieve active products",
    });
  }
});

/**
 * GET /api/v1/products
 * Todos los productos del restaurante autenticado.
 */
productsRouter.get("/", async (req: Request, res: Response) => {
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
      error: "You do not have permission to view products",
    });
  }

  try {
    const { data, error } = await supabaseAdmin
      .from("products")
      .select("*")
      .eq("restaurant_id", restaurantId)
      .order("name", { ascending: true });

    if (error) throw error;

    return res.json({
      success: true,
      data: data ?? [],
    });
  } catch (error: unknown) {
    console.error("Error obteniendo productos:", error);

    return res.status(500).json({
      success: false,
      error: "Unable to retrieve products",
    });
  }
});

/**
 * POST /api/v1/products
 * Crear producto.
 */
productsRouter.post("/", async (req: Request, res: Response) => {
  const restaurantId = req.restaurantId;
  const body = (req.body ?? {}) as ProductBody;

  if (!restaurantId) {
    return res.status(401).json({
      success: false,
      error: "Restaurant not found in authenticated session",
    });
  }

  if (!hasPermission(req.userRole, "menu.create")) {
    return res.status(403).json({
      success: false,
      error: "You do not have permission to create products",
    });
  }

  const name = typeof body.name === "string" ? body.name.trim() : "";
  const price = body.price;

  const categoryId = body.category_id === undefined ? null : body.category_id;
  const description = body.description === undefined ? null : body.description;
  const preparationTime =
    body.preparation_time_minutes === undefined
      ? null
      : body.preparation_time_minutes;

  const imageUrl = body.image_url === undefined ? null : body.image_url;
  const is3d = body.is_3d === undefined ? false : body.is_3d;
  const glbUrl = body.glb_url === undefined ? null : body.glb_url;
  const usdzUrl = body.usdz_url === undefined ? null : body.usdz_url;

  if (!name) {
    return res.status(400).json({
      success: false,
      error: "Product name is required",
    });
  }

  if (typeof price !== "number" || !Number.isFinite(price) || price < 0) {
    return res.status(400).json({
      success: false,
      error: "Price must be a valid non-negative number",
    });
  }

  if (categoryId !== null && typeof categoryId !== "string") {
    return res.status(400).json({
      success: false,
      error: "Invalid category_id",
    });
  }

  if (
    !isNullableString(description) ||
    !isNullableString(imageUrl) ||
    !isNullableString(glbUrl) ||
    !isNullableString(usdzUrl)
  ) {
    return res.status(400).json({
      success: false,
      error: "Description and media fields must be strings or null",
    });
  }

  if (
    preparationTime !== null &&
    (typeof preparationTime !== "number" ||
      !Number.isSafeInteger(preparationTime) ||
      preparationTime < 0)
  ) {
    return res.status(400).json({
      success: false,
      error: "preparation_time_minutes must be a non-negative integer or null",
    });
  }

  if (typeof is3d !== "boolean") {
    return res.status(400).json({
      success: false,
      error: "is_3d must be a boolean",
    });
  }

  try {
    if (
      typeof categoryId === "string" &&
      !(await categoryBelongsToRestaurant(categoryId, restaurantId))
    ) {
      return res.status(400).json({
        success: false,
        error: "The selected category does not belong to this restaurant",
      });
    }

    const { data, error } = await supabaseAdmin
      .from("products")
      .insert({
        restaurant_id: restaurantId,
        category_id: categoryId,
        name,
        description:
          typeof description === "string" ? description.trim() || null : null,
        price,
        preparation_time_minutes: preparationTime,
        image_url: imageUrl,
        is_3d: is3d,
        glb_url: glbUrl,
        usdz_url: usdzUrl,
        is_active: true,
        is_out_of_stock: false,
        deactivation_reason: null,
      })
      .select("*")
      .single();

    if (error) throw error;

    return res.status(201).json({
      success: true,
      data,
    });
  } catch (error: unknown) {
    console.error("Error creando producto:", error);

    return res.status(500).json({
      success: false,
      error: "Unable to create product",
    });
  }
});

/**
 * PATCH /api/v1/products/:id
 * Actualizar producto.
 */
productsRouter.patch("/:id", async (req: Request, res: Response) => {
  const restaurantId = req.restaurantId;
  const { id } = req.params;
  const body = (req.body ?? {}) as ProductBody;

  if (!restaurantId) {
    return res.status(401).json({
      success: false,
      error: "Restaurant not found in authenticated session",
    });
  }

  if (!hasPermission(req.userRole, "menu.update")) {
    return res.status(403).json({
      success: false,
      error: "You do not have permission to update products",
    });
  }

  const payload: Record<string, unknown> = {};

  if ("name" in body) {
    if (typeof body.name !== "string" || !body.name.trim()) {
      return res.status(400).json({
        success: false,
        error: "Product name cannot be empty",
      });
    }

    payload.name = body.name.trim();
  }

  if ("category_id" in body) {
    if (body.category_id !== null && typeof body.category_id !== "string") {
      return res.status(400).json({
        success: false,
        error: "Invalid category_id",
      });
    }

    payload.category_id = body.category_id;
  }

  if ("description" in body) {
    if (!isNullableString(body.description)) {
      return res.status(400).json({
        success: false,
        error: "description must be a string or null",
      });
    }

    payload.description =
      typeof body.description === "string"
        ? body.description.trim() || null
        : null;
  }

  if ("price" in body) {
    if (
      typeof body.price !== "number" ||
      !Number.isFinite(body.price) ||
      body.price < 0
    ) {
      return res.status(400).json({
        success: false,
        error: "Price must be a valid non-negative number",
      });
    }

    payload.price = body.price;
  }

  if ("preparation_time_minutes" in body) {
    const value = body.preparation_time_minutes;

    if (
      value !== null &&
      (typeof value !== "number" || !Number.isSafeInteger(value) || value < 0)
    ) {
      return res.status(400).json({
        success: false,
        error:
          "preparation_time_minutes must be a non-negative integer or null",
      });
    }

    payload.preparation_time_minutes = value;
  }

  if ("image_url" in body) {
    if (!isNullableString(body.image_url)) {
      return res.status(400).json({
        success: false,
        error: "image_url must be a string or null",
      });
    }

    payload.image_url = body.image_url;
  }

  if ("glb_url" in body) {
    if (!isNullableString(body.glb_url)) {
      return res.status(400).json({
        success: false,
        error: "glb_url must be a string or null",
      });
    }

    payload.glb_url = body.glb_url;
  }

  if ("usdz_url" in body) {
    if (!isNullableString(body.usdz_url)) {
      return res.status(400).json({
        success: false,
        error: "usdz_url must be a string or null",
      });
    }

    payload.usdz_url = body.usdz_url;
  }

  if ("deactivation_reason" in body) {
    if (!isNullableString(body.deactivation_reason)) {
      return res.status(400).json({
        success: false,
        error: "deactivation_reason must be a string or null",
      });
    }

    payload.deactivation_reason = body.deactivation_reason;
  }

  if ("is_3d" in body) {
    if (typeof body.is_3d !== "boolean") {
      return res.status(400).json({
        success: false,
        error: "is_3d must be a boolean",
      });
    }

    payload.is_3d = body.is_3d;
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

  if ("is_out_of_stock" in body) {
    if (typeof body.is_out_of_stock !== "boolean") {
      return res.status(400).json({
        success: false,
        error: "is_out_of_stock must be a boolean",
      });
    }

    payload.is_out_of_stock = body.is_out_of_stock;
  }

  if (Object.keys(payload).length === 0) {
    return res.status(400).json({
      success: false,
      error: "At least one valid field is required",
    });
  }

  try {
    if (
      typeof payload.category_id === "string" &&
      !(await categoryBelongsToRestaurant(payload.category_id, restaurantId))
    ) {
      return res.status(400).json({
        success: false,
        error: "The selected category does not belong to this restaurant",
      });
    }

    const { data, error } = await supabaseAdmin
      .from("products")
      .update(payload)
      .eq("id", id)
      .eq("restaurant_id", restaurantId)
      .select("*")
      .maybeSingle();

    if (error) throw error;

    if (!data) {
      return res.status(404).json({
        success: false,
        error: "Product not found",
      });
    }

    return res.json({
      success: true,
      data,
    });
  } catch (error: unknown) {
    console.error("Error actualizando producto:", error);

    return res.status(500).json({
      success: false,
      error: "Unable to update product",
    });
  }
});

/**
 * PATCH /api/v1/products/:id/availability
 * Cambiar disponibilidad del producto.
 */
productsRouter.patch(
  "/:id/availability",
  async (req: Request, res: Response) => {
    const restaurantId = req.restaurantId;
    const { id } = req.params;
    const { is_out_of_stock } = req.body as {
      is_out_of_stock?: unknown;
    };

    if (!restaurantId) {
      return res.status(401).json({
        success: false,
        error: "Restaurant not found in authenticated session",
      });
    }

    if (!hasPermission(req.userRole, "menu.update")) {
      return res.status(403).json({
        success: false,
        error: "You do not have permission to update product availability",
      });
    }

    if (typeof is_out_of_stock !== "boolean") {
      return res.status(400).json({
        success: false,
        error: "is_out_of_stock must be a boolean",
      });
    }

    try {
      const { data, error } = await supabaseAdmin
        .from("products")
        .update({ is_out_of_stock })
        .eq("id", id)
        .eq("restaurant_id", restaurantId)
        .select("*")
        .maybeSingle();

      if (error) throw error;

      if (!data) {
        return res.status(404).json({
          success: false,
          error: "Product not found",
        });
      }

      return res.json({
        success: true,
        data,
      });
    } catch (error: unknown) {
      console.error("Error cambiando disponibilidad del producto:", error);

      return res.status(500).json({
        success: false,
        error: "Unable to update product availability",
      });
    }
  },
);

/**
 * DELETE /api/v1/products/:id
 * Desactivar producto, sin borrarlo físicamente.
 */
productsRouter.delete("/:id", async (req: Request, res: Response) => {
  const restaurantId = req.restaurantId;
  const { id } = req.params;

  if (!restaurantId) {
    return res.status(401).json({
      success: false,
      error: "Restaurant not found in authenticated session",
    });
  }

  if (!hasPermission(req.userRole, "menu.delete")) {
    return res.status(403).json({
      success: false,
      error: "You do not have permission to delete products",
    });
  }

  try {
    const { data, error } = await supabaseAdmin
      .from("products")
      .update({ is_active: false })
      .eq("id", id)
      .eq("restaurant_id", restaurantId)
      .select("*")
      .maybeSingle();

    if (error) throw error;

    if (!data) {
      return res.status(404).json({
        success: false,
        error: "Product not found",
      });
    }

    return res.json({
      success: true,
      data,
    });
  } catch (error: unknown) {
    console.error("Error desactivando producto:", error);

    return res.status(500).json({
      success: false,
      error: "Unable to deactivate product",
    });
  }
});
