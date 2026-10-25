import { createClient } from "@/lib/supabase/client";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

async function requestApi<T>(
  path: string,
  options: RequestInit = {},
  accessToken?: string,
): Promise<T> {
  if (!API_BASE_URL) {
    throw new Error("Falta configurar NEXT_PUBLIC_API_URL");
  }

  const headers = new Headers(options.headers);

  if (accessToken) headers.set("Authorization", `Bearer ${accessToken}`);

  const isMultipart =
    typeof FormData !== "undefined" && options.body instanceof FormData;

  if (options.body && !headers.has("Content-Type") && !isMultipart) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(
    `${API_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`,
    {
      ...options,
      headers,
      cache: "no-store",
    },
  );

  const result = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(result?.error ?? `Error de API: ${response.status}`);
  }

  return result as T;
}

export async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const supabase = createClient();
  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession();

  if (sessionError) {
    throw new Error("No se pudo obtener la sesión de Supabase");
  }

  if (!session?.access_token) {
    throw new Error("Debes iniciar sesión para continuar");
  }

  let selectedRestaurantId: string | null = null;
  try {
    selectedRestaurantId = window.localStorage.getItem(
      "food360.currentRestaurantId",
    );
  } catch {
    // The API falls back to the user's first active membership.
  }

  const headers = new Headers(options.headers);
  if (selectedRestaurantId) {
    headers.set("X-Food360-Restaurant-Id", selectedRestaurantId);
  }

  return requestApi<T>(
    path,
    { ...options, headers },
    session.access_token,
  );
}

/** Calls API routes that authenticate a one-time token instead of a session. */
export function apiPublicFetch<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  return requestApi<T>(path, options);
}
