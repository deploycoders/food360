import { Bike, ShoppingBag, Store } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface CapabilityData {
  id: string;
  number: string;
  title: string;
  summary: string;
  description: string;
  detail: string;
  image: string | null;
  imageAlt: string;
  visualTitle: string;
}

export interface OrderModalityData {
  id: string;
  number: string;
  title: string;
  subtitle: string;
  description: string;
  image: string;
  imageAlt: string;
  icon: LucideIcon;
}

export const CAPABILITIES: CapabilityData[] = [
  {
    id: "orders",
    number: "01",
    title: "Pedidos y comandas",
    summary: "Cada pedido, organizado en un mismo flujo.",
    description:
      "Centraliza las órdenes recibidas desde la carta digital y consulta la información necesaria para organizar su atención.",
    detail: "En el local · Para retirar · A domicilio",
    image:
      "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=1200&q=85",
    imageAlt: "Hamburguesa gourmet servida en un restaurante",
    visualTitle: "Una experiencia que comienza con cada pedido.",
  },
  {
    id: "menu",
    number: "02",
    title: "Menú digital",
    summary: "Tu carta, siempre bajo control.",
    description:
      "Organiza categorías y productos, actualiza precios y controla la disponibilidad de lo que ofreces a tus comensales.",
    detail: "Productos · Categorías · Disponibilidad",
    image:
      "https://images.unsplash.com/photo-1535400255456-984241443b29?auto=format&fit=crop&w=1200&q=85",
    imageAlt: "Plato gastronómico presentado para una carta digital",
    visualTitle: "Tu propuesta gastronómica en formato digital.",
  },
  {
    id: "kitchen",
    number: "03",
    title: "Cocina y KDS",
    summary: "Las comandas llegan organizadas a cocina.",
    description:
      "Visualiza los pedidos por estado y permite que el equipo avance su preparación desde la pantalla de cocina.",
    detail: "Pendiente · En preparación · Listo",
    image:
      "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1200&q=85",
    imageAlt: "Plato principal preparado en un restaurante",
    visualTitle: "Una cocina con mejor organización.",
  },
  {
    id: "management",
    number: "04",
    title: "Inventario y equipo",
    summary: "También importa lo que sucede detrás del servicio.",
    description:
      "Gestiona las existencias y organiza al personal del restaurante desde las herramientas administrativas de Food360.",
    detail: "Stock · Personal · Roles",
    image: null,
    imageAlt: "",
    visualTitle: "El trabajo interno también forma parte del negocio.",
  },
];

export const ORDER_MODALITIES: OrderModalityData[] = [
  {
    id: "dine-in",
    number: "01",
    title: "En el local",
    subtitle: "Para consumir en el restaurante",
    description:
      "El comensal realiza su pedido para consumir en el establecimiento. Si comienza desde el QR de una mesa, el pedido conserva esa identificación.",
    image:
      "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1200&q=85",
    imageAlt: "Plato servido para consumir en un restaurante",
    icon: Store,
  },
  {
    id: "takeaway",
    number: "02",
    title: "Para retirar",
    subtitle: "Recoge su pedido en el establecimiento",
    description:
      "El cliente realiza su pedido con antelación y acude al restaurante para recogerlo.",
    image:
      "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=1200&q=85",
    imageAlt: "Hamburguesa preparada para llevar",
    icon: ShoppingBag,
  },
  {
    id: "delivery",
    number: "03",
    title: "A domicilio",
    subtitle: "El pedido se prepara para su entrega",
    description:
      "El cliente realiza un pedido destinado a ser entregado en la dirección indicada.",
    image:
      "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=1200&q=85",
    imageAlt: "Pizza preparada para un pedido a domicilio",
    icon: Bike,
  },
];
