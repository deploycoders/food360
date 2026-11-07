import type { ReactNode } from "react";

interface PublicAppShellProps {
  children: ReactNode;
}

export function PublicAppShell({ children }: PublicAppShellProps) {
  return (
    <div
      className="
        relative mx-auto flex min-h-dvh w-full max-w-180
        flex-col overflow-hidden bg-white shadow-none
        transition-colors duration-300 dark:bg-zinc-950
        lg:my-4 lg:min-h-[calc(100dvh-2rem)]
        lg:rounded-[30px]
        lg:shadow-[0_25px_90px_rgba(0,0,0,0.16)]
      "
    >
      {children}
    </div>
  );
}
