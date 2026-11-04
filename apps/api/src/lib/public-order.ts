import { supabaseAdmin } from "@food360/database";
import { isSchemaNotReady } from "./public-restaurant.js";

export const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export const TABLE_PUBLIC_CODE_PATTERN = /^t_[A-Za-z0-9_-]{8,32}$/;

export const ALLOWED_ORIGINS = ["DINE_IN", "TAKEAWAY", "DELIVERY"] as const;
export type PublicOrderOrigin = (typeof ALLOWED_ORIGINS)[number];

export interface NormalizedOrderItem {
  product_id: string;
  quantity: number;
}

export interface NormalizedOrderInput {
  restaurantPublicId: string;
  fullName: string;
  phone: string;
  origin: PublicOrderOrigin;
  tablePublicCode: string | null;
  scheduledForLocal: string | null;
  items: NormalizedOrderItem[];
  cedula?: string;
}

export interface ValidationSuccess {
  isValid: true;
  data: NormalizedOrderInput;
}

export interface ValidationFailure {
  isValid: false;
  error: string;
}

export type ValidationResult = ValidationSuccess | ValidationFailure;

/**
 * Valida una fecha/hora local con formato YYYY-MM-DDTHH:mm.
 * No utiliza la zona horaria del servidor ni la del navegador.
 */
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

