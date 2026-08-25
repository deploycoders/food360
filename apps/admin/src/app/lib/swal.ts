import Swal from "sweetalert2";
import { toast } from "sonner";

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

// Toasts limpios con Sonner
export const showTimedToast = (
  title: string,
  icon: "success" | "info" = "success",
) => {
  if (icon === "success") {
    toast.success(title);
  } else {
    toast.info(title);
  }
};
