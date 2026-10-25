import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { headers } from "next/headers";
import { getRestaurantUrl } from "@/lib/restaurant-url";
import { RestaurantPage } from "@/components/public/restaurant-page";
import {
  getPublicRestaurant,
  isPublicRestaurantSlug,
} from "@/services/public-restaurant.service";

type PageProps = { params: Promise<{ slug: string }> };

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  if (!isPublicRestaurantSlug(slug))
    return { title: "Página no encontrada | Food360" };

  const result = await getPublicRestaurant(slug);
  if (result.status !== "found")
    return { title: "Página no encontrada | Food360" };

  const { restaurant } = result;
  const description = restaurant.address
    ? `${restaurant.name}. Encuentra su información y datos de contacto en Food360.`
    : `${restaurant.name} en Food360.`;

  return {
    title: `${restaurant.name} | Food360`,
    description,
    openGraph: {
      title: `${restaurant.name} | Food360`,
      description,
      type: "website",
    },
  };
}

export default async function RestaurantSlugPage({ params }: PageProps) {
  const { slug } = await params;
  if (!isPublicRestaurantSlug(slug)) notFound();

  const result = await getPublicRestaurant(slug);
  if (result.status === "not-found") notFound();

  if (result.status === "error") {
    throw new Error("No se pudo obtener el perfil público del restaurante");
  }

  const requestHeaders = await headers();

  const isSubdomain = Boolean(requestHeaders.get("x-food360-tenant-subdomain"));

  if (result.restaurant.slug !== slug) {
    redirect(
      getRestaurantUrl(result.restaurant.slug, "", isSubdomain, requestHeaders),
    );
  }

  return (
    <RestaurantPage restaurant={result.restaurant} isSubdomain={isSubdomain} />
  );
}
