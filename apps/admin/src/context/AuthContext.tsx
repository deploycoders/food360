"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  passwordRecovery: { userId: string; occurredAt: number } | null;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [passwordRecovery, setPasswordRecovery] = useState<{
    userId: string;
    occurredAt: number;
  } | null>(null);

  useEffect(() => {
    const supabase = createClient();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);

      if (_event === "PASSWORD_RECOVERY" && session) {
        setPasswordRecovery({
          userId: session.user.id,
          occurredAt: Date.now(),
        });
      } else if (_event === "SIGNED_IN" || _event === "SIGNED_OUT") {
        setPasswordRecovery(null);
      }
    });

    void supabase.auth
      .getUser()
      .then(({ data, error }) => {
        setUser(error ? null : data.user);
      })
      .finally(() => setLoading(false));

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!user) return;

    const supabase = createClient();

    let intervalId: ReturnType<typeof setInterval> | null = null;

    const updateLastSeen = async () => {
      const { error } = await supabase.rpc("update_last_seen");

      if (error) {
        console.error("Error updating last_seen_at:", error);
      }
    };

    // Registrar inmediatamente la conexión
    updateLastSeen();

    // Mantener actualizado mientras la sesión esté activa
    intervalId = setInterval(() => {
      updateLastSeen();
    }, 30_000);

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [user]);

  async function signOut() {
    const supabase = createClient();

    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error("Error signing out:", error);
      throw error;
    }

    setUser(null);
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        passwordRecovery,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside an AuthProvider");
  }

  return context;
}
