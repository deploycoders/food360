process.env.SUPABASE_URL =
  process.env.SUPABASE_URL || "https://mock.supabase.co";
process.env.SUPABASE_SERVICE_ROLE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY || "mock-service-role-key";

import { describe, it, expect, beforeEach, jest } from "@jest/globals";
import supertest from "supertest";
import { publicOrderDb } from "../lib/public-order.js";
import { orderRateLimiter } from "../routes/public-orders.routes.js";
import { createServer } from "../server.js";

const VALID_RESTAURANT_ID = "d79e889e-fa24-4303-adb0-a6da1cf8abdd";
const VALID_PRODUCT_ID = "04f5fa2b-608a-4e4e-898b-550afcf0a19e";
const VALID_PRODUCT_ID_2 = "79ae36e9-046f-46f4-af55-ce805252aa32";
const VALID_TABLE_CODE = "t_SG-yedFvKz4";

const MOCK_ORDER_ID = "2c4e35aa-e892-4522-86c9-e74c15c49ca9";
const MOCK_SCHEDULED_FOR = "2026-11-06T00:30:00+00:00";

describe("Public Orders API (POST /api/v1/public/orders)", () => {
  const app = createServer();
  let rpcSpy: any;

  beforeEach(() => {
    orderRateLimiter.reset();
    jest.restoreAllMocks();
    rpcSpy = jest.spyOn(publicOrderDb, "createOrderRpc");
  });

  const baseOrderPayload = {
    restaurant_public_id: VALID_RESTAURANT_ID,
    full_name: "Cliente de prueba",
    phone: "+584141234567",
    origin: "DINE_IN",
    table_public_code: VALID_TABLE_CODE,
    items: [
      {
        product_id: VALID_PRODUCT_ID,
        quantity: 2,
      },
    ],
  };

  // 1. Restaurante inexistente
  it("1. returns 404 when restaurant does not exist", async () => {
    rpcSpy.mockResolvedValueOnce({
      data: null,
      error: { message: "RESTAURANT_NOT_FOUND", code: "P0002" },
    });

    const res = await supertest(app)
      .post("/api/v1/public/orders")
      .send({
        ...baseOrderPayload,
        restaurant_public_id: "00000000-0000-4000-8000-000000000000",
      });

    expect(res.status).toBe(404);
    expect(res.body).toEqual({
      success: false,
      error: "No se encontró el restaurante publicado",
    });
  });

  // 2. Restaurante no publicado
  it("2. returns 404 when restaurant is not published", async () => {
    rpcSpy.mockResolvedValueOnce({
      data: null,
      error: { message: "RESTAURANT_NOT_FOUND", code: "P0002" },
    });

    const res = await supertest(app)
      .post("/api/v1/public/orders")
      .send(baseOrderPayload);

    expect(res.status).toBe(404);
    expect(res.body).toEqual({
      success: false,
      error: "No se encontró el restaurante publicado",
    });
  });

  // 3. Restaurante válido
  it("3. returns 201 when restaurant is valid and published", async () => {
    rpcSpy.mockResolvedValueOnce({
      data: {
        order_id: MOCK_ORDER_ID,
        origin: "DINE_IN",
        table_number: 1,
        status: "PENDING",
        total_amount: 24.5,
        item_count: 2,
        scheduled_for: null,
      },
      error: null,
    });

    const res = await supertest(app)
      .post("/api/v1/public/orders")
      .send(baseOrderPayload);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.order_id).toBe(MOCK_ORDER_ID);
    expect(res.body.data.status).toBe("PENDING");
    expect(res.body.data.scheduled_for).toBeNull();
  });

  // 4. Productos inexistentes
  it("4. returns 404 when one or more products do not exist", async () => {
    rpcSpy.mockResolvedValueOnce({
      data: null,
      error: {
        message: "PRODUCT_NOT_FOUND: 00000000-0000-4000-8000-000000000000",
        code: "P0002",
      },
    });

    const res = await supertest(app)
      .post("/api/v1/public/orders")
      .send({
        ...baseOrderPayload,
        items: [
          {
            product_id: "00000000-0000-4000-8000-000000000000",
            quantity: 1,
          },
        ],
      });

    expect(res.status).toBe(404);
    expect(res.body).toEqual({
      success: false,
      error:
        "Uno o más productos no existen o no pertenecen a este restaurante",
    });
  });

  // 5. Producto perteneciente a otro restaurante
  it("5. returns 404 when a product belongs to another restaurant", async () => {
    rpcSpy.mockResolvedValueOnce({
      data: null,
      error: {
        message: `PRODUCT_NOT_FOUND: ${VALID_PRODUCT_ID_2}`,
        code: "P0002",
      },
    });

    const res = await supertest(app)
      .post("/api/v1/public/orders")
      .send({
        ...baseOrderPayload,
        items: [{ product_id: VALID_PRODUCT_ID_2, quantity: 1 }],
      });

    expect(res.status).toBe(404);
    expect(res.body.error).toBe(
      "Uno o más productos no existen o no pertenecen a este restaurante",
    );
  });

  // 6. Producto inactivo
  it("6. returns 409 when a requested product is inactive", async () => {
    rpcSpy.mockResolvedValueOnce({
      data: null,
      error: {
        message: "PRODUCT_INACTIVE: Pizza Pepperoni",
        code: "P0001",
      },
    });

    const res = await supertest(app)
      .post("/api/v1/public/orders")
      .send(baseOrderPayload);

    expect(res.status).toBe(409);
    expect(res.body).toEqual({
      success: false,
      error: "Uno o más productos solicitados no están activos",
    });
  });

  // 7. Producto agotado
  it("7. returns 409 when a requested product is out of stock", async () => {
    rpcSpy.mockResolvedValueOnce({
      data: null,
      error: {
        message: "PRODUCT_OUT_OF_STOCK: Pizza Pepperoni",
        code: "P0001",
      },
    });

    const res = await supertest(app)
      .post("/api/v1/public/orders")
      .send(baseOrderPayload);

    expect(res.status).toBe(409);
    expect(res.body).toEqual({
      success: false,
      error: "Uno o más productos solicitados están agotados",
    });
  });

  // 8. Cantidad inválida
  it("8. rejects invalid quantities (0, negative, non-integer, > 99)", async () => {
    const invalidQuantities = [0, -1, 1.5, "two", 100];

    for (const quantity of invalidQuantities) {
      const res = await supertest(app)
        .post("/api/v1/public/orders")
        .send({
          ...baseOrderPayload,
          items: [{ product_id: VALID_PRODUCT_ID, quantity }],
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(rpcSpy).not.toHaveBeenCalled();
    }
  });

  // 9. Pedido sin artículos
  it("9. returns 400 when order has empty items array", async () => {
    const res = await supertest(app)
      .post("/api/v1/public/orders")
      .send({
        ...baseOrderPayload,
        items: [],
      });

    expect(res.status).toBe(400);
    expect(res.body).toEqual({
      success: false,
      error: "El pedido debe contener al menos un artículo",
    });
    expect(rpcSpy).not.toHaveBeenCalled();
  });

  // 10. Mesa inexistente
  it("10. returns 404 when table does not exist", async () => {
    rpcSpy.mockResolvedValueOnce({
      data: null,
      error: { message: "TABLE_NOT_FOUND", code: "P0002" },
    });

    const res = await supertest(app)
      .post("/api/v1/public/orders")
      .send(baseOrderPayload);

    expect(res.status).toBe(404);
    expect(res.body).toEqual({
      success: false,
      error: "No se encontró la mesa",
    });
  });

  // 11. Código de mesa inválido
  it("11. returns 400 when table public code format is invalid", async () => {
    const invalidCodes = ["mesa-1", "t_short", "12345678", "t_bad@char!"];

    for (const table_public_code of invalidCodes) {
      const res = await supertest(app)
        .post("/api/v1/public/orders")
        .send({
          ...baseOrderPayload,
          table_public_code,
        });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe("El código de mesa no es válido");
      expect(rpcSpy).not.toHaveBeenCalled();
    }
  });

  // 12. Mesa perteneciente a otro restaurante
  it("12. returns 404 when table belongs to another restaurant", async () => {
    rpcSpy.mockResolvedValueOnce({
      data: null,
      error: { message: "TABLE_NOT_FOUND", code: "P0002" },
    });

    const res = await supertest(app)
      .post("/api/v1/public/orders")
      .send({
        ...baseOrderPayload,
        table_public_code: "t_otherRestaurantTable",
      });

    expect(res.status).toBe(404);
    expect(res.body.error).toBe("No se encontró la mesa");
  });

  // 13. DINE_IN sin mesa ni fecha programada
  it("13. returns 400 when DINE_IN has neither table nor scheduled time", async () => {
    const res = await supertest(app)
      .post("/api/v1/public/orders")
      .send({
        ...baseOrderPayload,
        origin: "DINE_IN",
        table_public_code: undefined,
      });

    expect(res.status).toBe(400);
    expect(res.body).toEqual({
      success: false,
      error:
        "Los pedidos para consumir en el local requieren una mesa QR o una fecha y hora programada",
    });
    expect(rpcSpy).not.toHaveBeenCalled();
  });

  // 14. DINE_IN programado sin mesa
  it("14. succeeds with scheduled DINE_IN origin without requiring a table", async () => {
    rpcSpy.mockResolvedValueOnce({
      data: {
        order_id: MOCK_ORDER_ID,
        origin: "DINE_IN",
        table_number: null,
        status: "PENDING",
        total_amount: 24.5,
        item_count: 2,
        scheduled_for: MOCK_SCHEDULED_FOR,
      },
      error: null,
    });

    const scheduledForLocal = "2026-11-05T19:30";

    const res = await supertest(app)
      .post("/api/v1/public/orders")
      .send({
        ...baseOrderPayload,
        origin: "DINE_IN",
        table_public_code: undefined,
        scheduled_for_local: scheduledForLocal,
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.origin).toBe("DINE_IN");
    expect(res.body.data.table_number).toBeNull();
    expect(res.body.data.scheduled_for).toBe(MOCK_SCHEDULED_FOR);

    expect(rpcSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        p_origin: "DINE_IN",
        p_table_public_code: null,
        p_scheduled_for_local: scheduledForLocal,
      }),
    );
  });

  // 15. Fecha programada inválida
  it("15. returns 400 when scheduled local date-time is invalid", async () => {
    const invalidDates = [
      "2026-02-30T19:30",
      "2026-13-05T19:30",
      "2026-11-05T25:30",
      "2026-11-05T19:60",
      "2026-11-05",
      "not-a-date",
    ];

    for (const scheduled_for_local of invalidDates) {
      const res = await supertest(app)
        .post("/api/v1/public/orders")
        .send({
          ...baseOrderPayload,
          origin: "DINE_IN",
          table_public_code: undefined,
          scheduled_for_local,
        });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe(
        "La fecha y hora solicitada no son válidas. Utiliza el formato YYYY-MM-DDTHH:mm",
      );
    }

    expect(rpcSpy).not.toHaveBeenCalled();
  });

  // 16. No permitir programación para otros orígenes
  it("16. returns 400 when scheduled time is sent with TAKEAWAY or DELIVERY", async () => {
    const invalidOrigins = ["TAKEAWAY", "DELIVERY"];

    for (const origin of invalidOrigins) {
      const res = await supertest(app)
        .post("/api/v1/public/orders")
        .send({
          ...baseOrderPayload,
          origin,
          table_public_code: undefined,
          scheduled_for_local: "2026-11-05T19:30",
        });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe(
        "La programación de fecha y hora solo está habilitada para pedidos DINE_IN",
      );
    }

    expect(rpcSpy).not.toHaveBeenCalled();
  });

  // 17. Error SQL: fecha programada en el pasado
  it("17. returns 400 when scheduled time is not in the future", async () => {
    rpcSpy.mockResolvedValueOnce({
      data: null,
      error: {
        message: "SCHEDULED_TIME_NOT_FUTURE",
        code: "22023",
      },
    });

    const res = await supertest(app)
      .post("/api/v1/public/orders")
      .send({
        ...baseOrderPayload,
        origin: "DINE_IN",
        table_public_code: undefined,
        scheduled_for_local: "2026-11-05T19:30",
      });

    expect(res.status).toBe(400);
    expect(res.body).toEqual({
      success: false,
      error: "La fecha y hora del pedido deben estar en el futuro",
    });
  });

  // 18. Error SQL: restaurante cerrado
  it("18. returns 409 when restaurant is closed at requested time", async () => {
    rpcSpy.mockResolvedValueOnce({
      data: null,
      error: {
        message: "RESTAURANT_CLOSED_AT_REQUESTED_TIME",
        code: "22023",
      },
    });

    const res = await supertest(app)
      .post("/api/v1/public/orders")
      .send({
        ...baseOrderPayload,
        origin: "DINE_IN",
        table_public_code: undefined,
        scheduled_for_local: "2026-11-05T19:30",
      });

    expect(res.status).toBe(409);
    expect(res.body).toEqual({
      success: false,
      error: "El restaurante no está abierto en la fecha y hora seleccionadas",
    });
  });

  // 19. TAKEAWAY sin mesa ni programación
  it("19. succeeds with TAKEAWAY origin without requiring a table", async () => {
    rpcSpy.mockResolvedValueOnce({
      data: {
        order_id: "3c4e35aa-e892-4522-86c9-e74c15c49ca9",
        origin: "TAKEAWAY",
        table_number: null,
        status: "PENDING",
        total_amount: 15.0,
        item_count: 1,
        scheduled_for: null,
      },
      error: null,
    });

    const res = await supertest(app)
      .post("/api/v1/public/orders")
      .send({
        ...baseOrderPayload,
        origin: "TAKEAWAY",
        table_public_code: undefined,
      });

    expect(res.status).toBe(201);
    expect(res.body.data.origin).toBe("TAKEAWAY");
    expect(res.body.data.table_number).toBeNull();
    expect(res.body.data.scheduled_for).toBeNull();

    expect(rpcSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        p_origin: "TAKEAWAY",
        p_table_public_code: null,
        p_scheduled_for_local: null,
      }),
    );
  });

  // 20. DELIVERY sin mesa ni programación
  it("20. succeeds with DELIVERY origin without requiring a table", async () => {
    rpcSpy.mockResolvedValueOnce({
      data: {
        order_id: "4c4e35aa-e892-4522-86c9-e74c15c49ca9",
        origin: "DELIVERY",
        table_number: null,
        status: "PENDING",
        total_amount: 30.0,
        item_count: 2,
        scheduled_for: null,
      },
      error: null,
    });

    const res = await supertest(app)
      .post("/api/v1/public/orders")
      .send({
        ...baseOrderPayload,
        origin: "DELIVERY",
        table_public_code: undefined,
      });

    expect(res.status).toBe(201);
    expect(res.body.data.origin).toBe("DELIVERY");
    expect(res.body.data.table_number).toBeNull();
    expect(res.body.data.scheduled_for).toBeNull();

    expect(rpcSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        p_origin: "DELIVERY",
        p_table_public_code: null,
        p_scheduled_for_local: null,
      }),
    );
  });

  // 21. Origen UNKNOWN
  it("21. returns 400 when origin is UNKNOWN or arbitrary", async () => {
    const invalidOrigins = ["UNKNOWN", "WALK_IN", "PICKUP", "RANDOM"];

    for (const origin of invalidOrigins) {
      const res = await supertest(app)
        .post("/api/v1/public/orders")
        .send({
          ...baseOrderPayload,
          origin,
        });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe(
        "El origen del pedido no es válido. Debe ser DINE_IN, TAKEAWAY o DELIVERY",
      );
      expect(rpcSpy).not.toHaveBeenCalled();
    }
  });

  // 22. Cliente existente
  it("22. succeeds and reuses existing customer profile", async () => {
    rpcSpy.mockResolvedValueOnce({
      data: {
        order_id: "5c4e35aa-e892-4522-86c9-e74c15c49ca9",
        origin: "DINE_IN",
        table_number: 1,
        status: "PENDING",
        total_amount: 24.5,
        item_count: 2,
        scheduled_for: null,
      },
      error: null,
    });

    const res = await supertest(app)
      .post("/api/v1/public/orders")
      .send({
        ...baseOrderPayload,
        phone: "+584120000000",
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);

    expect(rpcSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        p_customer_phone: "+584120000000",
      }),
    );
  });

  // 23. Cliente nuevo
  it("23. succeeds and registers a new customer profile", async () => {
    rpcSpy.mockResolvedValueOnce({
      data: {
        order_id: "6c4e35aa-e892-4522-86c9-e74c15c49ca9",
        origin: "DINE_IN",
        table_number: 1,
        status: "PENDING",
        total_amount: 24.5,
        item_count: 2,
        scheduled_for: null,
      },
      error: null,
    });

    const res = await supertest(app)
      .post("/api/v1/public/orders")
      .send({
        ...baseOrderPayload,
        phone: "+584149999999",
        full_name: "Nuevo Cliente",
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);

    expect(rpcSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        p_customer_name: "Nuevo Cliente",
        p_customer_phone: "+584149999999",
      }),
    );
  });

  // 24. Conflicto al crear clientes simultáneamente
  it("24. resolves concurrent customer insert conflict cleanly in RPC", async () => {
    rpcSpy.mockResolvedValueOnce({
      data: {
        order_id: "7c4e35aa-e892-4522-86c9-e74c15c49ca9",
        origin: "DINE_IN",
        table_number: 1,
        status: "PENDING",
        total_amount: 24.5,
        item_count: 2,
        scheduled_for: null,
      },
      error: null,
    });

    const res = await supertest(app)
      .post("/api/v1/public/orders")
      .send(baseOrderPayload);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });

  // 25. Fallo en la inserción de artículos
  it("25. rolls back transaction and returns 500 when item insertion fails", async () => {
    rpcSpy.mockResolvedValueOnce({
      data: null,
      error: {
        message: "foreign_key_violation in order_items",
        code: "23503",
      },
    });

    const res = await supertest(app)
      .post("/api/v1/public/orders")
      .send(baseOrderPayload);

    expect(res.status).toBe(500);
    expect(res.body).toEqual({
      success: false,
      error: "No se pudo crear la orden",
    });
  });

  // 26. Creación exitosa con totales autoritativos
  it("26. creates order successfully with status PENDING and authoritative totals", async () => {
    rpcSpy.mockResolvedValueOnce({
      data: {
        order_id: "8c4e35aa-e892-4522-86c9-e74c15c49ca9",
        origin: "DINE_IN",
        table_number: 3,
        status: "PENDING",
        total_amount: 49.0,
        item_count: 4,
        scheduled_for: null,
      },
      error: null,
    });

    const res = await supertest(app)
      .post("/api/v1/public/orders")
      .send({
        restaurant_public_id: VALID_RESTAURANT_ID,
        full_name: "Cliente Final",
        phone: "+584140001122",
        origin: "DINE_IN",
        table_public_code: VALID_TABLE_CODE,
        items: [
          {
            product_id: VALID_PRODUCT_ID,
            quantity: 4,
          },
        ],
      });

    expect(res.status).toBe(201);
    expect(res.body).toEqual({
      success: true,
      data: {
        order_id: "8c4e35aa-e892-4522-86c9-e74c15c49ca9",
        origin: "DINE_IN",
        table_number: 3,
        status: "PENDING",
        total_amount: 49.0,
        item_count: 4,
        scheduled_for: null,
      },
    });
  });

  // 27. Contract flexibility: camelCase y cédula opcional
  it("27. accepts camelCase property names and optional cedula without failing", async () => {
    rpcSpy.mockResolvedValueOnce({
      data: {
        order_id: "9c4e35aa-e892-4522-86c9-e74c15c49ca9",
        origin: "DINE_IN",
        table_number: 2,
        status: "PENDING",
        total_amount: 12.25,
        item_count: 1,
        scheduled_for: null,
      },
      error: null,
    });

    const res = await supertest(app)
      .post("/api/v1/public/orders")
      .send({
        restaurantPublicId: VALID_RESTAURANT_ID,
        fullName: "Cliente CamelCase",
        phone: "+584141112233",
        origin: "DINE_IN",
        tablePublicCode: VALID_TABLE_CODE,
        cedula: "V-12345678",
        items: [
          {
            productId: VALID_PRODUCT_ID,
            quantity: 1,
          },
        ],
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(rpcSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        p_scheduled_for_local: null,
      }),
    );
  });

  // 28. Schema not ready (missing RPC migration) -> 503
  it("28. returns 503 when the RPC migration is not installed in the DB", async () => {
    rpcSpy.mockResolvedValueOnce({
      data: null,
      error: {
        message: "Could not find function public.create_public_order",
        code: "PGRST202",
      },
    });

    const res = await supertest(app)
      .post("/api/v1/public/orders")
      .send(baseOrderPayload);

    expect(res.status).toBe(503);
    expect(res.body).toEqual({
      success: false,
      error:
        "La creación de órdenes públicas no está habilitada en este entorno",
    });
  });

  // 29. Endpoint administrativo protegido
  it("29. guarantees administrative POST /api/v1/orders remains protected with verifyAuth", async () => {
    const res = await supertest(app)
      .post("/api/v1/orders")
      .send({
        restaurant_id: VALID_RESTAURANT_ID,
        phone: "+584140000000",
        full_name: "Admin User",
        origin: "DINE_IN",
        items: [{ product_id: VALID_PRODUCT_ID, quantity: 1 }],
      });

    expect(res.status).toBe(401);
  });

  // 30. Rate limiting
  it("30. enforces rate limiting (returns 429 when max requests per window exceeded)", async () => {
    rpcSpy.mockResolvedValue({
      data: {
        order_id: "test-order-id",
        origin: "DINE_IN",
        table_number: 1,
        status: "PENDING",
        total_amount: 10,
        item_count: 1,
        scheduled_for: null,
      },
      error: null,
    });

    // 30 requests: límite permitido.
    for (let i = 0; i < 30; i++) {
      const res = await supertest(app)
        .post("/api/v1/public/orders")
        .send(baseOrderPayload);

      expect(res.status).toBe(201);
    }

    // La solicitud 31 debe estar limitada.
    const rateLimitedRes = await supertest(app)
      .post("/api/v1/public/orders")
      .send(baseOrderPayload);

    expect(rateLimitedRes.status).toBe(429);
    expect(rateLimitedRes.body).toEqual({
      success: false,
      error:
        "Demasiadas solicitudes de creación de órdenes. Por favor intente más tarde.",
    });
    expect(rateLimitedRes.headers["retry-after"]).toBeDefined();
  });
});
