'use client';

import { type ReactNode } from 'react';
import { CartProvider } from '@/context/CartContext';
import { SessionProvider } from '@/context/SessionContext';

export function Providers({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      <CartProvider>{children}</CartProvider>
    </SessionProvider>
  );
}
