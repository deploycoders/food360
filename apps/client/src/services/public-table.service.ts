import type { PublicTable, PublicTableResponse } from "@food360/types";

export type PublicTableResult =
  | { status: "found"; table: PublicTable }
  | { status: "not-found" }
  | { status: "error" };

/** Matches API `t_` + base64url from generateTablePublicCode(). */
export const TABLE_PUBLIC_CODE_PATTERN = /^t_[A-Za-z0-9_-]{8,32}$/;

export function isTablePublicCode(value: string): boolean {
  return TABLE_PUBLIC_CODE_PATTERN.test(value);
}

function isPublicTableResponse(
  value: unknown,
): value is PublicTableResponse & { data: PublicTable } {
  if (!value || typeof value !== "object") return false;
  const response = value as Partial<PublicTableResponse>;
  const data = response.data;
  if (!response.success || !data || typeof data !== "object") return false;
  if (
    typeof data.publicCode !== "string" ||
    typeof data.tableNumber !== "number" ||
    !data.restaurant ||
    typeof data.restaurant !== "object"
  ) {
    return false;
  }
  const restaurant = data.restaurant;
  return (
    typeof restaurant.publicId === "string" &&
    typeof restaurant.name === "string" &&
    typeof restaurant.slug === "string"
  );
}

export async function getPublicTable(
  publicCode: string,
): Promise<PublicTableResult> {
  if (!isTablePublicCode(publicCode)) return { status: "not-found" };

  const baseUrl = process.env.NEXT_PUBLIC_API_URL?.trim().replace(/\/+$/, "");
  if (!baseUrl) return { status: "error" };

  const endpoint = baseUrl.endsWith("/api/v1")
    ? `${baseUrl}/public/tables/${encodeURIComponent(publicCode)}`
    : `${baseUrl}/api/v1/public/tables/${encodeURIComponent(publicCode)}`;

  try {
    const response = await fetch(endpoint, { cache: "no-store" });
    if (response.status === 404) return { status: "not-found" };
    if (!response.ok) return { status: "error" };

    const result: unknown = await response.json();
    if (!isPublicTableResponse(result)) return { status: "error" };

    return { status: "found", table: result.data };
  } catch {
    return { status: "error" };
  }
}
