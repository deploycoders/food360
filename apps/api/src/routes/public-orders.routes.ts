import { Router, type Request, type Response } from "express";
import { createRateLimiter } from "../lib/rate-limiter.js";
import {
  validateAndNormalizeOrderInput,
  executeCreatePublicOrder,
} from "../lib/public-order.js";

export const publicOrdersRouter: Router = Router();

// Rate limiter: 30 requests per minute per IP for public order creation
export const orderRateLimiter = createRateLimiter({
  windowMs: 60_000,
  max: 30,
  message:
    "Demasiadas solicitudes de creación de órdenes. Por favor intente más tarde.",
});

/**
 * @openapi
 * /api/v1/public/orders:
 *   post:
 *     summary: Crear una orden pública desde la carta digital
 *     tags:
 *       - Public Orders
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - restaurant_public_id
 *               - full_name
 *               - phone
 *               - origin
 *               - items
 *             properties:
 *               restaurant_public_id:
 *                 type: string
 *                 format: uuid
 *                 example: "d79e889e-fa24-4303-adb0-a6da1cf8abdd"
 *               full_name:
 *                 type: string
 *                 example: "Cliente de prueba"
 *               phone:
 *                 type: string
 *                 example: "04141234567"
 *               origin:
 *                 type: string
 *                 enum: [DINE_IN, TAKEAWAY, DELIVERY]
 *                 example: "DINE_IN"
 *               table_public_code:
 *                 type: string
 *                 example: "t_SG-yedFvKz4"
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - product_id
 *                     - quantity
 *                   properties:
 *                     product_id:
 *                       type: string
 *                       format: uuid
 *                       example: "04f5fa2b-608a-4e4e-898b-550afcf0a19e"
 *                     quantity:
 *                       type: integer
 *                       example: 2
 *     responses:
 *       201:
 *         description: Orden creada exitosamente
 *       400:
 *         description: Datos de la solicitud inválidos o faltantes
 *       404:
 *         description: Restaurante, mesa o productos no encontrados
 *       409:
 *         description: Conflicto por producto inactivo o agotado
 *       429:
 *         description: Límite de tasa superado
 *       500:
 *         description: Error interno del servidor
 *       503:
 *         description: Servicio no disponible o esquema no preparado
 */
publicOrdersRouter.post(
  "/",
  orderRateLimiter,
  async (req: Request, res: Response) => {
    res.set("Cache-Control", "no-store");

    const validation = validateAndNormalizeOrderInput(req.body);
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        error: validation.error,
      });
    }

    try {
      const result = await executeCreatePublicOrder(validation.data);
      return res.status(result.status).json(result.body);
    } catch (error) {
      console.error("Error inesperado en POST /api/v1/public/orders:", error);
      return res.status(500).json({
        success: false,
        error: "No se pudo procesar el pedido",
      });
    }
  },
);
