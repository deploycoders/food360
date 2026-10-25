"use client";

import { useCallback, useEffect, useState } from "react";

import {
  DEFAULT_DASHBOARD_LAYOUT,
  type DashboardLayout,
  type DashboardSummary,
} from "@/types/dashboard";

import {
  getDashboardPreferences,
  getDashboardSummary,
  saveDashboardPreferences,
} from "@/services/dashboard.service";

import { createClient } from "@/lib/supabase/client";

type SaveState = "idle" | "saving" | "saved" | "error";

export function useDashboard(
  restaurantId: string | null,
  restaurantLoading: boolean,
) {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);

  const [layout, setLayout] = useState<DashboardLayout>(
    DEFAULT_DASHBOARD_LAYOUT,
  );

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [layoutLoaded, setLayoutLoaded] = useState(false);
  const [saveState, setSaveState] = useState<SaveState>("idle");

  /**
   * Actualiza únicamente el resumen.
   * Lo usan el botón manual y la suscripción Realtime.
   */
  const loadSummary = useCallback(async () => {
    if (restaurantLoading || !restaurantId) return;

    setRefreshing(true);

    try {
      const result = await getDashboardSummary();

      setSummary(result);
      setError(null);
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "No se pudieron cargar las métricas.";

      setError(message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [restaurantId, restaurantLoading]);

  /**
   * Carga inicial del resumen y las preferencias.
   */
  useEffect(() => {
    if (restaurantLoading) return;

    if (!restaurantId) {
      setSummary(null);
      setLoading(false);
      setLayoutLoaded(false);
      setError("No se pudo identificar el restaurante actual.");

      return;
    }

    let cancelled = false;

    setLoading(true);
    setError(null);
    setLayoutLoaded(false);
    setSummary(null);

    async function loadInitialDashboard() {
      try {
        const [summaryResult, preferencesResult] = await Promise.all([
          getDashboardSummary(),
          getDashboardPreferences(),
        ]);

        if (cancelled) return;

        setSummary(summaryResult);
        setLayout(preferencesResult.layout ?? DEFAULT_DASHBOARD_LAYOUT);
        setLayoutLoaded(true);
      } catch (err) {
        if (cancelled) return;

        setError(
          err instanceof Error
            ? err.message
            : "No se pudo cargar el dashboard.",
        );
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadInitialDashboard();

    return () => {
      cancelled = true;
    };
  }, [restaurantId, restaurantLoading]);

  /**
   * Supabase Realtime:
   * los eventos invalidan el resumen y provocan una nueva consulta
   * al backend. Se agrupan eventos cercanos para evitar refetches
   * innecesarios durante la creación o actualización de pedidos.
   */
  useEffect(() => {
    if (restaurantLoading || !restaurantId) return;

    const supabase = createClient();

    let disposed = false;
    let refreshTimer: ReturnType<typeof setTimeout> | undefined;

    function scheduleRefresh() {
      if (disposed) return;

      if (refreshTimer) {
        clearTimeout(refreshTimer);
      }

      refreshTimer = setTimeout(() => {
        if (!disposed) {
          void loadSummary();
        }
      }, 400);
    }

    const channel = supabase
      .channel(`dashboard-realtime-${restaurantId}`)

      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "orders",
          filter: `restaurant_id=eq.${restaurantId}`,
        },
        scheduleRefresh,
      )

      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "tables",
          filter: `restaurant_id=eq.${restaurantId}`,
        },
        scheduleRefresh,
      )

      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "products",
          filter: `restaurant_id=eq.${restaurantId}`,
        },
        scheduleRefresh,
      )

      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "categories",
          filter: `restaurant_id=eq.${restaurantId}`,
        },
        scheduleRefresh,
      )

      .subscribe((status, subscriptionError) => {
        if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
          console.warn(
            "No se pudo establecer Supabase Realtime para el Dashboard.",
            status,
            subscriptionError,
          );
        }
      });

    return () => {
      disposed = true;

      if (refreshTimer) {
        clearTimeout(refreshTimer);
      }

      void supabase.removeChannel(channel);
    };
  }, [restaurantId, restaurantLoading, loadSummary]);

  /**
   * Guarda las preferencias del usuario con un pequeño debounce.
   */
  useEffect(() => {
    if (!layoutLoaded || !restaurantId) return;

    let cancelled = false;

    setSaveState("saving");

    const timer = window.setTimeout(() => {
      void saveDashboardPreferences(layout)
        .then(() => {
          if (!cancelled) {
            setSaveState("saved");
          }
        })
        .catch((err: unknown) => {
          if (!cancelled) {
            setSaveState("error");

            console.error(
              "No se pudieron guardar las preferencias del dashboard:",
              err,
            );
          }
        });
    }, 600);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [layout, layoutLoaded, restaurantId]);

  return {
    summary,
    layout,
    setLayout,
    loading,
    refreshing,
    error,
    saveState,
    loadSummary,
  };
}
