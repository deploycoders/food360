"use client";

import React, { useState } from "react";
import {
  Bot,
  Mic,
  MessageSquare,
  Key,
  Sparkles,
  Sliders,
  CheckCircle2,
} from "lucide-react";

export function AIIntegrationsTab() {
  const [elevenLabsAgentId, setElevenLabsAgentId] = useState("agent_78a19b2x");
  const [elevenLabsApiKey, setElevenLabsApiKey] = useState("");
  const [whatsappEnabled, setWhatsappEnabled] = useState(true);
  const [voiceOrderingEnabled, setVoiceOrderingEnabled] = useState(true);
  const [systemPrompt, setSystemPrompt] = useState(
    "Eres el asistente virtual de Food360. Saluda amablemente, ofrece las especialidades del día y ayuda a armar el pedido rápidamente.",
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* ElevenLabs Voice Agent */}
      <div className="rounded-2xl border border-border bg-card p-6 shadow-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent/10 text-accent">
              <Mic className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-foreground tracking-tight">
                Agente de Voz ElevenLabs (IA)
              </h2>
              <p className="text-xs text-muted-foreground">
                Permite a los clientes interactuar o pedir por voz en la web o
                menú QR.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setVoiceOrderingEnabled(!voiceOrderingEnabled)}
            className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
              voiceOrderingEnabled ? "bg-accent" : "bg-muted"
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-card shadow-sm transition duration-200 ${
                voiceOrderingEnabled ? "translate-x-4" : "translate-x-0"
              }`}
            />
          </button>
        </div>

        {voiceOrderingEnabled && (
          <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 pt-4 border-t border-border/40">
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5">
                ElevenLabs Agent ID
              </label>
              <input
                type="text"
                value={elevenLabsAgentId}
                onChange={(e) => setElevenLabsAgentId(e.target.value)}
                placeholder="agent_xxxxxx"
                className="w-full rounded-xl border border-border bg-muted/20 px-3 py-2 text-xs text-foreground font-mono focus:border-accent focus:bg-card focus:outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5">
                ElevenLabs API Key (Opcional)
              </label>
              <div className="relative">
                <Key className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground/70" />
                <input
                  type="password"
                  value={elevenLabsApiKey}
                  onChange={(e) => setElevenLabsApiKey(e.target.value)}
                  placeholder="xi-api-key-••••••••"
                  className="w-full rounded-xl border border-border bg-muted/20 pl-9 pr-3 py-2 text-xs text-foreground font-mono focus:border-accent focus:bg-card focus:outline-none transition-all"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Integración con WhatsApp Bot */}
      <div className="rounded-2xl border border-border bg-card p-6 shadow-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500">
              <MessageSquare className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-foreground tracking-tight">
                Bot de Pedidos por WhatsApp
              </h2>
              <p className="text-xs text-muted-foreground">
                Sincroniza comandas automáticas desde chats de WhatsApp hacia el
                KDS.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setWhatsappEnabled(!whatsappEnabled)}
            className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
              whatsappEnabled ? "bg-accent" : "bg-muted"
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-card shadow-sm transition duration-200 ${
                whatsappEnabled ? "translate-x-4" : "translate-x-0"
              }`}
            />
          </button>
        </div>

        {whatsappEnabled && (
          <div className="mt-5 space-y-4 pt-4 border-t border-border/40">
            <div>
              <label className="text-xs font-semibold text-foreground mb-1.5 f  lex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-accent" />
                Instrucciones del Sistema (System Prompt)
              </label>
              <textarea
                rows={3}
                value={systemPrompt}
                onChange={(e) => setSystemPrompt(e.target.value)}
                className="w-full rounded-xl border border-border bg-muted/20 p-3 text-xs text-foreground focus:border-accent focus:bg-card focus:outline-none transition-all resize-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1.5">
                  Webhook URL (Para tu backend/bot)
                </label>
                <input
                  type="text"
                  readOnly
                  value="https://api.food360.app/v1/webhooks/whatsapp"
                  className="w-full rounded-xl border border-border bg-muted/30 px-3 py-2 text-xs font-mono text-muted-foreground select-all"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1.5">
                  Estado de la Conexión
                </label>
                <div className="flex items-center gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-3 py-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Webhook Operativo & Respondiendo</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
