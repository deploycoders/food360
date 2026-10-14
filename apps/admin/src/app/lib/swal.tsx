"use client";

import Swal from "sweetalert2";
import { toast } from "sonner";
import { renderToStaticMarkup } from "react-dom/server";

import {
  AlertTriangle,
  CheckCircle2,
  Info,
  OctagonAlert,
  XCircle,
} from "lucide-react";

export type ToastType = "success" | "info" | "warning" | "error";

/*                                SWEETALERT                                  */

const Food360Swal = Swal.mixin({
  width: "420px",
  padding: "0",
  background: "var(--card)",
  color: "var(--foreground)",
  backdrop: "rgba(0, 0, 0, 0.55)",
  buttonsStyling: false,

  customClass: {
    popup:
      "food360-swal-popup rounded-2xl border border-border bg-card shadow-2xl overflow-hidden",

    title:
      "food360-swal-title text-[15px] font-semibold tracking-tight text-foreground",

    htmlContainer:
      "food360-swal-description mt-2 px-1 text-[13px] leading-relaxed text-muted-foreground",

    actions:
      "food360-swal-actions mt-6 flex w-full items-center justify-end gap-2 px-5 pb-5",

    confirmButton:
      "food360-swal-confirm inline-flex items-center justify-center rounded-xl bg-accent px-4 py-2.5 text-xs font-semibold text-accent-foreground shadow-sm transition-all hover:opacity-90 active:scale-[0.98]",

    cancelButton:
      "food360-swal-cancel inline-flex items-center justify-center rounded-xl border border-border bg-background px-4 py-2.5 text-xs font-semibold text-muted-foreground transition-all hover:bg-muted hover:text-foreground active:scale-[0.98]",

    icon: "food360-swal-icon !mx-auto !mt-5 !mb-3 !h-12 !w-12",
  },

  showClass: {
    popup: "animate__animated animate__fadeInUp animate__faster",
  },

  hideClass: {
    popup: "animate__animated animate__fadeOutDown animate__faster",
  },
});

/*                              TOAST / SONNER                                */

export const showTimedToast = (
  title: string,
  type: ToastType = "success",
  description?: string,
) => {
  const toastOptions = {
    description,
    duration: 3000,

    style: {
      background: "var(--card)",
      color: "var(--foreground)",
      border: "1px solid var(--border)",
      borderRadius: "14px",
      fontSize: "13px",
      fontWeight: "500",
      boxShadow: "0 10px 30px -5px rgba(0, 0, 0, 0.12)",
      padding: "12px 14px",
    },
  };

  switch (type) {
    case "success":
      toast.success(title, {
        ...toastOptions,
        icon: <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />,
      });
      break;

    case "info":
      toast.info(title, {
        ...toastOptions,
        icon: <Info className="h-4 w-4 shrink-0 text-accent" />,
      });
      break;

    case "warning":
      toast.warning(title, {
        ...toastOptions,
        icon: <AlertTriangle className="h-4 w-4 shrink-0 text-amber-500" />,
      });
      break;

    case "error":
      toast.error(title, {
        ...toastOptions,
        icon: <XCircle className="h-4 w-4 shrink-0 text-rose-500" />,
      });
      break;
  }
};

/*                          CONFIRMAR DESACTIVACIÓN                           */

export const confirmDeactivateMember = async (
  memberName: string,
  onConfirm: () => Promise<void>,
) => {
  const result = await Food360Swal.fire({
    icon: "warning",
    title: `¿Desactivar a ${memberName}?`,
    text: "El miembro dejará de tener acceso al restaurante hasta que sea activado nuevamente.",
    showCancelButton: true,
    confirmButtonText: "Desactivar",
    cancelButtonText: "Cancelar",
    reverseButtons: true,
    focusCancel: true,
  });

  if (!result.isConfirmed) {
    return;
  }

  try {
    await onConfirm();

    showTimedToast(`${memberName} fue desactivado correctamente`, "success");
  } catch (error) {
    console.error("Error desactivando miembro:", error);

    showTimedToast(
      "No se pudo desactivar el miembro",
      "error",
      error instanceof Error
        ? error.message
        : "Ocurrió un error al desactivar el miembro.",
    );
  }
};

/*                              CONFIRMAR LOGOUT                               */

export const confirmLogout = async (onConfirm: () => Promise<void>) => {
  const result = await Food360Swal.fire({
    icon: "warning",
    title: "¿Cerrar sesión?",
    text: "Tendrás que iniciar sesión nuevamente para acceder al panel.",
    showCancelButton: true,
    confirmButtonText: "Cerrar sesión",
    cancelButtonText: "Cancelar",
    reverseButtons: true,
    focusCancel: true,
  });

  if (!result.isConfirmed) {
    return;
  }

  try {
    await onConfirm();
  } catch (error) {
    console.error("Error cerrando sesión:", error);

    showTimedToast(
      "No se pudo cerrar la sesión",
      "error",
      error instanceof Error
        ? error.message
        : "Ocurrió un error al cerrar la sesión.",
    );
  }
};

