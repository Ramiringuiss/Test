// ============================================================
// components/MenuJuegos.jsx
// Menú principal con 3 botones-bloque gigantes estilo Minecraft
// ============================================================

import { useEffect } from "react";
import RobotAmigo from "./RobotAmigo";
import { useSpeech } from "../hooks/useSpeech";

// ── Definición de los 3 minijuegos ──────────────────────────
const JUEGOS = [
  {
    id: "ropa",
    emoji: "👗",
    titulo: "Viste a mi Amiguito",
    descripcion: "Arrastra ropa de la Costa, Sierra y Selva",
    color: "#E91E63",
    colorOscuro: "#880E4F",
    colorTexto: "#fff",
  },
  {
    id: "casita",
    emoji: "🏠",
    titulo: "Encuentra Mi Casita",
    descripcion: "Lleva cada animalito a su región",
    color: "#FF6F00",
    colorOscuro: "#E65100",
    colorTexto: "#fff",
  },
  {
    id: "comida",
    emoji: "🍲",
    titulo: "¿Qué Comemos Hoy?",
    descripcion: "Elige la comida perfecta para el clima",
    color: "#2E7D32",
    colorOscuro: "#1B5E20",
    colorTexto: "#fff",
  },
];

export default function MenuJuegos({ onSeleccionarJuego }) {
  const { hablar } = useSpeech();

  useEffect(() => {
    hablar(
      "¡Muy bien! Escuchaste todos los cuentos. Ahora elige un juego. ¿A cuál quieres jugar?"
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="pantalla pantalla-menu">
      {/* Fondo decorativo con patrón de bloques */}
      <div className="menu-fondo-bloques" aria-hidden="true" />

      <div className="menu-contenido">
        <h1 className="menu-titulo">🎮 ¿A qué jugamos?</h1>

        <RobotAmigo
          mensaje="¡Toca un bloque para jugar! 🎯"
          hablar={false}
          tamaño="sm"
        />

        {/* ── Grilla de 3 bloques ── */}
        <div className="menu-grilla" role="list">
          {JUEGOS.map((juego) => (
            <button
              key={juego.id}
              className="juego-bloque"
              style={{
                "--color-principal": juego.color,
                "--color-oscuro": juego.colorOscuro,
                "--color-texto": juego.colorTexto,
              }}
              onClick={() => {
                hablar(`¡Vamos a jugar ${juego.titulo}!`, {
                  onEnd: () => onSeleccionarJuego(juego.id),
                });
              }}
              role="listitem"
              aria-label={`Jugar ${juego.titulo}: ${juego.descripcion}`}
            >
              {/* Cara superior del bloque (efecto 3D) */}
              <div className="bloque-cara-top" aria-hidden="true" />

              {/* Contenido del bloque */}
              <div className="bloque-contenido">
                <span className="bloque-emoji" aria-hidden="true">
                  {juego.emoji}
                </span>
                <span className="bloque-titulo">{juego.titulo}</span>
                <span className="bloque-desc">{juego.descripcion}</span>
              </div>

              {/* Cara lateral del bloque (efecto 3D) */}
              <div className="bloque-cara-side" aria-hidden="true" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
