"use client";

import React from "react";
import { Building2, Clock, Globe, type LucideIcon } from "lucide-react";

export type SettingsTabType = "profile" | "schedule" | "publicPage";

interface SettingsTabsProps {
  activeTab: SettingsTabType;
  onTabChange: (tab: SettingsTabType) => void;
}

interface TabItem {
  id: SettingsTabType;
  label: string;
  icon: LucideIcon;
}

const tabs: TabItem[] = [
  { id: "profile", label: "Perfil & Local", icon: Building2 },
  { id: "schedule", label: "Horarios & Operación", icon: Clock },
  { id: "publicPage", label: "Página pública y código QR", icon: Globe },
];

export function SettingsTabs({ activeTab, onTabChange }: SettingsTabsProps) {
  return (
    <nav
      aria-label="Secciones de configuración"
      className="flex items-center gap-1 overflow-x-auto border-b border-border/60 pb-px"
    >
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;

        return (
          <button
            key={tab.id}
            type="button"
            aria-current={isActive ? "page" : undefined}
            onClick={() => onTabChange(tab.id)}
            className={`flex shrink-0 items-center gap-2 border-b-2 px-4 py-3 text-xs font-semibold transition-all cursor-pointer ${
              isActive
                ? "border-accent text-accent font-bold"
                : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
            }`}
          >
            <Icon
              className={`h-4 w-4 ${
                isActive ? "text-accent" : "text-muted-foreground"
              }`}
            />
            <span>{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
