import type { Dish } from "@/types/menu";
import type { Product } from "@/types/menu";

type Category = {
  id: string;
  name: string;
};

export function mapProductsToDishes(
  products: Product[],
  categories: Category[],
): Dish[] {
  return products.map((product) => {
    const category = categories.find((item) => item.id === product.categoryId);

    return {
      id: product.id,

      categoryId: product.categoryId,
      category: category?.name ?? "Sin categoría",

      name: product.name,
      description: product.description ?? "",

      price: product.price,
      prepTimeMinutes: product.preparationTimeMinutes ?? 0,

      imageUrl: product.imageUrl ?? undefined,

      is3d: product.is3d,
      glbUrl: product.glbUrl ?? undefined,
      usdzUrl: product.usdzUrl ?? undefined,

      isActive: product.isActive,
      isOutOfStock: product.isOutOfStock,

      isAvailable: product.isActive && !product.isOutOfStock,
    };
  });
}
