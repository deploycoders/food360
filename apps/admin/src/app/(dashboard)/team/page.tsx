"use client";

import React, { useState } from "react";
import { INITIAL_MEMBERS, TeamMember, TeamRole } from "@/types/team";
import { TeamHeader } from "@/components/dashboard/team/team-header";
import { TeamCards } from "@/components/dashboard/team/team-cards";
import { InviteMemberModal } from "@/components/dashboard/team/invite-member-modal";
import { TeamProfileDrawer } from "@/components/dashboard/team/team-profile-drawer";

export default function TeamPage() {
  const [members, setMembers] = useState<TeamMember[]>(INITIAL_MEMBERS);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);

  const handleToggleStatus = (id: string) => {
    setMembers((prev) =>
      prev.map((m) => (m.id === id ? { ...m, isActive: !m.isActive } : m)),
    );
  };

  const handleInviteMember = (data: {
    name: string;
    email: string;
    phone: string;
    role: TeamRole;
  }) => {
    const newMember: TeamMember = {
      id: Date.now().toString(),
      name: data.name,
      email: data.email,
      phone: data.phone || "N/A",
      role: data.role,
      createdAt: new Date().toISOString().split("T")[0],
      lastConnection: "Sin conexión",
      isActive: true,
      activityLogs: [
        {
          id: Date.now().toString() + "-log",
          action: "Registro de cuenta",
          module: "Acceso",
          timestamp: "Hoy",
          details: "Invitación enviada y perfil creado",
        },
      ],
    };
    setMembers((prev) => [...prev, newMember]);
  };

  return (
    <div className="space-y-6">
      <TeamHeader onOpenInviteModal={() => setIsInviteModalOpen(true)} />

      <TeamCards
        members={members}
        onToggleStatus={handleToggleStatus}
        onSelectMember={(member) => setSelectedMember(member)}
      />

      <InviteMemberModal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        onInvite={handleInviteMember}
      />

      <TeamProfileDrawer
        member={selectedMember}
        isOpen={!!selectedMember}
        onClose={() => setSelectedMember(null)}
      />
    </div>
  );
}
