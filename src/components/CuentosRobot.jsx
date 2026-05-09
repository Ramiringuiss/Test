// ============================================================
// components/CuentosRobot.jsx
// Narra 3 mini-cuentos en secuencia (Costa, Sierra, Selva).
// Al terminar el 3er cuento llama a onCuentosTerminados().
// ============================================================

import { useState, useEffect, useCallback } from "react";
import RobotAmigo from "./RobotAmigo";
import { useSpeech } from "../hooks/useSpeech";

// ── Datos de los 3 cuentos ────────────────────────────────────
const CUENTOS = [
  {
    id: 0,
    region: "🌊 La Costa",
    titulo: "El niño y el mar",
    texto:
      "En la costa del Perú, donde el mar es grande y azul, vivía Mateo. " +
      "Todos los días veía los barcos pesqueros salir tempranito. " +
      "Los pescadores traían cabrillas, anchovetas y pulpos frescos. " +
      "¡La costa es rica en peces y tiene playas hermosas!",
    color: "#0288D1",
    emoji: "🌊",
    fondo: "linear-gradient(135deg, #0288D1 0%, #26C6DA 100%)",
  },
  {
    id: 1,
    region: "⛰️ La Sierra",
    titulo: "La llama y las montañas",
    texto:
      "En la sierra del Perú, las montañas son muy altas y hace frío. " +
      "Allí vive Esperanza con su llama llamada Estrella. " +
      "Ella teje bufandas con lana colorida mientras toma sopita caliente. " +
      "¡La sierra tiene papas, maíz morado y los tesoros de los Incas!",
    color: "#5D4037",
    emoji: "⛰️",
    fondo: "linear-gradient(135deg, #5D4037 0%, #8D6E63 100%)",
  },
  {
    id: 2,
    region: "🌴 La Selva",
    titulo: "El tucán del río grande",
    texto:
      "En la selva del Perú, los árboles son gigantes y hay miles de animales. " +
      "El pequeño Yuri vive cerca del río Amazonas. " +
      "Cada mañana escucha loros, monos y el tucán de pico colorido. " +
      "¡La selva es el pulmón del mundo y tiene frutas riquísimas!",
    color: "#2E7D32",
    emoji: "🌴",
    fondo: "linear-gradient(135deg, #1B5E20 0%, #66BB6A 100%)",
  },
];

// ── Componente ────────────────────────────────────────────────
export default function CuentosRobot({ nombreNino, onCuentosTerminados }) {
  const [indiceCuento, setIndiceCuento] = useState(0);
  const [leyendo, setLeyendo] = useState(false);
  const [terminado, setTerminado] = useState(false);
  const { hablar, callar } = useSpeech();

  const cuento = CUENTOS[indiceCuento];

  // ── Lee el cuento actual al cargar o cambiar de cuento ──────
  const leerCuento = useCallback(
    (cuento, esUltimo) => {
      setLeyendo(true);
      const texto = `${cuento.region}. ${cuento.titulo}. ${cuento.texto}`;

      hablar(texto, {
        onEnd: () => {
          setLeyendo(false);
          if (esUltimo) {
            // Pequeña pausa antes de ir al menú
            setTerminado(true);
            setTimeout(() => {
              onCuentosTerminados();
            }, 1800);
          }
        },
      });
    },
    [hablar, onCuentosTerminados]
  );

  // Iniciar lectura al montar o cuando cambia el cuento
  useEffect(() => {
    const esUltimo = indiceCuento === CUENTOS.length - 1;
    leerCuento(cuento, esUltimo);
    return () => callar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [indiceCuento]);

  // ── Avanzar al siguiente cuento manualmente ─────────────────
  const avanzar = () => {
    callar();
    if (indiceCuento < CUENTOS.length - 1) {
      setIndiceCuento((prev) => prev + 1);
    } else {
      setTerminado(true);
      setTimeout(() => onCuentosTerminados(), 1200);
    }
  };

  // ── Repetir lectura del cuento actual ───────────────────────
  const repetir = () => {
    callar();
    const esUltimo = indiceCuento === CUENTOS.length - 1;
    leerCuento(cuento, esUltimo);
  };

  if (terminado) {
    return (
      <div className="pantalla pantalla-transicion">
        <div className="transicion-contenido">
          <span className="transicion-emoji">🎉</span>
          <h2 className="transicion-texto">¡Escuchaste los 3 cuentos!</h2>
          <p>¡Ahora a jugar!</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="pantalla pantalla-cuento"
      style={{ background: cuento.fondo }}
    >
      {/* ── Indicador de progreso (3 bolitas) ─────────────── */}
      <div className="cuento-progreso" role="progressbar" aria-valuenow={indiceCuento + 1} aria-valuemax={3}>
        {CUENTOS.map((c, i) => (
          <div
            key={c.id}
            className={`progreso-dot ${i <= indiceCuento ? "activo" : ""}`}
            aria-label={`Cuento ${i + 1} de 3${i < indiceCuento ? " completado" : ""}`}
          >
            {c.emoji}
          </div>
        ))}
      </div>

      {/* ── Tarjeta del cuento ────────────────────────────── */}
      <div className="cuento-tarjeta">
        <div className="cuento-region">{cuento.region}</div>
        <h2 className="cuento-titulo">{cuento.titulo}</h2>
        <p className="cuento-texto">{cuento.texto}</p>

        {/* Indicador visual de "leyendo" */}
        {leyendo && (
          <div className="leyendo-indicador" aria-live="polite">
            <span className="onda" />
            <span className="onda" />
            <span className="onda" />
            <span>El robot está leyendo...</span>
          </div>
        )}
      </div>

      {/* ── Robot narrando ────────────────────────────────── */}
      <RobotAmigo
        mensaje={leyendo ? "Escucha el cuento... 🎧" : "¿Listo para seguir? 👉"}
        hablar={false} // El cuento ya se lee en el useEffect
        tamaño="sm"
      />

      {/* ── Botones de control ────────────────────────────── */}
      <div className="cuento-botones">
        <button
          className="btn-bloque btn-amarillo"
          onClick={repetir}
          aria-label="Escuchar el cuento de nuevo"
        >
          🔊 Repetir
        </button>

        <button
          className="btn-bloque btn-verde btn-grande"
          onClick={avanzar}
          aria-label={
            indiceCuento < CUENTOS.length - 1
              ? "Siguiente cuento"
              : "Ir a los juegos"
          }
        >
          {indiceCuento < CUENTOS.length - 1 ? "Siguiente ▶" : "¡A jugar! 🎮"}
        </button>
      </div>
    </div>
  );
}
