"use client";

import React, { useState } from "react";
import {
  QrCode,
  Download,
  Printer,
  ExternalLink,
  Settings2,
  FileText,
  Sparkles,
  CheckCircle2,
} from "lucide-react";

interface QRGeneratorTabProps {
  tableCount?: number;
  baseUrl?: string;
}

export function QRGeneratorTab({
  tableCount: initialTableCount = 20,
  baseUrl: initialBaseUrl = "https://food360.app/m/vanguardia-grill",
}: QRGeneratorTabProps) {
  const [totalTables, setTotalTables] = useState<number>(initialTableCount);
  const [baseUrl, setBaseUrl] = useState<string>(initialBaseUrl);
  const [selectedTarget, setSelectedTarget] = useState<string>("general");
  const [allowDirectOrdering, setAllowDirectOrdering] = useState<boolean>(true);

  // Determinar URL según selección
  const currentUrl =
    selectedTarget === "general"
      ? baseUrl
      : `${baseUrl}?table=${selectedTarget}`;

  // API externa para generar el QR dinámico de alta resolución
  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(
    currentUrl,
  )}&color=000000&bgcolor=ffffff&margin=10`;

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* PANEL IZQUIERDO: Configuración Operativa & Impresión Masiva (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Card 1: Ajustes del Dominio y Asignación de Mesas */}
          <div className="rounded-2xl border border-border bg-card p-6 shadow-xs space-y-5">
            <div className="flex items-center gap-2.5 border-b border-border/40 pb-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent/10 text-accent">
                <Settings2 className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-foreground tracking-tight">
                  Parámetros del Menú Digital
                </h2>
                <p className="text-xs text-muted-foreground">
                  Configura cómo interactúan los comensales con los enlaces QR.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-foreground mb-1.5">
                  URL Base del Establecimiento
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={baseUrl}
                    onChange={(e) => setBaseUrl(e.target.value)}
                    className="w-full rounded-xl border border-border bg-muted/20 px-3 py-2 text-xs font-mono text-foreground focus:border-accent focus:bg-card focus:outline-none transition-all"
                  />
                  <a
                    href={baseUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2.5 rounded-xl bg-muted/50 border border-border text-foreground hover:bg-muted transition-all"
                    title="Abrir menú vista previa"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1.5">
                  Número Total de Mesas
                </label>
                <input
                  type="number"
                  min={1}
                  max={200}
                  value={totalTables}
                  onChange={(e) =>
                    setTotalTables(Math.max(1, parseInt(e.target.value) || 1))
                  }
                  className="w-full rounded-xl border border-border bg-muted/20 px-3 py-2 text-xs text-foreground font-semibold focus:border-accent focus:bg-card focus:outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1.5">
                  Modo de Pedido en Mesa
                </label>
                <button
                  type="button"
                  onClick={() => setAllowDirectOrdering(!allowDirectOrdering)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                    allowDirectOrdering
                      ? "border-accent/30 bg-accent/5 text-accent"
                      : "border-border bg-muted/20 text-muted-foreground"
                  }`}
                >
                  <span>
                    {allowDirectOrdering
                      ? "Pedido y Pago Directo"
                      : "Solo Carta Digital"}
                  </span>
                  <CheckCircle2
                    className={`h-4 w-4 ${allowDirectOrdering ? "opacity-100" : "opacity-30"}`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Card 2: UX Real - Descarga e Impresión Masiva para Imprenta */}
          <div className="rounded-2xl border border-border bg-card p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <Printer className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-foreground tracking-tight">
                  Exportación Masiva para Imprenta / Acrílicos
                </h2>
                <p className="text-xs text-muted-foreground">
                  Genera la plantilla completa con los {totalTables} códigos QR
                  listos para imprimir.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-muted/30 border border-border/50 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="space-y-1 text-center sm:text-left">
                <span className="text-xs font-semibold text-foreground">
                  Lote Completo (Mesas 1 a {totalTables} + QR General)
                </span>
                <p className="text-[11px] text-muted-foreground">
                  Formato A4 optimizado para impresión de stickers transparentes
                  o acrílicos de mesa.
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="flex items-center gap-1.5 px-4 py-2.5 bg-accent text-accent-foreground rounded-xl text-xs font-bold hover:opacity-90 transition-all cursor-pointer shadow-xs"
                >
                  <FileText className="h-4 w-4" />
                  Imprimir Lote PDF
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* PANEL DERECHO: Previsualización Elegante de Sticker Individual (5 cols) */}
        <div className="lg:col-span-5">
          <div className="rounded-2xl border border-border bg-card p-6 shadow-xs space-y-5">
            {/* Selector de Inspección */}
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5">
                Inspeccionar / Reimprimir QR Individual
              </label>
              <select
                value={selectedTarget}
                onChange={(e) => setSelectedTarget(e.target.value)}
                className="w-full rounded-xl border border-border bg-muted/20 px-3 py-2 text-xs font-semibold text-foreground focus:border-accent focus:bg-card focus:outline-none transition-all cursor-pointer"
              >
                <option value="general">
                  Menú General (Para Llevar / Delivery)
                </option>
                <optgroup label="Mesas del Local">
                  {Array.from({ length: totalTables }).map((_, i) => (
                    <option key={i + 1} value={(i + 1).toString()}>
                      Mesa N° {i + 1}
                    </option>
                  ))}
                </optgroup>
              </select>
            </div>

            {/* Vista Previa Visual del Sticker Físico */}
            <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-linear-to-b from-neutral-50 to-neutral-100 dark:from-neutral-900 dark:to-neutral-950 p-6 flex flex-col items-center text-center shadow-inner">
              <div className="w-full flex items-center justify-between mb-4">
                <span className="text-[10px] font-bold uppercase tracking-wider text-accent bg-accent/10 px-2.5 py-0.5 rounded-full">
                  Sticker de Mesa
                </span>
                <span className="text-[10px] font-mono text-muted-foreground">
                  {selectedTarget === "general"
                    ? "QR Público"
                    : `ID: M-${selectedTarget}`}
                </span>
              </div>

              {/* Tarjeta del QR */}
              <div className="p-4 bg-white rounded-2xl shadow-lg border border-neutral-200/80 my-2">
                <img
                  src={qrImageUrl}
                  alt={`QR ${selectedTarget}`}
                  className="w-40 h-40 object-contain"
                />
              </div>

              <h3 className="text-sm font-bold text-neutral-800 dark:text-neutral-100 mt-3">
                {selectedTarget === "general"
                  ? "Menú Digital General"
                  : `Mesa N° ${selectedTarget}`}
              </h3>
              <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-0.5 max-w-50">
                Escanea el código con tu cámara para ver la carta y hacer tu
                pedido.
              </p>

              <div className="mt-4 pt-3 border-t border-neutral-200 dark:border-neutral-800 w-full flex items-center justify-center gap-1.5 text-[10px] font-mono text-neutral-400">
                <span>{currentUrl}</span>
              </div>
            </div>

            {/* Acciones para la selección actual */}
            <div className="grid grid-cols-2 gap-2">
              <a
                href={qrImageUrl}
                download={`QR-${selectedTarget === "general" ? "General" : `Mesa-${selectedTarget}`}.png`}
                className="flex items-center justify-center gap-1.5 rounded-xl bg-muted px-3 py-2 text-xs font-semibold text-foreground hover:bg-muted/80 transition-all cursor-pointer"
              >
                <Download className="h-3.5 w-3.5" />
                <span>Descargar PNG</span>
              </a>
              <button
                type="button"
                onClick={() => window.print()}
                className="flex items-center justify-center gap-1.5 rounded-xl bg-accent/10 border border-accent/20 px-3 py-2 text-xs font-semibold text-accent hover:bg-accent/20 transition-all cursor-pointer"
              >
                <Printer className="h-3.5 w-3.5" />
                <span>Imprimir Este</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
