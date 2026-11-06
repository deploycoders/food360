"use client";

import { useEffect, useId, useRef, useState } from "react";
import type { FormEvent, KeyboardEvent as ReactKeyboardEvent } from "react";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";

import {
  ArrowRight,
  Check,
  IdCard,
  LoaderCircle,
  Phone,
  ShieldCheck,
  UserRound,
  X,
} from "lucide-react";

import type { CustomerData } from "@/types";

interface CustomerFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CustomerData) => void;
  restaurantName?: string;
  initialData?: CustomerData | null;
}

type CustomerField = "nombre" | "cedula" | "telefono";

type CustomerErrors = Partial<Record<CustomerField, string>>;

export default function CustomerForm({
  isOpen,
  onClose,
  onSubmit,
  restaurantName,
  initialData,
}: CustomerFormProps) {
  const shouldReduceMotion = useReducedMotion();
  const id = useId();

  const dialogRef = useRef<HTMLElement>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);
  const cedulaInputRef = useRef<HTMLInputElement>(null);
  const phoneInputRef = useRef<HTMLInputElement>(null);

  const onCloseRef = useRef(onClose);

  const [nombre, setNombre] = useState(initialData?.nombre ?? "");
  const [cedula, setCedula] = useState(initialData?.cedula ?? "");
  const [telefono, setTelefono] = useState(initialData?.telefono ?? "");

  const [errors, setErrors] = useState<CustomerErrors>({});
  const [shakeKey, setShakeKey] = useState(0);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const transition = {
    duration: shouldReduceMotion ? 0 : 0.28,
    ease: "easeOut" as const,
  };

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  // Precargar los datos cuando se abre para editar.
  useEffect(() => {
    if (!isOpen || !initialData) return;

    setNombre(initialData.nombre);
    setCedula(initialData.cedula ?? "");
    setTelefono(initialData.telefono);
    setErrors({});
  }, [isOpen, initialData]);

  // Bloqueo de scroll, foco inicial y cierre con Escape.
  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;

    const previousActiveElement =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;

    document.body.style.overflow = "hidden";

    nameInputRef.current?.focus();

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
  }, [isOpen]);

  // Mantener el foco dentro del diálogo.
  const handleDialogKeyDown = (event: ReactKeyboardEvent<HTMLElement>) => {
    if (event.key !== "Tab") return;

    const focusableElements = dialogRef.current?.querySelectorAll<HTMLElement>(
      [
        "button:not([disabled])",
        "input:not([disabled])",
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

  const clearFieldError = (field: CustomerField) => {
    setErrors((previous) => {
      const next = { ...previous };
      delete next[field];
      return next;
    });
  };

  // Validación de campos.
  const validate = (): boolean => {
    const newErrors: CustomerErrors = {};

    const cleanName = nombre.trim();
    const cleanCedula = cedula.trim();
    const cleanPhone = telefono.trim();

    if (!cleanName) {
      newErrors.nombre = "El nombre es obligatorio.";
    } else if (cleanName.length < 2) {
      newErrors.nombre = "Introduce al menos 2 caracteres.";
    } else if (cleanName.length > 100) {
      newErrors.nombre = "El nombre no puede superar 100 caracteres.";
    }

    // La cédula es opcional.
    // Solo se valida si el cliente decide introducirla.
    if (cleanCedula && !/^\d{6,10}$/.test(cleanCedula)) {
      newErrors.cedula = "Introduce una cédula válida (6-10 dígitos).";
    }

    if (!cleanPhone) {
      newErrors.telefono = "El teléfono es obligatorio.";
    } else if (!/^\d{10,11}$/.test(cleanPhone)) {
      newErrors.telefono = "Introduce un teléfono válido (10-11 dígitos).";
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      setShakeKey((previous) => previous + 1);

      if (newErrors.nombre) {
        nameInputRef.current?.focus();
      } else if (newErrors.cedula) {
        cedulaInputRef.current?.focus();
      } else if (newErrors.telefono) {
        phoneInputRef.current?.focus();
      }

      return false;
    }

    return true;
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (isSubmitting) return;
    if (!validate()) return;

    setIsSubmitting(true);

    try {
      onSubmit({
        nombre: nombre.trim(),
        cedula: cedula.trim(),
        telefono: telefono.trim(),
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getInputClassName = (hasError: boolean) => `
    h-12 w-full rounded-xl border px-3.5 text-sm
    text-(--color-text-primary) outline-none
    transition-[border-color,box-shadow,background-color]
    duration-200
    placeholder:text-(--color-text-subtle)
    focus:bg-(--color-bg-surface)
    focus:ring-2
    focus:ring-(--color-accent-terracotta)/15
    disabled:opacity-50
    ${
      hasError
        ? "border-(--color-accent-terracotta) bg-(--color-bg-surface) focus:border-(--color-accent-terracotta)"
        : "border-(--color-border) bg-(--color-bg-base) focus:border-(--color-accent-terracotta)"
    }
  `;

  const labelClassName = `
    mb-2 flex items-center gap-2
    text-xs font-semibold
    text-(--color-text-primary)
  `;

  const shakeAnimation = shouldReduceMotion
    ? { x: 0 }
    : { x: [0, -7, 7, -5, 5, 0] };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="customer-form-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{
            duration: shouldReduceMotion ? 0 : 0.2,
          }}
          className="fixed inset-0 z-110 flex items-end justify-center sm:items-center sm:p-4"
        >
          {/* Fondo */}
          <motion.button
            type="button"
            tabIndex={-1}
            aria-label="Cerrar formulario"
            onClick={onClose}
            className="absolute inset-0 cursor-default bg-black/65 backdrop-blur-[3px]"
          />

          {/* Modal */}
          <motion.section
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={`${id}-title`}
            aria-describedby={`${id}-description`}
            onKeyDown={handleDialogKeyDown}
            initial={
              shouldReduceMotion ? false : { opacity: 0, y: 35, scale: 0.99 }
            }
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={
              shouldReduceMotion
                ? { opacity: 0 }
                : { opacity: 0, y: 25, scale: 0.99 }
            }
            transition={transition}
            className="relative flex max-h-[92dvh] w-full max-w-lg flex-col overflow-hidden rounded-t-[28px] border border-(--color-border) bg-(--color-bg-surface) shadow-2xl sm:rounded-[26px]"
          >
            {/* Indicador de bottom sheet */}
            <div className="absolute left-1/2 top-2.5 z-20 h-1 w-10 -translate-x-1/2 rounded-full bg-(--color-text-subtle)/35 sm:hidden" />

            {/* Encabezado */}
            <header className="relative shrink-0 border-b border-(--color-border) px-5 pb-5 pt-7 sm:px-7 sm:pt-6">
              <motion.button
                type="button"
                whileTap={shouldReduceMotion ? undefined : { scale: 0.92 }}
                onClick={onClose}
                aria-label="Cerrar formulario"
                className="absolute right-4 top-4 flex size-9 items-center justify-center rounded-full border border-(--color-border) bg-(--color-bg-base) text-(--color-text-muted) transition-colors hover:border-(--color-border-dark) hover:bg-(--color-bg-subtle) hover:text-(--color-text-primary) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-accent-terracotta) sm:right-5 sm:top-5"
              >
                <X size={17} strokeWidth={1.8} />
              </motion.button>

              <div className="flex items-center gap-3 pr-10">
                <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-(--color-accent-terracotta)/10 text-(--color-accent-terracotta)">
                  <UserRound size={21} strokeWidth={1.7} />
                </div>

                <div className="min-w-0">
                  <p className="truncate text-[10px] font-semibold uppercase tracking-[0.16em] text-(--color-accent-terracotta)">
                    Para tu pedido
                  </p>

                  <h2
                    id={`${id}-title`}
                    className="mt-1 font-editorial-serif text-xl font-medium text-(--color-text-primary) sm:text-2xl"
                  >
                    Tus datos de contacto
                  </h2>
                </div>
              </div>

              <p
                id={`${id}-description`}
                className="mt-3 max-w-sm text-xs leading-relaxed text-(--color-text-muted)"
              >
                Completa tus datos para que podamos identificar tu pedido y
                facilitar la comunicación con el restaurante.
              </p>
            </header>

            {/* Formulario */}
            <motion.form
              key={shakeKey}
              onSubmit={handleSubmit}
              animate={shakeAnimation}
              transition={{
                duration: shouldReduceMotion ? 0 : 0.38,
              }}
              className="flex min-h-0 flex-1 flex-col"
              noValidate
              autoComplete="on"
            >
              <div className="min-h-0 flex-1 space-y-5 overflow-y-auto overscroll-contain px-5 py-5 sm:px-7">
                {/* Nombre */}
                <div>
                  <label htmlFor={`${id}-name`} className={labelClassName}>
                    <UserRound
                      size={14}
                      className="text-(--color-text-muted)"
                    />
                    Nombre y apellido
                  </label>

                  <input
                    ref={nameInputRef}
                    id={`${id}-name`}
                    type="text"
                    name="name"
                    autoComplete="name"
                    maxLength={100}
                    value={nombre}
                    onChange={(event) => {
                      setNombre(event.target.value);
                      clearFieldError("nombre");
                    }}
                    placeholder="Ej. Carlos Mendoza"
                    aria-invalid={Boolean(errors.nombre)}
                    aria-describedby={
                      errors.nombre ? `${id}-name-error` : undefined
                    }
                    className={getInputClassName(Boolean(errors.nombre))}
                  />

                  <AnimatePresence initial={false}>
                    {errors.nombre && (
                      <motion.p
                        id={`${id}-name-error`}
                        role="alert"
                        initial={
                          shouldReduceMotion
                            ? false
                            : { opacity: 0, height: 0, y: -4 }
                        }
                        animate={{ opacity: 1, height: "auto", y: 0 }}
                        exit={{ opacity: 0, height: 0, y: -4 }}
                        className="overflow-hidden pt-1.5 text-[11px] text-(--color-accent-terracotta)"
                      >
                        {errors.nombre}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>

                {/* Cédula opcional */}
                <div>
                  <label htmlFor={`${id}-cedula`} className={labelClassName}>
                    <IdCard size={14} className="text-(--color-text-muted)" />
                    Cédula de identidad
                    <span className="ml-auto text-[10px] font-normal normal-case tracking-normal text-(--color-text-subtle)">
                      Opcional
                    </span>
                  </label>

                  <input
                    ref={cedulaInputRef}
                    id={`${id}-cedula`}
                    type="text"
                    name="identity"
                    inputMode="numeric"
                    autoComplete="off"
                    maxLength={10}
                    value={cedula}
                    onChange={(event) => {
                      const value = event.target.value.replace(/\D/g, "");

                      setCedula(value);
                      clearFieldError("cedula");
                    }}
                    placeholder="Ej. 18456789"
                    aria-invalid={Boolean(errors.cedula)}
                    aria-describedby={
                      errors.cedula ? `${id}-cedula-error` : `${id}-cedula-help`
                    }
                    className={getInputClassName(Boolean(errors.cedula))}
                  />

                  <p
                    id={`${id}-cedula-help`}
                    className="mt-1.5 text-[10px] text-(--color-text-subtle)"
                  >
                    Puedes dejar este campo vacío.
                  </p>

                  <AnimatePresence initial={false}>
                    {errors.cedula && (
                      <motion.p
                        id={`${id}-cedula-error`}
                        role="alert"
                        initial={
                          shouldReduceMotion
                            ? false
                            : { opacity: 0, height: 0, y: -4 }
                        }
                        animate={{ opacity: 1, height: "auto", y: 0 }}
                        exit={{ opacity: 0, height: 0, y: -4 }}
                        className="overflow-hidden pt-1.5 text-[11px] text-(--color-accent-terracotta)"
                      >
                        {errors.cedula}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>

                {/* Teléfono */}
                <div>
                  <label htmlFor={`${id}-phone`} className={labelClassName}>
                    <Phone size={14} className="text-(--color-text-muted)" />
                    Teléfono de contacto
                  </label>

                  <input
                    ref={phoneInputRef}
                    id={`${id}-phone`}
                    type="tel"
                    name="tel"
                    inputMode="numeric"
                    autoComplete="tel"
                    maxLength={11}
                    value={telefono}
                    onChange={(event) => {
                      const value = event.target.value.replace(/\D/g, "");

                      setTelefono(value);
                      clearFieldError("telefono");
                    }}
                    placeholder="Ej. 04141234567"
                    aria-invalid={Boolean(errors.telefono)}
                    aria-describedby={
                      errors.telefono ? `${id}-phone-error` : undefined
                    }
                    className={getInputClassName(Boolean(errors.telefono))}
                  />

                  <AnimatePresence initial={false}>
                    {errors.telefono && (
                      <motion.p
                        id={`${id}-phone-error`}
                        role="alert"
                        initial={
                          shouldReduceMotion
                            ? false
                            : { opacity: 0, height: 0, y: -4 }
                        }
                        animate={{ opacity: 1, height: "auto", y: 0 }}
                        exit={{ opacity: 0, height: 0, y: -4 }}
                        className="overflow-hidden pt-1.5 text-[11px] text-(--color-accent-terracotta)"
                      >
                        {errors.telefono}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>

                {/* Privacidad */}
                <div className="flex items-start gap-2.5 rounded-xl border border-(--color-border) bg-(--color-bg-base) p-3.5">
                  <ShieldCheck
                    size={17}
                    className="mt-0.5 shrink-0 text-(--color-forest)"
                  />

                  <p className="text-[10px] leading-relaxed text-(--color-text-muted)">
                    Tus datos se utilizarán para gestionar tu pedido y facilitar
                    la comunicación con el restaurante.
                  </p>
                </div>
              </div>

              {/* Footer */}
              <footer className="shrink-0 border-t border-(--color-border) bg-(--color-bg-surface) px-5 pb-[calc(1rem+env(safe-area-inset-bottom))] pt-4 sm:px-7 sm:pb-5">
                <motion.button
                  type="submit"
                  whileTap={shouldReduceMotion ? undefined : { scale: 0.985 }}
                  disabled={isSubmitting}
                  className="flex min-h-12 w-full items-center justify-between gap-3 rounded-xl bg-(--color-accent-terracotta) px-5 py-3 text-white shadow-sm transition-all hover:brightness-105 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-accent-terracotta) disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <span className="flex items-center gap-2.5">
                    {isSubmitting ? (
                      <LoaderCircle size={17} className="animate-spin" />
                    ) : (
                      <Check size={17} strokeWidth={2.2} />
                    )}

                    <span className="text-xs font-semibold">
                      {isSubmitting
                        ? "Guardando información..."
                        : "Continuar con el pedido"}
                    </span>
                  </span>

                  {!isSubmitting && <ArrowRight size={17} />}
                </motion.button>

                <p className="mt-2.5 text-center text-[10px] text-(--color-text-subtle)">
                  Revisa que tus datos sean correctos antes de continuar.
                </p>
              </footer>
            </motion.form>
          </motion.section>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
