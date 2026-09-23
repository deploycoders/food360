"use client";

import {
  createContext,
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
}

const RestaurantContext = createContext<RestaurantContextValue | undefined>(
  undefined,
);

export function RestaurantProvider({ children }: { children: ReactNode }) {
  const { user, loading: authLoading } = useAuth();

  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [currentRestaurant, setCurrentRestaurant] = useState<Restaurant | null>(
    null,
  );
  const [role, setRole] = useState<AppRole | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      setRestaurants([]);
      setCurrentRestaurant(null);
      setRole(null);
      setLoading(false);
      return;
    }

    const currentUser = user;

    async function loadRestaurantContext() {
      const supabase = createClient();

      const { data, error } = await supabase
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
        .eq("user_id", currentUser.id);

      if (error) {
        console.error("Error loading restaurant context:", error);

        setRestaurants([]);
        setCurrentRestaurant(null);
        setRole(null);
        setLoading(false);

        return;
      }

      const memberships = data ?? [];

      const availableRestaurants: Restaurant[] = [];

      for (const membership of memberships) {
        const restaurant = Array.isArray(membership.restaurants)
          ? membership.restaurants[0]
          : membership.restaurants;

        if (!restaurant) continue;

        availableRestaurants.push({
          id: restaurant.id,
          name: restaurant.name,
          slug: restaurant.slug,
        });
      }

      setRestaurants(availableRestaurants);

      const firstMembership = memberships[0];

      if (!firstMembership) {
        setCurrentRestaurant(null);
        setRole(null);
        setLoading(false);
        return;
      }

      const restaurant = Array.isArray(firstMembership.restaurants)
        ? firstMembership.restaurants[0]
        : firstMembership.restaurants;

      if (!restaurant) {
        setCurrentRestaurant(null);
        setRole(null);
        setLoading(false);
        return;
      }

      setCurrentRestaurant({
        id: restaurant.id,
        name: restaurant.name,
        slug: restaurant.slug,
      });

      setRole(firstMembership.role as AppRole);

      setLoading(false);
    }

    loadRestaurantContext();
  }, [user, authLoading]);

  return (
    <RestaurantContext.Provider
      value={{
        restaurants,
        currentRestaurant,
        restaurantId: currentRestaurant?.id ?? null,
        role,
        loading,
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
