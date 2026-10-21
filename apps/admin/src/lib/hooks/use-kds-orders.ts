"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRestaurant } from "@/context/RestaurantContext";
import { ordersService } from "@/services/orders.service";
import type { ApiOrderStatus } from "@/types/order-api";
import type {
  KDSColumnStatus,
  KDSOrder,
  KDSOrderStatus,
  KDSOrderItem,
} from "@/types/kds";

type OrderRecord = Record<string, unknown>;

/** Traduce los estados del KDS al formato que exige la API. */
const KDS_TO_API_STATUS: Record<KDSOrderStatus, ApiOrderStatus> = {
  pending: "PENDING",
  confirmed: "CONFIRMED",
  in_kitchen: "IN_PROGRESS",
  ready: "READY",
  served: "SERVED",
  completed: "COMPLETED",
  cancelled: "CANCELLED",
};

const ACTIVE_STATUSES: KDSOrderStatus[] = [
  "pending",
  "confirmed",
  "in_kitchen",
  "ready",
];

const NEXT_STATUS: Partial<Record<KDSOrderStatus, KDSOrderStatus>> = {
  pending: "confirmed",
  confirmed: "in_kitchen",
  in_kitchen: "ready",
  ready: "served",
};

const PREVIOUS_STATUS: Partial<Record<KDSOrderStatus, KDSOrderStatus>> = {
  confirmed: "pending",
  in_kitchen: "confirmed",
  ready: "in_kitchen",
};

function asRecord(value: unknown): OrderRecord | null {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return null;
  }

  return value as OrderRecord;
}

function getValue(record: OrderRecord, ...keys: string[]): unknown {
  for (const key of keys) {
    if (record[key] !== undefined && record[key] !== null) {
      return record[key];
    }
  }

  return undefined;
}

function getText(record: OrderRecord, ...keys: string[]): string | undefined {
  const value = getValue(record, ...keys);

  if (typeof value === "string" && value.trim()) {
    return value.trim();
  }

  if (typeof value === "number" && Number.isFinite(value)) {
    return String(value);
  }

  return undefined;
}

function normalizeStatus(value: unknown): KDSOrderStatus | null {
  if (typeof value !== "string") return null;

  switch (value.trim().toUpperCase()) {
    case "PENDING":
      return "pending";
    case "CONFIRMED":
      return "confirmed";
    case "IN_PROGRESS":
    case "IN_KITCHEN":
    case "IN_PREP":
      return "in_kitchen";
    case "READY":
      return "ready";
    case "SERVED":
      return "served";
    case "COMPLETED":
      return "completed";
    case "CANCELLED":
    case "CANCELED":
      return "cancelled";
    default:
      return null;
  }
}

function mapItems(value: unknown): KDSOrderItem[] {
  if (!Array.isArray(value)) return [];

  return value.flatMap((rawItem, index) => {
    const item = asRecord(rawItem);
    if (!item) return [];

    const product = asRecord(item.product) ?? {};
    const quantity = Number(getValue(item, "quantity", "qty"));

    return [
      {
        id: getText(item, "id") ?? `item-${index}`,
        name:
          getText(item, "product_name", "productName", "name") ??
          getText(product, "name") ??
          "Platillo sin nombre",
        qty: Number.isFinite(quantity) && quantity > 0 ? quantity : 1,
        notes:
          getText(
            item,
            "notes",
            "special_instructions",
            "specialInstructions",
          ) ?? undefined,
      },
    ];
  });
}

function mapOrder(value: unknown): KDSOrder | null {
  const record = asRecord(value);
  if (!record) return null;

  const id = getText(record, "id", "order_id", "orderId");
  const status = normalizeStatus(
    getValue(record, "status", "order_status", "orderStatus"),
  );

  if (!id || !status) return null;

  const tableRecord = asRecord(getValue(record, "table", "tables"));

  const customer = asRecord(getValue(record, "customers", "customer"));

  const origin = (
    getText(record, "origin", "order_type", "orderType") ?? ""
  ).toUpperCase();

  const tableName =
    getText(record, "table_name", "tableName") ??
    (tableRecord
      ? getText(
          tableRecord,
          "name",
          "label",
          "table_number",
          "tableNumber",
          "number",
        )
      : undefined) ??
    (origin.includes("DELIVERY")
      ? "Delivery"
      : origin.includes("TAKEAWAY") ||
          origin.includes("PICKUP") ||
          origin.includes("TAKE_OUT")
        ? "Para llevar"
        : "Mesa sin identificar");

  const rawNumber = getText(
    record,
    "order_number",
    "orderNumber",
    "number",
    "folio",
    "code",
  );

  const createdAt =
    getText(record, "created_at", "createdAt", "ordered_at") ?? "";

  const allergyNote =
    getText(record, "allergy_note", "allergyNote", "allergies") ??
    (customer
      ? getText(customer, "allergy_note", "allergyNote", "allergies")
      : undefined);

  const rawItems = getValue(record, "order_items", "orderItems", "items");

  return {
    id,
    number: rawNumber
      ? rawNumber.startsWith("#")
        ? rawNumber
        : `#${rawNumber}`
      : `#${id.slice(0, 6).toUpperCase()}`,
    table: tableName,
    createdAt,
    timeElapsed: 0,
    allergyNote,
    items: mapItems(rawItems),
    status,
  };
}

