"use client";

import React from "react";
import { Download, ExternalLink, ShoppingBag } from "lucide-react";
import Link from "next/link";

interface OrdersHeaderProps {
  totalOrders: number;
  onExportCSV: () => void;
}

export function OrdersHeader({ totalOrders, onExportCSV }: OrdersHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
      <div>
        <div className="flex items-center gap-2">
          <div className="p-2 bg-accent/10 border border-accent/20 rounded-lg text-accent">
            <ShoppingBag className="w-5 h-5" />
          </div>
          <h1 className="text-xl font-bold text-foreground">
            Historial y Gestión de Pedidos
          </h1>
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          Monitorea, filtra, cobra y gestiona el estado administrativo de todas
          las comandas.
        </p>
      </div>

      <div className="flex items-center gap-2">
        <Link
          href="/kds"
          target="_blank"
          className="px-3.5 py-2 rounded-lg bg-accent/10 hover:bg-accent/20 border border-accent/30 text-accent text-xs font-semibold flex items-center gap-2 transition-colors"
        >
          <span>Pantalla KDS</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </Link>

        <button
          type="button"
          onClick={onExportCSV}
          className="px-3.5 py-2 rounded-lg bg-muted hover:bg-muted/80 border border-border text-foreground text-xs font-semibold flex items-center gap-2 transition-colors"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Exportar CSV</span>
        </button>
      </div>
    </div>
  );
}
