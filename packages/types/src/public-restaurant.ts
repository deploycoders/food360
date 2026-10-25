export interface PublicRestaurant {
  publicId: string;
  name: string;
  slug: string;
  phone: string | null;
  address: string | null;
  currency: string | null;
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
