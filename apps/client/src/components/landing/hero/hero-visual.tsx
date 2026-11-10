"use client";

import { useEffect, useRef } from "react";
import {
    ChefHat,
    ClipboardList,
    Smartphone,
    ShoppingBag,
    Utensils,
    type LucideIcon,
} from "lucide-react";
import { gsap } from "gsap";

interface FloatingItem {
    label: string;
    Icon: LucideIcon;
    position: string;
}

const floatingItems: FloatingItem[] = [
    {
        label: "Menú digital",
        Icon: Smartphone,
        position: "left-0 top-[20%]",
    },
    {
        label: "Nueva comanda",
        Icon: ClipboardList,
        position: "right-0 top-[37%]",
    },
    {
        label: "Cocina",
        Icon: ChefHat,
        position: "left-[2%] bottom-[12%]",
    },
    {
        label: "Gestión de pedidos",
        Icon: ShoppingBag,
        position: "right-[1%] bottom-[13%]",
    },
    {
        label: "Carta gastronómica",
        Icon: Utensils,
        position: "left-[38%] top-[1%]",
    },
];

export function HeroVisual() {
    const sceneRef = useRef<HTMLDivElement>(null);
    const tiltRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const scene = sceneRef.current;
        const tiltCard = tiltRef.current;

        if (!scene || !tiltCard) return;

        const reducedMotion = window.matchMedia(
            "(prefers-reduced-motion: reduce)",
        ).matches;

        const context = gsap.context(() => {
            const items = gsap.utils.toArray<HTMLElement>(
                "[data-hero-float]",
            );

            if (reducedMotion) {
                gsap.set(items, { autoAlpha: 0 });
                return;
            }

            // Aparición inicial de la interfaz principal.
            gsap.fromTo(
                "[data-hero-main]",
                {
                    autoAlpha: 0,
                    y: 20,
                    scale: 0.97,
                },
                {
                    autoAlpha: 1,
                    y: 0,
                    scale: 1,
                    duration: 0.9,
                    delay: 0.2,
                    ease: "power3.out",
                },
            );

            // Los elementos aparecen de forma escalonada.
            // Se utilizan posiciones fijas para evitar colisiones.
            const floatingTimeline = gsap.timeline({
                repeat: -1,
                repeatDelay: 0.6,
            });

            items.forEach((item, index) => {
                const position = index * 1.05;

                floatingTimeline.fromTo(
                    item,
                    {
                        autoAlpha: 0,
                        y: 22,
                        scale: 0.84,
                        rotation: -7,
                    },
                    {
                        autoAlpha: 1,
                        y: 0,
                        scale: 1,
                        rotation: 0,
                        duration: 0.45,
                        ease: "back.out(1.5)",
                    },
                    position,
                );

                floatingTimeline.to(
                    item,
                    {
                        autoAlpha: 0,
                        y: -15,
                        scale: 0.94,
                        rotation: 4,
                        duration: 0.35,
                        ease: "power2.in",
                    },
                    position + 1.35,
                );
            });
        }, scene);

        // Efecto de profundidad controlado por el puntero.
        const canHover = window.matchMedia(
            "(hover: hover) and (pointer: fine)",
        ).matches;

        let handlePointerMove: ((event: PointerEvent) => void) | null =
            null;
        let handlePointerLeave: (() => void) | null = null;

        if (!reducedMotion && canHover) {
            gsap.set(tiltCard, {
                transformPerspective: 1100,
                transformOrigin: "center center",
            });

            const moveX = gsap.quickTo(tiltCard, "x", {
                duration: 0.65,
                ease: "power3.out",
            });

            const moveY = gsap.quickTo(tiltCard, "y", {
                duration: 0.65,
                ease: "power3.out",
            });

            const rotateX = gsap.quickTo(tiltCard, "rotationX", {
                duration: 0.65,
                ease: "power3.out",
            });

            const rotateY = gsap.quickTo(tiltCard, "rotationY", {
                duration: 0.65,
                ease: "power3.out",
            });

            handlePointerMove = (event: PointerEvent) => {
                const rect = scene.getBoundingClientRect();

                if (!rect.width || !rect.height) return;

                const x = (event.clientX - rect.left) / rect.width - 0.5;
                const y = (event.clientY - rect.top) / rect.height - 0.5;

                moveX(x * 9);
                moveY(y * 7);
                rotateX(y * -3.5);
                rotateY(x * 4.5);
            };

            handlePointerLeave = () => {
                moveX(0);
                moveY(0);
                rotateX(0);
                rotateY(0);
            };

            scene.addEventListener("pointermove", handlePointerMove);
            scene.addEventListener("pointerleave", handlePointerLeave);
        }

        return () => {
            if (handlePointerMove) {
                scene.removeEventListener("pointermove", handlePointerMove);
            }

            if (handlePointerLeave) {
                scene.removeEventListener("pointerleave", handlePointerLeave);
            }

            gsap.killTweensOf(tiltCard);
            context.revert();
        };
    }, []);

    return (
        <div
            ref={sceneRef}
            aria-hidden="true"
            className="
        relative mx-auto w-full max-w-160
        min-h-97.5
        select-none
        sm:aspect-[1.08/1] sm:min-h-0
      "
        >
            {/* Líneas ambientales */}
            <div className="pointer-events-none absolute left-1/2 top-1/2 aspect-square w-[88%] -translate-x-1/2 -translate-y-1/2 rounded-full border border-(--color-border-subtle)" />

            <div className="pointer-events-none absolute left-1/2 top-1/2 aspect-square w-[70%] -translate-x-1/2 -translate-y-1/2 rounded-full border border-dashed border-(--color-border-subtle)" />

            <div className="pointer-events-none absolute bottom-[12%] left-[15%] h-px w-[70%] bg-(--color-border-subtle)" />

            {/* Interfaz principal */}
            <div
                ref={tiltRef}
                className="
          absolute left-[9%] top-[19%] z-10
          w-[82%]
          sm:left-[13%] sm:w-[74%]
          transform-3d
          will-change-transform
        "
            >
                <div
                    data-hero-main
                    className="
            rounded-[22px]
            border border-(--color-border)
            bg-(--color-bg-surface)
            p-4
            shadow-[0_28px_75px_-34px_var(--color-forest-light)]
            sm:rounded-[26px] sm:p-5
          "
                >
                    {/* Encabezado */}
                    <div className="flex items-center justify-between border-b border-(--color-border-subtle) pb-4">
                        <div className="flex items-center gap-2.5">
                            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-(--color-accent-terracotta) text-sm font-extrabold text-white">
                                f.
                            </span>

                            <div>
                                <p className="text-xs font-bold tracking-tight text-(--color-text-primary)">
                                    Food360
                                </p>
                                <p className="text-[9px] font-medium uppercase tracking-[0.12em] text-(--color-text-muted)">
                                    Gestión de restaurante
                                </p>
                            </div>
                        </div>

                        <ClipboardList className="h-5 w-5 text-(--color-text-muted)" />
                    </div>

                    {/* Información de la comanda */}
                    <div className="mt-4 flex items-start justify-between gap-2">
                        <div>
                            <p className="text-[9px] font-semibold uppercase tracking-[0.13em] text-(--color-text-muted)">
                                Vista de pedidos
                            </p>

                            <h3 className="mt-1 font-serif text-lg font-semibold tracking-tight text-(--color-text-primary) sm:text-xl">
                                Nueva comanda
                            </h3>
                        </div>

                        <span className="inline-flex shrink-0 items-center gap-1.5 rounded-md bg-(--color-accent-terracotta-light) px-2 py-1 text-[9px] font-semibold text-(--color-accent-terracotta)">
                            <span className="h-1.5 w-1.5 rounded-full bg-(--color-accent-terracotta)" />
                            Pendiente
                        </span>
                    </div>

                    <div className="mt-4 flex items-center justify-between border-b border-(--color-border-subtle) pb-3 text-[10px]">
                        <span className="font-semibold text-(--color-text-primary)">
                            Pedido #1048
                        </span>
                        <span className="text-(--color-text-muted)">
                            Mesa 04
                        </span>
                    </div>

                    {/* Productos de ejemplo */}
                    <div className="space-y-3 py-4">
                        <div className="flex items-center justify-between gap-2">
                            <div className="flex min-w-0 items-center gap-2.5">
                                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-(--color-bg-subtle) text-(--color-accent-terracotta)">
                                    <Utensils className="h-4 w-4" />
                                </span>

                                <div className="min-w-0">
                                    <p className="truncate text-[11px] font-semibold text-(--color-text-primary)">
                                        Smash Burger Trufada
                                    </p>
                                    <p className="mt-0.5 text-[9px] text-(--color-text-muted)">
                                        2 unidades
                                    </p>
                                </div>
                            </div>

                            <span className="shrink-0 text-[11px] font-semibold text-(--color-text-primary)">
                                $33.00
                            </span>
                        </div>

                        <div className="flex items-center justify-between gap-2">
                            <div className="flex min-w-0 items-center gap-2.5">
                                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-(--color-bg-subtle) text-(--color-accent-terracotta)">
                                    <ShoppingBag className="h-4 w-4" />
                                </span>

                                <div className="min-w-0">
                                    <p className="truncate text-[11px] font-semibold text-(--color-text-primary)">
                                        Papas Rústicas
                                    </p>
                                    <p className="mt-0.5 text-[9px] text-(--color-text-muted)">
                                        1 unidad
                                    </p>
                                </div>
                            </div>

                            <span className="shrink-0 text-[11px] font-semibold text-(--color-text-primary)">
                                $6.50
                            </span>
                        </div>
                    </div>

                    {/* Total */}
                    <div className="flex items-center justify-between border-t border-(--color-border) pt-3">
                        <div>
                            <p className="text-[9px] text-(--color-text-muted)">
                                Total del pedido
                            </p>
                            <p className="mt-0.5 text-base font-bold tracking-tight text-(--color-text-primary)">
                                $39.50
                            </p>
                        </div>

                        <span className="text-[9px] font-medium text-(--color-text-muted)">
                            Datos de demostración
                        </span>
                    </div>
                </div>
            </div>

            {/* Elementos que aparecen y desaparecen */}
            {floatingItems.map(({ label, Icon, position }) => (
                <div key={label} data-hero-float className={`invisible absolute z-20 ${position}`}>
                    <div className="flex w-34 items-center gap-2.5 rounded-xl border border-(--color-border) bg-(--color-bg-surface) px-2.5 py-2.5 shadow-[0_18px_45px_-28px_var(--color-forest-light)] sm:w-39 sm:px-3 sm:py-3">
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-(--color-accent-terracotta-light) text-(--color-accent-terracotta)">
                            <Icon className="h-4 w-4" />
                        </span>

                        <span className="text-[10px] font-semibold text-(--color-text-primary) sm:text-[11px]">
                            {label}
                        </span>
                    </div>
                </div>
            ))}
        </div>
    );
}