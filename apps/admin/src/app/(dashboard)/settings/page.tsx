"use client";

import React, { useEffect, useState } from "react";

import { showTimedToast } from "@/app/lib/swal";
import { ProfileSettingsTab } from "@/components/dashboard/settings/profile-settings-tab";
import { ScheduleSettingsTab } from "@/components/dashboard/settings/schedule-settings-tab";
import {
  SettingsTabs,
  type SettingsTabType,
} from "@/components/dashboard/settings/settings-tabs";

import { configurationService } from "@/services/configuration.service";
import type { BusinessProfile, DaySchedule } from "@/types/settings";

import { LoaderCircle, Save } from "lucide-react";

const emptyProfile: BusinessProfile = {
  name: "",
  legalName: "",
  phone: "",
  email: "",
  address: "",
  currency: "",
  taxRate: 0,
  timezone: "",
};

export default function ConfigurationPage() {
  const [activeTab, setActiveTab] = useState<SettingsTabType>("profile");

  const [profile, setProfile] = useState<BusinessProfile>(emptyProfile);

  const [schedules, setSchedules] = useState<DaySchedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadConfiguration() {
      try {
        setLoading(true);
        setLoadError(null);

        const [profileData, scheduleData] = await Promise.all([
          configurationService.getProfile(),
          configurationService.getSchedules(),
        ]);

        if (cancelled) return;

        setProfile(profileData);
        setSchedules(scheduleData);
      } catch (error: unknown) {
        if (cancelled) return;

        const message =
          error instanceof Error
            ? error.message
            : "No se pudo cargar la configuración.";

        setLoadError(message);

        showTimedToast("Error al cargar la configuración", "error", message);
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadConfiguration();

    return () => {
      cancelled = true;
    };
  }, []);

  async function handleSave() {
    if (loading || saving || loadError) return;

    try {
      setSaving(true);

      if (activeTab === "profile") {
        const updatedProfile =
          await configurationService.updateProfile(profile);

        setProfile(updatedProfile);
      } else {
        await configurationService.updateSchedules(schedules);

        // Volvemos a leer los horarios persistidos para mantener
        // la interfaz sincronizada con la respuesta de la API.
        const updatedSchedules = await configurationService.getSchedules();

        setSchedules(updatedSchedules);
      }

      showTimedToast("Ajustes guardados correctamente", "success");
    } catch (error: unknown) {
      console.error("Error guardando configuración:", error);

      showTimedToast(
        "No se pudieron guardar los ajustes",
        "error",
        error instanceof Error ? error.message : "Ocurrió un error inesperado.",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-foreground">
            Configuración del Restaurante
          </h1>

          <p className="mt-0.5 text-xs text-muted-foreground">
            Administra los datos generales y los horarios de tu local.
          </p>
        </div>

        <button
          type="button"
          onClick={handleSave}
          disabled={loading || saving || Boolean(loadError)}
          className="inline-flex items-center justify-center cursor-pointer gap-2 px-4 py-2.5 rounded-lg bg-accent text-accent-foreground font-semibold text-xs hover:opacity-90 transition-all duration-200 shadow-sm active:scale-95 self-start sm:self-auto"
        >
          {saving ? (
            <LoaderCircle className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}

          {saving
            ? "Guardando..."
            : activeTab === "profile"
              ? "Guardar perfil"
              : "Guardar horarios"}
        </button>
      </div>

      <SettingsTabs activeTab={activeTab} onTabChange={setActiveTab} />

      <div className="pt-2">
        {loading ? (
          <div className="flex min-h-48 items-center justify-center gap-2 text-sm text-muted-foreground">
            <LoaderCircle className="h-5 w-5 animate-spin" />
            Cargando configuración...
          </div>
        ) : loadError ? (
          <div className="rounded-2xl border border-border bg-card p-6">
            <p className="text-sm font-semibold text-foreground">
              No se pudo cargar la configuración.
            </p>

            <p className="mt-1 text-xs text-muted-foreground">{loadError}</p>

            <button
              type="button"
              onClick={() => window.location.reload()}
              className="mt-4 rounded-xl bg-accent px-4 py-2 text-xs font-semibold text-accent-foreground hover:opacity-90"
            >
              Reintentar
            </button>
          </div>
        ) : (
          <>
            {activeTab === "profile" && (
              <ProfileSettingsTab data={profile} onChange={setProfile} />
            )}

            {activeTab === "schedule" && (
              <ScheduleSettingsTab
                schedules={schedules}
                onChange={setSchedules}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}
