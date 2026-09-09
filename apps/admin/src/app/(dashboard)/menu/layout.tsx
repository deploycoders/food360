import type { ReactNode } from "react";
import { CategoriesProvider } from "@/context/CategoriesContext";

export default function MenuLayout({ children }: { children: ReactNode }) {
  return <CategoriesProvider>{children}</CategoriesProvider>;
}
