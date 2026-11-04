"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";

import { useSession } from "@/context/SessionContext";
import { useTenant } from "@/context/TenantContext";
import {
  getPublicTable,
  isTablePublicCode,
} from "@/services/public-table.service";

/**
 * Reads ?table=t_… from the URL, validates it against the current restaurant,
 * and stores DINE_IN + public_code in the namespaced session.
 */
export function TableOriginBinder() {
  const searchParams = useSearchParams();
  const { restaurantPublicId, isReady: tenantReady } = useTenant();
  const { setTableOrigin, isReady: sessionReady } = useSession();

  useEffect(() => {
    if (!tenantReady || !sessionReady || !restaurantPublicId) return;

    const tableCode = searchParams.get("table")?.trim();
    if (!tableCode || !isTablePublicCode(tableCode)) return;

    let active = true;

    void (async () => {
      const result = await getPublicTable(tableCode);
      if (!active) return;
      if (result.status !== "found") return;
      if (result.table.restaurant.publicId !== restaurantPublicId) return;

      setTableOrigin(result.table.publicCode, result.table.tableNumber);
    })();

    return () => {
      active = false;
    };
  }, [
    searchParams,
    tenantReady,
    sessionReady,
    restaurantPublicId,
    setTableOrigin,
  ]);

  return null;
}
