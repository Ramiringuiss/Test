// ============================================================
// hooks/useRobotIA.js — Retroalimentación inteligente con Gemini
//
// Uso:
//   const { pedirRespuesta, cargando } = useRobotIA();
//   const msg = await pedirRespuesta({ situacion, esCorrecta, detalle });
//
// Configura tu API key en .env:
//   VITE_GEMINI_API_KEY=tu_clave_aqui
// ============================================================

import { useState, useCallback } from "react";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const CUSTOM_URL = import.meta.env.VITE_CUSTOM_IA_URL;
// En desarrollo el proxy de Vite expone `/api/gemini` → reenvía a Google
const ENDPOINT = "/api/gemini";

// Sistema de personalidad del robot para niños de 4-5 años
const SISTEMA_PROMPT = `Eres "Robot Amigo", un robot educativo simpático, paciente para niños peruanos de 4 a 5 años.

INSTRUCCIONES CLAVE (RESPETA SIEMPRE):
- Escribe un mensaje corto y directo PARA EL NIÑO (máx 2 frases muy simples).
- Al final, añade en una nueva línea: "Feedback al adulto:" seguido de una retroalimentación muy breve (1 frase) y una sugerencia simple para el siguiente turno.
- Usa emojis REALES (caracteres), no escribas los nombres de los emojis en palabras (NO escribir "cara sonriente" o "confeti" — usa 🎉 si quieres confeti).
- Evita frases obvias o genéricas; da pistas concretas o celebraciones específicas.
- Habla MUY simple, como si hablaras con un niño de 5 años. Usa palabras fáciles.
- Sé siempre alegre y positivo; si se equivoca, da una pista divertida, si acierta celebra con entusiasmo.
- No uses signos de puntuación complicados.
- No escribas CONTEXTO al inico, da una respuesta natural, como si tú hablaras directamente al niño. NO ESCRIBAS MUCHO`;

