import type {
  PublicRestaurantPageSettings,
  PublicRestaurantPageUpdate,
} from "@food360/types";
import { apiFetch } from "@/lib/api-client";

interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
}

export const publicPageService = {
  async get(): Promise<PublicRestaurantPageSettings> {
    const response = await apiFetch<
      ApiResponse<PublicRestaurantPageSettings>
    >("/configuration/public-page");
    if (!response.success || !response.data) {
      throw new Error(response.error || "No se pudo cargar la página pública.");
    }
    return response.data;
  },

  async update(
    updates: Pick<PublicRestaurantPageUpdate, "slug" | "isPublished">,
  ): Promise<PublicRestaurantPageSettings> {
    const response = await apiFetch<
      ApiResponse<PublicRestaurantPageSettings>
    >("/configuration/public-page", {
      method: "PATCH",
      body: JSON.stringify(updates),
    });
    if (!response.success || !response.data) {
      throw new Error(response.error || "No se pudo guardar la página pública.");
    }
    return response.data;
  },
};
