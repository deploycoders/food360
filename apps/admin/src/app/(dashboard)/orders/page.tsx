"use client";

import { OrderDetailModal } from "@/components/dashboard/orders/order-detail-modal";
import { OrdersFilters } from "@/components/dashboard/orders/orders-filters";
import { OrdersHeader } from "@/components/dashboard/orders/orders-header";
import { OrdersTable } from "@/components/dashboard/orders/orders-table";
import { Order, OrderStatus } from "@/types/order";
import React, { useState } from "react";

const MOCK_ORDERS: Order[] = [
  {
    id: "1",
    code: "#F360-101",
    createdAt: "2026-08-24 14:32",
    type: "dine_in",
    tableOrDestination: "Mesa 04 (Salón)",
    customerName: "Carlos Méndez",
    items: [
      { id: "i1", name: "Hamburguesa Trufada Angus", qty: 2, unitPrice: 22.0 },
      { id: "i2", name: "Cerveza Artesanal IPA", qty: 2, unitPrice: 7.25 },
    ],
    subtotal: 50.0,
    tax: 8.5,
    total: 58.5,
    status: "in_kitchen",
    paymentStatus: "pending",
  },
  {
    id: "2",
    code: "#F360-102",
    createdAt: "2026-08-24 14:28",
    type: "dine_in",
    tableOrDestination: "Mesa 08 (Terraza)",
    customerName: "Mariana Silva",
    items: [
      { id: "i3", name: "Pizza Napolitana Burrata", qty: 1, unitPrice: 18.0 },
      { id: "i4", name: "Costillas BBQ 500g", qty: 1, unitPrice: 28.0 },
      { id: "i5", name: "Limonada Menta y Jengibre", qty: 3, unitPrice: 4.0 },
    ],
    subtotal: 68.0,
    tax: 8.0,
    total: 76.0,
    status: "ready",
    paymentStatus: "pending",
  },
];

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>(MOCK_ORDERS);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus>("all");
  const [selectedDate, setSelectedDate] = useState("2026-08-24");
  const [activeOrder, setActiveOrder] = useState<Order | null>(null);

  // Filtros combinados
  const filteredOrders = orders.filter((ord) => {
    const matchesStatus =
      selectedStatus === "all" || ord.status === selectedStatus;
    const matchesSearch =
      ord.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ord.customerName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  // Conteo por estado para los tabs
  const statusCounts = orders.reduce(
    (acc, ord) => {
      acc.all = (acc.all || 0) + 1;
      acc[ord.status] = (acc[ord.status] || 0) + 1;
      return acc;
    },
    {} as Record<OrderStatus, number>,
  );

  const handleUpdateStatus = (orderId: string, newStatus: Order["status"]) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o)),
    );
    if (activeOrder?.id === orderId) {
      setActiveOrder((prev) => (prev ? { ...prev, status: newStatus } : null));
    }
  };

  return (
    <div className="p-2 md:p-6 space-y-6 mx-auto">
      <OrdersHeader
        totalOrders={orders.length}
        onExportCSV={() => alert("Exportando reporte en CSV...")}
      />

      <OrdersFilters
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedStatus={selectedStatus}
        onStatusChange={setSelectedStatus}
        selectedDate={selectedDate}
        onDateChange={setSelectedDate}
        statusCounts={statusCounts}
      />

      <OrdersTable
        orders={filteredOrders}
        onSelectOrder={(ord) => setActiveOrder(ord)}
      />

      <OrderDetailModal
        order={activeOrder}
        onClose={() => setActiveOrder(null)}
        onUpdateStatus={handleUpdateStatus}
      />
    </div>
  );
}
