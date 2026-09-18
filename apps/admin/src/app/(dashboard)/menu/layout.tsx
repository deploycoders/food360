import type { ReactNode } from "react";

import { CategoriesProvider } from "@/context/CategoriesContext";
import { ProductsProvider } from "@/context/ProductsContext";

export default function MenuLayout({ children }: { children: ReactNode }) {
  return (
    <CategoriesProvider>
      <ProductsProvider>{children}</ProductsProvider>
    </CategoriesProvider>
  );
}
