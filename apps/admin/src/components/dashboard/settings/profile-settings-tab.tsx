"use client";

import React from "react";
import { BusinessProfile } from "@/types/settings";
import {
  Building,
  Phone,
  Mail,
  MapPin,
  DollarSign,
  Percent,
  Globe,
} from "lucide-react";

interface ProfileSettingsTabProps {
  data: BusinessProfile;
  onChange: (updated: BusinessProfile) => void;
}

export function ProfileSettingsTab({
  data,
  onChange,
}: ProfileSettingsTabProps) {
  const handleInputChange = (
    field: keyof BusinessProfile,
    value: string | number,
  ) => {
    onChange({ ...data, [field]: value });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Sección: Información General */}
      <div className="rounded-2xl border border-border bg-card p-6 shadow-xs">
        <h2 className="text-sm font-bold text-foreground tracking-tight">
          Información del Establecimiento
        </h2>
        <p className="text-xs text-muted-foreground mt-0.5">
          Datos públicos del negocio visibles en facturas e impresiones de
          comanda.
        </p>

        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {/* Nombre Comercial */}
          <div>
            <label className="block text-xs font-semibold text-foreground mb-1.5">
              Nombre Comercial
            </label>
            <div className="relative">
              <Building className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground/70" />
              <input
                type="text"
                value={data.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                className="w-full rounded-xl border border-border bg-muted/20 pl-9 pr-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:border-accent focus:bg-card focus:outline-none transition-all"
                placeholder="Ej. Food360 Grill & Bar"
              />
            </div>
          </div>

          {/* Razón Social / CIF */}
          <div>
            <label className="block text-xs font-semibold text-foreground mb-1.5">
              Razón Social / CIF / NIF
            </label>
            <input
              type="text"
              value={data.legalName}
              onChange={(e) => handleInputChange("legalName", e.target.value)}
              className="w-full rounded-xl border border-border bg-muted/20 px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:border-accent focus:bg-card focus:outline-none transition-all"
              placeholder="Ej. Food360 Hospitality S.L."
            />
          </div>

          {/* Teléfono de Contacto */}
          <div>
            <label className="block text-xs font-semibold text-foreground mb-1.5">
              Teléfono de Contacto
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground/70" />
              <input
                type="text"
                value={data.phone}
                onChange={(e) => handleInputChange("phone", e.target.value)}
                className="w-full rounded-xl border border-border bg-muted/20 pl-9 pr-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:border-accent focus:bg-card focus:outline-none transition-all"
                placeholder="+34 912 345 678"
              />
            </div>
          </div>

          {/* Correo de Notificaciones */}
          <div>
            <label className="block text-xs font-semibold text-foreground mb-1.5">
              Correo Electrónico
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground/70" />
              <input
                type="email"
                value={data.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                className="w-full rounded-xl border border-border bg-muted/20 pl-9 pr-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:border-accent focus:bg-card focus:outline-none transition-all"
                placeholder="contacto@food360.com"
              />
            </div>
          </div>

          {/* Dirección Física */}
          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-foreground mb-1.5">
              Dirección Física
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground/70" />
              <input
                type="text"
                value={data.address}
                onChange={(e) => handleInputChange("address", e.target.value)}
                className="w-full rounded-xl border border-border bg-muted/20 pl-9 pr-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:border-accent focus:bg-card focus:outline-none transition-all"
                placeholder="Calle Gran Vía 42, 28013 Madrid"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Sección: Configuración Regional y Fiscal */}
      <div className="rounded-2xl border border-border bg-card p-6 shadow-xs">
        <h2 className="text-sm font-bold text-foreground tracking-tight">
          Configuración Regional y Fiscal
        </h2>
        <p className="text-xs text-muted-foreground mt-0.5">
          Parámetros para la gestión de precios, impuestos y zona horaria local.
        </p>

        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {/* Moneda */}
          <div>
            <label className="block text-xs font-semibold text-foreground mb-1.5">
              Moneda Principal
            </label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground/70" />
              <select
                value={data.currency}
                onChange={(e) => handleInputChange("currency", e.target.value)}
                className="w-full appearance-none rounded-xl border border-border bg-muted/20 pl-9 pr-3 py-2 text-xs text-foreground focus:border-accent focus:bg-card focus:outline-none transition-all cursor-pointer"
              >
                <option value="EUR">EUR (€) - Euro</option>
                <option value="USD">USD ($) - Dólar Estadounidense</option>
                <option value="VES">VES (Bs) - Bolívar Venezolano</option>
                <option value="MXN">MXN ($) - Peso Mexicano</option>
              </select>
            </div>
          </div>

          {/* Tasa de IVA */}
          <div>
            <label className="block text-xs font-semibold text-foreground mb-1.5">
              Tasa de Impuesto / IVA (%)
            </label>
            <div className="relative">
              <Percent className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground/70" />
              <input
                type="number"
                min="0"
                max="100"
                step="0.5"
                value={data.taxRate}
                onChange={(e) =>
                  handleInputChange("taxRate", Number(e.target.value))
                }
                className="w-full rounded-xl border border-border bg-muted/20 pl-9 pr-3 py-2 text-xs text-foreground focus:border-accent focus:bg-card focus:outline-none transition-all"
              />
            </div>
          </div>

          {/* Zona Horaria */}
          <div>
            <label className="block text-xs font-semibold text-foreground mb-1.5">
              Zona Horaria
            </label>
            <div className="relative">
              <Globe className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground/70" />
              <select
                value={data.timezone}
                onChange={(e) => handleInputChange("timezone", e.target.value)}
                className="w-full appearance-none rounded-xl border border-border bg-muted/20 pl-9 pr-3 py-2 text-xs text-foreground focus:border-accent focus:bg-card focus:outline-none transition-all cursor-pointer"
              >
                <option value="Europe/Madrid">Europe/Madrid (UTC+1)</option>
                <option value="America/Caracas">America/Caracas (UTC-4)</option>
                <option value="America/New_York">
                  America/New_York (UTC-5)
                </option>
                <option value="America/Mexico_City">
                  America/Mexico_City (UTC-6)
                </option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
