export type OrderStatus =
  | "all"
  | "pending"
  | "confirmed"
  | "in_kitchen"
  | "ready"
  | "served"
  | "completed"
  | "cancelled";

export type OrderType = "dine_in" | "takeaway" | "delivery" | "other";

export interface OrderItem {
  id: string;
  productId: string | null;
  name: string;
  qty: number;
  unitPrice: number;
  notes?: string;
}

export interface Order {
  id: string;
  code: string;
  createdAt: string;
  type: OrderType;
  tableOrDestination: string;
  customerName: string;
  customerPhone?: string;
  items: OrderItem[];
  total: number;
  status: Exclude<OrderStatus, "all">;
}
