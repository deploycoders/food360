export interface DisponibilityItem {
  id: string;
  name: string;
  categoryId: string | null;
  category: string;
  price: number;
  isAvailable: boolean;
  preparationTime?: string;
}

export type DisponibilityFilterType = "all" | "available" | "out_of_stock";
