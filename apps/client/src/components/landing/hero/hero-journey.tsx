"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ArrowDown, ArrowRight } from "lucide-react";
import { gsap } from "gsap";

import { JourneyNode } from "./journey-node";
import {
  journeySequence,
  journeyTracks,
  type JourneyStep,
  type JourneyStepId,
  type JourneyTrack,
} from "./journey-data";

interface JourneyTrackPanelProps {
  track: JourneyTrack;
  activeStepId: JourneyStepId;
  activeSequenceIndex: number;
  onSelect: (step: JourneyStep) => void;
}

function getTrackProgress(track: JourneyTrack, activeStepId: JourneyStepId) {
  const currentIndex = track.steps.findIndex(
    (step) => step.id === activeStepId,
  );

  if (currentIndex >= 0) return currentIndex / (track.steps.length - 1);
  if (track.id === "customer") return 2 / (track.steps.length - 1);

  return 0;
}

function JourneyTrackPanel({
  track,
  activeStepId,
  activeSequenceIndex,
  onSelect,
}: JourneyTrackPanelProps) {
  const inset = `${50 / track.steps.length}%`;
  const progress = getTrackProgress(track, activeStepId);

  return (
    <section
      data-journey-panel
      className="min-w-0 rounded-2xl border border-(--color-border) bg-(--color-bg-surface) p-4 sm:p-6"
    >
      <div className="flex items-center justify-between gap-2">
        <div className="min-w-0">
          <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-(--color-accent-terracotta) sm:text-[10px]">
            {track.eyebrow}
          </p>
          <h2 className="mt-1.5 text-sm font-bold tracking-tight text-(--color-text-primary) sm:text-base">
            {track.title}
          </h2>
        </div>
        <span className="shrink-0 text-[9px] font-semibold tracking-wider text-(--color-text-subtle)">
          {track.id === "customer" ? "CLIENT" : "ADMIN"}
        </span>
      </div>

      <div
        className="relative mt-5 grid gap-0.5"
        style={{
          gridTemplateColumns: `repeat(${track.steps.length}, minmax(0, 1fr))`,
        }}
      >
        <div
          aria-hidden="true"
          className="absolute top-5 h-px bg-(--color-border) sm:top-6"
          style={{ left: inset, right: inset }}
        >
          <span
            data-track-progress={track.id}
            className="absolute inset-0 origin-left rounded-full bg-(--color-accent-terracotta)"
            style={{ transform: "scaleX(0)" }}
          />
        </div>

        {track.steps.map((step) => {
          const stepIndex = journeySequence.indexOf(step.id);
          const status =
            step.id === activeStepId
              ? "active"
              : stepIndex < activeSequenceIndex
                ? "completed"
                : "upcoming";

          return (
            <JourneyNode
              key={step.id}
              step={step}
              status={status}
              onSelect={onSelect}
            />
          );
        })}
      </div>
    </section>
  );
}

