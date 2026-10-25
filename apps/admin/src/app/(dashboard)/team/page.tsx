"use client";

import React, { useEffect, useState } from "react";
import { Mail, Users } from "lucide-react";

import type { TeamMember } from "@/types/team";
import type { AppRole } from "@food360/types";
import { hasPermission } from "@food360/types";

import { TeamHeader } from "@/components/dashboard/team/team-header";
import { TeamCards } from "@/components/dashboard/team/team-cards";
import { TeamCardsSkeleton } from "@/components/dashboard/team/team-cards-skeleton";
import { InviteMemberModal } from "@/components/dashboard/team/invite-member-modal";
import { TeamProfileDrawer } from "@/components/dashboard/team/team-profile-drawer";

import { useRestaurant } from "@/context/RestaurantContext";

import {
  getTeamMembers,
  inviteTeamMember,
  updateTeamMemberStatus,
  updateTeamMemberRole,
} from "@/services/team.service";

import { formatLastConnection } from "@/lib/hooks/team-clock";
import { TeamInvitations } from "@/components/dashboard/team/team-invitations";

type TeamView = "members" | "invitations";

export default function TeamPage() {
  const { restaurantId, loading: restaurantLoading, role } = useRestaurant();

  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);

  const [activeView, setActiveView] = useState<TeamView>("members");

  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);

  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);

  const [teamRefreshVersion, setTeamRefreshVersion] = useState(0);
  const [invitationRefreshVersion, setInvitationRefreshVersion] = useState(0);

  const userRole = role as AppRole;

  const canViewTeam = role ? hasPermission(userRole, "team.view") : false;

  const canInvite = role ? hasPermission(userRole, "team.invite") : false;

  const canUpdateRole = role
    ? hasPermission(userRole, "team.update_role")
    : false;

  const canRemove = role ? hasPermission(userRole, "team.remove") : false;

  const canManageStatus = role === "owner";
  const canInviteAdmin = role === "owner";

  // ─────────────────────────────────────────────
  // Cargar miembros
  // ─────────────────────────────────────────────

  useEffect(() => {
    if (restaurantLoading) return;

    if (!restaurantId || !canViewTeam) {
      setMembers([]);
      setLoading(false);
      return;
    }

    const currentRestaurantId = restaurantId;
    let cancelled = false;

    async function loadTeam() {
      try {
        setLoading(true);

        const data = await getTeamMembers(currentRestaurantId);

        if (cancelled) return;

        const mappedMembers: TeamMember[] = data.map((member) => {
          const profile = member.profile;

          return {
            id: member.id,
            name: profile?.full_name || profile?.email || "Sin nombre",
            email: profile?.email || "Sin correo",
            phone: profile?.phone ?? null,
            role: member.role,
            createdAt: member.created_at,
            lastConnection: formatLastConnection(member.last_seen_at),
            lastSeenAt: member.last_seen_at,
            isActive: member.is_active,
            avatarUrl: profile?.avatar_url ?? null,
            activityLogs: [],
          };
        });

        setMembers(mappedMembers);
      } catch (error) {
        if (cancelled) return;

        console.error("Error al cargar los miembros:", error);
        setMembers([]);
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadTeam();

    return () => {
      cancelled = true;
    };
  }, [restaurantId, restaurantLoading, canViewTeam, teamRefreshVersion]);

  // ─────────────────────────────────────────────
  // Activar / desactivar miembro
  // ─────────────────────────────────────────────

  const handleToggleStatus = async (id: string) => {
    if (!canManageStatus) return;

    const member = members.find((item) => item.id === id);

    if (!member || member.role === "owner") return;

    const nextIsActive = !member.isActive;

    try {
      await updateTeamMemberStatus(id, nextIsActive);

      setMembers((previous) =>
        previous.map((item) =>
          item.id === id ? { ...item, isActive: nextIsActive } : item,
        ),
      );
    } catch (error) {
      console.error("Error al actualizar el estado:", error);
      throw error;
    }
  };

  // ─────────────────────────────────────────────
  // Modificar rol
  // ─────────────────────────────────────────────

  const handleUpdateRole = async (
    id: string,
    newRole: Exclude<AppRole, "owner">,
  ) => {
    if (!canUpdateRole) return;

    const member = members.find((item) => item.id === id);

    if (!member || member.role === "owner") return;

    try {
      await updateTeamMemberRole(id, newRole);

      setMembers((previous) =>
        previous.map((item) =>
          item.id === id ? { ...item, role: newRole } : item,
        ),
      );

      setSelectedMember((current) =>
        current && current.id === id ? { ...current, role: newRole } : current,
      );
    } catch (error) {
      console.error("Error al actualizar el rol:", error);
      throw error;
    }
  };

  // ─────────────────────────────────────────────
  // Crear invitación
  // ─────────────────────────────────────────────

  const handleInvite = async (
    memberData: Parameters<typeof inviteTeamMember>[0],
  ) => {
    const result = await inviteTeamMember(memberData);

    // Refrescar ambas vistas una vez confirmada la operación.
    setTeamRefreshVersion((version) => version + 1);
    setInvitationRefreshVersion((version) => version + 1);

    // El modal necesita el resultado para mostrar el enlace.
    return result;
  };

  // ─────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────

  if (!canViewTeam && !restaurantLoading) {
    return null;
  }

  return (
    <div className="space-y-6">
      <TeamHeader
        onOpenInviteModal={() => setIsInviteModalOpen(true)}
        canInvite={canInvite}
      />

      {/* Selector de vistas */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-sm font-semibold text-foreground">
            Gestión del equipo
          </h2>

          <p className="mt-1 text-xs text-muted-foreground">
            Administra a los miembros y controla las invitaciones de acceso.
          </p>
        </div>

        <div
          role="tablist"
          aria-label="Vistas del equipo"
          className="inline-flex w-full items-center gap-1 rounded-xl border border-border bg-muted/40 p-1 sm:w-auto"
        >
          <button
            type="button"
            role="tab"
            aria-selected={activeView === "members"}
            onClick={() => setActiveView("members")}
            className={`inline-flex h-9 flex-1 items-center justify-center gap-2 rounded-lg px-4 text-xs font-semibold transition-colors sm:flex-none ${
              activeView === "members"
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Users className="h-4 w-4" />
            Miembros
            <span className="rounded-md bg-muted px-1.5 py-0.5 text-[10px] tabular-nums">
              {members.length}
            </span>
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={activeView === "invitations"}
            onClick={() => setActiveView("invitations")}
            className={`inline-flex h-9 flex-1 items-center justify-center gap-2 rounded-lg px-4 text-xs font-semibold transition-colors sm:flex-none ${
              activeView === "invitations"
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Mail className="h-4 w-4" />
            Invitaciones
          </button>
        </div>
      </div>

      {/* Vista de miembros */}
      {activeView === "members" && (
        <section role="tabpanel" aria-label="Miembros del equipo">
          {restaurantLoading || loading ? (
            <TeamCardsSkeleton />
          ) : (
            <TeamCards
              members={members}
              onToggleStatus={handleToggleStatus}
              onSelectMember={(member) => setSelectedMember(member)}
              canManageStatus={canManageStatus}
            />
          )}
        </section>
      )}

      {/* Vista de invitaciones */}
      {activeView === "invitations" && (
        <section role="tabpanel" aria-label="Invitaciones del equipo">
          {restaurantLoading ? (
            <TeamCardsSkeleton />
          ) : (
            <TeamInvitations
              canManageInvitations={canInvite}
              refreshKey={invitationRefreshVersion}
            />
          )}
        </section>
      )}

      {/* Modal compartido por ambas vistas */}
      <InviteMemberModal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        canInviteAdmin={canInviteAdmin}
        onInvite={handleInvite}
      />

      {/* Perfil del miembro seleccionado */}
      <TeamProfileDrawer
        member={selectedMember}
        isOpen={!!selectedMember}
        onClose={() => setSelectedMember(null)}
        onToggleStatus={handleToggleStatus}
        onUpdateRole={handleUpdateRole}
        canManageStatus={canManageStatus}
        canUpdateRole={canUpdateRole}
        canRemove={canRemove}
      />
    </div>
  );
}
