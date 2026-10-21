"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner";

import { hasPermission, type AppRole } from "@food360/types";

import { OrdersHeader } from "@/components/dashboard/orders/orders-header";
import {
  OrdersFilters,
  type OrdersView,
} from "@/components/dashboard/orders/orders-filters";
import { OrdersTable } from "@/components/dashboard/orders/orders-table";
import { OrderDetailModal } from "@/components/dashboard/orders/order-detail-modal";
import { CreateOrderModal } from "@/components/dashboard/orders/create-order-modal";

import { ordersService } from "@/services/orders.service";
import { getActiveProducts } from "@/services/product.service";
import { mapApiOrder, mapApiOrders } from "@/lib/orders/order-adapter";
import { useOrdersRealtime } from "@/lib/hooks/use-orders-realtime";
import { useRestaurant } from "@/context/RestaurantContext";

import type { Product } from "@/types/menu";
import type { Order, OrderStatus } from "@/types/order";
import type { ApiOrderStatus } from "@/types/order-api";

const PAGE_SIZE = 10;

const ACTIVE_STATUSES: OrderStatus[] = [
  "pending",
  "confirmed",
  "in_kitchen",
  "ready",
  "served",
];

const HISTORY_STATUSES: OrderStatus[] = ["completed", "cancelled"];

const ACTIVE_STATUS_PRIORITY: Partial<Record<OrderStatus, number>> = {
  pending: 0,
  confirmed: 1,
  in_kitchen: 2,
  ready: 3,
  served: 4,
};

const UI_TO_API_STATUS: Record<Exclude<OrderStatus, "all">, ApiOrderStatus> = {
  pending: "PENDING",
  confirmed: "CONFIRMED",
  in_kitchen: "IN_PROGRESS",
  ready: "READY",
  served: "SERVED",
  completed: "COMPLETED",
  cancelled: "CANCELLED",
};

