"use client";

import React, { useState } from "react";
import {
  Settings,
  Store,
  Clock,
  QrCode,
  CreditCard,
  Bell,
  Save,
  Download,
  Printer,
  CheckCircle2,
  Sliders,
  Globe,
  MapPin,
  Phone,
  Mail,
} from "lucide-react";
import type { RestaurantSettings } from "@/types";

const initialSettings: RestaurantSettings = {
  id: "rest-1",
  name: "Food360 Grill & Bar",
  legalName: "Food360 Hospitality S.L.",
  slug: "food360-grill-bar",
  phone: "+34 912 345 678",
  email: "contacto@food360.com",
  address: "Calle Gran Vía 42, 28013 Madrid, España",
  currency: "EUR",
  currencySymbol: "€",
  taxRatePercent: 10,
  timeZone: "Europe/Madrid",
  openingHours: [
    { day: "Lunes", isOpen: true, openTime: "12:30", closeTime: "23:30" },
    { day: "Martes", isOpen: true, openTime: "12:30", closeTime: "23:30" },
    { day: "Miércoles", isOpen: true, openTime: "12:30", closeTime: "23:30" },
    { day: "Jueves", isOpen: true, openTime: "12:30", closeTime: "23:30" },
    { day: "Viernes", isOpen: true, openTime: "12:30", closeTime: "01:00" },
    { day: "Sábado", isOpen: true, openTime: "13:00", closeTime: "01:30" },
    { day: "Domingo", isOpen: true, openTime: "13:00", closeTime: "23:00" },
  ],
  qrSettings: {
    tablePrefix: "MESA-",
    totalTables: 24,
    allowTableOrdering: true,
    requireCustomerInfo: false,
  },
};

