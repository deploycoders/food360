import type { DashboardSalesPoint } from "@/types/dashboard";

interface SalesChartProps {
  points: DashboardSalesPoint[];
  currency: string;
}

function formatCurrency(value: number, currency: string): string {
  try {
    return new Intl.NumberFormat("es", {
      style: "currency",
      currency,
      maximumFractionDigits: 2,
    }).format(value);
  } catch {
    return `${value.toFixed(2)} ${currency}`;
  }
}

export function SalesChart({ points, currency }: SalesChartProps) {
  const maximum = Math.max(...points.map((point) => point.sales), 1);
  const total = points.reduce((sum, point) => sum + point.sales, 0);

  return (
    <div className="space-y-4">
      <div>
        <p className="text-xs text-muted-foreground">Importe por día · Últimos siete días</p>
        <p className="mt-1 text-lg font-semibold text-foreground">
          {formatCurrency(total, currency)}
        </p>
      </div>
      {points.length ? (
        <div className="flex h-44 items-end gap-2" aria-label="Ventas completadas por día">
          {points.map((point) => {
            const height = (point.sales / maximum) * 100;
            return (
              <div
                key={point.date}
                className="group flex h-full min-w-0 flex-1 flex-col items-center justify-end gap-2"
                title={`${point.date}: ${formatCurrency(point.sales, currency)}`}
              >
                <div className="flex w-full flex-1 items-end justify-center">
                  <div
                    className={`w-full max-w-12 rounded-t-md transition-all ${point.sales > 0 ? "bg-accent group-hover:opacity-80" : "bg-muted"}`}
                    style={{ height: `${Math.max(height, point.sales > 0 ? 4 : 2)}%` }}
                  />
                </div>
                <span className="text-[10px] capitalize text-muted-foreground">{point.label}</span>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="rounded-lg border border-dashed border-border p-6 text-center text-xs text-muted-foreground">
          No hay ventas completadas en este período.
        </p>
      )}
      <p className="text-[11px] text-muted-foreground">
        Solo pedidos completados. El esquema no registra cuándo se completan; se agrupan por fecha de creación.
      </p>
    </div>
  );
}
