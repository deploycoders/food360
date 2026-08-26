"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Plus,
  GripVertical,
  Edit2,
  Trash2,
  UtensilsCrossed,
  ArrowLeft,
  X,
} from "lucide-react";
import type { Category } from "@/types";

const mockCategories: Category[] = [
  {
    id: "cat-1",
    restaurantId: "rest-1",
    name: "Hamburguesas Gourmet",
    slug: "hamburguesas",
    description: "Carne angus, smash burgers y complementos.",
    sortOrder: 1,
    isActive: true,
    productCount: 8,
    createdAt: "2026-08-01",
    updatedAt: "2026-08-20",
  },
  {
    id: "cat-2",
    restaurantId: "rest-1",
    name: "Pizzas Artesanales",
    slug: "pizzas",
    description: "Masa madre horneada a la piedra.",
    sortOrder: 2,
    isActive: true,
    productCount: 6,
    createdAt: "2026-08-01",
    updatedAt: "2026-08-22",
  },
  {
    id: "cat-3",
    restaurantId: "rest-1",
    name: "Carnes & Brasas",
    slug: "carnes-brasas",
    description: "Cortes madurados, costillas ahumadas y guarniciones.",
    sortOrder: 3,
    isActive: true,
    productCount: 5,
    createdAt: "2026-08-02",
    updatedAt: "2026-08-18",
  },
  {
    id: "cat-4",
    restaurantId: "rest-1",
    name: "Bowls & Saludable",
    slug: "bowls",
    description: "Poke bowls, ensaladas de estación y opciones veganas.",
    sortOrder: 4,
    isActive: true,
    productCount: 4,
    createdAt: "2026-08-05",
    updatedAt: "2026-08-24",
  },
  {
    id: "cat-5",
    restaurantId: "rest-1",
    name: "Bebidas & Coctelería",
    slug: "bebidas",
    description: "Cervezas artesanales, cocteles de autor y sodas.",
    sortOrder: 5,
    isActive: true,
    productCount: 12,
    createdAt: "2026-08-01",
    updatedAt: "2026-08-20",
  },
  {
    id: "cat-6",
    restaurantId: "rest-1",
    name: "Postres Caseros",
    slug: "postres",
    description: "Tartas, helados artesanales y cafés especiales.",
    sortOrder: 6,
    isActive: false,
    productCount: 3,
    createdAt: "2026-08-10",
    updatedAt: "2026-08-23",
  },
];

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>(mockCategories);
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const toggleCategoryStatus = (id: string) => {
    setCategories((prev) =>
      prev.map((c) => (c.id === id ? { ...c, isActive: !c.isActive } : c)),
    );
  };

  const handleDelete = (id: string) => {
    if (confirm("¿Estás seguro de eliminar esta categoría?")) {
      setCategories((prev) => prev.filter((c) => c.id !== id));
    }
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;

    const newCat: Category = {
      id: `cat-${Date.now()}`,
      restaurantId: "rest-1",
      name,
      slug: name.toLowerCase().replace(/\s+/g, "-"),
      description,
      sortOrder: categories.length + 1,
      isActive: true,
      productCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setCategories([...categories, newCat]);
    setShowModal(false);
    setName("");
    setDescription("");
  };

  return (
    <div className="space-y-6">
      {/* Top Breadcrumb & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl sm:text-3xl font-bold tracking-tight text-foreground">
            Categorías del Menú
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Organiza las secciones del menú visibles en la carta digital y en el
            KDS de cocina.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowModal(true)}
          className="h-9 px-3.5 rounded-lg bg-accent hover:opacity-95 text-accent-foreground font-medium text-xs inline-flex items-center gap-1.5 transition-all shrink-0 shadow-md shadow-accent/15"
        >
          <Plus className="w-4 h-4" />
          <span>Nueva Categoría</span>
        </button>
      </div>

      {/* Categories Table / List */}
      <div className="bg-card border border-border rounded-xl overflow-x-auto shadow-sm">
        <table className="w-full text-left text-xs">
          <thead className="bg-muted/50 border-b border-border text-muted-foreground uppercase font-mono tracking-wider">
            <tr>
              <th className="w-10 px-4 py-3.5"></th>
              <th className="px-4 py-3.5 font-semibold">Orden</th>
              <th className="px-4 py-3.5 font-semibold">Nombre de Categoría</th>
              <th className="px-4 py-3.5 font-semibold">Descripción</th>
              <th className="px-4 py-3.5 font-semibold">
                Platillos Vinculados
              </th>
              <th className="px-4 py-3.5 font-semibold">Estado</th>
              <th className="px-4 py-3.5 font-semibold text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60 text-foreground">
            {categories.map((cat, index) => (
              <tr key={cat.id} className="hover:bg-muted/40 transition-colors">
                <td className="px-4 py-3.5 text-muted-foreground cursor-grab">
                  <GripVertical className="w-4 h-4" />
                </td>
                <td className="px-4 py-3.5 font-mono font-bold text-muted-foreground">
                  #{index + 1}
                </td>
                <td className="px-4 py-3.5">
                  <span className="font-bold text-foreground block text-sm">
                    {cat.name}
                  </span>
                  <span className="text-[10px] text-muted-foreground font-mono">
                    /{cat.slug}
                  </span>
                </td>
                <td className="px-4 py-3.5 text-muted-foreground text-xs">
                  {cat.description || "—"}
                </td>
                <td className="px-4 py-3.5">
                  <span className="inline-flex items-center gap-1.5 bg-muted px-2.5 py-1 rounded-full text-xs font-medium text-foreground border border-border">
                    <UtensilsCrossed className="w-3 h-3 text-accent" />
                    {cat.productCount || 0} platillos
                  </span>
                </td>
                <td className="px-4 py-3.5">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => toggleCategoryStatus(cat.id)}
                      className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        cat.isActive ? "bg-success" : "bg-muted"
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                          cat.isActive ? "translate-x-4" : "translate-x-0"
                        }`}
                      />
                    </button>
                    <span
                      className={`text-xs font-semibold ${cat.isActive ? "text-success" : "text-muted-foreground"}`}
                    >
                      {cat.isActive ? "Activa" : "Oculta"}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3.5 text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    <button
                      type="button"
                      onClick={() => alert(`Editando categoría ${cat.name}...`)}
                      className="p-1.5 rounded-lg bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground transition-colors"
                      title="Editar categoría"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(cat.id)}
                      className="p-1.5 rounded-lg bg-destructive/10 hover:bg-destructive/20 text-destructive transition-colors"
                      title="Eliminar categoría"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* New Category Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border w-full max-w-md rounded-2xl shadow-2xl p-6 transition-all">
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-lg font-bold text-foreground">
                Nueva Categoría
              </h2>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="p-1.5 rounded-lg bg-muted text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1.5">
                  Nombre de la Categoría
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Entrantes & Tapas"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-muted/40 border border-border rounded-xl px-3.5 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-accent transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1.5">
                  Descripción Corta
                </label>
                <textarea
                  rows={3}
                  placeholder="Ej: Ideales para compartir al centro..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-muted/40 border border-border rounded-xl px-3.5 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-accent transition-colors"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-3.5 py-2 text-xs font-semibold rounded-xl bg-muted hover:bg-muted/80 text-foreground border border-border transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold rounded-xl bg-accent hover:opacity-95 text-accent-foreground shadow-md shadow-accent/20 transition-all"
                >
                  Crear Categoría
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
