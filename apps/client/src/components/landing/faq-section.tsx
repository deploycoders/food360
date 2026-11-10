"use client";

import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ChevronDown } from "lucide-react";

import { ScrollReveal } from "./scroll-reveal";

const questions = [
  {
    id: "food360",
    question: "¿Qué es Food360?",
    answer:
      "Food360 es una plataforma para restaurantes que reúne herramientas de gestión de pedidos, menú digital, cocina, inventario y equipo en un mismo entorno.",
  },
  {
    id: "installation",
    question: "¿Mis clientes necesitan instalar una aplicación?",
    answer:
      "No. La carta pública puede abrirse desde el navegador del teléfono mediante un código QR o un enlace del restaurante.",
  },
  {
    id: "modalities",
    question: "¿Qué modalidades de pedido puedo ofrecer?",
    answer:
      "Food360 contempla pedidos para consumir en el local, para retirar en el establecimiento y a domicilio.",
  },
  {
    id: "menu",
    question: "¿Puedo administrar mis productos y precios?",
    answer:
      "Sí. El administrador permite organizar categorías y productos, modificar precios y gestionar la disponibilidad de los artículos de la carta.",
  },
  {
    id: "kitchen",
    question: "¿Cómo se organizan los pedidos en cocina?",
    answer:
      "El KDS presenta las comandas organizadas por estados de preparación, permitiendo al equipo identificar los pedidos pendientes, en preparación y listos.",
  },
  {
    id: "reservations",
    question: "¿Los pedidos para consumir en el local reservan una mesa?",
    answer:
      "No. Un pedido para consumir en el local puede realizarse sin reservar una mesa. Cuando se inicia desde el QR de una mesa, conserva esa identificación. Las reservas se gestionan independientemente.",
  },
  {
    id: "team",
    question: "¿Puedo administrar al personal de mi restaurante?",
    answer:
      "Sí. Food360 incluye herramientas para gestionar integrantes del equipo y organizar sus permisos según los roles disponibles.",
  },
  {
    id: "demo",
    question: "¿Cómo puedo conocer la plataforma?",
    answer:
      "Puedes explorar la demostración disponible desde los botones de acceso de esta página y conocer las distintas experiencias de Food360.",
  },
];

export function FAQSection() {
  const [openQuestion, setOpenQuestion] = useState<string | null>(null);
  const shouldReduceMotion = useReducedMotion();

  return (
    <section
      id="preguntas-frecuentes"
      className="border-t border-(--color-border) bg-(--color-bg-base) px-5 py-20 sm:px-8 sm:py-24 lg:px-14 lg:py-28"
    >
      <div className="mx-auto grid max-w-330 gap-12 lg:grid-cols-[0.75fr_1.25fr] lg:gap-20">
        <ScrollReveal className="min-w-0">
          <header data-reveal-item>
            <p className="text-[10px] font-bold uppercase tracking-[0.19em] text-(--color-accent-terracotta)">
              Preguntas frecuentes
            </p>
            <h2 className="mt-4 max-w-120 text-[clamp(2.1rem,4vw,3.6rem)] font-bold leading-[1.08] tracking-[-0.06em] text-(--color-text-primary)">
              Resolvemos tus dudas sobre{" "}
              <span className="font-serif font-medium italic text-(--color-accent-terracotta)">
                Food360.
              </span>
            </h2>
            <p className="mt-5 max-w-97.5 text-sm leading-[1.9] text-(--color-text-muted)">
              Conoce cómo funciona la plataforma y las herramientas disponibles
              para organizar tu restaurante.
            </p>
          </header>
        </ScrollReveal>

        <ScrollReveal
          className="min-w-0 border-t border-(--color-border)"
          stagger={0.07}
        >
          {questions.map((item, index) => {
            const isOpen = openQuestion === item.id;
            const contentId = `faq-answer-${item.id}`;

            return (
              <article
                key={item.id}
                data-reveal-item
                className="border-b border-(--color-border)"
              >
                <h3>
                  <button
                    type="button"
                    aria-expanded={isOpen}
                    aria-controls={contentId}
                    onClick={() => setOpenQuestion(isOpen ? null : item.id)}
                    className="group flex w-full items-center justify-between gap-5 py-5 text-left outline-none focus-visible:ring-2 focus-visible:ring-(--color-accent-terracotta) focus-visible:ring-offset-2"
                  >
                    <span className="flex min-w-0 items-start gap-4">
                      <span className="pt-0.5 text-[10px] font-semibold tabular-nums text-(--color-accent-terracotta)">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <span
                        className={`text-[13px] font-semibold leading-6 transition-colors duration-200 sm:text-sm ${isOpen ? "text-(--color-accent-terracotta)" : "text-(--color-text-primary) group-hover:text-(--color-accent-terracotta)"}`}
                      >
                        {item.question}
                      </span>
                    </span>

                    <motion.span
                      animate={{ rotate: isOpen ? 180 : 0 }}
                      transition={{ duration: shouldReduceMotion ? 0 : 0.2 }}
                      className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-(--color-border) text-(--color-text-muted)"
                    >
                      <ChevronDown className="h-4 w-4" />
                    </motion.span>
                  </button>
                </h3>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      id={contentId}
                      initial={
                        shouldReduceMotion ? false : { height: 0, opacity: 0 }
                      }
                      animate={{ height: "auto", opacity: 1 }}
                      exit={
                        shouldReduceMotion
                          ? undefined
                          : { height: 0, opacity: 0 }
                      }
                      transition={{
                        duration: shouldReduceMotion ? 0 : 0.25,
                        ease: "easeInOut",
                      }}
                      className="overflow-hidden"
                    >
                      <p className="max-w-162.5 pb-5 pl-8 text-xs leading-[1.9] text-(--color-text-muted) sm:pl-10 sm:text-[13px]">
                        {item.answer}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </article>
            );
          })}
        </ScrollReveal>
      </div>
    </section>
  );
}
