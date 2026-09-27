import type { UUID } from "./common";

export interface Table {
  id: UUID;
  restaurantId: UUID;
  tableNumber: number;
}

export interface CreateTableInput {
  tableNumber: number;
}

export interface UpdateTableInput {
  tableNumber: number;
}
