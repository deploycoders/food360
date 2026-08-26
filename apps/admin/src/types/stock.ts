export interface StockItem {
  id: string;
  name: string;
  category: string;
  price: number;
  isAvailable: boolean;
  preparationTime?: string;
}

export type StockFilterType = "all" | "available" | "out_of_stock";
