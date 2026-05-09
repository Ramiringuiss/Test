// ============================================================
// components/RobotAmigo.jsx
// El personaje robot que aparece en todas las pantallas.
// Muestra un mensaje y lo habla en voz alta automáticamente.
// ============================================================

import { useEffect } from "react";
import { useSpeech } from "../hooks/useSpeech";

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
    <div className="robot-container" style={{ "--robot-size": `${px}px` }}>
      {/* ── Avatar del Robot (SVG inline para no depender de assets) ── */}
      <div className="robot-avatar" aria-hidden="true">
        <svg
          width={px}
          height={px}
          viewBox="0 0 100 100"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Cuerpo */}
          <rect x="20" y="40" width="60" height="45" rx="4" fill="#4CAF50" />
          {/* Cabeza */}
          <rect x="25" y="10" width="50" height="35" rx="4" fill="#66BB6A" />
          {/* Antena */}
          <rect x="47" y="2" width="6" height="12" rx="2" fill="#FFD700" />
          <circle cx="50" cy="2" r="4" fill="#FF6B35" />
          {/* Ojos */}
          <rect x="33" y="18" width="12" height="10" rx="2" fill="#1A237E" />
          <rect x="55" y="18" width="12" height="10" rx="2" fill="#1A237E" />
          {/* Brillo en ojos */}
          <rect x="35" y="20" width="4" height="4" rx="1" fill="#90CAF9" />
          <rect x="57" y="20" width="4" height="4" rx="1" fill="#90CAF9" />
          {/* Boca */}
          <rect x="36" y="34" width="28" height="6" rx="3" fill="#1A237E" />
          <rect x="40" y="35" width="5" height="4" rx="1" fill="white" />
          <rect x="48" y="35" width="5" height="4" rx="1" fill="white" />
          <rect x="56" y="35" width="5" height="4" rx="1" fill="white" />
          {/* Brazos */}
          <rect x="5" y="42" width="15" height="8" rx="3" fill="#4CAF50" />
          <rect x="80" y="42" width="15" height="8" rx="3" fill="#4CAF50" />
          {/* Patas */}
          <rect x="28" y="82" width="16" height="12" rx="3" fill="#388E3C" />
          <rect x="56" y="82" width="16" height="12" rx="3" fill="#388E3C" />
          {/* Panel del pecho */}
          <rect x="32" y="50" width="36" height="20" rx="3" fill="#2E7D32" />
          <circle cx="42" cy="60" r="5" fill="#FFD700" />
          <circle cx="58" cy="60" r="5" fill="#FF6B35" />
        </svg>
      </div>

      {/* ── Burbuja de diálogo ── */}
      {mensaje && (
        <div className="robot-burbuja" role="status" aria-live="polite">
          <span className="robot-burbuja-texto">{mensaje}</span>
        </div>
      )}
    </div>
  );
}
