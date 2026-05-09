// ============================================================
// hooks/useConfeti.js — Lanza confeti de colores al ganar
// Usa canvas-confetti (npm install canvas-confetti)
// ============================================================

import { useCallback } from "react";

/**
 * useConfeti()
 * Devuelve { lanzarConfeti }
 * lanzarConfeti() → explosión de confeti vibrante en pantalla
 */
export function useConfeti() {
  const lanzarConfeti = useCallback(async () => {
    try {
      // Importación dinámica para no bloquear el bundle inicial
      const confetti = (await import("canvas-confetti")).default;

      // Colores inspirados en el estilo Minecraft/vibrante
      const colores = [
        "#FFD700", // amarillo dorado
        "#FF6B35", // naranja
        "#4CAF50", // verde Minecraft
        "#2196F3", // azul
        "#E91E63", // rosa
        "#9C27B0", // morado
        "#00BCD4", // cyan
      ];

      // Primera explosión: desde el centro
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 },
        colors: colores,
        shapes: ["square", "circle"], // cuadraditos estilo pixel
      });

      // Segunda explosión con delay: desde los lados
      setTimeout(() => {
        confetti({
          particleCount: 60,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: colores,
        });
        confetti({
          particleCount: 60,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: colores,
        });
      }, 250);
    } catch (e) {
      // Si canvas-confetti no está instalado, falla silenciosamente
      console.warn("canvas-confetti no disponible:", e.message);
    }
  }, []);

  return { lanzarConfeti };
}
