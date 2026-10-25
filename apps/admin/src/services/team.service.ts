import { apiFetch, apiPublicFetch } from "@/lib/api-client";

import type {
  InviteTeamMemberInput,
  TeamInvitationResult,
  TeamMemberRow,
  TeamInvitation,
  TeamInvitationStatus,
  RenewTeamInvitationResult,
  UpdatedTeamMemberRole,
  UpdatedTeamMemberStatus,
  AcceptTeamInvitationInput,
  AcceptTeamInvitationResult,
  ValidateTeamInvitationResult,
} from "@/types/team";

interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
}

function unwrapResponse<T>(response: ApiResponse<T>): T {
  if (!response.success) {
    throw new Error(response.error || "No se pudo completar la operación.");
  }

  return response.data;
}

/**
 * Se conserva restaurantId por compatibilidad con TeamPage.
 * El backend determina el restaurante mediante verifyAuth.
 */
export async function getTeamMembers(
  restaurantId: string,
): Promise<TeamMemberRow[]> {
  // Keep the existing call signature; the API resolves the restaurant from
  // the authenticated user's membership.
  void restaurantId;
  const response = await apiFetch<ApiResponse<TeamMemberRow[]>>("/team");

  return unwrapResponse(response);
}

export async function updateTeamMemberStatus(
  membershipId: string,
  isActive: boolean,
): Promise<UpdatedTeamMemberStatus> {
  const response = await apiFetch<ApiResponse<UpdatedTeamMemberStatus>>(
    `/team/${membershipId}/status`,
    {
      method: "PATCH",
      body: JSON.stringify({ isActive }),
    },
  );

  return unwrapResponse(response);
}

export async function updateTeamMemberRole(
  membershipId: string,
  role: UpdatedTeamMemberRole["role"],
): Promise<UpdatedTeamMemberRole> {
  const response = await apiFetch<ApiResponse<UpdatedTeamMemberRole>>(
    `/team/${membershipId}/role`,
    {
      method: "PATCH",
      body: JSON.stringify({ role }),
    },
  );

  return unwrapResponse(response);
}

export async function removeTeamMember(membershipId: string): Promise<void> {
  const response = await apiFetch<ApiResponse<{ id: string }>>(
    `/team/${membershipId}`,
    {
      method: "DELETE",
    },
  );

  unwrapResponse(response);
}

export async function inviteTeamMember(
  memberData: InviteTeamMemberInput,
): Promise<TeamInvitationResult> {
  const response = await apiFetch<ApiResponse<TeamInvitationResult>>(
    "/team/invitations",
    {
      method: "POST",
      body: JSON.stringify(memberData),
    },
  );

  return unwrapResponse(response);
}

export async function getTeamInvitations(): Promise<TeamInvitation[]> {
  const response =
    await apiFetch<ApiResponse<TeamInvitation[]>>("/team/invitations");

  return unwrapResponse(response);
}

export async function renewTeamInvitationLink(
  invitationId: string,
): Promise<RenewTeamInvitationResult> {
  const response = await apiFetch<ApiResponse<RenewTeamInvitationResult>>(
    `/team/invitations/${invitationId}/link`,
    {
      method: "POST",
    },
  );

  return unwrapResponse(response);
}

export async function revokeTeamInvitation(
  invitationId: string,
): Promise<{ id: string; status: TeamInvitationStatus }> {
  const response = await apiFetch<
    ApiResponse<{ id: string; status: TeamInvitationStatus }>
  >(`/team/invitations/${invitationId}/revoke`, {
    method: "POST",
  });

  return unwrapResponse(response);
}

export async function validateTeamInvitation(
  token: string,
): Promise<ValidateTeamInvitationResult> {
  const response = await apiPublicFetch<
    ApiResponse<ValidateTeamInvitationResult>
  >("/team/invitations/accept/validate", {
    method: "POST",
    body: JSON.stringify({ token }),
  });

  return unwrapResponse(response);
}

export async function acceptTeamInvitation(
  input: AcceptTeamInvitationInput,
): Promise<AcceptTeamInvitationResult> {
  const response = await apiPublicFetch<ApiResponse<AcceptTeamInvitationResult>>(
    "/team/invitations/accept",
    {
      method: "POST",
      body: JSON.stringify(input),
    },
  );

  return unwrapResponse(response);
}