/*                            ELIMINAR CATEGORÍA                              */

export const confirmDeleteCategory = async (
  categoryName: string,
  onConfirm: () => Promise<void>,
) => {
  const result = await Food360Swal.fire({
    icon: "warning",
    title: `¿Eliminar "${categoryName}"?`,
    text: "Esta acción no se puede deshacer.",
    showCancelButton: true,
    confirmButtonText: "Eliminar",
    cancelButtonText: "Cancelar",
    reverseButtons: true,
    focusCancel: true,
  });

  if (!result.isConfirmed) {
    return;
  }

  try {
    await onConfirm();

    showTimedToast(`"${categoryName}" eliminada correctamente`, "success");
  } catch (error) {
    console.error("Error eliminando categoría:", error);

    showTimedToast(
      "No se pudo eliminar la categoría",
      "error",
      error instanceof Error
        ? error.message
        : "Ocurrió un error al eliminar la categoría.",
    );
  }
};

/*                         DESACTIVAR / ACTIVAR PRODUCTO                      */

export const confirmDesactivateProduct = async (
  productName: string,
  onConfirm: () => Promise<void>,
) => {
  const result = await Food360Swal.fire({
    icon: "warning",
    title: `¿Desactivar "${productName}"?`,
    text: "El producto dejará de estar disponible en la carta.",
    showCancelButton: true,
    confirmButtonText: "Desactivar",
    cancelButtonText: "Cancelar",
    reverseButtons: true,
    focusCancel: true,
  });

  if (!result.isConfirmed) {
    return;
  }

  try {
    await onConfirm();

    showTimedToast(`"${productName}" desactivado correctamente`, "success");
  } catch (error) {
    console.error("Error desactivando producto:", error);

    showTimedToast(
      "No se pudo desactivar el producto",
      "error",
      error instanceof Error
        ? error.message
        : "Ocurrió un error al desactivar el producto.",
    );
  }
};

/*                              ELIMINAR MESA                                 */
export const showTableCreated = (tableNumber: number) => {
  showTimedToast(
    `La mesa #${tableNumber} fue agregada correctamente.`,
    "success",
  );
};

export const showTableUpdated = (tableNumber: number) => {
  showTimedToast(
    `La mesa ha sido actualizada a la número #${tableNumber}.`,
    "success",
  );
};

export const confirmDeleteTable = async (
  tableNumber: number,
  onConfirm: () => Promise<void>,
) => {
  const result = await Food360Swal.fire({
    icon: "warning",
    iconColor: "var(--accent)",

    title: `¿Eliminar mesa #${tableNumber}?`,

    text: "Esta acción no se puede deshacer. Si la mesa tiene órdenes activas, no podrá eliminarse.",

    showCancelButton: true,

    confirmButtonText: "Eliminar mesa",
    cancelButtonText: "Cancelar",

    reverseButtons: true,
    focusCancel: true,

    customClass: {
      popup: "rounded-2xl border border-border bg-card shadow-2xl",

      icon: "!mx-auto !mt-6 !mb-2 !h-14 !w-14 !border-[2px]",

      title:
        "!px-5 !text-center !text-[17px] !font-bold !tracking-tight !text-foreground",

      htmlContainer:
        "!px-6 !text-center !text-[13px] !leading-relaxed !text-muted-foreground",

      actions: "!mt-6 !grid !w-full !grid-cols-2 !gap-2 !px-5 !pb-5",

      confirmButton:
        "!m-0 !w-full !rounded-xl !bg-destructive !px-4 !py-2.5 !text-xs !font-semibold !text-destructive-foreground !shadow-sm !transition-all hover:!opacity-90 active:!scale-[0.98]",

      cancelButton:
        "!m-0 !w-full !rounded-xl !bg-background !px-4 !py-2.5 !text-xs !font-semibold !text-foreground !transition-all hover:!bg-muted active:!scale-[0.98]",
    },
  });

  if (!result.isConfirmed) {
    return;
  }

  try {
    await onConfirm();

    showTimedToast(
      `La mesa #${tableNumber} fue eliminada correctamente.`,
      "success",
    );
  } catch (error) {
    console.error("Error eliminando mesa:", error);

    showTimedToast(
      "No se pudo eliminar la mesa",
      "error",
      error instanceof Error
        ? error.message
        : "Ocurrió un error al eliminar la mesa.",
    );
  }
};
