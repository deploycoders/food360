import React from "react";
import { DollarSign, ShoppingBag, TrendingUp, Users } from "lucide-react";

export function MetricsCards() {
  const metrics = [
    {
      title: "Ventas Totales",
      value: "$1.845,50",
      change: "+14.8% vs ayer",
      icon: DollarSign,
    },
    {
      title: "Comandas Hoy",
      value: "42",
      change: "+8.2% volumen",
      icon: ShoppingBag,
    },
    {
      title: "Ticket Promedio",
      value: "$43.94",
      change: "Promedio por mesa",
      icon: TrendingUp,
    },
    {
      title: "Ocupación Salón",
      value: "9 / 14 mesas",
      change: "64% capacidad",
      icon: Users,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {metrics.map((m) => {
        const Icon = m.icon;
        return (
          <div
            key={m.title}
            className="p-4 rounded-xl bg-card border border-border hover:border-border/80 transition-all shadow-sm"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                {m.title}
              </span>
              <div className="p-2 rounded-lg bg-muted text-foreground border border-border">
                <Icon className="w-4 h-4 text-accent" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-2xl font-bold tracking-tight text-foreground">
                {m.value}
              </span>
            </div>
            <p className="mt-1 text-[11px] text-muted-foreground font-medium">
              {m.change}
            </p>
          </div>
        );
      })}
    </div>
  );
}
