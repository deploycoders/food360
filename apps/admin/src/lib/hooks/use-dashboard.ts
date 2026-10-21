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

type SaveState = "idle" | "saving" | "saved" | "error";

export function useDashboard(restaurantId: string | null, restaurantLoading: boolean) {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [layout, setLayout] = useState<DashboardLayout>(DEFAULT_DASHBOARD_LAYOUT);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [layoutLoaded, setLayoutLoaded] = useState(false);
  const [saveState, setSaveState] = useState<SaveState>("idle");

  const loadSummary = useCallback(async () => {
    setRefreshing(true);
    try {
      setSummary(await getDashboardSummary());
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudieron cargar las métricas.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    if (restaurantLoading) return;
    if (!restaurantId) {
      setLoading(false);
      setLayoutLoaded(false);
      setError("No se pudo identificar el restaurante actual.");
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);
    setLayoutLoaded(false);

    void Promise.all([getDashboardSummary(), getDashboardPreferences()])
      .then(([summaryResult, preferencesResult]) => {
        if (cancelled) return;
        setSummary(summaryResult);
        setLayout(preferencesResult.layout ?? DEFAULT_DASHBOARD_LAYOUT);
        setLayoutLoaded(true);
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "No se pudo cargar el dashboard.");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [restaurantId, restaurantLoading]);

  useEffect(() => {
    if (!layoutLoaded || !restaurantId) return;
    let cancelled = false;
    setSaveState("saving");
    const timer = window.setTimeout(() => {
      void saveDashboardPreferences(layout)
        .then(() => {
          if (!cancelled) setSaveState("saved");
        })
        .catch((err: unknown) => {
          if (!cancelled) {
            setSaveState("error");
            console.error("No se pudieron guardar las preferencias del dashboard:", err);
          }
        });
    }, 600);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [layout, layoutLoaded, restaurantId]);

  return { summary, layout, setLayout, loading, refreshing, error, saveState, loadSummary };
}
