"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { OrdersHeader } from "@/components/dashboard/orders/orders-header";
import { OrdersFilters } from "@/components/dashboard/orders/orders-filters";
import { OrdersTable } from "@/components/dashboard/orders/orders-table";
import { OrderDetailModal } from "@/components/dashboard/orders/order-detail-modal";

import { ordersService } from "@/services/orders.service";
import { mapApiOrder, mapApiOrders } from "@/lib/orders/order-adapter";

import type { Order, OrderStatus } from "@/types/order";
import type { ApiOrderStatus } from "@/types/order-api";

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
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus>("all");
  const [selectedDate, setSelectedDate] = useState("");

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [activeOrder, setActiveOrder] = useState<Order | null>(null);
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);

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

  useEffect(() => {
    void loadOrders();
  }, [loadOrders]);

  // Búsqueda y fecha se aplican antes de calcular los contadores.
  const matchingOrders = useMemo(() => {
    const query = searchQuery.trim().toLocaleLowerCase("es");

    return orders.filter((order) => {
      const matchesSearch =
        !query ||
        order.code.toLocaleLowerCase("es").includes(query) ||
        order.customerName.toLocaleLowerCase("es").includes(query) ||
        (order.customerPhone ?? "").toLocaleLowerCase("es").includes(query) ||
        order.items.some((item) =>
          item.name.toLocaleLowerCase("es").includes(query),
        );

      const matchesDate =
        !selectedDate || getLocalDateKey(order.createdAt) === selectedDate;

      return matchesSearch && matchesDate;
    });
  }, [orders, searchQuery, selectedDate]);

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
    if (selectedStatus === "all") return matchingOrders;

    return matchingOrders.filter((order) => order.status === selectedStatus);
  }, [matchingOrders, selectedStatus]);

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
        const message =
          error instanceof Error
            ? error.message
            : "No se pudo actualizar el estado del pedido.";

        toast.error(message);
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

    link.href = url;
    link.download = `food360-pedidos-${selectedDate || "todos"}.csv`;

    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);

    toast.success("Exportación de pedidos completada.");
  }, [filteredOrders, selectedDate]);

  return (
    <div className="min-w-0 space-y-5">
      <OrdersHeader totalOrders={orders.length} onExportCSV={handleExportCSV} />

      <OrdersFilters
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedStatus={selectedStatus}
        onStatusChange={setSelectedStatus}
        startDate={startDate}
        endDate={endDate}
        onDateRangeChange={({ startDate, endDate }) => {
          setStartDate(startDate);
          setEndDate(endDate);
        }}
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
            <p className="mt-1 wrap-break-word text-sm text-muted-foreground">
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
        orders={filteredOrders}
        onSelectOrder={setActiveOrder}
        loading={loading}
      />

      <OrderDetailModal
        order={activeOrder}
        onClose={() => setActiveOrder(null)}
        onUpdateStatus={handleUpdateStatus}
        updating={updatingOrderId === activeOrder?.id}
      />
    </div>
  );
}
