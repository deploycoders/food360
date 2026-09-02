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

  createdAt?: string;
  updatedAt?: string;
}

/**
 * Tipo preparado específicamente para la UI del menú.
 *
 * Combina Product + nombre de la categoría.
 */
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

  /**
   * Estado calculado para la interfaz.
   *
   * Un producto está disponible si:
   * - Está activo
   * - No está agotado
   */
  isAvailable: boolean;
}
