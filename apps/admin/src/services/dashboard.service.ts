import { apiFetch } from "@/lib/api-client";

import type { DashboardLayout, DashboardSummary } from "@/types/dashboard";

interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
}

interface DashboardPreferences {
  layout: DashboardLayout;
  updatedAt: string | null;
}

export async function getDashboardSummary(): Promise<DashboardSummary> {
  const response =
    await apiFetch<ApiResponse<DashboardSummary>>("/dashboard/summary");

  return response.data;
}

export async function getDashboardPreferences(): Promise<DashboardPreferences> {
  const response = await apiFetch<ApiResponse<DashboardPreferences>>(
    "/dashboard/preferences",
  );

  return response.data;
}

export async function saveDashboardPreferences(
  layout: DashboardLayout,
): Promise<DashboardPreferences> {
  const response = await apiFetch<ApiResponse<DashboardPreferences>>(
    "/dashboard/preferences",
    {
      method: "PUT",
      body: JSON.stringify({ layout }),
    },
  );

  return response.data;
}
