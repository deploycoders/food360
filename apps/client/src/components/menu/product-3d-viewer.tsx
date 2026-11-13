"use client";

import { useEffect, useRef, useState } from "react";

interface Product3DViewerProps {
  modelUrl: string;
  productName: string;
}

export default function Product3DViewer({
  modelUrl,
  productName,
}: Product3DViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">(
    "loading",
  );

  useEffect(() => {
    let isMounted = true;
    let viewer: HTMLElement | null = null;

    const loadViewer = async () => {
      try {
        await import("@google/model-viewer");

        if (!isMounted || !containerRef.current) return;

        viewer = document.createElement("model-viewer");

        viewer.setAttribute("src", modelUrl);
        viewer.setAttribute("alt", `Modelo 3D de ${productName}`);
        viewer.setAttribute("camera-controls", "");
        viewer.setAttribute("auto-rotate", "");
        viewer.setAttribute("rotation-per-second", "20deg");
        viewer.setAttribute("interaction-prompt", "auto");
        viewer.setAttribute("shadow-intensity", "1");
        viewer.setAttribute("exposure", "1");
        viewer.setAttribute("loading", "eager");
        // Habilitar realidad aumentada.
        viewer.setAttribute("ar", "");
        viewer.setAttribute("ar-modes", "webxr scene-viewer quick-look");

        // Mantener el tamaño original del modelo.
        viewer.setAttribute("ar-scale", "fixed");

        // Colocación sobre superficies horizontales, como una mesa.
        viewer.setAttribute("ar-placement", "floor");

        const arButton = document.createElement("button");

        arButton.setAttribute("slot", "ar-button");
        arButton.type = "button";
        arButton.textContent = "Ver en mi espacio";

        Object.assign(arButton.style, {
          position: "absolute",
          bottom: "16px",
          left: "50%",
          transform: "translateX(-50%)",
          padding: "11px 18px",
          borderRadius: "9999px",
          border: "1px solid rgba(255,255,255,0.25)",
          background: "rgba(0,0,0,0.7)",
          color: "#ffffff",
          fontSize: "12px",
          fontWeight: "600",
          backdropFilter: "blur(12px)",
          cursor: "pointer",
        });

        viewer.appendChild(arButton);

        Object.assign(viewer.style, {
          display: "block",
          width: "100%",
          height: "100%",
          background: "transparent",
        });

        viewer.addEventListener(
          "load",
          () => {
            if (isMounted) setStatus("ready");
          },
          { once: true },
        );

        viewer.addEventListener(
          "error",
          () => {
            if (isMounted) setStatus("error");
          },
          { once: true },
        );

        containerRef.current.replaceChildren(viewer);
      } catch {
        if (isMounted) setStatus("error");
      }
    };

    loadViewer();

    return () => {
      isMounted = false;
      viewer?.remove();
    };
  }, [modelUrl, productName]);

  return (
    <div className="relative h-full w-full">
      <div ref={containerRef} className="absolute inset-0" />

      {status === "loading" && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xs text-(--color-text-muted)">
            Cargando modelo 3D...
          </span>
        </div>
      )}

      {status === "error" && (
        <div className="absolute inset-0 flex items-center justify-center px-6 text-center">
          <p className="text-sm text-(--color-text-muted)">
            No se pudo cargar el modelo 3D de este producto.
          </p>
        </div>
      )}
    </div>
  );
}