export function validateAndNormalizeOrderInput(
  rawBody: unknown,
): ValidationResult {
  if (
    typeof rawBody !== "object" ||
    rawBody === null ||
    Array.isArray(rawBody)
  ) {
    return {
      isValid: false,
      error: "El cuerpo de la solicitud debe ser un objeto JSON válido",
    };
  }

  const body = rawBody as Record<string, unknown>;

  // 1. Restaurant Public ID
  const rawRestaurantId = body.restaurant_public_id ?? body.restaurantPublicId;

  if (
    typeof rawRestaurantId !== "string" ||
    !UUID_PATTERN.test(rawRestaurantId.trim())
  ) {
    return {
      isValid: false,
      error: "El identificador del restaurante no es válido",
    };
  }

  const restaurantPublicId = rawRestaurantId.trim();

  // 2. Full Name
  const rawFullName = body.full_name ?? body.fullName ?? body.nombre;

  if (typeof rawFullName !== "string" || !rawFullName.trim()) {
    return {
      isValid: false,
      error: "El nombre completo del cliente es obligatorio",
    };
  }

  const fullName = rawFullName.trim();

  if (fullName.length < 2 || fullName.length > 100) {
    return {
      isValid: false,
      error: "El nombre completo debe tener entre 2 y 100 caracteres",
    };
  }

  // 3. Phone
  const rawPhone = body.phone ?? body.telefono;

  if (typeof rawPhone !== "string" || !rawPhone.trim()) {
    return {
      isValid: false,
      error: "El número de teléfono es obligatorio",
    };
  }

  const phone = rawPhone.trim();

  if (phone.length < 7 || phone.length > 20) {
    return {
      isValid: false,
      error: "El número de teléfono debe tener entre 7 y 20 caracteres",
    };
  }

  // 4. Origin
  const rawOrigin = body.origin;

  if (typeof rawOrigin !== "string" || !rawOrigin.trim()) {
    return {
      isValid: false,
      error:
        "El origen del pedido es obligatorio (DINE_IN, TAKEAWAY, DELIVERY)",
    };
  }

  const normalizedOrigin = rawOrigin.trim().toUpperCase() as PublicOrderOrigin;

  if (!ALLOWED_ORIGINS.includes(normalizedOrigin)) {
    return {
      isValid: false,
      error:
        "El origen del pedido no es válido. Debe ser DINE_IN, TAKEAWAY o DELIVERY",
    };
  }

  // 5. Fecha y hora local solicitada
  const rawScheduledFor = body.scheduled_for_local ?? body.scheduledForLocal;

  let scheduledForLocal: string | null = null;

  if (
    rawScheduledFor !== undefined &&
    rawScheduledFor !== null &&
    rawScheduledFor !== ""
  ) {
    if (
      typeof rawScheduledFor !== "string" ||
      !isValidLocalDateTime(rawScheduledFor)
    ) {
      return {
        isValid: false,
        error:
          "La fecha y hora solicitada no son válidas. Utiliza el formato YYYY-MM-DDTHH:mm",
      };
    }

    scheduledForLocal = rawScheduledFor;
  }

  if (normalizedOrigin !== "DINE_IN" && scheduledForLocal !== null) {
    return {
      isValid: false,
      error:
        "La programación de fecha y hora solo está habilitada para pedidos DINE_IN",
    };
  }

  // 6. Table Public Code
  let tablePublicCode: string | null = null;

  const rawTableCode = body.table_public_code ?? body.tablePublicCode;

  if (normalizedOrigin === "DINE_IN") {
    if (
      rawTableCode !== undefined &&
      rawTableCode !== null &&
      rawTableCode !== ""
    ) {
      if (
        typeof rawTableCode !== "string" ||
        !TABLE_PUBLIC_CODE_PATTERN.test(rawTableCode.trim())
      ) {
        return {
          isValid: false,
          error: "El código de mesa no es válido",
        };
      }

      tablePublicCode = rawTableCode.trim();
    }

    // DINE_IN puede ser un pedido programado sin mesa o un pedido QR con mesa.
    if (!tablePublicCode && !scheduledForLocal) {
      return {
        isValid: false,
        error:
          "Los pedidos para consumir en el local requieren una mesa QR o una fecha y hora programada",
      };
    }
  }

  // 7. Items
  const rawItems = body.items;

  if (!Array.isArray(rawItems) || rawItems.length === 0) {
    return {
      isValid: false,
      error: "El pedido debe contener al menos un artículo",
    };
  }

  if (rawItems.length > 50) {
    return {
      isValid: false,
      error: "El pedido no puede exceder 50 artículos distintos",
    };
  }

  const items: NormalizedOrderItem[] = [];

  for (let i = 0; i < rawItems.length; i++) {
    const rawItem = rawItems[i];

    if (typeof rawItem !== "object" || rawItem === null) {
      return {
        isValid: false,
        error: `El artículo en la posición ${i + 1} no es válido`,
      };
    }

    const itemObj = rawItem as Record<string, unknown>;

    const rawProductId =
      itemObj.product_id ?? itemObj.productId ?? itemObj.menuItemId;

    if (
      typeof rawProductId !== "string" ||
      !UUID_PATTERN.test(rawProductId.trim())
    ) {
      return {
        isValid: false,
        error: `El artículo en la posición ${i + 1} no tiene un product_id válido`,
      };
    }

    const rawQty = itemObj.quantity;

    if (
      typeof rawQty !== "number" ||
      !Number.isSafeInteger(rawQty) ||
      rawQty <= 0 ||
      rawQty > 99
    ) {
      return {
        isValid: false,
        error: `La cantidad del artículo ${i + 1} debe ser un entero positivo (máximo 99)`,
      };
    }

    items.push({
      product_id: rawProductId.trim(),
      quantity: rawQty,
    });
  }

  // 8. Optional cedula
  const rawCedula = body.cedula;

  const cedula =
    typeof rawCedula === "string" && rawCedula.trim()
      ? rawCedula.trim()
      : undefined;

  return {
    isValid: true,
    data: {
      restaurantPublicId,
      fullName,
      phone,
      origin: normalizedOrigin,
      tablePublicCode,
      scheduledForLocal,
      items,
      cedula,
    },
  };
}

export interface CreatePublicOrderRpcResult {
  order_id: string;
  origin: PublicOrderOrigin;
  table_number: number | null;
  status: string;
  total_amount: number;
  item_count: number;
  scheduled_for: string | null;
}

export interface ExecuteOrderResult {
  status: number;
  body: {
    success: boolean;
    data?: {
      order_id: string;
      origin: PublicOrderOrigin;
      table_number: number | null;
      status: string;
      total_amount: number;
      item_count: number;
      scheduled_for: string | null;
    };
    error?: string;
  };
}

export const publicOrderDb = {
  createOrderRpc: async (params: {
    p_restaurant_public_id: string;
    p_origin: string;
    p_table_public_code: string | null;
    p_customer_name: string;
    p_customer_phone: string;
    p_items: NormalizedOrderItem[];
    p_scheduled_for_local: string | null;
  }) => {
    return supabaseAdmin.rpc("create_public_order", params);
  },
};

