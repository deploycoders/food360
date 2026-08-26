"use client";

import React from "react";
import { DaySchedule } from "@/types/settings";
import { Clock } from "lucide-react";

interface ScheduleSettingsTabProps {
  schedules: DaySchedule[];
  onChange: (schedules: DaySchedule[]) => void;
}

export function ScheduleSettingsTab({
  schedules,
  onChange,
}: ScheduleSettingsTabProps) {
  const toggleDay = (index: number) => {
    const updated = [...schedules];
    updated[index].isOpen = !updated[index].isOpen;
    onChange(updated);
  };

  const handleTimeChange = (
    index: number,
    field: "openTime" | "closeTime",
    value: string,
  ) => {
    const updated = [...schedules];
    updated[index][field] = value;
    onChange(updated);
  };

  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-xs animate-in fade-in duration-200">
      <div className="flex items-center justify-between pb-4 border-b border-border/60">
        <div>
          <h2 className="text-sm font-bold text-foreground tracking-tight">
            Horarios de Operación
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Define los días y rangos horarios en los que el restaurante acepta
            pedidos en línea.
          </p>
        </div>
      </div>

      <div className="mt-4 divide-y divide-border/40">
        {schedules.map((schedule, idx) => (
          <div
            key={schedule.day}
            className="flex flex-col sm:flex-row sm:items-center justify-between py-3.5 gap-3"
          >
            {/* Día + Switch Toggle */}
            <div className="flex items-center gap-3 w-40">
              <button
                type="button"
                onClick={() => toggleDay(idx)}
                className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  schedule.isOpen ? "bg-accent" : "bg-muted"
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-card shadow-sm ring-0 transition duration-200 ease-in-out ${
                    schedule.isOpen ? "translate-x-4" : "translate-x-0"
                  }`}
                />
              </button>
              <span
                className={`text-xs font-semibold ${
                  schedule.isOpen
                    ? "text-foreground"
                    : "text-muted-foreground line-through"
                }`}
              >
                {schedule.label}
              </span>
            </div>

            {/* Inputs de Horario */}
            {schedule.isOpen ? (
              <div className="flex items-center gap-2">
                <div className="relative">
                  <input
                    type="time"
                    value={schedule.openTime}
                    onChange={(e) =>
                      handleTimeChange(idx, "openTime", e.target.value)
                    }
                    className="rounded-xl border border-border bg-muted/20 px-3 py-1.5 text-xs text-foreground focus:border-accent focus:bg-card focus:outline-none transition-all"
                  />
                </div>
                <span className="text-xs text-muted-foreground">a</span>
                <div className="relative">
                  <input
                    type="time"
                    value={schedule.closeTime}
                    onChange={(e) =>
                      handleTimeChange(idx, "closeTime", e.target.value)
                    }
                    className="rounded-xl border border-border bg-muted/20 px-3 py-1.5 text-xs text-foreground focus:border-accent focus:bg-card focus:outline-none transition-all"
                  />
                </div>
              </div>
            ) : (
              <span className="text-xs font-medium text-muted-foreground/70 italic">
                Cerrado todo el día
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