function getLocalDateKey(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "";

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function getCreatedAtTimestamp(order: Order): number {
  const timestamp = new Date(order.createdAt).getTime();
  return Number.isNaN(timestamp) ? 0 : timestamp;
}

function getStatusLabel(status: OrderStatus): string {
  const labels: Record<OrderStatus, string> = {
    all: "Todos",
    pending: "Pendiente",
    confirmed: "Confirmada",
    in_kitchen: "En preparación",
    ready: "Lista",
    served: "Entregada",
    completed: "Completada",
    cancelled: "Cancelada",
  };

  return labels[status];
}

function escapeCsv(value: unknown): string {
  const text = String(value ?? "");
  return `"${text.replace(/"/g, '""')}"`;
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [selectedView, setSelectedView] = useState<OrdersView>("active");

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus>("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [currentPage, setCurrentPage] = useState(1);

  const [createOrderOpen, setCreateOrderOpen] = useState(false);
  const [activeOrder, setActiveOrder] = useState<Order | null>(null);
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);

  const { restaurantId, role } = useRestaurant();

  const canCreateOrders = role
    ? hasPermission(role as AppRole, "orders.create")
    : false;

  const loadOrders = useCallback(async () => {
    setLoading(true);
    setLoadError(null);

    try {
      const response = await ordersService.getOrders();
      setOrders(mapApiOrders(response));
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "No se pudieron cargar los pedidos.";

      setLoadError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadProducts = useCallback(async () => {
    if (!restaurantId) {
      setProducts([]);
      return;
    }

    setLoadingProducts(true);

    try {
      const result = await getActiveProducts(restaurantId);

      setProducts(
        result.filter((product) => product.isActive && !product.isOutOfStock),
      );
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "No se pudieron cargar los productos.",
      );
    } finally {
      setLoadingProducts(false);
    }
  }, [restaurantId]);

  useEffect(() => {
    void loadOrders();
  }, [loadOrders]);

  useEffect(() => {
    if (createOrderOpen) {
      void loadProducts();
    }
  }, [createOrderOpen, loadProducts]);

  const handleRealtimeUpsert = useCallback((updatedOrder: Order) => {
    setOrders((currentOrders) => {
      const exists = currentOrders.some(
        (order) => order.id === updatedOrder.id,
      );

      return exists
        ? currentOrders.map((order) =>
            order.id === updatedOrder.id ? updatedOrder : order,
          )
        : [updatedOrder, ...currentOrders];
    });

    setActiveOrder((currentOrder) =>
      currentOrder?.id === updatedOrder.id ? updatedOrder : currentOrder,
    );
  }, []);

  const handleRealtimeDelete = useCallback((orderId: string) => {
    setOrders((currentOrders) =>
      currentOrders.filter((order) => order.id !== orderId),
    );

    setActiveOrder((currentOrder) =>
      currentOrder?.id === orderId ? null : currentOrder,
    );
  }, []);

  useOrdersRealtime({
    onOrderUpsert: handleRealtimeUpsert,
    onOrderDelete: handleRealtimeDelete,
  });

  const viewCounts = useMemo<Record<OrdersView, number>>(() => {
    let active = 0;
    let history = 0;

    for (const order of orders) {
      if (ACTIVE_STATUSES.includes(order.status)) active++;
      else if (HISTORY_STATUSES.includes(order.status)) history++;
    }

    return { active, history };
  }, [orders]);

  const matchingOrders = useMemo(() => {
    const query = searchQuery.trim().toLocaleLowerCase("es");

    return orders.filter((order) => {
      const belongsToView =
        selectedView === "active"
          ? ACTIVE_STATUSES.includes(order.status)
          : HISTORY_STATUSES.includes(order.status);

      if (!belongsToView) return false;

      const matchesSearch =
        !query ||
        order.code.toLocaleLowerCase("es").includes(query) ||
        order.customerName.toLocaleLowerCase("es").includes(query) ||
        (order.customerPhone ?? "").toLocaleLowerCase("es").includes(query) ||
        order.items.some((item) =>
          item.name.toLocaleLowerCase("es").includes(query),
        );

      if (!matchesSearch) return false;
      if (selectedView === "active") return true;

      const orderDate = getLocalDateKey(order.createdAt);

      return (
        (!startDate || orderDate >= startDate) &&
        (!endDate || orderDate <= endDate)
      );
    });
  }, [orders, selectedView, searchQuery, startDate, endDate]);

  const statusCounts = useMemo<Partial<Record<OrderStatus, number>>>(() => {
    const counts: Partial<Record<OrderStatus, number>> = {
      all: matchingOrders.length,
      pending: 0,
      confirmed: 0,
      in_kitchen: 0,
      ready: 0,
      served: 0,
      completed: 0,
      cancelled: 0,
    };

    for (const order of matchingOrders) {
      counts[order.status] = (counts[order.status] ?? 0) + 1;
    }

    return counts;
  }, [matchingOrders]);

  const filteredOrders = useMemo(() => {
    const filtered =
      selectedStatus === "all"
        ? matchingOrders
        : matchingOrders.filter((order) => order.status === selectedStatus);

    return [...filtered].sort((a, b) => {
      if (selectedView === "history") {
        return getCreatedAtTimestamp(b) - getCreatedAtTimestamp(a);
      }

      const priorityDifference =
        (ACTIVE_STATUS_PRIORITY[a.status] ?? 99) -
        (ACTIVE_STATUS_PRIORITY[b.status] ?? 99);

      if (priorityDifference !== 0) return priorityDifference;

      return getCreatedAtTimestamp(a) - getCreatedAtTimestamp(b);
    });
  }, [matchingOrders, selectedStatus, selectedView]);

  const totalPages = Math.max(1, Math.ceil(filteredOrders.length / PAGE_SIZE));

  useEffect(() => {
    setCurrentPage((page) => Math.min(page, totalPages));
  }, [totalPages]);

  const pageStartIndex = (currentPage - 1) * PAGE_SIZE;

  const paginatedOrders = filteredOrders.slice(
    pageStartIndex,
    pageStartIndex + PAGE_SIZE,
  );

  const firstVisibleOrder =
    filteredOrders.length === 0 ? 0 : pageStartIndex + 1;

  const lastVisibleOrder = Math.min(
    pageStartIndex + PAGE_SIZE,
    filteredOrders.length,
  );

  const handleViewChange = useCallback((view: OrdersView) => {
    setSelectedView(view);
    setSelectedStatus("all");
    setCurrentPage(1);
  }, []);

  const handleSearchChange = useCallback((query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
  }, []);

  const handleStatusChange = useCallback((status: OrderStatus) => {
    setSelectedStatus(status);
    setCurrentPage(1);
  }, []);

  const handleDateRangeChange = useCallback(
    (range: { startDate: string; endDate: string }) => {
      setStartDate(range.startDate);
      setEndDate(range.endDate);
      setCurrentPage(1);
    },
    [],
  );

  const handleUpdateStatus = useCallback(
    async (orderId: string, newStatus: OrderStatus) => {
      if (newStatus === "all") return;

      setUpdatingOrderId(orderId);

      try {
        const updatedApiOrder = await ordersService.updateStatus(
          orderId,
          UI_TO_API_STATUS[newStatus],
        );

        const updatedOrder = mapApiOrder(updatedApiOrder);

        setOrders((currentOrders) =>
          currentOrders.map((order) =>
            order.id === orderId ? updatedOrder : order,
          ),
        );

        setActiveOrder((currentOrder) =>
          currentOrder?.id === orderId ? updatedOrder : currentOrder,
        );

        toast.success(`Pedido actualizado a: ${getStatusLabel(newStatus)}.`);
      } catch (error) {
        toast.error(
          error instanceof Error
            ? error.message
            : "No se pudo actualizar el estado del pedido.",
        );
      } finally {
        setUpdatingOrderId(null);
      }
    },
    [],
  );

  const handleExportCSV = useCallback(() => {
    if (filteredOrders.length === 0) {
      toast.info("No hay pedidos para exportar.");
      return;
    }

    const headers = [
      "Pedido",
      "Fecha",
      "Cliente",
      "Teléfono",
      "Origen",
      "Estado",
      "Cantidad de productos",
      "Total",
    ];

    const rows = filteredOrders.map((order) => [
      order.code,
      order.createdAt,
      order.customerName,
      order.customerPhone ?? "",
      order.type,
      getStatusLabel(order.status),
      order.items.reduce((sum, item) => sum + item.qty, 0),
      order.total.toFixed(2),
    ]);

    const csv = [headers, ...rows]
      .map((row) => row.map(escapeCsv).join(","))
      .join("\r\n");

    const blob = new Blob(["\uFEFF", csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    const dateSuffix =
      selectedView === "active"
        ? "todas"
        : startDate && endDate
          ? startDate === endDate
            ? startDate
            : `${startDate}_${endDate}`
          : startDate
            ? `desde-${startDate}`
            : endDate
              ? `hasta-${endDate}`
              : "todas";

    link.href = url;
    link.download = `food360-pedidos-${selectedView}-${dateSuffix}.csv`;

    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);

    toast.success("Exportación de pedidos completada.");
  }, [filteredOrders, selectedView, startDate, endDate]);

  return (
    <div className="min-w-0 space-y-5">
      <OrdersHeader
        onExportCSV={handleExportCSV}
        canCreateOrder={canCreateOrders}
        onCreateOrder={() => {
          if (!canCreateOrders) return;
          setCreateOrderOpen(true);
        }}
      />

      <OrdersFilters
        view={selectedView}
        onViewChange={handleViewChange}
        viewCounts={viewCounts}
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
        selectedStatus={selectedStatus}
        onStatusChange={handleStatusChange}
        startDate={startDate}
        endDate={endDate}
        onDateRangeChange={handleDateRangeChange}
        statusCounts={statusCounts}
      />

      {loadError && (
        <div
          role="alert"
          className="flex flex-col gap-3 rounded-xl border border-destructive/20 bg-destructive/5 p-4 sm:flex-row sm:items-center sm:justify-between"
        >
          <div className="min-w-0">
            <p className="text-sm font-medium text-foreground">
              No se pudieron cargar los pedidos
            </p>
            <p className="mt-1 break-words text-sm text-muted-foreground">
              {loadError}
            </p>
          </div>

          <button
            type="button"
            onClick={() => void loadOrders()}
            disabled={loading}
            className="min-h-10 shrink-0 rounded-lg border border-border px-4 py-2 text-sm font-medium transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Cargando..." : "Reintentar"}
          </button>
        </div>
      )}

      <OrdersTable
        orders={paginatedOrders}
        onSelectOrder={setActiveOrder}
        loading={loading}
      />

      {!loading && filteredOrders.length > 0 && (
        <nav
          aria-label="Paginación de órdenes"
          className="flex flex-col gap-3 rounded-xl border border-border bg-card px-3 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-4"
        >
          <p className="text-xs text-muted-foreground">
            Mostrando{" "}
            <span className="font-semibold text-foreground">
              {firstVisibleOrder}–{lastVisibleOrder}
            </span>{" "}
            de{" "}
            <span className="font-semibold text-foreground">
              {filteredOrders.length}
            </span>{" "}
            órdenes
          </p>

          <div className="flex items-center justify-between gap-3 sm:justify-end">
            <button
              type="button"
              onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
              disabled={currentPage <= 1}
              className="inline-flex min-h-10 items-center justify-center gap-1 rounded-lg border border-border px-3 text-xs font-semibold text-foreground transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronLeft aria-hidden="true" className="h-4 w-4" />
              Anterior
            </button>

            <span
              aria-live="polite"
              className="whitespace-nowrap text-xs font-medium text-muted-foreground"
            >
              Página {currentPage} de {totalPages}
            </span>

            <button
              type="button"
              onClick={() =>
                setCurrentPage((page) => Math.min(totalPages, page + 1))
              }
              disabled={currentPage >= totalPages}
              className="inline-flex min-h-10 items-center justify-center gap-1 rounded-lg border border-border px-3 text-xs font-semibold text-foreground transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40"
            >
              Siguiente
              <ChevronRight aria-hidden="true" className="h-4 w-4" />
            </button>
          </div>
        </nav>
      )}

      <OrderDetailModal
        order={activeOrder}
        onClose={() => setActiveOrder(null)}
        onUpdateStatus={handleUpdateStatus}
        updating={updatingOrderId === activeOrder?.id}
      />

      <CreateOrderModal
        open={createOrderOpen}
        onClose={() => setCreateOrderOpen(false)}
        onCreated={loadOrders}
        products={products}
      />

      {loadingProducts && createOrderOpen && (
        <p className="sr-only" role="status">
          Cargando productos disponibles...
        </p>
      )}
    </div>
  );
}