export function HeroJourney() {
  const rootRef = useRef<HTMLDivElement>(null);
  const sequenceRef = useRef<gsap.core.Timeline | null>(null);
  const resumeTweenRef = useRef<gsap.core.Tween | null>(null);
  const pointerInsideRef = useRef(false);
  const focusInsideRef = useRef(false);

  const shouldReduceMotion = useReducedMotion();
  const [activeStepId, setActiveStepId] = useState<JourneyStepId>("access");

  const activeStep =
    journeyTracks
      .flatMap((track) => track.steps)
      .find((step) => step.id === activeStepId) ?? journeyTracks[0].steps[0];
  const activeTrack =
    journeyTracks.find((track) =>
      track.steps.some((step) => step.id === activeStepId),
    ) ?? journeyTracks[0];
  const activeSequenceIndex = journeySequence.indexOf(activeStepId);
  const ActiveIcon = activeStep.icon;

  const customerProgress = getTrackProgress(journeyTracks[0], activeStepId);
  const restaurantProgress = getTrackProgress(journeyTracks[1], activeStepId);

  const handleSelectStep = (step: JourneyStep) => {
    setActiveStepId(step.id);

    const timeline = sequenceRef.current;
    if (!timeline || shouldReduceMotion) return;

    timeline.pause();
    resumeTweenRef.current?.kill();
    resumeTweenRef.current = gsap.delayedCall(4.5, () => {
      if (!pointerInsideRef.current && !focusInsideRef.current)
        timeline.resume();
    });
  };

  useEffect(() => {
    const root = rootRef.current;
    if (!root || shouldReduceMotion) return;

    let started = false;

    const context = gsap.context(() => {
      const intro = gsap.timeline();
      const sequence = gsap.timeline({
        paused: true,
        repeat: -1,
        repeatDelay: 0.8,
      });

      journeySequence.forEach((stepId, index) => {
        sequence.call(() => setActiveStepId(stepId), [], index * 1.7);
      });

      sequence.to({}, { duration: 1.7 });
      sequenceRef.current = sequence;

      intro
        .fromTo(
          "[data-journey-heading]",
          { autoAlpha: 0, y: 24, filter: "blur(7px)" },
          { autoAlpha: 1, y: 0, filter: "blur(0px)", duration: 0.75 },
        )
        .fromTo(
          "[data-journey-panel]",
          { autoAlpha: 0, y: 28 },
          { autoAlpha: 1, y: 0, duration: 0.75, stagger: 0.18 },
          "-=0.25",
        )
        .fromTo(
          "[data-journey-node]",
          { autoAlpha: 0, y: 17, scale: 0.82 },
          {
            autoAlpha: 1,
            y: 0,
            scale: 1,
            duration: 0.55,
            stagger: 0.055,
            ease: "back.out(1.5)",
          },
          "-=0.3",
        )
        .fromTo(
          "[data-journey-connector]",
          { autoAlpha: 0, scale: 0.85 },
          { autoAlpha: 1, scale: 1, duration: 0.4 },
          "-=0.2",
        )
        .fromTo(
          "[data-journey-detail]",
          { autoAlpha: 0, y: 14 },
          { autoAlpha: 1, y: 0, duration: 0.55 },
          "-=0.1",
        )
        .eventCallback("onComplete", () => {
          started = true;
          if (!pointerInsideRef.current && !focusInsideRef.current)
            sequence.play(0);
        });
    }, root);

    const canHover = window.matchMedia(
      "(hover: hover) and (pointer: fine)",
    ).matches;

    const handlePointerEnter = () => {
      pointerInsideRef.current = true;
      sequenceRef.current?.pause();
    };

    const handlePointerLeave = () => {
      pointerInsideRef.current = false;
      resumeTweenRef.current?.kill();

      if (!focusInsideRef.current && started) sequenceRef.current?.resume();
    };

    const handleFocusIn = () => {
      focusInsideRef.current = true;
      sequenceRef.current?.pause();
    };

    const handleFocusOut = (event: FocusEvent) => {
      const nextTarget = event.relatedTarget;

      if (nextTarget instanceof Node && root.contains(nextTarget)) return;

      focusInsideRef.current = false;
      if (!pointerInsideRef.current && started) sequenceRef.current?.resume();
    };

    if (canHover) {
      root.addEventListener("pointerenter", handlePointerEnter);
      root.addEventListener("pointerleave", handlePointerLeave);
    }

    root.addEventListener("focusin", handleFocusIn);
    root.addEventListener("focusout", handleFocusOut);

    return () => {
      root.removeEventListener("pointerenter", handlePointerEnter);
      root.removeEventListener("pointerleave", handlePointerLeave);
      root.removeEventListener("focusin", handleFocusIn);
      root.removeEventListener("focusout", handleFocusOut);

      resumeTweenRef.current?.kill();
      sequenceRef.current?.kill();
      sequenceRef.current = null;

      pointerInsideRef.current = false;
      focusInsideRef.current = false;

      context.revert();
    };
  }, [shouldReduceMotion]);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const customerLine = root.querySelector<HTMLElement>(
      '[data-track-progress="customer"]',
    );
    const restaurantLine = root.querySelector<HTMLElement>(
      '[data-track-progress="restaurant"]',
    );

    if (shouldReduceMotion) {
      if (customerLine) gsap.set(customerLine, { scaleX: customerProgress });
      if (restaurantLine)
        gsap.set(restaurantLine, { scaleX: restaurantProgress });
      return;
    }

    if (customerLine)
      gsap.to(customerLine, {
        scaleX: customerProgress,
        duration: 0.7,
        ease: "power2.inOut",
        overwrite: true,
      });
    if (restaurantLine)
      gsap.to(restaurantLine, {
        scaleX: restaurantProgress,
        duration: 0.7,
        ease: "power2.inOut",
        overwrite: true,
      });

    return () => {
      if (customerLine) gsap.killTweensOf(customerLine);
      if (restaurantLine) gsap.killTweensOf(restaurantLine);
    };
  }, [customerProgress, restaurantProgress, shouldReduceMotion]);

  return (
    <div ref={rootRef} className="w-full">
      <div
        data-journey-heading
        className="mb-5 flex items-center justify-between gap-3"
      >
        <p className="text-[10px] font-semibold text-(--color-text-muted)">
          Un proceso conectado de principio a fin
        </p>
        <p className="text-[9px] font-medium tracking-wide text-(--color-text-subtle)">
          RECORRIDO ILUSTRATIVO
        </p>
      </div>

      <div className="grid grid-cols-1 items-stretch gap-3 lg:grid-cols-[minmax(0,1fr)_36px_minmax(0,1fr)] lg:gap-4">
        <JourneyTrackPanel
          track={journeyTracks[0]}
          activeStepId={activeStepId}
          activeSequenceIndex={activeSequenceIndex}
          onSelect={handleSelectStep}
        />

        <div
          data-journey-connector
          className="flex items-center justify-center text-(--color-accent-terracotta)"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-full border border-(--color-border) bg-(--color-bg-surface)">
            <ArrowRight className="hidden h-4 w-4 lg:block" />
            <ArrowDown className="h-4 w-4 lg:hidden" />
          </span>
        </div>

        <JourneyTrackPanel
          track={journeyTracks[1]}
          activeStepId={activeStepId}
          activeSequenceIndex={activeSequenceIndex}
          onSelect={handleSelectStep}
        />
      </div>

      <div
        data-journey-detail
        className="mt-4 flex min-h-27 items-start gap-3 rounded-xl border border-(--color-border) bg-(--color-bg-surface) p-4 sm:items-center sm:px-5"
      >
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-(--color-accent-terracotta-light) text-(--color-accent-terracotta)">
          <ActiveIcon className="h-4.5 w-4.5" />
        </span>

        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={activeStep.id}
            initial={shouldReduceMotion ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={shouldReduceMotion ? undefined : { opacity: 0, y: -6 }}
            transition={{
              duration: shouldReduceMotion ? 0 : 0.22,
              ease: "easeOut",
            }}
            className="min-w-0 flex-1"
          >
            <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-(--color-accent-terracotta)">
              {activeTrack.eyebrow} · PASO {activeStep.number}
            </p>
            <h3 className="mt-1 text-sm font-bold tracking-tight text-(--color-text-primary)">
              {activeStep.title}
            </h3>
            <p className="mt-1 text-[10px] leading-[1.7] text-(--color-text-muted) sm:text-[11px]">
              {activeStep.description}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
