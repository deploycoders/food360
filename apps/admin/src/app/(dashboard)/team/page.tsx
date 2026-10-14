"use client";

import React, { useEffect, useState } from "react";

import type { TeamMember } from "@/types/team";
import type { AppRole, Permission } from "@food360/types";
import { hasPermission } from "@food360/types";

import { TeamHeader } from "@/components/dashboard/team/team-header";
import { TeamCards } from "@/components/dashboard/team/team-cards";
import { TeamCardsSkeleton } from "@/components/dashboard/team/team-cards-skeleton";
import { InviteMemberModal } from "@/components/dashboard/team/invite-member-modal";
import { TeamProfileDrawer } from "@/components/dashboard/team/team-profile-drawer";

import { useRestaurant } from "@/context/RestaurantContext";
import {
  getTeamMembers,
  updateTeamMemberStatus,
  updateTeamMemberRole,
} from "@/services/team.service";
import { formatLastConnection } from "@/lib/hooks/team-clock";

export default function TeamPage() {
  const { restaurantId, loading: restaurantLoading, role } = useRestaurant();

  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);

  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);

  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);

  const userRole = role as AppRole;

  const canViewTeam = role ? hasPermission(userRole, "team.view") : false;

  const canInvite = role ? hasPermission(userRole, "team.invite") : false;

  const canUpdateRole = role
    ? hasPermission(userRole, "team.update_role")
    : false;

  const canRemove = role ? hasPermission(userRole, "team.remove") : false;

  const canManageStatus = role === "owner";
  const canInviteAdmin = role === "owner";

  useEffect(() => {
    if (restaurantLoading) return;

    if (!restaurantId || !canViewTeam) {
      setMembers([]);
      setLoading(false);
      return;
    }

    const currentRestaurantId = restaurantId;

    async function loadTeam() {
      try {
        setLoading(true);

        const data = await getTeamMembers(currentRestaurantId);

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
        console.error("Error loading team:", error);
        setMembers([]);
      } finally {
        setLoading(false);
      }
    }

    loadTeam();
  }, [restaurantId, restaurantLoading, canViewTeam]);

  const handleToggleStatus = async (id: string) => {
    if (!canManageStatus) return;

    const member = members.find((item) => item.id === id);

    if (!member) return;

    // El owner no debe poder ser desactivado desde la UI.
    if (member.role === "owner") return;

    const nextIsActive = !member.isActive;

    try {
      await updateTeamMemberStatus(id, nextIsActive);

      setMembers((prev) =>
        prev.map((item) =>
          item.id === id
            ? {
                ...item,
                isActive: nextIsActive,
              }
            : item,
        ),
      );
    } catch (error) {
      console.error("Error updating team member status:", error);

      throw error;
    }
  };

  const handleUpdateRole = async (
    id: string,
    newRole: Exclude<AppRole, "owner">,
  ) => {
    if (!canUpdateRole) return;

    const member = members.find((item) => item.id === id);

    if (!member) return;

    // El owner no puede ser modificado
    if (member.role === "owner") return;

    try {
      await updateTeamMemberRole(id, newRole);

      setMembers((prev) =>
        prev.map((item) =>
          item.id === id
            ? {
                ...item,
                role: newRole,
              }
            : item,
        ),
      );

      setSelectedMember((current) =>
        current && current.id === id
          ? {
              ...current,
              role: newRole,
            }
          : current,
      );
    } catch (error) {
      console.error("Error updating team member role:", error);
      throw error;
    }
  };

  if (!canViewTeam && !restaurantLoading) {
    return null;
  }

  return (
    <div className="space-y-6">
      <TeamHeader
        onOpenInviteModal={() => setIsInviteModalOpen(true)}
        canInvite={canInvite}
      />

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

      <InviteMemberModal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        canInviteAdmin={canInviteAdmin}
        onInvite={() => {
          setIsInviteModalOpen(false);
        }}
      />

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
