"use client";

import React from "react";
import type { DaySchedule } from "@/types/settings";
import { Clock, LoaderCircle, Save } from "lucide-react";

interface ScheduleSettingsTabProps {
  schedules: DaySchedule[];
  onChange: (schedules: DaySchedule[]) => void;
  onSave: () => void;
  isSaving: boolean;
  hasChanges: boolean;
}

export function ScheduleSettingsTab({
  schedules,
  onChange,
  onSave,
  isSaving,
  hasChanges,
}: ScheduleSettingsTabProps) {
  const toggleDay = (index: number) => {
    const updated = schedules.map((schedule, i) =>
      i === index ? { ...schedule, isOpen: !schedule.isOpen } : schedule,
    );

    onChange(updated);
  };

  const handleTimeChange = (
    index: number,
    field: "openTime" | "closeTime",
    value: string,
  ) => {
    const updated = schedules.map((schedule, i) => {
      if (i !== index) return schedule;
      const changed = { ...schedule, [field]: value };
      changed.closesNextDay = changed.closeTime <= changed.openTime;
      return changed;
    });

    onChange(updated);
  };

  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-xs animate-in fade-in duration-200">
      <div className="flex items-center justify-between border-b border-border/60 pb-4">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-accent/10 text-accent">
            <Clock className="h-4 w-4" />
          </div>

          <div>
            <h2 className="text-sm font-bold tracking-tight text-foreground">
              Horarios de Operación
            </h2>

            <p className="mt-0.5 text-xs text-muted-foreground">
              Define los días y rangos horarios en los que el restaurante acepta
              pedidos en línea.
            </p>
          </div>
        </div>
      </div>

      <div className="mt-4 divide-y divide-border/40">
        {schedules.map((schedule, idx) => {
          const closesNextDay =
            Boolean(schedule.openTime) &&
            Boolean(schedule.closeTime) &&
            schedule.closeTime <= schedule.openTime;

          return (
            <div
              key={schedule.day}
              className="flex flex-col justify-between gap-3 py-3.5 sm:flex-row sm:items-center"
            >
              {/* Día y activación */}
              <div className="flex w-40 items-center gap-3">
                <button
                  type="button"
                  role="switch"
                  aria-checked={schedule.isOpen}
                  aria-label={`Abrir o cerrar ${schedule.label}`}
                  onClick={() => toggleDay(idx)}
                  className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
                    schedule.isOpen ? "bg-accent" : "bg-muted"
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-card shadow-sm transition-transform duration-200 ${
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

              {/* Horario */}
              {schedule.isOpen ? (
                <div className="flex flex-col items-start gap-2 sm:items-end">
                  <div className="flex items-center gap-2">
                    <input
                      aria-label={`Hora de apertura del ${schedule.label}`}
                      type="time"
                      required
                      value={schedule.openTime}
                      onChange={(e) =>
                        handleTimeChange(idx, "openTime", e.target.value)
                      }
                      className="rounded-xl border border-border bg-muted/20 px-3 py-1.5 text-xs text-foreground transition-all focus:border-accent focus:bg-card focus:outline-none"
                    />

                    <span className="text-xs text-muted-foreground">a</span>

                    <input
                      aria-label={`Hora de cierre del ${schedule.label}`}
                      type="time"
                      required
                      value={schedule.closeTime}
                      onChange={(e) =>
                        handleTimeChange(idx, "closeTime", e.target.value)
                      }
                      className="rounded-xl border border-border bg-muted/20 px-3 py-1.5 text-xs text-foreground transition-all focus:border-accent focus:bg-card focus:outline-none"
                    />
                  </div>

                  {closesNextDay && (
                    <span className="text-[11px] font-medium text-accent">
                      Cierra al día siguiente
                    </span>
                  )}
                </div>
              ) : (
                <span className="text-xs font-medium italic text-muted-foreground/70">
                  Cerrado todo el día
                </span>
              )}
            </div>
          );
        })}
      </div>
      <div className="mt-5 flex justify-end border-t border-border/60 pt-4">
        <button type="button" onClick={onSave} disabled={isSaving || !hasChanges} className="inline-flex min-h-10 items-center gap-2 rounded-lg bg-accent px-4 text-xs font-semibold text-accent-foreground hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50">
          {isSaving ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Guardar horarios
        </button>
      </div>
    </div>
  );
}
