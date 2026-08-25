export type UUID = string;
export type ISODateTime = string;

// Re-export or define core domain interfaces
export type OrderStatus =
  | "pending"
  | "confirmed"
  | "in_kitchen"
  | "ready"
  | "delivered"
  | "cancelled"
  | "paid";

export interface Category {
  id: UUID;
  restaurantId: UUID;
  name: string;
  slug: string;
  description?: string | null;
  sortOrder: number;
  isActive: boolean;
  productCount?: number;
  createdAt: ISODateTime;
  updatedAt: ISODateTime;
}

export interface Product {
  id: UUID;
  restaurantId: UUID;
  categoryId: UUID;
  categoryName?: string;
  name: string;
  description?: string | null;
  price: number;
  costPrice?: number | null;
  imageUrl?: string | null;
  sku?: string | null;
  isAvailable: boolean;
  preparationTimeMinutes?: number | null;
  tags?: string[];
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
  totalOrders?: number;
  totalSpent?: number;
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
  modifiers?: string[];
  isCompleted?: boolean;
  createdAt: ISODateTime;
  updatedAt: ISODateTime;
}

export interface Order {
  id: UUID;
  orderNumber: string;
  restaurantId: UUID;
  tableId?: UUID | null;
  tableName?: string | null;
  customerId?: UUID | null;
  customerName?: string | null;
  customerPhone?: string | null;
  status: OrderStatus;
  orderType: "dine_in" | "takeaway" | "delivery";
  items: OrderItem[];
  subtotal: number;
  taxTotal: number;
  discountTotal: number;
  total: number;
  notes?: string | null;
  createdAt: ISODateTime;
  updatedAt: ISODateTime;
}

export type TeamRole = "owner" | "admin" | "manager" | "chef" | "waiter" | "cashier";

export interface TeamMember {
  id: UUID;
  restaurantId: UUID;
  name: string;
  email: string;
  phone?: string | null;
  role: TeamRole;
  isActive: boolean;
  avatarUrl?: string | null;
  lastActiveAt?: ISODateTime | null;
  createdAt: ISODateTime;
}

export interface RestaurantSettings {
  id: UUID;
  name: string;
  legalName?: string;
  slug: string;
  logoUrl?: string | null;
  bannerUrl?: string | null;
  phone: string;
  email: string;
  address: string;
  currency: string;
  currencySymbol: string;
  taxRatePercent: number;
  timeZone: string;
  openingHours: {
    day: string;
    isOpen: boolean;
    openTime: string;
    closeTime: string;
  }[];
  qrSettings: {
    tablePrefix: string;
    totalTables: number;
    allowTableOrdering: boolean;
    requireCustomerInfo: boolean;
  };
}

export interface KPIMetrics {
  totalSalesToday: number;
  salesGrowthPercent: number;
  ordersCountToday: number;
  ordersGrowthPercent: number;
  averageTicket: number;
  activeTablesCount: number;
  totalTablesCount: number;
}

export interface KDSOrder extends Order {
  elapsedMinutes: number;
  isUrgent?: boolean;
}
