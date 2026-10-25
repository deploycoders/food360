"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

import type { AppRole } from "@food360/types";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/context/AuthContext";

interface Restaurant {
  id: string;
  name: string;
  slug: string;
}

interface RestaurantContextValue {
  restaurants: Restaurant[];
  currentRestaurant: Restaurant | null;
  restaurantId: string | null;
  role: AppRole | null;
  loading: boolean;
  error: string | null;
  selectRestaurant: (restaurantId: string) => void;
}

interface MembershipRow {
  role: string;
  restaurants: Restaurant | Restaurant[] | null;
}

const RESTAURANT_STORAGE_KEY = "food360.currentRestaurantId";

const RestaurantContext = createContext<RestaurantContextValue | undefined>(
  undefined,
);

function getStoredRestaurantId(): string | null {
  try {
    return window.localStorage.getItem(RESTAURANT_STORAGE_KEY);
  } catch {
    return null;
  }
}

function storeRestaurantId(restaurantId: string | null): void {
  try {
    if (restaurantId) {
      window.localStorage.setItem(RESTAURANT_STORAGE_KEY, restaurantId);
    } else {
      window.localStorage.removeItem(RESTAURANT_STORAGE_KEY);
    }
  } catch {
    // El contexto seguirá funcionando aunque localStorage no esté disponible.
  }
}

function getJoinedRestaurant(
  value: Restaurant | Restaurant[] | null,
): Restaurant | null {
  if (Array.isArray(value)) {
    return value[0] ?? null;
  }

  return value;
}

export function RestaurantProvider({ children }: { children: ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  // Supabase may replace the User object on token refresh while the identity stays the same.
  const userId = user?.id ?? null;

  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [currentRestaurant, setCurrentRestaurant] = useState<Restaurant | null>(
    null,
  );
  const [role, setRole] = useState<AppRole | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const selectRestaurant = useCallback(
    (restaurantId: string) => {
      const selected = restaurants.find(
        (restaurant) => restaurant.id === restaurantId,
      );

      // No se puede seleccionar un restaurante que no pertenezca
      // a las membresías activas que devolvió Supabase.
      if (!selected) return;

      setCurrentRestaurant(selected);

      // Recuperar el rol correspondiente a esa membresía.
      // La selección no modifica ni concede permisos.
      void loadRoleForSelectedRestaurant(restaurantId);

      storeRestaurantId(restaurantId);
    },
    [restaurants],
  );

  /**
   * Consulta el rol de la membresía activa seleccionada.
   * La consulta se limita al usuario autenticado y al restaurante
   * que ya está en su lista de membresías activas.
   */
  async function loadRoleForSelectedRestaurant(restaurantId: string) {
    if (!user) {
      setRole(null);
      return;
    }

    const supabase = createClient();

    const { data, error: membershipError } = await supabase
      .from("restaurant_members")
      .select("role")
      .eq("user_id", user.id)
      .eq("restaurant_id", restaurantId)
      .eq("is_active", true)
      .maybeSingle();

    if (membershipError || !data) {
      console.error("Error loading selected restaurant role:", membershipError);

      setRole(null);
      return;
    }

    setRole(data.role as AppRole);
  }

  useEffect(() => {
    if (authLoading) {
      setLoading(true);
      return;
    }

    let cancelled = false;

    async function loadRestaurantContext() {
      setLoading(true);
      setError(null);

      if (!userId) {
        setRestaurants([]);
        setCurrentRestaurant(null);
        setRole(null);
        setLoading(false);

        return;
      }

      try {
        const supabase = createClient();

        const { data, error: queryError } = await supabase
          .from("restaurant_members")
          .select(
            `
              role,
              restaurants (
                id,
                name,
                slug
              )
            `,
          )
          .eq("user_id", userId)
          .eq("is_active", true)
          .order("created_at", { ascending: true });

        if (queryError) throw queryError;

        if (cancelled) return;

        const memberships = (data ?? []) as unknown as MembershipRow[];

        const availableRestaurants: Restaurant[] = [];
        const rolesByRestaurant = new Map<string, AppRole>();

        for (const membership of memberships) {
          const restaurant = getJoinedRestaurant(membership.restaurants);

          if (!restaurant) continue;

          // Evitar entradas duplicadas.
          if (!availableRestaurants.some((item) => item.id === restaurant.id)) {
            availableRestaurants.push({
              id: restaurant.id,
              name: restaurant.name,
              slug: restaurant.slug,
            });
          }

          rolesByRestaurant.set(restaurant.id, membership.role as AppRole);
        }

        setRestaurants(availableRestaurants);

        if (availableRestaurants.length === 0) {
          setCurrentRestaurant(null);
          setRole(null);
          storeRestaurantId(null);
          return;
        }

        // Restaurar la última selección si el usuario sigue
        // teniendo una membresía activa para ese restaurante.
        const storedRestaurantId = getStoredRestaurantId();

        const selectedRestaurant =
          availableRestaurants.find(
            (restaurant) => restaurant.id === storedRestaurantId,
          ) ?? availableRestaurants[0];

        setCurrentRestaurant(selectedRestaurant);
        setRole(rolesByRestaurant.get(selectedRestaurant.id) ?? null);

        // Guardar una selección válida para próximas sesiones.
        storeRestaurantId(selectedRestaurant.id);
      } catch (err) {
        if (cancelled) return;

        console.error("Error loading restaurant context:", err);

        setRestaurants([]);
        setCurrentRestaurant(null);
        setRole(null);
        setError(
          "No se pudo cargar la información de tus restaurantes. Inténtalo de nuevo.",
        );
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadRestaurantContext();

    return () => {
      cancelled = true;
    };
  }, [userId, authLoading]);

  return (
    <RestaurantContext.Provider
      value={{
        restaurants,
        currentRestaurant,
        restaurantId: currentRestaurant?.id ?? null,
        role,
        loading,
        error,
        selectRestaurant,
      }}
    >
      {children}
    </RestaurantContext.Provider>
  );
}

export function useRestaurant() {
  const context = useContext(RestaurantContext);

  if (!context) {
    throw new Error("useRestaurant must be used inside a RestaurantProvider");
  }

  return context;
}
