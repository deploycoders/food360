"use client";

import React, { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Copy, Download, ExternalLink, QrCode, X } from "lucide-react";
import QRCode from "qrcode";

import type { Table } from "@food360/types";

interface TableQrModalProps {
  isOpen: boolean;
  table: Table | null;
  onClose: () => void;
}

const PUBLIC_BASE_URL =
  process.env.NEXT_PUBLIC_PUBLIC_APP_URL ??
  (typeof window !== "undefined"
    ? window.location.origin
    : "http://localhost:3000");

export function TableQrModal({ isOpen, table, onClose }: TableQrModalProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [qrUrl, setQrUrl] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!isOpen || !table?.publicCode) {
      setQrUrl("");
      return;
    }

    const url = `${PUBLIC_BASE_URL}/r/${table.publicCode}`;

    setQrUrl(url);

    QRCode.toCanvas(
      canvasRef.current,
      url,
      {
        width: 280,
        margin: 2,
        errorCorrectionLevel: "H",
      },
      (error) => {
        if (error) {
          console.error("Error generando QR:", error);
        }
      },
    );
  }, [isOpen, table]);

  useEffect(() => {
    if (!isOpen) {
      setCopied(false);
    }
  }, [isOpen]);

  const handleCopy = async () => {
    if (!qrUrl) return;

    try {
      await navigator.clipboard.writeText(qrUrl);

      setCopied(true);

      window.setTimeout(() => {
        setCopied(false);
      }, 1800);
    } catch (error) {
      console.error("Error copiando URL del QR:", error);
    }
  };

  const handleDownload = () => {
    const canvas = canvasRef.current;

    if (!canvas || !table) return;

    const link = document.createElement("a");

    link.download = `mesa-${table.tableNumber}-qr.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  const handleOpenLink = () => {
    if (!qrUrl) return;

    window.open(qrUrl, "_blank", "noopener,noreferrer");
  };

  const handleClose = () => {
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && table && (
        <motion.div
          className="fixed inset-0 z-110 flex items-end justify-center bg-black/60 p-0 backdrop-blur-sm sm:items-center sm:p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              handleClose();
            }
          }}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="table-qr-title"
            className="w-full overflow-hidden rounded-t-3xl border border-border bg-card shadow-2xl sm:max-w-md sm:rounded-3xl"
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.98 }}
            transition={{
              duration: 0.2,
              ease: "easeOut",
            }}
          >
            {/* Header */}
            <div className="flex items-start justify-between gap-4 border-b border-border px-5 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-accent/20 bg-accent/10 text-accent">
                  <QrCode className="h-5 w-5" />
                </div>

                <div>
                  <h2
                    id="table-qr-title"
                    className="text-base font-bold tracking-tight text-foreground"
                  >
                    QR de Mesa #{table.tableNumber}
                  </h2>

                  <p className="mt-0.5 text-xs text-muted-foreground">
                    Código de acceso para esta mesa.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleClose}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                aria-label="Cerrar"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* QR */}
            <div className="flex flex-col items-center px-5 pb-6 pt-6">
              <div className="rounded-3xl border border-border bg-white p-4 shadow-sm">
                <canvas ref={canvasRef} className="block h-auto w-60 sm:w-70" />
              </div>

              <div className="mt-5 text-center">
                <p className="text-sm font-semibold text-foreground">
                  Escanea este código para acceder
                </p>

                <p className="mx-auto mt-1 max-w-xs text-xs leading-relaxed text-muted-foreground">
                  Este QR está asociado permanentemente a la Mesa{" "}
                  <span className="font-semibold text-foreground">
                    #{table.tableNumber}
                  </span>
                  .
                </p>
              </div>

              {/* URL */}
              {qrUrl && (
                <div className="mt-4 flex w-full items-center gap-2 rounded-xl border border-border bg-background px-3 py-2">
                  <p className="min-w-0 flex-1 truncate text-[10px] text-muted-foreground">
                    {qrUrl}
                  </p>

                  <button
                    type="button"
                    onClick={handleCopy}
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                    title={copied ? "Copiado" : "Copiar enlace"}
                    aria-label={copied ? "Enlace copiado" : "Copiar enlace"}
                  >
                    {copied ? (
                      <Check className="h-4 w-4 text-success" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </button>
                </div>
              )}

              {/* Actions */}
              <div className="mt-5 grid w-full grid-cols-1 gap-2 sm:grid-cols-3">
                <button
                  type="button"
                  onClick={handleDownload}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-accent px-4 py-2.5 text-xs font-semibold text-accent-foreground shadow-sm transition-all hover:opacity-90 active:scale-[0.98]"
                >
                  <Download className="h-4 w-4" />
                  Descargar
                </button>

                <button
                  type="button"
                  onClick={handleOpenLink}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-background px-4 py-2.5 text-xs font-semibold text-foreground transition-colors hover:bg-muted"
                >
                  <ExternalLink className="h-4 w-4" />
                  Abrir
                </button>

                <button
                  type="button"
                  onClick={handleClose}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-background px-4 py-2.5 text-xs font-semibold text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
