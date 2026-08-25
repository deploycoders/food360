export type OrderStatus =
  | "all"
  | "pending"
  | "in_kitchen"
  | "ready"
  | "delivered"
  | "paid"
  | "cancelled";

export type OrderType = "dine_in" | "takeaway" | "delivery";

export interface OrderItem {
  id: string;
  name: string; // <-- Asegúrate de que esta línea exista
  qty: number;
  unitPrice: number;
  notes?: string;
}

export interface Order {
  id: string;
  code: string; // ej: #F360-101
  createdAt: string; // ej: 2026-08-24 14:32
  type: OrderType;
  tableOrDestination: string; // ej: Mesa 04 (Salón) o Para Llevar
  customerName: string;
  customerPhone?: string;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  total: number;
  status: OrderStatus;
  paymentStatus: "paid" | "pending" | "refunded";
  paymentMethod?: "Efectivo" | "Tarjeta" | "Transferencia" | "Zelle";
}
