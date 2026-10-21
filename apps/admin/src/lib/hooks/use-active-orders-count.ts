"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { createClient } from "@/lib/supabase/client";
import { useRestaurant } from "@/context/RestaurantContext";
import { ordersService } from "@/services/orders.service";

const ACTIVE_STATUSES = new Set([
  "pending",
  "confirmed",
  "in_kitchen",
  "ready",
  "served",
]);

export function useActiveOrdersCount() {
  const { restaurantId, loading: restaurantLoading } = useRestaurant();
  const supabase = useMemo(() => createClient(), []);
  const [count, setCount] = useState(0);

  const refreshCount = useCallback(async () => {
    if (!restaurantId) {
      setCount(0);
      return;
    }

    try {
      const orders = await ordersService.getOrders();

      setCount(
        orders.filter((order) =>
          ACTIVE_STATUSES.has(String(order.status).toLowerCase()),
        ).length,
      );
    } catch (error) {
      console.error(
        "[Active Orders Count] No se pudo obtener el contador:",
        error,
      );
    }
  }, [restaurantId]);

  useEffect(() => {
    if (restaurantLoading || !restaurantId) {
      setCount(0);
      return;
    }

    let active = true;
    let refreshInProgress = false;
    let refreshQueued = false;

    const refresh = async () => {
      if (!active) return;

      if (refreshInProgress) {
        refreshQueued = true;
        return;
      }

      refreshInProgress = true;

      try {
        await refreshCount();
      } finally {
        refreshInProgress = false;

        if (active && refreshQueued) {
          refreshQueued = false;
          void refresh();
        }
      }
    };

    void refresh();

    const channel = supabase
      .channel(`sidebar-active-orders-${restaurantId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "orders",
          filter: `restaurant_id=eq.${restaurantId}`,
        },
        () => {
          void refresh();
        },
      )
      .subscribe((status) => {
        if (status === "SUBSCRIBED") {
          void refresh();
        }

        console.log("[Active Orders Count] Realtime:", status);
      });

    return () => {
      active = false;
      void supabase.removeChannel(channel);
    };
  }, [restaurantId, restaurantLoading, supabase, refreshCount]);

  return count;
}
