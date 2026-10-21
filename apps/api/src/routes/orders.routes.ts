import { Router, type Request, type Response } from "express";
import { supabaseAdmin } from "@food360/database";
import { hasPermission } from "@food360/types";

export const ordersRouter: Router = Router();

interface CreateOrderItemInput {
  product_id: string;
  quantity: number;
}

interface CreateOrderBody {
  phone?: string;
  full_name?: string;
  origin?: string;
  table_id?: string | null;
  items?: CreateOrderItemInput[];
}

/**
 * @openapi
 * /api/v1/orders:
 *   post:
 *     summary: Crear una nueva orden
 *     tags:
 *       - Orders
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - restaurant_id
 *               - phone
 *               - full_name
 *               - origin
 *               - total_amount
 *               - items
 *             properties:
 *               restaurant_id:
 *                 type: string
 *                 example: d79e889e-fa24-4303-adb0-a6da1cf8abdd
 *               phone:
 *                 type: string
 *                 example: "+584120000000"
 *               full_name:
 *                 type: string
 *                 example: Cliente Prueba
 *               origin:
 *                 type: string
 *                 example: DINE_IN
 *               total_amount:
 *                 type: number
 *                 example: 24.50
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     product_id:
 *                       type: string
 *                       example: 04f5fa2b-608a-4e4e-898b-550afcf0a19e
 *                     quantity:
 *                       type: integer
 *                       example: 2
 *                     unit_price:
 *                       type: number
 *                       example: 12.25
 *     responses:
 *       201:
 *         description: Orden creada exitosamente
 *       400:
 *         description: Faltan campos requeridos
 *       500:
 *         description: Error interno del servidor
 */

