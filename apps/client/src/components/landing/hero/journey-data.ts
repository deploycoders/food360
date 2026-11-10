import {
  QrCode,
  BookOpen,
  ShoppingBag,
  Utensils,
  Inbox,
  ClipboardList,
  CheckCircle2,
  ChefHat,
  PackageCheck,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type JourneyStepId =
  | "access"
  | "explore"
  | "order"
  | "receive"
  | "identify"
  | "accept"
  | "prepare"
  | "deliver"
  | "enjoy";

export interface JourneyStep {
  id: JourneyStepId;
  number: string;
  label: string;
  title: string;
  description: string;
  icon: LucideIcon;
}

export interface JourneyTrack {
  id: "customer" | "restaurant";
  eyebrow: string;
  title: string;
  steps: JourneyStep[];
}

export const journeySequence: JourneyStepId[] = [
  "access",
  "explore",
  "order",
  "receive",
  "identify",
  "accept",
  "prepare",
  "deliver",
  "enjoy",
];

export const journeyTracks: JourneyTrack[] = [
  {
    id: "customer",
    eyebrow: "EXPERIENCIA DEL COMENSAL",
    title: "Desde su teléfono",
    steps: [
      {
        id: "access",
        number: "01",
        label: "Accede",
        title: "La carta está a su alcance",
        description:
          "El comensal abre el menú digital desde el código QR del restaurante o su enlace público, sin instalar una aplicación.",
        icon: QrCode,
      },
      {
        id: "explore",
        number: "02",
        label: "Explora",
        title: "Descubre la carta",
        description:
          "Consulta categorías, conoce los productos, revisa sus descripciones y encuentra lo que desea pedir.",
        icon: BookOpen,
      },
      {
        id: "order",
        number: "03",
        label: "Ordena",
        title: "Realiza su pedido",
        description:
          "Selecciona productos, ajusta cantidades y envía su pedido mediante una de las modalidades disponibles.",
        icon: ShoppingBag,
      },
      {
        id: "enjoy",
        number: "04",
        label: "Disfruta",
        title: "La experiencia llega a la mesa",
        description:
          "Una vez completada la atención del pedido, el comensal puede disfrutar de su elección.",
        icon: Utensils,
      },
    ],
  },
  {
    id: "restaurant",
    eyebrow: "OPERACIÓN DEL RESTAURANTE",
    title: "Desde Food360 Admin",
    steps: [
      {
        id: "receive",
        number: "01",
        label: "Recibe",
        title: "La comanda llega al equipo",
        description:
          "El restaurante recibe la orden y dispone de la información necesaria para comenzar su atención.",
        icon: Inbox,
      },
      {
        id: "identify",
        number: "02",
        label: "Identifica",
        title: "Reconoce cada pedido",
        description:
          "El personal identifica al cliente, la mesa o ubicación y la modalidad del pedido.",
        icon: ClipboardList,
      },
      {
        id: "accept",
        number: "03",
        label: "Acepta",
        title: "Confirma la atención",
        description:
          "El equipo revisa la comanda y confirma que puede atender el pedido.",
        icon: CheckCircle2,
      },
      {
        id: "prepare",
        number: "04",
        label: "Prepara",
        title: "Cocina organiza el trabajo",
        description:
          "El equipo de cocina gestiona los productos y avanza la preparación de la comanda.",
        icon: ChefHat,
      },
      {
        id: "deliver",
        number: "05",
        label: "Entrega",
        title: "El pedido está listo",
        description:
          "Cuando finaliza la preparación, el equipo identifica la orden como lista para su entrega.",
        icon: PackageCheck,
      },
    ],
  },
];
