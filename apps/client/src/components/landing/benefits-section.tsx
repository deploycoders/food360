"use client";

import { useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import {
  ArrowUpRight,
  BookOpen,
  Boxes,
  ChefHat,
  ShoppingBag,
  Users,
} from "lucide-react";

import { CAPABILITIES } from "./capabilities-data";
import { ScrollReveal } from "./scroll-reveal";

export function BenefitsSection() {
  const [activeId, setActiveId] = useState("orders");
  const shouldReduceMotion = useReducedMotion();

  const activeCapability =
    CAPABILITIES.find((item) => item.id === activeId) ?? CAPABILITIES[0];

  const ActiveIcon =
    activeCapability.id === "orders"
      ? ShoppingBag
      : activeCapability.id === "menu"
        ? BookOpen
        : activeCapability.id === "kitchen"
          ? ChefHat
          : Boxes;

  return (
    <section
      id="producto"
      className="border-t border-(--color-border) bg-(--color-bg-base) px-5 py-20 sm:px-8 sm:py-24 lg:px-14 lg:py-28"
    >
      <div className="mx-auto max-w-330">
        <ScrollReveal
          className="mb-12 grid gap-5 lg:grid-cols-[1.1fr_0.9fr] lg:items-end lg:gap-16"
          stagger={0.12}
        >
          <header
            id="funcionalidades"
            data-reveal-item
            className="scroll-mt-24"
          >
            <p className="text-[10px] font-bold uppercase tracking-[0.19em] text-(--color-accent-terracotta)">
              La plataforma
            </p>
            <h2 className="mt-4 max-w-175 text-[clamp(2.1rem,4.5vw,4rem)] font-bold leading-[1.08] tracking-[-0.06em] text-(--color-text-primary)">
              Todo lo que sucede en tu restaurante,{" "}
              <span className="font-serif font-medium italic text-(--color-accent-terracotta)">
                desde un mismo lugar.
              </span>
            </h2>
          </header>

          <p
            data-reveal-item
            className="max-w-117.5 text-sm leading-[1.9] text-(--color-text-muted) lg:justify-self-end"
          >
            Food360 reúne las herramientas necesarias para organizar la atención
            de tus clientes y el trabajo diario de tu equipo.
          </p>
        </ScrollReveal>

        <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,0.82fr)_minmax(0,1.18fr)] lg:gap-16">
          <ScrollReveal className="min-w-0" stagger={0.09}>
            <div className="border-t border-(--color-border)">
              {CAPABILITIES.map((item) => {
                const selected = item.id === activeId;

                return (
                  <button
                    key={item.id}
                    data-reveal-item
                    type="button"
                    onClick={() => setActiveId(item.id)}
                    aria-pressed={selected}
                    className={`group grid w-full grid-cols-[34px_minmax(0,1fr)_20px] items-start gap-3 border-b border-(--color-border) py-5 text-left transition-colors duration-200 sm:grid-cols-[42px_minmax(0,1fr)_22px] sm:gap-4 ${selected ? "text-(--color-text-primary)" : "text-(--color-text-muted) hover:text-(--color-text-primary)"}`}
                  >
                    <span
                      className={`pt-1 text-[10px] font-semibold tabular-nums ${selected ? "text-(--color-accent-terracotta)" : "text-(--color-text-subtle)"}`}
                    >
                      {item.number}
                    </span>

                    <span className="min-w-0">
                      <span className="block text-[15px] font-bold tracking-tight sm:text-[17px]">
                        {item.title}
                      </span>
                      <span className="mt-1 block text-[11px] leading-6 text-(--color-text-muted) sm:text-xs">
                        {item.summary}
                      </span>

                      <AnimatePresence initial={false}>
                        {selected && (
                          <motion.span
                            initial={
                              shouldReduceMotion
                                ? false
                                : { opacity: 0, height: 0 }
                            }
                            animate={{ opacity: 1, height: "auto" }}
                            exit={
                              shouldReduceMotion
                                ? undefined
                                : { opacity: 0, height: 0 }
                            }
                            transition={{
                              duration: shouldReduceMotion ? 0 : 0.25,
                            }}
                            className="block overflow-hidden"
                          >
                            <span className="mt-3 block max-w-110 text-[11px] leading-[1.8] text-(--color-text-muted) sm:text-xs">
                              {item.description}
                            </span>
                            <span className="mt-3 block text-[9px] font-semibold tracking-wide text-(--color-accent-terracotta)">
                              {item.detail}
                            </span>
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </span>

                    <ArrowUpRight
                      className={`mt-1 h-4 w-4 transition-all duration-200 ${selected ? "translate-x-0 text-(--color-accent-terracotta)" : "-translate-x-1 text-(--color-text-subtle) opacity-0 group-hover:translate-x-0 group-hover:opacity-100"}`}
                    />
                  </button>
                );
              })}
            </div>
          </ScrollReveal>

          <ScrollReveal className="min-w-0" delay={0.12}>
            <div data-reveal-item>
              <div className="overflow-hidden rounded-2xl border border-(--color-border) bg-(--color-bg-surface)">
                <div className="relative aspect-[1.12/1] overflow-hidden bg-(--color-bg-subtle) sm:aspect-[1.45/1]">
                  <AnimatePresence mode="wait" initial={false}>
                    <motion.div
                      key={activeCapability.id}
                      initial={
                        shouldReduceMotion
                          ? false
                          : { opacity: 0, scale: 1.025 }
                      }
                      animate={{ opacity: 1, scale: 1 }}
                      exit={
                        shouldReduceMotion
                          ? undefined
                          : { opacity: 0, scale: 0.99 }
                      }
                      transition={{
                        duration: shouldReduceMotion ? 0 : 0.35,
                        ease: "easeOut",
                      }}
                      className="absolute inset-0"
                    >
                      {activeCapability.image ? (
                        <Image
                          src={activeCapability.image}
                          alt={activeCapability.imageAlt}
                          fill
                          sizes="(max-width: 1024px) 100vw, 60vw"
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex h-full flex-col items-center justify-center bg-(--color-bg-subtle) p-8">
                          <div className="flex items-center gap-5 sm:gap-8">
                            <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-(--color-border) bg-(--color-bg-surface) text-(--color-text-muted) sm:h-20 sm:w-20">
                              <Boxes
                                className="h-7 w-7 sm:h-9 sm:w-9"
                                strokeWidth={1.4}
                              />
                            </div>
                            <div className="flex flex-col gap-3">
                              <div className="flex h-11 w-36 items-center gap-3 rounded-lg border border-(--color-border) bg-(--color-bg-surface) px-3 sm:w-44">
                                <Users className="h-4 w-4 text-(--color-accent-terracotta)" />
                                <span className="text-[10px] font-semibold text-(--color-text-primary)">
                                  Personal
                                </span>
                              </div>
                              <div className="flex h-11 w-36 items-center gap-3 rounded-lg border border-(--color-border) bg-(--color-bg-surface) px-3 sm:w-44">
                                <Boxes className="h-4 w-4 text-(--color-accent-terracotta)" />
                                <span className="text-[10px] font-semibold text-(--color-text-primary)">
                                  Existencias
                                </span>
                              </div>
                            </div>
                          </div>
                          <p className="mt-7 text-[10px] font-medium tracking-wide text-(--color-text-muted)">
                            Organización interna del restaurante
                          </p>
                        </div>
                      )}
                    </motion.div>
                  </AnimatePresence>
                </div>

                <div className="flex items-start gap-3 border-t border-(--color-border) px-4 py-4 sm:px-5 sm:py-5">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-(--color-accent-terracotta-light) text-(--color-accent-terracotta)">
                    <ActiveIcon className="h-4 w-4" strokeWidth={1.7} />
                  </span>
                  <div className="min-w-0">
                    <p className="text-[12px] font-bold text-(--color-text-primary) sm:text-sm">
                      {activeCapability.title}
                    </p>
                    <p className="mt-1 text-[10px] leading-5 text-(--color-text-muted) sm:text-[11px]">
                      {activeCapability.visualTitle}
                    </p>
                  </div>
                </div>
              </div>
              <p className="mt-3 text-right text-[9px] text-(--color-text-subtle)">
                Fotografías ilustrativas de la carta de demostración.
              </p>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
