import type {
  CartItem,
  CustomerData,
  OrderOrigin,
  OrderPayload,
} from "@/types";

interface ApiOrderResponse {
  success?: boolean;
  error?: string;
  data?: {
    order_id?: unknown;
    origin?: unknown;
    table_number?: unknown;
    status?: unknown;
    total_amount?: unknown;
    item_count?: unknown;
    scheduled_for?: unknown;
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isValidLocalDateTime(value: string): boolean {
  const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/.exec(value);

  if (!match) return false;

  const [, year, month, day, hour, minute] = match;

  const y = Number(year);
  const m = Number(month);
  const d = Number(day);
  const h = Number(hour);
  const min = Number(minute);

  if (y < 2000 || m < 1 || m > 12 || h < 0 || h > 23 || min < 0 || min > 59) {
    return false;
  }

  const daysInMonth = new Date(Date.UTC(y, m, 0)).getUTCDate();

  return d >= 1 && d <= daysInMonth;
}

export async function submitOrder(
  restaurantPublicId: string,
  items: CartItem[],
  customer: CustomerData,
  origin: OrderOrigin,
  tablePublicCode: string | null,
  scheduledForLocal: string | null = null,
): Promise<OrderPayload> {
  if (!restaurantPublicId.trim()) {
    throw new Error("No se pudo identificar el restaurante.");
  }

  if (origin === "UNKNOWN") {
    throw new Error("No se puede enviar un pedido sin un origen válido.");
  }

  // DINE_IN puede ser un pedido programado sin mesa o un pedido QR.
  if (origin === "DINE_IN" && !tablePublicCode && !scheduledForLocal) {
    throw new Error("Selecciona una fecha y hora para consumir en el local.");
  }

  // Si hay código de mesa, la solicitud corresponde al flujo QR.
  if (origin === "DINE_IN" && tablePublicCode && scheduledForLocal) {
    throw new Error(
      "Los pedidos asociados a una mesa QR no requieren programación.",
    );
  }

  if (origin !== "DINE_IN" && scheduledForLocal !== null) {
    throw new Error(
      "Solo los pedidos para consumir en el local pueden programarse.",
    );
  }

  if (scheduledForLocal !== null && !isValidLocalDateTime(scheduledForLocal)) {
    throw new Error(
      "La fecha y hora seleccionadas no tienen un formato válido.",
    );
  }

  if (items.length === 0) {
    throw new Error("No puedes enviar un pedido vacío.");
  }

  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL?.trim().replace(
    /\/+$/,
    "",
  );

  if (!apiBaseUrl) {
    throw new Error(
      "No está configurada la URL de la API (NEXT_PUBLIC_API_URL).",
    );
  }

  // Solo enviamos identificadores y cantidades.
  // Los precios definitivos los calcula PostgreSQL.
  const requestBody = {
    restaurant_public_id: restaurantPublicId,
    full_name: customer.nombre.trim(),
    phone: customer.telefono.trim(),
    origin,
    table_public_code:
      origin === "DINE_IN" && tablePublicCode ? tablePublicCode : null,
    scheduled_for_local: scheduledForLocal,
    items: items.map((item) => ({
      product_id: item.menuItem.id,
      quantity: item.quantity,
    })),
  };

  let response: Response;

  try {
    response = await fetch(`${apiBaseUrl}/public/orders`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      cache: "no-store",
      body: JSON.stringify(requestBody),
    });
  } catch {
    throw new Error(
      "No fue posible conectar con el servidor. Comprueba tu conexión e inténtalo nuevamente.",
    );
  }

  let responseBody: unknown;

  try {
    responseBody = await response.json();
  } catch {
    responseBody = null;
  }

  const envelope: ApiOrderResponse | null = isRecord(responseBody)
    ? (responseBody as ApiOrderResponse)
    : null;

  if (!response.ok || envelope?.success !== true) {
    throw new Error(
      envelope?.error ??
        `No se pudo registrar el pedido (HTTP ${response.status}).`,
    );
  }

  const data = envelope.data;

  if (!data) {
    throw new Error(
      "El servidor no devolvió los datos de confirmación del pedido.",
    );
  }

  const orderId = data.order_id;
  const serverTotal = Number(data.total_amount);
  const serverItemCount = Number(data.item_count);

  const confirmedTableNumber =
    typeof data.table_number === "number" ? data.table_number : null;

  if (
    typeof orderId !== "string" ||
    !orderId ||
    !Number.isFinite(serverTotal) ||
    serverTotal < 0 ||
    !Number.isInteger(serverItemCount) ||
    serverItemCount < 1
  ) {
    throw new Error(
      "El servidor devolvió una confirmación incompleta del pedido.",
    );
  }

  // Conservamos una representación local de los artículos para el recibo.
  // Sus precios no se utilizan para calcular el total confirmado.
  return {
    id: orderId,
    items: items.map((item) => ({
      menuItemId: item.menuItem.id,
      name: item.menuItem.name,
      quantity: item.quantity,
      unitPrice: item.menuItem.price,
      subtotal: item.menuItem.price * item.quantity,
    })),
    customer: {
      nombre: customer.nombre.trim(),
      cedula: customer.cedula.trim(),
      telefono: customer.telefono.trim(),
    },
    origin,
    tablePublicCode: origin === "DINE_IN" ? tablePublicCode : null,
    tableNumber: origin === "DINE_IN" ? confirmedTableNumber : null,
    total: serverTotal,
    itemCount: serverItemCount,
    createdAt: new Date().toISOString(),
    status: "pending",
  };
}
