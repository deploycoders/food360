"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "motion/react";

import { ORDER_MODALITIES } from "./capabilities-data";
import { ScrollReveal } from "./scroll-reveal";

export function OrderModalitiesSection() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <section
      id="como-funciona"
      className="border-t border-(--color-border) bg-(--color-bg-subtle) px-5 py-20 sm:px-8 sm:py-24 lg:px-14 lg:py-28"
    >
      <div className="mx-auto max-w-330">
        <ScrollReveal
          className="mb-12 grid gap-5 lg:grid-cols-[1fr_0.7fr] lg:items-end lg:gap-12"
          stagger={0.12}
        >
          <header data-reveal-item>
            <p className="text-[10px] font-bold uppercase tracking-[0.19em] text-(--color-accent-terracotta)">
              Modalidades de pedido
            </p>
            <h2 className="mt-4 max-w-170 text-[clamp(2rem,4vw,3.5rem)] font-bold leading-[1.1] tracking-[-0.06em] text-(--color-text-primary)">
              Una plataforma.{" "}
              <span className="font-serif font-medium italic text-(--color-accent-terracotta)">
                Distintas formas de atender.
              </span>
            </h2>
          </header>

          <p
            data-reveal-item
            className="max-w-112.5 text-sm leading-[1.9] text-(--color-text-muted) lg:justify-self-end"
          >
            Adapta la recepción de pedidos a la manera en que funciona tu
            restaurante y a las necesidades de tus comensales.
          </p>
        </ScrollReveal>

        <ScrollReveal
          className="grid gap-8 md:grid-cols-3 md:gap-6"
          stagger={0.14}
        >
          {ORDER_MODALITIES.map((modality) => {
            const Icon = modality.icon;

            return (
              <article
                key={modality.id}
                data-reveal-item
                className="group min-w-0"
              >
                <div className="relative aspect-5/4 overflow-hidden rounded-xl bg-(--color-bg-base)">
                  <motion.div
                    whileHover={
                      shouldReduceMotion ? undefined : { scale: 1.045 }
                    }
                    transition={{ duration: 0.55, ease: "easeOut" }}
                    className="absolute inset-0"
                  >
                    <Image
                      src={modality.image}
                      alt={modality.imageAlt}
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-cover"
                    />
                  </motion.div>

                  <span className="absolute left-4 top-4 text-[10px] font-semibold text-white drop-shadow-md">
                    {modality.number}
                  </span>
                </div>

                <div className="mt-5 flex items-start gap-3">
                  <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-(--color-border) bg-(--color-bg-surface) text-(--color-accent-terracotta)">
                    <Icon className="h-4 w-4" strokeWidth={1.7} />
                  </span>
                  <div className="min-w-0">
                    <h3 className="text-base font-bold tracking-tight text-(--color-text-primary) sm:text-lg">
                      {modality.title}
                    </h3>
                    <p className="mt-1 text-[10px] font-semibold text-(--color-accent-terracotta)">
                      {modality.subtitle}
                    </p>
                    <p className="mt-3 max-w-92.5 text-xs leading-[1.8] text-(--color-text-muted)">
                      {modality.description}
                    </p>
                  </div>
                </div>
              </article>
            );
          })}
        </ScrollReveal>
      </div>
    </section>
  );
}
