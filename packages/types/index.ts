export type UUID = string;
export type ISODateTime = string;

export const FOOD360_TYPES_PACKAGE = "@food360/types";

// ============================================================
// RESTAURANT
// ============================================================

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

// ============================================================
// CATEGORY
// ============================================================

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

// ============================================================
// PRODUCT
// ============================================================

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

// ============================================================
// TABLES
// ============================================================

export interface Table {
  id: UUID;
  restaurantId: UUID;
  tableNumber: number;
}

export type TableStatus = "FREE" | "OCCUPIED";

export interface TableWithStatus extends Table {
  status: TableStatus;
  activeOrdersCount: number;
  reservationCount: number;
}

export interface CreateTableInput {
  tableNumber: number;
}

export interface UpdateTableInput {
  tableNumber: number;
}

// ============================================================
// CUSTOMER
// ============================================================

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

// ============================================================
// ORDERS
// ============================================================

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

// ============================================================
// RESERVATIONS
// ============================================================

export type ReservationStatus =
  | "REQUESTED"
  | "CONFIRMED"
  | "ARRIVED"
  | "SEATED"
  | "COMPLETED"
  | "CANCELLED"
  | "NO_SHOW";

export interface Reservation {
  id: UUID;
  restaurantId: UUID;
  customerId: UUID | null;
  tableId: UUID | null;

  reservationDate: ISODateTime;
  partySize: number;

  status: ReservationStatus;

  arrivedAt: ISODateTime | null;
  seatedAt: ISODateTime | null;

  createdAt: ISODateTime;
}

export interface CreateReservationInput {
  customerId?: UUID | null;
  tableId?: UUID | null;
  reservationDate: ISODateTime;
  partySize: number;
}

export interface UpdateReservationInput {
  customerId?: UUID | null;
  tableId?: UUID | null;
  reservationDate?: ISODateTime;
  partySize?: number;
}

export type ReservationAction =
  | "confirm"
  | "arrive"
  | "seat"
  | "complete"
  | "cancel"
  | "no_show";
