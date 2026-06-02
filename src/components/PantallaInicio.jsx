// ============================================================
// components/PantallaInicio.jsx
// FIX: desbloquearVoz() se llama en el onClick del botón "Jugar"
// Esto es obligatorio — el navegador no permite audio antes del primer clic.
// ============================================================

import { useEffect } from "react";
import RobotAmigo from "./RobotAmigo";
import { useSpeech, desbloquearVoz } from "../hooks/useSpeech";

export default function PantallaInicio({ nombreNino, onJugar }) {
  const { hablar } = useSpeech();

  // Intentar saludo al montar (ResponsiveVoice lo maneja mejor)
  useEffect(() => {
    console.log("📱 PantallaInicio montada");
  }, []);

  const handleJugar = () => {
    console.log("🎮 Botón 'Jugar' clickeado");

    // Desbloquear audio (a veces es necesario en algunos navegadores)
    desbloquearVoz();

    // Hablar y navegar al terminar la voz para evitar cortar el audio.
    hablar("¡Vamos a aprender sobre el Perú!", {
      onEnd: () => {
        console.log("➡️ Voz de bienvenida terminada, navegando...");
        onJugar();
      },
    });
  };

  return (
    <div className="pantalla pantalla-inicio">
      <div className="bloques-deco" aria-hidden="true">
        {["🌊","⛰️","🌴","🦜","🦙","🐟"].map((emoji, i) => (
          <span key={i} className={`bloque-deco bloque-deco-${i}`}>{emoji}</span>
        ))}
      </div>

      <div className="inicio-contenido">
        <h1 className="titulo-principal">
          <span className="titulo-pixel">🤖 Mundo mágico</span>
        </h1>
        <p className="subtitulo">¡Aprende sobre el Perú jugando!</p>

        <RobotAmigo
          mensaje={`¡Hola ${nombreNino}! ¿Listo para jugar? 🎮`}
          hablar={false}
          tamaño="lg"
        />

        <button
          className="btn-bloque btn-verde btn-gigante"
          onClick={handleJugar}
          aria-label="Comenzar a jugar"
        >
          <span className="btn-icono">▶</span> ¡Jugar!
        </button>

        <p className="instruccion-texto" style={{ fontSize: "0.75rem", marginTop: "0.5rem" }}>
          🔊 Activa el volumen de tu dispositivo
        </p>
      </div>
    </div>
  );
}
