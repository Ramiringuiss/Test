// ============================================================
// hooks/useSpeech.js — ResponsiveVoice para móvil + PC
// Funciona en todos los navegadores sin dependencias del sistema
// ============================================================

import { useCallback, useRef } from "react";

// Desbloquear audio (en algunos navegadores es necesario)
export function desbloquearVoz() {
  console.log("🔓 Desbloqueando audio...");
  // ResponsiveVoice maneja esto internamente al primer speak()
}

export function useSpeech() {
  const utteranceRef = useRef(null);

  function stripEmojis(text) {
    if (!text) return text;
    // Remove emoji unicode characters
    try {
      return text.replace(/\p{Extended_Pictographic}/gu, "").replace(/[\uFE0F]/g, "").trim();
    } catch (e) {
      // Fallback simple removal of common emoji ranges
      return text.replace(/[\u{1F300}-\u{1FAFF}]/gu, "").trim();
    }
  }

  const hablar = useCallback((texto, { onEnd, omitEmojis = false } = {}) => {
    if (!texto || texto.trim() === "") {
      onEnd?.();
      return;
    }

    if (!window.responsiveVoice) {
      console.error("❌ ResponsiveVoice no disponible");
      onEnd?.();
      return;
    }

    // Si se pide omitir emojis, limpiamos el texto antes de hablar
    const textoParaVoz = omitEmojis ? stripEmojis(texto) : texto;

    console.log(`🎤 Hablando: "${textoParaVoz}"`);

    try {
      // Cancelar cualquier voz previa antes de iniciar una nueva
      window.responsiveVoice.cancel();

      window.responsiveVoice.speak(textoParaVoz, "Spanish Female", {
        rate: 0.9,
        pitch: 1.0,
        volume: 1.0,
        onstart: () => {
          console.log("▶️ Voz iniciada");
        },
        onend: () => {
          console.log("⏹️ Voz terminada");
          onEnd?.();
        },
        onerror: (error) => {
          console.error("❌ Error en ResponsiveVoice:", error);
          onEnd?.();
        },
      });

      utteranceRef.current = textoParaVoz;
    } catch (err) {
      console.error("Error al hablar:", err);
      onEnd?.();
    }
  }, []);

  const callar = useCallback(() => {
    try {
      if (window.responsiveVoice) {
        window.responsiveVoice.cancel();
        console.log("🔇 Voz cancelada");
      }
    } catch (e) {
      console.error("Error al callar:", e);
    }
  }, []);

  return { hablar, callar };
}
