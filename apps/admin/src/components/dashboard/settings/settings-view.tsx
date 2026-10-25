"use client";

import { useEffect, useState } from "react";
import { LoaderCircle } from "lucide-react";
import { hasPermission } from "@food360/types";

import { showTimedToast } from "@/app/lib/swal";
import { useRestaurant } from "@/context/RestaurantContext";
import { configurationService } from "@/services/configuration.service";
import type { BusinessProfile, DaySchedule } from "@/types/settings";
import { ProfileSettingsTab } from "./profile-settings-tab";
import { PublicPageSettingsTab } from "./public-page-settings-tab";
import { ScheduleSettingsTab } from "./schedule-settings-tab";
import { SettingsHeader } from "./settings-header";
import { SettingsTabs, type SettingsTabType } from "./settings-tabs";

const EMPTY_PROFILE: BusinessProfile = {
  name: "",
  legalName: "",
  phone: "",
  email: "",
  address: "",
  currency: "",
  taxRate: 0,
  timezone: "",
};

export function SettingsView() {
  const { restaurantId, loading: restaurantLoading, role } = useRestaurant();
  const [activeTab, setActiveTab] = useState<SettingsTabType>("profile");
  const [profile, setProfile] = useState<BusinessProfile>(EMPTY_PROFILE);
  const [schedules, setSchedules] = useState<DaySchedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingSchedule, setSavingSchedule] = useState(false);
  const [savedProfile, setSavedProfile] = useState<BusinessProfile>(EMPTY_PROFILE);
  const [savedSchedules, setSavedSchedules] = useState<DaySchedule[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loadAttempt, setLoadAttempt] = useState(0);
  const [loadedRestaurantId, setLoadedRestaurantId] = useState<string | null>(null);

  const canUpdate = role !== null && hasPermission(role, "settings.update");

  useEffect(() => {
    if (restaurantLoading) return;
    let active = true;

    setLoading(true);
    setLoadError(null);
    setProfile(EMPTY_PROFILE);
    setSchedules([]);
    setLoadedRestaurantId(null);

    if (!restaurantId) {
      setLoadError("Selecciona un restaurante para cargar sus ajustes.");
      setLoading(false);
      return () => {
        active = false;
      };
    }

    void Promise.all([
      configurationService.getProfile(),
      configurationService.getSchedules(),
    ])
      .then(([nextProfile, nextSchedules]) => {
        if (!active) return;
        setProfile(nextProfile);
        setSchedules(nextSchedules);
        setSavedProfile(nextProfile);
        setSavedSchedules(nextSchedules);
        setLoadedRestaurantId(restaurantId);
      })
      .catch((error: unknown) => {
        if (!active) return;
        setLoadError(
          error instanceof Error
            ? error.message
            : "No se pudo cargar la configuración del restaurante.",
        );
        setLoadedRestaurantId(restaurantId);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [restaurantId, restaurantLoading, loadAttempt]);

  async function handleSaveProfile() {
    if (loading || savingProfile || loadError || !canUpdate) return;
    const submittedProfile = { ...profile };
    try {
      setSavingProfile(true);
      const updated = await configurationService.updateProfile(submittedProfile);
      setProfile(updated);
      setSavedProfile(updated);
      showTimedToast("Perfil guardado correctamente", "success");
    } catch (error: unknown) {
      showTimedToast(
        "No se pudo guardar el perfil",
        "error",
        error instanceof Error ? error.message : "Ocurrió un error inesperado.",
      );
    } finally {
      setSavingProfile(false);
    }
  }

  async function handleSaveSchedule() {
    if (loading || savingSchedule || loadError || !canUpdate) return;
    const submittedSchedules = schedules.map((day) => ({ ...day }));
    try {
      setSavingSchedule(true);
      const updated = await configurationService.updateSchedules(submittedSchedules);
      setSchedules(updated);
      setSavedSchedules(updated);
      showTimedToast("Horarios guardados correctamente", "success");
    } catch (error: unknown) {
      showTimedToast(
        "No se pudieron guardar los horarios",
        "error",
        error instanceof Error ? error.message : "Ocurrió un error inesperado.",
      );
    } finally {
      setSavingSchedule(false);
    }
  }

  return (
    <div className="mx-auto space-y-6">
      <SettingsHeader />

      <SettingsTabs activeTab={activeTab} onTabChange={setActiveTab} />

      {loading || restaurantLoading || loadedRestaurantId !== restaurantId ? (
        <div className="flex min-h-48 items-center justify-center gap-2 text-sm text-muted-foreground">
          <LoaderCircle className="h-5 w-5 animate-spin" aria-hidden="true" />
          Cargando configuración...
        </div>
      ) : loadError ? (
        <div className="rounded-xl border border-border bg-card p-5" role="alert">
          <p className="text-sm font-semibold text-foreground">
            No se pudo cargar la configuración.
          </p>
          <p className="mt-1 text-sm text-muted-foreground">{loadError}</p>
          <button
            type="button"
            onClick={() => setLoadAttempt((attempt) => attempt + 1)}
            className="mt-4 rounded-lg bg-accent px-4 py-2 text-xs font-semibold text-accent-foreground hover:opacity-90"
          >
            Reintentar
          </button>
        </div>
      ) : (
        <div className="pt-2">
          <div hidden={activeTab !== "profile"}>
            <fieldset disabled={!canUpdate || savingProfile} className="m-0 min-w-0 border-0 p-0">
              <ProfileSettingsTab
                data={profile}
                onChange={setProfile}
                onSave={() => void handleSaveProfile()}
                isSaving={savingProfile}
                hasChanges={JSON.stringify(profile) !== JSON.stringify(savedProfile)}
              />
            </fieldset>
          </div>
          <div hidden={activeTab !== "schedule"}>
            <fieldset disabled={!canUpdate || savingSchedule} className="m-0 min-w-0 border-0 p-0">
              <ScheduleSettingsTab
                schedules={schedules}
                onChange={setSchedules}
                onSave={() => void handleSaveSchedule()}
                isSaving={savingSchedule}
                hasChanges={JSON.stringify(schedules) !== JSON.stringify(savedSchedules)}
              />
            </fieldset>
          </div>
          <div hidden={activeTab !== "publicPage"}>
            <PublicPageSettingsTab key={restaurantId ?? "no-restaurant"} />
          </div>
          {!canUpdate && activeTab !== "publicPage" && (
            <p className="mt-4 text-xs text-muted-foreground">
              Tu rol puede consultar estos ajustes, pero no modificarlos.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
