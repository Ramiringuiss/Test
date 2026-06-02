import { useCallback, useState } from "react";

export function useRobotIACasita() {
  const [cargando, setCargando] = useState(false);

  const pedirRespuesta = useCallback(
    async ({
      esCorrecta,
      juego,
      itemArrastrado,
      destinoCorrecto,
      destinoElegido,
      pista,
    }) => {
      setCargando(true);

      let query = "";

      if (esCorrecta) {
        query = `Hola en un juego de ubicar a los animales en sus regiones para niños de 4 a 5 años un niño ha puesto el animal ${itemArrastrado} en la ${destinoElegido} y la respuesta es correcta felicitale y dale retroalimentacion mas feedback da tu respuesta de forma directa como si le hablaras tú directamente al niño la respuesta tiene que ser breve sin dar directamente la respuesta con el formato simple de texto sin asteriscos o y sin saltos de texto no uses signos de exclamacion ni emojis, no digas HOLA al incio, pon comas donde creas necesario y la respuesta tien que ser breve`;
      } else {
        query = `Hola en un juego de ubicar a los animales en sus regiones para niños de 4 a 5 años un niño ha puesto el animal ${itemArrastrado} en la ${destinoElegido} y la respuesta correcta es en la region ${destinoCorrecto} hablale y corrigele dandole retroalimentacion mas feedback da tu respuesta de forma directa como si le hablaras tú directamente al niño la respuesta tiene que ser breve sin dar directamente la respuesta con el formato simple de texto sin asteriscos o y sin saltos de texto no uses signos de exclamacion ni emojis la respuesta tiene que ser bastante breve sin usar palabras complicadas para los niños, no digas HOLA al inicio,pon comas donde creas necesario`;
      }

      const encodedQuery = encodeURIComponent(query);
      const primaryUrl = `https://api.delirius.store/ia/gemini?query=${encodedQuery}`;
      const backupUrl = `https://api.delirius.store/ia/chatgpt?q=${encodedQuery}`;

      // helper: fetch with timeout using AbortController
      const fetchWithTimeout = async (url, timeout = 3000) => {
        const controller = new AbortController();
        const id = setTimeout(() => controller.abort(), timeout);
        try {
          const res = await fetch(url, { signal: controller.signal });
          clearTimeout(id);
          return res;
        } catch (err) {
          clearTimeout(id);
          throw err;
        }
      };

      // Local fallback generator
      const localResponse = () => {
        // small helpers for messages
        const safe = (s) => s || "esto";
        const item = safe(itemArrastrado);
        const elegido = safe(destinoElegido);
        const correcto = safe(destinoCorrecto);

        if (esCorrecta) {
          const variants = [
            `Muy bien, colocaste ${item} en la ${elegido}, buen trabajo, sigue así.`,
            `Correcto, ${item} está en la ${elegido}. Excelente, continúa aprendiendo.`,
            `Buen trabajo, has puesto ${item} en la ${elegido}. Sigue así.`,
          ];
          return variants[Math.floor(Math.random() * variants.length)];
        }

        // incorrecta
        const corrections = [
          `Casi, ${item} no va en la ${elegido}. Intenta buscar en otra región.`,
          `No es la mejor opción, ${item} pertenece a la región ${correcto}. Prueba de nuevo.`,
          `Eso no es correcto, intenta pensar dónde vive ${item} y vuelve a intentarlo.`,
        ];
        return corrections[Math.floor(Math.random() * corrections.length)];
      };

      try {
        // Intento 1: API primaria con timeout 3s
        try {
          const response = await fetchWithTimeout(primaryUrl, 3000);
          if (response.ok) {
            const data = await response.json();
            const texto = data?.data?.result;
            if (texto) return { texto };
            // si no hay texto, caemos al backup
          } else {
            // no OK, intentar backup
            throw new Error(`Primary status ${response.status}`);
          }
        } catch (errPrimary) {
          console.warn("Primary API failed or timed out, trying backup:", errPrimary.message || errPrimary);
          // Intento 2: backup
          try {
            const response2 = await fetchWithTimeout(backupUrl, 3000);
            if (response2.ok) {
              const data2 = await response2.json();
              const texto2 = data2?.data?.result;
              if (texto2) return { texto: texto2 };
              // si no hay texto, caemos al local
            } else {
              throw new Error(`Backup status ${response2.status}`);
            }
          } catch (errBackup) {
            console.warn("Backup API failed or timed out, using local response:", errBackup.message || errBackup);
            const textoLocal = localResponse();
            return { texto: textoLocal };
          }
        }

        // Si llegamos aquí y no retornamos, usamos local
        const textoLocalFinal = localResponse();
        return { texto: textoLocalFinal };
      } catch (error) {
        console.error("Error en APIs Gemini/Casita:", error);
        const textoLocal = localResponse();
        return { texto: textoLocal };
      } finally {
        setCargando(false);
      }
    },
    []
  );

  return { pedirRespuesta, cargando };
}