export default function SettingsPage() {
  const [settings, setSettings] = useState<RestaurantSettings>(initialSettings);
  const [activeTab, setActiveTab] = useState<"general" | "hours" | "qr" | "notifications">("general");
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const handleToggleDay = (dayIndex: number) => {
    const updated = [...settings.openingHours];
    updated[dayIndex].isOpen = !updated[dayIndex].isOpen;
    setSettings({ ...settings, openingHours: updated });
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <h1 style={{ fontSize: "1.75rem", fontWeight: 700, color: "var(--text-primary)" }}>
            Configuración del Restaurante
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem" }}>
            Ajustes generales del local, horarios de atención, generación de códigos QR e impuestos.
          </p>
        </div>

        <button
          type="button"
          onClick={handleSave}
          className="btn btn-primary"
          style={{ padding: "0.6rem 1.25rem" }}
        >
          <Save size={18} />
          <span>{isSaved ? "¡Cambios Guardados!" : "Guardar Ajustes"}</span>
        </button>
      </div>

      {/* Tabs */}
      <div
        style={{
          display: "flex",
          gap: "0.5rem",
          borderBottom: "1px solid var(--border-color)",
          paddingBottom: "0.25rem",
        }}
      >
        <button
          type="button"
          onClick={() => setActiveTab("general")}
          className="btn"
          style={{
            color: activeTab === "general" ? "var(--primary)" : "var(--text-secondary)",
            borderBottom: activeTab === "general" ? "2px solid var(--primary)" : "none",
            borderRadius: "0",
            padding: "0.6rem 1rem",
            fontSize: "0.875rem",
            fontWeight: 600,
          }}
        >
          <Store size={16} /> Perfil & Local
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("hours")}
          className="btn"
          style={{
            color: activeTab === "hours" ? "var(--primary)" : "var(--text-secondary)",
            borderBottom: activeTab === "hours" ? "2px solid var(--primary)" : "none",
            borderRadius: "0",
            padding: "0.6rem 1rem",
            fontSize: "0.875rem",
            fontWeight: 600,
          }}
        >
          <Clock size={16} /> Horarios de Atención
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("qr")}
          className="btn"
          style={{
            color: activeTab === "qr" ? "var(--primary)" : "var(--text-secondary)",
            borderBottom: activeTab === "qr" ? "2px solid var(--primary)" : "none",
            borderRadius: "0",
            padding: "0.6rem 1rem",
            fontSize: "0.875rem",
            fontWeight: 600,
          }}
        >
          <QrCode size={16} /> Mesas y Códigos QR
        </button>
      </div>

      {/* Tab: General */}
      {activeTab === "general" && (
        <div className="ui-card" style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          <h2 style={{ fontSize: "1.15rem", fontWeight: 700 }}>Información del Establecimiento</h2>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem" }}>
            <div>
              <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, marginBottom: "0.4rem" }}>
                Nombre Comercial
              </label>
              <input
                type="text"
                value={settings.name}
                onChange={(e) => setSettings({ ...settings, name: e.target.value })}
                className="input-control"
              />
            </div>
            <div>
              <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, marginBottom: "0.4rem" }}>
                Razón Social / CIF
              </label>
              <input
                type="text"
                value={settings.legalName || ""}
                onChange={(e) => setSettings({ ...settings, legalName: e.target.value })}
                className="input-control"
              />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem" }}>
            <div>
              <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, marginBottom: "0.4rem" }}>
                Teléfono de Contacto
              </label>
              <input
                type="text"
                value={settings.phone}
                onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                className="input-control"
              />
            </div>
            <div>
              <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, marginBottom: "0.4rem" }}>
                Correo de Notificaciones
              </label>
              <input
                type="email"
                value={settings.email}
                onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                className="input-control"
              />
            </div>
          </div>

          <div>
            <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, marginBottom: "0.4rem" }}>
              Dirección Física
            </label>
            <input
              type="text"
              value={settings.address}
              onChange={(e) => setSettings({ ...settings, address: e.target.value })}
              className="input-control"
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1.25rem" }}>
            <div>
              <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, marginBottom: "0.4rem" }}>
                Moneda
              </label>
              <select
                value={settings.currency}
                onChange={(e) => setSettings({ ...settings, currency: e.target.value })}
                className="input-control"
              >
                <option value="EUR">EUR (€)</option>
                <option value="USD">USD ($)</option>
                <option value="MXN">MXN ($)</option>
                <option value="COP">COP ($)</option>
              </select>
            </div>
            <div>
              <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, marginBottom: "0.4rem" }}>
                Tasa de IVA / Impuesto (%)
              </label>
              <input
                type="number"
                value={settings.taxRatePercent}
                onChange={(e) => setSettings({ ...settings, taxRatePercent: parseFloat(e.target.value) || 0 })}
                className="input-control"
              />
            </div>
            <div>
              <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, marginBottom: "0.4rem" }}>
                Zona Horaria
              </label>
              <input
                type="text"
                disabled
                value={settings.timeZone}
                className="input-control"
                style={{ opacity: 0.7 }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Tab: Opening Hours */}
      {activeTab === "hours" && (
        <div className="ui-card">
          <h2 style={{ fontSize: "1.15rem", fontWeight: 700, marginBottom: "0.25rem" }}>
            Horarios Semanales de Servicio
          </h2>
          <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "1.5rem" }}>
            Los pedidos desde la carta digital QR se deshabilitarán automáticamente fuera de estos horarios.
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            {settings.openingHours.map((slot, idx) => (
              <div
                key={slot.day}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "0.75rem 1rem",
                  backgroundColor: "var(--bg-input)",
                  borderRadius: "var(--radius-md)",
                  border: "1px solid var(--border-color)",
                }}
              >
                <div style={{ width: "120px", fontWeight: 600 }}>{slot.day}</div>

                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                  <label className="switch-label">
                    <input
                      type="checkbox"
                      checked={slot.isOpen}
                      onChange={() => handleToggleDay(idx)}
                    />
                    <span className="switch-slider" />
                  </label>
                  <span style={{ fontSize: "0.8rem", width: "70px", color: slot.isOpen ? "var(--success)" : "var(--text-muted)" }}>
                    {slot.isOpen ? "Abierto" : "Cerrado"}
                  </span>
                </div>

                {slot.isOpen ? (
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <input
                      type="time"
                      value={slot.openTime}
                      className="input-control"
                      style={{ width: "110px", padding: "0.35rem 0.5rem" }}
                      onChange={(e) => {
                        const updated = [...settings.openingHours];
                        updated[idx].openTime = e.target.value;
                        setSettings({ ...settings, openingHours: updated });
                      }}
                    />
                    <span style={{ color: "var(--text-muted)" }}>a</span>
                    <input
                      type="time"
                      value={slot.closeTime}
                      className="input-control"
                      style={{ width: "110px", padding: "0.35rem 0.5rem" }}
                      onChange={(e) => {
                        const updated = [...settings.openingHours];
                        updated[idx].closeTime = e.target.value;
                        setSettings({ ...settings, openingHours: updated });
                      }}
                    />
                  </div>
                ) : (
                  <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                    Servicio suspendido todo el día
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab: QR & Tables */}
      {activeTab === "qr" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
          {/* QR Config */}
          <div className="ui-card" style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            <h2 style={{ fontSize: "1.15rem", fontWeight: 700 }}>Parámetros de Mesas y QR</h2>

            <div>
              <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, marginBottom: "0.4rem" }}>
                Total de Mesas Físicas en el Local
              </label>
              <input
                type="number"
                value={settings.qrSettings.totalTables}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    qrSettings: { ...settings.qrSettings, totalTables: parseInt(e.target.value, 10) || 1 },
                  })
                }
                className="input-control"
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, marginBottom: "0.4rem" }}>
                Prefijo Identificador de Mesa
              </label>
              <input
                type="text"
                value={settings.qrSettings.tablePrefix}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    qrSettings: { ...settings.qrSettings, tablePrefix: e.target.value },
                  })
                }
                className="input-control"
              />
            </div>

            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: "0.5rem" }}>
              <div>
                <span style={{ fontSize: "0.85rem", fontWeight: 600, display: "block" }}>
                  Permitir Pedidos Directos desde QR
                </span>
                <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                  Los clientes pueden enviar comandas a cocina sin esperar al mesero.
                </span>
              </div>
              <label className="switch-label">
                <input
                  type="checkbox"
                  checked={settings.qrSettings.allowTableOrdering}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      qrSettings: { ...settings.qrSettings, allowTableOrdering: e.target.checked },
                    })
                  }
                />
                <span className="switch-slider" />
              </label>
            </div>
          </div>

          {/* QR Preview & Batch Generator */}
          <div className="ui-card" style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", padding: "2rem" }}>
            <div
              style={{
                width: "140px",
                height: "140px",
                backgroundColor: "#ffffff",
                borderRadius: "16px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: "1rem",
                boxShadow: "var(--shadow-md)",
              }}
            >
              <QrCode size={110} color="#0b0f19" />
            </div>

            <h3 style={{ fontSize: "1.1rem", fontWeight: 700 }}>Kit de QR de Mesa Generado</h3>
            <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginTop: "0.25rem", maxWidth: "320px" }}>
              Descarga o imprime las etiquetas plastificadas listas con el logo del local y enlace a la carta.
            </p>

            <div style={{ display: "flex", gap: "0.75rem", marginTop: "1.5rem" }}>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => alert(`Generando PDF con ${settings.qrSettings.totalTables} códigos QR listos para imprimir...`)}
              >
                <Download size={16} /> Descargar Kit PDF
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => alert("Abriendo diálogo de impresión de comandas...")}
              >
                <Printer size={16} /> Imprimir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
