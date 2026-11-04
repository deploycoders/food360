"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type { PublicRestaurant } from "@food360/types";

import {
  readJsonSessionStorage,
  writeJsonSessionStorage,
  removeSessionStorage,
} from "@/lib/session-storage";

export const DEMO_TENANT_SCOPE = "demo";
const LAST_TENANT_KEY = "food360.last-tenant";

export type TenantIdentity = {
  restaurantPublicId: string;
  slug: string;
  name: string;
};

type TenantStatus = "idle" | "ready" | "missing";

interface TenantContextType {
  restaurantPublicId: string | null;
  slug: string | null;
  name: string | null;
  status: TenantStatus;
  isReady: boolean;
  setTenant: (tenant: TenantIdentity) => void;
  setDemoTenant: () => void;
  clearTenant: () => void;
}

const TenantContext = createContext<TenantContextType | undefined>(undefined);

export function TenantProvider({ children }: { children: ReactNode }) {
  const [tenant, setTenantState] = useState<TenantIdentity | null>(null);
  const [status, setStatus] = useState<TenantStatus>("idle");
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    queueMicrotask(() => {
      const stored = readJsonSessionStorage<TenantIdentity>(LAST_TENANT_KEY);
      if (
        stored &&
        typeof stored.restaurantPublicId === "string" &&
        stored.restaurantPublicId !== DEMO_TENANT_SCOPE &&
        typeof stored.slug === "string" &&
        typeof stored.name === "string"
      ) {
        setTenantState(stored);
        setStatus("ready");
      } else {
        setStatus("missing");
      }
      setIsHydrated(true);
    });
  }, []);

  const setTenant = useCallback((next: TenantIdentity) => {
    setTenantState(next);
    setStatus("ready");
    writeJsonSessionStorage(LAST_TENANT_KEY, next);
  }, []);

  const setDemoTenant = useCallback(() => {
    const demo: TenantIdentity = {
      restaurantPublicId: DEMO_TENANT_SCOPE,
      slug: DEMO_TENANT_SCOPE,
      name: "360 food",
    };
    setTenantState(demo);
    setStatus("ready");
    // Demo must not overwrite a real last-tenant used by /cart.
  }, []);

  const clearTenant = useCallback(() => {
    setTenantState(null);
    setStatus("missing");
    removeSessionStorage(LAST_TENANT_KEY);
  }, []);

  const value: TenantContextType = {
    restaurantPublicId: tenant?.restaurantPublicId ?? null,
    slug: tenant?.slug ?? null,
    name: tenant?.name ?? null,
    status: isHydrated ? status : "idle",
    isReady: isHydrated && status === "ready" && tenant !== null,
    setTenant,
    setDemoTenant,
    clearTenant,
  };

  return (
    <TenantContext.Provider value={value}>{children}</TenantContext.Provider>
  );
}

export function useTenant() {
  const context = useContext(TenantContext);
  if (!context) {
    throw new Error("useTenant must be used within a TenantProvider");
  }
  return context;
}

export function TenantBinder({
  restaurant,
}: {
  restaurant: PublicRestaurant;
}) {
  const { setTenant } = useTenant();

  useEffect(() => {
    setTenant({
      restaurantPublicId: restaurant.publicId,
      slug: restaurant.slug,
      name: restaurant.name,
    });
  }, [restaurant.publicId, restaurant.slug, restaurant.name, setTenant]);

  return null;
}
