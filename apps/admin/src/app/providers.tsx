"use client";

import React from "react";
import { ThemeProvider } from "@food360/theme";

export function Providers({ children }: { children: React.ReactNode }) {
  return <ThemeProvider>{children}</ThemeProvider>;
}
