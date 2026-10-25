import { createClient } from "@supabase/supabase-js";
import { Router, type Request, type Response } from "express";
import { hasPermission } from "@food360/types";
import { supabaseAdmin } from "@food360/database";


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

const PUBLIC_SLUG_PATTERN = /^[a-z0-9](?:[a-z0-9-]{0,78}[a-z0-9])?$/;
const RESERVED_PUBLIC_SLUGS = new Set(["menu", "cart", "r"]);

function isAvailablePublicSlug(value: string): boolean {
  return PUBLIC_SLUG_PATTERN.test(value) && !RESERVED_PUBLIC_SLUGS.has(value);
}

function isSecurePlatformUrl(value: unknown, hosts: string[]): value is string | null {
  if (value === null) return true;
  if (typeof value !== "string" || value.length > 500) return false;
  try {
    const url = new URL(value);
    return url.protocol === "https:" && hosts.includes(url.hostname.toLowerCase()) &&
      !url.username && !url.password && !url.port;
  } catch {
    return false;
  }
}

type PublicPageRow = {
  public_id: string;
  slug: string;
  public_page_published: boolean;
  wifi_ssid: string | null;
  wifi_password: string | null;
  instagram_url?: string | null;
  google_business_url?: string | null;
  tiktok_url?: string | null;
  whatsapp_url?: string | null;
};

async function getPublicPageRow(supabase: ReturnType<typeof getSupabaseForRequest>, restaurantId: string) {
  const full = await supabase.from("restaurants")
    .select("public_id, slug, public_page_published, wifi_ssid, wifi_password, instagram_url, google_business_url, tiktok_url, whatsapp_url")
    .eq("id", restaurantId).maybeSingle();
  if (!full.error) return { data: full.data as PublicPageRow | null, error: null, socialFieldsAvailable: true };
  if (!isSchemaNotReadyCode(full.error.code)) return { data: null, error: full.error, socialFieldsAvailable: false };
  const compatible = await supabase.from("restaurants")
    .select("public_id, slug, public_page_published, wifi_ssid, wifi_password, instagram_url, google_business_url")
    .eq("id", restaurantId).maybeSingle();
  return { data: compatible.data as PublicPageRow | null, error: compatible.error, socialFieldsAvailable: false };
}

function isSchemaNotReadyCode(code: string): boolean {
  return ["PGRST204", "PGRST205", "42703", "42P01"].includes(code);
}

configurationRouter.get("/public-page", async (req, res) => {
  if (!hasPermission(req.userRole, "settings.view")) {
    return sendError(res, 403, "No tienes permiso para ver esta configuración");
  }

  try {
    const supabase = getSupabaseForRequest(req);
    const { data, error, socialFieldsAvailable } = await getPublicPageRow(supabase, req.restaurantId);

    if (error) {
      console.error("Error consultando publicación pública:", error);
      return sendError(
        res,
        ["PGRST204", "PGRST205", "42703", "42P01"].includes(error.code) ? 503 : 500,
        ["PGRST204", "PGRST205", "42703", "42P01"].includes(error.code)
          ? "La función de página pública aún no está habilitada en este entorno"
          : "No se pudo cargar la configuración de página pública",
      );
    }

    if (!data) return sendError(res, 404, "No se encontró el restaurante");

    return res.json({
      success: true,
      data: {
        publicId: data.public_id,
        slug: data.slug,
        isPublished: data.public_page_published,
        wifiName: data.wifi_ssid ?? "",
        wifiPasswordConfigured: data.wifi_password !== null,
        instagramUrl: data.instagram_url ?? null,
        googleBusinessUrl: data.google_business_url ?? null,
        tiktokUrl: data.tiktok_url ?? null,
        whatsappUrl: data.whatsapp_url ?? null,
        socialFieldsAvailable,
      },
    });
  } catch (error) {
    console.error("Error en GET /configuration/public-page:", error);
    return sendError(res, 500, "No se pudo cargar la página pública");
  }
});

