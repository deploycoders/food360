"use client";

import React, { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Hash, Loader2, Plus, Save, X } from "lucide-react";

import type { Table } from "@food360/types";

interface TableFormModalProps {
  isOpen: boolean;
  mode: "create" | "edit";
  table?: Table | null;
  onClose: () => void;
  onSubmit: (tableNumber: number) => Promise<void>;
}

export function TableFormModal({
  isOpen,
  mode,
  table,
  onClose,
  onSubmit,
}: TableFormModalProps) {
  const [tableNumber, setTableNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const isEditMode = mode === "edit";

  useEffect(() => {
    if (!isOpen) {
      setTableNumber("");
      setLoading(false);
      setFormError(null);
      return;
    }

    setFormError(null);

    if (isEditMode && table) {
      setTableNumber(String(table.tableNumber));
      return;
    }

    setTableNumber("");
  }, [isOpen, isEditMode, table]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setFormError(null);

    const number = Number(tableNumber);

    if (!Number.isInteger(number) || number <= 0) {
      setFormError("El número de mesa debe ser un entero mayor que 0.");
      return;
    }

    try {
      setLoading(true);

      await onSubmit(number);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "No se pudo guardar la mesa.";

      setFormError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (loading) return;

    setTableNumber("");
    setFormError(null);
    onClose();
  };

  const handleNumberChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setTableNumber(event.target.value);

    if (formError) {
      setFormError(null);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-100 flex items-end justify-center bg-black/60 p-0 backdrop-blur-sm sm:items-center sm:p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              handleClose();
            }
          }}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="table-form-title"
            className="w-full rounded-t-2xl border border-border bg-card p-5 shadow-2xl sm:max-w-md sm:rounded-2xl"
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.98 }}
            transition={{
              duration: 0.2,
              ease: "easeOut",
            }}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-accent/20 bg-accent/10 text-accent">
                  {isEditMode ? (
                    <Save className="h-5 w-5" />
                  ) : (
                    <Plus className="h-5 w-5" />
                  )}
                </div>

                <div>
                  <h2
                    id="table-form-title"
                    className="text-base font-bold text-foreground"
                  >
                    {isEditMode ? "Editar Mesa" : "Nueva Mesa"}
                  </h2>

                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {isEditMode
                      ? "Actualiza el número de la mesa."
                      : "Agrega una nueva mesa al restaurante."}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleClose}
                disabled={loading}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50"
                aria-label="Cerrar"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-6">
              <label
                htmlFor="table-number"
                className="mb-2 block text-xs font-semibold text-foreground"
              >
                Número de mesa
              </label>

              <div className="relative">
                <Hash className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                <input
                  id="table-number"
                  name="table-number"
                  type="number"
                  min="1"
                  step="1"
                  value={tableNumber}
                  onChange={handleNumberChange}
                  placeholder="Ej. 1"
                  disabled={loading}
                  autoFocus
                  aria-invalid={Boolean(formError)}
                  aria-describedby={formError ? "table-form-error" : undefined}
                  className={`w-full rounded-xl border bg-background py-2.5 pl-9 pr-3 text-sm text-foreground outline-none transition-all placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-60 ${
                    formError
                      ? "border-destructive focus:border-destructive focus:ring-2 focus:ring-destructive/10"
                      : "border-border focus:border-accent focus:ring-2 focus:ring-accent/10"
                  }`}
                />
              </div>

              {formError ? (
                <p
                  id="table-form-error"
                  role="alert"
                  className="mt-2 text-[11px] font-medium text-destructive"
                >
                  {formError}
                </p>
              ) : (
                <p className="mt-2 text-[11px] text-muted-foreground">
                  El número debe ser un entero mayor que 0.
                </p>
              )}

              <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={loading}
                  className="w-full rounded-xl border border-border px-4 py-2.5 text-xs font-semibold text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  disabled={loading || !tableNumber}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-accent px-4 py-2.5 text-xs font-semibold text-accent-foreground shadow-sm transition-all hover:opacity-90 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      {isEditMode ? "Guardando..." : "Creando..."}
                    </>
                  ) : (
                    <>
                      {isEditMode ? (
                        <Save className="h-4 w-4" />
                      ) : (
                        <Plus className="h-4 w-4" />
                      )}

                      {isEditMode ? "Guardar Cambios" : "Crear Mesa"}
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
