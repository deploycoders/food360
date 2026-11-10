"use client";

import { motion, useReducedMotion } from "motion/react";
import {
  ArrowRight,
  ArrowUpRight,
  ClipboardList,
  LayoutDashboard,
  MessageCircle,
  Utensils,
} from "lucide-react";

import { ScrollReveal } from "./scroll-reveal";

const WHATSAPP_MESSAGE =
  "Hola, estoy interesado en conocer Food360 y solicitar una demostración. ¿Podrían indicarme cómo coordinarla?";

const WHATSAPP_URL = `https://wa.me/5804225220381?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`;

const demoHighlights = [
  {
    icon: LayoutDashboard,
    title: "Conoce la plataforma",
    description: "Un recorrido general por las herramientas de Food360.",
  },
  {
    icon: ClipboardList,
    title: "Pedidos y comandas",
    description: "Cómo organizar los pedidos y el trabajo de cocina.",
  },
  {
    icon: Utensils,
    title: "Menú y operación",
    description: "Administración de productos, categorías y equipo.",
  },
];

export function DemoRequestSection() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <section
      id="solicitar-demo"
      className="scroll-mt-20 border-t border-(--color-border) bg-(--color-bg-base) px-5 py-20 sm:px-8 sm:py-24 lg:px-14 lg:py-28"
    >
      <div className="mx-auto max-w-330">
        <div className="grid overflow-hidden rounded-2xl border border-(--color-border) bg-(--color-bg-surface) lg:grid-cols-[1.08fr_0.92fr]">
          <ScrollReveal className="flex min-w-0 flex-col justify-center p-7 sm:p-10 lg:p-14">
            <div data-reveal-item>
              <p className="text-[10px] font-bold uppercase tracking-[0.19em] text-(--color-accent-terracotta)">
                Da el siguiente paso
              </p>

              <h2 className="mt-5 max-w-155 text-[clamp(2.2rem,4.5vw,4rem)] font-bold leading-[1.08] tracking-[-0.06em] text-(--color-text-primary)">
                Tu restaurante merece una gestión más{" "}
                <span className="font-serif font-medium italic text-(--color-accent-terracotta)">
                  sencilla.
                </span>
              </h2>

              <p className="mt-5 max-w-125 text-sm leading-[1.9] text-(--color-text-muted)">
                Conoce cómo Food360 puede ayudarte a organizar los pedidos, la
                cocina y la operación diaria de tu restaurante. Solicita una
                demostración y conversemos sobre tu negocio.
              </p>

              <div className="mt-8 flex flex-col items-start gap-4 sm:flex-row sm:items-center">
                <motion.a
                  href={WHATSAPP_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={shouldReduceMotion ? undefined : { y: -2 }}
                  whileTap={shouldReduceMotion ? undefined : { scale: 0.98 }}
                  className="group inline-flex min-h-12 w-full items-center justify-center gap-2.5 rounded-xl bg-(--color-accent-terracotta) px-5 text-sm font-bold text-white transition-colors hover:bg-(--color-accent-terracotta-hover) focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-(--color-accent-terracotta) sm:w-auto"
                >
                  <MessageCircle className="h-4 w-4" />
                  Solicitar demo por WhatsApp
                  <ArrowUpRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </motion.a>

                <a
                  href="#funcionalidades"
                  className="inline-flex items-center gap-2 rounded-lg py-2 text-xs font-semibold text-(--color-text-muted) transition-colors hover:text-(--color-text-primary) focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-(--color-accent-terracotta)"
                >
                  Explorar funcionalidades
                  <ArrowRight className="h-3.5 w-3.5" />
                </a>
              </div>
            </div>
          </ScrollReveal>

          <div className="border-t border-(--color-border) bg-(--color-bg-subtle) p-7 sm:p-10 lg:border-l lg:border-t-0 lg:p-12">
            <ScrollReveal
              className="flex h-full flex-col justify-center"
              stagger={0.1}
            >
              <div data-reveal-item>
                <p className="text-[10px] font-bold uppercase tracking-[0.17em] text-(--color-text-muted)">
                  Durante la demostración
                </p>
                <h3 className="mt-3 text-xl font-bold tracking-tight text-(--color-text-primary)">
                  Conoce lo que puedes hacer con Food360.
                </h3>
              </div>

              <div className="mt-8 space-y-6">
                {demoHighlights.map((item) => {
                  const Icon = item.icon;

                  return (
                    <div
                      key={item.title}
                      data-reveal-item
                      className="flex items-start gap-4"
                    >
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-(--color-border) bg-(--color-bg-surface) text-(--color-accent-terracotta)">
                        <Icon className="h-4.5 w-4.5" strokeWidth={1.7} />
                      </span>

                      <div className="min-w-0 pt-0.5">
                        <h4 className="text-sm font-bold text-(--color-text-primary)">
                          {item.title}
                        </h4>
                        <p className="mt-1 text-xs leading-[1.8] text-(--color-text-muted)">
                          {item.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              <p
                data-reveal-item
                className="mt-9 border-t border-(--color-border) pt-5 text-[10px] leading-[1.8] text-(--color-text-subtle)"
              >
                Al continuar, WhatsApp se abrirá con un mensaje preparado.
                Podrás revisarlo y enviarlo cuando estés listo.
              </p>
            </ScrollReveal>
          </div>
        </div>
      </div>
    </section>
  );
}
