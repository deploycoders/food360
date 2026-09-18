export interface Category {
  id: string;
  restaurantId: string;
  name: string;
  sortOrder: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Product {
  id: string;

  restaurantId: string;
  categoryId: string | null;

  name: string;
  description: string | null;
  price: number;

  preparationTimeMinutes: number | null;

  imageUrl: string | null;

  is3d: boolean;
  glbUrl: string | null;
  usdzUrl: string | null;

  isActive: boolean;
  isOutOfStock: boolean;
  deactivationReason: string | null;

  createdAt?: string;
  updatedAt?: string;
}

export interface Dish {
  id: string;

  categoryId: string | null;
  category: string;

  name: string;
  description: string;

  price: number;
  prepTimeMinutes: number;

  imageUrl?: string;

  is3d: boolean;
  glbUrl?: string;
  usdzUrl?: string;

  isActive: boolean;
  isOutOfStock: boolean;
  deactivationReason?: string;

  isAvailable: boolean;
}
