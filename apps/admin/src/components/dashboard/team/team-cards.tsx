"use client";

import React, { useEffect, useState } from "react";
import { Mail, Phone, UserX, UserCheck, Clock, Eye } from "lucide-react";
import type { TeamMember, TeamRole } from "@/types/team";
import { TEAM_ROLE_LABELS } from "@/types/team";
import { confirmDeactivateMember, showTimedToast } from "@/app/lib/swal";
import { isUserOnline, formatLastSeen } from "@/lib/hooks/team-clock";

interface TeamCardsProps {
  members: TeamMember[];
  onToggleStatus: (id: string) => void | Promise<void>;
  onSelectMember: (member: TeamMember) => void;
}

const ROLE_BADGES: Record<TeamRole, string> = {
  owner: "bg-accent/10 text-accent border-accent/20",
  chef: "bg-warning/10 text-warning border-warning/20",
  admin: "bg-foreground/10 text-foreground border-border",
  waiter: "bg-muted text-muted-foreground border-border",
  cashier: "bg-success/10 text-success border-success/20",
};

export function TeamCards({
  members,
  onToggleStatus,
  onSelectMember,
}: TeamCardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
      {members.map((member) => (
        <MemberCard
          key={member.id}
          member={member}
          onToggleStatus={onToggleStatus}
          onSelectMember={onSelectMember}
        />
      ))}
    </div>
  );
}

function MemberCard({
  member,
  onToggleStatus,
  onSelectMember,
}: {
  member: TeamMember;
  onToggleStatus: (id: string) => void | Promise<void>;
  onSelectMember: (member: TeamMember) => void;
}) {
  const [imgError, setImgError] = useState(false);

  // Fuerza una actualización periódica para recalcular
  // "En línea" / "Última vez hace X..."
  const [, setNow] = useState(Date.now());

  useEffect(() => {
    const interval = setInterval(() => {
      setNow(Date.now());
    }, 30_000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  const online = isUserOnline(member.lastSeenAt);

  const handleDeactivate = async (e: React.MouseEvent) => {
    e.stopPropagation();

    if (!member.isActive) {
      await onToggleStatus(member.id);

      showTimedToast(`Acceso reactivado para ${member.name}`);

      return;
    }

    const confirmed = await confirmDeactivateMember(member.name);

    if (confirmed) {
      await onToggleStatus(member.id);

      showTimedToast(`Cuenta desactivada correctamente`, "info");
    }
  };

  return (
    <div
      onClick={() => onSelectMember(member)}
      className="group relative bg-card border border-border rounded-2xl p-5 shadow-sm hover:border-border/80 hover:shadow-md transition-all duration-200 cursor-pointer flex flex-col justify-between"
    >
      <div>
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="relative">
            {member.avatarUrl && !imgError ? (
              <img
                src={member.avatarUrl}
                alt={member.name}
                onError={() => setImgError(true)}
                className="w-14 h-14 rounded-2xl object-cover border border-border group-hover:scale-105 transition-transform"
              />
            ) : (
              <div className="w-14 h-14 rounded-2xl bg-accent/10 border border-accent/20 text-accent font-bold text-base flex items-center justify-center">
                {member.name.slice(0, 2).toUpperCase()}
              </div>
            )}

            <span
              className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-card ${
                online ? "bg-success" : "bg-muted-foreground"
              }`}
            />
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onSelectMember(member);
              }}
              className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              title="Ver detalle y bitácora"
            >
              <Eye className="w-4 h-4" />
            </button>

            {member.role !== "owner" && (
              <button
                type="button"
                onClick={handleDeactivate}
                className={`p-1.5 rounded-lg transition-colors ${
                  member.isActive
                    ? "text-muted-foreground hover:text-warning hover:bg-warning/10"
                    : "text-success hover:bg-success/10"
                }`}
                title={
                  member.isActive ? "Desactivar acceso" : "Reactivar acceso"
                }
              >
                {member.isActive ? (
                  <UserX className="w-4 h-4" />
                ) : (
                  <UserCheck className="w-4 h-4" />
                )}
              </button>
            )}
          </div>
        </div>

        <h3 className="font-bold text-base text-foreground tracking-tight leading-snug">
          {member.name}
        </h3>

        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-[11px] font-semibold border mt-1.5 ${
            ROLE_BADGES[member.role]
          }`}
        >
          {TEAM_ROLE_LABELS[member.role]}
        </span>

        <div className="space-y-2 py-3 my-3 border-y border-border/60 text-xs">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Mail className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">{member.email}</span>
          </div>

          <div className="flex items-center gap-2 text-muted-foreground">
            <Phone className="w-3.5 h-3.5 shrink-0" />
            <span>{member.phone || "Teléfono no registrado"}</span>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between text-[11px]">
        <div className="flex items-center gap-1.5 text-muted-foreground">
          <Clock className="w-3.5 h-3.5" />

          <span className={online ? "text-success font-semibold" : undefined}>
            {formatLastSeen(member.lastSeenAt)}
          </span>
        </div>

        <span
          className={`font-semibold ${
            member.isActive ? "text-success" : "text-muted-foreground"
          }`}
        >
          {member.isActive ? "Activo" : "Inactivo"}
        </span>
      </div>
    </div>
  );
}
