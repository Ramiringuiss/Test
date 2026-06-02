// ============================================================
// components/JuegoCasita.jsx — "Encuentra Mi Casita"
//
// STUB: Estructura lista para implementar siguiendo el patrón
// de JuegoComida.jsx.
//
// Lógica: 3 animales, cada uno tiene su región correcta.
// El niño arrastra el animal a la casita de su región.
// ============================================================

import { useState, useEffect } from "react";
import {
  DndContext,
  DragOverlay,
  useDraggable,
  useDroppable,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  closestCenter,
} from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import RobotAmigo from "./RobotAmigo";
import { useSpeech } from "../hooks/useSpeech";
import { useRobotIACasita } from "../hooks/useRobotIACasita";
import { useConfeti } from "../hooks/useConfeti";

// ── Datos ─────────────────────────────────────────────────────
const ANIMALES = [
  { id: "a1", nombre: "Llama 🦙", emoji: "🦙", regionCorrecta: "sierra" },
  { id: "a2", nombre: "Delfín 🐬", emoji: "🐬", regionCorrecta: "costa" },
  { id: "a3", nombre: "Guacamayo 🦜", emoji: "🦜", regionCorrecta: "selva" },
];

const CASITAS = [
  { id: "costa", label: "🌊 Costa", emoji: "🏖️" },
  { id: "sierra", label: "⛰️ Sierra", emoji: "🏔️" },
  { id: "selva", label: "🌴 Selva", emoji: "🌿" },
];

// ── Sub-componentes ───────────────────────────────────────────
function AnimalDraggable({ animal, desactivado }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({ id: animal.id, disabled: desactivado });

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Translate.toString(transform),
        opacity: isDragging ? 0.4 : desactivado ? 0.3 : 1,
        cursor: desactivado ? "default" : "grab",
      }}
      className="comida-carta"
      {...listeners}
      {...attributes}
      aria-label={`Arrastrar ${animal.nombre}`}
    >
      <span className="comida-emoji">{animal.emoji}</span>
      <span className="comida-nombre">{animal.nombre}</span>
    </div>
  );
}

function CasitaDroppable({ casita, acertado }) {
  const { setNodeRef, isOver } = useDroppable({ id: casita.id });

  return (
    <div
      ref={setNodeRef}
      className={`plato-zona ${isOver ? "plato-sobre" : ""} ${acertado ? "clima-exito" : ""}`}
      role="region"
      aria-label={`Casita ${casita.label}`}
    >
      <span className="plato-emoji">{casita.emoji}</span>
      <span className="plato-texto">{casita.label}</span>
      {acertado && <span style={{ fontSize: "1.5rem" }}>✅</span>}
    </div>
  );
}

// ── Componente principal ──────────────────────────────────────
export default function JuegoCasita({ onVolver }) {
  const [acertados, setAcertados] = useState({});
  const [arrastrandoId, setArrastrandoId] = useState(null);
  const [casitasAcertadas, setCasitasAcertadas] = useState({});
  const [robotMsg, setRobotMsg] = useState("Arrastra el animal a su casita 🏠");
  const { hablar } = useSpeech();
  const { pedirRespuesta, cargando } = useRobotIACasita();
  const { lanzarConfeti } = useConfeti();

  const sensores = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 6 } })
  );

  useEffect(() => {
    // Mensaje inicial simple sin llamar a la IA
    const msg = "Arrastra cada animal a su región";
    setRobotMsg(msg);
  }, []);

  const onDragEnd = async ({ active, over }) => {
    setArrastrandoId(null);
    if (!over) return;

    const animal = ANIMALES.find((a) => a.id === active.id);
    if (!animal) return;

    // Mostrar estado de carga
    setRobotMsg(" Pensando...");

    if (animal.regionCorrecta === over.id) {
      // ── Correcto ──
      const resp = await pedirRespuesta({
        esCorrecta: true,
        juego: "casita",
        itemArrastrado: animal.nombre,
        destinoCorrecto: over.id,
        destinoElegido: over.id,
        pista: "",
      });
      const texto = resp?.texto || `¡Sí! El ${animal.nombre} vive en la ${over.id}. ¡Muy bien!`;
      setRobotMsg(texto);
      hablar(texto, { omitEmojis: true });
      lanzarConfeti();

      const nuevosAcertados = { ...acertados, [animal.id]: true };
      const nuevasCasitas = { ...casitasAcertadas, [over.id]: true };
      setAcertados(nuevosAcertados);
      setCasitasAcertadas(nuevasCasitas);
    } else {
      // ── Incorrecto ──
      const resp = await pedirRespuesta({
        esCorrecta: false,
        juego: "casita",
        itemArrastrado: animal.nombre,
        destinoCorrecto: animal.regionCorrecta,
        destinoElegido: over.id,
        pista: "Prueba la casita que dice la región",
      });
      const texto = resp?.texto || `Hmm, el ${animal.nombre} no vive ahí. Sigue intentando`;
      setRobotMsg(texto);
      hablar(texto, { omitEmojis: true });
    }
  };

  const animalArrastrando = ANIMALES.find((a) => a.id === arrastrandoId);

  return (
    <div className="pantalla pantalla-juego">
      <header className="juego-header">
        <button className="btn-bloque btn-rojo btn-pequeno" onClick={onVolver}>
          ◀ Menú
        </button>
        <h2 className="juego-titulo">🏠 Encuentra Mi Casita</h2>
        <div className="juego-puntos">
          {"⭐".repeat(Object.keys(acertados).length)}
        </div>
      </header>

      <DndContext
        sensors={sensores}
        collisionDetection={closestCenter}
        onDragStart={({ active }) => setArrastrandoId(active.id)}
        onDragEnd={onDragEnd}
      >
        {/* Casitas destino */}
        <p className="instruccion-texto">Las casitas de cada región:</p>
        <div className="comidas-grilla">
          {CASITAS.map((casita) => (
            <CasitaDroppable
              key={casita.id}
              casita={casita}
              acertado={casitasAcertadas[casita.id]}
            />
          ))}
        </div>

        {/* Animales para arrastrar */}
        <p className="instruccion-texto">¿Dónde vive cada uno?</p>
        <div className="comidas-grilla">
          {ANIMALES.map((animal) => (
            <AnimalDraggable
              key={animal.id}
              animal={animal}
              desactivado={acertados[animal.id]}
            />
          ))}
        </div>

        <DragOverlay>
          {animalArrastrando ? (
            <div className="comida-carta overlay-drag">
              <span className="comida-emoji">{animalArrastrando.emoji}</span>
              <span className="comida-nombre">{animalArrastrando.nombre}</span>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      <RobotAmigo
        mensaje={robotMsg}
        hablar={false}
        tamaño="sm"
        cargando={cargando}
      />
    </div>
  );
}
