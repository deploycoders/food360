import type { UUID } from "./common";

export interface Table {
  id: UUID;
  restaurantId: UUID;
  tableNumber: number;
  publicCode: string;
}

export type TableAvailability = "available" | "occupied";

export interface TableOption extends Table {
  availability: TableAvailability;
}

export interface CreateTableInput {
  tableNumber: number;
}

export interface UpdateTableInput {
  tableNumber: number;
}
