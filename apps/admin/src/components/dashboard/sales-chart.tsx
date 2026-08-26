import React from "react";

const chartData = [
  { hour: "11:00", value: 30 },
  { hour: "12:00", value: 60 },
  { hour: "13:00", value: 95 },
  { hour: "14:00", value: 85 },
  { hour: "15:00", value: 50 },
  { hour: "16:00", value: 25 },
  { hour: "17:00", value: 40 },
  { hour: "18:00", value: 70 },
  { hour: "19:00", value: 90 },
  { hour: "20:00", value: 100 },
  { hour: "21:00", value: 65 },
];

export function SalesChart() {
  return (
    <div className="p-5 rounded-xl bg-card border border-border">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-sm font-bold text-foreground">
            Flujo de Ventas por Hora
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Volumen de facturación y horas pico
          </p>
        </div>
        <span className="text-[11px] font-semibold text-accent px-2.5 py-1 rounded-md bg-accent/10 border border-accent/20">
          Hora Pico: 13:00 - 15:00
        </span>
      </div>

      <div className="h-48 flex items-end justify-between gap-2 pt-4 pb-1.5 border-b border-border">
        {chartData.map((bar) => (
          <div
            key={bar.hour}
            className="group flex-1 flex flex-col items-center gap-2 h-full justify-end"
          >
            <div
              style={{ height: `${bar.value}%` }}
              className={`w-full rounded-t transition-colors ${
                bar.value > 80
                  ? "bg-accent"
                  : "bg-muted group-hover:bg-muted/80"
              }`}
            />
            <span className="text-[10px] text-muted-foreground group-hover:text-foreground transition-colors">
              {bar.hour}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
