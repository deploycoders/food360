"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function DebugTokenPage() {
  const [token, setToken] = useState("");
  const [message, setMessage] = useState("Buscando sesión...");

  useEffect(() => {
    async function getToken() {
      const supabase = createClient();
      const { data, error } = await supabase.auth.getSession();

      if (error) {
        setMessage(error.message);
        return;
      }

      if (!data.session?.access_token) {
        setMessage("No hay sesión activa. Inicia sesión en Food360.");
        return;
      }

      setToken(data.session.access_token);
      setMessage("Token obtenido correctamente.");
    }

    getToken();
  }, []);

  return (
    <main className="space-y-4 p-6">
      <h1 className="text-xl font-bold">Token de prueba</h1>
      <p>{message}</p>

      {token && (
        <textarea
          readOnly
          value={token}
          className="w-full rounded-lg border border-border bg-background p-3"
          rows={8}
        />
      )}
    </main>
  );
}
