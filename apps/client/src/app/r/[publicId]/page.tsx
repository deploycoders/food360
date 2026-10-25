import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { RestaurantPage } from "@/components/public/restaurant-page";
import { getPublicRestaurantById } from "@/services/public-restaurant.service";

type PageProps = { params: Promise<{ publicId: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { publicId } = await params;
  const result = await getPublicRestaurantById(publicId);
  if (result.status !== "found") return { title: "Página no encontrada | Food360" };
  return { title: `${result.restaurant.name} | Food360` };
}

export default async function PermanentRestaurantPage({ params }: PageProps) {
  const { publicId } = await params;
  const result = await getPublicRestaurantById(publicId);
  if (result.status === "not-found") notFound();
  if (result.status === "error") {
    throw new Error("No se pudo obtener el perfil público del restaurante");
  }
  return <RestaurantPage restaurant={result.restaurant} />;
}
