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

export type WifiSettingsUpdate = Pick<
  PublicRestaurantPageUpdate,
  "wifiName" | "wifiPassword" | "clearWifiPassword"
>;

export const wifiSettingsService = {
  async update(
    updates: WifiSettingsUpdate,
  ): Promise<PublicRestaurantPageSettings> {
    const response = await apiFetch<ApiResponse<PublicRestaurantPageSettings>>(
      "/configuration/public-page",
      { method: "PATCH", body: JSON.stringify(updates) },
    );
    if (!response.success || !response.data) {
      throw new Error(response.error || "No se pudo guardar la configuración Wi-Fi.");
    }
    return response.data;
  },
};
