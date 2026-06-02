// ============================================================
// components/JuegoComida.jsx — "¿Qué Comemos Hoy?"
// Con integración Gemini para retroalimentación inteligente
// ============================================================

import { useState, useEffect, useCallback } from "react";
import {
  DndContext, DragOverlay, useDraggable, useDroppable,
  PointerSensor, TouchSensor, useSensor, useSensors, closestCenter,
} from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import RobotAmigo from "./RobotAmigo";
import { useSpeech } from "../hooks/useSpeech";
import { useRobotIA } from "../hooks/useRobotIA";
import { useConfeti } from "../hooks/useConfeti";

const RONDAS = [
  {
    id: "r1",
    clima: "☀️ ¡Hace mucho calor!",
    region: "Costa",
    descripcion: "¡Uy qué calor hace en la costa! ¿Qué comida fresquita comes cuando hace calor?",
    comidas: [
      { id: "c1", nombre: "Ceviche", correcta: true,  emoji: "🐟", pista: "El ceviche es fresquito y rico, perfecto para el calor de la playa" },
      { id: "c2", nombre: "Sopa caliente", correcta: false, emoji: "🍲", pista: "La sopa calienta el cuerpo, mejor para el frío" },
      { id: "c3", nombre: "Chocolate", correcta: false, emoji: "☕", pista: "El chocolate caliente es para días fríos" },
    ],
  },
  {
    id: "r2",
    clima: "❄️ ¡Hace mucho frío!",
    region: "Sierra",
    descripcion: "¡Brr brr, qué frío hace en las montañas de la sierra! ¿Qué comida te calienta?",
    comidas: [
      { id: "c4", nombre: "Helado", correcta: false, emoji: "🍦", pista: "El helado nos da más frío todavía" },
      { id: "c5", nombre: "Chuño con queso", correcta: true,  emoji: "🧀", pista: "El chuño con queso es calientito y muy rico de la sierra" },
      { id: "c6", nombre: "Fruta helada", correcta: false, emoji: "🍉", pista: "La fruta helada es para el calor, no para el frío" },
    ],
  },
  {
    id: "r3",
    clima: "¿Que comida se come en la selva?",
    region: "Selva",
    descripcion: "¡Mira cuánta lluvia en la selva! ¿Qué fruta tropical rica eliges?",
    comidas: [
      { id: "c7", nombre: "Mazamorra", correcta: false, emoji: "🟣", pista: "La mazamorra es de Lima, no de la selva" },
      { id: "c8", nombre: "Hamburguesa", correcta: false, emoji: "🍔", pista: "Eso no es de la selva peruana" },
      { id: "c9", nombre: "Cocona y aguaje", correcta: true,  emoji: "🍊", pista: "La cocona y el aguaje son frutas deliciosas de la selva peruana" },
    ],
  },
];

function ComidaDraggable({ comida, desactivada }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({ id: comida.id, disabled: desactivada });

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Translate.toString(transform), opacity: isDragging ? 0.4 : 1 }}
      className={`comida-carta ${isDragging ? "arrastrando" : ""} ${desactivada ? "desactivada" : ""}`}
      {...listeners} {...attributes}
      role="button"
      aria-label={`Arrastrar ${comida.nombre}`}
    >
      <span className="comida-emoji">{comida.emoji}</span>
      <span className="comida-nombre">{comida.nombre}</span>
    </div>
  );
}

function PlatoDroppable() {
  const { setNodeRef, isOver } = useDroppable({ id: "plato" });
  return (
    <div ref={setNodeRef} className={`plato-zona ${isOver ? "plato-sobre" : ""}`}
      role="region" aria-label="Suelta la comida aquí">
      <span className="plato-emoji">🍽️</span>
      <span className="plato-texto">{isOver ? "¡Suéltala aquí! 👇" : "Arrastra la comida aquí"}</span>
    </div>
  );
}

