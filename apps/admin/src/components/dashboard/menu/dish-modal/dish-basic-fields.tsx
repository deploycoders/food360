"use client";

import { motion } from "motion/react";
import { Controller, type Control, type FieldErrors } from "react-hook-form";

import type { ProductFormValues } from "@/schemas/product.schema";
import type { Category } from "@/types/menu";

interface DishBasicFieldsProps {
  control: Control<ProductFormValues>;
  errors: FieldErrors<ProductFormValues>;
  categories: Category[];
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;

  return (
    <motion.p
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -4 }}
      className="mt-1.5 text-xs text-destructive"
    >
      {message}
    </motion.p>
  );
}

export function DishBasicFields({
  control,
  errors,
  categories,
}: DishBasicFieldsProps) {
  return (
    <div className="space-y-5">
      {/* Nombre */}
      <Controller
        name="name"
        control={control}
        render={({ field }) => (
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-foreground">
              Nombre <span className="text-destructive">*</span>
            </label>

            <input
              {...field}
              type="text"
              placeholder="Ej. Pizza Margarita"
              className={`w-full rounded-xl border bg-background px-3.5 py-2.5 text-sm text-foreground outline-none transition-all placeholder:text-muted-foreground ${
                errors.name
                  ? "border-destructive focus:ring-2 focus:ring-destructive/10"
                  : "border-border focus:border-accent focus:ring-2 focus:ring-accent/10"
              }`}
            />

            <FieldError
              message={
                typeof errors.name?.message === "string"
                  ? errors.name.message
                  : undefined
              }
            />
          </div>
        )}
      />

      {/* Descripción */}
      <Controller
        name="description"
        control={control}
        render={({ field }) => (
          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <label className="text-xs font-semibold text-foreground">
                Descripción
              </label>

              <span className="text-[10px] text-muted-foreground">
                {field.value.length}/500
              </span>
            </div>

            <textarea
              {...field}
              rows={3}
              maxLength={500}
              placeholder="Describe brevemente el producto..."
              className={`w-full resize-none rounded-xl border bg-background px-3.5 py-2.5 text-sm text-foreground outline-none transition-all placeholder:text-muted-foreground ${
                errors.description
                  ? "border-destructive focus:ring-2 focus:ring-destructive/10"
                  : "border-border focus:border-accent focus:ring-2 focus:ring-accent/10"
              }`}
            />

            <FieldError
              message={
                typeof errors.description?.message === "string"
                  ? errors.description.message
                  : undefined
              }
            />
          </div>
        )}
      />

      {/* Categoría */}
      <Controller
        name="categoryId"
        control={control}
        render={({ field }) => (
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-foreground">
              Categoría
            </label>

            <select
              value={field.value ?? ""}
              onChange={(event) => field.onChange(event.target.value || null)}
              className="w-full cursor-pointer rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm text-foreground outline-none transition-all focus:border-accent focus:ring-2 focus:ring-accent/10"
            >
              <option value="">Sin categoría</option>

              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
        )}
      />
    </div>
  );
}
