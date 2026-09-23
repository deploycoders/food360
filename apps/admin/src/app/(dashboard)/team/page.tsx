"use client";

import React, { useEffect, useState } from "react";

import type { TeamMember } from "@/types/team";

import { TeamHeader } from "@/components/dashboard/team/team-header";
import { TeamCards } from "@/components/dashboard/team/team-cards";
import { TeamCardsSkeleton } from "@/components/dashboard/team/team-cards-skeleton";
import { InviteMemberModal } from "@/components/dashboard/team/invite-member-modal";
import { TeamProfileDrawer } from "@/components/dashboard/team/team-profile-drawer";

import { useRestaurant } from "@/context/RestaurantContext";
import {
  getTeamMembers,
  updateTeamMemberStatus,
} from "@/services/team.service";
import { formatLastConnection } from "@/lib/hooks/team-clock";

export default function TeamPage() {
  const { restaurantId, loading: restaurantLoading } = useRestaurant();

  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);

  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);

  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);

  useEffect(() => {
    if (restaurantLoading) return;

    if (!restaurantId) {
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
  }, [restaurantId, restaurantLoading]);

  const handleToggleStatus = async (id: string) => {
    const member = members.find((item) => item.id === id);

    if (!member) return;

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

  return (
    <div className="space-y-6">
      <TeamHeader onOpenInviteModal={() => setIsInviteModalOpen(true)} />

      {restaurantLoading || loading ? (
        <TeamCardsSkeleton />
      ) : (
        <TeamCards
          members={members}
          onToggleStatus={handleToggleStatus}
          onSelectMember={(member) => setSelectedMember(member)}
        />
      )}

      <InviteMemberModal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        onInvite={() => {
          setIsInviteModalOpen(false);
        }}
      />

      <TeamProfileDrawer
        member={selectedMember}
        isOpen={!!selectedMember}
        onClose={() => setSelectedMember(null)}
      />
    </div>
  );
}
