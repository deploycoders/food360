export interface RestaurantSchedule {
  day_of_week: number;
  is_open: boolean;
  open_time: string | null;
  close_time: string | null;
  closes_next_day: boolean;
}

interface LocalDateTimeParts {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  dayOfWeek: number;
}

function parseLocalDateTime(value: string): LocalDateTimeParts | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/.exec(value);

  if (!match) return null;

  const [, year, month, day, hour, minute] = match;

  const parts = {
    year: Number(year),
    month: Number(month),
    day: Number(day),
    hour: Number(hour),
    minute: Number(minute),
  };

  if (
    parts.year < 2000 ||
    parts.month < 1 ||
    parts.month > 12 ||
    parts.hour < 0 ||
    parts.hour > 23 ||
    parts.minute < 0 ||
    parts.minute > 59
  ) {
    return null;
  }

  const daysInMonth = new Date(
    Date.UTC(parts.year, parts.month, 0),
  ).getUTCDate();

  if (parts.day < 1 || parts.day > daysInMonth) {
    return null;
  }

  return {
    ...parts,
    dayOfWeek: new Date(
      Date.UTC(parts.year, parts.month - 1, parts.day),
    ).getUTCDay(),
  };
}

/**
 * Obtiene la fecha/hora actual expresada en la zona horaria
 * del restaurante, sin convertirla a la zona del navegador.
 */
export function getLocalDateTimeInTimezone(timeZone: string): string | null {
  try {
    const parts = new Intl.DateTimeFormat("en-CA", {
      timeZone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
    }).formatToParts(new Date());

    const values = Object.fromEntries(
      parts.map((part) => [part.type, part.value]),
    );

    const year = values.year;
    const month = values.month;
    const day = values.day;
    const hour = values.hour;
    const minute = values.minute;

    if (!year || !month || !day || !hour || !minute) {
      return null;
    }

    return `${year}-${month}-${day}T${hour}:${minute}`;
  } catch {
    return null;
  }
}

function getMinutesFromTime(value: string | null): number | null {
  if (!value) return null;

  const match = /^(\d{2}):(\d{2})(?::\d{2})?$/.exec(value);

  if (!match) return null;

  const hour = Number(match[1]);
  const minute = Number(match[2]);

  if (hour < 0 || hour > 23 || minute < 0 || minute > 59) {
    return null;
  }

  return hour * 60 + minute;
}

/**
 * Devuelve null cuando el pedido está dentro del horario permitido.
 * Devuelve un mensaje cuando la selección no es válida.
 */
export function getScheduledTimeValidationError(
  value: string,
  timeZone: string | null,
  schedules: RestaurantSchedule[],
): string | null {
  if (!value) {
    return "Selecciona la fecha y hora de llegada al restaurante.";
  }

  if (!timeZone) {
    return "No se pudo determinar la zona horaria del restaurante.";
  }

  const currentLocalDateTime = getLocalDateTimeInTimezone(timeZone);

  if (!currentLocalDateTime) {
    return "No se pudo consultar la hora local del restaurante.";
  }

  if (value <= currentLocalDateTime) {
    return "La fecha y hora de llegada deben estar en el futuro.";
  }

  if (schedules.length === 0) {
    return "El restaurante no tiene horarios públicos configurados.";
  }

  const selected = parseLocalDateTime(value);

  if (!selected) {
    return "La fecha y hora seleccionadas no son válidas.";
  }

  const selectedMinutes = selected.hour * 60 + selected.minute;

  const sameDaySchedule = schedules.find(
    (schedule) => schedule.day_of_week === selected.dayOfWeek,
  );

  if (sameDaySchedule?.is_open) {
    const openMinutes = getMinutesFromTime(sameDaySchedule.open_time);
    const closeMinutes = getMinutesFromTime(sameDaySchedule.close_time);

    if (openMinutes !== null && closeMinutes !== null) {
      if (sameDaySchedule.closes_next_day && selectedMinutes >= openMinutes) {
        return null;
      }

      if (
        !sameDaySchedule.closes_next_day &&
        selectedMinutes >= openMinutes &&
        selectedMinutes < closeMinutes
      ) {
        return null;
      }
    }
  }

  // Comprobar la parte posterior a medianoche de una jornada
  // que comenzó el día anterior.
  const previousDay = (selected.dayOfWeek + 6) % 7;

  const previousDaySchedule = schedules.find(
    (schedule) => schedule.day_of_week === previousDay,
  );

  if (previousDaySchedule?.is_open && previousDaySchedule.closes_next_day) {
    const closeMinutes = getMinutesFromTime(previousDaySchedule.close_time);

    if (closeMinutes !== null && selectedMinutes < closeMinutes) {
      return null;
    }
  }

  return "El restaurante no está abierto en el día y la hora seleccionados.";
}

export function formatLocalDateTimeForDisplay(value: string): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/.exec(value);

  if (!match) return value;

  const [, year, month, day, hour, minute] = match;

  return `${day}/${month}/${year} · ${hour}:${minute}`;
}