ordersRouter.post("/", async (req: Request, res: Response) => {
  const body = req.body as CreateOrderBody;

  const restaurantId = req.restaurantId;
  const { phone, full_name, origin, table_id, items } = body;

  if (!hasPermission(req.userRole, "orders.create")) {
    return res.status(403).json({
      success: false,
      error: "You do not have permission to create orders",
    });
  }

  if (
    !restaurantId ||
    typeof phone !== "string" ||
    !phone.trim() ||
    typeof full_name !== "string" ||
    !full_name.trim() ||
    typeof origin !== "string" ||
    !origin.trim() ||
    !Array.isArray(items) ||
    items.length === 0
  ) {
    return res.status(400).json({
      success: false,
      error: "phone, full_name, origin and items are required",
    });
  }

  const normalizedOrigin = origin.trim().toUpperCase();

  const allowedOrigins = new Set(["DINE_IN", "TAKEAWAY", "DELIVERY"]);

  if (!allowedOrigins.has(normalizedOrigin)) {
    return res.status(400).json({
      success: false,
      error: "Invalid order origin",
      allowed_origins: Array.from(allowedOrigins),
    });
  }

  // Solo los pedidos en mesa pueden tener table_id.
  // Los otros orígenes siempre se guardan con table_id = null.
  let tableId: string | null = null;

  if (normalizedOrigin === "DINE_IN") {
    const uuidPattern =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

    if (typeof table_id !== "string" || !uuidPattern.test(table_id.trim())) {
      return res.status(400).json({
        success: false,
        error: "A valid table_id is required for DINE_IN orders",
      });
    }

    tableId = table_id.trim();
  }

  const invalidItem = items.some(
    (item) =>
      !item ||
      typeof item.product_id !== "string" ||
      !item.product_id.trim() ||
      !Number.isSafeInteger(item.quantity) ||
      item.quantity <= 0,
  );

  if (invalidItem) {
    return res.status(400).json({
      success: false,
      error: "Each item must have a product_id and a positive integer quantity",
    });
  }

  try {
    // Verificar que la mesa exista y pertenezca al restaurante
    // asociado a la sesión autenticada.
    if (tableId) {
      const { data: selectedTable, error: tableError } = await supabaseAdmin
        .from("tables")
        .select("id")
        .eq("id", tableId)
        .eq("restaurant_id", restaurantId)
        .maybeSingle();

      if (tableError) throw tableError;

      if (!selectedTable) {
        return res.status(400).json({
          success: false,
          error: "The selected table does not belong to this restaurant",
        });
      }
    }

    // Consultar los productos en la base de datos.
    // El cliente no decide los precios definitivos.
    const productIds = Array.from(
      new Set(items.map((item) => item.product_id)),
    );

    const { data: products, error: productsError } = await supabaseAdmin
      .from("products")
      .select("id, restaurant_id, name, price, is_active, is_out_of_stock")
      .eq("restaurant_id", restaurantId)
      .in("id", productIds);

    if (productsError) throw productsError;

    if (!products || products.length !== productIds.length) {
      return res.status(400).json({
        success: false,
        error: "One or more products do not belong to this restaurant",
      });
    }

    const productMap = new Map(
      products.map((product) => [product.id, product]),
    );

    for (const item of items) {
      const product = productMap.get(item.product_id);

      if (!product) {
        return res.status(400).json({
          success: false,
          error: "Product not found",
        });
      }

      if (!product.is_active || product.is_out_of_stock) {
        return res.status(400).json({
          success: false,
          error: `Product "${product.name}" is inactive or out of stock`,
        });
      }

      if (
        !Number.isFinite(Number(product.price)) ||
        Number(product.price) < 0
      ) {
        return res.status(400).json({
          success: false,
          error: `Product "${product.name}" has an invalid price`,
        });
      }
    }

    const orderItems = items.map((item) => {
      const product = productMap.get(item.product_id)!;

      return {
        product_id: product.id,
        product_name: product.name,
        quantity: item.quantity,
        unit_price: Number(product.price),
      };
    });

    const totalAmount = orderItems.reduce(
      (total, item) => total + item.unit_price * item.quantity,
      0,
    );

    // Buscar o crear el cliente dentro del restaurante autenticado.
    const normalizedPhone = phone.trim();

    const { data: existingCustomer, error: customerLookupError } =
      await supabaseAdmin
        .from("customers")
        .select("id")
        .eq("restaurant_id", restaurantId)
        .eq("phone", normalizedPhone)
        .maybeSingle();

    if (customerLookupError) throw customerLookupError;

    let customerId = existingCustomer?.id ?? null;

    if (!customerId) {
      const { data: newCustomer, error: customerInsertError } =
        await supabaseAdmin
          .from("customers")
          .insert({
            restaurant_id: restaurantId,
            phone: normalizedPhone,
            full_name: full_name.trim(),
          })
          .select("id")
          .single();

      if (customerInsertError) throw customerInsertError;

      customerId = newCustomer.id;
    }

    // Guardar el identificador de la mesa junto al pedido.
    const { data: order, error: orderError } = await supabaseAdmin
      .from("orders")
      .insert({
        restaurant_id: restaurantId,
        customer_id: customerId,
        table_id: tableId,
        origin: normalizedOrigin,
        total_amount: totalAmount,
        status: "PENDING",
      })
      .select("id, table_id, origin, status, total_amount")
      .single();

    if (orderError) throw orderError;

    // Insertar los artículos del pedido.
    const { error: itemsError } = await supabaseAdmin
      .from("order_items")
      .insert(
        orderItems.map((item) => ({
          ...item,
          order_id: order.id,
        })),
      );

    if (itemsError) {
      // Si falla la inserción de artículos, eliminar el pedido
      // incompleto para no dejarlo sin sus líneas.
      const { error: rollbackError } = await supabaseAdmin
        .from("orders")
        .delete()
        .eq("id", order.id)
        .eq("restaurant_id", restaurantId);

      if (rollbackError) {
        console.error("Error al revertir la orden incompleta:", rollbackError);
      }

      throw itemsError;
    }

    return res.status(201).json({
      success: true,
      order_id: order.id,
      table_id: order.table_id,
      origin: order.origin,
      status: order.status,
      total_amount: Number(order.total_amount),
    });
  } catch (error: unknown) {
    console.error("Error al crear la orden:", error);

    return res.status(500).json({
      success: false,
      error: "Unable to create order",
    });
  }
});

