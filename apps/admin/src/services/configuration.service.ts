import { apiFetch } from "@/lib/api-client";
import type { BusinessProfile, DaySchedule } from "@/types/settings";

interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
}

interface ApiRestaurantConfiguration {
  id: string;
  name: string;
  slug?: string;
  legal_name: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  currency: string | null;
  timezone: string | null;
  tax_rate: number | string | null;
}

interface ApiRestaurantSchedule {
  id?: string;
  restaurant_id?: string;
  day_of_week: number;
  is_open: boolean;
  open_time: string | null;
  close_time: string | null;
  closes_next_day: boolean;
}

const DAYS: {
  day: DaySchedule["day"];
  label: string;
  dayOfWeek: number;
}[] = [
  { day: "monday", label: "Lunes", dayOfWeek: 1 },
  { day: "tuesday", label: "Martes", dayOfWeek: 2 },
  { day: "wednesday", label: "Miércoles", dayOfWeek: 3 },
  { day: "thursday", label: "Jueves", dayOfWeek: 4 },
  { day: "friday", label: "Viernes", dayOfWeek: 5 },
  { day: "saturday", label: "Sábado", dayOfWeek: 6 },
  { day: "sunday", label: "Domingo", dayOfWeek: 0 },
];

function mapProfile(data: ApiRestaurantConfiguration): BusinessProfile {
  return {
    name: data.name ?? "",
    legalName: data.legal_name ?? "",
    phone: data.phone ?? "",
    email: data.email ?? "",
    address: data.address ?? "",
    currency: data.currency ?? "",
    timezone: data.timezone ?? "",
    taxRate: Number(data.tax_rate ?? 0),
  };
}

function mapSchedules(rows: ApiRestaurantSchedule[]): DaySchedule[] {
  return DAYS.map((day) => {
    const row = rows.find((item) => item.day_of_week === day.dayOfWeek);

    return {
      day: day.day,
      label: day.label,
      isOpen: row?.is_open ?? false,
      openTime: row?.open_time?.slice(0, 5) ?? "09:00",
      closeTime: row?.close_time?.slice(0, 5) ?? "18:00",
    };
  });
}

export const configurationService = {
  async getProfile(): Promise<BusinessProfile> {
    const response =
      await apiFetch<ApiResponse<ApiRestaurantConfiguration>>("/configuration");

    return mapProfile(response.data);
  },

  async updateProfile(profile: BusinessProfile): Promise<BusinessProfile> {
    const payload: Record<string, string | number | null> = {
      name: profile.name.trim(),
      legal_name: profile.legalName.trim() || null,
      phone: profile.phone.trim() || null,
      email: profile.email.trim() || null,
      address: profile.address.trim() || null,
      tax_rate: profile.taxRate,
    };

    // No enviamos una moneda o zona horaria vacía.
    // Así no sobrescribimos accidentalmente una configuración existente.
    if (profile.currency.trim()) {
      payload.currency = profile.currency;
    }

    if (profile.timezone.trim()) {
      payload.timezone = profile.timezone;
    }

    const response = await apiFetch<ApiResponse<ApiRestaurantConfiguration>>(
      "/configuration",
      {
        method: "PATCH",
        body: JSON.stringify(payload),
      },
    );

    return mapProfile(response.data);
  },

  async getSchedules(): Promise<DaySchedule[]> {
    const response = await apiFetch<ApiResponse<ApiRestaurantSchedule[]>>(
      "/configuration/schedule",
    );

    return mapSchedules(response.data ?? []);
  },

  async updateSchedules(schedules: DaySchedule[]): Promise<void> {
    const days: ApiRestaurantSchedule[] = schedules.map((schedule) => {
      const isOpen = schedule.isOpen;

      return {
        day_of_week:
          DAYS.find((day) => day.day === schedule.day)?.dayOfWeek ?? 0,
        is_open: isOpen,
        open_time: isOpen ? schedule.openTime : null,
        close_time: isOpen ? schedule.closeTime : null,
        closes_next_day: isOpen && schedule.closeTime <= schedule.openTime,
      };
    });

    await apiFetch<ApiResponse<ApiRestaurantSchedule[]>>(
      "/configuration/schedule",
      {
        method: "PUT",
        body: JSON.stringify({ days }),
      },
    );
  },
};