export default function JuegoComida({ onVolver }) {
  const [rondaIdx, setRondaIdx] = useState(0);
  const [puntos, setPuntos] = useState(0);
  const [arrastrandoId, setArrastrandoId] = useState(null);
  const [resultado, setResultado] = useState(null);
  const [robotMsg, setRobotMsg] = useState("");
  const [juegoTerminado, setJuegoTerminado] = useState(false);
  const [cargandoIA, setCargandoIA] = useState(false);

  const { hablar } = useSpeech();
  const { pedirRespuesta } = useRobotIA();
  const { lanzarConfeti } = useConfeti();

  const ronda = RONDAS[rondaIdx];

  const sensores = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 6 } })
  );

  useEffect(() => {
    setResultado(null);
    setArrastrandoId(null);
    const msg = ronda.descripcion;
    setRobotMsg(msg);
    hablar(msg);
  }, [rondaIdx]);

  const onDragEnd = useCallback(async ({ active, over }) => {
    setArrastrandoId(null);
    if (!over || over.id !== "plato") return;

    const comida = ronda.comidas.find(c => c.id === active.id);
    if (!comida) return;

    setCargandoIA(true);
    setResultado(comida.correcta ? "exito" : "fallo");

    const resp = await pedirRespuesta({
      esCorrecta: comida.correcta,
      juego: "comida",
      itemArrastrado: comida.nombre,
      destinoCorrecto: ronda.comidas.find(c => c.correcta)?.nombre,
      destinoElegido: ronda.region,
      pista: comida.pista,
    });
    setCargandoIA(false);
    const texto = resp?.texto || resp || "";
    setRobotMsg(texto);
    hablar(texto, { omitEmojis: true });

    if (comida.correcta) {
      lanzarConfeti();
      const nuevasPuntos = puntos + 1;
      setPuntos(nuevasPuntos);
      hablar(texto, {
        onEnd: () => {
          setTimeout(() => {
            if (rondaIdx < RONDAS.length - 1) {
              setRondaIdx((i) => i + 1);
            } else {
              setJuegoTerminado(true);
              const fin = `¡Ganaste! ¡Eres un campeón! Conseguiste ${nuevasPuntos} estrellas.`;
              setRobotMsg(fin);
              hablar(fin, { omitEmojis: true });
              lanzarConfeti();
            }
          }, 1200);
        },
      });
    } else {
      setTimeout(() => setResultado(null), 1800);
    }
  }, [ronda, rondaIdx, puntos, hablar, pedirRespuesta, lanzarConfeti]);

  if (juegoTerminado) {
    return (
      <div className="pantalla pantalla-victoria">
        <div className="victoria-contenido">
          <h2 className="victoria-titulo">🏆 ¡Lo lograste!</h2>
          <div className="estrellas">{"⭐".repeat(puntos)}</div>
          <RobotAmigo mensaje={robotMsg} hablar={false} tamaño="md" />
          <button className="btn-bloque btn-verde btn-grande" onClick={onVolver}>🏠 Volver al menú</button>
        </div>
      </div>
    );
  }

  const comidaArrastrando = ronda.comidas.find(c => c.id === arrastrandoId);

  return (
    <div className="pantalla pantalla-juego">
      <header className="juego-header">
        <button className="btn-bloque btn-rojo btn-pequeno" onClick={onVolver}>◀ Menú</button>
        <h2 className="juego-titulo">🍲 ¿Qué Comemos Hoy?</h2>
        <div className="juego-puntos" aria-label={`${puntos} puntos`}>{"⭐".repeat(puntos)}{puntos === 0 ? "☆☆☆" : ""}</div>
      </header>

      <div className="ronda-indicador">Ronda {rondaIdx + 1} de {RONDAS.length}</div>

      <div className={`clima-tarjeta ${resultado === "exito" ? "clima-exito" : ""} ${resultado === "fallo" ? "clima-fallo" : ""}`}>
        <span className="clima-texto">{ronda.clima}</span>
        <span className="clima-region">Región: {ronda.region}</span>
      </div>

      <DndContext sensors={sensores} collisionDetection={closestCenter}
        onDragStart={({ active }) => setArrastrandoId(active.id)}
        onDragEnd={onDragEnd}>
        <PlatoDroppable />
        <div className="comidas-grilla">
          {ronda.comidas.map(c => (
            <ComidaDraggable key={c.id} comida={c} desactivada={resultado === "exito"} />
          ))}
        </div>
        <DragOverlay>
          {comidaArrastrando ? (
            <div className="comida-carta overlay-drag">
              <span className="comida-emoji">{comidaArrastrando.emoji}</span>
              <span className="comida-nombre">{comidaArrastrando.nombre}</span>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      <RobotAmigo
        mensaje={cargandoIA ? "Pensando... 🤔" : robotMsg}
        hablar={false}
        tamaño="sm"
      />

      {resultado && (
        <div className={`resultado-banner ${resultado}`} role="alert" aria-live="assertive">
          {resultado === "exito" ? "✅ ¡Correcto!" : "❌ ¡Inténtalo de nuevo!"}
        </div>
      )}
    </div>
  );
}
