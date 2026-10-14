"use client";

import React, { useEffect, useState } from "react";

import type { Table } from "@food360/types";
import { hasPermission, type AppRole } from "@food360/types";

import { TablesHeader } from "@/components/dashboard/tables/tables-header";
import { TableFormModal } from "@/components/dashboard/tables/table-form-modal";
import { TableQrModal } from "@/components/dashboard/tables/table-qr-modal";
import { TablesGrid } from "@/components/dashboard/tables/tables-grid";
import { TablesSkeleton } from "@/components/dashboard/tables/tables-skeleton";

import { confirmDeleteTable, showTimedToast } from "@/app/lib/swal";

import {
  createTable,
  deleteTable,
  getTables,
  updateTable,
} from "@/services/tables.service";

export default function TablesPage() {
  const [tables, setTables] = useState<Table[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);

  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [selectedQrTable, setSelectedQrTable] = useState<Table | null>(null);

  // Temporalmente usamos admin.
  // Después lo conectamos al userRole real del Dashboard.
  const userRole: AppRole = "admin";

  const canView = hasPermission(userRole, "tables.view");
  const canManage = hasPermission(userRole, "tables.manage");

  useEffect(() => {
    let mounted = true;

    async function loadTables() {
      try {
        setLoading(true);
        setError(null);

        const data = await getTables();

        if (mounted) {
          setTables(data);
        }
      } catch (err) {
        console.error("Error cargando mesas:", err);

        if (mounted) {
          setError(
            err instanceof Error
              ? err.message
              : "No se pudieron cargar las mesas",
          );
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadTables();

    return () => {
      mounted = false;
    };
  }, []);

  const handleCreateTable = () => {
    setSelectedTable(null);
    setFormMode("create");
    setIsFormModalOpen(true);
  };

  const handleEditTable = (table: Table) => {
    setSelectedTable(table);
    setFormMode("edit");
    setIsFormModalOpen(true);
  };

  const handleCloseFormModal = () => {
    setIsFormModalOpen(false);
    setSelectedTable(null);
  };

  const handleShowQr = (table: Table) => {
    setSelectedQrTable(table);
    setIsQrModalOpen(true);
  };

  const handleCloseQrModal = () => {
    setIsQrModalOpen(false);
    setSelectedQrTable(null);
  };

  const handleSubmitTable = async (tableNumber: number) => {
    if (formMode === "create") {
      const createdTable = await createTable({
        tableNumber,
      });

      setTables((currentTables) =>
        [...currentTables, createdTable].sort(
          (a, b) => a.tableNumber - b.tableNumber,
        ),
      );

      handleCloseFormModal();

      showTimedToast(
        `La mesa #${createdTable.tableNumber} fue agregada correctamente.`,
        "success",
      );

      return;
    }

    if (!selectedTable) {
      throw new Error("No se encontró la mesa que se desea editar");
    }

    const updatedTable = await updateTable(selectedTable.id, {
      tableNumber,
    });

    setTables((currentTables) =>
      currentTables
        .map((table) => (table.id === updatedTable.id ? updatedTable : table))
        .sort((a, b) => a.tableNumber - b.tableNumber),
    );

    handleCloseFormModal();

    showTimedToast(
      `La mesa ha sido actualizada a la numero #${updatedTable.tableNumber}.`,
      "success",
    );
  };

  const handleDeleteTable = (table: Table) => {
    confirmDeleteTable(table.tableNumber, async () => {
      await deleteTable(table.id);

      setTables((currentTables) =>
        currentTables.filter((currentTable) => currentTable.id !== table.id),
      );
    });
  };

  if (!canView) {
    return (
      <div className="rounded-2xl border border-border bg-card p-8 text-center">
        <h2 className="text-sm font-semibold text-foreground">
          Acceso no disponible
        </h2>

        <p className="mt-1 text-xs text-muted-foreground">
          No tienes permisos para consultar las mesas.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto space-y-6">
      <TablesHeader
        totalTables={tables.length}
        onCreateTable={handleCreateTable}
        canManage={canManage}
      />

      {loading ? (
        <TablesSkeleton />
      ) : error ? (
        <div className="rounded-2xl border border-destructive/20 bg-destructive/5 p-6">
          <p className="text-sm font-semibold text-destructive">
            No se pudieron cargar las mesas
          </p>

          <p className="mt-1 text-xs text-muted-foreground">{error}</p>
        </div>
      ) : (
        <TablesGrid
          tables={tables}
          canManage={canManage}
          onEdit={handleEditTable}
          onDelete={handleDeleteTable}
          onShowQr={handleShowQr}
        />
      )}

      <TableFormModal
        isOpen={isFormModalOpen}
        mode={formMode}
        table={selectedTable}
        onClose={handleCloseFormModal}
        onSubmit={handleSubmitTable}
      />

      <TableQrModal
        isOpen={isQrModalOpen}
        table={selectedQrTable}
        onClose={handleCloseQrModal}
      />
    </div>
  );
}
