"use client";

import { useEffect } from "react";
import { AnimatePresence, motion } from "motion/react";
import { X, Save, Plus } from "lucide-react";
import type { Dish, Category } from "@/types/menu";

import { useProductForm } from "@/lib/hooks/use-product-form";
import type { ProductFormValues } from "@/schemas/product.schema";
import { DishBasicFields } from "./dish-basic-fields";
import { DishPricingFields } from "./dish-pricing-fields";
import { DishImageField } from "./dish-image-field";
import { DishOptionsFields } from "./dish-options-fields";
interface DishModalProps {
  isOpen: boolean;
  dishToEdit: Dish | null;
  categories: Category[];
  onClose: () => void;
  onSave: (dishData: Partial<Dish>) => Promise<void>;
}

export function DishModal({
  isOpen,
  dishToEdit,
  categories,
  onClose,
  onSave,
}: DishModalProps) {
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useProductForm(dishToEdit);

  useEffect(() => {
    if (!isOpen) return;

    const originalOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen]);

  const submit = async (values: ProductFormValues) => {
    await onSave({
      name: values.name,
      description: values.description,
      categoryId: values.categoryId,

      price: values.price,
      prepTimeMinutes: values.prepTimeMinutes,

      imageUrl: values.imageUrl ?? undefined,

      is3d: values.is3d ?? undefined,
      glbUrl: values.glbUrl ?? undefined,
      usdzUrl: values.usdzUrl ?? undefined,

      isActive: values.isActive,
      isOutOfStock: values.isOutOfStock,
    });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Overlay */}
          <motion.button
            type="button"
            aria-label="Cerrar modal"
            className="absolute inset-0 cursor-default bg-black/50 backdrop-blur-sm"
            onClick={() => {
              if (!isSubmitting) {
                onClose();
              }
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          {/* Modal */}
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="dish-modal-title"
            className="relative z-10 flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-2xl"
            initial={{
              opacity: 0,
              scale: 0.97,
              y: 12,
            }}
            animate={{
              opacity: 1,
              scale: 1,
              y: 0,
            }}
            exit={{
              opacity: 0,
              scale: 0.97,
              y: 12,
            }}
            transition={{
              duration: 0.2,
              ease: "easeOut",
            }}
          >
            {/* Header */}
            <div className="flex shrink-0 items-center justify-between border-b border-border px-5 py-4">
              <div>
                <h2
                  id="dish-modal-title"
                  className="text-base font-bold text-foreground"
                >
                  {dishToEdit ? "Editar producto" : "Nuevo producto"}
                </h2>

                <p className="mt-0.5 text-xs text-muted-foreground">
                  {dishToEdit
                    ? "Modifica la información del producto."
                    : "Agrega un nuevo producto a tu carta."}
                </p>
              </div>

              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="rounded-lg p-2 text-muted-foreground transition-all hover:bg-muted hover:text-foreground disabled:pointer-events-none disabled:opacity-50"
                aria-label="Cerrar"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Form */}
            <form
              onSubmit={handleSubmit(submit)}
              className="flex min-h-0 flex-1 flex-col"
            >
              <div className="flex-1 space-y-6 overflow-y-auto p-5">
                {/* Información básica */}
                <section className="space-y-4">
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wide text-foreground">
                      Información básica
                    </h3>

                    <p className="mt-1 text-[11px] text-muted-foreground">
                      Datos principales del producto.
                    </p>
                  </div>

                  <DishBasicFields
                    control={control}
                    errors={errors}
                    categories={categories}
                  />
                </section>

                {/* Precio */}
                <section className="space-y-4 border-t border-border pt-5">
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wide text-foreground">
                      Precio y preparación
                    </h3>

                    <p className="mt-1 text-[11px] text-muted-foreground">
                      Define cuánto cuesta y cuánto tarda en prepararse.
                    </p>
                  </div>

                  <DishPricingFields control={control} errors={errors} />
                </section>

                {/* Imagen */}
                <section className="space-y-4 border-t border-border pt-5">
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wide text-foreground">
                      Imagen
                    </h3>
                  </div>

                  <DishImageField control={control} />
                </section>

                {/* Opciones */}
                <section className="space-y-4 border-t border-border pt-5">
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wide text-foreground">
                      Opciones del producto
                    </h3>

                    <p className="mt-1 text-[11px] text-muted-foreground">
                      Configura disponibilidad y características adicionales.
                    </p>
                  </div>

                  <DishOptionsFields control={control} />
                </section>
              </div>

              {/* Footer */}
              <div className="flex shrink-0 items-center justify-end gap-2 border-t border-border bg-muted/20 px-5 py-4">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isSubmitting}
                  className="rounded-md border cursor-pointer border-border bg-background px-4 py-2.5 text-xs font-semibold text-muted-foreground transition-all hover:bg-muted hover:text-foreground disabled:pointer-events-none disabled:opacity-50"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex min-w-32 cursor-pointer items-center justify-center gap-2 rounded-md bg-accent px-4 py-2.5 text-xs font-semibold text-accent-foreground shadow-sm transition-all hover:opacity-95 hover:shadow-md disabled:pointer-events-none disabled:opacity-60"
                >
                  {isSubmitting ? (
                    <>
                      <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
                      Guardando...
                    </>
                  ) : (
                    <>
                      {dishToEdit ? (
                        <Save className="h-3.5 w-3.5" />
                      ) : (
                        <Plus className="h-3.5 w-3.5" />
                      )}

                      {dishToEdit ? "Guardar cambios" : "Crear producto"}
                    </>
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
