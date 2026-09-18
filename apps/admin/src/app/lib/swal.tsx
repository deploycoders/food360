import Swal from "sweetalert2";
import { toast } from "sonner";
import { AlertTriangle, CheckCircle2, Info, XCircle } from "lucide-react";

export type ToastType = "success" | "info" | "warning" | "error";

// Modal elegante para acciones críticas (desactivar, borrar, etc.)
const Food360Swal = Swal.mixin({
  customClass: {
    popup:
      "bg-card border border-border rounded-2xl shadow-2xl text-foreground font-sans p-6",
    title: "text-base font-bold text-foreground tracking-tight",
    htmlContainer: "text-xs text-muted-foreground mt-2",
    confirmButton:
      "px-4 py-2.5 rounded-xl bg-accent text-accent-foreground font-semibold text-xs transition-all active:scale-95 mx-1 cursor-pointer",
    cancelButton:
      "px-4 py-2.5 rounded-xl bg-muted text-muted-foreground hover:text-foreground font-semibold text-xs transition-all active:scale-95 mx-1 cursor-pointer",
    actions: "mt-4 gap-2",
  },
  buttonsStyling: false,
});

export const confirmDeactivateMember = async (
  name: string,
): Promise<boolean> => {
  const result = await Food360Swal.fire({
    title: `¿Desactivar a ${name}?`,
    text: "El usuario no podrá acceder al sistema, pero se conservará su historial de actividades.",
    icon: "warning",
    iconColor: "var(--warning)",
    showCancelButton: true,
    confirmButtonText: "Sí, desactivar",
    cancelButtonText: "Cancelar",
  });

  return result.isConfirmed;
};

export const confirmLogout = async (): Promise<boolean> => {
  const result = await Food360Swal.fire({
    title: "¿Cerrar sesión?",
    text: "¿Estás seguro de que deseas cerrar sesión? Se te redirigirá a la página de inicio de sesión.",
    icon: "warning",
    iconColor: "var(--warning)",
    showCancelButton: true,
    confirmButtonText: "Sí, cerrar sesión",
    cancelButtonText: "Cancelar",
  });

  return result.isConfirmed;
};

export const confirmDeleteCategory = async (name: string): Promise<boolean> => {
  const result = await Food360Swal.fire({
    title: "¿Eliminar categoría?",
    text: `"${name}" será eliminada permanentemente. Si tiene platillos asociados, la base de datos podría impedir la eliminación.`,
    icon: "warning",
    iconColor: "var(--warning)",
    showCancelButton: true,
    confirmButtonText: "Sí, eliminar",
    cancelButtonText: "Cancelar",
  });

  return result.isConfirmed;
};

export const confirmDesactivateProduct = async (
  name: string,
): Promise<boolean> => {
  const result = await Food360Swal.fire({
    title: "Desactivar producto?",
    text: `"${name}" será desactivado Si tiene pedidos asociados, la base de datos podría impedir la desactivación.`,
    icon: "warning",
    iconColor: "var(--warning)",
    showCancelButton: true,
    confirmButtonText: "Sí, desactivar",
    cancelButtonText: "Cancelar",
  });

  return result.isConfirmed;
};

export const showTimedToast = (
  title: string,
  type: ToastType = "success",
  description?: string,
) => {
  const toastOptions = {
    description,
    style: {
      background: "var(--card)",
      color: "var(--foreground)",
      borderColor: "var(--border)",
      borderRadius: "14px",
      fontSize: "13px",
      fontWeight: "500",
      boxShadow: "0 10px 30px -5px rgba(0, 0, 0, 0.08)",
    },
  };

  switch (type) {
    case "success":
      toast.success(title, {
        ...toastOptions,
        icon: <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />,
      });
      break;

    case "info":
      toast.info(title, {
        ...toastOptions,
        icon: <Info className="h-4 w-4 text-accent shrink-0" />,
      });
      break;

    case "warning":
      toast.warning(title, {
        ...toastOptions,
        icon: <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0" />,
      });
      break;

    case "error":
      toast.error(title, {
        ...toastOptions,
        icon: <XCircle className="h-4 w-4 text-rose-500 shrink-0" />,
      });
      break;
  }
};
