"use client";

import React, { useState } from "react";
import {
  X,
  KeyRound,
  Mail,
  Phone,
  ShieldCheck,
  Activity,
  ChevronLeft,
  ChevronRight,
  Clock,
} from "lucide-react";
import { TeamMember } from "@/types/team";
import { showTimedToast } from "@/app/lib/swal";

interface TeamProfileDrawerProps {
  member: TeamMember | null;
  isOpen: boolean;
  onClose: () => void;
}

export function TeamProfileDrawer({
  member,
  isOpen,
  onClose,
}: TeamProfileDrawerProps) {
  const [activeTab, setActiveTab] = useState<"info" | "activity">("info");
  const [currentPage, setCurrentPage] = useState(1);
  const logsPerPage = 4;

  if (!isOpen || !member) return null;

  const totalPages = Math.ceil(member.activityLogs.length / logsPerPage) || 1;
  const currentLogs = member.activityLogs.slice(
    (currentPage - 1) * logsPerPage,
    currentPage * logsPerPage,
  );

  const handleSendResetLink = () => {
    showTimedToast(`Enlace enviado a ${member.email}`);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-overlay backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-card border-l border-border h-full flex flex-col shadow-2xl overflow-hidden animate-in slide-in-from-right duration-300">
        {/* Banner de Perfil + Botón Cerrar */}
        <div className="relative h-32 bg-muted">
          {member.coverUrl ? (
            <img
              src={member.coverUrl}
              alt="Portada"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-linear-to-r from-accent/20 to-muted" />
          )}
          <button
            type="button"
            onClick={onClose}
            className="absolute top-3 right-3 p-2 rounded-xl bg-card/80 text-foreground hover:bg-card border border-border backdrop-blur-md transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Avatar + Info Principal */}
        <div className="px-6 relative pb-4 border-b border-border">
          <div className="flex justify-between items-end -mt-10 mb-3">
            <div className="relative">
              {member.avatarUrl ? (
                <img
                  src={member.avatarUrl}
                  alt={member.name}
                  className="w-20 h-20 rounded-2xl object-cover border-4 border-card shadow-md"
                />
              ) : (
                <div className="w-20 h-20 rounded-2xl bg-accent/10 border-4 border-card text-accent font-bold text-xl flex items-center justify-center shadow-md">
                  {member.name.slice(0, 2).toUpperCase()}
                </div>
              )}
              <span
                className={`absolute bottom-1 right-1 w-4 h-4 rounded-full border-2 border-card ${
                  member.isActive ? "bg-success" : "bg-muted-foreground"
                }`}
              />
            </div>

            <button
              type="button"
              onClick={handleSendResetLink}
              className="px-3 py-2 rounded-xl bg-muted hover:bg-muted/80 text-foreground text-xs font-semibold flex items-center gap-2 border border-border transition-all"
            >
              <KeyRound className="w-3.5 h-3.5 text-accent" />
              <span>Enviar Reset Pass</span>
            </button>
          </div>

          <h2 className="text-lg font-bold text-foreground">{member.name}</h2>
          <p className="text-xs text-muted-foreground font-medium">
            {member.role}
          </p>

          {/* Navegación por Tabs */}
          <div className="flex gap-4 mt-6 border-b border-border text-xs font-semibold">
            <button
              type="button"
              onClick={() => setActiveTab("info")}
              className={`pb-2 transition-colors relative ${
                activeTab === "info"
                  ? "text-accent border-b-2 border-accent"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Detalles de Cuenta
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("activity")}
              className={`pb-2 transition-colors relative flex items-center gap-1.5 ${
                activeTab === "activity"
                  ? "text-accent border-b-2 border-accent"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>Bitácora ({member.activityLogs.length})</span>
            </button>
          </div>
        </div>

        {/* Contenido Dinámico */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {activeTab === "info" ? (
            <div className="space-y-4 text-xs">
              <div className="p-4 rounded-xl bg-muted/40 border border-border/80 space-y-3">
                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase font-bold">
                      Email
                    </p>
                    <p className="font-semibold text-foreground">
                      {member.email}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase font-bold">
                      Teléfono
                    </p>
                    <p className="font-semibold text-foreground">
                      {member.phone}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <ShieldCheck className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase font-bold">
                      Fecha de Alta
                    </p>
                    <p className="font-semibold text-foreground">
                      {member.createdAt}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {currentLogs.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-8">
                  No hay registros en la bitácora aún.
                </p>
              ) : (
                currentLogs.map((log) => (
                  <div
                    key={log.id}
                    className="p-3.5 rounded-xl bg-muted/30 border border-border/70 space-y-1"
                  >
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span className="text-foreground">{log.action}</span>
                      <span className="px-2 py-0.5 rounded-md text-[10px] bg-accent/10 text-accent font-bold">
                        {log.module}
                      </span>
                    </div>
                    <p className="text-[11px] text-muted-foreground">
                      {log.details}
                    </p>
                    <div className="flex items-center gap-1 text-[10px] text-muted-foreground pt-1">
                      <Clock className="w-3 h-3" />
                      <span>{log.timestamp}</span>
                    </div>
                  </div>
                ))
              )}

              {/* Paginación de Bitácora */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between pt-4 text-xs">
                  <button
                    type="button"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((p) => p - 1)}
                    className="p-1.5 rounded-lg border border-border disabled:opacity-40"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="text-muted-foreground text-[11px]">
                    Página {currentPage} de {totalPages}
                  </span>
                  <button
                    type="button"
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage((p) => p + 1)}
                    className="p-1.5 rounded-lg border border-border disabled:opacity-40"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
