export type TeamRole =
  | "Propietario"
  | "Jefe de Cocina"
  | "Gerente"
  | "Mesero / Sala"
  | "Caja / POS";

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
  phone: string;
  role: TeamRole;
  createdAt: string;
  lastConnection: string;
  isActive: boolean;
  isKdsActive?: boolean;
  avatarUrl?: string;
  coverUrl?: string;
  activityLogs: ActivityLog[];
}

export const INITIAL_MEMBERS: TeamMember[] = [
  {
    id: "1",
    name: "Alejandro Morales",
    email: "alejandro@food360.com",
    phone: "+34 611 223 344",
    role: "Propietario",
    createdAt: "2026-01-10",
    lastConnection: "Hace 5 minutos",
    isActive: true,
    avatarUrl:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80",
    coverUrl:
      "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80",
    activityLogs: [
      {
        id: "l1",
        action: "Apertura de Turno",
        module: "Acceso",
        timestamp: "Hoy, 08:30 AM",
        details: "Inició sesión en Terminal Principal",
      },
      {
        id: "l2",
        action: "Ajuste de Menú",
        module: "Inventario",
        timestamp: "Ayer, 16:45 PM",
        details: "Actualizó precio del platillo 'Hamburguesa Gourmet'",
      },
      {
        id: "l3",
        action: "Cierre de Caja",
        module: "POS",
        timestamp: "2026-08-24 23:00",
        details: "Arqueo de caja finalizado con balance positivo ($1,420.00)",
      },
    ],
  },
  {
    id: "2",
    name: "Chef Mateo Rossi",
    email: "mateo.cocina@food360.com",
    phone: "+34 622 334 455",
    role: "Jefe de Cocina",
    createdAt: "2026-02-01",
    lastConnection: "En turno activo (KDS)",
    isActive: true,
    isKdsActive: true,
    avatarUrl:
      "https://images.unsplash.com/photo-1577219491135-ce391730fb2c?auto=format&fit=crop&w=300&q=80",
    activityLogs: [
      {
        id: "l4",
        action: "Comanda Despachada",
        module: "KDS",
        timestamp: "Hoy, 14:10 PM",
        details: "Comanda #104 completada en 8 min",
      },
      {
        id: "l5",
        action: "Comanda Despachada",
        module: "KDS",
        timestamp: "Hoy, 13:52 PM",
        details: "Comanda #101 completada en 12 min",
      },
    ],
  },
];
