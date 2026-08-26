"use client";

import React from "react";
import { QRSettings } from "@/types/settings";
import { QrCode, Wifi, Layers, CheckSquare } from "lucide-react";

interface QRTablesSettingsTabProps {
  data: QRSettings;
  onChange: (updated: QRSettings) => void;
}

export function QRTablesSettingsTab({
  data,
  onChange,
}: QRTablesSettingsTabProps) {
  const handleToggle = (field: keyof QRSettings) => {
    onChange({ ...data, [field]: !data[field] });
  };

  const handleInputChange = (
    field: keyof QRSettings,
    value: string | number,
  ) => {
    onChange({ ...data, [field]: value });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="rounded-2xl border border-border bg-card p-6 shadow-xs">
        <h2 className="text-sm font-bold text-foreground tracking-tight">
          Configuración de Mesas & Menú QR
        </h2>
        <p className="text-xs text-muted-foreground mt-0.5">
          Parámetros para la interacción de clientes mediante código QR en las
          mesas.
        </p>

        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {/* Cantidad de Mesas */}
          <div>
            <label className="block text-xs font-semibold text-foreground mb-1.5">
              Número de Mesas Habilitadas
            </label>
            <div className="relative">
              <Layers className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground/70" />
              <input
                type="number"
                min="1"
                max="200"
                value={data.tableCount}
                onChange={(e) =>
                  handleInputChange("tableCount", Number(e.target.value))
                }
                className="w-full rounded-xl border border-border bg-muted/20 pl-9 pr-3 py-2 text-xs text-foreground focus:border-accent focus:bg-card focus:outline-none transition-all"
              />
            </div>
          </div>

          {/* Porcentaje de Servicio */}
          <div>
            <label className="block text-xs font-semibold text-foreground mb-1.5">
              Propina / Cargo por Servicio (%)
            </label>
            <input
              type="number"
              min="0"
              max="30"
              value={data.serviceTaxPercentage}
              onChange={(e) =>
                handleInputChange(
                  "serviceTaxPercentage",
                  Number(e.target.value),
                )
              }
              className="w-full rounded-xl border border-border bg-muted/20 px-3 py-2 text-xs text-foreground focus:border-accent focus:bg-card focus:outline-none transition-all"
            />
          </div>
        </div>

        {/* Switches de Comportamiento */}
        <div className="mt-6 divide-y divide-border/40">
          <div className="flex items-center justify-between py-3">
            <div>
              <p className="text-xs font-semibold text-foreground">
                Permitir pedidos directos desde el QR
              </p>
              <p className="text-[11px] text-muted-foreground">
                Los clientes pueden enviar comandas al KDS sin esperar al
                mesonero.
              </p>
            </div>
            <button
              type="button"
              onClick={() => handleToggle("allowSelfOrdering")}
              className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                data.allowSelfOrdering ? "bg-accent" : "bg-muted"
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-card shadow-sm ring-0 transition duration-200 ease-in-out ${
                  data.allowSelfOrdering ? "translate-x-4" : "translate-x-0"
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between py-3">
            <div>
              <p className="text-xs font-semibold text-foreground">
                Exigir confirmación de número de mesa
              </p>
              <p className="text-[11px] text-muted-foreground">
                Obliga al cliente a reconfirmar su mesa antes de enviar la
                orden.
              </p>
            </div>
            <button
              type="button"
              onClick={() => handleToggle("requireTableNumber")}
              className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                data.requireTableNumber ? "bg-accent" : "bg-muted"
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-card shadow-sm ring-0 transition duration-200 ease-in-out ${
                  data.requireTableNumber ? "translate-x-4" : "translate-x-0"
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Red WiFi para Clientes */}
      <div className="rounded-2xl border border-border bg-card p-6 shadow-xs">
        <div className="flex items-center gap-2">
          <Wifi className="h-4 w-4 text-accent" />
          <h2 className="text-sm font-bold text-foreground tracking-tight">
            WiFi para Clientes (QR)
          </h2>
        </div>
        <p className="text-xs text-muted-foreground mt-0.5">
          Información de acceso rápido desplegada al escanear el menú.
        </p>

        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-xs font-semibold text-foreground mb-1.5">
              Nombre de Red (SSID)
            </label>
            <input
              type="text"
              value={data.wifiName}
              onChange={(e) => handleInputChange("wifiName", e.target.value)}
              className="w-full rounded-xl border border-border bg-muted/20 px-3 py-2 text-xs text-foreground focus:border-accent focus:bg-card focus:outline-none transition-all"
              placeholder="Ej. Food360_Guest"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-foreground mb-1.5">
              Contraseña
            </label>
            <input
              type="password"
              value={data.wifiPassword || ""}
              onChange={(e) =>
                handleInputChange("wifiPassword", e.target.value)
              }
              className="w-full rounded-xl border border-border bg-muted/20 px-3 py-2 text-xs text-foreground focus:border-accent focus:bg-card focus:outline-none transition-all"
              placeholder="••••••••"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
