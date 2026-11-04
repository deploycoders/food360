export interface PublicRestaurant {
  publicId: string;
  name: string;
  slug: string;
  phone: string | null;
  address: string | null;
  currency: string | null;
  logoUrl?: string | null; // NUEVO
  instagramUrl?: string | null;
  tiktokUrl?: string | null;
  whatsappUrl?: string | null;
  googleBusinessUrl?: string | null;
  wifi: {
    ssid: string | null;
    password: string | null;
  };
}

export interface PublicRestaurantResponse {
  success: boolean;
  data?: PublicRestaurant;
  error?: string;
}

export interface PublicTable {
  publicCode: string;
  tableNumber: number;
  restaurant: PublicRestaurant;
}

export interface PublicTableResponse {
  success: boolean;
  data?: PublicTable;
  error?: string;
}

export interface PublicRestaurantPageSettings {
  publicId: string;
  slug: string;
  isPublished: boolean;
  wifiName: string;
  wifiPasswordConfigured: boolean;
  instagramUrl: string | null;
  googleBusinessUrl: string | null;
  tiktokUrl: string | null;
  whatsappUrl: string | null;
  socialFieldsAvailable: boolean;
}

export interface PublicRestaurantPageUpdate {
  slug?: string;
  isPublished?: boolean;
  wifiName?: string;
  wifiPassword?: string;
  clearWifiPassword?: boolean;
  instagramUrl?: string | null;
  googleBusinessUrl?: string | null;
  tiktokUrl?: string | null;
  whatsappUrl?: string | null;
}

export type PublicOrderOrigin = "DINE_IN" | "TAKEAWAY" | "DELIVERY";

export interface PublicOrderItemInput {
  productId: string;
  quantity: number;
}

export interface CreatePublicOrderPayload {
  restaurantPublicId: string;
  fullName: string;
  phone: string;
  origin: PublicOrderOrigin;
  tablePublicCode?: string | null;
  items: PublicOrderItemInput[];
}

export interface PublicOrderData {
  orderId: string;
  origin: PublicOrderOrigin;
  tableNumber: number | null;
  status: string;
  totalAmount: number;
  itemCount: number;
}

export interface PublicOrderResponse {
  success: boolean;
  data?: PublicOrderData;
  error?: string;
}
