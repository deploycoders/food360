import type {
  PublicRestaurantPageSettings,
  PublicRestaurantPageUpdate,
} from "@food360/types";
import { apiFetch } from "@/lib/api-client";

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export type SocialLinksUpdate = Pick<
  PublicRestaurantPageUpdate,
  "instagramUrl" | "googleBusinessUrl" | "tiktokUrl" | "whatsappUrl"
>;

export const socialLinksService = {
  async update(
    updates: SocialLinksUpdate,
  ): Promise<PublicRestaurantPageSettings> {
    const response = await apiFetch<ApiResponse<PublicRestaurantPageSettings>>(
      "/configuration/public-page",
      { method: "PATCH", body: JSON.stringify(updates) },
    );
    if (!response.success || !response.data) {
      throw new Error(response.error || "No se pudieron guardar los enlaces.");
    }
    return response.data;
  },
};
