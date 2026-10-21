"use client";

import React from "react";
import {
  DragDropContext,
  Droppable,
  Draggable,
  type DropResult,
} from "@hello-pangea/dnd";
import { CheckCircle2, Clock, Flame, History, RefreshCw } from "lucide-react";

import { OrderCard } from "./order-card";
import type { KDSColumnStatus } from "@/types/kds";
import { useKDSOrders } from "@/lib/hooks/use-kds-orders";

const COLUMNS: {
  id: KDSColumnStatus;
  title: string;
  icon: typeof Clock;
}[] = [
  { id: "pending", title: "1. Pendientes", icon: Clock },
  { id: "in_kitchen", title: "2. En Preparación", icon: Flame },
  { id: "ready", title: "3. Listos para Servir", icon: CheckCircle2 },
];

export function KDSBoard() {
  const {
    orders,
    deliveredCount,
    loading,
    error,
    updatingIds,
    refresh,
    advanceOrder,
    regressOrder,
    moveOrder,
  } = useKDSOrders();

  const handleDragEnd = (result: DropResult) => {
    const { destination, draggableId } = result;

    if (!destination || destination.droppableId === result.source.droppableId) {
      return;
    }

    const isValidColumn = COLUMNS.some(
      (column) => column.id === destination.droppableId,
    );

    if (!isValidColumn) return;

    void moveOrder(draggableId, destination.droppableId as KDSColumnStatus);
  };

  if (loading && orders.length === 0) {
    return (
      <div className="flex h-full min-h-60 items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-muted-foreground">
          <RefreshCw className="h-6 w-6 animate-spin" />
          <p className="text-sm">Cargando comandas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-0 flex-col gap-3">
      {/* Barra superior */}
      <div className="flex items-center justify-between gap-3 px-1">
        <span className="text-xs font-medium text-muted-foreground">
          Comandas activas:{" "}
          <strong className="text-foreground">{orders.length}</strong>
        </span>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-1 text-xs text-muted-foreground">
            <History className="h-3.5 w-3.5 text-success" />
            <span>
              Entregados:{" "}
              <strong className="text-success">{deliveredCount}</strong>
            </span>
          </div>

          <button
            type="button"
            onClick={() => void refresh()}
            disabled={loading}
            aria-label="Actualizar comandas"
            title="Actualizar comandas"
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50"
          >
            <RefreshCw
              className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`}
            />
          </button>
        </div>
      </div>

      {/* Errores */}
      {error && (
        <div
          role="alert"
          className="flex items-center justify-between gap-3 rounded-xl border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive"
        >
          <span>{error}</span>
          <button
            type="button"
            onClick={() => void refresh()}
            className="shrink-0 font-semibold underline underline-offset-2"
          >
            Reintentar
          </button>
        </div>
      )}

      {/* Columnas */}
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="flex min-h-0 flex-1 snap-x gap-4 overflow-x-auto overflow-y-hidden pb-2 md:grid md:grid-cols-3">
          {COLUMNS.map((column) => {
            const Icon = column.icon;

            const columnOrders = orders.filter((order) =>
              column.id === "pending"
                ? order.status === "pending" || order.status === "confirmed"
                : order.status === column.id,
            );

            return (
              <section
                key={column.id}
                className="flex h-full min-h-0 min-w-75 flex-1 snap-center flex-col overflow-hidden rounded-2xl border border-border bg-card/40 md:min-w-0"
              >
                <header className="flex shrink-0 items-center justify-between border-b border-border bg-card p-3.5">
                  <div className="flex items-center gap-2">
                    <Icon className="h-4 w-4 text-accent" />
                    <h2 className="text-xs font-bold uppercase tracking-wider text-foreground">
                      {column.title}
                    </h2>
                  </div>

                  <span className="rounded-full border border-border bg-muted px-2.5 py-0.5 text-xs font-extrabold text-foreground">
                    {columnOrders.length}
                  </span>
                </header>

                <Droppable droppableId={column.id}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`min-h-0 flex-1 space-y-3 overflow-y-auto p-3 transition-colors ${
                        snapshot.isDraggingOver ? "bg-accent/5" : ""
                      }`}
                    >
                      {columnOrders.map((order, index) => (
                        <Draggable
                          key={order.id}
                          draggableId={order.id}
                          index={index}
                          isDragDisabled={updatingIds.has(order.id)}
                        >
                          {(dragProvided) => (
                            <div
                              ref={dragProvided.innerRef}
                              {...dragProvided.draggableProps}
                              {...dragProvided.dragHandleProps}
                            >
                              <OrderCard
                                order={order}
                                isUpdating={updatingIds.has(order.id)}
                                onAdvanceStatus={advanceOrder}
                                onRegressStatus={regressOrder}
                              />
                            </div>
                          )}
                        </Draggable>
                      ))}

                      {provided.placeholder}

                      {columnOrders.length === 0 && (
                        <div className="rounded-xl border border-dashed border-border px-3 py-8 text-center text-xs text-muted-foreground">
                          No hay comandas en esta columna.
                        </div>
                      )}
                    </div>
                  )}
                </Droppable>
              </section>
            );
          })}
        </div>
      </DragDropContext>
    </div>
  );
}
