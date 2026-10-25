export interface PublicMenuCategory {
  id: string;
  label: string;
  sortOrder: number;
}

export interface PublicMenuProduct {
  id: string;
  categoryId: string;
  name: string;
  description: string;
  price: number;
  image: string;
  available: boolean;
}

export interface PublicMenu {
  categories: PublicMenuCategory[];
  products: PublicMenuProduct[];
}

interface PublicMenuResponse {
  success: boolean;
  data?: PublicMenu;
  error?: string;
}

function getPublicMenuEndpoint(slug: string): string {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL?.trim();

  if (!apiUrl) {
    throw new Error(
      "Falta configurar NEXT_PUBLIC_API_URL para cargar la carta.",
    );
  }

  const baseUrl = apiUrl.replace(/\/+$/, "");

  const apiBase = baseUrl.endsWith("/api/v1") ? baseUrl : `${baseUrl}/api/v1`;

  return `${apiBase}/public/restaurants/${encodeURIComponent(slug)}/menu`;
}

function isPublicMenuResponse(
  value: unknown,
): value is PublicMenuResponse & { data: PublicMenu } {
  if (!value || typeof value !== "object") {
    return false;
  }

  const response = value as PublicMenuResponse;
  const data = response.data;

  if (
    response.success !== true ||
    !data ||
    !Array.isArray(data.categories) ||
    !Array.isArray(data.products)
  ) {
    return false;
  }

  const validCategories = data.categories.every(
    (category) =>
      typeof category.id === "string" &&
      typeof category.label === "string" &&
      typeof category.sortOrder === "number",
  );

  const validProducts = data.products.every(
    (product) =>
      typeof product.id === "string" &&
      typeof product.categoryId === "string" &&
      typeof product.name === "string" &&
      typeof product.description === "string" &&
      typeof product.price === "number" &&
      Number.isFinite(product.price) &&
      typeof product.image === "string" &&
      typeof product.available === "boolean",
  );

  return validCategories && validProducts;
}

export async function getPublicMenu(slug: string): Promise<PublicMenu> {
  if (!slug.trim()) {
    throw new Error("No se especificó el restaurante.");
  }

  const endpoint = getPublicMenuEndpoint(slug);

  let response: Response;

  try {
    response = await fetch(endpoint, {
      cache: "no-store",
    });
  } catch {
    throw new Error("No se pudo conectar con el servicio de la carta.");
  }

  if (response.status === 404) {
    throw new Error(
      "No encontramos la carta de este restaurante o su página no está publicada.",
    );
  }

  if (!response.ok) {
    throw new Error(
      `No se pudo cargar la carta del restaurante (${response.status}).`,
    );
  }

  let result: unknown;

  try {
    result = await response.json();
  } catch {
    throw new Error("El servicio de la carta devolvió una respuesta inválida.");
  }

  if (!isPublicMenuResponse(result)) {
    throw new Error("La estructura de la carta recibida no es válida.");
  }

  return result.data;
}
