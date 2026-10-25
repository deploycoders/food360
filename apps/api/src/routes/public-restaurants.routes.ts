import { supabaseAdmin } from "@food360/database";
import { Router, type Response } from "express";

export const publicRestaurantsRouter: Router = Router();

const SLUG_PATTERN = /^[a-z0-9](?:[a-z0-9-]{0,78}[a-z0-9])?$/;
const RESERVED_SLUGS = new Set(["menu", "cart", "r"]);
const PUBLIC_ID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const SCHEMA_NOT_READY_CODES = new Set([
  "PGRST204",
  "PGRST205",
  "42703",
  "42P01",
]);

function isSchemaNotReady(code: string): boolean {
  return SCHEMA_NOT_READY_CODES.has(code);
}

function sendSchemaError(res: Response) {
  return res.status(503).json({
    success: false,
    error: "La página pública aún no está habilitada en este entorno",
  });
}

async function findPublishedRestaurant(
  column: "slug" | "public_id",
  value: string,
) {
  const result = await supabaseAdmin
    .from("restaurants")
    .select(
      "public_id, name, slug, phone, address, currency, wifi_ssid, wifi_password, instagram_url, tiktok_url, whatsapp_url, google_business_url",
    )
    .eq(column, value)
    .eq("public_page_published", true)
    .maybeSingle();
  if (!result.error || !isSchemaNotReady(result.error.code)) return result;
  return supabaseAdmin
    .from("restaurants")
    .select(
      "public_id, name, slug, phone, address, currency, wifi_ssid, wifi_password, instagram_url, google_business_url",
    )
    .eq(column, value)
    .eq("public_page_published", true)
    .maybeSingle();
}

function toPublicResponse(data: {
  public_id: string;
  name: string;
  slug: string;
  phone: string | null;
  address: string | null;
  currency: string | null;
  wifi_ssid: string | null;
  wifi_password: string | null;
  instagram_url?: string | null;
  tiktok_url?: string | null;
  whatsapp_url?: string | null;
  google_business_url?: string | null;
}) {
  return {
    success: true,
    data: {
      publicId: data.public_id,
      name: data.name,
      slug: data.slug,
      phone: data.phone,
      address: data.address,
      currency: data.currency,
      instagramUrl: data.instagram_url ?? null,
      tiktokUrl: data.tiktok_url ?? null,
      whatsappUrl: data.whatsapp_url ?? null,
      googleBusinessUrl: data.google_business_url ?? null,
      wifi: {
        ssid: data.wifi_ssid,
        password: data.wifi_password,
      },
    },
  };
}

publicRestaurantsRouter.get("/id/:publicId", async (req, res) => {
  res.set("Cache-Control", "no-store");
  const publicId = req.params.publicId;

  if (typeof publicId !== "string" || !PUBLIC_ID_PATTERN.test(publicId)) {
    return res
      .status(400)
      .json({ success: false, error: "El identificador no es válido" });
  }

  try {
    const { data, error } = await findPublishedRestaurant(
      "public_id",
      publicId,
    );
    if (error) {
      console.error("Error consultando identificador público:", error.code);
      if (isSchemaNotReady(error.code)) return sendSchemaError(res);
      return res
        .status(500)
        .json({ success: false, error: "No se pudo cargar el restaurante" });
    }
    if (!data) {
      return res.status(404).json({
        success: false,
        error: "No se encontró el restaurante publicado",
      });
    }
    return res.json(toPublicResponse(data));
  } catch (error) {
    console.error(
      "Error en GET /api/v1/public/restaurants/id/:publicId:",
      error,
    );
    return res
      .status(500)
      .json({ success: false, error: "No se pudo cargar el restaurante" });
  }
});

// GET /api/v1/public/restaurants/:slug
// Devuelve únicamente los datos permitidos de una página publicada.

