import { createClient } from "@supabase/supabase-js";
import { Router, type Request, type Response } from "express";

import { requireRole } from "../../middleware";

export const configurationRouter: Router = Router();

type JsonObject = Record<string, unknown>;

function sendError(res: Response, status: number, error: string) {
  return res.status(status).json({
    success: false,
    error,
  });
}

/**
 * Usa el token del usuario autenticado para que las consultas
 * continúen respetando las políticas RLS de Supabase.
 */
function getSupabaseForRequest(req: Request) {
  const authorization = req.headers.authorization;

  if (!authorization?.startsWith("Bearer ")) {
    throw new Error("Token de acceso requerido");
  }

  const token = authorization.substring("Bearer ".length).trim();

  if (!token) {
    throw new Error("Token de acceso requerido");
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Falta la configuración de Supabase en la API");
  }

  return createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  });
}

function isValidTimezone(value: string): boolean {
  try {
    new Intl.DateTimeFormat("en-US", {
      timeZone: value,
    });
    return true;
  } catch {
    return false;
  }
}

function isValidTime(value: unknown): value is string {
  return typeof value === "string" && /^([01]\d|2[0-3]):[0-5]\d$/.test(value);
}

function isValidOptionalText(
  value: unknown,
  maxLength: number,
): value is string | null {
  return (
    value === null ||
    (typeof value === "string" && value.trim().length <= maxLength)
  );
}

// ============================================================
// GET /api/v1/configuration
// Obtener información general del restaurante
// ============================================================

configurationRouter.get("/", async (req, res) => {
  try {
    const supabase = getSupabaseForRequest(req);

    const { data, error } = await supabase
      .from("restaurants")
      .select(
        [
          "id",
          "name",
          "slug",
          "legal_name",
          "phone",
          "email",
          "address",
          "currency",
          "timezone",
          "tax_rate",
        ].join(", "),
      )
      .eq("id", req.restaurantId)
      .maybeSingle();

    if (error) {
      console.error("Error consultando configuración:", error);

      return sendError(
        res,
        500,
        "No se pudo cargar la configuración del restaurante",
      );
    }

    if (!data) {
      return sendError(
        res,
        404,
        "No se encontró la configuración del restaurante",
      );
    }

    return res.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error("Error en GET /configuration:", error);

    return sendError(
      res,
      500,
      error instanceof Error
        ? error.message
        : "Error interno al cargar la configuración",
    );
  }
});

// ============================================================
// PATCH /api/v1/configuration
// Actualizar información general del restaurante
// Solo owner
// ============================================================

configurationRouter.patch("/", requireRole(["owner"]), async (req, res) => {
  try {
    const body = req.body as JsonObject;

    const allowedFields = [
      "name",
      "legal_name",
      "phone",
      "email",
      "address",
      "currency",
      "timezone",
      "tax_rate",
    ];

    const receivedFields = Object.keys(body);

    if (
      receivedFields.length === 0 ||
      receivedFields.some((key) => !allowedFields.includes(key))
    ) {
      return sendError(
        res,
        400,
        "La solicitud contiene campos vacíos o no permitidos",
      );
    }

    const updates: Record<string, unknown> = {};

    if ("name" in body) {
      if (
        typeof body.name !== "string" ||
        !body.name.trim() ||
        body.name.trim().length > 150
      ) {
        return sendError(
          res,
          400,
          "El nombre del restaurante es obligatorio y debe tener máximo 150 caracteres",
        );
      }

      updates.name = body.name.trim();
    }

    const optionalTextFields = [
      ["legal_name", 200],
      ["phone", 40],
      ["email", 254],
      ["address", 300],
    ] as const;

    for (const [field, maxLength] of optionalTextFields) {
      if (!(field in body)) continue;

      const value = body[field];

      if (!isValidOptionalText(value, maxLength)) {
        return sendError(res, 400, `El campo ${field} no es válido`);
      }

      const normalized = typeof value === "string" ? value.trim() : null;

      if (field === "email" && normalized) {
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailPattern.test(normalized)) {
          return sendError(res, 400, "El correo del restaurante no es válido");
        }
      }

      updates[field] = normalized || null;
    }

    if ("currency" in body) {
      if (
        typeof body.currency !== "string" ||
        !/^[A-Za-z]{3}$/.test(body.currency)
      ) {
        return sendError(
          res,
          400,
          "La moneda debe ser un código de tres letras, como EUR o USD",
        );
      }

      updates.currency = body.currency.toUpperCase();
    }

    if ("timezone" in body) {
      if (
        typeof body.timezone !== "string" ||
        !isValidTimezone(body.timezone)
      ) {
        return sendError(res, 400, "La zona horaria no es válida");
      }

      updates.timezone = body.timezone;
    }

    if ("tax_rate" in body) {
      const value = body.tax_rate;

      if (
        value !== null &&
        (typeof value !== "number" ||
          !Number.isFinite(value) ||
          value < 0 ||
          value > 100)
      ) {
        return sendError(
          res,
          400,
          "La tasa de impuestos debe estar entre 0 y 100",
        );
      }

      updates.tax_rate = value;
    }

    const supabase = getSupabaseForRequest(req);

    const { data, error } = await supabase
      .from("restaurants")
      .update(updates)
      .eq("id", req.restaurantId)
      .select(
        [
          "id",
          "name",
          "slug",
          "legal_name",
          "phone",
          "email",
          "address",
          "currency",
          "timezone",
          "tax_rate",
        ].join(", "),
      )
      .maybeSingle();

    if (error) {
      console.error("Error actualizando configuración:", error);

      return sendError(
        res,
        500,
        "No se pudo guardar la configuración del restaurante",
      );
    }

    if (!data) {
      return sendError(
        res,
        403,
        "No se pudo actualizar el restaurante. Verifica tus permisos.",
      );
    }

    return res.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error("Error en PATCH /configuration:", error);

    return sendError(res, 500, "Error interno al guardar la configuración");
  }
});

