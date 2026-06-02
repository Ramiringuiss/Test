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
    region: "🌳 El Bosque",
    titulo: "El Zorrito y la Mariposa",
    texto:
      "Un día, un pequeño zorrito caminaba por el bosque. Él estaba asustado. " +
      "De pronto, vio una hermosa mariposa. La mariposa volaba y danzaba alegremente. " +
      "El zorrito preguntó: ¡Mariposa! ¿Por qué estás tan feliz? " +
      "La mariposa respondió: ¡Mira las flores! ¡Mira el hermoso sol! " +
      "Entonces el zorrito sonrió y comenzó a bailar junto con la mariposa. " +
      "Desde ese momento, ambos se hicieron muy buenos amigos.",
    color: "#F57F17",
    emoji: "🦊",
    fondo: "#dcba85",
  },
  {
    id: 1,
    region: "🐔 La Granja",
    titulo: "Cinco Pollitos",
    texto:
      "Una gallina tenía cinco pollitos. " +
      "Dice que uno de ellos se fue siguiendo al zorro, solo quedaron cuatro pollitos en su casa. " +
      "Dice que otro de los pollitos se fue a jugar con el gato, solo quedaron tres pollitos en su casa. " +
      "Dice que otro de los pollitos se fue a buscar lombrices, solo quedaron dos pollitos en su casa. " +
      "Dice que otro de los pollitos se fue a rascar la tierra de la chacra, solo quedó un pollito en su casa. " +
      "Un águila se llevó volando al último pollito. Dice que así, se perdieron todos los pollitos. " +
      "La mamá gallina los buscó con tristeza. Después, los buscó enojada. " +
      "Gritaba lleno de su boca, correteaba de arriba a abajo. " +
      "Entonces la tierra Pachamama tembló. Y desde aquí y desde allá, regresaron los pollitos. " +
      "Una gallina tenía cinco pollitos. Los criaba a los cinco acurrucados bajo sus alas. Los criaba a los cinco con mucho cariño. Fin.",
    color: "#FFD600",
    emoji: "🐥",
    fondo: "#ecc796",
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
