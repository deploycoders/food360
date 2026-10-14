'use client';

import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { CustomerData } from '@/types';
import { parseOriginId } from '@/lib/formatters';

interface SessionContextType {
  originId: string;
  originType: 'mesa' | 'delivery' | 'unknown';
  customerData: CustomerData | null;
  isCustomerRegistered: boolean;
  setCustomerData: (data: CustomerData) => void;
  setOrigin: (id: string) => void;
  clearSession: () => void;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

const SESSION_CUSTOMER_KEY = 'restaurant-customer';
const SESSION_ORIGIN_KEY = 'restaurant-origin';

function loadCustomerFromStorage(): CustomerData | null {
  if (typeof window === 'undefined') return null;
  try {
    const stored = sessionStorage.getItem(SESSION_CUSTOMER_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
}

function loadOriginFromStorage(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return sessionStorage.getItem(SESSION_ORIGIN_KEY);
  } catch {
    return null;
  }
}

export function SessionProvider({ children }: { children: ReactNode }) {
  const [customerData, setCustomerDataState] = useState<CustomerData | null>(null);
  const [originId, setOriginId] = useState<string>('walk-in');
  const [originType, setOriginType] = useState<'mesa' | 'delivery' | 'unknown'>('unknown');
  const [isHydrated, setIsHydrated] = useState(false);

  // Hydrate from sessionStorage on mount
  useEffect(() => {
    const storedCustomer = loadCustomerFromStorage();
    const storedOrigin = loadOriginFromStorage();

    queueMicrotask(() => {
      if (storedCustomer) {
        setCustomerDataState(storedCustomer);
      }

      if (storedOrigin) {
        const parsed = parseOriginId(storedOrigin);
        setOriginId(parsed.originId);
        setOriginType(parsed.originType);
      }

      setIsHydrated(true);
    });
  }, []);

  // Persist customer data
  useEffect(() => {
    if (isHydrated && customerData) {
      sessionStorage.setItem(SESSION_CUSTOMER_KEY, JSON.stringify(customerData));
    }
  }, [customerData, isHydrated]);

  const setCustomerData = useCallback((data: CustomerData) => {
    setCustomerDataState(data);
  }, []);

  const setOrigin = useCallback((id: string) => {
    const parsed = parseOriginId(id);
    setOriginId(parsed.originId);
    setOriginType(parsed.originType);
    if (typeof window !== 'undefined') {
      sessionStorage.setItem(SESSION_ORIGIN_KEY, id);
    }
  }, []);

  const clearSession = useCallback(() => {
    setCustomerDataState(null);
    setOriginId('walk-in');
    setOriginType('unknown');
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem(SESSION_CUSTOMER_KEY);
      sessionStorage.removeItem(SESSION_ORIGIN_KEY);
    }
  }, []);

  const isCustomerRegistered = customerData !== null;

  return (
    <SessionContext.Provider
      value={{
        originId,
        originType,
        customerData,
        isCustomerRegistered,
        setCustomerData,
        setOrigin,
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
    throw new Error('useSession must be used within a SessionProvider');
  }
  return context;
}
