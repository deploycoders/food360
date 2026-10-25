import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { headers } from "next/headers";

import MenuPage from "@/app/menu/page";
import { getRestaurantUrl } from "@/lib/restaurant-url";
import {
  getPublicRestaurant,
  isPublicRestaurantSlug,
} from "@/services/public-restaurant.service";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;

  if (!isPublicRestaurantSlug(slug)) {
    return { title: "Carta no encontrada | Food360" };
  }

  const result = await getPublicRestaurant(slug);

  if (result.status !== "found") {
    return { title: "Carta no encontrada | Food360" };
  }

  return {
    title: `Carta de ${result.restaurant.name} | Food360`,
    description: `Consulta la carta de ${result.restaurant.name}.`,
  };
}

export default async function RestaurantMenuPage({ params }: PageProps) {
  const { slug } = await params;

  if (!isPublicRestaurantSlug(slug)) {
    notFound();
  }

  const result = await getPublicRestaurant(slug);

  if (result.status === "not-found") {
    notFound();
  }

  if (result.status === "error") {
    throw new Error("No se pudo cargar el restaurante");
  }

  // Si el slug cambió, redirigimos a la URL canónica.
  if (result.restaurant.slug !== slug) {
    const requestHeaders = await headers();

    const isSubdomain = Boolean(
      requestHeaders.get("x-food360-tenant-subdomain"),
    );

    redirect(
      getRestaurantUrl(
        result.restaurant.slug,
        "/menu",
        isSubdomain,
        requestHeaders,
      ),
    );
  }

  return <MenuPage initialSlug={result.restaurant.slug} />;
}
