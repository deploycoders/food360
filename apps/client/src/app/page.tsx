import type { Metadata } from "next";
import { LandingPage } from "@/components/landing/landing-page";

export const metadata: Metadata = {
  title: "Food360 | Todo tu restaurante, conectado",
  description:
    "Gestiona pedidos, menú digital, cocina, inventario y equipo desde una sola plataforma diseñada para restaurantes.",
};

export default function HomePage() {
  return <LandingPage />;
}
