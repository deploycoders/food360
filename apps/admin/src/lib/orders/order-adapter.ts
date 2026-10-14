import type { ApiOrder, ApiOrderStatus } from "@/types/order-api";
import type { Order, OrderItem, OrderStatus, OrderType } from "@/types/order";

const STATUS_MAP: Record<ApiOrderStatus, Exclude<OrderStatus, "all">> = {
  PENDING: "pending",
  CONFIRMED: "confirmed",
  IN_PROGRESS: "in_kitchen",
  READY: "ready",
  SERVED: "served",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
};

function toNumber(value: number | string | null | undefined): number {
  const parsed = Number(value ?? 0);
  return Number.isFinite(parsed) ? parsed : 0;
}

function getOriginType(origin: string | null | undefined): OrderType {
  switch (origin?.toLowerCase()) {
    case "dine_in":
      return "dine_in";
    case "takeaway":
      return "takeaway";
    case "delivery":
      return "delivery";
    default:
      return "other";
  }
}

function getDestination(order: ApiOrder, type: OrderType): string {
  if (order.table_id) {
    return `Mesa · ${order.table_id.slice(0, 8)}`;
  }

  switch (type) {
    case "dine_in":
      return "Consumo en local";
    case "takeaway":
      return "Para llevar";
    case "delivery":
      return "Entrega a domicilio";
    default:
      return order.origin || "Origen no especificado";
  }
}

function mapItem(item: ApiOrder["order_items"][number]): OrderItem {
  return {
    id: item.id,
    productId: item.product_id,
    name: item.product_name,
    qty: item.quantity,
    unitPrice: toNumber(item.unit_price),
  };
}

export function mapApiOrder(apiOrder: ApiOrder): Order {
  const customer = Array.isArray(apiOrder.customers)
    ? apiOrder.customers[0]
    : apiOrder.customers;

  const type = getOriginType(apiOrder.origin);

  return {
    id: apiOrder.id,
    code: `#${apiOrder.id.slice(0, 8).toUpperCase()}`,
    createdAt: apiOrder.created_at,
    type,
    tableOrDestination: getDestination(apiOrder, type),
    customerName: customer?.full_name || "Cliente sin nombre",
    customerPhone: customer?.phone || undefined,
    items: (apiOrder.order_items ?? []).map(mapItem),
    total: toNumber(apiOrder.total_amount),
    status: STATUS_MAP[apiOrder.status ?? "PENDING"],
  };
}

export function mapApiOrders(apiOrders: ApiOrder[]): Order[] {
  return apiOrders.map(mapApiOrder);
}
