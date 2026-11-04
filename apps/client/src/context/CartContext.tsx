'use client';

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from 'react';
import { CartItem, MenuItem } from '@/types';
import { useTenant } from '@/context/TenantContext';
import {
  readJsonSessionStorage,
  writeJsonSessionStorage,
} from '@/lib/session-storage';

interface CartContextType {
  items: CartItem[];
  addItem: (menuItem: MenuItem) => void;
  removeItem: (menuItemId: string) => void;
  updateQuantity: (menuItemId: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
  isInCart: (menuItemId: string) => boolean;
  getItemQuantity: (menuItemId: string) => number;
  isHydrated: boolean;
  isReady: boolean;
  restaurantScope: string | null;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

function cartStorageKey(restaurantPublicId: string) {
  return `food360.cart.${restaurantPublicId}`;
}

export function CartProvider({ children }: { children: ReactNode }) {
  const {
    restaurantPublicId,
    isReady: tenantReady,
  } = useTenant();

  const [items, setItems] = useState<CartItem[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);
  const [loadedScope, setLoadedScope] = useState<string | null>(null);

  // Load the cart bucket for the current restaurant once the tenant is ready.
  useEffect(() => {
    if (!tenantReady || !restaurantPublicId) {
      queueMicrotask(() => {
        setItems([]);
        setLoadedScope(null);
        setIsHydrated(false);
      });
      return;
    }

    queueMicrotask(() => {
      const stored = readJsonSessionStorage<CartItem[]>(
        cartStorageKey(restaurantPublicId),
      );
      setItems(Array.isArray(stored) ? stored : []);
      setLoadedScope(restaurantPublicId);
      setIsHydrated(true);
    });
  }, [tenantReady, restaurantPublicId]);

  const isReady =
    tenantReady &&
    isHydrated &&
    loadedScope !== null &&
    loadedScope === restaurantPublicId;

  // Persist only when the cart is validated against the current restaurant.
  useEffect(() => {
    if (!isReady || !restaurantPublicId) return;
    writeJsonSessionStorage(cartStorageKey(restaurantPublicId), items);
  }, [items, isReady, restaurantPublicId]);

  const addItem = useCallback(
    (menuItem: MenuItem) => {
      if (!isReady) return;
      setItems((prev) => {
        const existing = prev.find((item) => item.menuItem.id === menuItem.id);
        if (existing) {
          return prev.map((item) =>
            item.menuItem.id === menuItem.id
              ? { ...item, quantity: item.quantity + 1 }
              : item,
          );
        }
        return [...prev, { menuItem, quantity: 1 }];
      });
    },
    [isReady],
  );

  const removeItem = useCallback(
    (menuItemId: string) => {
      if (!isReady) return;
      setItems((prev) => prev.filter((item) => item.menuItem.id !== menuItemId));
    },
    [isReady],
  );

  const updateQuantity = useCallback(
    (menuItemId: string, quantity: number) => {
      if (!isReady) return;
      if (quantity <= 0) {
        setItems((prev) =>
          prev.filter((item) => item.menuItem.id !== menuItemId),
        );
        return;
      }
      setItems((prev) =>
        prev.map((item) =>
          item.menuItem.id === menuItemId ? { ...item, quantity } : item,
        ),
      );
    },
    [isReady],
  );

  const clearCart = useCallback(() => {
    if (!isReady) return;
    setItems([]);
  }, [isReady]);

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce(
    (sum, item) => sum + item.menuItem.price * item.quantity,
    0,
  );

  const isInCart = useCallback(
    (menuItemId: string) => items.some((item) => item.menuItem.id === menuItemId),
    [items],
  );

  const getItemQuantity = useCallback(
    (menuItemId: string) => {
      const found = items.find((item) => item.menuItem.id === menuItemId);
      return found ? found.quantity : 0;
    },
    [items],
  );

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        totalItems,
        totalPrice,
        isInCart,
        getItemQuantity,
        isHydrated,
        isReady,
        restaurantScope: loadedScope,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
