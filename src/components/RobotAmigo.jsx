// ============================================================
// components/RobotAmigo.jsx
// El personaje robot que aparece en todas las pantallas.
// Muestra un mensaje y lo habla en voz alta automáticamente.
// ============================================================

import { useEffect } from "react";
import { useSpeech } from "../hooks/useSpeech";
import papapePng from "../papape.png";

/**
 * Props:
 *   mensaje  (string)   → Texto que el robot muestra y dice en voz alta
 *   hablar   (bool)     → Si true, narra el mensaje al montarse/cambiarlo
 *   onFinVoz (func)     → Callback opcional al terminar de hablar
 *   tamaño   ("sm"|"md"|"lg") → Tamaño del avatar
 */
export default function RobotAmigo({
  mensaje = "",
  hablar = true,
  onFinVoz,
  tamaño = "md",
  cargando = false,
}) {
  const { hablar: decir, callar } = useSpeech();

  // Hablar cada vez que cambia el mensaje
  useEffect(() => {
    if (hablar && mensaje) {
      decir(mensaje, { onEnd: onFinVoz });
    }
    // No cancelamos la voz al desmontar porque el audio puede pertenecer a otra pantalla.
    // ResponsiveVoice ya se encarga de reemplazar la voz cuando inicia un nuevo speak.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mensaje]);

  const sizeMap = { sm: 80, md: 120, lg: 160 };
  const px = sizeMap[tamaño] ?? 120;

  return (
    <div className={`robot-amigo robot-${tamaño} ${cargando ? "robot-cargando" : ""}`}>
      {/* ── Avatar de la Papa Peruana Amiga ── */}
      <div className="robot-avatar" aria-hidden="true">
        <img
          src={papapePng}
          alt="Papa Peruana Amiga"
          style={{
            width: px,
            height: px,
            objectFit: "contain",
          }}
        />
      </div>

      {/* ── Burbuja de diálogo ── */}
      {mensaje && (
        <div className="robot-burbuja" role="status" aria-live="polite">
          <span className="robot-burbuja-texto">{mensaje}</span>
        </div>
      )}
      {cargando && (
        <div className="robot-loading">
          <span className="robot-punto">●</span>
          <span className="robot-punto">●</span>
          <span className="robot-punto">●</span>
        </div>
      )}
    </div>
  );
}
