"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowDown,
  ArrowUp,
  Check,
  GripVertical,
  LayoutDashboard,
  ListOrdered,
  Plus,
  ReceiptText,
  RefreshCw,
  Trash2,
  TrendingUp,
  Wallet,
  X,
} from "lucide-react";
import { toast } from "sonner";

import { useRestaurant } from "@/context/RestaurantContext";
import { useDashboard } from "@/lib/hooks/use-dashboard";

import {
  DEFAULT_DASHBOARD_LAYOUT,
  type DashboardWidget,
  type DashboardWidgetId,
} from "@/types/dashboard";

import { MetricsCards } from "@/components/dashboard/metrics-cards";
import { SalesChart } from "@/components/dashboard/sales-chart";
import { PopularCategories } from "@/components/dashboard/popular-categories";
import { RecentOrdersTable } from "@/components/dashboard/recent-orders-table";
import { DashboardSkeleton } from "@/components/dashboard/dashboard-skeleton";
import { DashboardMasonryItem } from "@/components/dashboard/dashboard-masonry-item";

const WIDGET_OPTIONS: {
  id: DashboardWidgetId;
  title: string;
  description: string;
  defaultSize: "small" | "wide";
}[] = [
  {
    id: "sales",
    title: "Ventas de hoy",
    description: "Importe de pedidos completados",
    defaultSize: "small",
  },
  {
    id: "orders",
    title: "Comandas de hoy",
    description: "Pedidos registrados durante el día",
    defaultSize: "small",
  },
  {
    id: "average-ticket",
    title: "Ticket promedio",
    description: "Promedio de pedidos completados",
    defaultSize: "small",
  },
  {
    id: "sales-chart",
    title: "Evolución de ventas",
    description: "Ventas completadas durante los últimos siete días",
    defaultSize: "wide",
  },
  {
    id: "order-status",
    title: "Estado de comandas",
    description: "Distribución de estados de los últimos 30 días",
    defaultSize: "small",
  },
  {
    id: "table-occupancy",
    title: "Ocupación del salón",
    description: "Mesas con pedidos activos",
    defaultSize: "small",
  },
  {
    id: "popular-items",
    title: "Productos y categorías",
    description: "Artículos más vendidos de los últimos 30 días",
    defaultSize: "wide",
  },
  {
    id: "recent-orders",
    title: "Últimas comandas",
    description: "Pedidos recientes del restaurante",
    defaultSize: "wide",
  },
];

const STATUS_LABELS: Record<string, string> = {
  PENDING: "Pendiente",
  CONFIRMED: "Confirmada",
  IN_KITCHEN: "En cocina",
  IN_PROGRESS: "En preparación",
  READY: "Listo",
  SERVED: "Servido",
  COMPLETED: "Completado",
  CANCELLED: "Cancelado",
};

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

function formatDateTime(value: string | null, timezone: string): string {
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
    return date.toLocaleString("es");
  }
}

function EmptyWidget({ message }: { message: string }) {
  return (
    <div className="flex min-h-28 items-center justify-center rounded-xl border border-dashed border-border px-4 text-center text-xs text-muted-foreground">
      {message}
    </div>
  );
}