export async function executeCreatePublicOrder(
  input: NormalizedOrderInput,
): Promise<ExecuteOrderResult> {
  const { data, error } = await publicOrderDb.createOrderRpc({
    p_restaurant_public_id: input.restaurantPublicId,
    p_origin: input.origin,
    p_table_public_code: input.tablePublicCode,
    p_customer_name: input.fullName,
    p_customer_phone: input.phone,
    p_items: input.items,
    p_scheduled_for_local: input.scheduledForLocal,
  });

  if (error) {
    console.error(
      "Error al ejecutar create_public_order RPC:",
      error.code,
      error.message,
    );

    if (isSchemaNotReady(error.code)) {
      return {
        status: 503,
        body: {
          success: false,
          error:
            "La creación de órdenes públicas no está habilitada en este entorno",
        },
      };
    }

    const msg = error.message || "";

    if (
      msg.includes("RESTAURANT_NOT_FOUND") ||
      msg.includes("INVALID_RESTAURANT_ID")
    ) {
      return {
        status: 404,
        body: {
          success: false,
          error: "No se encontró el restaurante publicado",
        },
      };
    }

    if (msg.includes("TABLE_NOT_FOUND")) {
      return {
        status: 404,
        body: {
          success: false,
          error: "No se encontró la mesa",
        },
      };
    }

    if (msg.includes("PRODUCT_NOT_FOUND")) {
      return {
        status: 404,
        body: {
          success: false,
          error:
            "Uno o más productos no existen o no pertenecen a este restaurante",
        },
      };
    }

    if (msg.includes("PRODUCT_INACTIVE")) {
      return {
        status: 409,
        body: {
          success: false,
          error: "Uno o más productos solicitados no están activos",
        },
      };
    }

    if (msg.includes("PRODUCT_OUT_OF_STOCK")) {
      return {
        status: 409,
        body: {
          success: false,
          error: "Uno o más productos solicitados están agotados",
        },
      };
    }

    if (msg.includes("SCHEDULED_TIME_NOT_FUTURE")) {
      return {
        status: 400,
        body: {
          success: false,
          error: "La fecha y hora del pedido deben estar en el futuro",
        },
      };
    }

    if (
      msg.includes("RESTAURANT_TIMEZONE_NOT_CONFIGURED") ||
      msg.includes("INVALID_RESTAURANT_TIMEZONE")
    ) {
      return {
        status: 409,
        body: {
          success: false,
          error: "El restaurante no tiene una zona horaria válida configurada",
        },
      };
    }

    if (msg.includes("SCHEDULED_TIME_DOES_NOT_EXIST")) {
      return {
        status: 400,
        body: {
          success: false,
          error:
            "La hora seleccionada no existe debido al cambio de horario de la zona horaria del restaurante",
        },
      };
    }

    if (msg.includes("RESTAURANT_CLOSED_AT_REQUESTED_TIME")) {
      return {
        status: 409,
        body: {
          success: false,
          error:
            "El restaurante no está abierto en la fecha y hora seleccionadas",
        },
      };
    }

    if (
      msg.includes("INVALID_ORIGIN") ||
      msg.includes("TABLE_REQUIRED_FOR_DINE_IN") ||
      msg.includes("SCHEDULE_REQUIRED_FOR_DINE_IN") ||
      msg.includes("SCHEDULED_TIME_ONLY_FOR_DINE_IN") ||
      msg.includes("INVALID_SCHEDULED_TIME") ||
      msg.includes("INVALID_QUANTITY") ||
      msg.includes("ITEMS_EMPTY") ||
      msg.includes("TOO_MANY_ITEMS") ||
      msg.includes("INVALID_CUSTOMER_NAME") ||
      msg.includes("INVALID_CUSTOMER_PHONE")
    ) {
      return {
        status: 400,
        body: {
          success: false,
          error: "Los datos de la orden no son válidos",
        },
      };
    }

    return {
      status: 500,
      body: {
        success: false,
        error: "No se pudo crear la orden",
      },
    };
  }

  const result = data as CreatePublicOrderRpcResult;

  return {
    status: 201,
    body: {
      success: true,
      data: {
        order_id: result.order_id,
        origin: result.origin,
        table_number: result.table_number,
        status: result.status,
        total_amount: Number(result.total_amount),
        item_count: Number(result.item_count),
        scheduled_for: result.scheduled_for ?? null,
      },
    },
  };
}
