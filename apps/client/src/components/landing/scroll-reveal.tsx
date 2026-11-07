"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

interface ScrollRevealProps {
  children: ReactNode;
  className?: string;
  stagger?: number;
  delay?: number;
}

export function ScrollReveal({
  children,
  className = "",
  stagger = 0.09,
  delay = 0,
}: ScrollRevealProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;

    if (!container) return;

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (reducedMotion) return;

    const context = gsap.context(() => {
      const elements = container.querySelectorAll("[data-reveal-item]");

      if (!elements.length) return;

      gsap.fromTo(
        elements,
        {
          autoAlpha: 0,
          y: 20,
        },
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.65,
          delay,
          stagger,
          ease: "power3.out",
          clearProps: "transform,opacity,visibility",
          scrollTrigger: {
            trigger: container,
            start: "top 88%",
            once: true,
          },
        },
      );
    }, container);

    return () => {
      context.revert();
    };
  }, [delay, stagger]);

  return (
    <div ref={containerRef} className={className}>
      {children}
    </div>
  );
}
