export type MenuCategory =
  | "summer-bites"
  | "happy-hour"
  | "fan-tuan"
  | "cold-appetizers"
  | "hot-appetizers"
  | "dim-sum"
  | "main-dishes"
  | "drinks"
  | "desserts"
  | (string & {});

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: MenuCategory;
  emoji?: string;
  image: string;
  available: boolean;
  isPopular?: boolean;
  tags?: string[];
}

export interface CategoryInfo {
  id: MenuCategory;
  label: string;
  emoji?: string;
}

export interface CartItem {
  menuItem: MenuItem;
  quantity: number;
}

export interface CustomerData {
  nombre: string;
  cedula: string;
  telefono: string;
}

/** Canonical order origin for the public client. Never map UNKNOWN to WALK_IN. */
export type OrderOrigin = "DINE_IN" | "TAKEAWAY" | "DELIVERY" | "UNKNOWN";

export interface OrderOriginState {
  origin: OrderOrigin;
  /** Public table code (`t_…`), never the internal UUID. */
  tablePublicCode: string | null;
  tableNumber: number | null;
}

export interface OrderPayload {
  id: string;
  items: {
    menuItemId: string;
    name: string;
    quantity: number;
    unitPrice: number;
    subtotal: number;
  }[];
  customer: CustomerData;
  origin: OrderOrigin;
  tablePublicCode: string | null;
  tableNumber: number | null;
  total: number;
  itemCount: number;
  createdAt: string;
  status: "pending";
}

export interface RestaurantInfo {
  name: string;
  tagline: string;
  description: string;
  logoText: string;
  heroImage: string;
  address: string;
  googleMapsUrl: string;
  openStatus: string;
  openUntil: string;
  whatsapp: string;
  whatsappMessage: string;
  wifi: {
    ssid: string;
    password: string;
  };
  socialLinks: {
    platform: string;
    url: string;
    label: string;
    emoji?: string;
  }[];
  happyHour: {
    title: string;
    schedule: string;
    badge: string;
  };
  currency: string;
  currencySymbol: string;
}
