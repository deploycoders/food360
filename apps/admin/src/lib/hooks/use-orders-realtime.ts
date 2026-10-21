"use client";

import { useEffect, useMemo } from "react";

import { createClient } from "@/lib/supabase/client";
import { useRestaurant } from "@/context/RestaurantContext";
import { ordersService } from "@/services/orders.service";
import { mapApiOrder } from "@/lib/orders/order-adapter";

import type { Order } from "@/types/order";

interface UseOrdersRealtimeOptions {
  onOrderUpsert: (order: Order) => void;
  onOrderDelete: (orderId: string) => void;
}

export function useOrdersRealtime({
  onOrderUpsert,
  onOrderDelete,
}: UseOrdersRealtimeOptions) {
  const { restaurantId, loading: restaurantLoading } = useRestaurant();
  const supabase = useMemo(() => createClient(), []);

  useEffect(() => {
    if (restaurantLoading || !restaurantId) return;

    let active = true;
    const pendingSyncs = new Map<string, number>();

    async function syncOrder(orderId: string) {
      const requestId = (pendingSyncs.get(orderId) ?? 0) + 1;
      pendingSyncs.set(orderId, requestId);

      for (let attempt = 0; attempt < 4; attempt++) {
        if (!active) return;

        try {
          const apiOrder = await ordersService.getOrderById(orderId);

          if (!active) return;
          if (pendingSyncs.get(orderId) !== requestId) return;

          onOrderUpsert(mapApiOrder(apiOrder));
          return;
        } catch (error) {
          if (!active) return;

          if (attempt === 3) {
            console.error(
              "[CRM Realtime] No se pudo sincronizar la orden:",
              orderId,
              error,
            );
            return;
          }

          await new Promise((resolve) =>
            setTimeout(resolve, 250 * (attempt + 1)),
          );
        }
      }
    }

    const channel = supabase
      .channel(`crm-orders-${restaurantId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "orders",
          filter: `restaurant_id=eq.${restaurantId}`,
        },
        (payload) => {
          void syncOrder(String(payload.new.id));
        },
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "orders",
          filter: `restaurant_id=eq.${restaurantId}`,
        },
        (payload) => {
          void syncOrder(String(payload.new.id));
        },
      )
      .on(
        "postgres_changes",
        {
          event: "DELETE",
          schema: "public",
          table: "orders",
        },
        (payload) => {
          const id = String(payload.old.id ?? "");
          if (id) onOrderDelete(id);
        },
      )
      .subscribe((status) => {
        console.log("[CRM Realtime] Estado:", status);
      });

    return () => {
      active = false;
      void supabase.removeChannel(channel);
    };
  }, [restaurantId, restaurantLoading, supabase, onOrderUpsert, onOrderDelete]);
}
