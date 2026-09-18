"use client";

import { useState } from "react";
import { Plus, Search } from "lucide-react";
import type { Category } from "@/types/menu";
import { useCategories } from "@/context/CategoriesContext";
import CategoryRow from "@/components/dashboard/menu/categories/categories-row";
import CategoryModal from "@/components/dashboard/menu/categories/categories-modal";

export default function CategoriesPage() {
  const {
    categories,
    loading,
    saving,
    addCategory,
    editCategory,
    removeCategory,
    changeCategoryStatus,
  } = useCategories();

  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const filteredCategories = categories.filter((category) =>
    category.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const activeCategories = categories.filter(
    (category) => category.isActive,
  ).length;

  const inactiveCategories = categories.filter(
    (category) => !category.isActive,
  ).length;

  const handleOpenCreate = () => {
    setEditingCategory(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (category: Category) => {
    setEditingCategory(category);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    if (saving) return;

    setIsModalOpen(false);
    setEditingCategory(null);
  };

  const handleSave = async (name: string) => {
    const result = editingCategory
      ? await editCategory(editingCategory.id, name)
      : await addCategory(name);

    if (result) {
      setIsModalOpen(false);
      setEditingCategory(null);
    }
  };

  const handleDelete = async (categoryId: string) => {
    await removeCategory(categoryId);
  };

  const handleToggleStatus = async (category: Category) => {
    await changeCategoryStatus(category.id, !category.isActive);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Categorías del Menú
          </h1>

          <p className="mt-1 text-xs text-muted-foreground">
            Organiza las categorías de los platillos de tu menú.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenCreate}
          className="inline-flex h-9 items-center justify-center gap-2 rounded-xl bg-accent px-4 text-xs font-semibold text-accent-foreground transition hover:opacity-90"
        >
          <Plus className="h-4 w-4" />
          Nueva categoría
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-border bg-card p-4">
          <p className="text-[11px] font-medium text-muted-foreground">Total</p>
          <p className="mt-1 text-xl font-bold text-foreground">
            {categories.length}
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-4">
          <p className="text-[11px] font-medium text-muted-foreground">
            Activas
          </p>
          <p className="mt-1 text-xl font-bold text-emerald-600">
            {activeCategories}
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-4">
          <p className="text-[11px] font-medium text-muted-foreground">
            Inactivas
          </p>
          <p className="mt-1 text-xl font-bold text-foreground">
            {inactiveCategories}
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card">
        <div className="border-b border-border p-4">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

            <input
              type="text"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Buscar categoría..."
              className="h-9 w-full rounded-xl border border-border bg-background pl-9 pr-3 text-xs text-foreground outline-none transition focus:border-accent"
            />
          </div>
        </div>

        {loading ? (
          <div className="p-10 text-center">
            <div className="mx-auto h-6 w-6 animate-spin rounded-full border-2 border-border border-t-accent" />

            <p className="mt-3 text-xs text-muted-foreground">
              Cargando categorías...
            </p>
          </div>
        ) : filteredCategories.length > 0 ? (
          <div className="divide-y divide-border/60">
            {filteredCategories.map((category) => (
              <CategoryRow
                key={category.id}
                category={category}
                saving={saving}
                onEdit={handleOpenEdit}
                onDelete={handleDelete}
                onToggleStatus={handleToggleStatus}
              />
            ))}
          </div>
        ) : (
          <div className="p-10 text-center">
            <p className="text-sm font-medium text-foreground">
              No hay categorías
            </p>

            <p className="mt-1 text-xs text-muted-foreground">
              {searchQuery
                ? "No encontramos categorías con esa búsqueda."
                : "Crea tu primera categoría para comenzar a organizar el menú."}
            </p>
          </div>
        )}
      </div>

      <CategoryModal
        open={isModalOpen}
        saving={saving}
        category={editingCategory}
        onClose={handleCloseModal}
        onSave={handleSave}
      />
    </div>
  );
}
