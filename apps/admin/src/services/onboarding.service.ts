import { apiFetch } from "@/lib/api-client";

interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
}

export interface CreateRestaurantInput {
  fullName: string;
  phone: string | null;
  restaurantName: string;
}

export interface CreatedRestaurant {
  restaurant: {
    id: string;
    name: string;
    slug: string;
  };
  role: "owner";
}

export async function createMyRestaurant(
  input: CreateRestaurantInput,
): Promise<CreatedRestaurant> {
  const response = await apiFetch<ApiResponse<CreatedRestaurant>>(
    "/onboarding/restaurant",
    {
      method: "POST",
      body: JSON.stringify(input),
    },
  );

  if (!response.success) {
    throw new Error(response.error || "No se pudo crear el restaurante.");
  }

  return response.data;
}
