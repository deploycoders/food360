import { supabaseAdmin } from "@food360/database";
import { Router } from "express";

import {
  findPublishedRestaurant,
  isSchemaNotReady,
  sendSchemaError,
  toPublicRestaurantData,
  type RestaurantPublicRow,
} from "../lib/public-restaurant.js";

export const publicTablesRouter: Router = Router();

/** Matches `t_` + base64url from generateTablePublicCode(). */
const TABLE_PUBLIC_CODE_PATTERN = /^t_[A-Za-z0-9_-]{8,32}$/;

publicTablesRouter.get("/:publicCode", async (req, res) => {
  res.set("Cache-Control", "no-store");

  const publicCode = req.params.publicCode;

  if (
    typeof publicCode !== "string" ||
    !TABLE_PUBLIC_CODE_PATTERN.test(publicCode)
  ) {
    return res.status(400).json({
      success: false,
      error: "El código de mesa no es válido",
    });
  }

  try {
    const { data: table, error: tableError } = await supabaseAdmin
      .from("tables")
      .select("public_code, table_number, restaurant_id")
      .eq("public_code", publicCode)
      .maybeSingle();

    if (tableError) {
      console.error("Error consultando mesa pública:", tableError.code);
      if (isSchemaNotReady(tableError.code)) return sendSchemaError(res);
      return res.status(500).json({
        success: false,
        error: "No se pudo cargar la mesa",
      });
    }

    if (!table) {
      return res.status(404).json({
        success: false,
        error: "No se encontró la mesa",
      });
    }

    const { data: restaurant, error: restaurantError } =
      await findPublishedRestaurant("id", table.restaurant_id);

    if (restaurantError) {
      console.error(
        "Error consultando restaurante de mesa pública:",
        restaurantError.code,
      );
      if (isSchemaNotReady(restaurantError.code)) return sendSchemaError(res);
      return res.status(500).json({
        success: false,
        error: "No se pudo cargar la mesa",
      });
    }

    // Mesa inexistente o restaurante no publicado → mismo 404.
    if (!restaurant) {
      return res.status(404).json({
        success: false,
        error: "No se encontró la mesa",
      });
    }

    return res.json({
      success: true,
      data: {
        publicCode: table.public_code,
        tableNumber: table.table_number,
        restaurant: toPublicRestaurantData(restaurant as RestaurantPublicRow),
      },
    });
  } catch (error) {
    console.error("Error en GET /api/v1/public/tables/:publicCode:", error);
    return res.status(500).json({
      success: false,
      error: "No se pudo cargar la mesa",
    });
  }
});
