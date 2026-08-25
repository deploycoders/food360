import React from "react";
import Link from "next/link";
import { ChevronRight, Clock } from "lucide-react";

const recentOrders = [
  {
    id: "ord-101",
    number: "#F360-101",
    table: "Mesa 04 (Salón)",
    customer: "Carlos Méndez",
    time: "14:32 (12 min)",
    total: "$58.50",
    status: "En Cocina",
  },
  {
    id: "ord-102",
    number: "#F360-102",
    table: "Mesa 08 (Terraza)",
    customer: "Mariana Silva",
    time: "14:28 (16 min)",
    total: "$76.00",
    status: "Listo",
  },
  {
    id: "ord-103",
    number: "#F360-103",
    table: "Takeaway",
    customer: "Juan Pérez",
    time: "14:35 (9 min)",
    total: "$24.50",
    status: "Pendiente",
  },
];

function getStatusBadge(status: string) {
  switch (status) {
    case "Listo":
      return "bg-success/10 text-success border-success/20";
    case "En Cocina":
      return "bg-warning/10 text-warning border-warning/20";
    default:
      return "bg-muted text-muted-foreground border-border";
  }
}

export function RecentOrdersTable() {
  return (
    <div className="p-5 rounded-xl bg-card border border-border">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-sm font-bold text-foreground">
            Comandas en Tiempo Real
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Últimas órdenes ingresadas al sistema
          </p>
        </div>
        <Link
          href="/orders"
          className="inline-flex items-center gap-1 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
        >
          <span>Ver todas</span>
          <ChevronRight className="w-4 h-4" />
        </Link>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="uppercase text-[10px] text-muted-foreground bg-muted/40 border-b border-border">
            <tr>
              <th className="px-3 py-2.5 font-semibold">Nº Comanda</th>
              <th className="px-3 py-2.5 font-semibold">Mesa</th>
              <th className="px-3 py-2.5 font-semibold">Cliente</th>
              <th className="px-3 py-2.5 font-semibold">Tiempo</th>
              <th className="px-3 py-2.5 font-semibold">Total</th>
              <th className="px-3 py-2.5 font-semibold">Estado</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60 text-foreground">
            {recentOrders.map((ord) => (
              <tr
                key={ord.id}
                className="hover:bg-muted/40 transition-colors"
              >
                <td className="px-3 py-3 font-semibold text-accent">
                  {ord.number}
                </td>
                <td className="px-3 py-3 text-foreground">{ord.table}</td>
                <td className="px-3 py-3 text-muted-foreground">{ord.customer}</td>
                <td className="px-3 py-3 text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-muted-foreground/60" />
                    {ord.time}
                  </span>
                </td>
                <td className="px-3 py-3 font-medium text-foreground">
                  {ord.total}
                </td>
                <td className="px-3 py-3">
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium border ${getStatusBadge(
                      ord.status
                    )}`}
                  >
                    {ord.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
