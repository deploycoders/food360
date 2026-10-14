"use client";

import { useEffect, useState } from "react";

type ViewMode = "grid" | "list";

const STORAGE_KEY = "food360-menu-view";

export function useMenuViewMode() {
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [viewModeReady, setViewModeReady] = useState(false);

  useEffect(() => {
    const savedViewMode = localStorage.getItem(STORAGE_KEY);

    if (savedViewMode === "grid" || savedViewMode === "list") {
      setViewMode(savedViewMode);
    }

    setViewModeReady(true);
  }, []);

  useEffect(() => {
    if (!viewModeReady) return;

    localStorage.setItem(STORAGE_KEY, viewMode);
  }, [viewMode, viewModeReady]);

  return {
    viewMode,
    setViewMode,
    viewModeReady,
  };
}
