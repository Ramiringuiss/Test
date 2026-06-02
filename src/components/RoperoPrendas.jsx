import { useState } from "react";

const PRENDAS = [
  { id: "sombrero_paja",  zona: "cabeza",   region: "Costa",  nombre: "Sombrero de Paja",   emoji: "👒" },
  { id: "chullo",         zona: "cabeza",   region: "Sierra", nombre: "Chullo de Lana",      emoji: "🧢" },
  { id: "corona_plumas",  zona: "cabeza",   region: "Selva",  nombre: "Corona de Plumas",    emoji: "🪶" },
  { id: "camiseta_costa", zona: "cuerpo",   region: "Costa",  nombre: "Camiseta de Playa",   emoji: "👕" },
  { id: "poncho_sierra",  zona: "cuerpo",   region: "Sierra", nombre: "Poncho de Lana",       emoji: "🧣" },
  { id: "cushma_selva",   zona: "cuerpo",   region: "Selva",  nombre: "Cushma",               emoji: "👘" },
  { id: "sandalias",      zona: "pies",     region: "Costa",  nombre: "Sandalias",            emoji: "🩴" },
  { id: "ojotas",         zona: "pies",     region: "Sierra", nombre: "Ojotas",               emoji: "👟" },
  { id: "descalzo",       zona: "pies",     region: "Selva",  nombre: "Pie Descalzo",         emoji: "🦶" },
  { id: "lentes",         zona: "acc_cara", region: "todos",  nombre: "Lentes",               emoji: "👓" },
  { id: "audifonos",      zona: "acc_cara", region: "todos",  nombre: "Audífonos",            emoji: "🎧" },
  { id: "silla_ruedas",   zona: "acc_mov",  region: "todos",  nombre: "Silla de Ruedas",      emoji: "♿" },
  { id: "baston",         zona: "acc_mov",  region: "todos",  nombre: "Bastón",               emoji: "🦯" },
];

const ZONAS = [
  { id: "cabeza", label: "Cabeza", emoji: "🎩" },
  { id: "cuerpo", label: "Cuerpo", emoji: "👕" },
  { id: "pies", label: "Pies", emoji: "👟" },
  { id: "acc_cara", label: "Accesorios cara", emoji: "👓" },
  { id: "acc_mov", label: "Accesorios movilidad", emoji: "♿" },
];

export default function RoperoPrendas({ prendas, onSeleccionar, onQuitar, zonaActiva }) {
  // Si viene `zonaActiva`, mostramos solo las opciones de esa zona (diseño derecha)
  if (zonaActiva) {
    const zona = ZONAS.find(z => z.id === zonaActiva) || { id: zonaActiva, label: zonaActiva };
    const items = PRENDAS.filter(p => p.zona === zonaActiva);

    return (
      <div style={{ width: 300, minWidth: 220 }}>
        <div style={{
          background: "rgba(240,231,219,0.95)",
          borderRadius: 8,
          padding: "0.8rem",
          border: "1px solid rgba(0,0,0,0.08)",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
            <div style={{ fontSize: 28 }}>{zona.emoji}</div>
            <p style={{ fontSize: "0.95rem", fontWeight: 900, color: "#2E7D32", margin: 0 }}>
              {zona.label}
            </p>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", marginBottom: "0.5rem" }}>
            {items.map(prenda => {
              const seleccionada = prendas[zona.id]?.id === prenda.id;
              return (
                <button
                  key={prenda.id}
                  onClick={() => onSeleccionar(prenda)}
                  style={{
                      width: "100%",
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      padding: "0.6rem",
                      borderRadius: 10,
                      border: seleccionada ? "2px solid #FFD600" : "1px solid rgba(207, 12, 12, 0.85)",
                      background: seleccionada ? "rgba(255,214,0,0.18)" : "rgba(255,255,255,0.92)",
                      cursor: "pointer",
                      textAlign: "left",
                    }}
                  title={`${prenda.nombre} (${prenda.region})`}
                >
                  <div style={{ fontSize: 22 }}>{prenda.emoji}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 800, color: "#1f1f1f" }}>{prenda.nombre}</div>
                    <div style={{ fontSize: 12, color: "rgba(0,0,0,0.6)" }}>{prenda.region}</div>
                  </div>
                </button>
              );
            })}
          </div>

          {prendas[zona.id] && (
            <button
              onClick={() => onQuitar(zona.id)}
              style={{
                width: "100%",
                padding: "0.4rem",
                background: "rgba(255,107,53,0.3)",
                border: "1px solid #FF6B35",
                color: "#FF6B35",
                borderRadius: 6,
                fontSize: "0.75rem",
                fontWeight: 800,
                cursor: "pointer",
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => e.target.style.background = "rgba(255,107,53,0.6)"}
              onMouseLeave={(e) => e.target.style.background = "rgba(255,107,53,0.3)"}
            >
              ✕ Quitar
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div style={{ flex: 1, minWidth: 250 }}>
      {ZONAS.map(zona => (
        <div 
          key={zona.id}
          style={{
            background: "rgba(240,231,219,0.95)",
            borderRadius: 8,
            padding: "0.8rem",
            marginBottom: "1rem",
            border: "1px solid rgba(0,0,0,0.08)",
          }}
        >
          <p style={{ fontSize: "0.75rem", fontWeight: 800, color: "#2E7D32", marginBottom: "0.6rem" }}>
            {zona.label}
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", marginBottom: "0.5rem" }}>
            {PRENDAS
              .filter(p => p.zona === zona.id)
              .map(prenda => {
                const seleccionada = prendas[zona.id]?.id === prenda.id;
                return (
                  <button
                    key={prenda.id}
                    onClick={() => onSeleccionar(prenda)}
                    style={{
                      width: "100%",
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      padding: "0.6rem",
                      borderRadius: 10,
                      border: seleccionada ? "2px solid #FFD600" : "1px solid rgba(0,0,0,0.06)",
                      background: seleccionada ? "rgba(255,214,0,0.18)" : "rgba(255,255,255,0.92)",
                      cursor: "pointer",
                      textAlign: "left",
                    }}
                    title={`${prenda.nombre} (${prenda.region})`}
                  >
                    <div style={{ fontSize: 22 }}>{prenda.emoji}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 800, color: "#1f1f1f" }}>{prenda.nombre}</div>
                      <div style={{ fontSize: 12, color: "rgba(0,0,0,0.6)" }}>{prenda.region}</div>
                    </div>
                  </button>
                );
              })}
          </div>

          {prendas[zona.id] && (
            <button
              onClick={() => onQuitar(zona.id)}
              style={{
                width: "100%",
                padding: "0.4rem",
                background: "rgba(255,107,53,0.3)",
                border: "1px solid #FF6B35",
                color: "#FF6B35",
                borderRadius: 6,
                fontSize: "0.75rem",
                fontWeight: 800,
                cursor: "pointer",
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => e.target.style.background = "rgba(255,107,53,0.6)"}
              onMouseLeave={(e) => e.target.style.background = "rgba(255,107,53,0.3)"}
            >
              ✕ Quitar
            </button>
          )}
        </div>
      ))}
    </div>
  );
}