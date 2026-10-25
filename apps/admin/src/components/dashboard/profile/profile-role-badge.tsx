import { ShieldCheck } from "lucide-react";

interface ProfileRoleBadgeProps {
  role: string | null | undefined;
  variant?: "banner" | "surface";
}

const ROLE_LABELS: Record<string, string> = {
  owner: "Propietario",
  admin: "Gerente",
  chef: "Jefe de cocina",
  waiter: "Mesero / Sala",
  cashier: "Caja / POS",
  mesero: "Mesero / Sala",
  cajero: "Caja / POS",
};

export function ProfileRoleBadge({
  role,
  variant = "surface",
}: ProfileRoleBadgeProps) {
  const normalizedRole = role?.trim().toLowerCase();
  const label = normalizedRole ? ROLE_LABELS[normalizedRole] : null;

  // No inventar un cargo si la API no ha devuelto uno.
  if (!label) return null;

  const appearance =
    variant === "banner"
      ? "border-white/25 bg-black/20 text-white backdrop-blur-sm"
      : "border-accent/20 bg-accent/10 text-accent";

  return (
    <span
      title={`Cargo: ${label}`}
      className={`inline-flex w-fit items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold ${appearance}`}
    >
      <ShieldCheck className="h-3.5 w-3.5 shrink-0" />
      {label}
    </span>
  );
}
