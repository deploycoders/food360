import { apiFetch } from "@/lib/api-client";
import type { ApiOrder, ApiResponse, ApiOrderStatus } from "@/types/order-api";

export const ordersService = {
  async getOrders(): Promise<ApiOrder[]> {
    const response = await apiFetch<ApiResponse<ApiOrder[]>>("/orders");
    return response.data;
  },

  async getOrderById(id: string): Promise<ApiOrder> {
    const response = await apiFetch<ApiResponse<ApiOrder>>(
      `/orders/${encodeURIComponent(id)}`,
    );

    return response.data;
  },

  async updateStatus(id: string, status: ApiOrderStatus): Promise<ApiOrder> {
    const response = await apiFetch<ApiResponse<ApiOrder>>(
      `/orders/${encodeURIComponent(id)}/status`,
      {
        method: "PATCH",
        body: JSON.stringify({ status }),
      },
    );

    return response.data;
  },
};