export function useRobotIA() {
  const [cargando, setCargando] = useState(false);

  // Respuestas de respaldo simplificadas: enfocadas en 'comida'.
  // Mensajes ya no incluyen la palabra "Contexto" al inicio y usan
  // las variables `destinoElegido` / `destinoCorrecto` para construir
  // frases muy breves cuando la respuesta es incorrecta.
  const respuestaLocal = ({ esCorrecta, pista, nombreItem, juego, destinoCorrecto, destinoElegido }) => {
    const item = nombreItem || "esto";
    const pistaTxt = pista || "Mira las pistas";

    const comida = {
      correcto: [
        `¡Buenísimo! ${item} es perfecto.\nFeedback al adulto: Comenta por qué es adecuado.`,
        `¡Muy bien! Esa comida va muy bien.\nFeedback al adulto: Elogia y pregunta más.`,
        `¡Genial! Excelente elección.\nFeedback al adulto: Pide que explique por qué.`,
        `¡Perfecto! Lo hiciste muy bien.\nFeedback al adulto: Anima a conversar sobre la comida.`,
      ],
      incorrecto: [
        `No, el lugar de la comida es ${destinoElegido}. Lo correcto es ${destinoCorrecto}.\nFeedback al adulto: Señala la pista y muestra la comida correcta.`,
        `No, el lugar de la comida es ${destinoElegido}. La correcta es ${destinoCorrecto}.\nFeedback al adulto: Repítelo con calma y muestra un ejemplo.`,
        `No, el lugar de la comida es ${destinoElegido}. Mejor: ${destinoCorrecto}.\nFeedback al adulto: Da una pista visual sobre la comida.`,
        `Casi — el lugar de la comida es ${destinoElegido}. Lo correcto: ${destinoCorrecto}.\nFeedback al adulto: Repite la instrucción en voz baja.`,
      ],
    };

    if (juego === "comida") {
      const arr = esCorrecta ? comida.correcto : comida.incorrecto;
      return arr[Math.floor(Math.random() * arr.length)];
    }

    // Para otros juegos, devolver un mensaje neutro corto (no tocar ropa/casita aquí).
    const fallback = esCorrecta
      ? `¡Muy bien!\nFeedback al adulto: Elogia el intento.`
      : `Intenta otra vez.\nFeedback al adulto: Guía con una pista simple.`;
    return fallback;
  };

  const pedirRespuesta = useCallback(async ({
    esCorrecta,    // boolean
    juego,         // string: "comida" | "ropa" | "casita"
    itemArrastrado,// string: nombre del item que arrastró el niño
    destinoCorrecto,// string: a dónde debía ir
    destinoElegido, // string: a dónde lo puso
    pista,         // string: pista humana como respaldo
  }) => {
    // Si no hay API key ni URL personalizada, usar respuestas locales
    // (pero igualmente intentamos las endpoints públicas de delirius si están disponibles)
    setCargando(true);

    // Construimos un prompt claro y breve para la API — sin repetir la palabra
    // "Contexto" y con instrucciones explícitas para el caso de comida.
    const prompt = `${SISTEMA_PROMPT}

Juego actual: ${juego}
Item: ${itemArrastrado}
Elegido por el niño: ${destinoElegido}
Respuesta correcta: ${destinoCorrecto}
Resultado: ${esCorrecta ? "correcto" : "incorrecto"}

INSTRUCCIONES (RESPONDE SOLO LO PEDIDO):
- Si es correcto: escribe una frase muy breve de felicitación para el niño (máx 2 frases cortas).
- Si es incorrecto: escribe UNA frase muy breve que diga qué puso el niño y cuál es la respuesta correcta.
  Ejemplo: "No, pusiste ${destinoElegido}. Lo correcto es ${destinoCorrecto}."
- Después, en una nueva línea escribe: "Feedback al adulto:" y una frase muy breve con una sugerencia.
- Usa lenguaje sencillo, usa emojis si quieres, y NO incluyas la palabra "Contexto" al inicio.

Responde SOLO el texto solicitado, sin explicaciones adicionales.`;

    const encoded = encodeURIComponent(prompt);
    const primaryUrl = `https://api.delirius.store/ia/gemini?query=${encoded}`;
    const backupUrl = `https://api.delirius.store/ia/chatgpt?q=${encoded}`;

    // fetch con timeout
    const fetchWithTimeout = async (url, timeout = 3000, options = {}) => {
      const controller = new AbortController();
      const id = setTimeout(() => controller.abort(), timeout);
      try {
        const res = await fetch(url, { signal: controller.signal, ...options });
        clearTimeout(id);
        return res;
      } catch (err) {
        clearTimeout(id);
        throw err;
      }
    };

    try {
      // Intento 1: primary delirius
      try {
        const res1 = await fetchWithTimeout(primaryUrl, 3000);
        if (res1.ok) {
          const data1 = await res1.json();
          const textoRaw = data1?.data?.result || data1?.result || data1?.output || data1?.text || JSON.stringify(data1);
          const textoStr = (textoRaw || "").toString().trim();
          const parts = textoStr.split(/Feedback al adulto:/i);
          return { texto: (parts[0] || textoStr).trim(), feedback: parts[1] ? parts[1].trim() : null };
        }
        throw new Error(`Primary status ${res1.status}`);
      } catch (errPrimary) {
        console.warn("Primary IA failed or timed out, trying backup:", errPrimary.message || errPrimary);
        // Intento 2: backup
        try {
          const res2 = await fetchWithTimeout(backupUrl, 3000);
          if (res2.ok) {
            const data2 = await res2.json();
            const textoRaw2 = data2?.data?.result || data2?.result || data2?.output || data2?.text || JSON.stringify(data2);
            const textoStr2 = (textoRaw2 || "").toString().trim();
            const parts2 = textoStr2.split(/Feedback al adulto:/i);
            return { texto: (parts2[0] || textoStr2).trim(), feedback: parts2[1] ? parts2[1].trim() : null };
          }
          throw new Error(`Backup status ${res2.status}`);
        } catch (errBackup) {
          console.warn("Backup IA failed or timed out, using local response:", errBackup.message || errBackup);
          const local = respuestaLocal({ esCorrecta, pista, nombreItem: itemArrastrado, juego, destinoCorrecto, destinoElegido });
          const lp = local.split(/Feedback al adulto:/i);
          return { texto: (lp[0] || local).trim(), feedback: (lp[1] || null) };
        }
      }
    } catch (fatal) {
      console.error("IA endpoints failed, returning local:", fatal.message || fatal);
      const local = respuestaLocal({ esCorrecta, pista, nombreItem: itemArrastrado, juego, destinoCorrecto, destinoElegido });
      const lp = local.split(/Feedback al adulto:/i);
      return { texto: (lp[0] || local).trim(), feedback: (lp[1] || null) };
    } finally {
      setCargando(false);
    }
  }, []);

  return { pedirRespuesta, cargando };
}