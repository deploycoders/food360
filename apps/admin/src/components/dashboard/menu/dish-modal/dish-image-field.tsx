"use client";

import { Controller, type Control } from "react-hook-form";

import type { ProductFormValues } from "@/schemas/product.schema";
import { CloudinaryImageUpload } from "@/components/ui/CloudinaryImageUpload";

interface DishImageFieldProps {
  control: Control<ProductFormValues>;
}

export function DishImageField({ control }: DishImageFieldProps) {
  return (
    <Controller
      name="imageUrl"
      control={control}
      render={({ field, fieldState }) => (
        <div>
          <div className="mb-2">
            <label className="block text-xs font-semibold text-foreground">
              Imagen del producto
            </label>

            <p className="mt-0.5 text-[11px] text-muted-foreground">
              Selecciona una imagen desde tu dispositivo.
            </p>
          </div>

          <CloudinaryImageUpload
            value={field.value}
            onChange={field.onChange}
            error={fieldState.error?.message}
          />
        </div>
      )}
    />
  );
}
