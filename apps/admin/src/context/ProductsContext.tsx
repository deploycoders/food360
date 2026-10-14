"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

import type { Product } from "@/types/menu";

import { useRestaurant } from "@/context/RestaurantContext";
import { createClient } from "@/lib/supabase/client";

import {
  createProduct,
  deleteProduct,
  getProducts,
  mapProduct,
  toggleProductAvailability,
  updateProduct,
} from "@/services/product.service";

interface ProductsContextValue {
  products: Product[];
  loading: boolean;
  saving: boolean;

  addProduct: (product: {
    categoryId?: string | null;
    name: string;
    description?: string | null;
    price: number;
    preparationTimeMinutes?: number | null;
    imageUrl?: string | null;
    is3d?: boolean;
    glbUrl?: string | null;
    usdzUrl?: string | null;
  }) => Promise<Product | null>;

  editProduct: (
    productId: string,
    updates: {
      categoryId?: string | null;
      name?: string;
      description?: string | null;
      price?: number;
      preparationTimeMinutes?: number | null;
      imageUrl?: string | null;
      is3d?: boolean;
      glbUrl?: string | null;
      usdzUrl?: string | null;
      isActive?: boolean;
      isOutOfStock?: boolean;
      deactivationReason?: string | null;
    },
  ) => Promise<Product | null>;

  removeProduct: (productId: string) => Promise<boolean>;

  changeProductAvailability: (
    productId: string,
    isOutOfStock: boolean,
  ) => Promise<Product | null>;

  refreshProducts: () => Promise<void>;
}

const ProductsContext = createContext<ProductsContextValue | undefined>(
  undefined,
);

