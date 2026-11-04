'use client';

import { type ReactNode } from 'react';
import { CartProvider } from '@/context/CartContext';
import { SessionProvider } from '@/context/SessionContext';
import { TenantProvider } from '@/context/TenantContext';
import { ThemeProvider } from '@food360/theme';

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider defaultTheme="system">
      <TenantProvider>
        <SessionProvider>
          <CartProvider>{children}</CartProvider>
        </SessionProvider>
      </TenantProvider>
    </ThemeProvider>
  );
}
