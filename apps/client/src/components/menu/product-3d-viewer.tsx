"use client";

import { useEffect, useRef, useState } from "react";

interface Product3DViewerProps {
  modelUrl: string;
  productName: string;
}

interface ModelViewerElement extends HTMLElement {
  getDimensions(): {
    x: number;
    y: number;
    z: number;
  };
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
    let viewer: ModelViewerElement | null = null;

    const loadViewer = async () => {
      try {
        await import("@google/model-viewer");

        if (!isMounted || !containerRef.current) return;

        const modelViewer = document.createElement(
          "model-viewer",
        ) as ModelViewerElement;

        viewer = modelViewer;

        // Modelo
        modelViewer.setAttribute("src", modelUrl);
        modelViewer.setAttribute("alt", `Modelo 3D de ${productName}`);

        // Visualización 3D
        modelViewer.setAttribute("camera-controls", "");
        modelViewer.setAttribute("auto-rotate", "");
        modelViewer.setAttribute("rotation-per-second", "20deg");
        modelViewer.setAttribute("interaction-prompt", "auto");

        // Apariencia
        modelViewer.setAttribute("shadow-intensity", "1");
        modelViewer.setAttribute("exposure", "1");
        modelViewer.setAttribute("loading", "eager");

        // Realidad aumentada
        modelViewer.setAttribute("ar", "");
        modelViewer.setAttribute("ar-modes", "webxr scene-viewer quick-look");

        // Mantener la escala original y bloquear el redimensionamiento.
        modelViewer.setAttribute("ar-scale", "fixed");

        // Permitir colocación sobre superficies horizontales.
        modelViewer.setAttribute("ar-placement", "floor");

        // Carga del modelo
        modelViewer.addEventListener(
          "load",
          () => {
            if (!isMounted) return;

            try {
              const dimensions = modelViewer.getDimensions();

              console.log("[Food360 3D] Dimensiones originales del GLB:", {
                x: `${(dimensions.x * 100).toFixed(1)} cm`,
                y: `${(dimensions.y * 100).toFixed(1)} cm`,
                z: `${(dimensions.z * 100).toFixed(1)} cm`,
              });
            } catch (error) {
              console.warn(
                "[Food360 3D] No se pudieron consultar las dimensiones:",
                error,
              );
            }

            setStatus("ready");
          },
          { once: true },
        );

        modelViewer.addEventListener(
          "error",
          () => {
            if (isMounted) setStatus("error");
          },
          { once: true },
        );

        // Botón de realidad aumentada
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
          whiteSpace: "nowrap",
        });

        modelViewer.appendChild(arButton);

        Object.assign(modelViewer.style, {
          display: "block",
          width: "100%",
          height: "100%",
          background: "transparent",
        });

        containerRef.current.replaceChildren(modelViewer);
      } catch (error) {
        console.error("[Food360 3D] Error cargando el visor:", error);

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