function getElapsedMinutes(createdAt: string, now: number): number {
  const timestamp = Date.parse(createdAt);

  if (!Number.isFinite(timestamp)) return 0;

  return Math.max(0, Math.floor((now - timestamp) / 60_000));
}

function getErrorMessage(error: unknown): string {
  return error instanceof Error
    ? error.message
    : "No se pudo completar la operación.";
}

export function useKDSOrders() {
  const { restaurantId, loading: restaurantLoading } = useRestaurant();

  const [allOrders, setAllOrders] = useState<KDSOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingIds, setUpdatingIds] = useState<Set<string>>(new Set());
  const [realtimeStatus, setRealtimeStatus] = useState<
    "connecting" | "connected" | "disconnected" | "error"
  >("connecting");
  const [now, setNow] = useState(() => Date.now());

  const inFlight = useRef(new Set<string>());
  const mounted = useRef(false);
  const alertedOrderIds = useRef(new Set<string>());

  useEffect(() => {
    mounted.current = true;

    return () => {
      mounted.current = false;
    };
  }, []);

  const loadOrders = useCallback(async () => {
    if (restaurantLoading) return;

    if (!restaurantId) {
      setAllOrders([]);
      setLoading(false);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await ordersService.getOrders();

      if (!mounted.current) return;

      const mappedOrders = response
        .map(mapOrder)
        .filter((order): order is KDSOrder => order !== null);

      setAllOrders((current) => {
        // No sobrescribir el estado optimista de una orden
        // mientras su actualización esté pendiente.
        const pendingOrders = new Map(
          current
            .filter((order) => inFlight.current.has(order.id))
            .map((order) => [order.id, order]),
        );

        return mappedOrders.map((order) => {
          const pending = pendingOrders.get(order.id);

          return pending ? { ...order, status: pending.status } : order;
        });
      });
    } catch (error: unknown) {
      console.error("Error cargando órdenes del KDS:", error);

      if (mounted.current) {
        setError(getErrorMessage(error));
      }
    } finally {
      if (mounted.current) {
        setLoading(false);
      }
    }
  }, [restaurantId, restaurantLoading]);

  /**
   * Recupera la orden completa mediante la API.
   * Reintentamos porque, al crear una orden, los artículos
   * pueden insertarse después del registro principal.
   */
  const syncOrder = useCallback(
    async (id: string) => {
      if (!restaurantId || !mounted.current) return;

      for (let attempt = 0; attempt < 3; attempt++) {
        try {
          const response = await ordersService.getOrderById(id);

          if (!mounted.current) return;

          const order = mapOrder(response);

          if (!order) {
            // Una respuesta incompleta no debe borrar una orden existente.
            return;
          }

          setAllOrders((current) => {
            const index = current.findIndex((item) => item.id === order.id);

            if (index === -1) {
              return [...current, order];
            }

            return current.map((item) => {
              if (item.id !== order.id) return item;

              // Mientras una petición optimista está pendiente,
              // conservamos el estado local hasta resolverla.
              if (inFlight.current.has(order.id)) {
                return {
                  ...order,
                  status: item.status,
                };
              }

              return order;
            });
          });

          return;
        } catch (error: unknown) {
          if (attempt < 2) {
            await new Promise<void>((resolve) => {
              window.setTimeout(resolve, 300 * (attempt + 1));
            });
          } else {
            console.error(`No se pudo sincronizar la orden ${id}:`, error);

            // Una carga completa permite reconciliar la lista
            // si la orden ya no existe o la API no la devuelve.
            await loadOrders();
          }
        }
      }
    },
    [restaurantId, loadOrders],
  );

  // Carga inicial y actualización del contador de tiempo.
  useEffect(() => {
    if (restaurantLoading) return;

    void loadOrders();

    const intervalId = window.setInterval(() => {
      setNow(Date.now());
    }, 60_000);

    return () => window.clearInterval(intervalId);
  }, [restaurantLoading, restaurantId, loadOrders]);

  // Suscripción Realtime limitada al restaurante activo.
  useEffect(() => {
    if (restaurantLoading) return;

    if (!restaurantId) {
      setRealtimeStatus("disconnected");
      return;
    }

    let active = true;
    const supabase = createClient();

    setRealtimeStatus("connecting");

    const channel = supabase
      .channel(`kds-orders-${restaurantId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "orders",
          filter: `restaurant_id=eq.${restaurantId}`,
        },
        (payload) => {
          const row = payload.new as Record<string, unknown>;
          const id = getText(row, "id");

          if (!id) return;

          // Sincroniza la orden completa con la API.
          void syncOrder(id);

          // Evita alertas repetidas para la misma orden.
          if (alertedOrderIds.current.has(id)) return;

          alertedOrderIds.current.add(id);

          // El KDSLayout se encarga de reproducir el sonido.
          window.dispatchEvent(
            new CustomEvent("food360:kds-new-order", {
              detail: { orderId: id },
            }),
          );
        },
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "orders",
          filter: `restaurant_id=eq.${restaurantId}`,
        },
        (payload) => {
          const row = payload.new as Record<string, unknown>;
          const id = getText(row, "id");

          if (id) void syncOrder(id);
        },
      )
      .on(
        "postgres_changes",
        {
          event: "DELETE",
          schema: "public",
          table: "orders",
        },
        () => {
          // En DELETE no dependemos de que el evento incluya
          // restaurant_id: reconciliamos mediante la API autorizada.
          void loadOrders();
        },
      )
      .subscribe((status) => {
        if (!active) return;

        if (status === "SUBSCRIBED") {
          setRealtimeStatus("connected");
          void loadOrders();
        } else if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
          setRealtimeStatus("error");
        } else if (status === "CLOSED") {
          setRealtimeStatus("disconnected");
        }
      });

    return () => {
      active = false;
      setRealtimeStatus("disconnected");
      void supabase.removeChannel(channel);
    };
  }, [restaurantId, restaurantLoading, syncOrder, loadOrders]);

  const updateOrderStatus = useCallback(
    async (id: string, status: KDSOrderStatus): Promise<boolean> => {
      if (inFlight.current.has(id)) return false;

      const previousOrder = allOrders.find((order) => order.id === id);

      if (!previousOrder || previousOrder.status === status) {
        return false;
      }

      const previousStatus = previousOrder.status;

      inFlight.current.add(id);

      setUpdatingIds((current) => new Set(current).add(id));
      setError(null);

      // Actualización optimista: la interfaz responde inmediatamente.
      setAllOrders((current) =>
        current.map((order) =>
          order.id === id ? { ...order, status } : order,
        ),
      );

      try {
        await ordersService.updateStatus(id, KDS_TO_API_STATUS[status]);

        // Reconciliamos con la respuesta real del servidor.
        // Si Realtime ya actualizó la orden, syncOrder respetará
        // el estado optimista mientras la petición siga pendiente.
        return true;
      } catch (error: unknown) {
        console.error("Error actualizando estado:", error);

        setAllOrders((current) =>
          current.map((order) =>
            order.id === id && order.status === status
              ? { ...order, status: previousStatus }
              : order,
          ),
        );

        setError(getErrorMessage(error));
        return false;
      } finally {
        inFlight.current.delete(id);

        setUpdatingIds((current) => {
          const next = new Set(current);
          next.delete(id);
          return next;
        });

        // Al finalizar la petición, recuperamos el estado confirmado
        // por el servidor, incluidos cambios de otros dispositivos.
        void syncOrder(id);
      }
    },
    [allOrders, syncOrder],
  );

  const advanceOrder = useCallback(
    async (id: string) => {
      const order = allOrders.find((item) => item.id === id);
      if (!order) return;

      const nextStatus = NEXT_STATUS[order.status];

      if (nextStatus) {
        await updateOrderStatus(id, nextStatus);
      }
    },
    [allOrders, updateOrderStatus],
  );

  const regressOrder = useCallback(
    async (id: string) => {
      const order = allOrders.find((item) => item.id === id);
      if (!order) return;

      const previousStatus = PREVIOUS_STATUS[order.status];

      if (previousStatus) {
        await updateOrderStatus(id, previousStatus);
      }
    },
    [allOrders, updateOrderStatus],
  );

  const moveOrder = useCallback(
    async (id: string, status: KDSColumnStatus) => {
      const order = allOrders.find((item) => item.id === id);

      if (!order || order.status === status) return;

      await updateOrderStatus(id, status);
    },
    [allOrders, updateOrderStatus],
  );

  const orders = allOrders
    .filter((order) => ACTIVE_STATUSES.includes(order.status))
    .map((order) => ({
      ...order,
      timeElapsed: getElapsedMinutes(order.createdAt, now),
    }));

  const deliveredCount = allOrders.filter((order) =>
    ["served", "completed"].includes(order.status),
  ).length;

  return {
    orders,
    deliveredCount,
    loading,
    error,
    updatingIds,
    realtimeStatus,
    refresh: loadOrders,
    advanceOrder,
    regressOrder,
    moveOrder,
  };
}
