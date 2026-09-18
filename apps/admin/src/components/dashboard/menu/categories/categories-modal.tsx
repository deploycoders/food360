"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import type { Category } from "@/types/menu";

type CategoryModalProps = {
  open: boolean;
  saving: boolean;
  category: Category | null;
  onClose: () => void;
  onSave: (name: string) => Promise<void>;
};

export default function CategoryModal({
  open,
  saving,
  category,
  onClose,
  onSave,
}: CategoryModalProps) {
  const [name, setName] = useState("");

  const isEditing = Boolean(category);

  useEffect(() => {
    if (open) {
      setName(category?.name ?? "");
    }
  }, [open, category]);

  if (!open) return null;

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!name.trim() || saving) return;

    await onSave(name);
  };

  const handleClose = () => {
    if (saving) return;

    setName("");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-foreground">
              {isEditing ? "Editar categoría" : "Nueva categoría"}
            </h2>

            <p className="mt-1 text-xs text-muted-foreground">
              {isEditing
                ? "Actualiza el nombre de la categoría."
                : "Agrega una nueva categoría para organizar tu menú."}
            </p>
          </div>

          <button
            type="button"
            onClick={handleClose}
            disabled={saving}
            className="rounded-lg p-1.5 text-muted-foreground transition hover:bg-muted hover:text-foreground disabled:opacity-50"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <label
            htmlFor="category-name"
            className="mb-2 block text-xs font-semibold text-foreground"
          >
            Nombre
          </label>

          <input
            id="category-name"
            type="text"
            autoFocus
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Ej. Hamburguesas"
            disabled={saving}
            className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm text-foreground outline-none transition focus:border-accent disabled:opacity-60"
          />

          <div className="mt-6 flex justify-end gap-2">
            <button
              type="button"
              disabled={saving}
              onClick={handleClose}
              className="rounded-xl bg-muted px-4 py-2.5 text-xs font-semibold text-muted-foreground transition hover:text-foreground disabled:opacity-50"
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={saving || !name.trim()}
              className="rounded-xl bg-accent px-4 py-2.5 text-xs font-semibold text-accent-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving
                ? "Guardando..."
                : isEditing
                  ? "Guardar cambios"
                  : "Crear categoría"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
