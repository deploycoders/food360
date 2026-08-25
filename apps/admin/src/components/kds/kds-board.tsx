"use client";

import React, { useState } from "react";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "@hello-pangea/dnd";
import { Order, OrderCard } from "./order-card";
import { Clock, Flame, CheckCircle2, History } from "lucide-react";
import { AnimatePresence } from "framer-motion";

const INITIAL_ORDERS: Order[] = [
  {
    id: "ord-101",
    number: "#101",
    table: "Mesa 04 (Salón)",
    timeElapsed: 3,
    allergyNote: "¡Alergia severa a frutos secos!",
    status: "pending",
    items: [
      {
        id: "i1",
        name: "Hamburguesa Trufada Angus",
        qty: 2,
        notes: "Término medio, papas bien crujientes",
      },
      { id: "i2", name: "Cerveza Artesanal IPA", qty: 2 },
    ],
  },
  {
    id: "ord-102",
    number: "#102",
    table: "Mesa 08 (Terraza)",
    timeElapsed: 14,
    status: "in_prep",
    items: [
      {
        id: "i3",
        name: "Pizza Napolitana Burrata",
        qty: 1,
        notes: "Masa fina",
      },
      {
        id: "i4",
        name: "Costillas BBQ Ahumadas",
        qty: 1,
        notes: "Salsa aparte",
      },
    ],
  },
  {
    id: "ord-100",
    number: "#100",
    table: "Mesa 02 (Salón)",
    timeElapsed: 22,
    status: "in_prep",
    items: [
      {
        id: "i5",
        name: "Smash Cheeseburger Doble",
        qty: 2,
        notes: "Sin cebolla",
      },
      { id: "i6", name: "Aros de Cebolla Crunch", qty: 1 },
    ],
  },
  {
    id: "ord-099",
    number: "#099",
    table: "Para Llevar / Delivery",
    timeElapsed: 18,
    status: "ready",
    items: [
      {
        id: "i7",
        name: "Poke Bowl Salmón Fresco",
        qty: 1,
        notes: "Sin sésamo",
      },
    ],
  },
];

const COLUMNS = [
  { id: "pending", title: "1. Pendientes", icon: Clock },
  { id: "in_prep", title: "2. En Preparación", icon: Flame },
  { id: "ready", title: "3. Listos para Servir", icon: CheckCircle2 },
];

export function KDSBoard() {
  const [orders, setOrders] = useState<Order[]>(INITIAL_ORDERS);
  const [deliveredCount, setDeliveredCount] = useState(0);

  const handleDragEnd = (result: DropResult) => {
    const { destination, draggableId } = result;
    if (!destination) return;

    const targetStatus = destination.droppableId as Order["status"];
    setOrders((prev) =>
      prev.map((ord) =>
        ord.id === draggableId ? { ...ord, status: targetStatus } : ord,
      ),
    );
  };

  const advanceStatus = (id: string) => {
    const targetOrder = orders.find((o) => o.id === id);
    if (!targetOrder) return;

    if (targetOrder.status === "pending") {
      setOrders((prev) =>
        prev.map((o) => (o.id === id ? { ...o, status: "in_prep" } : o)),
      );
    } else if (targetOrder.status === "in_prep") {
      setOrders((prev) =>
        prev.map((o) => (o.id === id ? { ...o, status: "ready" } : o)),
      );
    } else if (targetOrder.status === "ready") {
      // Al entregar, la quitamos de la pantalla activa
      setOrders((prev) => prev.filter((o) => o.id !== id));
      setDeliveredCount((prev) => prev + 1);
    }
  };

  const regressStatus = (id: string) => {
    const targetOrder = orders.find((o) => o.id === id);
    if (!targetOrder) return;

    if (targetOrder.status === "ready") {
      setOrders((prev) =>
        prev.map((o) => (o.id === id ? { ...o, status: "in_prep" } : o)),
      );
    } else if (targetOrder.status === "in_prep") {
      setOrders((prev) =>
        prev.map((o) => (o.id === id ? { ...o, status: "pending" } : o)),
      );
    }
  };

  return (
    <div className="h-full flex flex-col space-y-3">
      {/* Barra superior secundaria con contador de Entregados */}
      <div className="flex items-center justify-between px-1">
        <span className="text-xs text-muted-foreground font-medium">
          Comandas activas:{" "}
          <strong className="text-foreground">{orders.length}</strong>
        </span>

        <div className="flex items-center gap-2 text-xs text-muted-foreground bg-card border border-border px-3 py-1 rounded-lg">
          <History className="w-3.5 h-3.5 text-success" />
          <span>
            Entregados hoy:{" "}
            <strong className="text-success">{deliveredCount}</strong>
          </span>
        </div>
      </div>

      {/* Grid de 3 Columnas adaptativo */}
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="flex-1 flex md:grid md:grid-cols-3 gap-4 overflow-x-auto overflow-y-hidden pb-2 snap-x">
          {COLUMNS.map((col) => {
            const colOrders = orders.filter((o) => o.status === col.id);
            const Icon = col.icon;

            return (
              <div
                key={col.id}
                className="min-w-75 md:min-w-0 flex-1 bg-card/40 border border-border rounded-2xl flex flex-col h-full overflow-hidden snap-center"
              >
                {/* Cabecera Columna */}
                <div className="p-3.5 bg-card border-b border-border flex items-center justify-between shrink-0">
                  <div className="flex items-center gap-2">
                    <Icon className="w-4 h-4 text-accent" />
                    <h2 className="text-xs font-bold uppercase tracking-wider text-foreground">
                      {col.title}
                    </h2>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full bg-muted border border-border text-xs font-extrabold text-foreground">
                    {colOrders.length}
                  </span>
                </div>

                {/* Zona Droppable de Tarjetas */}
                <Droppable droppableId={col.id}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`flex-1 p-3 space-y-3 overflow-y-auto transition-colors ${
                        snapshot.isDraggingOver ? "bg-accent/5" : ""
                      }`}
                    >
                      <AnimatePresence>
                        {colOrders.map((order, index) => (
                          <Draggable
                            key={order.id}
                            draggableId={order.id}
                            index={index}
                          >
                            {(dragProvided) => (
                              <div
                                ref={dragProvided.innerRef}
                                {...dragProvided.draggableProps}
                                {...dragProvided.dragHandleProps}
                              >
                                <OrderCard
                                  order={order}
                                  onAdvanceStatus={advanceStatus}
                                  onRegressStatus={regressStatus}
                                />
                              </div>
                            )}
                          </Draggable>
                        ))}
                      </AnimatePresence>
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </div>
            );
          })}
        </div>
      </DragDropContext>
    </div>
  );
}
