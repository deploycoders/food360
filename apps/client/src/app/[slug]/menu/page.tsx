import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { headers } from "next/headers";
import { Suspense } from "react";

import MenuPage from "@/app/menu/page";
import { TenantBinder } from "@/context/TenantContext";
import { TableOriginBinder } from "@/components/public/table-origin-binder";
import { getRestaurantUrl } from "@/lib/restaurant-url";
import {
  getPublicRestaurant,
  isPublicRestaurantSlug,
} from "@/services/public-restaurant.service";

type PageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function firstSearchParam(
  value: string | string[] | undefined,
): string | undefined {
  if (Array.isArray(value)) return value[0];
  return value;
}

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

export default async function RestaurantMenuPage({
  params,
  searchParams,
}: PageProps) {
  const { slug } = await params;
  const query = await searchParams;
  const tableCode = firstSearchParam(query.table)?.trim();

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

  // Si el slug cambió, redirigimos a la URL canónica conservando ?table=.
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
        { table: tableCode },
      ),
    );
  }

  return (
    <>
      <TenantBinder restaurant={result.restaurant} />
      <Suspense fallback={null}>
        <TableOriginBinder />
      </Suspense>
      <MenuPage
        initialSlug={result.restaurant.slug}
        restaurant={result.restaurant}
      />
    </>
  );
}
