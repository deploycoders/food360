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

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...(options.headers ?? {}),
    },
  });

  const body = (await response.json()) as ApiResponse<T>;

  if (!response.ok) {
    throw new Error(body.error ?? "Ocurrió un error al comunicarse con la API");
  }

  return body.data;
}

export async function getTables(): Promise<Table[]> {
  const data = await apiRequest<ApiTable[]>("/api/v1/tables");

  return data.map(mapTable);
}

export async function createTable(input: CreateTableInput): Promise<Table> {
  const data = await apiRequest<ApiTable>("/api/v1/tables", {
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
  const data = await apiRequest<ApiTable>(`/api/v1/tables/${tableId}`, {
    method: "PATCH",
    body: JSON.stringify({
      table_number: input.tableNumber,
    }),
  });

  return mapTable(data);
}

export async function deleteTable(tableId: string): Promise<void> {
  await apiRequest(`/api/v1/tables/${tableId}`, {
    method: "DELETE",
  });
}
