"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  CheckSquare,
  AlertTriangle,
  Search,
  Filter,
  ArrowLeft,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Sparkles,
  Flame,
} from "lucide-react";
import type { Product } from "@/types";

const initialStockItems: Product[] = [
  {
    id: "prod-1",
    restaurantId: "rest-1",
    categoryId: "cat-1",
    categoryName: "Hamburguesas",
    name: "Hamburguesa Trufada Angus",
    price: 18.5,
    isAvailable: true,
    createdAt: "",
    updatedAt: "",
  },
  {
    id: "prod-2",
    restaurantId: "rest-1",
    categoryId: "cat-2",
    categoryName: "Pizzas",
    name: "Pizza Napolitana Burrata",
    price: 22.0,
    isAvailable: true,
    createdAt: "",
    updatedAt: "",
  },
  {
    id: "prod-3",
    restaurantId: "rest-1",
    categoryId: "cat-3",
    categoryName: "Carnes & Brasas",
    name: "Costillas BBQ Ahumadas 500g",
    price: 28.0,
    isAvailable: true,
    createdAt: "",
    updatedAt: "",
  },
  {
    id: "prod-4",
    restaurantId: "rest-1",
    categoryId: "cat-4",
    categoryName: "Bowls & Saludable",
    name: "Poke Bowl Salmón Fresco",
    price: 17.5,
    isAvailable: false,
    createdAt: "",
    updatedAt: "",
  },
  {
    id: "prod-5",
    restaurantId: "rest-1",
    categoryId: "cat-5",
    categoryName: "Bebidas",
    name: "Cerveza Artesanal IPA Doble Lúpulo",
    price: 6.5,
    isAvailable: true,
    createdAt: "",
    updatedAt: "",
  },
  {
    id: "prod-6",
    restaurantId: "rest-1",
    categoryId: "cat-1",
    categoryName: "Hamburguesas",
    name: "Smash Cheeseburger Doble",
    price: 14.0,
    isAvailable: true,
    createdAt: "",
    updatedAt: "",
  },
  {
    id: "prod-7",
    restaurantId: "rest-1",
    categoryId: "cat-5",
    categoryName: "Bebidas",
    name: "Vino Tinto Ribera del Duero (Copa)",
    price: 5.5,
    isAvailable: false,
    createdAt: "",
    updatedAt: "",
  },
];

