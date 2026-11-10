"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import {
  AnimatePresence,
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
} from "motion/react";
import { useTheme } from "@food360/theme";
import { ArrowRight, Flame, Menu, Moon, Sun, X } from "lucide-react";

const links = [
  { label: "Inicio", href: "#inicio" },
  { label: "Funcionalidades", href: "#funcionalidades" },
  { label: "Cómo funciona", href: "#como-funciona" },
  { label: "Preguntas frecuentes", href: "#preguntas-frecuentes" },
];

export function LandingNavbar() {
  const [isHidden, setIsHidden] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const lastScrollY = useRef(0);
  const accumulatedScroll = useRef(0);
  const hasInitializedScroll = useRef(false);

  const { scrollY } = useScroll();
  const { resolvedTheme, setTheme } = useTheme();
  const shouldReduceMotion = useReducedMotion();

  const isDark = resolvedTheme === "dark";

  useMotionValueEvent(scrollY, "change", (current) => {
    if (!hasInitializedScroll.current) {
      lastScrollY.current = current;
      hasInitializedScroll.current = true;

      if (current > 80) {
        setIsHidden(true);
      }

      return;
    }

    const delta = current - lastScrollY.current;
    lastScrollY.current = current;

    if (current <= 80) {
      accumulatedScroll.current = 0;
      setIsHidden(false);
      return;
    }

    if (Math.sign(delta) !== Math.sign(accumulatedScroll.current)) {
      accumulatedScroll.current = 0;
    }

    accumulatedScroll.current += delta;

    if (accumulatedScroll.current > 14) {
      setIsHidden(true);
      setIsMenuOpen(false);
      accumulatedScroll.current = 0;
    }

    if (accumulatedScroll.current < -14) {
      setIsHidden(false);
      accumulatedScroll.current = 0;
    }
  });

  const closeMenu = () => setIsMenuOpen(false);

  const toggleTheme = () => {
    setTheme(isDark ? "light" : "dark");
  };

  return (
    <motion.header
      initial={false}
      animate={{ y: isHidden ? "-100%" : "0%" }}
      transition={{
        duration: shouldReduceMotion ? 0 : 0.28,
        ease: [0.22, 1, 0.36, 1],
      }}
      aria-hidden={isHidden}
      inert={isHidden}
      className="sticky top-0 z-50 w-full border-b border-(--color-border) bg-(--color-bg-base)/90 backdrop-blur-xl"
    >
      <nav
        aria-label="Navegación principal"
        className="mx-auto flex h-16 w-full max-w-330 items-center justify-between px-5 sm:px-8 lg:px-14"
      >
        <Link
          href="/"
          aria-label="Food360, volver al inicio"
          className="group flex shrink-0 items-center gap-2.5 rounded-xl focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-(--color-accent-terracotta)"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-(--color-accent-terracotta) text-white transition-transform duration-200 group-hover:scale-105">
            <Flame className="h-5 w-5 fill-white/20" strokeWidth={1.8} />
          </span>

          <span className="font-sans text-xl font-extrabold tracking-tight text-(--color-text-primary)">
            food<span className="text-(--color-accent-terracotta)">360</span>
          </span>
        </Link>

        <div className="hidden h-full items-center gap-6 lg:flex xl:gap-8">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="relative flex h-full items-center text-xs font-semibold text-(--color-text-muted) transition-colors duration-200 hover:text-(--color-text-primary) focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-(--color-accent-terracotta) after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:origin-left after:scale-x-0 after:bg-(--color-accent-terracotta) after:transition-transform after:duration-200 hover:after:scale-x-100"
            >
              {link.label}
            </a>
          ))}
        </div>

        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={toggleTheme}
            aria-label={`Cambiar a modo ${isDark ? "claro" : "oscuro"}`}
            aria-pressed={isDark}
            title={`Cambiar a modo ${isDark ? "claro" : "oscuro"}`}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-(--color-border) bg-(--color-bg-surface) text-(--color-text-primary) transition-colors hover:border-(--color-accent-terracotta) hover:bg-(--color-bg-subtle) focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-(--color-accent-terracotta)"
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={isDark ? "sun" : "moon"}
                initial={{ opacity: 0, rotate: -30, scale: 0.8 }}
                animate={{ opacity: 1, rotate: 0, scale: 1 }}
                exit={{ opacity: 0, rotate: 30, scale: 0.8 }}
                transition={{ duration: shouldReduceMotion ? 0 : 0.15 }}
                className="flex items-center justify-center"
              >
                {isDark ? (
                  <Sun className="h-4 w-4" strokeWidth={1.8} />
                ) : (
                  <Moon className="h-4 w-4" strokeWidth={1.8} />
                )}
              </motion.span>
            </AnimatePresence>
          </button>

          <a
            href="#solicitar-demo"
            className="group inline-flex h-9 items-center justify-center gap-2 rounded-xl bg-(--color-accent-terracotta) px-3.5 text-xs font-bold text-white transition-colors duration-200 hover:bg-(--color-accent-terracotta-hover) focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-(--color-accent-terracotta) sm:px-4"
          >
            <span className="sm:hidden">Demo</span>
            <span className="hidden sm:inline">Solicitar demo</span>
            <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
          </a>

          <button
            type="button"
            aria-label={isMenuOpen ? "Cerrar menú" : "Abrir menú"}
            aria-expanded={isMenuOpen}
            aria-controls="mobile-navigation"
            onClick={() => setIsMenuOpen((previous) => !previous)}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-(--color-border) bg-(--color-bg-surface) text-(--color-text-primary) transition-colors hover:bg-(--color-bg-subtle) focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-(--color-accent-terracotta) lg:hidden"
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={isMenuOpen ? "close" : "open"}
                initial={{ opacity: 0, rotate: -45, scale: 0.8 }}
                animate={{ opacity: 1, rotate: 0, scale: 1 }}
                exit={{ opacity: 0, rotate: 45, scale: 0.8 }}
                transition={{ duration: shouldReduceMotion ? 0 : 0.15 }}
                className="flex items-center justify-center"
              >
                {isMenuOpen ? (
                  <X className="h-5 w-5" />
                ) : (
                  <Menu className="h-5 w-5" />
                )}
              </motion.span>
            </AnimatePresence>
          </button>
        </div>
      </nav>

      <AnimatePresence initial={false}>
        {isMenuOpen && (
          <motion.div
            id="mobile-navigation"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{
              duration: shouldReduceMotion ? 0 : 0.22,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="overflow-hidden border-t border-(--color-border) bg-(--color-bg-base) lg:hidden"
          >
            <div className="mx-auto flex w-full max-w-330 flex-col gap-1 px-5 py-3 sm:px-8">
              {links.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={closeMenu}
                  className="rounded-xl px-3 py-3 text-sm font-semibold text-(--color-text-body) transition-colors hover:bg-(--color-bg-subtle) hover:text-(--color-accent-terracotta) focus-visible:outline-2 focus-visible:outline-(--color-accent-terracotta)"
                >
                  {link.label}
                </a>
              ))}

              <a
                href="#solicitar-demo"
                onClick={closeMenu}
                className="mt-2 flex min-h-11 items-center justify-center gap-2 rounded-xl bg-(--color-accent-terracotta) px-4 text-sm font-bold text-white transition-colors hover:bg-(--color-accent-terracotta-hover)"
              >
                Solicitar una demo
                <ArrowRight className="h-4 w-4" />
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
