import type { DashboardPopularItem } from "@/types/dashboard";

interface PopularCategoriesProps {
  products: DashboardPopularItem[];
  categories: DashboardPopularItem[];
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

export function PopularCategories({ products, categories, currency }: PopularCategoriesProps) {
  const renderItems = (items: DashboardPopularItem[], title: string, empty: string) => (
    <section>
      <h4 className="mb-3 text-xs font-semibold text-foreground">{title}</h4>
      {items.length ? (
        <div className="space-y-3">
          {items.map((item, index) => (
            <div key={item.id} className="flex items-start justify-between gap-3">
              <div className="flex min-w-0 items-start gap-2.5">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-muted text-[10px] font-bold text-muted-foreground">
                  {index + 1}
                </span>
                <div className="min-w-0">
                  <p className="truncate text-xs font-medium text-foreground">{item.name}</p>
                  <p className="mt-0.5 text-[11px] text-muted-foreground">{item.quantity} unidades</p>
                </div>
              </div>
              <span className="shrink-0 text-xs font-medium text-foreground">
                {formatCurrency(item.revenue, currency)}
              </span>
            </div>
          ))}
        </div>
      ) : <p className="text-xs text-muted-foreground">{empty}</p>}
    </section>
  );

  return (
    <div className="grid gap-6 sm:grid-cols-2">
      {renderItems(products, "Productos más vendidos", "Sin ventas registradas.")}
      {renderItems(categories, "Categorías populares", "Sin categorías con ventas.")}
      <p className="text-[11px] text-muted-foreground sm:col-span-2">
        Datos de pedidos completados de los últimos 30 días.
      </p>
    </div>
  );
}
