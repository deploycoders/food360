"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import type { Dish } from "@/types/menu";
import { ProductFormValues, productSchema } from "@/schemas/product.schema";

function getDefaultValues(dish?: Dish | null): ProductFormValues {
  return {
    name: dish?.name ?? "",
    description: dish?.description ?? "",
    categoryId: dish?.categoryId ?? null,

    price: dish?.price ?? 0,
    prepTimeMinutes: dish?.prepTimeMinutes ?? 0,

    imageUrl: dish?.imageUrl ?? null,

    is3d: dish?.is3d ?? false,

    glbUrl: dish?.glbUrl ?? null,
    usdzUrl: dish?.usdzUrl ?? null,

    isActive: dish?.isActive ?? true,
    isOutOfStock: dish?.isOutOfStock ?? false,
  };
}

export function useProductForm(dish?: Dish | null) {
  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),

    mode: "onBlur",
    reValidateMode: "onChange",

    defaultValues: getDefaultValues(dish),
  });

  const {
    reset,
    formState: { isSubmitting },
  } = form;

  useEffect(() => {
    reset(getDefaultValues(dish));
  }, [dish, reset]);

  return {
    ...form,
    isSubmitting,
  };
}
