"use client";

import { useState } from "react";
import WifiModal from "@/components/shared/wifi-modal";

export function WifiAccess({
  ssid,
  password,
}: {
  ssid: string;
  password: string | null;
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        className="inline-flex min-h-10 shrink-0 items-center gap-2 rounded-lg border border-(--color-border) bg-(--color-bg-base) px-3 text-xs font-semibold text-(--color-text-primary) transition-colors hover:bg-(--color-bg-subtle) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-accent-terracotta)"
        onClick={() => setIsOpen(true)}
      >
        <span>Conectarse al Wi-Fi</span>
        <span aria-hidden="true">↗</span>
      </button>
      <WifiModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        ssid={ssid}
        password={password}
      />
    </>
  );
}
