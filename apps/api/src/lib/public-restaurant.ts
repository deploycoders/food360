import { supabaseAdmin } from "@food360/database";
import type { Response } from "express";

export const SCHEMA_NOT_READY_CODES = new Set([
  "PGRST202",
  "PGRST204",
  "PGRST205",
  "42703",
  "42883",
  "42P01",
]);

export function isSchemaNotReady(code: string): boolean {
  return SCHEMA_NOT_READY_CODES.has(code);
}

export function sendSchemaError(res: Response) {
  return res.status(503).json({
    success: false,
    error: "La página pública aún no está habilitada en este entorno",
  });
}

export type RestaurantPublicRow = {
  public_id: string;
  name: string;
  slug: string;
  phone: string | null;
  address: string | null;
  logo_url?: string | null;
  currency: string | null;
  wifi_ssid: string | null;
  wifi_password: string | null;
  instagram_url?: string | null;
  tiktok_url?: string | null;
  whatsapp_url?: string | null;
  google_business_url?: string | null;
};

const FULL_PUBLIC_SELECT =
  "public_id, name, slug, phone, address, currency, logo_url, wifi_ssid, wifi_password, instagram_url, tiktok_url, whatsapp_url, google_business_url";

const FALLBACK_PUBLIC_SELECT =
  "public_id, name, slug, phone, address, currency, logo_url, wifi_ssid, wifi_password, instagram_url, google_business_url";

export type FindPublishedRestaurantResult = {
  data: RestaurantPublicRow | null;
  error: { code: string; message: string } | null;
};

export async function findPublishedRestaurant(
  column: "slug" | "public_id" | "id",
  value: string,
): Promise<FindPublishedRestaurantResult> {
  const result = await supabaseAdmin
    .from("restaurants")
    .select(FULL_PUBLIC_SELECT)
    .eq(column, value)
    .eq("public_page_published", true)
    .maybeSingle();
  if (!result.error || !isSchemaNotReady(result.error.code)) {
    return result as unknown as FindPublishedRestaurantResult;
  }
  const fallback = await supabaseAdmin
    .from("restaurants")
    .select(FALLBACK_PUBLIC_SELECT)
    .eq(column, value)
    .eq("public_page_published", true)
    .maybeSingle();
  return fallback as unknown as FindPublishedRestaurantResult;
}

export function toPublicRestaurantData(data: RestaurantPublicRow) {
  return {
    publicId: data.public_id,
    name: data.name,
    slug: data.slug,
    phone: data.phone,
    address: data.address,
    currency: data.currency,
    logoUrl: data.logo_url ?? null,
    instagramUrl: data.instagram_url ?? null,
    tiktokUrl: data.tiktok_url ?? null,
    whatsappUrl: data.whatsapp_url ?? null,
    googleBusinessUrl: data.google_business_url ?? null,
    wifi: {
      ssid: data.wifi_ssid,
      password: data.wifi_password,
    },
  };
}

export function toPublicResponse(data: RestaurantPublicRow) {
  return {
    success: true as const,
    data: toPublicRestaurantData(data),
  };
}
