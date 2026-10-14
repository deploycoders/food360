import { createClient } from "@/lib/supabase/client";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  if (!API_BASE_URL) {
    throw new Error("Falta configurar NEXT_PUBLIC_API_URL");
  }

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

  const headers = new Headers(options.headers);

  headers.set("Authorization", `Bearer ${session.access_token}`);

  if (options.body && !headers.has("Content-Type")) {
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
