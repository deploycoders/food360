import { z } from "zod";

export const productSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "El nombre del producto es obligatorio.")
    .max(100, "El nombre no puede superar los 100 caracteres."),

  description: z
    .string()
    .trim()
    .max(500, "La descripción no puede superar los 500 caracteres."),

  categoryId: z.string().nullable(),

  price: z
    .number({
      message: "Ingresa un precio válido.",
    })
    .positive("El precio debe ser mayor a 0."),

  prepTimeMinutes: z
    .number({
      message: "Ingresa un tiempo válido.",
    })
    .int("Debe ser un número entero.")
    .min(1, "Debe ser al menos 1 minuto."),

  imageUrl: z.string().nullable(),

  is3d: z.boolean(),

  glbUrl: z.string().nullable(),

  usdzUrl: z.string().nullable(),

  isActive: z.boolean(),

  isOutOfStock: z.boolean(),
});

export type ProductFormValues = z.infer<typeof productSchema>;