export default function DashboardPage() {
  const { restaurantId, loading: restaurantLoading } = useRestaurant();

  const {
    summary,
    layout,
    setLayout,
    loading,
    refreshing,
    error,
    saveState,
    loadSummary,
  } = useDashboard(restaurantId, restaurantLoading);

  const [newWidgetId, setNewWidgetId] = useState<DashboardWidgetId>("sales");

  const [draggedWidgetId, setDraggedWidgetId] =
    useState<DashboardWidgetId | null>(null);

  const [personalizing, setPersonalizing] = useState(false);

  const availableWidgets = useMemo(() => {
    const visibleIds = new Set(layout.widgets.map((widget) => widget.id));

    return WIDGET_OPTIONS.filter((widget) => !visibleIds.has(widget.id));
  }, [layout.widgets]);

  useEffect(() => {
    if (
      availableWidgets.length > 0 &&
      !availableWidgets.some((widget) => widget.id === newWidgetId)
    ) {
      setNewWidgetId(availableWidgets[0].id);
    }
  }, [availableWidgets, newWidgetId]);

  const currency = summary?.currency ?? "EUR";
  const timezone = summary?.timezone ?? "UTC";

  function updateWidgets(widgets: DashboardWidget[]) {
    setLayout({ widgets });
  }

  function addWidget() {
    const option = WIDGET_OPTIONS.find((widget) => widget.id === newWidgetId);

    if (!option || layout.widgets.some((widget) => widget.id === option.id)) {
      return;
    }

    updateWidgets([
      ...layout.widgets,
      {
        id: option.id,
        size: option.defaultSize,
      },
    ]);

    toast.success(`Widget "${option.title}" añadido.`);
  }

  function removeWidget(widgetId: DashboardWidgetId) {
    updateWidgets(layout.widgets.filter((widget) => widget.id !== widgetId));
  }

  function toggleWidgetSize(widgetId: DashboardWidgetId) {
    updateWidgets(
      layout.widgets.map((widget) =>
        widget.id === widgetId
          ? {
              ...widget,
              size: widget.size === "wide" ? "small" : "wide",
            }
          : widget,
      ),
    );
  }

  function moveWidget(widgetId: DashboardWidgetId, delta: number) {
    const from = layout.widgets.findIndex((widget) => widget.id === widgetId);
    const to = from + delta;

    if (from < 0 || to < 0 || to >= layout.widgets.length) {
      return;
    }

    const widgets = [...layout.widgets];
    const [moved] = widgets.splice(from, 1);

    if (!moved) return;

    widgets.splice(to, 0, moved);
    updateWidgets(widgets);
  }

  function dropWidget(targetId: DashboardWidgetId) {
    if (!draggedWidgetId || draggedWidgetId === targetId) {
      return;
    }

    const widgets = [...layout.widgets];

    const from = widgets.findIndex((widget) => widget.id === draggedWidgetId);
    const to = widgets.findIndex((widget) => widget.id === targetId);

    if (from < 0 || to < 0) return;

    const [moved] = widgets.splice(from, 1);

    if (!moved) return;

    widgets.splice(to, 0, moved);

    updateWidgets(widgets);
    setDraggedWidgetId(null);
  }

  function restoreLayout() {
    setLayout({
      widgets: DEFAULT_DASHBOARD_LAYOUT.widgets.map((widget) => ({
        ...widget,
      })),
    });

    toast.success("Se restauró la distribución predeterminada.");
  }

  function renderWidget(widget: DashboardWidget) {
    if (!summary) return null;

    const { metrics } = summary;

    switch (widget.id) {
      case "sales": {
        const change = metrics.salesChangePercent;

        const changeLabel =
          change === null
            ? "Sin ventas el día anterior para comparar"
            : `${change >= 0 ? "+" : ""}${change.toFixed(1)}% vs. ayer`;

        return (
          <MetricsCards
            title="Ventas de hoy"
            value={formatCurrency(metrics.salesToday, currency)}
            change={`${changeLabel} · Solo pedidos completados`}
            icon={Wallet}
          />
        );
      }

      case "orders":
        return (
          <MetricsCards
            title="Comandas de hoy"
            value={String(metrics.ordersToday)}
            change={`${metrics.completedOrdersToday} completadas hoy`}
            icon={ReceiptText}
          />
        );

      case "average-ticket":
        return (
          <MetricsCards
            title="Ticket promedio"
            value={formatCurrency(metrics.averageTicket, currency)}
            change="Promedio por pedido completado hoy"
            icon={TrendingUp}
          />
        );

      case "sales-chart":
        return <SalesChart points={summary.salesSeries} currency={currency} />;

      case "order-status": {
        const statuses = summary.orderStatuses.filter((item) => item.count > 0);

        const maximum = Math.max(...statuses.map((item) => item.count), 1);

        if (statuses.length === 0) {
          return (
            <EmptyWidget message="No hay comandas para el período seleccionado." />
          );
        }

        return (
          <div className="space-y-4">
            <p className="text-xs text-muted-foreground">Últimos 30 días</p>

            {statuses.map((item) => (
              <div key={item.status} className="space-y-1.5">
                <div className="flex items-center justify-between gap-3 text-xs">
                  <span className="text-foreground">
                    {STATUS_LABELS[item.status] ?? item.status}
                  </span>

                  <span className="tabular-nums text-muted-foreground">
                    {item.count}
                  </span>
                </div>

                <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-accent transition-all"
                    style={{
                      width: `${(item.count / maximum) * 100}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        );
      }

      case "table-occupancy": {
        const percentage = Math.min(
          100,
          Math.max(0, Math.round(metrics.occupancyPercent)),
        );

        return (
          <div className="flex min-h-36 flex-col justify-between gap-5">
            <div>
              <p className="text-3xl font-bold tracking-tight text-foreground">
                {metrics.occupiedTables}
                <span className="ml-1 text-base font-medium text-muted-foreground">
                  / {metrics.totalTables}
                </span>
              </p>

              <p className="mt-1 text-xs text-muted-foreground">
                Mesas con pedidos activos
              </p>
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Ocupación</span>

                <span className="font-semibold text-foreground">
                  {percentage}%
                </span>
              </div>

              <div className="h-2 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-accent transition-all"
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          </div>
        );
      }

      case "popular-items":
        return (
          <PopularCategories
            products={summary.popularProducts}
            categories={summary.popularCategories}
            currency={currency}
          />
        );

      case "recent-orders":
        return (
          <RecentOrdersTable
            orders={summary.recentOrders}
            currency={currency}
            timezone={timezone}
          />
        );

      default:
        return null;
    }
  }

  if (restaurantLoading || loading) {
    return <DashboardSkeleton />;
  }

  if (error && !summary) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Resumen Operativo
        </h1>

        <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-5">
          <p className="text-sm font-semibold text-foreground">
            No se pudo cargar el dashboard
          </p>

          <p className="mt-1 text-sm text-muted-foreground">{error}</p>

          <button
            type="button"
            onClick={() => void loadSummary()}
            className="mt-4 inline-flex h-9 items-center gap-2 rounded-lg border border-border px-3 text-xs font-semibold text-foreground transition-colors hover:bg-muted"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Resumen Operativo
          </h1>

          <p className="mt-1 text-xs text-muted-foreground">
            Datos reales de tu restaurante · Ventas de pedidos completados.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span
            className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-2.5 py-2 text-[11px] text-muted-foreground"
            role="status"
            aria-live="polite"
          >
            {saveState === "saving" ? (
              <>
                <RefreshCw className="h-3 w-3 animate-spin" />
                Guardando...
              </>
            ) : saveState === "error" ? (
              <>
                <X className="h-3 w-3 text-destructive" />
                Error al guardar
              </>
            ) : saveState === "saved" ? (
              <>
                <Check className="h-3 w-3 text-success" />
                Diseño guardado
              </>
            ) : (
              "Personaliza tus widgets"
            )}
          </span>

          <button
            type="button"
            onClick={() => void loadSummary()}
            disabled={refreshing}
            className="inline-flex h-9 items-center gap-2 rounded-lg border border-border bg-card px-3 text-xs font-semibold text-foreground transition-colors hover:bg-muted disabled:opacity-50"
          >
            <RefreshCw
              className={`h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`}
            />
            Actualizar
          </button>

          <Link
            href="/orders/new"
            className="inline-flex h-9 items-center gap-2 rounded-lg bg-accent px-3.5 text-xs font-semibold text-accent-foreground shadow-sm transition-opacity hover:opacity-90"
          >
            <Plus className="h-4 w-4" />
            Nueva comanda
          </Link>
        </div>
      </header>

      {error && (
        <div className="flex items-center justify-between gap-3 rounded-lg border border-warning/20 bg-warning/5 px-4 py-3 text-xs">
          <p className="text-foreground">{error}</p>

          <button
            type="button"
            onClick={() => void loadSummary()}
            className="shrink-0 font-semibold text-foreground hover:underline"
          >
            Reintentar
          </button>
        </div>
      )}

      <section className="rounded-xl border border-border bg-card p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <h2 className="text-sm font-semibold text-foreground">
              Personalizar dashboard
            </h2>

            <p className="mt-1 text-xs text-muted-foreground">
              Agrega, quita, redimensiona o mueve widgets. Arrástralos desde el
              icono de agarre.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:shrink-0 sm:justify-end">
            <button
              type="button"
              onClick={() => setPersonalizing((value) => !value)}
              aria-expanded={personalizing}
              className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-border px-3 text-xs font-semibold text-foreground transition-colors hover:bg-muted"
            >
              <ListOrdered className="h-4 w-4" />
              {personalizing ? "Terminar" : "Editar widgets"}
            </button>

            {personalizing && (
              <button
                type="button"
                onClick={restoreLayout}
                className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-border px-3 text-xs font-semibold text-foreground transition-colors hover:bg-muted"
              >
                Restaurar distribución
              </button>
            )}
          </div>
        </div>

        {personalizing && (
          <div className="mt-4 flex flex-col gap-2 border-t border-border pt-4 sm:flex-row">
            <select
              value={newWidgetId}
              onChange={(event) =>
                setNewWidgetId(event.target.value as DashboardWidgetId)
              }
              disabled={availableWidgets.length === 0}
              aria-label="Seleccionar widget para añadir"
              className="h-10 min-w-0 flex-1 rounded-lg border border-border bg-background px-3 text-sm text-foreground outline-none focus:border-accent disabled:opacity-50"
            >
              {availableWidgets.length === 0 ? (
                <option value="sales">Ya añadiste todos los widgets</option>
              ) : (
                availableWidgets.map((widget) => (
                  <option key={widget.id} value={widget.id}>
                    {widget.title} — {widget.description}
                  </option>
                ))
              )}
            </select>

            <button
              type="button"
              onClick={addWidget}
              disabled={availableWidgets.length === 0}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-accent px-4 text-xs font-semibold text-accent-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Plus className="h-4 w-4" />
              Añadir widget
            </button>
          </div>
        )}
      </section>

      {!summary || layout.widgets.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border px-5 py-14 text-center">
          <LayoutDashboard className="mx-auto h-8 w-8 text-muted-foreground/60" />

          <h2 className="mt-3 text-sm font-semibold text-foreground">
            Tu dashboard está vacío
          </h2>

          <p className="mt-1 text-xs text-muted-foreground">
            Añade los widgets que quieras mostrar en tu resumen operativo.
          </p>

          {!personalizing && (
            <button
              type="button"
              onClick={() => setPersonalizing(true)}
              className="mt-4 inline-flex h-9 items-center gap-2 rounded-lg bg-accent px-3.5 text-xs font-semibold text-accent-foreground"
            >
              <Plus className="h-4 w-4" />
              Añadir widget
            </button>
          )}
        </div>
      ) : (
        <section
          className="grid grid-flow-dense grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4"
          style={{ gridAutoRows: "8px" }}
          aria-label="Widgets del dashboard"
        >
          {layout.widgets.map((widget, index) => {
            const option = WIDGET_OPTIONS.find((item) => item.id === widget.id);

            if (!option) return null;

            const isWide = widget.size === "wide";

            return (
              <DashboardMasonryItem
                key={widget.id}
                size={widget.size}
                draggable={personalizing}
                onDragStart={(event) => {
                  if (!personalizing) return;

                  event.dataTransfer.effectAllowed = "move";
                  setDraggedWidgetId(widget.id);
                }}
                onDragOver={(event) => {
                  if (personalizing) event.preventDefault();
                }}
                onDrop={(event) => {
                  event.preventDefault();

                  if (personalizing) {
                    dropWidget(widget.id);
                  }
                }}
                onDragEnd={() => setDraggedWidgetId(null)}
                className={`transition-opacity ${
                  draggedWidgetId === widget.id ? "opacity-40" : "opacity-100"
                }`}
              >
                <article className="group min-w-0 overflow-hidden rounded-xl border border-border bg-card shadow-sm">
                  <div className="flex items-start justify-between gap-3 border-b border-border/70 px-4 py-3">
                    <div className="flex min-w-0 items-start gap-2">
                      {personalizing && (
                        <GripVertical
                          className="mt-0.5 h-4 w-4 shrink-0 cursor-grab text-muted-foreground/60 active:cursor-grabbing"
                          aria-hidden="true"
                        />
                      )}

                      <div className="min-w-0">
                        <h3 className="truncate text-sm font-bold text-foreground">
                          {option.title}
                        </h3>

                        <p className="mt-0.5 line-clamp-2 text-[11px] text-muted-foreground">
                          {option.description}
                        </p>
                      </div>
                    </div>

                    {personalizing && (
                      <div className="flex shrink-0 items-center gap-1">
                        <button
                          type="button"
                          title="Mover arriba"
                          aria-label={`Mover ${option.title} arriba`}
                          disabled={index === 0}
                          onClick={() => moveWidget(widget.id, -1)}
                          className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-25"
                        >
                          <ArrowUp className="h-3.5 w-3.5" />
                        </button>

                        <button
                          type="button"
                          title="Mover abajo"
                          aria-label={`Mover ${option.title} abajo`}
                          disabled={index === layout.widgets.length - 1}
                          onClick={() => moveWidget(widget.id, 1)}
                          className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-25"
                        >
                          <ArrowDown className="h-3.5 w-3.5" />
                        </button>

                        <button
                          type="button"
                          title={isWide ? "Reducir tamaño" : "Ampliar tamaño"}
                          aria-label={
                            isWide
                              ? `Reducir ${option.title}`
                              : `Ampliar ${option.title}`
                          }
                          onClick={() => toggleWidgetSize(widget.id)}
                          className="rounded-md px-1.5 py-1 text-[10px] font-semibold text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                        >
                          {isWide ? "1×" : "2×"}
                        </button>

                        <button
                          type="button"
                          title="Quitar widget"
                          aria-label={`Quitar ${option.title}`}
                          onClick={() => removeWidget(widget.id)}
                          className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="min-w-0 p-4">{renderWidget(widget)}</div>
                </article>
              </DashboardMasonryItem>
            );
          })}
        </section>
      )}

      <footer className="flex flex-col gap-1 border-t border-border pt-4 text-[11px] text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
        <span>
          Moneda: {currency} · Zona horaria: {timezone}
        </span>

        <span>
          Última actualización:{" "}
          {summary ? formatDateTime(summary.generatedAt, timezone) : "—"}
        </span>
      </footer>
    </div>
  );
}
