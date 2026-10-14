export type TeamRole = "owner" | "admin" | "chef" | "waiter" | "cashier";

export const TEAM_ROLE_LABELS: Record<TeamRole, string> = {
  owner: "Propietario",
  admin: "Gerente",
  chef: "Jefe de Cocina",
  waiter: "Mesero / Sala",
  cashier: "Caja / POS",
};

export interface ActivityLog {
  id: string;
  action: string;
  module: "POS" | "KDS" | "Inventario" | "Acceso";
  timestamp: string;
  details: string;
}

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role: TeamRole;
  createdAt: string;
  lastConnection: string | null;
  lastSeenAt: string | null;
  isActive: boolean;
  isKdsActive?: boolean;
  avatarUrl?: string | null;
  coverUrl?: string | null;
  activityLogs: ActivityLog[];
}
