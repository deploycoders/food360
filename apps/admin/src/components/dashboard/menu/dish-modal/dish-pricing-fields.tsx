"use client";

import { motion } from "motion/react";
import { Controller, type Control, type FieldErrors } from "react-hook-form";

import type { ProductFormValues } from "@/schemas/product.schema";

interface DishPricingFieldsProps {
  control: Control<ProductFormValues>;
  errors: FieldErrors<ProductFormValues>;
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;

  return (
    <motion.p
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-1.5 text-xs text-destructive"
    >
      {message}
    </motion.p>
  );
}

export function DishPricingFields({ control, errors }: DishPricingFieldsProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {/* Precio */}
      <Controller
        name="price"
        control={control}
        render={({ field }) => (
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-foreground">
              Precio <span className="text-destructive">*</span>
            </label>

            <div className="relative">
              <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                $
              </span>

              <input
                type="number"
                min="0"
                step="0.01"
                value={field.value === 0 ? "" : field.value}
                onChange={(event) => {
                  const value = event.target.value;

                  field.onChange(value === "" ? 0 : Number(value));
                }}
                onBlur={field.onBlur}
                className={`w-full rounded-xl border bg-background py-2.5 pl-8 pr-3.5 text-sm text-foreground outline-none transition-all ${
                  errors.price
                    ? "border-destructive focus:ring-2 focus:ring-destructive/10"
                    : "border-border focus:border-accent focus:ring-2 focus:ring-accent/10"
                }`}
                placeholder="0.00"
              />
            </div>

            <FieldError
              message={
                typeof errors.price?.message === "string"
                  ? errors.price.message
                  : undefined
              }
            />
          </div>
        )}
      />

      {/* Tiempo */}
      <Controller
        name="prepTimeMinutes"
        control={control}
        render={({ field }) => (
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-foreground">
              Tiempo de preparación <span className="text-destructive">*</span>
            </label>

            <div className="relative">
              <input
                type="number"
                min="1"
                step="1"
                value={field.value === 0 ? "" : field.value}
                onChange={(event) => {
                  const value = event.target.value;

                  field.onChange(value === "" ? 0 : Number(value));
                }}
                onBlur={field.onBlur}
                className={`w-full rounded-xl border bg-background py-2.5 pl-3.5 pr-16 text-sm text-foreground outline-none transition-all ${
                  errors.prepTimeMinutes
                    ? "border-destructive focus:ring-2 focus:ring-destructive/10"
                    : "border-border focus:border-accent focus:ring-2 focus:ring-accent/10"
                }`}
                placeholder="15"
              />

              <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                minutos
              </span>
            </div>

            <FieldError
              message={
                typeof errors.prepTimeMinutes?.message === "string"
                  ? errors.prepTimeMinutes.message
                  : undefined
              }
            />
          </div>
        )}
      />
    </div>
  );
}