publicRestaurantsRouter.get("/:slug/menu", async (req, res) => {
  res.set("Cache-Control", "no-store");

  const rawSlug = req.params.slug;
  const slug = typeof rawSlug === "string" ? rawSlug : "";

  if (!slug || !SLUG_PATTERN.test(slug) || RESERVED_SLUGS.has(slug)) {
    return res.status(400).json({
      success: false,
      error: "El slug no es válido",
    });
  }

  try {
    // 1. Buscar el restaurante por su slug actual.
    const { data: currentRestaurant, error: restaurantError } =
      await supabaseAdmin
        .from("restaurants")
        .select("id")
        .eq("slug", slug)
        .eq("public_page_published", true)
        .maybeSingle();

    if (restaurantError) {
      console.error(
        "Error buscando restaurante para menú público:",
        restaurantError.code,
      );

      if (isSchemaNotReady(restaurantError.code)) {
        return sendSchemaError(res);
      }

      return res.status(500).json({
        success: false,
        error: "No se pudo cargar la carta",
      });
    }

    let restaurantId = currentRestaurant?.id ?? null;

    // 2. Si el slug es antiguo, resolver el alias.
    if (!restaurantId) {
      const { data: alias, error: aliasError } = await supabaseAdmin
        .from("restaurant_slug_aliases")
        .select("restaurant_id")
        .eq("slug", slug)
        .maybeSingle();

      if (aliasError) {
        console.error(
          "Error buscando alias para menú público:",
          aliasError.code,
        );

        if (isSchemaNotReady(aliasError.code)) {
          return sendSchemaError(res);
        }

        return res.status(500).json({
          success: false,
          error: "No se pudo resolver la carta",
        });
      }

      if (alias) {
        const { data: aliasedRestaurant, error: aliasedRestaurantError } =
          await supabaseAdmin
            .from("restaurants")
            .select("id")
            .eq("id", alias.restaurant_id)
            .eq("public_page_published", true)
            .maybeSingle();

        if (aliasedRestaurantError) {
          console.error(
            "Error buscando restaurante por alias:",
            aliasedRestaurantError.code,
          );

          return res
            .status(isSchemaNotReady(aliasedRestaurantError.code) ? 503 : 500)
            .json({
              success: false,
              error: "No se pudo cargar la carta",
            });
        }

        restaurantId = aliasedRestaurant?.id ?? null;
      }
    }

    if (!restaurantId) {
      return res.status(404).json({
        success: false,
        error: "No se encontró la carta de un restaurante publicado",
      });
    }

    // 3. Obtener las categorías activas del restaurante.
    const { data: categories, error: categoriesError } = await supabaseAdmin
      .from("categories")
      .select("id, name, sort_order")
      .eq("restaurant_id", restaurantId)
      .eq("is_active", true)
      .order("sort_order", { ascending: true })
      .order("name", { ascending: true });

    if (categoriesError) {
      console.error(
        "Error consultando categorías públicas:",
        categoriesError.code,
      );

      if (isSchemaNotReady(categoriesError.code)) {
        return sendSchemaError(res);
      }

      return res.status(500).json({
        success: false,
        error: "No se pudieron cargar las categorías",
      });
    }

    // 4. Obtener productos activos que pertenecen a categorías activas.
    // Los productos agotados se incluyen para que Client pueda indicarlo.
    const { data: products, error: productsError } = await supabaseAdmin
      .from("products")
      .select(
        `
        id,
        category_id,
        name,
        description,
        price,
        image_url,
        is_out_of_stock,
        category:categories!inner (
          id,
          is_active
        )
      `,
      )
      .eq("restaurant_id", restaurantId)
      .eq("is_active", true)
      .eq("categories.is_active", true)
      .order("name", { ascending: true });

    if (productsError) {
      console.error(
        "Error consultando productos públicos:",
        productsError.code,
      );

      if (isSchemaNotReady(productsError.code)) {
        return sendSchemaError(res);
      }

      return res.status(500).json({
        success: false,
        error: "No se pudieron cargar los productos",
      });
    }

    // 5. Devolver únicamente los campos que necesita la carta pública.
    return res.json({
      success: true,
      data: {
        categories: (categories ?? []).map((category) => ({
          id: category.id,
          label: category.name,
          sortOrder: category.sort_order,
        })),

        products: (products ?? []).map((product) => ({
          id: product.id,
          categoryId: product.category_id,
          name: product.name,
          description: product.description ?? "",
          price: Number(product.price),
          image: product.image_url ?? "",
          available: !product.is_out_of_stock,
        })),
      },
    });
  } catch (error) {
    console.error("Error en GET /public/restaurants/:slug/menu:", error);

    return res.status(500).json({
      success: false,
      error: "No se pudo cargar la carta",
    });
  }
});

publicRestaurantsRouter.get("/:slug", async (req, res) => {
  res.set("Cache-Control", "no-store");

  const rawSlug = req.params.slug;
  const slug = typeof rawSlug === "string" ? rawSlug : "";

  if (!slug || !SLUG_PATTERN.test(slug) || RESERVED_SLUGS.has(slug)) {
    return res.status(400).json({
      success: false,
      error: "El slug no es válido",
    });
  }

  try {
    let { data, error } = await findPublishedRestaurant("slug", slug);

    if (error) {
      console.error(
        "Error consultando el perfil público del restaurante:",
        error.code,
      );

      if (isSchemaNotReady(error.code)) return sendSchemaError(res);
      return res
        .status(500)
        .json({ success: false, error: "No se pudo cargar el restaurante" });
    }

    if (!data) {
      const { data: alias, error: aliasError } = await supabaseAdmin
        .from("restaurant_slug_aliases")
        .select("restaurant_id")
        .eq("slug", slug)
        .maybeSingle();

      if (aliasError) {
        console.error("Error consultando alias público:", aliasError.code);
        if (isSchemaNotReady(aliasError.code)) return sendSchemaError(res);
        return res
          .status(500)
          .json({ success: false, error: "No se pudo cargar el restaurante" });
      }

      if (alias) {
        let restaurantResult = await supabaseAdmin
          .from("restaurants")
          .select(
            "public_id, name, slug, phone, address, currency, wifi_ssid, wifi_password, instagram_url, tiktok_url, whatsapp_url, google_business_url",
          )
          .eq("id", alias.restaurant_id)
          .eq("public_page_published", true)
          .maybeSingle();
        if (restaurantResult.error && isSchemaNotReady(restaurantResult.error.code)) {
          restaurantResult = await supabaseAdmin
            .from("restaurants")
            .select(
              "public_id, name, slug, phone, address, currency, wifi_ssid, wifi_password, instagram_url, google_business_url",
            )
            .eq("id", alias.restaurant_id)
            .eq("public_page_published", true)
            .maybeSingle();
        }
        data = restaurantResult.data;
        error = restaurantResult.error;
      }
    }

    if (error) {
      console.error("Error resolviendo perfil público:", error.code);
      if (isSchemaNotReady(error.code)) return sendSchemaError(res);
      return res
        .status(500)
        .json({ success: false, error: "No se pudo cargar el restaurante" });
    }

    // Un restaurante inexistente o no publicado no se expone públicamente.
    if (!data) {
      return res.status(404).json({
        success: false,
        error: "No se encontró el restaurante publicado",
      });
    }

    return res.json(toPublicResponse(data));
  } catch (error) {
    console.error("Error en GET /api/v1/public/restaurants/:slug:", error);

    return res.status(500).json({
      success: false,
      error: "No se pudo cargar el restaurante",
    });
  }
});
