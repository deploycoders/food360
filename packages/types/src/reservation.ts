import type { ISODateTime, UUID } from "./common";

export type ReservationStatus =
  | "REQUESTED"
  | "CONFIRMED"
  | "ARRIVED"
  | "SEATED"
  | "COMPLETED"
  | "CANCELLED"
  | "NO_SHOW";

export interface Reservation {
  id: UUID;
  restaurantId: UUID;
  customerId: UUID | null;
  tableId: UUID | null;
  reservationDate: ISODateTime;
  partySize: number;
  status: ReservationStatus;
  arrivedAt: ISODateTime | null;
  seatedAt: ISODateTime | null;
  createdAt: ISODateTime;
}

export interface CreateReservationInput {
  customerId?: UUID | null;
  tableId?: UUID | null;
  reservationDate: ISODateTime;
  partySize: number;
}

export interface UpdateReservationInput {
  customerId?: UUID | null;
  tableId?: UUID | null;
  reservationDate?: ISODateTime;
  partySize?: number;
}
