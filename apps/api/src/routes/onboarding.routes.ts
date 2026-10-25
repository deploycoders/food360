import { Router, type Request, type Response } from "express";
import { supabaseAdmin } from "@food360/database";

export const onboardingRouter: Router = Router();

interface CreateRestaurantBody {
  fullName?: unknown;
  phone?: unknown;
  restaurantName?: unknown;
}

async function getAuthenticatedUser(req: Request) {
  const token = req.headers.authorization?.match(/^Bearer\s+(.+)$/i)?.[1];

  if (!token) return null;

  const { data, error } = await supabaseAdmin.auth.getUser(token);

  if (error) return null;

  return data.user ?? null;
}

function createRestaurantSlug(name: string, suffix?: number): string {
  const base =
    name
      .normalize("NFKD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 70) || "restaurante";

  return suffix ? `${base}-${suffix}` : base;
}

// POST /api/v1/onboarding/restaurant
onboardingRouter.post(
  "/restaurant",
  async (
    req: Request<Record<string, string>, unknown, CreateRestaurantBody>,
    res: Response,
  ) => {
    const user = await getAuthenticatedUser(req);

    if (!user) {
      return res.status(401).json({
        success: false,
        error: "Tu sesión no es válida. Inicia sesión de nuevo.",
      });
    }

    const body = req.body ?? {};

    const fullName =
      typeof body.fullName === "string" ? body.fullName.trim() : "";

    const phone = typeof body.phone === "string" ? body.phone.trim() : "";

    const restaurantName =
      typeof body.restaurantName === "string" ? body.restaurantName.trim() : "";

    if (!fullName || fullName.length > 120) {
      return res.status(400).json({
        success: false,
        error: "Introduce tu nombre completo (máximo 120 caracteres).",
      });
    }

    if (phone.length > 40) {
      return res.status(400).json({
        success: false,
        error: "El teléfono no puede superar 40 caracteres.",
      });
    }

    if (!restaurantName || restaurantName.length > 120) {
      return res.status(400).json({
        success: false,
        error: "Introduce el nombre del restaurante (máximo 120 caracteres).",
      });
    }

    const email = user.email?.trim().toLowerCase();

    if (!email) {
      return res.status(400).json({
        success: false,
        error: "Tu cuenta no tiene un correo electrónico disponible.",
      });
    }

    try {
      let data: unknown;
      let error: { code?: string; message: string } | null = null;
      for (let attempt = 0; attempt < 20; attempt += 1) {
        const result = await supabaseAdmin.rpc("create_restaurant_for_user", {
          p_user_id: user.id,
          p_email: email,
          p_full_name: fullName,
          p_phone: phone || null,
          p_restaurant_name: restaurantName,
          p_slug: createRestaurantSlug(restaurantName, attempt || undefined),
        });
        data = result.data;
        error = result.error;
        if (!error || error.code !== "23505" || !/slug/i.test(error.message)) break;
      }

      if (error) {
        if (error.message.includes("ALREADY_HAS_ACTIVE_RESTAURANT")) {
          return res.status(409).json({
            success: false,
            error:
              "Tu cuenta ya tiene un restaurante activo. Actualiza la página para continuar.",
          });
        }

        throw error;
      }

      const created = data as {
        restaurantId: string;
        name: string;
        slug: string;
        role: "owner";
      };

      // Sincronizar el nombre y teléfono de autenticación para
      // que el menú global pueda seguir utilizando los metadatos.
      const { error: metadataError } =
        await supabaseAdmin.auth.admin.updateUserById(user.id, {
          user_metadata: {
            ...user.user_metadata,
            full_name: fullName,
            phone: phone || null,
          },
        });

      if (metadataError) {
        // El perfil ya quedó guardado transaccionalmente.
        // No declarar fallida la creación por esta sincronización secundaria.
        console.error(
          "Restaurant created, but auth metadata could not be synchronized:",
          metadataError,
        );
      }

      return res.status(201).json({
        success: true,
        data: {
          restaurant: {
            id: created.restaurantId,
            name: created.name,
            slug: created.slug,
          },
          role: created.role,
        },
      });
    } catch (error) {
      console.error("POST /onboarding/restaurant failed:", error);

      return res.status(500).json({
        success: false,
        error: "No se pudo crear el restaurante. Inténtalo de nuevo.",
      });
    }
  },
);
