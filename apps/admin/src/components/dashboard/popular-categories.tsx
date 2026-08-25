import React from "react";
import { AlertCircle } from "lucide-react";

const categories = [
  { name: "Hamburguesas Gourmet", count: "18 pedidos", pct: "75%" },
  { name: "Pizzas Artesanales", count: "12 pedidos", pct: "50%" },
  { name: "Bebidas & Cócteles", count: "8 pedidos", pct: "30%" },
  { name: "Postres & Cafés", count: "4 pedidos", pct: "15%" },
];

export function PopularCategories() {
  return (
    <div className="p-5 rounded-xl bg-card border border-border flex flex-col justify-between h-full">
      <div>
        <h2 className="text-sm font-bold text-foreground">
          Categorías Populares
        </h2>
        <p className="text-xs text-muted-foreground mt-0.5">
          Productos con mayor rotación
        </p>

        <div className="mt-5 space-y-3.5">
          {categories.map((cat) => (
            <div key={cat.name} className="space-y-1.5">
              <div className="flex justify-between text-xs font-medium">
                <span className="text-foreground">{cat.name}</span>
                <span className="text-muted-foreground">{cat.count}</span>
              </div>
              <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-accent rounded-full"
                  style={{ width: cat.pct }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 pt-4 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
        <span>Alertas de Insumos:</span>
        <span className="text-foreground font-medium flex items-center gap-1.5">
          <AlertCircle className="w-3.5 h-3.5 text-warning" /> 2 platillos
          limitados
        </span>
      </div>
    </div>
  );
}
