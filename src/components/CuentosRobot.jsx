// ============================================================
// components/CuentosRobot.jsx
// Narra 3 mini-cuentos en secuencia. Segundo cuento usa canvas
// para mostrar imágenes por segmentos y avanzar con un botón.
// ============================================================

import { useState, useEffect, useCallback, useRef } from "react";
import RobotAmigo from "./RobotAmigo";
import { useSpeech } from "../hooks/useSpeech";
import espaVideo from "../espa.mp4";

// ── Datos de los 3 cuentos ────────────────────────────────────
const CUENTOS = [
  {
    id: 0,
    region: "El Bosque",
    titulo: "El Zorrito y la Mariposa",
    texto:
      "Un día, un pequeño zorrito caminaba por el bosque. Él estaba asustado. " +
      "De pronto, vio una hermosa mariposa. La mariposa volaba y danzaba alegremente. " +
      "La mariposa respondió: ¡Mira las flores! ¡Mira el hermoso sol! " +
      "Entonces el zorrito sonrió y comenzó a bailar junto con la mariposa. " +
      "Desde ese momento, ambos se hicieron muy buenos amigos.",
    color: "#F57F17",
    emoji: "🦊",
    fondo: "#dcba85",
  },
  {
    id: 1,
    region: "La Granja",
    titulo: "Cinco Pollitos",
    texto:
      "Una gallina tenía cinco pollitos. " +
      "Dice que uno de ellos se fue siguiendo al zorro, solo quedaron cuatro pollitos en su casa." +
      "Dice que otro de los pollitos se fue a jugar con el gato, solo quedaron tres pollitos en su casa. " +
      "Dice que otro de los pollitos se fue a buscar lombrices, solo quedaron dos pollitos en su casa. " +
      "Dice que otro de los pollitos se fue a rascar la tierra de la chacra, solo quedó un pollito en su casa. " +
      "Un águila se llevó volando al último pollito. Dice que así, se perdieron todos los pollitos. " +
      "La mamá gallina los buscó con tristeza. Después, los buscó enojada. " +
      "Gritaba lleno de su boca, correteaba de arriba a abajo. " +
      "Entonces la tierra Pachamama tembló. Y desde aquí y desde allá, regresaron los pollitos. " +
      "Una gallina tenía cinco pollitos. Los criaba a los cinco acurrucados bajo sus alas. Los criaba a los cinco con mucho cariño. Fin.",
    color: "#cdab01",
    emoji: "🐥",
    fondo: "#ecc796",
  },
];

