export interface Dish {
  id: string;
  name: string;
  description: string;
  price: number;
  prepTimeMinutes: number;
  category: string;
  isAvailable: boolean; // true = En Carta, false = Agotado
  imageUrl?: string;
  model3dUrl?: string; // Enlace al modelo .glb para AR / 3D
}

export interface CategoryOption {
  id: string;
  name: string;
}
