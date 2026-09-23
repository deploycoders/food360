export function formatLastConnection(date: string | null): string {
  if (!date) {
    return "Sin conexión registrada";
  }

  const connectionDate = new Date(date);

  return new Intl.DateTimeFormat("es", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(connectionDate);
}

export function isUserOnline(lastSeenAt: string | null): boolean {
  if (!lastSeenAt) {
    return false;
  }

  const lastSeen = new Date(lastSeenAt).getTime();
  const now = Date.now();

  const difference = now - lastSeen;

  // Consideramos online si hubo actividad durante el último minuto.
  return difference >= 0 && difference <= 60_000;
}

export function formatLastSeen(date: string | null): string {
  if (!date) {
    return "Sin conexión registrada";
  }

  const lastSeen = new Date(date);
  const now = new Date();

  const differenceMs = now.getTime() - lastSeen.getTime();
  const differenceSeconds = Math.floor(differenceMs / 1000);

  if (differenceSeconds < 60) {
    return "En línea";
  }

  const differenceMinutes = Math.floor(differenceSeconds / 60);

  if (differenceMinutes < 60) {
    return `Última vez hace ${differenceMinutes} ${
      differenceMinutes === 1 ? "minuto" : "minutos"
    }`;
  }

  const differenceHours = Math.floor(differenceMinutes / 60);

  if (differenceHours < 24) {
    return `Última vez hace ${differenceHours} ${
      differenceHours === 1 ? "hora" : "horas"
    }`;
  }

  const differenceDays = Math.floor(differenceHours / 24);

  if (differenceDays < 7) {
    return `Última vez hace ${differenceDays} ${
      differenceDays === 1 ? "día" : "días"
    }`;
  }

  return new Intl.DateTimeFormat("es", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(lastSeen);
}
