import type { Metadata } from "next";
import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";

import { RestaurantPage } from "@/components/public/restaurant-page";
import { getRestaurantUrl } from "@/lib/restaurant-url";
import { getPublicRestaurantById } from "@/services/public-restaurant.service";
import {
  getPublicTable,
  isTablePublicCode,
} from "@/services/public-table.service";

type PageProps = { params: Promise<{ publicId: string }> };

const RESTAURANT_PUBLIC_ID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function isRestaurantPublicId(value: string): boolean {
  return RESTAURANT_PUBLIC_ID_PATTERN.test(value);
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { publicId } = await params;

  if (isTablePublicCode(publicId)) {
    const tableResult = await getPublicTable(publicId);
    if (tableResult.status !== "found") {
      return { title: "Página no encontrada | Food360" };
    }
    return { title: `${tableResult.table.restaurant.name} | Food360` };
  }

  if (isRestaurantPublicId(publicId)) {
    const result = await getPublicRestaurantById(publicId);
    if (result.status !== "found") {
      return { title: "Página no encontrada | Food360" };
    }
    return { title: `${result.restaurant.name} | Food360` };
  }

  return { title: "Página no encontrada | Food360" };
}

export default async function PermanentRestaurantPage({ params }: PageProps) {
  const { publicId } = await params;

  if (isTablePublicCode(publicId)) {
    const tableResult = await getPublicTable(publicId);

    if (tableResult.status === "not-found") notFound();
    if (tableResult.status === "error") {
      throw new Error("No se pudo resolver el código de mesa");
    }

    const requestHeaders = await headers();
    const isSubdomain = Boolean(
      requestHeaders.get("x-food360-tenant-subdomain"),
    );

    redirect(
      getRestaurantUrl(
        tableResult.table.restaurant.slug,
        "/menu",
        isSubdomain,
        requestHeaders,
        { table: tableResult.table.publicCode },
      ),
    );
  }

  if (!isRestaurantPublicId(publicId)) {
    notFound();
  }

  const result = await getPublicRestaurantById(publicId);
  if (result.status === "not-found") notFound();
  if (result.status === "error") {
    throw new Error("No se pudo obtener el perfil público del restaurante");
  }

  const requestHeaders = await headers();
  const isSubdomain = Boolean(requestHeaders.get("x-food360-tenant-subdomain"));

  return (
    <RestaurantPage restaurant={result.restaurant} isSubdomain={isSubdomain} />
  );
}
