export type KDSOrderStatus =
  | "pending"
  | "confirmed"
  | "in_kitchen"
  | "ready"
  | "served"
  | "completed"
  | "cancelled";

export type KDSColumnStatus = "pending" | "in_kitchen" | "ready";

export interface KDSOrderItem {
  id: string;
  name: string;
  qty: number;
  notes?: string;
}

export interface KDSOrder {
  id: string;
  number: string;
  table: string;
  createdAt: string;
  timeElapsed: number;
  allergyNote?: string;
  items: KDSOrderItem[];
  status: KDSOrderStatus;
}
