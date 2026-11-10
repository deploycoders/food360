"use client";

import { motion, useReducedMotion } from "motion/react";
import type { JourneyStep } from "./journey-data";

interface JourneyNodeProps {
  step: JourneyStep;
  status: "upcoming" | "active" | "completed";
  onSelect: (step: JourneyStep) => void;
}

export function JourneyNode({ step, status, onSelect }: JourneyNodeProps) {
  const shouldReduceMotion = useReducedMotion();
  const Icon = step.icon;
  const active = status === "active";
  const completed = status === "completed";

  return (
    <div className="relative z-10 flex min-w-0 justify-center">
      <motion.button
        type="button"
        data-journey-node
        onClick={() => onSelect(step)}
        aria-pressed={active}
        aria-label={`${step.number}. ${step.label}: ${step.title}`}
        whileHover={shouldReduceMotion ? undefined : { y: -3 }}
        whileTap={shouldReduceMotion ? undefined : { scale: 0.96 }}
        transition={{ type: "spring", stiffness: 380, damping: 24 }}
        className="group flex w-full min-w-0 flex-col items-center gap-1.5 rounded-lg px-0.5 py-1.5 outline-none focus-visible:ring-2 focus-visible:ring-(--color-accent-terracotta) focus-visible:ring-offset-2"
      >
        <motion.span
          animate={{ scale: active ? 1.08 : 1 }}
          transition={{ duration: shouldReduceMotion ? 0 : 0.25 }}
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border transition-[background-color,border-color,color,box-shadow] duration-300 sm:h-12 sm:w-12 ${active ? "border-(--color-accent-terracotta) bg-(--color-accent-terracotta-light) text-(--color-accent-terracotta) shadow-[0_0_0_4px_var(--color-accent-terracotta-light)]" : completed ? "border-(--color-accent-terracotta)/40 bg-(--color-accent-terracotta-light) text-(--color-accent-terracotta)" : "border-(--color-border) bg-(--color-bg-surface) text-(--color-text-muted) group-hover:border-(--color-accent-terracotta) group-hover:text-(--color-accent-terracotta)"}`}
        >
          <Icon
            className="h-4.25 w-4.25 sm:h-4.75 sm:w-4.75"
            strokeWidth={1.7}
          />
        </motion.span>
        <span
          className={`whitespace-nowrap text-[8px] font-semibold transition-colors duration-200 sm:text-[10px] ${active ? "text-(--color-accent-terracotta)" : completed ? "text-(--color-text-primary)" : "text-(--color-text-muted)"}`}
        >
          {step.label}
        </span>
        <span className="text-[8px] font-medium tracking-wider text-(--color-text-subtle)">
          {step.number}
        </span>
      </motion.button>
    </div>
  );
}
