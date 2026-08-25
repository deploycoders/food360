"use client";

import React, { useState, useEffect } from "react";
import { Dish } from "@/types/menu";
import { X, Box, Image as ImageIcon } from "lucide-react";

interface DishModalProps {
  isOpen: boolean;
  dishToEdit: Dish | null;
  categories: string[];
  onClose: () => void;
  onSave: (dishData: Partial<Dish>) => void;
}

export function DishModal({
  isOpen,
  dishToEdit,
  categories,
  onClose,
  onSave,
}: DishModalProps) {
  const [formData, setFormData] = useState<Partial<Dish>>({
    name: "",
    category: categories[1] || "Hamburguesas",
    price: 10,
    prepTimeMinutes: 15,
    description: "",
    isAvailable: true,
    imageUrl: "",
    model3dUrl: "",
  });

  useEffect(() => {
    if (dishToEdit) {
      setFormData(dishToEdit);
    } else {
      setFormData({
        name: "",
        category: categories[1] || "Hamburguesas",
        price: 10,
        prepTimeMinutes: 15,
        description: "",
        isAvailable: true,
        imageUrl: "",
        model3dUrl: "",
      });
    }
  }, [dishToEdit, categories, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-card border border-border w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-5 py-4 bg-muted/40 border-b border-border flex items-center justify-between">
          <h2 className="text-base font-bold text-foreground">
            {dishToEdit ? "Editar Platillo" : "Crear Nuevo Platillo"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg bg-muted text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-foreground mb-1">
              Nombre del Platillo
            </label>
            <input
              type="text"
              required
              value={formData.name || ""}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              placeholder="Ej: Hamburguesa Trufada Angus"
              className="w-full bg-muted/40 border border-border rounded-xl px-3 py-2 text-foreground focus:outline-none focus:border-accent transition-colors placeholder:text-muted-foreground/60"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-foreground mb-1">
                Categoría
              </label>
              <select
                value={formData.category || categories[1]}
                onChange={(e) =>
                  setFormData({ ...formData, category: e.target.value })
                }
                className="w-full bg-muted/40 border border-border rounded-xl px-3 py-2 text-foreground focus:outline-none focus:border-accent transition-colors"
              >
                {categories
                  .filter((c) => c !== "Todos")
                  .map((cat) => (
                    <option key={cat} value={cat} className="bg-card text-foreground">
                      {cat}
                    </option>
                  ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-foreground mb-1">
                Precio ($)
              </label>
              <input
                type="number"
                step="0.01"
                required
                value={formData.price || 0}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    price: parseFloat(e.target.value),
                  })
                }
                className="w-full bg-muted/40 border border-border rounded-xl px-3 py-2 text-foreground focus:outline-none focus:border-accent font-mono transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-foreground mb-1">
              Tiempo estimado de prep. (Minutos)
            </label>
            <input
              type="number"
              required
              value={formData.prepTimeMinutes || 0}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  prepTimeMinutes: parseInt(e.target.value),
                })
              }
              className="w-full bg-muted/40 border border-border rounded-xl px-3 py-2 text-foreground focus:outline-none focus:border-accent font-mono transition-colors"
            />
          </div>

          <div>
            <label className="block font-semibold text-foreground mb-1">
              Descripción
            </label>
            <textarea
              rows={3}
              value={formData.description || ""}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="Ingredientes principales, preparación, alérgenos..."
              className="w-full bg-muted/40 border border-border rounded-xl px-3 py-2 text-foreground focus:outline-none focus:border-accent resize-none transition-colors placeholder:text-muted-foreground/60"
            />
          </div>

          {/* URLs de Imagen y Modelo 3D */}
          <div className="p-3 bg-muted/30 border border-border rounded-xl space-y-3">
            <div>
              <label className="text-muted-foreground mb-1 flex items-center gap-1 font-medium">
                <ImageIcon className="w-3.5 h-3.5 text-muted-foreground" />
                <span>URL de Imagen Principal</span>
              </label>
              <input
                type="url"
                value={formData.imageUrl || ""}
                onChange={(e) =>
                  setFormData({ ...formData, imageUrl: e.target.value })
                }
                placeholder="https://..."
                className="w-full bg-card border border-border rounded-lg px-2.5 py-1.5 text-foreground focus:outline-none focus:border-accent transition-colors placeholder:text-muted-foreground/60"
              />
            </div>

            <div>
              <label className="text-muted-foreground mb-1 flex items-center gap-1 font-medium">
                <Box className="w-3.5 h-3.5 text-accent" />
                <span>URL de Modelo 3D (.glb / .gltf)</span>
              </label>
              <input
                type="url"
                value={formData.model3dUrl || ""}
                onChange={(e) =>
                  setFormData({ ...formData, model3dUrl: e.target.value })
                }
                placeholder="https://.../modelo.glb"
                className="w-full bg-card border border-border rounded-lg px-2.5 py-1.5 text-foreground focus:outline-none focus:border-accent font-mono transition-colors placeholder:text-muted-foreground/60"
              />
            </div>
          </div>

          {/* Footer Buttons */}
          <div className="pt-3 border-t border-border flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-muted hover:bg-muted/80 text-foreground border border-border rounded-xl font-medium transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-accent hover:opacity-95 text-accent-foreground rounded-xl font-semibold shadow-md shadow-accent/20 transition-all"
            >
              Guardar Cambios
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