configurationRouter.patch("/public-page", async (req, res) => {
  if (!hasPermission(req.userRole, "settings.update")) {
    return sendError(res, 403, "No tienes permiso para modificar esta configuración");
  }

  if (!req.body || typeof req.body !== "object" || Array.isArray(req.body)) {
    return sendError(res, 400, "El cuerpo de la solicitud no es válido");
  }

  const body = req.body as JsonObject;
  const fields = Object.keys(body);
  const allowedFields = [
    "slug",
    "isPublished",
    "wifiName",
    "wifiPassword",
    "clearWifiPassword",
    "instagramUrl",
    "googleBusinessUrl",
    "tiktokUrl",
    "whatsappUrl",
  ];

  if (
    fields.length === 0 ||
    fields.some((field) => !allowedFields.includes(field))
  ) {
    return sendError(res, 400, "La solicitud contiene campos no permitidos");
  }

  const socialHosts: Record<string, string[]> = {
    instagramUrl: ["instagram.com", "www.instagram.com"],
    tiktokUrl: ["tiktok.com", "www.tiktok.com", "vm.tiktok.com"],
    whatsappUrl: ["wa.me"],
    googleBusinessUrl: ["google.com", "www.google.com", "maps.google.com", "maps.app.goo.gl", "goo.gl"],
  };
  for (const [field, hosts] of Object.entries(socialHosts)) {
    if (field in body && !isSecurePlatformUrl(body[field], hosts)) {
      return sendError(res, 400, `La URL de ${field} debe ser HTTPS y pertenecer a la plataforma correspondiente`);
    }
  }
  if ("whatsappUrl" in body && typeof body.whatsappUrl === "string" &&
      !/^https:\/\/wa\.me\/(?:\+?\d{5,15})(?:[/?#].*)?$/i.test(body.whatsappUrl)) {
    return sendError(res, 400, "WhatsApp debe usar un enlace https://wa.me/ con un número válido");
  }

  if (
    "slug" in body &&
    (typeof body.slug !== "string" || !isAvailablePublicSlug(body.slug))
  ) {
    return sendError(
      res,
      400,
      "El slug debe usar minúsculas, números y guiones, y comenzar y terminar con letra o número",
    );
  }

  if ("isPublished" in body && typeof body.isPublished !== "boolean") {
    return sendError(res, 400, "El estado de publicación no es válido");
  }

  if (
    ("wifiName" in body &&
      (typeof body.wifiName !== "string" ||
        new TextEncoder().encode(body.wifiName.trim()).length > 32)) ||
    ("wifiPassword" in body &&
      (typeof body.wifiPassword !== "string" ||
        body.wifiPassword.length < 8 || body.wifiPassword.length > 63)) ||
    ("clearWifiPassword" in body && typeof body.clearWifiPassword !== "boolean") ||
    (body.clearWifiPassword === true && "wifiPassword" in body)
  ) {
    return sendError(res, 400, "Revisa el nombre de red y la contraseña Wi-Fi");
  }

  try {
    const supabase = getSupabaseForRequest(req);

    const socialFieldsRequested = "tiktokUrl" in body || "whatsappUrl" in body;
    if (socialFieldsRequested) {
      const currentSettings = await getPublicPageRow(supabase, req.restaurantId);
      if (currentSettings.error || !currentSettings.socialFieldsAvailable) {
        return sendError(res, 503, "TikTok y WhatsApp requieren que el propietario añada tiktok_url y whatsapp_url a restaurants");
      }
    }

    if (body.isPublished === true && typeof body.slug !== "string") {
      const { data: current, error: currentError } = await supabase
        .from("restaurants")
        .select("slug")
        .eq("id", req.restaurantId)
        .maybeSingle();

      if (currentError || !current) {
        console.error("Error validando slug antes de publicar:", currentError);
        return sendError(res, 500, "No se pudo verificar el slug del restaurante");
      }

      if (!isAvailablePublicSlug(current.slug)) {
        return sendError(res, 400, "Actualiza el slug antes de publicar la página");
      }
    }

    if (typeof body.slug === "string") {
      const { data: collision, error: lookupError } = await supabase
        .from("restaurants")
        .select("id")
        .eq("slug", body.slug)
        .neq("id", req.restaurantId)
        .maybeSingle();

      if (lookupError) {
        console.error("Error verificando slug del restaurante:", lookupError);
        return sendError(res, 500, "No se pudo verificar la disponibilidad del slug");
      }

      if (collision) return sendError(res, 409, "Este slug ya está en uso");

      const { data: alias, error: aliasError } = await supabaseAdmin
        .from("restaurant_slug_aliases")
        .select("slug")
        .eq("slug", body.slug)
        .neq("restaurant_id", req.restaurantId)
        .maybeSingle();

      if (aliasError && aliasError.code !== "PGRST205") {
        console.error("Error verificando alias de slug:", aliasError);
        return sendError(res, 500, "No se pudo verificar la disponibilidad del slug");
      }

      if (alias) return sendError(res, 409, "Este slug ya fue usado por otro restaurante");
    }

    const updates: Record<string, unknown> = {};
    if (typeof body.slug === "string") updates.slug = body.slug;
    if (typeof body.isPublished === "boolean") {
      updates.public_page_published = body.isPublished;
    }
    if (typeof body.wifiName === "string") {
      const wifiName = body.wifiName.trim();
      updates.wifi_ssid = wifiName || null;
      if (!wifiName) updates.wifi_password = null;
    }
    if (body.clearWifiPassword === true) updates.wifi_password = null;
    else if (typeof body.wifiPassword === "string") {
      updates.wifi_password = body.wifiPassword;
    }
    if ("instagramUrl" in body) updates.instagram_url = body.instagramUrl;
    if ("googleBusinessUrl" in body) updates.google_business_url = body.googleBusinessUrl;
    if ("tiktokUrl" in body) updates.tiktok_url = body.tiktokUrl;
    if ("whatsappUrl" in body) updates.whatsapp_url = body.whatsappUrl;

    const { data, error } = await supabase
      .from("restaurants")
      .update(updates)
      .eq("id", req.restaurantId)
      .select("id")
      .maybeSingle();

    if (error) {
      if (error.code === "23505") {
        return sendError(res, 409, "Este slug ya está en uso");
      }

      if (error.code === "PGRST204" || error.code === "42703") {
        return sendError(
          res,
          503,
          "La función de página pública aún no está habilitada en este entorno",
        );
      }

      console.error("Error actualizando página pública:", error);
      return sendError(res, 500, "No se pudo guardar la configuración pública");
    }

    if (!data) return sendError(res, 403, "No se pudo actualizar el restaurante");

    const current = await getPublicPageRow(supabase, req.restaurantId);
    if (current.error || !current.data) {
      return sendError(res, 500, "Se guardó la configuración, pero no se pudo volver a cargar");
    }
    return res.json({
      success: true,
      data: {
        publicId: current.data.public_id,
        slug: current.data.slug,
        isPublished: current.data.public_page_published,
        wifiName: current.data.wifi_ssid ?? "",
        wifiPasswordConfigured: current.data.wifi_password !== null,
        instagramUrl: current.data.instagram_url ?? null,
        googleBusinessUrl: current.data.google_business_url ?? null,
        tiktokUrl: current.data.tiktok_url ?? null,
        whatsappUrl: current.data.whatsapp_url ?? null,
        socialFieldsAvailable: current.socialFieldsAvailable,
      },
    });
  } catch (error) {
    console.error("Error en PATCH /configuration/public-page:", error);
    return sendError(res, 500, "No se pudo guardar la página pública");
  }
});

// ============================================================
// GET /api/v1/configuration
// Obtener información general del restaurante
// ============================================================

configurationRouter.get("/", async (req, res) => {
  if (!hasPermission(req.userRole, "settings.view")) {
    return sendError(res, 403, "No tienes permiso para ver esta configuración");
  }

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

configurationRouter.patch("/", async (req, res) => {
  if (!hasPermission(req.userRole, "settings.update")) {
    return sendError(res, 403, "No tienes permiso para modificar esta configuración");
  }

  try {
    if (!req.body || typeof req.body !== "object" || Array.isArray(req.body)) {
      return sendError(res, 400, "El cuerpo de la solicitud no es válido");
    }

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
  if (!hasPermission(req.userRole, "settings.view")) {
    return sendError(res, 403, "No tienes permiso para ver esta configuración");
  }

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
  async (req, res) => {
    if (!hasPermission(req.userRole, "settings.update")) {
      return sendError(res, 403, "No tienes permiso para modificar esta configuración");
    }

    try {
      if (!req.body || typeof req.body !== "object" || Array.isArray(req.body)) {
        return sendError(res, 400, "El cuerpo de la solicitud no es válido");
      }
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
