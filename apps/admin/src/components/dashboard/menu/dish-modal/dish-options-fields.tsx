"use client";

import { Controller, type Control } from "react-hook-form";
import { Box, Eye, EyeOff } from "lucide-react";

import type { ProductFormValues } from "@/schemas/product.schema";

interface DishOptionsFieldsProps {
  control: Control<ProductFormValues>;
}

export function DishOptionsFields({ control }: DishOptionsFieldsProps) {
  return (
    <div className="space-y-3">
      {/* Estado */}
      <Controller
        name="isActive"
        control={control}
        render={({ field }) => (
          <button
            type="button"
            onClick={() => field.onChange(!field.value)}
            className={`flex w-full items-center justify-between rounded-xl border p-3.5 text-left transition-all ${
              field.value
                ? "border-success/20 bg-success/5"
                : "border-border bg-muted/30"
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`flex h-9 w-9 items-center justify-center rounded-lg ${
                  field.value
                    ? "bg-success/10 text-success"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {field.value ? (
                  <Eye className="h-4 w-4" />
                ) : (
                  <EyeOff className="h-4 w-4" />
                )}
              </div>

              <div>
                <p className="text-xs font-semibold text-foreground">
                  Producto activo
                </p>

                <p className="mt-0.5 text-[11px] text-muted-foreground">
                  {field.value
                    ? "El producto aparece en la carta."
                    : "El producto está oculto de la carta."}
                </p>
              </div>
            </div>

            <span
              className={`relative h-5 w-9 rounded-full transition-colors ${
                field.value ? "bg-success" : "bg-muted-foreground/30"
              }`}
            >
              <span
                className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${
                  field.value ? "translate-x-4" : "translate-x-0.5"
                }`}
              />
            </span>
          </button>
        )}
      />

      {/* Agotado */}
      <Controller
        name="isOutOfStock"
        control={control}
        render={({ field }) => (
          <button
            type="button"
            onClick={() => field.onChange(!field.value)}
            className={`flex w-full items-center justify-between rounded-xl border p-3.5 text-left transition-all ${
              field.value
                ? "border-destructive/20 bg-destructive/5"
                : "border-border bg-muted/30"
            }`}
          >
            <div>
              <p className="text-xs font-semibold text-foreground">
                Producto agotado
              </p>

              <p className="mt-0.5 text-[11px] text-muted-foreground">
                Marca temporalmente el producto como no disponible.
              </p>
            </div>

            <span
              className={`relative h-5 w-9 rounded-full transition-colors ${
                field.value ? "bg-destructive" : "bg-muted-foreground/30"
              }`}
            >
              <span
                className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${
                  field.value ? "translate-x-4" : "translate-x-0.5"
                }`}
              />
            </span>
          </button>
        )}
      />

      {/* 3D */}
      {/* <Controller
        name="is3d"
        control={control}
        render={({ field }) => (
          <button
            type="button"
            onClick={() => field.onChange(!field.value)}
            className={`flex w-full items-center justify-between rounded-xl border p-3.5 text-left transition-all ${
              field.value
                ? "border-accent/20 bg-accent/5"
                : "border-border bg-muted/30"
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`flex h-9 w-9 items-center justify-center rounded-lg ${
                  field.value
                    ? "bg-accent/10 text-accent"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                <Box className="h-4 w-4" />
              </div>

              <div>
                <p className="text-xs font-semibold text-foreground">
                  Modelo 3D / AR
                </p>

                <p className="mt-0.5 text-[11px] text-muted-foreground">
                  Habilita la visualización 3D del producto.
                </p>
              </div>
            </div>

            <span
              className={`relative h-5 w-9 rounded-full transition-colors ${
                field.value ? "bg-accent" : "bg-muted-foreground/30"
              }`}
            >
              <span
                className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${
                  field.value ? "translate-x-4" : "translate-x-0.5"
                }`}
              />
            </span>
          </button>
        )}
      /> */}

      {/* URLs 3D */}
      {/* <Controller
        name="glbUrl"
        control={control}
        render={({ field }) => (
          <input
            {...field}
            value={field.value ?? ""}
            onChange={(event) => field.onChange(event.target.value || null)}
            type="url"
            placeholder="URL del modelo GLB"
            className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-xs text-foreground outline-none transition-all placeholder:text-muted-foreground focus:border-accent focus:ring-2 focus:ring-accent/10"
          />
        )}
      />

      <Controller
        name="usdzUrl"
        control={control}
        render={({ field }) => (
          <input
            {...field}
            value={field.value ?? ""}
            onChange={(event) => field.onChange(event.target.value || null)}
            type="url"
            placeholder="URL del modelo USDZ"
            className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-xs text-foreground outline-none transition-all placeholder:text-muted-foreground focus:border-accent focus:ring-2 focus:ring-accent/10"
          />
        )}
      /> */}
    </div>
  );
}
