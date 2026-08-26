"use client";

import React, { useState } from "react";
import { TeamMember } from "@/types/team";
import {
  X,
  Mail,
  Phone,
  Calendar,
  Clock,
  ShieldCheck,
  Activity,
  UserX,
  UserCheck,
  Monitor,
} from "lucide-react";

interface TeamProfileDrawerProps {
  member: TeamMember | null;
  isOpen: boolean;
  onClose: () => void;
  onToggleStatus?: (id: string) => void;
}

export function TeamProfileDrawer({
  member,
  isOpen,
  onClose,
  onToggleStatus,
}: TeamProfileDrawerProps) {
  const [activeTab, setActiveTab] = useState<"details" | "logs">("details");

  if (!isOpen || !member) return null;

  const hasCover = Boolean(member.coverUrl);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center p-0 sm:p-4">
      {/* Backdrop con desfoque sutil */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity animate-in fade-in"
        onClick={onClose}
      />

      {/* Sheet / Modal minimalista */}
      <div
        className="relative z-10 flex max-h-[90vh] w-full flex-col overflow-hidden rounded-t-3xl sm:rounded-2xl border border-border bg-card shadow-xl transition-all animate-in slide-in-from-bottom-4 sm:max-h-[85vh] sm:w-125 sm:zoom-in-95"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Banner de Portada (Si existe) o Header de Acciones (Si no existe) */}
        {hasCover ? (
          <div className="relative h-28 w-full bg-muted overflow-hidden">
            <img
              src={member.coverUrl}
              alt="Cover"
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-linear-to-b from-black/50 via-transparent to-transparent" />

            {/* Acciones flotantes sobre la portada */}
            <div className="absolute top-3 left-0 right-0 flex items-center justify-between px-4 z-10">
              <button
                onClick={() => onToggleStatus && onToggleStatus(member.id)}
                className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium backdrop-blur-md transition-all cursor-pointer ${
                  member.isActive
                    ? "bg-black/40 text-red-300 hover:bg-black/60"
                    : "bg-black/40 text-emerald-300 hover:bg-black/60"
                }`}
              >
                {member.isActive ? (
                  <>
                    <UserX className="h-3.5 w-3.5" />
                    <span>Desactivar</span>
                  </>
                ) : (
                  <>
                    <UserCheck className="h-3.5 w-3.5" />
                    <span>Activar</span>
                  </>
                )}
              </button>

              <button
                onClick={onClose}
                className="rounded-lg p-1.5 bg-black/40 text-white hover:bg-black/60 backdrop-blur-md transition-colors cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between border-b border-border/50 px-5 py-3.5 bg-muted/20">
            <button
              onClick={() => onToggleStatus && onToggleStatus(member.id)}
              className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium transition-colors cursor-pointer ${
                member.isActive
                  ? "text-destructive hover:bg-destructive/10"
                  : "text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10"
              }`}
            >
              {member.isActive ? (
                <>
                  <UserX className="h-3.5 w-3.5" />
                  <span>Desactivar cuenta</span>
                </>
              ) : (
                <>
                  <UserCheck className="h-3.5 w-3.5" />
                  <span>Activar cuenta</span>
                </>
              )}
            </button>

            <button
              onClick={onClose}
              className="rounded-lg p-1 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Perfil Header */}
        <div
          className={`flex flex-col items-center px-6 pb-4 ${hasCover ? "-mt-10" : "pt-6"}`}
        >
          <div className="relative">
            <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-full border-2 border-card bg-muted shadow-md">
              {member.avatarUrl ? (
                <img
                  src={member.avatarUrl}
                  alt={member.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="text-xl font-bold text-foreground">
                  {member.name.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            <span
              className={`absolute bottom-0.5 right-0.5 h-3.5 w-3.5 rounded-full border-2 border-card ${
                member.isActive ? "bg-emerald-500" : "bg-muted-foreground/40"
              }`}
            />
          </div>

          <h3 className="mt-3 text-base font-bold text-foreground tracking-tight">
            {member.name}
          </h3>

          <div className="mt-1.5 flex items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
              <ShieldCheck className="h-3 w-3 text-accent" />
              {member.role}
            </span>
            <span
              className={`text-xs font-medium ${
                member.isActive
                  ? "text-emerald-600 dark:text-emerald-400"
                  : "text-muted-foreground"
              }`}
            >
              • {member.isActive ? "Activo" : "Inactivo"}
            </span>
          </div>
        </div>

        {/* Tabs estilo Línea Minimalista */}
        <div className="flex border-b border-border/60 px-6">
          <button
            onClick={() => setActiveTab("details")}
            className={`flex items-center gap-2 border-b-2 py-2.5 text-xs font-semibold transition-colors cursor-pointer ${
              activeTab === "details"
                ? "border-accent text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            Detalles
          </button>
          <button
            onClick={() => setActiveTab("logs")}
            className={`ml-6 flex items-center gap-2 border-b-2 py-2.5 text-xs font-semibold transition-colors cursor-pointer ${
              activeTab === "logs"
                ? "border-accent text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            Bitácora
            {member.activityLogs && member.activityLogs.length > 0 && (
              <span className="rounded-full bg-muted px-1.5 py-0.2 text-[10px] font-bold text-muted-foreground">
                {member.activityLogs.length}
              </span>
            )}
          </button>
        </div>

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto px-6 py-2">
          {activeTab === "details" ? (
            <div className="divide-y divide-border/40 text-xs">
              <div className="flex items-center justify-between py-3">
                <span className="flex items-center gap-2.5 text-muted-foreground font-medium">
                  <Mail className="h-4 w-4 text-muted-foreground/70" />
                  Correo electrónico
                </span>
                <span className="font-medium text-foreground truncate max-w-55">
                  {member.email}
                </span>
              </div>

              <div className="flex items-center justify-between py-3">
                <span className="flex items-center gap-2.5 text-muted-foreground font-medium">
                  <Phone className="h-4 w-4 text-muted-foreground/70" />
                  Teléfono
                </span>
                <span className="font-medium text-foreground">
                  {member.phone || "No registrado"}
                </span>
              </div>

              <div className="flex items-center justify-between py-3">
                <span className="flex items-center gap-2.5 text-muted-foreground font-medium">
                  <Calendar className="h-4 w-4 text-muted-foreground/70" />
                  Fecha de alta
                </span>
                <span className="font-medium text-foreground">
                  {member.createdAt}
                </span>
              </div>

              <div className="flex items-center justify-between py-3">
                <span className="flex items-center gap-2.5 text-muted-foreground font-medium">
                  <Clock className="h-4 w-4 text-muted-foreground/70" />
                  Última actividad
                </span>
                <span className="font-medium text-foreground">
                  {member.lastConnection}
                </span>
              </div>

              {member.isKdsActive !== undefined && (
                <div className="flex items-center justify-between py-3">
                  <span className="flex items-center gap-2.5 text-muted-foreground font-medium">
                    <Monitor className="h-4 w-4 text-muted-foreground/70" />
                    Acceso KDS
                  </span>
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-medium ${
                      member.isKdsActive
                        ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${
                        member.isKdsActive
                          ? "bg-emerald-500"
                          : "bg-muted-foreground"
                      }`}
                    />
                    {member.isKdsActive ? "Habilitado" : "Deshabilitado"}
                  </span>
                </div>
              )}
            </div>
          ) : (
            <div className="py-3">
              {!member.activityLogs || member.activityLogs.length === 0 ? (
                <p className="py-6 text-center text-xs text-muted-foreground">
                  Sin registros de actividad
                </p>
              ) : (
                <div className="relative border-l border-border/60 ml-3 space-y-4 py-1">
                  {member.activityLogs.map((log) => (
                    <div key={log.id} className="relative pl-5">
                      <span className="absolute -left-1.25 top-1.5 h-2 w-2 rounded-full border border-card bg-accent" />
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-foreground">
                          {log.action}
                        </span>
                        <span className="text-[10px] text-muted-foreground">
                          {log.timestamp}
                        </span>
                      </div>
                      <p className="mt-0.5 text-xs text-muted-foreground leading-relaxed">
                        {log.details}
                      </p>
                      <span className="mt-1 inline-block text-[9px] font-semibold tracking-wide uppercase text-muted-foreground">
                        {log.module}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
