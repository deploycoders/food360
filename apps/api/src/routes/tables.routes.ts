import { Router, type Request, type Response } from "express";

import { supabaseAdmin } from "@food360/database";

import { requireRole } from "../../middleware.ts";

export const tablesRouter: Router = Router();

tablesRouter.get("/", async (req: Request, res: Response) => {
  const restaurant_id = req.restaurantId;

  try {
    const { data: tables, error } = await supabaseAdmin
      .from("tables")
      .select("*")
      .eq("restaurant_id", restaurant_id)
      .order("table_number", { ascending: true });

    if (error) throw error;

    return res.json({
      success: true,
      data: tables,
    });
  } catch (error: any) {
    console.error("Error obteniendo mesas:", error);

    return res.status(500).json({
      success: false,
      error: error?.message ?? "No se pudieron obtener las mesas",
    });
  }
});

tablesRouter.post(
  "/",
  requireRole(["owner", "admin"]),
  async (req: Request, res: Response) => {
    const restaurant_id = req.restaurantId;
    const { table_number } = req.body;

    if (
      typeof table_number !== "number" ||
      !Number.isInteger(table_number) ||
      table_number <= 0
    ) {
      return res.status(400).json({
        success: false,
        error: "table_number must be a positive integer",
      });
    }

    try {
      const { data: table, error } = await supabaseAdmin
        .from("tables")
        .insert({
          restaurant_id,
          table_number,
        })
        .select("*")
        .single();

      if (error) throw error;

      return res.status(201).json({
        success: true,
        data: table,
      });
    } catch (error: any) {
      console.error("Error creando mesa:", error);

      return res.status(500).json({
        success: false,
        error: error?.message ?? "No se pudo crear la mesa",
      });
    }
  },
);

tablesRouter.patch(
  "/:id",
  requireRole(["owner", "admin"]),
  async (req: Request, res: Response) => {
    const restaurant_id = req.restaurantId;
    const { id } = req.params;
    const { table_number } = req.body;

    if (
      typeof table_number !== "number" ||
      !Number.isInteger(table_number) ||
      table_number <= 0
    ) {
      return res.status(400).json({
        success: false,
        error: "table_number must be a positive integer",
      });
    }

    try {
      const { data: table, error } = await supabaseAdmin
        .from("tables")
        .update({
          table_number,
        })
        .eq("id", id)
        .eq("restaurant_id", restaurant_id)
        .select("*")
        .single();

      if (error) throw error;

      return res.json({
        success: true,
        data: table,
      });
    } catch (error: any) {
      console.error("Error actualizando mesa:", error);

      return res.status(500).json({
        success: false,
        error: error?.message ?? "No se pudo actualizar la mesa",
      });
    }
  },
);

tablesRouter.delete(
  "/:id",
  requireRole(["owner", "admin"]),
  async (req: Request, res: Response) => {
    const restaurant_id = req.restaurantId;
    const { id } = req.params;

    try {
      // 1. Verificar que la mesa pertenece al restaurante
      const { data: table, error: tableError } = await supabaseAdmin
        .from("tables")
        .select("id, table_number")
        .eq("id", id)
        .eq("restaurant_id", restaurant_id)
        .maybeSingle();

      if (tableError) throw tableError;

      if (!table) {
        return res.status(404).json({
          success: false,
          error: "Mesa no encontrada",
        });
      }

      // 2. Verificar órdenes activas asociadas a la mesa
      const activeStatuses = [
        "PENDING",
        "CONFIRMED",
        "IN_PROGRESS",
        "READY",
        "SERVED",
      ];

      const { data: activeOrders, error: ordersError } = await supabaseAdmin
        .from("orders")
        .select("id, status")
        .eq("restaurant_id", restaurant_id)
        .eq("table_id", id)
        .in("status", activeStatuses);

      if (ordersError) throw ordersError;

      if (activeOrders && activeOrders.length > 0) {
        return res.status(409).json({
          success: false,
          error: "No se puede eliminar una mesa con órdenes activas",
          data: {
            table_id: id,
            active_orders_count: activeOrders.length,
          },
        });
      }

      // 3. Eliminar la mesa
      const { error: deleteError } = await supabaseAdmin
        .from("tables")
        .delete()
        .eq("id", id)
        .eq("restaurant_id", restaurant_id);

      if (deleteError) throw deleteError;

      return res.json({
        success: true,
        message: "Mesa eliminada correctamente",
        data: table,
      });
    } catch (error: any) {
      console.error("Error eliminando mesa:", error);

      return res.status(500).json({
        success: false,
        error: error?.message ?? "No se pudo eliminar la mesa",
      });
    }
  },
);
