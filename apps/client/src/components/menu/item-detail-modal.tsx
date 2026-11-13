"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Box, Image as ImageIcon } from "lucide-react";
import Product3DViewer from "@/components/menu/product-3d-viewer";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Check, Minus, Plus, ShoppingBag, X } from "lucide-react";
import type { KeyboardEvent as ReactKeyboardEvent } from "react";
import type { MenuItem } from "@/types";

import { formatCurrency } from "@/lib/formatters";
import { useCart } from "@/context/CartContext";

interface ItemDetailModalProps {
  item: MenuItem | null;
  onClose: () => void;
}

const MAX_QUANTITY = 99;

export default function ItemDetailModal({
  item,
  onClose,
}: ItemDetailModalProps) {
  return (
    <AnimatePresence initial={false}>
      {item && (
        <ItemDetailContent key={item.id} item={item} onClose={onClose} />
      )}
    </AnimatePresence>
  );
}

function ItemDetailContent({
  item,
  onClose,
}: {
  item: MenuItem;
  onClose: () => void;
}) {
  const { addItem, updateQuantity, getItemQuantity } = useCart();

  const shouldReduceMotion = useReducedMotion();

  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLElement>(null);
  const onCloseRef = useRef(onClose);

  const currentCartQuantity = getItemQuantity(item.id);
  const hasItemInCart = currentCartQuantity > 0;
  const isAvailable = item.available;

  const [show3D, setShow3D] = useState(false);

  const has3DModel = Boolean(item.model3DEnabled && item.model3DUrl?.trim());

  const [quantity, setQuantity] = useState(() =>
    Math.min(MAX_QUANTITY, Math.max(1, currentCartQuantity || 1)),
  );

  const totalPrice = item.price * quantity;

  const transition = {
    duration: shouldReduceMotion ? 0 : 0.28,
    ease: "easeOut" as const,
  };

  const tapAnimation = shouldReduceMotion ? undefined : { scale: 0.94 };

  // Mantener actualizada la referencia al callback.
  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  // Bloqueo de scroll, gestión de foco y cierre con Escape.
  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    const previousActiveElement =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;

    document.body.style.overflow = "hidden";

    closeButtonRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onCloseRef.current();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);

      if (previousActiveElement?.isConnected) {
        previousActiveElement.focus();
      }
    };
  }, []);

  // Mantener el foco dentro del diálogo al navegar con teclado.
  const handleDialogKeyDown = (event: ReactKeyboardEvent<HTMLElement>) => {
    if (event.key !== "Tab") return;

    const focusableElements = dialogRef.current?.querySelectorAll<HTMLElement>(
      [
        "button:not([disabled])",
        "[href]",
        "input:not([disabled])",
        "select:not([disabled])",
        "textarea:not([disabled])",
        '[tabindex]:not([tabindex="-1"])',
      ].join(","),
    );

    if (!focusableElements?.length) return;

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    if (event.shiftKey && document.activeElement === firstElement) {
      event.preventDefault();
      lastElement.focus();
    } else if (!event.shiftKey && document.activeElement === lastElement) {
      event.preventDefault();
      firstElement.focus();
    }
  };

  // Modificar cantidad.
  const decreaseQuantity = () => {
    setQuantity((previous) => Math.max(1, previous - 1));
  };

  const increaseQuantity = () => {
    setQuantity((previous) => Math.min(MAX_QUANTITY, previous + 1));
  };

  // Agregar o actualizar el producto en el carrito.
  const handleAddToCart = () => {
    if (!isAvailable) return;

    const existingQuantity = getItemQuantity(item.id);

    if (existingQuantity > 0) {
      updateQuantity(item.id, quantity);
    } else {
      for (let i = 0; i < quantity; i++) {
        addItem(item);
      }
    }

    onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{
        duration: shouldReduceMotion ? 0 : 0.22,
      }}
      className="fixed inset-0 z-100 flex items-end justify-center sm:items-center sm:p-4"
    >
      {/* Fondo */}
      <motion.button
        type="button"
        tabIndex={-1}
        aria-label="Cerrar detalles del producto"
        onClick={onClose}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{
          duration: shouldReduceMotion ? 0 : 0.22,
        }}
        className="absolute inset-0 cursor-default bg-black/65 backdrop-blur-[3px]"
      />

      {/* Modal */}
      <motion.section
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="item-detail-title"
        aria-describedby="item-detail-description"
        onKeyDown={handleDialogKeyDown}
        initial={
          shouldReduceMotion ? false : { opacity: 0, y: 35, scale: 0.985 }
        }
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={
          shouldReduceMotion
            ? { opacity: 0 }
            : { opacity: 0, y: 25, scale: 0.985 }
        }
        transition={transition}
        className="relative flex max-h-[92dvh] w-full max-w-xl flex-col overflow-hidden rounded-t-[26px] border border-(--color-border) bg-(--color-bg-surface) shadow-2xl sm:max-h-[88dvh] sm:rounded-[26px]"
      >
        {/* Indicador visual de bottom sheet */}
        <div className="absolute left-1/2 top-2.5 z-20 h-1 w-10 -translate-x-1/2 rounded-full bg-white/70 sm:hidden" />

        {/* Imagen principal */}
        {/* Imagen principal / Modelo 3D */}
        <div className="group/image relative h-52 w-full shrink-0 overflow-hidden bg-(--color-bg-subtle) sm:h-64">
          {show3D && has3DModel ? (
            <Product3DViewer
              modelUrl={item.model3DUrl!}
              productName={item.name}
            />
          ) : (
            <>
              <Image
                src={item.image || "/food-placeholder.svg"}
                alt={item.name}
                fill
                priority
                sizes="(max-width: 640px) 100vw, 576px"
                className="object-cover"
              />

              <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-black/45 via-transparent to-black/10" />

              <div className="absolute bottom-4 left-5">
                <span className="rounded-full border border-white/20 bg-black/30 px-3 py-1.5 text-[9px] font-semibold uppercase tracking-[0.18em] text-white backdrop-blur-md">
                  Detalle del producto
                </span>
              </div>
            </>
          )}

          {/* Alternar fotografía / modelo 3D */}
          {has3DModel && (
            <motion.button
              type="button"
              whileTap={tapAnimation}
              onClick={() => setShow3D((previous) => !previous)}
              className="absolute bottom-4 right-4 z-10 flex items-center gap-2 rounded-full border border-white/25 bg-black/50 px-3.5 py-2.5 text-[10px] font-semibold text-white shadow-sm backdrop-blur-md transition-colors hover:bg-black/70"
            >
              {show3D ? (
                <>
                  <ImageIcon size={14} />
                  Ver fotografía
                </>
              ) : (
                <>
                  <Box size={14} />
                  Ver en 3D
                </>
              )}
            </motion.button>
          )}

          {/* Cerrar */}
          <motion.button
            ref={closeButtonRef}
            type="button"
            whileTap={tapAnimation}
            onClick={onClose}
            aria-label="Cerrar"
            className="absolute right-4 top-4 z-10 flex size-10 items-center justify-center rounded-full border border-white/25 bg-black/35 text-white shadow-sm backdrop-blur-md transition-colors hover:bg-black/55 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            <X size={19} strokeWidth={1.8} />
          </motion.button>

          {/* Agotado */}
          {!isAvailable && (
            <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/30 backdrop-blur-[2px]">
              <span className="rounded-full border border-white/20 bg-black/60 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-white backdrop-blur-md">
                Producto agotado
              </span>
            </div>
          )}
        </div>

        {/* Contenido desplazable */}
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 pb-5 pt-5 sm:px-7 sm:pt-6">
          {/* Nombre y precio */}
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
              <h2
                id="item-detail-title"
                className="font-editorial-serif text-2xl font-medium leading-tight tracking-tight text-(--color-text-primary) sm:text-3xl"
              >
                {item.name}
              </h2>

              {isAvailable ? (
                <div className="mt-2 flex items-center gap-1.5 text-[10px] font-medium text-(--color-forest)">
                  <span className="size-1.5 rounded-full bg-(--color-forest)" />
                  Disponible para ordenar
                </div>
              ) : (
                <div className="mt-2 text-[10px] font-semibold uppercase tracking-wider text-(--color-accent-terracotta)">
                  Temporalmente no disponible
                </div>
              )}
            </div>

            <div className="shrink-0 rounded-xl border border-(--color-border) bg-(--color-bg-base) px-3 py-2 text-right">
              <p className="text-[9px] font-semibold uppercase tracking-wider text-(--color-text-subtle)">
                Precio
              </p>

              <motion.p
                key={item.price}
                initial={shouldReduceMotion ? false : { opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-0.5 font-editorial-serif text-xl font-semibold tabular-nums text-(--color-text-primary)"
              >
                {formatCurrency(item.price)}
              </motion.p>
            </div>
          </div>

          {/* Etiquetas */}
          {item.tags && item.tags.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {item.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-(--color-border) bg-(--color-bg-base) px-3 py-1.5 text-[10px] font-medium text-(--color-text-muted)"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Descripción */}
          <div className="mt-5">
            <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-(--color-text-subtle)">
              Sobre este plato
            </p>

            <p
              id="item-detail-description"
              className="text-sm leading-[1.8] text-(--color-text-muted)"
            >
              {item.description?.trim() ||
                "Una creación preparada para disfrutar."}
            </p>
          </div>

          {/* Selector de cantidad */}
          <div className="mt-6 rounded-xl border border-(--color-border) bg-(--color-bg-base) p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-semibold text-(--color-text-primary)">
                  Cantidad
                </h3>

                <p className="mt-1 text-[10px] text-(--color-text-muted)">
                  Selecciona las unidades que deseas.
                </p>
              </div>

              <div className="flex h-11 items-center gap-3 rounded-full border border-(--color-border) bg-(--color-bg-surface) p-1">
                <motion.button
                  type="button"
                  whileTap={tapAnimation}
                  onClick={decreaseQuantity}
                  disabled={!isAvailable || quantity <= 1}
                  aria-label="Reducir cantidad"
                  className="flex size-9 items-center justify-center rounded-full text-(--color-text-muted) transition-colors hover:bg-(--color-bg-subtle) hover:text-(--color-text-primary) disabled:cursor-not-allowed disabled:opacity-30"
                >
                  <Minus size={15} strokeWidth={2} />
                </motion.button>

                <AnimatePresence mode="wait" initial={false}>
                  <motion.span
                    key={quantity}
                    initial={shouldReduceMotion ? false : { opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={
                      shouldReduceMotion ? undefined : { opacity: 0, y: -5 }
                    }
                    transition={{
                      duration: shouldReduceMotion ? 0 : 0.15,
                    }}
                    aria-live="polite"
                    aria-atomic="true"
                    className="min-w-7 text-center text-sm font-bold tabular-nums text-(--color-text-primary)"
                  >
                    {quantity}
                  </motion.span>
                </AnimatePresence>

                <motion.button
                  type="button"
                  whileTap={tapAnimation}
                  onClick={increaseQuantity}
                  disabled={!isAvailable || quantity >= MAX_QUANTITY}
                  aria-label="Aumentar cantidad"
                  className="flex size-9 items-center justify-center rounded-full bg-(--color-accent-terracotta) text-white transition-opacity hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-35"
                >
                  <Plus size={15} strokeWidth={2.2} />
                </motion.button>
              </div>
            </div>
          </div>
        </div>

        {/* Acción persistente */}
        <footer className="shrink-0 border-t border-(--color-border) bg-(--color-bg-surface) px-5 pb-[calc(1rem+env(safe-area-inset-bottom))] pt-4 sm:px-7 sm:pb-5">
          <motion.button
            type="button"
            whileTap={
              shouldReduceMotion || !isAvailable ? undefined : { scale: 0.985 }
            }
            onClick={handleAddToCart}
            disabled={!isAvailable}
            className="flex min-h-14 w-full items-center justify-between gap-3 rounded-xl bg-(--color-accent-terracotta) px-4 py-3 text-white shadow-[0_8px_20px_-10px_rgba(0,0,0,0.35)] transition-all hover:brightness-105 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-accent-terracotta) disabled:cursor-not-allowed disabled:opacity-50 sm:px-5"
          >
            <span className="flex min-w-0 items-center gap-2.5">
              <ShoppingBag size={18} strokeWidth={1.9} className="shrink-0" />

              <span className="text-left">
                <span className="block text-xs font-semibold">
                  {!isAvailable
                    ? "No disponible"
                    : hasItemInCart
                      ? "Actualizar pedido"
                      : "Agregar al pedido"}
                </span>

                {isAvailable && (
                  <span className="mt-0.5 block text-[10px] text-white/75">
                    {quantity} {quantity === 1 ? "unidad" : "unidades"}
                  </span>
                )}
              </span>
            </span>

            <motion.span
              key={totalPrice}
              initial={shouldReduceMotion ? false : { opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              className="shrink-0 font-editorial-serif text-xl font-semibold tabular-nums"
            >
              {formatCurrency(totalPrice)}
            </motion.span>
          </motion.button>

          {isAvailable && (
            <div className="mt-3 flex items-center justify-center gap-1.5">
              <Check size={12} className="text-(--color-text-subtle)" />

              <p className="text-[10px] text-(--color-text-subtle)">
                El precio final se calcula al registrar tu pedido.
              </p>
            </div>
          )}
        </footer>
      </motion.section>
    </motion.div>
  );
}
