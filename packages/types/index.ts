export type UUID = string;
export type ISODateTime = string;

export const FOOD360_TYPES_PACKAGE = "@food360/types";

export interface Restaurant {
  id: UUID;
  name: string;
  slug: string;
  description?: string | null;
  logoUrl?: string | null;
  coverImageUrl?: string | null;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  timezone: string;
  currency: string;
  isActive: boolean;
  createdAt: ISODateTime;
  updatedAt: ISODateTime;
}

export interface Category {
  id: UUID;
  restaurantId: UUID;
  name: string;
  description?: string | null;
  sortOrder: number;
  isActive: boolean;
  createdAt: ISODateTime;
  updatedAt: ISODateTime;
}

export interface Product {
  id: UUID;
  restaurantId: UUID;
  categoryId: UUID;
  name: string;
  description?: string | null;
  price: number;
  imageUrl?: string | null;
  sku?: string | null;
  isAvailable: boolean;
  preparationTimeMinutes?: number | null;
  createdAt: ISODateTime;
  updatedAt: ISODateTime;
}

export interface Table {
  id: UUID;
  restaurantId: UUID;
  code: string;
  name?: string | null;
  capacity: number;
  qrUrl?: string | null;
  isActive: boolean;
  createdAt: ISODateTime;
  updatedAt: ISODateTime;
}

export interface Customer {
  id: UUID;
  restaurantId: UUID;
  firstName: string;
  lastName?: string | null;
  email?: string | null;
  phone?: string | null;
  createdAt: ISODateTime;
  updatedAt: ISODateTime;
}

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "in_progress"
  | "ready"
  | "served"
  | "cancelled"
  | "paid";

export interface Order {
  id: UUID;
  restaurantId: UUID;
  tableId?: UUID | null;
  customerId?: UUID | null;
  status: OrderStatus;
  subtotal: number;
  taxTotal: number;
  discountTotal: number;
  total: number;
  notes?: string | null;
  createdAt: ISODateTime;
  updatedAt: ISODateTime;
}

export interface OrderItem {
  id: UUID;
  orderId: UUID;
  productId: UUID;
  productName: string;
  quantity: number;
  unitPrice: number;
  total: number;
  notes?: string | null;
  createdAt: ISODateTime;
  updatedAt: ISODateTime;
}

export type ReservationStatus =
  | "pending"
  | "confirmed"
  | "seated"
  | "cancelled"
  | "no_show"
  | "completed";

export interface Reservation {
  id: UUID;
  restaurantId: UUID;
  customerId?: UUID | null;
  tableId?: UUID | null;
  status: ReservationStatus;
  partySize: number;
  reservedAt: ISODateTime;
  notes?: string | null;
  createdAt: ISODateTime;
  updatedAt: ISODateTime;
}
