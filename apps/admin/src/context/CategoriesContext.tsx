"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

import type { Category } from "@/types/menu";
import { useRestaurant } from "@/context/RestaurantContext";

import {
  createCategory,
  deleteCategory,
  getCategories,
  toggleCategoryStatus,
  updateCategory,
} from "@/services/categories.service";

interface CategoriesContextValue {
  categories: Category[];
  loading: boolean;
  saving: boolean;

  addCategory: (name: string) => Promise<Category | null>;

  editCategory: (categoryId: string, name: string) => Promise<Category | null>;

  removeCategory: (categoryId: string) => Promise<boolean>;

  changeCategoryStatus: (
    categoryId: string,
    isActive: boolean,
  ) => Promise<Category | null>;

  refreshCategories: () => Promise<void>;
}

const CategoriesContext = createContext<CategoriesContextValue | undefined>(
  undefined,
);

export function CategoriesProvider({ children }: { children: ReactNode }) {
  const { restaurantId, loading: restaurantLoading } = useRestaurant();

  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const refreshCategories = async () => {
    if (!restaurantId) {
      setCategories([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      const data = await getCategories(restaurantId);

      setCategories(data);
    } catch (error) {
      console.error("Error cargando categorías:", error);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (restaurantLoading) return;

    void refreshCategories();
  }, [restaurantId, restaurantLoading]);

  const addCategory = async (name: string): Promise<Category | null> => {
    if (!restaurantId) {
      console.error("No hay restaurante seleccionado.");
      return null;
    }

    try {
      setSaving(true);

      const category = await createCategory(restaurantId, {
        name,
      });

      setCategories((current) => sortCategories([...current, category]));

      return category;
    } catch (error) {
      console.error("Error agregando categoría:", error);
      return null;
    } finally {
      setSaving(false);
    }
  };

  const editCategory = async (
    categoryId: string,
    name: string,
  ): Promise<Category | null> => {
    try {
      setSaving(true);

      const updatedCategory = await updateCategory(categoryId, {
        name,
      });

      setCategories((current) =>
        current.map((category) =>
          category.id === categoryId ? updatedCategory : category,
        ),
      );

      return updatedCategory;
    } catch (error) {
      console.error("Error editando categoría:", error);
      return null;
    } finally {
      setSaving(false);
    }
  };

  const removeCategory = async (categoryId: string): Promise<boolean> => {
    try {
      setSaving(true);

      await deleteCategory(categoryId);

      setCategories((current) =>
        current.filter((category) => category.id !== categoryId),
      );

      return true;
    } catch (error) {
      console.error("Error eliminando categoría:", error);
      return false;
    } finally {
      setSaving(false);
    }
  };

  const changeCategoryStatus = async (
    categoryId: string,
    isActive: boolean,
  ): Promise<Category | null> => {
    try {
      setSaving(true);

      const updatedCategory = await toggleCategoryStatus(categoryId, isActive);

      setCategories((current) =>
        current.map((category) =>
          category.id === categoryId ? updatedCategory : category,
        ),
      );

      return updatedCategory;
    } catch (error) {
      console.error("Error cambiando estado de categoría:", error);

      return null;
    } finally {
      setSaving(false);
    }
  };

  return (
    <CategoriesContext.Provider
      value={{
        categories,
        loading,
        saving,
        addCategory,
        editCategory,
        removeCategory,
        changeCategoryStatus,
        refreshCategories,
      }}
    >
      {children}
    </CategoriesContext.Provider>
  );
}

export function useCategories() {
  const context = useContext(CategoriesContext);

  if (!context) {
    throw new Error(
      "useCategories debe usarse dentro de un CategoriesProvider",
    );
  }

  return context;
}

function sortCategories(categories: Category[]): Category[] {
  return [...categories].sort((a, b) => {
    if (a.sortOrder !== b.sortOrder) {
      return a.sortOrder - b.sortOrder;
    }

    return a.name.localeCompare(b.name);
  });
}
