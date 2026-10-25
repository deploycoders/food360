import { apiFetch } from "@/lib/api-client";

import type { UserProfile, UpdateUserProfileInput } from "@/types/profile";

export const PROFILE_UPDATED_EVENT = "food360:profile-updated";

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

export async function getMyProfile(): Promise<UserProfile> {
  const response = await apiFetch<ApiResponse<UserProfile>>("/profile/me");

  return unwrapResponse(response);
}

export async function updateMyProfile(
  input: UpdateUserProfileInput,
): Promise<UserProfile> {
  const response = await apiFetch<ApiResponse<UserProfile>>("/profile/me", {
    method: "PATCH",
    body: JSON.stringify(input),
  });

  return unwrapResponse(response);
}

export async function uploadMyAvatar(file: File): Promise<UserProfile> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await apiFetch<ApiResponse<UserProfile>>(
    "/profile/me/avatar",
    {
      method: "PUT",
      body: formData,
    },
  );

  return unwrapResponse(response);
}

export function announceProfileUpdated(profile: UserProfile): void {
  window.dispatchEvent(
    new CustomEvent<UserProfile>(PROFILE_UPDATED_EVENT, { detail: profile }),
  );
}