// ============================================================
// GET /api/v1/configuration/schedule
// Obtener horarios semanales
// ============================================================

configurationRouter.get("/schedule", async (req, res) => {
  try {
    const supabase = getSupabaseForRequest(req);

    const { data, error } = await supabase
      .from("restaurant_schedules")
      .select(
        [
          "id",
          "restaurant_id",
          "day_of_week",
          "is_open",
          "open_time",
          "close_time",
          "closes_next_day",
        ].join(", "),
      )
      .eq("restaurant_id", req.restaurantId)
      .order("day_of_week", { ascending: true });

    if (error) {
      console.error("Error consultando horarios:", error);

      return sendError(
        res,
        500,
        "No se pudieron cargar los horarios del restaurante",
      );
    }

    return res.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error("Error en GET /configuration/schedule:", error);

    return sendError(res, 500, "Error interno al cargar los horarios");
  }
});

// ============================================================
// PUT /api/v1/configuration/schedule
// Guardar los siete días de la semana
// Solo owner
// ============================================================

configurationRouter.put(
  "/schedule",
  requireRole(["owner"]),
  async (req, res) => {
    try {
      const body = req.body as JsonObject;
      const days = body.days;

      if (!Array.isArray(days) || days.length !== 7) {
        return sendError(res, 400, "Debes enviar los siete días de la semana");
      }

      const seenDays = new Set<number>();

      const rows: {
        restaurant_id: string;
        day_of_week: number;
        is_open: boolean;
        open_time: string | null;
        close_time: string | null;
        closes_next_day: boolean;
      }[] = [];

      for (const item of days) {
        if (!item || typeof item !== "object") {
          return sendError(res, 400, "Hay un horario inválido");
        }

        const day = item as JsonObject;
        const dayOfWeek = day.day_of_week;

        if (
          typeof dayOfWeek !== "number" ||
          !Number.isInteger(dayOfWeek) ||
          dayOfWeek < 0 ||
          dayOfWeek > 6 ||
          seenDays.has(dayOfWeek)
        ) {
          return sendError(
            res,
            400,
            "Los días deben ser únicos y estar entre 0 y 6",
          );
        }

        if (typeof day.is_open !== "boolean") {
          return sendError(
            res,
            400,
            `El estado de apertura del día ${dayOfWeek} no es válido`,
          );
        }

        seenDays.add(dayOfWeek);

        if (!day.is_open) {
          rows.push({
            restaurant_id: req.restaurantId,
            day_of_week: dayOfWeek,
            is_open: false,
            open_time: null,
            close_time: null,
            closes_next_day: false,
          });

          continue;
        }

        if (
          !isValidTime(day.open_time) ||
          !isValidTime(day.close_time) ||
          typeof day.closes_next_day !== "boolean"
        ) {
          return sendError(
            res,
            400,
            `El horario del día ${dayOfWeek} no es válido`,
          );
        }

        const opensAt = day.open_time;
        const closesAt = day.close_time;

        if (
          (day.closes_next_day && closesAt > opensAt) ||
          (!day.closes_next_day && closesAt <= opensAt)
        ) {
          return sendError(
            res,
            400,
            `Revisa la hora de cierre del día ${dayOfWeek}`,
          );
        }

        rows.push({
          restaurant_id: req.restaurantId,
          day_of_week: dayOfWeek,
          is_open: true,
          open_time: opensAt,
          close_time: closesAt,
          closes_next_day: day.closes_next_day,
        });
      }

      const supabase = getSupabaseForRequest(req);

      const { data, error } = await supabase
        .from("restaurant_schedules")
        .upsert(rows, {
          onConflict: "restaurant_id,day_of_week",
        })
        .select(
          [
            "id",
            "restaurant_id",
            "day_of_week",
            "is_open",
            "open_time",
            "close_time",
            "closes_next_day",
          ].join(", "),
        );

      if (error) {
        console.error("Error guardando horarios:", error);

        return sendError(
          res,
          500,
          "No se pudieron guardar los horarios del restaurante",
        );
      }

      return res.json({
        success: true,
        data,
      });
    } catch (error) {
      console.error("Error en PUT /configuration/schedule:", error);

      return sendError(res, 500, "Error interno al guardar los horarios");
    }
  },
);
