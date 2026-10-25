// ─────────────────────────────────────────────
// Roles del equipo
// ─────────────────────────────────────────────

export type TeamRole = "owner" | "admin" | "chef" | "waiter" | "cashier";

export const TEAM_ROLE_LABELS: Record<TeamRole, string> = {
  owner: "Propietario",
  admin: "Gerente",
  chef: "Jefe de Cocina",
  waiter: "Mesero / Sala",
  cashier: "Caja / POS",
};

export type InviteableTeamRole = Exclude<TeamRole, "owner">;

// ─────────────────────────────────────────────
// Actividad del equipo
// ─────────────────────────────────────────────

export interface ActivityLog {
  id: string;
  action: string;
  module: "POS" | "KDS" | "Inventario" | "Acceso";
  timestamp: string;
  details: string;
}

// ─────────────────────────────────────────────
// Miembro del equipo (frontend)
// ─────────────────────────────────────────────

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

// ─────────────────────────────────────────────
// Miembro del equipo (respuesta de la API)
// ─────────────────────────────────────────────

export interface TeamMemberRow {
  id: string;
  restaurant_id: string;
  user_id: string;
  role: TeamRole;
  is_active: boolean;
  last_seen_at: string | null;
  created_at: string;
  updated_at: string;
  profile: {
    id: string;
    email: string;
    full_name: string | null;
    phone: string | null;
    avatar_url: string | null;
  } | null;
}

// ─────────────────────────────────────────────
// Crear una invitación
// ─────────────────────────────────────────────

export interface InviteTeamMemberInput {
  name: string;
  email: string;
  phone: string;
  role: InviteableTeamRole;
}

// ─────────────────────────────────────────────
// Respuesta al crear una invitación
// ─────────────────────────────────────────────

export interface TeamInvitationResult {
  invitationId: string | null;
  memberId: string | null;
  email: string;
  name: string;
  role: InviteableTeamRole;
  accountAlreadyExists: boolean;
  inviteUrl: string | null;
  expiresAt: string | null;
  status: "pending" | "accepted";
}

// ─────────────────────────────────────────────
// Invitación persistida en Supabase
// ─────────────────────────────────────────────

export type TeamInvitationStatus =
  | "pending"
  | "accepted"
  | "revoked"
  | "expired";

export interface TeamInvitation {
  id: string;
  restaurant_id: string;
  invited_by?: string;
  email: string;
  full_name: string;
  phone: string | null;
  role: InviteableTeamRole;
  status: TeamInvitationStatus;
  expires_at: string;
  accepted_at: string | null;
  accepted_user_id: string | null;
  created_at: string;
  updated_at: string;
}

// ─────────────────────────────────────────────
// Renovar el enlace de invitación
// ─────────────────────────────────────────────

export interface RenewTeamInvitationResult {
  invitationId: string;
  inviteUrl: string;
  expiresAt: string;
}

// ─────────────────────────────────────────────
// Aceptar una invitación
// ─────────────────────────────────────────────

export interface AcceptTeamInvitationInput {
  token: string;
  password: string;
}

export interface AcceptTeamInvitationResult {
  email: string;
  name: string;
  restaurantId: string;
  role: InviteableTeamRole;
}

export interface ValidateTeamInvitationResult {
  email: string;
  name: string;
  role: InviteableTeamRole;
  expiresAt: string;
}

// ─────────────────────────────────────────────
// Actualizaciones de miembros
// ─────────────────────────────────────────────

export interface UpdatedTeamMemberStatus {
  id: string;
  is_active: boolean;
}

export interface UpdatedTeamMemberRole {
  id: string;
  role: InviteableTeamRole;
}