export function ProductsProvider({ children }: { children: ReactNode }) {
  const { restaurantId, loading: restaurantLoading } = useRestaurant();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const refreshProducts = async () => {
    if (!restaurantId) {
      setProducts([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      const data = await getProducts(restaurantId);

      setProducts(data);
    } catch (error) {
      console.error("Error cargando productos:", error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  // ---------------------------------------------------------
  // CARGA INICIAL
  // ---------------------------------------------------------

  useEffect(() => {
    if (restaurantLoading) return;

    void refreshProducts();
  }, [restaurantId, restaurantLoading]);

  // ---------------------------------------------------------
  // REALTIME
  // ---------------------------------------------------------

  useEffect(() => {
    if (restaurantLoading || !restaurantId) return;

    const supabase = createClient();

    const channel = supabase
      .channel(`products:${restaurantId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "products",
          filter: `restaurant_id=eq.${restaurantId}`,
        },
        (payload) => {
          console.log("[Products Realtime]", payload);

          // INSERT
          if (payload.eventType === "INSERT") {
            const newProduct = mapProduct(payload.new as ProductRowRealtime);

            setProducts((current: Product[]) => {
              const alreadyExists = current.some(
                (product: Product) => product.id === newProduct.id,
              );

              if (alreadyExists) {
                return current;
              }

              return [...current, newProduct].sort((a, b) =>
                a.name.localeCompare(b.name, "es", {
                  sensitivity: "base",
                }),
              );
            });

            return;
          }

          // UPDATE
          if (payload.eventType === "UPDATE") {
            const updatedProduct = mapProduct(
              payload.new as ProductRowRealtime,
            );

            setProducts((current: Product[]) =>
              current.map((product: Product) =>
                product.id === updatedProduct.id ? updatedProduct : product,
              ),
            );

            return;
          }

          // DELETE
          if (payload.eventType === "DELETE") {
            setProducts((current: Product[]) =>
              current.filter(
                (product: Product) => product.id !== payload.old.id,
              ),
            );
          }
        },
      )
      .subscribe((status) => {
        console.log(`[Products Realtime] ${restaurantId}:`, status);
      });

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [restaurantId, restaurantLoading]);

  // ---------------------------------------------------------
  // CREAR
  // ---------------------------------------------------------

  const addProduct = async (product: {
    categoryId?: string | null;
    name: string;
    description?: string | null;
    price: number;
    preparationTimeMinutes?: number | null;
    imageUrl?: string | null;
    is3d?: boolean;
    glbUrl?: string | null;
    usdzUrl?: string | null;
  }): Promise<Product | null> => {
    if (!restaurantId) {
      console.error("No hay restaurante seleccionado.");
      return null;
    }

    try {
      setSaving(true);

      const newProduct = await createProduct(restaurantId, product);

      setProducts((current: Product[]) => {
        const alreadyExists = current.some(
          (item: Product) => item.id === newProduct.id,
        );

        if (alreadyExists) {
          return current;
        }

        return [...current, newProduct].sort((a, b) =>
          a.name.localeCompare(b.name, "es", {
            sensitivity: "base",
          }),
        );
      });

      return newProduct;
    } catch (error) {
      console.error("Error agregando producto:", error);
      return null;
    } finally {
      setSaving(false);
    }
  };

  // ---------------------------------------------------------
  // EDITAR
  // ---------------------------------------------------------

  const editProduct = async (
    productId: string,
    updates: {
      categoryId?: string | null;
      name?: string;
      description?: string | null;
      price?: number;
      preparationTimeMinutes?: number | null;
      imageUrl?: string | null;
      is3d?: boolean;
      glbUrl?: string | null;
      usdzUrl?: string | null;
      isActive?: boolean;
      isOutOfStock?: boolean;
      deactivationReason?: string | null;
    },
  ): Promise<Product | null> => {
    try {
      setSaving(true);

      const updatedProduct = await updateProduct(productId, updates);

      setProducts((current: Product[]) =>
        current.map((product: Product) =>
          product.id === productId ? updatedProduct : product,
        ),
      );

      return updatedProduct;
    } catch (error) {
      console.error("Error editando producto:", error);
      return null;
    } finally {
      setSaving(false);
    }
  };

  // ---------------------------------------------------------
  // DESACTIVAR
  // ---------------------------------------------------------

  const removeProduct = async (productId: string): Promise<boolean> => {
    try {
      setSaving(true);

      const updatedProduct = await deleteProduct(productId);

      setProducts((current: Product[]) =>
        current.map((product: Product) =>
          product.id === productId ? updatedProduct : product,
        ),
      );

      return true;
    } catch (error) {
      console.error("Error desactivando producto:", error);
      return false;
    } finally {
      setSaving(false);
    }
  };

  // ---------------------------------------------------------
  // DISPONIBILIDAD
  // ---------------------------------------------------------

  const changeProductAvailability = async (
    productId: string,
    isOutOfStock: boolean,
  ): Promise<Product | null> => {
    try {
      setSaving(true);

      const updatedProduct = await toggleProductAvailability(
        productId,
        isOutOfStock,
      );

      setProducts((current: Product[]) =>
        current.map((product: Product) =>
          product.id === productId ? updatedProduct : product,
        ),
      );

      return updatedProduct;
    } catch (error) {
      console.error("Error cambiando disponibilidad del producto:", error);

      return null;
    } finally {
      setSaving(false);
    }
  };

  return (
    <ProductsContext.Provider
      value={{
        products,
        loading,
        saving,
        addProduct,
        editProduct,
        removeProduct,
        changeProductAvailability,
        refreshProducts,
      }}
    >
      {children}
    </ProductsContext.Provider>
  );
}

// ---------------------------------------------------------
// HOOK
// ---------------------------------------------------------

export function useProducts(): ProductsContextValue {
  const context = useContext(ProductsContext);

  if (!context) {
    throw new Error("useProducts debe usarse dentro de un ProductsProvider");
  }

  return context;
}

// ---------------------------------------------------------
// TIPO PARA REALTIME
// ---------------------------------------------------------

type ProductRowRealtime = {
  id: string;
  restaurant_id: string | null;
  category_id: string | null;
  name: string;
  description: string | null;
  price: number | string;
  preparation_time_minutes: number | null;
  image_url: string | null;
  is_3d: boolean;
  glb_url: string | null;
  usdz_url: string | null;
  is_active: boolean;
  is_out_of_stock: boolean;
  deactivation_reason: string | null;
  created_at: string | null;
  updated_at: string | null;
};
