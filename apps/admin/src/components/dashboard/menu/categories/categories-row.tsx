"use client";

import { useState } from "react";
import { MoreHorizontal, Pencil, Trash2, Eye, EyeOff } from "lucide-react";
import type { Category } from "@/types/menu";
import { confirmDeactivateMember, confirmDeleteCategory } from "@/app/lib/swal";

type CategoryRowProps = {
  category: Category;
  saving: boolean;
  onEdit: (category: Category) => void;
  onDelete: (categoryId: string) => Promise<void>;
  onToggleStatus: (category: Category) => Promise<void>;
};

export default function CategoryRow({
  category,
  saving,
  onEdit,
  onDelete,
  onToggleStatus,
}: CategoryRowProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  const handleDelete = async () => {
    setMenuOpen(false);

    const confirmed = await confirmDeleteCategory(category.name);

    if (!confirmed) return;

    await onDelete(category.id);
  };

  const handleToggleStatus = async () => {
    setMenuOpen(false);
    await onToggleStatus(category);
  };

  return (
    <div className="flex items-center gap-3 p-4 transition-colors hover:bg-muted/30">
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <h3 className="truncate text-sm font-semibold text-foreground">
            {category.name}
          </h3>

          <span
            className={
              category.isActive
                ? "rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-600"
                : "rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold text-muted-foreground"
            }
          >
            {category.isActive ? "Activa" : "Inactiva"}
          </span>
        </div>
      </div>

      <div className="relative flex items-center gap-1">
        <button
          type="button"
          title="Editar"
          disabled={saving}
          onClick={() => onEdit(category)}
          className="rounded-lg p-2 text-muted-foreground transition hover:bg-muted hover:text-foreground disabled:opacity-50"
        >
          <Pencil className="h-4 w-4" />
        </button>

        <button
          type="button"
          title="Eliminar"
          disabled={saving}
          onClick={handleDelete}
          className="rounded-lg p-2 text-muted-foreground transition hover:bg-destructive/10 hover:text-destructive disabled:opacity-50"
        >
          <Trash2 className="h-4 w-4" />
        </button>

        <button
          type="button"
          title="Más opciones"
          disabled={saving}
          onClick={() => setMenuOpen((open) => !open)}
          className="rounded-lg p-2 text-muted-foreground transition hover:bg-muted hover:text-foreground disabled:opacity-50"
        >
          <MoreHorizontal className="h-4 w-4" />
        </button>

        {menuOpen && (
          <div className="absolute right-0 top-full z-20 mt-1 w-44 overflow-hidden rounded-xl border border-border bg-card p-1 shadow-xl">
            <button
              type="button"
              onClick={handleToggleStatus}
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-xs font-medium text-foreground transition hover:bg-muted"
            >
              {category.isActive ? (
                <EyeOff className="h-4 w-4 text-muted-foreground" />
              ) : (
                <Eye className="h-4 w-4 text-muted-foreground" />
              )}

              {category.isActive ? "Ocultar categoría" : "Activar categoría"}
            </button>

            <button
              type="button"
              onClick={handleDelete}
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-xs font-medium text-destructive transition hover:bg-destructive/10"
            >
              <Trash2 className="h-4 w-4" />
              Eliminar categoría
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
