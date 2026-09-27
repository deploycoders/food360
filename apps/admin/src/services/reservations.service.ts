import type {
  CreateReservationInput,
  Reservation,
  UpdateReservationInput,
} from "@food360/types";

import { createClient } from "@/lib/supabase/client";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3002";

interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
}

async function getAccessToken(): Promise<string> {
  const supabase = createClient();

  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();

  if (error || !session?.access_token) {
    throw new Error("No hay una sesión activa");
  }

  return session.access_token;
}

async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const token = await getAccessToken();

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...(options.headers ?? {}),
    },
  });

  const body = (await response.json()) as ApiResponse<T>;

  if (!response.ok) {
    throw new Error(body.error ?? "Ocurrió un error al comunicarse con la API");
  }

  return body.data;
}

export async function getReservations(): Promise<Reservation[]> {
  return apiRequest<Reservation[]>("/api/v1/reservations");
}

export async function getReservation(
  reservationId: string,
): Promise<Reservation> {
  return apiRequest<Reservation>(`/api/v1/reservations/${reservationId}`);
}

export async function createReservation(
  input: CreateReservationInput,
): Promise<Reservation> {
  return apiRequest<Reservation>("/api/v1/reservations", {
    method: "POST",
    body: JSON.stringify({
      customer_id: input.customerId ?? null,
      table_id: input.tableId ?? null,
      reservation_date: input.reservationDate,
      party_size: input.partySize,
    }),
  });
}

export async function updateReservation(
  reservationId: string,
  input: UpdateReservationInput,
): Promise<Reservation> {
  return apiRequest<Reservation>(`/api/v1/reservations/${reservationId}`, {
    method: "PATCH",
    body: JSON.stringify({
      ...(input.customerId !== undefined && {
        customer_id: input.customerId,
      }),
      ...(input.tableId !== undefined && {
        table_id: input.tableId,
      }),
      ...(input.reservationDate !== undefined && {
        reservation_date: input.reservationDate,
      }),
      ...(input.partySize !== undefined && {
        party_size: input.partySize,
      }),
    }),
  });
}

export async function confirmReservation(
  reservationId: string,
): Promise<Reservation> {
  return apiRequest<Reservation>(
    `/api/v1/reservations/${reservationId}/confirm`,
    {
      method: "POST",
    },
  );
}

export async function arriveReservation(
  reservationId: string,
): Promise<Reservation> {
  return apiRequest<Reservation>(
    `/api/v1/reservations/${reservationId}/arrive`,
    {
      method: "POST",
    },
  );
}

export async function seatReservation(
  reservationId: string,
): Promise<Reservation> {
  return apiRequest<Reservation>(`/api/v1/reservations/${reservationId}/seat`, {
    method: "POST",
  });
}

export async function completeReservation(
  reservationId: string,
): Promise<Reservation> {
  return apiRequest<Reservation>(
    `/api/v1/reservations/${reservationId}/complete`,
    {
      method: "POST",
    },
  );
}

export async function cancelReservation(
  reservationId: string,
): Promise<Reservation> {
  return apiRequest<Reservation>(
    `/api/v1/reservations/${reservationId}/cancel`,
    {
      method: "POST",
    },
  );
}

export async function markReservationNoShow(
  reservationId: string,
): Promise<Reservation> {
  return apiRequest<Reservation>(
    `/api/v1/reservations/${reservationId}/no-show`,
    {
      method: "POST",
    },
  );
}
