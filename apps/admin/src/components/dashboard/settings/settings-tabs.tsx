"use client";

import React from "react";
import { Building2, Clock, QrCode, Sparkles, LucideIcon } from "lucide-react";

export type SettingsTabType = "profile" | "qr" | "ai" | "schedule";

interface SettingsTabsProps {
  activeTab: SettingsTabType;
  onTabChange: (tab: SettingsTabType) => void;
}

interface TabItem {
  id: SettingsTabType;
  label: string;
  icon: LucideIcon;
}

export function SettingsTabs({ activeTab, onTabChange }: SettingsTabsProps) {
  const tabs: TabItem[] = [
    { id: "profile", label: "Perfil & Local", icon: Building2 },
    { id: "qr", label: "Códigos QR & Mesas", icon: QrCode },
    { id: "ai", label: "IA & Integraciones", icon: Sparkles },
    { id: "schedule", label: "Horarios & Operación", icon: Clock },
  ];

  return (
    <div className="flex items-center gap-1 border-b border-border/60 pb-px">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;

        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`flex items-center gap-2 border-b-2 px-4 py-3 text-xs font-semibold transition-all cursor-pointer ${
              isActive
                ? "border-accent text-accent font-bold"
                : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
            }`}
          >
            <Icon
              className={`h-4 w-4 ${isActive ? "text-accent" : "text-muted-foreground"}`}
            />
            <span>{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
}
