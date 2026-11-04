"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from "react";

import type { CustomerData, OrderOrigin } from "@/types";

import { useTenant } from "@/context/TenantContext";

import {
  readJsonSessionStorage,
  writeJsonSessionStorage,
  removeSessionStorage,
} from "@/lib/session-storage";

interface StoredSession {
  customerData: CustomerData | null;
  origin: OrderOrigin;
  tablePublicCode: string | null;
  tableNumber: number | null;
  scheduledForLocal: string | null;
}

interface SessionContextType {
  origin: OrderOrigin;
  tablePublicCode: string | null;
  tableNumber: number | null;
  scheduledForLocal: string | null;
  customerData: CustomerData | null;
  isCustomerRegistered: boolean;
  isHydrated: boolean;
  isReady: boolean;

  setCustomerData: (data: CustomerData) => void;
  setTableOrigin: (publicCode: string, tableNumber: number) => void;

  setOrderOrigin: (origin: Exclude<OrderOrigin, "UNKNOWN">) => void;

  setScheduledForLocal: (value: string | null) => void;

  /** Demo hub only: apply a legacy ?id= origin without a public table code. */
  setDemoOrigin: (state: {
    origin: OrderOrigin;
    tableNumber: number | null;
  }) => void;

  clearSession: () => void;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

function sessionStorageKey(restaurantPublicId: string) {
  return `food360.session.${restaurantPublicId}`;
}

function isStoredSession(value: unknown): value is StoredSession {
  if (!value || typeof value !== "object") return false;

  const session = value as Partial<StoredSession>;

  const origins: OrderOrigin[] = ["DINE_IN", "TAKEAWAY", "DELIVERY", "UNKNOWN"];

  return (
    (session.customerData === null ||
      (typeof session.customerData === "object" &&
        session.customerData !== null)) &&
    typeof session.origin === "string" &&
    origins.includes(session.origin) &&
    (session.tablePublicCode === null ||
      typeof session.tablePublicCode === "string") &&
    (session.tableNumber === null || typeof session.tableNumber === "number") &&
    (session.scheduledForLocal === undefined ||
      session.scheduledForLocal === null ||
      typeof session.scheduledForLocal === "string")
  );
}

export function SessionProvider({ children }: { children: ReactNode }) {
  const { restaurantPublicId, isReady: tenantReady } = useTenant();

  const [customerData, setCustomerDataState] = useState<CustomerData | null>(
    null,
  );

  const [origin, setOrigin] = useState<OrderOrigin>("UNKNOWN");

  const [tablePublicCode, setTablePublicCode] = useState<string | null>(null);

  const [tableNumber, setTableNumber] = useState<number | null>(null);

  const [scheduledForLocal, setScheduledForLocalState] = useState<
    string | null
  >(null);

  const [isHydrated, setIsHydrated] = useState(false);
  const [loadedScope, setLoadedScope] = useState<string | null>(null);

  // Cargar la sesión correspondiente al restaurante actual.
  useEffect(() => {
    if (!tenantReady || !restaurantPublicId) {
      queueMicrotask(() => {
        setCustomerDataState(null);
        setOrigin("UNKNOWN");
        setTablePublicCode(null);
        setTableNumber(null);
        setScheduledForLocalState(null);
        setLoadedScope(null);
        setIsHydrated(false);
      });

      return;
    }

    queueMicrotask(() => {
      const stored = readJsonSessionStorage<unknown>(
        sessionStorageKey(restaurantPublicId),
      );

      if (isStoredSession(stored)) {
        setCustomerDataState(stored.customerData);
        setOrigin(stored.origin);
        setTablePublicCode(stored.tablePublicCode);
        setTableNumber(stored.tableNumber);

        // Compatibilidad con sesiones guardadas antes de agregar
        // scheduledForLocal.
        setScheduledForLocalState(stored.scheduledForLocal ?? null);
      } else {
        setCustomerDataState(null);
        setOrigin("UNKNOWN");
        setTablePublicCode(null);
        setTableNumber(null);
        setScheduledForLocalState(null);
      }

      setLoadedScope(restaurantPublicId);
      setIsHydrated(true);
    });
  }, [tenantReady, restaurantPublicId]);

  const isReady =
    tenantReady &&
    isHydrated &&
    loadedScope !== null &&
    loadedScope === restaurantPublicId;

  // Persistir la sesión por restaurante.
  useEffect(() => {
    if (!isReady || !restaurantPublicId) return;

    const payload: StoredSession = {
      customerData,
      origin,
      tablePublicCode,
      tableNumber,
      scheduledForLocal,
    };

    writeJsonSessionStorage(sessionStorageKey(restaurantPublicId), payload);
  }, [
    customerData,
    origin,
    tablePublicCode,
    tableNumber,
    scheduledForLocal,
    isReady,
    restaurantPublicId,
  ]);

  const setCustomerData = useCallback(
    (data: CustomerData) => {
      if (!isReady) return;
      setCustomerDataState(data);
    },
    [isReady],
  );

  // El QR identifica una mesa concreta. No es un pedido programado.
  const setTableOrigin = useCallback(
    (publicCode: string, number: number) => {
      if (!isReady) return;

      setOrigin("DINE_IN");
      setTablePublicCode(publicCode);
      setTableNumber(number);
      setScheduledForLocalState(null);
    },
    [isReady],
  );

  // DINE_IN también puede representar un pedido programado sin mesa.
  const setOrderOrigin = useCallback(
    (next: Exclude<OrderOrigin, "UNKNOWN">) => {
      if (!isReady) return;

      if (next !== origin) {
        setScheduledForLocalState(null);
      }

      setOrigin(next);
      setTablePublicCode(null);
      setTableNumber(null);
    },
    [isReady, origin],
  );

  const setScheduledForLocal = useCallback(
    (value: string | null) => {
      if (!isReady || origin !== "DINE_IN" || tablePublicCode) return;

      setScheduledForLocalState(value);
    },
    [isReady, origin, tablePublicCode],
  );

  const setDemoOrigin = useCallback(
    (state: { origin: OrderOrigin; tableNumber: number | null }) => {
      if (!isReady) return;

      setOrigin(state.origin);
      setTablePublicCode(null);
      setTableNumber(state.tableNumber);
      setScheduledForLocalState(null);
    },
    [isReady],
  );

  const clearSession = useCallback(() => {
    if (!restaurantPublicId) return;

    setCustomerDataState(null);
    setOrigin("UNKNOWN");
    setTablePublicCode(null);
    setTableNumber(null);
    setScheduledForLocalState(null);

    removeSessionStorage(sessionStorageKey(restaurantPublicId));
  }, [restaurantPublicId]);

  const isCustomerRegistered = customerData !== null;

  return (
    <SessionContext.Provider
      value={{
        origin,
        tablePublicCode,
        tableNumber,
        scheduledForLocal,
        customerData,
        isCustomerRegistered,
        isHydrated,
        isReady,
        setCustomerData,
        setTableOrigin,
        setOrderOrigin,
        setScheduledForLocal,
        setDemoOrigin,
        clearSession,
      }}
    >
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  const context = useContext(SessionContext);

  if (!context) {
    throw new Error("useSession must be used within a SessionProvider");
  }

  return context;
}