/**
 * @openapi
 * /api/v1/orders:
 *   get:
 *     summary: Obtener lista de órdenes de un restaurante
 *     tags:
 *       - Orders
 *     parameters:
 *       - in: query
 *         name: restaurant_id
 *         required: true
 *         schema:
 *           type: string
 *         example: d79e889e-fa24-4303-adb0-a6da1cf8abdd
 *     responses:
 *       200:
 *         description: Lista de órdenes devuelta con éxito
 *       400:
 *         description: El parámetro restaurant_id es obligatorio
 *       500:
 *         description: Error interno del servidor
 */
ordersRouter.get("/", async (req: Request, res: Response) => {
  const restaurant_id = req.restaurantId;

  try {
    const { data: orders, error } = await supabaseAdmin
      .from("orders")
      .select("*, customers(*), order_items(*)")
      .eq("restaurant_id", restaurant_id)
      .order("created_at", { ascending: false });

    if (error) throw error;

    return res.json({ success: true, data: orders });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error?.message });
  }
});

ordersRouter.get("/:id", async (req: Request, res: Response) => {
  const { id } = req.params;
  const restaurantId = req.restaurantId;

  try {
    const { data: order, error } = await supabaseAdmin
      .from("orders")
      .select("*, customers(*), order_items(*)")
      .eq("id", id)
      .eq("restaurant_id", restaurantId)
      .maybeSingle();

    if (error) throw error;

    if (!order) {
      return res.status(404).json({
        success: false,
        error: "Order not found",
      });
    }

    return res.json({
      success: true,
      data: order,
    });
  } catch (error: unknown) {
    console.error("Error al obtener la orden:", error);

    return res.status(500).json({
      success: false,
      error: "Unable to retrieve order",
    });
  }
});

/**
 * @openapi
 * /api/v1/orders/{id}/status:
 *   patch:
 *     summary: Cambiar el estado de una orden
 *     tags:
 *       - Orders
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         example: 2c4e35aa-e892-4522-86c9-e74c15c49ca9
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 example: COMPLETED
 *     responses:
 *       200:
 *         description: Estado de la orden actualizado exitosamente
 *       400:
 *         description: El estado es requerido
 *       500:
 *         description: Error interno del servidor
 */

const ORDER_STATUSES = [
  "PENDING",
  "CONFIRMED",
  "IN_PROGRESS",
  "READY",
  "SERVED",
  "COMPLETED",
  "CANCELLED",
] as const;

ordersRouter.patch("/:id/status", async (req: Request, res: Response) => {
  const { id } = req.params;
  const { status } = req.body as { status?: string };
  const restaurantId = req.restaurantId;

  if (
    typeof status !== "string" ||
    !ORDER_STATUSES.includes(status as (typeof ORDER_STATUSES)[number])
  ) {
    return res.status(400).json({
      success: false,
      error: "Invalid or missing order status",
      allowed_statuses: ORDER_STATUSES,
    });
  }

  try {
    const { data: order, error } = await supabaseAdmin
      .from("orders")
      .update({ status })
      .eq("id", id)
      .eq("restaurant_id", restaurantId)
      .select("*, customers(*), order_items(*)")
      .maybeSingle();

    if (error) throw error;

    if (!order) {
      return res.status(404).json({
        success: false,
        error: "Order not found",
      });
    }

    return res.json({
      success: true,
      data: order,
    });
  } catch (error: unknown) {
    console.error("Error al actualizar la orden:", error);

    return res.status(500).json({
      success: false,
      error: "Unable to update order",
    });
  }
});
