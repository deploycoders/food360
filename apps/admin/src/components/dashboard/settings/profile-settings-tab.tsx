"use client";

import React from "react";

import type { BusinessProfile } from "@/types/settings";

import {
  Building,
  Phone,
  Mail,
  MapPin,
  DollarSign,
  Percent,
  Globe,
  LoaderCircle,
  Save,
} from "lucide-react";

import { RestaurantLogoUpload } from "./restaurant-logo-upload";

interface ProfileSettingsTabProps {
  data: BusinessProfile;
  onChange: (updated: BusinessProfile) => void;
  onSave: () => void;
  isSaving: boolean;
  hasChanges: boolean;
  onLogoChange: (logoUrl: string | undefined) => void;
}

const inputClassName =
  "box-border h-11 w-full rounded-xl border border-border bg-background px-3 text-sm text-foreground outline-none transition-all duration-200 placeholder:text-muted-foreground/70 focus:border-accent focus:bg-card focus:ring-2 focus:ring-accent/10 disabled:opacity-50";

const iconClassName =
  "pointer-events-none absolute left-3 top-1/2 h-[17px] w-[17px] -translate-y-1/2 text-muted-foreground/70";

const labelClassName = "mb-2 block text-xs font-semibold text-foreground";

export function ProfileSettingsTab({
  data,
  onChange,
  onSave,
  onLogoChange,
  isSaving,
  hasChanges,
}: ProfileSettingsTabProps) {
  const handleInputChange = (
    field: keyof BusinessProfile,
    value: string | number,
  ) => {
    onChange({
      ...data,
      [field]: value,
    });
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      {/* Información general */}
      <section className="rounded-2xl border border-border bg-card p-4 shadow-xs sm:p-6">
        <div>
          <h2 className="text-sm font-bold tracking-tight text-foreground">
            Información del establecimiento
          </h2>

          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
            Datos públicos del negocio visibles en facturas e impresiones de
            comanda.
          </p>
        </div>

        <div className="mt-5">
          <RestaurantLogoUpload value={data.logoUrl} onChange={onLogoChange} />
        </div>

        <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2">
          {/* Nombre comercial */}
          <div className="min-w-0">
            <label className={labelClassName}>Nombre comercial</label>

            <div className="relative">
              <Building className={iconClassName} />

              <input
                type="text"
                value={data.name}
                onChange={(event) =>
                  handleInputChange("name", event.target.value)
                }
                className={`${inputClassName} pl-10`}
                placeholder="Ej. Food360 Grill & Bar"
              />
            </div>
          </div>

          {/* Razón social */}
          <div className="min-w-0">
            <label className={labelClassName}>Razón social / CIF / NIF</label>

            <input
              type="text"
              value={data.legalName}
              onChange={(event) =>
                handleInputChange("legalName", event.target.value)
              }
              className={inputClassName}
              placeholder="Ej. Food360 Hospitality S.L."
            />
          </div>

          {/* Teléfono */}
          <div className="min-w-0">
            <label className={labelClassName}>Teléfono de contacto</label>

            <div className="relative">
              <Phone className={iconClassName} />

              <input
                type="tel"
                value={data.phone}
                onChange={(event) =>
                  handleInputChange("phone", event.target.value)
                }
                className={`${inputClassName} pl-10`}
                placeholder="0424-1234567"
              />
            </div>
          </div>

          {/* Correo */}
          <div className="min-w-0">
            <label className={labelClassName}>Correo electrónico</label>

            <div className="relative">
              <Mail className={iconClassName} />

              <input
                type="email"
                value={data.email}
                onChange={(event) =>
                  handleInputChange("email", event.target.value)
                }
                className={`${inputClassName} pl-10`}
                placeholder="contacto@food360.com"
              />
            </div>
          </div>

          {/* Dirección */}
          <div className="min-w-0 sm:col-span-2">
            <label className={labelClassName}>Dirección física</label>

            <div className="relative">
              <MapPin className={iconClassName} />

              <input
                type="text"
                value={data.address}
                onChange={(event) =>
                  handleInputChange("address", event.target.value)
                }
                className={`${inputClassName} pl-10`}
                placeholder="Av. Principal 123, Ciudad, Estado"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Configuración regional */}
      <section className="rounded-2xl border border-border bg-card p-4 shadow-xs sm:p-6">
        <div>
          <h2 className="text-sm font-bold tracking-tight text-foreground">
            Configuración regional y fiscal
          </h2>

          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
            Parámetros para la gestión de precios, impuestos y zona horaria
            local.
          </p>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {/* Moneda */}
          <div className="min-w-0">
            <label className={labelClassName}>Moneda principal</label>

            <div className="relative">
              <DollarSign className={iconClassName} />

              <select
                value={data.currency}
                onChange={(event) =>
                  handleInputChange("currency", event.target.value)
                }
                className={`${inputClassName} cursor-pointer appearance-none pl-10 pr-3`}
              >
                <option value="EUR">EUR (€) - Euro</option>
                <option value="USD">USD ($) - Dólar estadounidense</option>
                <option value="VES">VES (Bs) - Bolívar venezolano</option>
                <option value="MXN">MXN ($) - Peso mexicano</option>
              </select>
            </div>
          </div>

          {/* Impuesto */}
          <div className="min-w-0">
            <label className={labelClassName}>Tasa de impuesto / IVA (%)</label>

            <div className="relative">
              <Percent className={iconClassName} />

              <input
                type="number"
                min="0"
                max="100"
                step="0.5"
                value={data.taxRate}
                onChange={(event) =>
                  handleInputChange(
                    "taxRate",
                    event.target.value === "" ? 0 : Number(event.target.value),
                  )
                }
                className={`${inputClassName} pl-10`}
              />
            </div>
          </div>

          {/* Zona horaria */}
          <div className="min-w-0">
            <label className={labelClassName}>Zona horaria</label>

            <div className="relative">
              <Globe className={iconClassName} />

              <select
                value={data.timezone}
                onChange={(event) =>
                  handleInputChange("timezone", event.target.value)
                }
                className={`${inputClassName} cursor-pointer appearance-none pl-10 pr-3`}
              >
                <option value="Europe/Madrid">Europe/Madrid</option>

                <option value="America/Caracas">America/Caracas</option>

                <option value="America/New_York">America/New_York</option>

                <option value="America/Mexico_City">America/Mexico_City</option>
              </select>
            </div>
          </div>
        </div>
      </section>

      {/* Guardar */}
      <div className="flex justify-end">
        <button
          type="button"
          onClick={onSave}
          disabled={isSaving || !hasChanges}
          className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-accent px-5 text-sm font-semibold text-accent-foreground shadow-xs transition-all hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
        >
          {isSaving ? (
            <LoaderCircle className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}

          {isSaving ? "Guardando..." : "Guardar perfil"}
        </button>
      </div>
    </div>
  );
}
