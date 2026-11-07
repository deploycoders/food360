import type { ReactNode } from "react";
import { PublicAppShell } from "@/components/public/public-app-shell";

export default function MenuLayout({ children }: { children: ReactNode }) {
  return <PublicAppShell>{children}</PublicAppShell>;
}
