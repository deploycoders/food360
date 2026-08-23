import { Router, type Request, type Response } from "express";
import { supabaseAdmin } from "@food360/database";

export const ordersRouter: Router = Router();

type CreateOrderItem = Record<string, unknown>;

interface CreateOrderBody {
  restaurant_id?: string;
  phone?: string;
  full_name?: string;
  origin?: string;
  total_amount?: number;
  items?: CreateOrderItem[];
}

const isCreateOrderBody = (
  body: CreateOrderBody,
): body is Required<CreateOrderBody> =>
  Boolean(
    body.restaurant_id &&
      body.phone &&
      body.full_name &&
      body.origin &&
      typeof body.total_amount === "number" &&
      Array.isArray(body.items),
  );

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

  if (!isCreateOrderBody(body)) {
    return res.status(400).json({
      success: false,
      error:
        "restaurant_id, phone, full_name, origin, total_amount and items are required",
    });
  }

  const { restaurant_id, phone, full_name, origin, total_amount, items } = body;

  try {
    let customerId: string | null = null;

    const { data: existingCustomer } = await supabaseAdmin
      .from("customers")
      .select("id")
      .eq("restaurant_id", restaurant_id)
      .eq("phone", phone)
      .maybeSingle();

    if (existingCustomer) {
      customerId = existingCustomer.id;
    } else {
      const { data: newCustomer, error: newCustomerError } = await supabaseAdmin
        .from("customers")
        .insert({ restaurant_id, phone, full_name })
        .select("id")
        .single();

      if (newCustomerError) throw newCustomerError;
      customerId = newCustomer.id;
    }

    const { data: order, error: orderError } = await supabaseAdmin
      .from("orders")
      .insert({
        restaurant_id,
        customer_id: customerId,
        origin,
        total_amount,
        status: "PENDING",
      })
      .select("id")
      .single();

    if (orderError) throw orderError;

    const orderItems = items.map((item) => ({
      ...item,
      order_id: order.id,
    }));

    const { error: orderItemsError } = await supabaseAdmin
      .from("order_items")
      .insert(orderItems);

    if (orderItemsError) throw orderItemsError;

    return res.status(201).json({ success: true, order_id: order.id });
  } catch (error: any) {
    console.error("Error al crear la orden:", error);
    return res.status(500).json({
      success: false,
      error: error?.message || "Unable to create order",
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
  const restaurant_id = req.query.restaurant_id as string;

  if (!restaurant_id) {
    return res
      .status(400)
      .json({ success: false, error: "restaurant_id query param is required" });
  }

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
ordersRouter.patch("/:id/status", async (req: Request, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!status) {
    return res
      .status(400)
      .json({ success: false, error: "status is required" });
  }

  try {
    const { data, error } = await supabaseAdmin
      .from("orders")
      .update({ status })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    return res.json({ success: true, order: data });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error?.message });
  }
});
