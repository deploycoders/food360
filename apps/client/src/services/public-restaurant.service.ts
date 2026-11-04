import type {
  PublicRestaurant,
  PublicRestaurantResponse,
} from "@food360/types";

export type PublicRestaurantResult =
  | { status: "found"; restaurant: PublicRestaurant }
  | { status: "not-found" }
  | { status: "error" };

const SLUG_PATTERN = /^[a-z0-9](?:[a-z0-9-]{0,78}[a-z0-9])?$/;

export function isPublicRestaurantSlug(value: string): boolean {
  return SLUG_PATTERN.test(value) && !["menu", "cart", "r"].includes(value);
}

async function fetchPublicRestaurant(
  path: string,
): Promise<PublicRestaurantResult> {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL?.trim().replace(/\/+$/, "");

  if (!baseUrl) {
    console.error("[PublicRestaurant] NEXT_PUBLIC_API_URL no está configurada");
    return { status: "error" };
  }

  const endpoint = baseUrl.endsWith("/api/v1")
    ? `${baseUrl}/public/restaurants/${path}`
    : `${baseUrl}/api/v1/public/restaurants/${path}`;

  try {
    const response = await fetch(endpoint, { cache: "no-store" });
    const responseText = await response.text();

    if (response.status === 404) {
      return { status: "not-found" };
    }

    if (!response.ok) {
      console.error("[PublicRestaurant] Error de API:", {
        endpoint,
        status: response.status,
        body: responseText.slice(0, 1000),
      });

      return { status: "error" };
    }

    let result: unknown;

    try {
      result = JSON.parse(responseText);
    } catch {
      console.error("[PublicRestaurant] La API no devolvió JSON válido:", {
        endpoint,
        body: responseText.slice(0, 1000),
      });

      return { status: "error" };
    }

    if (!isPublicRestaurantResponse(result)) {
      const data =
        result && typeof result === "object" && "data" in result
          ? (result as { data?: unknown }).data
          : undefined;

      console.error("[PublicRestaurant] Respuesta con estructura inválida:", {
        endpoint,
        responseKeys:
          result && typeof result === "object" ? Object.keys(result) : [],
        dataKeys: data && typeof data === "object" ? Object.keys(data) : [],
      });

      return { status: "error" };
    }

    return { status: "found", restaurant: result.data };
  } catch (error) {
    console.error("[PublicRestaurant] Error de conexión:", error);

    return { status: "error" };
  }
}

function isPublicRestaurantResponse(
  value: unknown,
): value is PublicRestaurantResponse & { data: PublicRestaurant } {
  if (!value || typeof value !== "object") return false;
  const response = value as Partial<PublicRestaurantResponse>;
  const data = response.data;
  if (!response.success || !data || typeof data !== "object") return false;
  return (
    typeof data.publicId === "string" &&
    typeof data.name === "string" &&
    typeof data.slug === "string" &&
    (typeof data.phone === "string" || data.phone === null) &&
    (typeof data.address === "string" || data.address === null) &&
    (typeof data.currency === "string" || data.currency === null) &&
    [
      data.instagramUrl,
      data.tiktokUrl,
      data.whatsappUrl,
      data.googleBusinessUrl,
    ].every(
      (value) =>
        value === undefined || typeof value === "string" || value === null,
    ) &&
    !!data.wifi &&
    (typeof data.wifi.ssid === "string" || data.wifi.ssid === null) &&
    (typeof data.wifi.password === "string" || data.wifi.password === null)
  );
}

export async function getPublicRestaurant(
  slug: string,
): Promise<PublicRestaurantResult> {
  if (!isPublicRestaurantSlug(slug)) return { status: "not-found" };
  return fetchPublicRestaurant(encodeURIComponent(slug));
}

export async function getPublicRestaurantById(
  publicId: string,
): Promise<PublicRestaurantResult> {
  if (
    !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
      publicId,
    )
  ) {
    return { status: "not-found" };
  }
  return fetchPublicRestaurant(`id/${encodeURIComponent(publicId)}`);
}
