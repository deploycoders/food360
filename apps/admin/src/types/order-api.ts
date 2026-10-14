export type ApiOrderStatus =
  | "PENDING"
  | "CONFIRMED"
  | "IN_PROGRESS"
  | "READY"
  | "SERVED"
  | "COMPLETED"
  | "CANCELLED";

export interface ApiOrderItem {
  id: string;
  order_id: string;
  product_id: string | null;
  product_name: string;
  quantity: number;
  unit_price: number | string;
}

export interface ApiCustomer {
  id: string;
  full_name: string;
  phone: string;
}

export interface ApiOrder {
  id: string;
  restaurant_id: string;
  customer_id: string | null;
  table_id: string | null;
  origin: string;
  status: ApiOrderStatus | null;
  total_amount: number | string;
  created_at: string;
  updated_at: string;
  customers: ApiCustomer | ApiCustomer[] | null;
  order_items: ApiOrderItem[];
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
}

export interface CreateOrderPayload {
  phone: string;
  full_name: string;
  origin: string;
  items: {
    product_id: string;
    quantity: number;
  }[];
}

export interface UpdateOrderStatusPayload {
  status: ApiOrderStatus;
}
