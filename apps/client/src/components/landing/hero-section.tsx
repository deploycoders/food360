"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { gsap } from "gsap";

import { HeroJourney } from "./hero/hero-journey";

export function HeroSection() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (
      !section ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    )
      return;

    const context = gsap.context(() => {
      const timeline = gsap.timeline({ defaults: { ease: "power3.out" } });

      timeline
        .fromTo(
          "[data-hero-eyebrow]",
          { autoAlpha: 0, y: 15 },
          { autoAlpha: 1, y: 0, duration: 0.55 },
        )
        .fromTo(
          "[data-hero-title]",
          { autoAlpha: 0, y: 30, filter: "blur(7px)" },
          { autoAlpha: 1, y: 0, filter: "blur(0px)", duration: 0.85 },
          "-=0.2",
        )
        .fromTo(
          "[data-hero-description]",
          { autoAlpha: 0, y: 18 },
          { autoAlpha: 1, y: 0, duration: 0.6 },
          "-=0.35",
        )
        .fromTo(
          "[data-hero-actions]",
          { autoAlpha: 0, y: 14 },
          { autoAlpha: 1, y: 0, duration: 0.55 },
          "-=0.25",
        );
    }, section);

    return () => context.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative overflow-x-clip bg-(--color-bg-base) px-5 py-14 sm:px-8 sm:py-16 lg:px-12 lg:py-20 xl:px-16"
    >
      <div className="mx-auto w-full max-w-330">
        <header className="mx-auto mb-10 max-w-212.5 text-center sm:mb-12">
          <p
            data-hero-eyebrow
            className="text-[10px] font-bold uppercase tracking-[0.19em] text-(--color-accent-terracotta) sm:text-[11px]"
          >
            La operación de tu restaurante, conectada de principio a fin
          </p>

          <h1
            data-hero-title
            className="mt-5 text-[clamp(2.7rem,5.4vw,5rem)] font-bold leading-[1.04] tracking-[-0.065em] text-(--color-text-primary)"
          >
            El recorrido de{" "}
            <span className="font-serif font-medium italic tracking-[-0.045em] text-(--color-accent-terracotta)">
              un pedido.
            </span>
          </h1>

          <p
            data-hero-description
            className="mx-auto mt-5 max-w-155 text-sm leading-[1.85] text-(--color-text-muted) sm:text-base"
          >
            Food360 conecta la experiencia del comensal con el trabajo de tu
            equipo, desde la carta digital hasta la entrega del pedido.
          </p>
        </header>

        <div className="mx-auto w-full max-w-295">
          <HeroJourney />
        </div>

        <div
          data-hero-actions
          className="mt-8 flex items-center justify-center gap-3 flex-row"
        >
          <Link
            href="/demo"
            className="group inline-flex h-11 items-center justify-center gap-3 rounded-md bg-(--color-accent-terracotta) px-4 sm:px-6 text-[11px] sm:text-[12px] font-semibold text-white transition-[transform,background-color,box-shadow] duration-200 ease-out hover:-translate-y-0.5 hover:bg-(--color-accent-terracotta-hover) hover:shadow-[0_8px_22px_-12px_var(--color-accent-terracotta)] active:translate-y-0 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--color-accent-terracotta) focus-visible:ring-offset-2"
          >
            Explorar Food360
            <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
          </Link>

          <a
            href="#producto"
            className="inline-flex h-11 items-center justify-center rounded-md border border-(--color-border) bg-(--color-bg-surface) px-4 sm:px-6 text-[11px] sm:text-[12px] font-semibold text-(--color-text-primary) transition-colors duration-200 hover:border-(--color-accent-terracotta) hover:text-(--color-accent-terracotta) focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--color-accent-terracotta) focus-visible:ring-offset-2"
          >
            Conocer la plataforma
          </a>
        </div>
      </div>
    </section>
  );
}
