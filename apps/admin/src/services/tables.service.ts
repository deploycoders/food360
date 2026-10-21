import type { CreateTableInput, Table, UpdateTableInput } from "@food360/types";

import { createClient } from "@/lib/supabase/client";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3002";

interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
}

interface ApiTable {
  id: string;
  restaurant_id: string;
  table_number: number;
  public_code: string;
}

function mapTable(table: ApiTable): Table {
  return {
    id: table.id,
    restaurantId: table.restaurant_id,
    tableNumber: table.table_number,
    publicCode: table.public_code,
  };
}

async function getAccessToken(): Promise<string> {
  const supabase = createClient();

  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();

  if (error || !session?.access_token) {
    throw new Error("No hay una sesión activa");
  }

  return session.access_token;
}

async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const token = await getAccessToken();
  const url = `${API_URL}${endpoint}`;

  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...(options.headers ?? {}),
    },
  });

  const responseText = await response.text();

  let body: ApiResponse<T>;

  try {
    body = JSON.parse(responseText) as ApiResponse<T>;
  } catch {
    const preview = responseText.trim().slice(0, 160);

    throw new Error(
      `La API devolvió una respuesta que no es JSON. ` +
        `HTTP ${response.status} en ${endpoint}. ` +
        `URL: ${url}. Respuesta: ${preview}`,
    );
  }

  if (!response.ok) {
    throw new Error(
      body.error ?? `Error HTTP ${response.status} al consultar ${endpoint}`,
    );
  }

  if (body.success === false) {
    throw new Error(body.error ?? "La API rechazó la solicitud");
  }

  return body.data;
}

export async function getTables(): Promise<Table[]> {
  const data = await apiRequest<ApiTable[]>("/tables");

  return data.map(mapTable);
}

export async function createTable(input: CreateTableInput): Promise<Table> {
  const data = await apiRequest<ApiTable>("/tables", {
    method: "POST",
    body: JSON.stringify({
      table_number: input.tableNumber,
    }),
  });

  return mapTable(data);
}

export async function updateTable(
  tableId: string,
  input: UpdateTableInput,
): Promise<Table> {
  const data = await apiRequest<ApiTable>(`/tables/${tableId}`, {
    method: "PATCH",
    body: JSON.stringify({
      table_number: input.tableNumber,
    }),
  });

  return mapTable(data);
}

export async function deleteTable(tableId: string): Promise<void> {
  await apiRequest<unknown>(`/tables/${tableId}`, {
    method: "DELETE",
  });
}
