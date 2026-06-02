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
- Empieza cada respuesta con una breve línea que comience con "Contexto:" y explique en una frase qué hizo el niño (ej.: "Contexto: el niño puso el sombrero en la cabeza").
- Luego escribe un mensaje corto y directo PARA EL NIÑO (máx 2 frases muy simples).
- Al final, añade en una nueva línea: "Feedback al adulto:" seguido de una retroalimentación muy breve (1 frase) y una sugerencia simple para el siguiente turno.
- Usa emojis REALES (caracteres), no escribas los nombres de los emojis en palabras (NO escribir "cara sonriente" o "confeti" — usa 🎉 si quieres confeti).
- Evita frases obvias o genéricas; da pistas concretas o celebraciones específicas.
- Habla MUY simple, como si hablaras con un niño de 5 años. Usa palabras fáciles.
- Sé siempre alegre y positivo; si se equivoca, da una pista divertida, si acierta celebra con entusiasmo.
- No uses signos de puntuación complicados.`;

export function useRobotIA() {
  const [cargando, setCargando] = useState(false);

  // Respuestas de respaldo si Gemini falla o no hay API key
  const respuestaLocal = ({ esCorrecta, pista, nombreItem }) => {
    if (esCorrecta) {
      const opciones = [
        `Contexto: el niño acertó.\n¡Sí sí sí! ¡Lo lograste! Eres muy listo 🌟\nFeedback al adulto: Refuerza con un abrazo y repítanlo una vez más.`,
        `Contexto: el niño acertó.\n¡Qué bien! ¡Eso es correcto! ¡Eres un campeón 🏆!\nFeedback al adulto: Elogia y pasen a la siguiente actividad.`,
        `Contexto: el niño acertó.\n¡Excelente! ¡Sabías muy bien la respuesta! ¡Bravo 🎉!\nFeedback al adulto: Señala la parte que hizo bien y repite rápido.`,
        `Contexto: el niño acertó.\n¡Wooow! ¡Correcto! ¡Eres más listo que una llama 🦙!\nFeedback al adulto: Aplaude y ofrécele elegir otra prenda.`,
      ];
      return opciones[Math.floor(Math.random() * opciones.length)];
    } else {
      const opciones = [
        `Contexto: el niño se equivocó.\n¡Casi casi! Piensa un poquito más. ${pista || "¡Tú puedes! 💪"}\nFeedback al adulto: Ofrece una pista enfocada en la zona correcta.`,
        `Contexto: el niño se equivocó.\n¡Uy, no era esa! Pero no te rindas. ${pista || "¡Inténtalo de nuevo! 🌈"}\nFeedback al adulto: Repite lentamente la instrucción y muestra el ejemplo.`,
        `Contexto: el niño se equivocó.\n¡Hmm, piénsalo bien! ${pista || "¡Mira bien las opciones! 👀"}\nFeedback al adulto: Señala la prenda correcta y nombra la región.`,
        `Contexto: el niño se equivocó.\n¡No importa! Los errores nos enseñan. ${pista || "¡Vuelve a intentarlo! ⭐"}\nFeedback al adulto: Dale tiempo, no corrijas de inmediato.`,
      ];
      return opciones[Math.floor(Math.random() * opciones.length)];
    }
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
    if (!API_KEY && !CUSTOM_URL) {
      return respuestaLocal({ esCorrecta, pista, nombreItem: itemArrastrado });
    }

    setCargando(true);

    const contexto = esCorrecta
      ? `El niño arrastró "${itemArrastrado}" al lugar correcto (${destinoCorrecto}). ¡Acertó!`
      : `El niño arrastró "${itemArrastrado}" a "${destinoElegido}" pero debía ir a "${destinoCorrecto}". Se equivocó.`;

    const prompt = `${SISTEMA_PROMPT}

Juego actual: ${juego}
Situación: ${contexto}

Responde con UN mensaje corto y alegre para el niño. Solo el mensaje, sin comillas.`;

    try {
      let res;

      if (CUSTOM_URL) {
        // Llamar a la API externa de tu amigo (espera ?query=... o similar)
        const sep = CUSTOM_URL.includes("?") ? "&" : "?";
        const url = `${CUSTOM_URL}${sep}query=${encodeURIComponent(prompt)}`;
        res = await fetch(url, { method: "GET", headers: { Accept: "application/json" } });
      } else {
        // Usar proxy dev de Vite que reenvía al endpoint de Google (evita CORS)
        res = await fetch(ENDPOINT, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            prompt: { text: prompt },
            temperature: 0.9,
            maxOutputTokens: 80,
          }),
        });
      }

      if (!res.ok) throw new Error(`IA error: ${res.status}`);

      // Leer raw y parsear si es JSON
      const raw = await res.clone().text();
      let texto = null;
      let data = null;
      try {
        data = JSON.parse(raw);
      } catch (e) {
        data = null;
      }

      // Logs para depuración de la API externa
      console.debug("IA raw response:", raw);
      if (data) console.debug("IA parsed JSON:", data);

      if (data) {
        // Manejar formatos comunes: { text }, { message }, { result }, { output }
        texto = data?.text || data?.message || data?.result || data?.output;
        if (!texto && data?.candidates) {
          texto = data.candidates[0]?.output || data.candidates[0]?.content?.parts?.[0]?.text;
        }
      }

      if (!texto) texto = raw;

      texto = (texto || "").toString().trim();

      // Si la IA responde en texto libre, intentamos extraer la parte para el niño
      // y la retroalimentación al adulto. Buscamos la marca "Feedback al adulto:".
      const parts = texto.split(/Feedback al adulto:/i);
      const main = (parts[0] || "").trim();
      const feedback = parts[1] ? parts[1].trim() : null;

      if (main) {
        return { texto: main, feedback };
      }

      // Fallback a respuesta local estructurada
      const local = respuestaLocal({ esCorrecta, pista, nombreItem: itemArrastrado });
      const lp = local.split(/Feedback al adulto:/i);
      return { texto: (lp[0] || local).trim(), feedback: (lp[1] || null) };
    } catch (err) {
      console.warn("Gemini no disponible, usando respuesta local:", err.message || err);
      const local = respuestaLocal({ esCorrecta, pista, nombreItem: itemArrastrado });
      const lp = local.split(/Feedback al adulto:/i);
      return { texto: (lp[0] || local).trim(), feedback: (lp[1] || null) };
    } finally {
      setCargando(false);
    }
  }, []);

  return { pedirRespuesta, cargando };
}