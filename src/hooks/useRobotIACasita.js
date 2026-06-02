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
      const url = `https://api.delirius.store/ia/gemini?query=${encodedQuery}`;

      try {
        const response = await fetch(url);
        const data = await response.json();

        // La API devuelve { creator, status, data: { result: "..." } }
        const texto = data?.data?.result || "Sigue intentando";

        return { texto };
      } catch (error) {
        console.error("Error en API Gemini Casita:", error);
        return { texto: "Sigue intentando" };
      } finally {
        setCargando(false);
      }
    },
    []
  );

  return { pedirRespuesta, cargando };
}