// ── Componente ────────────────────────────────────────────────
export default function CuentosRobot({ nombreNino, onCuentosTerminados }) {
  const [indiceCuento, setIndiceCuento] = useState(0);
  const [segmentIndex, setSegmentIndex] = useState(0);
  const [leyendo, setLeyendo] = useState(false);
  const [videoStarted, setVideoStarted] = useState(false);
  const [terminado, setTerminado] = useState(false);
  const { hablar, callar } = useSpeech();
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const imagesRef = useRef([]);

  const cuento = CUENTOS[indiceCuento];

  // ── Segments para el segundo cuento (La Granja / Cinco Pollitos)
  const GALLINA_SEGMENTS = [
    { img: "gallina10.png", text: "Cinco Pollitos" },
    { img: "gallina9.png", text: "Una gallina tenía cinco pollitos." },
    {
      img: "gallina8.png",
      text:
        "Dice que uno de ellos se fue siguiendo al zorro, solo quedaron cuatro pollitos en su casa.",
    },
    {
      img: "gallina7.png",
      text:
        "Dice que otro de los pollitos se fue a jugar con el gato, solo quedaron tres pollitos en su casa.",
    },
    {
      img: "gallina6.png",
      text:
        "Dice que otro de los pollitos se fue a buscar lombrices, solo quedaron dos pollitos en su casa.",
    },
    {
      img: "gallina5.png",
      text:
        "Dice que otro de los pollitos se fue a rascar la tierra de la chacra, solo quedó un pollito en su casa.",
    },
    { img: "gallina4.png", text: "Un águila se llevó volando al último pollito. Dice que así, se perdieron todos los pollitos." },
    { img: "gallina3.png", text: "La mamá gallina los buscó con tristeza. Después, los buscó enojada.Gritaba lleno de su boca, correteaba de arriba a abajo." },
    { img: "gallina2.png", text: "Entonces la tierra Pachamama tembló. Y desde aquí y desde allá, regresaron los pollitos." },
    {
      img: "gallina1.png",
      text:
        "Una gallina tenía cinco pollitos. Los criaba a los cinco acurrucados bajo sus alas. Los criaba a los cinco con mucho cariño. Fin.",
    },
  ];

  // ── Lee el cuento actual al cargar o cambiar de cuento ──────
  const leerCuento = useCallback(
    (cuento, esUltimo) => {
      if (cuento.id === 0) {
        setLeyendo(false);
        setVideoStarted(false);
        return;
      }

      if (cuento.id === 1) {
        setLeyendo(false);
        setSegmentIndex(0);
        hablar("Presiona el botón para seguir el cuento");
        imagesRef.current = [];
        const promesas = GALLINA_SEGMENTS.map((s) => {
          return new Promise((resolve) => {
            const img = new Image();
            img.src = new URL(`../gallina/${s.img}`, import.meta.url).href;
            img.onload = () => resolve(img);
            img.onerror = () => resolve(null);
          });
        });
        Promise.all(promesas).then((imgs) => {
          imagesRef.current = imgs;
          dibujarSegmento(0);
        });
        return;
      }

      setLeyendo(true);
      const texto = `${cuento.region}. ${cuento.titulo}. ${cuento.texto}`;
      hablar(texto, {
        onEnd: () => {
          setLeyendo(false);
          if (esUltimo) {
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

  useEffect(() => {
    const esUltimo = indiceCuento === CUENTOS.length - 1;
    leerCuento(cuento, esUltimo);
    if (cuento.id === 0) {
      hablar("Toca el botón del video para ver el cuento");
    }
    return () => callar();
  }, [indiceCuento]);

  const dibujarSegmento = (idx) => {
    const canvas = canvasRef.current;
    const imgs = imagesRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const w = (canvas.width = Math.min(560, Math.floor(window.innerWidth * 0.9)));
    const h = (canvas.height = 280);
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = "rgba(182,235,255,1)";
    ctx.fillRect(0, 0, w, h);

    const img = imgs && imgs[idx];
    if (img) {
      const ratio = Math.min(w / img.width, h / img.height, 1);
      const iw = img.width * ratio;
      const ih = img.height * ratio;
      const x = (w - iw) / 2;
      const y = (h - ih) / 2;
      ctx.drawImage(img, x, y, iw, ih);
    } else {
      ctx.fillStyle = "rgba(0,0,0,0.06)";
      ctx.fillRect(8, 8, w - 16, h - 16);
    }
  };

  useEffect(() => {
    if (cuento.id !== 1) return;
    dibujarSegmento(segmentIndex);
    const seg = GALLINA_SEGMENTS[segmentIndex];
    if (seg) {
      callar();
      hablar(seg.text);
    }
  }, [segmentIndex, cuento.id]);

  const avanzar = () => {
    callar();
    if (indiceCuento < CUENTOS.length - 1) {
      setIndiceCuento((prev) => prev + 1);
    } else {
      setTerminado(true);
      setTimeout(() => onCuentosTerminados(), 1200);
    }
  };

  const repetir = () => {
    callar();
    const esUltimo = indiceCuento === CUENTOS.length - 1;
    if (cuento.id === 1) {
      const seg = GALLINA_SEGMENTS[segmentIndex];
      if (seg) hablar(seg.text);
      return;
    }
    leerCuento(cuento, esUltimo);
  };

  const avanzarSegmento = () => {
    if (cuento.id !== 1) return avanzar();
    if (segmentIndex < GALLINA_SEGMENTS.length - 1) {
      setSegmentIndex((s) => s + 1);
    } else {
      avanzar();
    }
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

  // Preparar contenido del cuento (evita ternarios anidados en JSX)
  let contenidoCuento = null;
  if (cuento.id === 0) {
    contenidoCuento = (
      <div className="cuento-video-frame" role="region" aria-label="Video cuento El Zorrito y la Mariposa">
        <video
          ref={videoRef}
          src={espaVideo}
          className="cuento-video"
          controls={videoStarted}
          playsInline
          onPlay={() => {
            setLeyendo(true);
            setVideoStarted(true);
          }}
          onPause={() => setLeyendo(false)}
          onEnded={() => {
            setLeyendo(false);
            setVideoStarted(false);
            avanzar();
          }}
        />

        {!videoStarted && (
          <div className="video-play-overlay" aria-hidden={false}>
            <button
              className="video-play-button"
              aria-label="Reproducir cuento"
              onClick={() => {
                const v = videoRef.current;
                if (!v) return;
                const p = v.play();
                if (p && p.then) {
                  p.then(() => {
                    setVideoStarted(true);
                    setLeyendo(true);
                  }).catch(() => {});
                } else {
                  setVideoStarted(true);
                  setLeyendo(true);
                }
              }}
            >
              ▶
            </button>
          </div>
        )}
      </div>
    );
  } else if (cuento.id === 1) {
    contenidoCuento = (
      <div>
        <canvas ref={canvasRef} style={{ width: "100%", maxWidth: 560, height: 280, borderRadius: 8 }} aria-label="Ilustración del cuento" />
        <p className="cuento-texto" style={{ marginTop: "0.75rem" }}>{GALLINA_SEGMENTS[segmentIndex].text}</p>
      </div>
    );
  } else {
    contenidoCuento = <p className="cuento-texto">{cuento.text}</p>;
  }

  return (
    <div className="pantalla pantalla-cuento" style={{ backgroundColor: cuento.fondo }}>
      <div className="cuento-progreso" role="progressbar" aria-valuenow={indiceCuento + 1} aria-valuemax={3}>
        {CUENTOS.map((c, i) => (
          <div key={c.id} className={`progreso-dot ${i <= indiceCuento ? "activo" : ""}`} aria-label={`Cuento ${i + 1} de 3${i < indiceCuento ? " completado" : ""}`}>
            {c.emoji}
          </div>
        ))}
      </div>

      <div className="cuento-tarjeta">
        <div className="cuento-region">{cuento.region}</div>
        <h2 className="cuento-titulo">{cuento.titulo}</h2>
        {contenidoCuento}

        {leyendo && (
          <div className="leyendo-indicador" aria-live="polite">
            <span className="onda" />
            <span className="onda" />
            <span className="onda" />
            <span>El robot está leyendo...</span>
          </div>
        )}
      </div>

      <RobotAmigo mensaje={leyendo ? "Escucha el cuento... 🎧" : "¿Listo para seguir? 👉"} hablar={false} tamaño="sm" />

      <div className="cuento-botones">
        <button className="btn-bloque btn-amarillo" onClick={repetir} aria-label="Escuchar el cuento de nuevo">🔊 Repetir</button>

        <button className="btn-bloque btn-verde btn-grande" onClick={cuento.id === 1 ? avanzarSegmento : avanzar} aria-label={indiceCuento < CUENTOS.length - 1 ? "Siguiente cuento" : "Ir a los juegos"}>
          {cuento.id === 1 ? (segmentIndex < GALLINA_SEGMENTS.length - 1 ? "Siguiente ▶" : "Terminar ▶") : (indiceCuento < CUENTOS.length - 1 ? "Siguiente ▶" : "¡A jugar! 🎮")}
        </button>
      </div>
    </div>
  );
}
