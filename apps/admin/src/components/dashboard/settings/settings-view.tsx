"use client";

import React, { useState } from "react";
import { SettingsHeader } from "./settings-header";
import { SettingsTabs, SettingsTabType } from "./settings-tabs";
import { ProfileSettingsTab } from "./profile-settings-tab";
import { ScheduleSettingsTab } from "./schedule-settings-tab";
import { QRTablesSettingsTab } from "./qr-tables-settings-tab";
import { BusinessProfile, DaySchedule, QRSettings } from "@/types/settings";
import { showTimedToast } from "@/app/lib/swal";

// Datos iniciales de demostración
const initialProfile: BusinessProfile = {
  name: "Food360 Grill & Bar",
  legalName: "Food360 Hospitality S.L.",
  phone: "+34 912 345 678",
  email: "contacto@food360.com",
  address: "Calle Gran Vía 42, 28013 Madrid",
  currency: "EUR",
  taxRate: 10,
  timezone: "Europe/Madrid",
};

const initialSchedules: DaySchedule[] = [
  {
    day: "monday",
    label: "Lunes",
    isOpen: true,
    openTime: "12:00",
    closeTime: "23:00",
  },
  {
    day: "tuesday",
    label: "Martes",
    isOpen: true,
    openTime: "12:00",
    closeTime: "23:00",
  },
  {
    day: "wednesday",
    label: "Miércoles",
    isOpen: true,
    openTime: "12:00",
    closeTime: "23:00",
  },
  {
    day: "thursday",
    label: "Jueves",
    isOpen: true,
    openTime: "12:00",
    closeTime: "23:00",
  },
  {
    day: "friday",
    label: "Viernes",
    isOpen: true,
    openTime: "12:00",
    closeTime: "00:00",
  },
  {
    day: "saturday",
    label: "Sábado",
    isOpen: true,
    openTime: "12:00",
    closeTime: "00:00",
  },
  {
    day: "sunday",
    label: "Domingo",
    isOpen: false,
    openTime: "12:00",
    closeTime: "23:00",
  },
];

const initialQR: QRSettings = {
  tableCount: 24,
  allowSelfOrdering: true,
  requireTableNumber: true,
  serviceTaxPercentage: 10,
  wifiName: "Food360_Clientes",
  wifiPassword: "grillandbarwifi",
};

export function SettingsView() {
  const [activeTab, setActiveTab] = useState<SettingsTabType>("profile");
  const [isSaving, setIsSaving] = useState(false);

  const [profile, setProfile] = useState<BusinessProfile>(initialProfile);
  const [schedules, setSchedules] = useState<DaySchedule[]>(initialSchedules);
  const [qrSettings, setQrSettings] = useState<QRSettings>(initialQR);

  const handleSave = async () => {
    setIsSaving(true);

    // Simulación de guardado API
    await new Promise((resolve) => setTimeout(resolve, 800));

    setIsSaving(false);
    showTimedToast("Ajustes guardados correctamente", "success");
  };

  return (
    <div className="space-y-6 w-full">
      <SettingsHeader isSaving={isSaving} onSave={handleSave} />

      <SettingsTabs activeTab={activeTab} onTabChange={setActiveTab} />

      <div className="pt-2">
        {activeTab === "profile" && (
          <ProfileSettingsTab data={profile} onChange={setProfile} />
        )}

        {activeTab === "schedule" && (
          <ScheduleSettingsTab schedules={schedules} onChange={setSchedules} />
        )}

        {activeTab === "qr" && (
          <QRTablesSettingsTab data={qrSettings} onChange={setQrSettings} />
        )}
      </div>
    </div>
  );
}