export default function StockControlPage() {
  const [stockItems, setStockItems] = useState<Product[]>(initialStockItems);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterAvailability, setFilterAvailability] = useState<"all" | "in_stock" | "out_of_stock">("all");

  const toggleProduct = (id: string) => {
    setStockItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, isAvailable: !item.isAvailable } : item))
    );
  };

  const handleBulkSet = (status: boolean) => {
    setStockItems((prev) => prev.map((item) => ({ ...item, isAvailable: status })));
  };

  const filteredItems = stockItems.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.categoryName && item.categoryName.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesFilter =
      filterAvailability === "all" ||
      (filterAvailability === "in_stock" && item.isAvailable) ||
      (filterAvailability === "out_of_stock" && !item.isAvailable);
    return matchesSearch && matchesFilter;
  });

  const outOfStockCount = stockItems.filter((i) => !i.isAvailable).length;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <Link
            href="/menu"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.4rem",
              fontSize: "0.8rem",
              color: "var(--primary)",
              marginBottom: "0.25rem",
            }}
          >
            <ArrowLeft size={14} /> Volver a la Carta
          </Link>
          <h1 style={{ fontSize: "1.75rem", fontWeight: 700, color: "var(--text-primary)" }}>
            Control Rápido de Stock & Disponibilidad
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem" }}>
            Habilita o pausa platillos al instante según el inventario en cocina o barra.
          </p>
        </div>

        {outOfStockCount > 0 && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              backgroundColor: "rgba(239, 68, 68, 0.15)",
              border: "1px solid rgba(239, 68, 68, 0.3)",
              padding: "0.5rem 1rem",
              borderRadius: "var(--radius-md)",
              color: "var(--danger)",
              fontWeight: 600,
              fontSize: "0.85rem",
            }}
          >
            <AlertTriangle size={18} />
            <span>{outOfStockCount} productos agotados actualmente</span>
          </div>
        )}
      </div>

      {/* Action Controls & Search */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "1rem",
          padding: "1rem",
          backgroundColor: "var(--bg-card)",
          borderRadius: "var(--radius-md)",
          border: "1px solid var(--border-color)",
        }}
      >
        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
          <button
            type="button"
            onClick={() => setFilterAvailability("all")}
            className="btn"
            style={{
              fontSize: "0.8rem",
              padding: "0.4rem 0.8rem",
              backgroundColor: filterAvailability === "all" ? "var(--primary)" : "var(--bg-muted)",
              color: filterAvailability === "all" ? "#fff" : "var(--text-secondary)",
            }}
          >
            Todos ({stockItems.length})
          </button>
          <button
            type="button"
            onClick={() => setFilterAvailability("in_stock")}
            className="btn"
            style={{
              fontSize: "0.8rem",
              padding: "0.4rem 0.8rem",
              backgroundColor: filterAvailability === "in_stock" ? "var(--success)" : "var(--bg-muted)",
              color: filterAvailability === "in_stock" ? "#fff" : "var(--text-secondary)",
            }}
          >
            En Stock ({stockItems.filter((i) => i.isAvailable).length})
          </button>
          <button
            type="button"
            onClick={() => setFilterAvailability("out_of_stock")}
            className="btn"
            style={{
              fontSize: "0.8rem",
              padding: "0.4rem 0.8rem",
              backgroundColor: filterAvailability === "out_of_stock" ? "var(--danger)" : "var(--bg-muted)",
              color: filterAvailability === "out_of_stock" ? "#fff" : "var(--text-secondary)",
            }}
          >
            Agotados ({outOfStockCount})
          </button>
        </div>

        <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
          <div style={{ position: "relative" }}>
            <Search
              size={14}
              color="var(--text-muted)"
              style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)" }}
            />
            <input
              type="text"
              placeholder="Buscar producto..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-control"
              style={{ paddingLeft: "32px", fontSize: "0.8rem", height: "34px", width: "200px" }}
            />
          </div>

          <button
            type="button"
            onClick={() => handleBulkSet(true)}
            className="btn btn-secondary"
            style={{ fontSize: "0.75rem", padding: "0.4rem 0.75rem" }}
          >
            Habilitar Todos
          </button>
          <button
            type="button"
            onClick={() => handleBulkSet(false)}
            className="btn btn-danger"
            style={{ fontSize: "0.75rem", padding: "0.4rem 0.75rem" }}
          >
            Pausar Todos
          </button>
        </div>
      </div>

      {/* Grid of Switch Cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
          gap: "1rem",
        }}
      >
        {filteredItems.map((item) => (
          <div
            key={item.id}
            onClick={() => toggleProduct(item.id)}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "1.25rem",
              backgroundColor: item.isAvailable ? "var(--bg-card)" : "rgba(239, 68, 68, 0.08)",
              border: "1px solid",
              borderColor: item.isAvailable ? "var(--border-color)" : "rgba(239, 68, 68, 0.4)",
              borderRadius: "var(--radius-md)",
              cursor: "pointer",
              transition: "all 0.15s ease",
            }}
          >
            <div>
              <span
                style={{
                  fontSize: "0.7rem",
                  fontWeight: 700,
                  color: "var(--text-muted)",
                  textTransform: "uppercase",
                }}
              >
                {item.categoryName}
              </span>
              <h3 style={{ fontSize: "0.95rem", fontWeight: 700, color: "var(--text-primary)", marginTop: "0.2rem" }}>
                {item.name}
              </h3>
              <span style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--primary)" }}>
                ${item.price.toFixed(2)}
              </span>
            </div>

            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "0.35rem" }}>
              <label className="switch-label" onClick={(e) => e.stopPropagation()}>
                <input
                  type="checkbox"
                  checked={item.isAvailable}
                  onChange={() => toggleProduct(item.id)}
                />
                <span className="switch-slider" />
              </label>
              <span
                style={{
                  fontSize: "0.7rem",
                  fontWeight: 700,
                  color: item.isAvailable ? "var(--success)" : "var(--danger)",
                }}
              >
                {item.isAvailable ? "DISPONIBLE" : "AGOTADO"}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
