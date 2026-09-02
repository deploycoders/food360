"use client";

import React, { useEffect, useState } from "react";
import { ThemeContext, type Theme } from "./theme-context";

const STORAGE_KEY = "food360-theme";

function resolveTheme(theme: Theme): "dark" | "light" {
  if (theme === "system") {
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  }

  return theme;
}

function applyTheme(effectiveTheme: "dark" | "light") {
  const root = document.documentElement;

  root.classList.toggle("dark", effectiveTheme === "dark");
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("light");

  const [resolvedTheme, setResolvedTheme] = useState<"dark" | "light">("light");

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const savedTheme = (localStorage.getItem(STORAGE_KEY) as Theme) || "light";

    setThemeState(savedTheme);
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const effectiveTheme = resolveTheme(theme);

    setResolvedTheme(effectiveTheme);
    applyTheme(effectiveTheme);

    localStorage.setItem(STORAGE_KEY, theme);
  }, [theme, mounted]);

  useEffect(() => {
    if (!mounted || theme !== "system") return;

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    const handleChange = () => {
      const effectiveTheme = mediaQuery.matches ? "dark" : "light";

      setResolvedTheme(effectiveTheme);
      applyTheme(effectiveTheme);
    };

    mediaQuery.addEventListener("change", handleChange);

    return () => {
      mediaQuery.removeEventListener("change", handleChange);
    };
  }, [theme, mounted]);

  return (
    <ThemeContext.Provider
      value={{
        theme,
        setTheme: setThemeState,
        resolvedTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}
