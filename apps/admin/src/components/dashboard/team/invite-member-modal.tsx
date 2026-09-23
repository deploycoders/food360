"use client";

import React, { useState } from "react";
import { X } from "lucide-react";
import { TeamRole, TEAM_ROLE_LABELS } from "@/types/team";

interface InviteMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInvite: (memberData: {
    name: string;
    email: string;
    phone: string;
    role: TeamRole;
  }) => void;
}

export function InviteMemberModal({
  isOpen,
  onClose,
  onInvite,
}: InviteMemberModalProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState<TeamRole>("waiter");

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !email) return;

    onInvite({
      name,
      email,
      phone,
      role,
    });

    setName("");
    setEmail("");
    setPhone("");
    setRole("waiter");

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-overlay backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-card border border-border w-full max-w-md rounded-2xl shadow-xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 className="text-base font-bold text-foreground">
            Invitar Nuevo Miembro
          </h2>

          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-foreground mb-1.5">
              Nombre Completo
            </label>

            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej. Carlos Mendoza"
              className="w-full px-3.5 py-2.5 rounded-xl border border-input bg-background text-foreground text-xs focus:outline-none focus:ring-2 focus:ring-ring transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-foreground mb-1.5">
              Correo Electrónico
            </label>

            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="carlos@food360.com"
              className="w-full px-3.5 py-2.5 rounded-xl border border-input bg-background text-foreground text-xs focus:outline-none focus:ring-2 focus:ring-ring transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-foreground mb-1.5">
              Teléfono
            </label>

            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+34 600 000 000"
              className="w-full px-3.5 py-2.5 rounded-xl border border-input bg-background text-foreground text-xs focus:outline-none focus:ring-2 focus:ring-ring transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-foreground mb-1.5">
              Rol Asignado
            </label>

            <select
              value={role}
              onChange={(e) => setRole(e.target.value as TeamRole)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-input bg-background text-foreground text-xs focus:outline-none focus:ring-2 focus:ring-ring transition-all"
            >
              <option value="chef">{TEAM_ROLE_LABELS.chef}</option>

              <option value="admin">{TEAM_ROLE_LABELS.admin}</option>

              <option value="waiter">{TEAM_ROLE_LABELS.waiter}</option>

              <option value="cashier">{TEAM_ROLE_LABELS.cashier}</option>
            </select>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            >
              Cancelar
            </button>

            <button
              type="submit"
              className="px-4 py-2.5 rounded-xl bg-accent text-accent-foreground text-xs font-semibold hover:opacity-90 transition-all shadow-sm"
            >
              Enviar Invitación
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
