import Link from "next/link";
import { Clock } from "lucide-react";
import type { DashboardRecentOrder } from "@/types/dashboard";

interface RecentOrdersTableProps {
  orders: DashboardRecentOrder[];
  currency: string;
  timezone: string;
}

const STATUS_LABELS: Record<string, string> = {
  PENDING: "Pendiente",
  CONFIRMED: "Confirmada",
  IN_PROGRESS: "En preparación",
  READY: "Lista",
  SERVED: "Servida",
  COMPLETED: "Completada",
  CANCELLED: "Cancelada",
};

function formatCurrency(value: number, currency: string): string {
  try {
    return new Intl.NumberFormat("es", { style: "currency", currency }).format(value);
  } catch {
    return `${value.toFixed(2)} ${currency}`;
  }
}

function formatDate(value: string | null, timezone: string): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  try {
    return new Intl.DateTimeFormat("es", {
      timeZone: timezone,
      dateStyle: "short",
      timeStyle: "short",
    }).format(date);
  } catch {
    return "—";
  }
}

function statusClass(status: string): string {
  if (["COMPLETED", "SERVED", "READY"].includes(status)) return "border-success/20 bg-success/10 text-success";
  if (status === "IN_PROGRESS") return "border-warning/20 bg-warning/10 text-warning";
  if (status === "CANCELLED") return "border-destructive/20 bg-destructive/10 text-destructive";
  return "border-border bg-muted text-muted-foreground";
}

export function RecentOrdersTable({ orders, currency, timezone }: RecentOrdersTableProps) {
  if (!orders.length) {
    return <p className="rounded-lg border border-dashed border-border p-6 text-center text-xs text-muted-foreground">Todavía no hay comandas registradas.</p>;
  }

  return (
    <div>
      <div className="mb-3 flex justify-end">
        <Link href="/orders" className="text-xs font-semibold text-accent hover:underline">Ver todas las comandas</Link>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[620px] text-left text-xs">
          <thead className="border-b border-border bg-muted/40 text-[10px] uppercase text-muted-foreground">
            <tr>
              <th className="px-3 py-2.5 font-semibold">Comanda</th>
              <th className="px-3 py-2.5 font-semibold">Mesa / origen</th>
              <th className="px-3 py-2.5 font-semibold">Cliente</th>
              <th className="px-3 py-2.5 font-semibold">Fecha</th>
              <th className="px-3 py-2.5 font-semibold">Total</th>
              <th className="px-3 py-2.5 font-semibold">Estado</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {orders.map((order) => {
              const origin = order.origin === "DINE_IN"
                ? order.tableNumber !== null ? `Mesa ${order.tableNumber}` : "En mesa"
                : order.origin === "TAKEAWAY" ? "Para llevar"
                  : order.origin === "DELIVERY" ? "Domicilio" : order.origin;
              return (
                <tr key={order.id} className="transition-colors hover:bg-muted/30">
                  <td className="px-3 py-3 font-semibold text-accent">#{order.id.slice(0, 8).toUpperCase()}</td>
                  <td className="px-3 py-3 text-foreground">{origin}</td>
                  <td className="px-3 py-3 text-muted-foreground">{order.customerName}</td>
                  <td className="whitespace-nowrap px-3 py-3 text-muted-foreground">
                    <span className="inline-flex items-center gap-1.5"><Clock aria-hidden="true" className="h-3 w-3" />{formatDate(order.createdAt, timezone)}</span>
                  </td>
                  <td className="whitespace-nowrap px-3 py-3 font-medium text-foreground">{formatCurrency(order.totalAmount, currency)}</td>
                  <td className="px-3 py-3"><span className={`inline-flex whitespace-nowrap rounded-md border px-2 py-1 text-[10px] font-medium ${statusClass(order.status)}`}>{STATUS_LABELS[order.status] ?? order.status}</span></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
