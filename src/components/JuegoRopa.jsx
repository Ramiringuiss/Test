// ============================================================
// components/JuegoRopa.jsx — "Viste a mi Amiguito"
//
// Personaje SVG en capas. Cada zona acepta UNA sola prenda.
// Zonas: tono de piel | cabeza | cuerpo | pies | accesorio
// Drag & Drop con @dnd-kit/core + validación por zona.
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

// ── Tonos de piel disponibles ────────────────────────────────
const TONOS_PIEL = [
  { id: "piel1", color: "#FDDBB4", nombre: "Clarito" },
  { id: "piel2", color: "#F1C27D", nombre: "Medio" },
  { id: "piel3", color: "#C68642", nombre: "Canela" },
  { id: "piel4", color: "#8D5524", nombre: "Moreno" },
  { id: "piel5", color: "#4A2912", nombre: "Oscuro" },
];

// ── Prendas por zona y región ────────────────────────────────
// zona: "cabeza" | "cuerpo" | "pies" | "accesorio_cara" | "accesorio_movilidad"
const PRENDAS = [
  // CABEZA (solo 1 a la vez)
  { id: "sombrero_paja",  zona: "cabeza",   region: "Costa",  nombre: "Sombrero de Paja",   emoji: "👒", color: "#F0C040" },
  { id: "chullo",         zona: "cabeza",   region: "Sierra", nombre: "Chullo de Lana",      emoji: "🧢", color: "#E53935" },
  { id: "corona_plumas",  zona: "cabeza",   region: "Selva",  nombre: "Corona de Plumas",    emoji: "🪶", color: "#4CAF50" },
  // CUERPO (solo 1 a la vez)
  { id: "camiseta_costa", zona: "cuerpo",   region: "Costa",  nombre: "Camiseta de Playa",   emoji: "👕", color: "#29B6F6" },
  { id: "poncho_sierra",  zona: "cuerpo",   region: "Sierra", nombre: "Poncho de Lana",       emoji: "🧣", color: "#AB47BC" },
  { id: "cushma_selva",   zona: "cuerpo",   region: "Selva",  nombre: "Cushma",               emoji: "👘", color: "#66BB6A" },
  // PIES (solo 1 a la vez)
  { id: "sandalias",      zona: "pies",     region: "Costa",  nombre: "Sandalias",            emoji: "👡", color: "#FF7043" },
  { id: "ojotas",         zona: "pies",     region: "Sierra", nombre: "Ojotas",               emoji: "👟", color: "#8D6E63" },
  { id: "descalzo",       zona: "pies",     region: "Selva",  nombre: "Pie Descalzo",         emoji: "🦶", color: "#C68642" },
  // ACCESORIOS INCLUSIVOS — cara (solo 1)
  { id: "lentes",         zona: "acc_cara", region: "todos",  nombre: "Lentes",               emoji: "👓", color: "#1565C0" },
  { id: "audifonos",      zona: "acc_cara", region: "todos",  nombre: "Audífonos",            emoji: "🎧", color: "#FF6B35" },
  // ACCESORIOS INCLUSIVOS — movilidad (solo 1)
  { id: "silla_ruedas",   zona: "acc_mov",  region: "todos",  nombre: "Silla de Ruedas",      emoji: "♿", color: "#0288D1" },
  { id: "baston",         zona: "acc_mov",  region: "todos",  nombre: "Bastón",               emoji: "🦯", color: "#795548" },
];

// ── SVG del personaje en capas ───────────────────────────────
function PersonajeSVG({ tonoPiel, prendas }) {
  const piel = tonoPiel?.color || "#F1C27D";
  const pielOscura = tonoPiel ? ajustarBrillo(tonoPiel.color, -30) : "#C68642";

  // Prenda por zona
  const cabeza  = prendas["cabeza"];
  const cuerpo  = prendas["cuerpo"];
  const pies    = prendas["pies"];
  const accCara = prendas["acc_cara"];
  const accMov  = prendas["acc_mov"];

  return (
    <svg viewBox="0 0 120 220" width="120" height="220" xmlns="http://www.w3.org/2000/svg">
      {/* ── Silla de ruedas (detrás del personaje) ── */}
      {accMov?.id === "silla_ruedas" && (
        <g>
          <circle cx="38" cy="185" r="18" fill="none" stroke="#0288D1" strokeWidth="4"/>
          <circle cx="82" cy="185" r="18" fill="none" stroke="#0288D1" strokeWidth="4"/>
          <rect x="32" y="155" width="56" height="28" rx="4" fill="#0288D1" opacity="0.3"/>
          <rect x="28" y="148" width="64" height="10" rx="3" fill="#0288D1"/>
          <rect x="86" y="130" width="6" height="30" rx="2" fill="#0288D1"/>
          <rect x="28" y="130" width="6" height="30" rx="2" fill="#0288D1"/>
        </g>
      )}

      {/* ── Bastón ── */}
      {accMov?.id === "baston" && (
        <line x1="90" y1="110" x2="105" y2="210" stroke="#795548" strokeWidth="5" strokeLinecap="round"/>
      )}

      {/* ── Cuerpo / ropa ── */}
      {!cuerpo && (
        <rect x="35" y="100" width="50" height="65" rx="6" fill={piel}/>
      )}
      {cuerpo?.id === "camiseta_costa" && (
        <g>
          <rect x="35" y="100" width="50" height="65" rx="6" fill={piel}/>
          <rect x="35" y="100" width="50" height="45" rx="6" fill="#29B6F6"/>
          {/* Líneas decorativas de playa */}
          <line x1="42" y1="115" x2="78" y2="115" stroke="white" strokeWidth="2" opacity="0.6"/>
          <line x1="42" y1="123" x2="78" y2="123" stroke="white" strokeWidth="2" opacity="0.6"/>
        </g>
      )}
      {cuerpo?.id === "poncho_sierra" && (
        <g>
          <rect x="35" y="100" width="50" height="65" rx="6" fill={piel}/>
          <polygon points="60,98 25,165 95,165" fill="#AB47BC"/>
          <line x1="60" y1="98" x2="60" y2="165" stroke="#FFD600" strokeWidth="3"/>
          <line x1="40" y1="130" x2="80" y2="130" stroke="#FFD600" strokeWidth="2"/>
          <line x1="35" y1="145" x2="85" y2="145" stroke="#FF6B35" strokeWidth="2"/>
        </g>
      )}
      {cuerpo?.id === "cushma_selva" && (
        <g>
          <rect x="35" y="100" width="50" height="65" rx="6" fill={piel}/>
          <rect x="33" y="98" width="54" height="67" rx="6" fill="#66BB6A"/>
          {/* Diseños geométricos amazónicos */}
          <rect x="40" y="110" width="40" height="6" rx="1" fill="#FF6B35"/>
          <rect x="45" y="120" width="30" height="4" rx="1" fill="#FFD600"/>
          <rect x="40" y="130" width="40" height="4" rx="1" fill="#FF6B35"/>
        </g>
      )}

      {/* ── Brazos ── */}
      <rect x="18" y="103" width="18" height="40" rx="7" fill={cuerpo ? (cuerpo.color || piel) : piel}/>
      <rect x="84" y="103" width="18" height="40" rx="7" fill={cuerpo ? (cuerpo.color || piel) : piel}/>
      {/* Manos */}
      <ellipse cx="27" cy="147" rx="9" ry="8" fill={piel}/>
      <ellipse cx="93" cy="147" rx="9" ry="8" fill={piel}/>

      {/* ── Piernas / pies ── */}
      <rect x="40" y="163" width="16" height="35" rx="5" fill={pielOscura}/>
      <rect x="64" y="163" width="16" height="35" rx="5" fill={pielOscura}/>
      {/* Calzado */}
      {!pies && (
        <>
          <ellipse cx="48" cy="200" rx="12" ry="7" fill={pielOscura}/>
          <ellipse cx="72" cy="200" rx="12" ry="7" fill={pielOscura}/>
        </>
      )}
      {pies?.id === "sandalias" && (
        <>
          <ellipse cx="48" cy="200" rx="13" ry="7" fill="#FF7043"/>
          <ellipse cx="72" cy="200" rx="13" ry="7" fill="#FF7043"/>
          <line x1="40" y1="196" x2="56" y2="196" stroke="#BF360C" strokeWidth="2"/>
          <line x1="64" y1="196" x2="80" y2="196" stroke="#BF360C" strokeWidth="2"/>
        </>
      )}
      {pies?.id === "ojotas" && (
        <>
          <ellipse cx="48" cy="200" rx="13" ry="7" fill="#8D6E63"/>
          <ellipse cx="72" cy="200" rx="13" ry="7" fill="#8D6E63"/>
        </>
      )}
      {pies?.id === "descalzo" && (
        <>
          <ellipse cx="48" cy="200" rx="12" ry="7" fill={piel}/>
          <ellipse cx="72" cy="200" rx="12" ry="7" fill={piel}/>
          {/* Deditos */}
          {[0,1,2,3,4].map(i => (
            <circle key={i} cx={38 + i*4} cy={196} r={2} fill={pielOscura}/>
          ))}
          {[0,1,2,3,4].map(i => (
            <circle key={i} cx={62 + i*4} cy={196} r={2} fill={pielOscura}/>
          ))}
        </>
      )}

      {/* ── Cuello ── */}
      <rect x="50" y="90" width="20" height="16" rx="4" fill={piel}/>

      {/* ── Cabeza ── */}
      <ellipse cx="60" cy="68" rx="30" ry="28" fill={piel}/>

      {/* ── Pelo base ── */}
      <ellipse cx="60" cy="42" rx="28" ry="14" fill={pielOscura}/>
      <rect x="32" y="42" width="9" height="20" rx="4" fill={pielOscura}/>
      <rect x="79" y="42" width="9" height="20" rx="4" fill={pielOscura}/>

      {/* ── Ropa de cabeza ── */}
      {cabeza?.id === "sombrero_paja" && (
        <g>
          <ellipse cx="60" cy="44" rx="38" ry="7" fill="#F0C040"/>
          <rect x="38" y="20" width="44" height="26" rx="8" fill="#D4A017"/>
          <ellipse cx="60" cy="20" rx="22" ry="5" fill="#BF8A00"/>
          <line x1="38" y1="32" x2="82" y2="32" stroke="#BF8A00" strokeWidth="1.5"/>
        </g>
      )}
      {cabeza?.id === "chullo" && (
        <g>
          <rect x="33" y="28" width="54" height="35" rx="10" fill="#E53935"/>
          <ellipse cx="60" cy="28" rx="27" ry="10" fill="#C62828"/>
          {/* Punta */}
          <polygon points="60,5 50,28 70,28" fill="#E53935"/>
          <circle cx="60" cy="5" r="5" fill="white"/>
          {/* Diseño andino */}
          <line x1="35" y1="42" x2="85" y2="42" stroke="#FFD600" strokeWidth="3"/>
          {/* Orejeras */}
          <rect x="22" y="40" width="14" height="22" rx="5" fill="#E53935"/>
          <rect x="84" y="40" width="14" height="22" rx="5" fill="#E53935"/>
        </g>
      )}
      {cabeza?.id === "corona_plumas" && (
        <g>
          {/* Plumas de colores */}
          {[-20,-10,0,10,20].map((offset, i) => (
            <ellipse
              key={i}
              cx={60 + offset}
              cy={30 - Math.abs(offset) * 0.3}
              rx="5"
              ry="18"
              fill={["#E53935","#FF9800","#4CAF50","#2196F3","#9C27B0"][i]}
              transform={`rotate(${offset * 0.8}, ${60 + offset}, 50)`}
            />
          ))}
          <rect x="38" y="46" width="44" height="12" rx="4" fill="#FFD600"/>
          <line x1="40" y1="52" x2="80" y2="52" stroke="#FF6B35" strokeWidth="2"/>
        </g>
      )}

      {/* ── Orejas ── */}
      <ellipse cx="31" cy="68" rx="7" ry="9" fill={piel}/>
      <ellipse cx="89" cy="68" rx="7" ry="9" fill={piel}/>

      {/* ── Ojos ── */}
      <ellipse cx="50" cy="65" rx="9" ry="10" fill="white"/>
      <ellipse cx="70" cy="65" rx="9" ry="10" fill="white"/>
      <circle cx="51" cy="66" r="5" fill="#3E2723"/>
      <circle cx="71" cy="66" r="5" fill="#3E2723"/>
      {/* Brillo */}
      <circle cx="53" cy="64" r="2" fill="white"/>
      <circle cx="73" cy="64" r="2" fill="white"/>

      {/* ── Lentes (encima de ojos) ── */}
      {accCara?.id === "lentes" && (
        <g>
          <circle cx="50" cy="65" r="11" fill="none" stroke="#1565C0" strokeWidth="2.5"/>
          <circle cx="70" cy="65" r="11" fill="none" stroke="#1565C0" strokeWidth="2.5"/>
          <line x1="61" y1="65" x2="59" y2="65" stroke="#1565C0" strokeWidth="2"/>
          <line x1="28" y1="65" x2="39" y2="65" stroke="#1565C0" strokeWidth="2"/>
          <line x1="81" y1="65" x2="90" y2="65" stroke="#1565C0" strokeWidth="2"/>
          {/* Tinte azul suave */}
          <circle cx="50" cy="65" r="9" fill="#1565C0" opacity="0.1"/>
          <circle cx="70" cy="65" r="9" fill="#1565C0" opacity="0.1"/>
        </g>
      )}

      {/* ── Audífonos ── */}
      {accCara?.id === "audifonos" && (
        <g>
          <path d="M 28 55 Q 20 68 28 82" fill="none" stroke="#FF6B35" strokeWidth="5" strokeLinecap="round"/>
          <path d="M 92 55 Q 100 68 92 82" fill="none" stroke="#FF6B35" strokeWidth="5" strokeLinecap="round"/>
          <path d="M 28 55 Q 60 25 92 55" fill="none" stroke="#FF6B35" strokeWidth="3"/>
          <circle cx="25" cy="68" r="7" fill="#E64A19"/>
          <circle cx="95" cy="68" r="7" fill="#E64A19"/>
        </g>
      )}

      {/* ── Nariz ── */}
      <ellipse cx="60" cy="74" rx="5" ry="4" fill={pielOscura}/>

      {/* ── Boca ── */}
      <path d="M 48 83 Q 60 93 72 83" fill="none" stroke={pielOscura} strokeWidth="2.5" strokeLinecap="round"/>

      {/* ── Mejillas ── */}
      <ellipse cx="40" cy="78" rx="8" ry="5" fill="#FFB3BA" opacity="0.5"/>
      <ellipse cx="80" cy="78" rx="8" ry="5" fill="#FFB3BA" opacity="0.5"/>
    </svg>
  );
}

// Helper para oscurecer un color hex
function ajustarBrillo(hex, cantidad) {
  const num = parseInt(hex.replace("#",""), 16);
  const r = Math.max(0, Math.min(255, (num >> 16) + cantidad));
  const g = Math.max(0, Math.min(255, ((num >> 8) & 0xff) + cantidad));
  const b = Math.max(0, Math.min(255, (num & 0xff) + cantidad));
  return `rgb(${r},${g},${b})`;
}

// ── Tarjeta de prenda arrastrable ───────────────────────────
function PrendaCard({ prenda, desactivada }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({ id: prenda.id, disabled: desactivada });

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Translate.toString(transform),
        opacity: isDragging ? 0.4 : desactivada ? 0.35 : 1,
        cursor: desactivada ? "not-allowed" : "grab",
      }}
      className="comida-carta"
      {...listeners}
      {...attributes}
      aria-label={`Arrastrar ${prenda.nombre} (${prenda.region})`}
      title={`Región: ${prenda.region}`}
    >
      <span style={{ fontSize: "1.8rem" }}>{prenda.emoji}</span>
      <span style={{ fontSize: "0.7rem", fontWeight: 800, textAlign: "center", lineHeight: 1.2 }}>
        {prenda.nombre}
      </span>
      <span style={{
        fontSize: "0.55rem", opacity: 0.7,
        background: prenda.region === "todos" ? "#555" : "#2E7D32",
        padding: "1px 5px", borderRadius: 8, color: "white",
      }}>
        {prenda.region}
      </span>
    </div>
  );
}

// ── Zona droppable del personaje ─────────────────────────────
function ZonaPersonaje({ zonaId, label, prendaActual, isOver }) {
  const { setNodeRef, isOver: over } = useDroppable({ id: zonaId });
  const activo = over || isOver;
  return (
    <div
      ref={setNodeRef}
      style={{
        border: `3px dashed ${activo ? "#FFD600" : "rgba(255,255,255,0.3)"}`,
        borderRadius: 8,
        padding: "0.4rem 0.6rem",
        minHeight: 48,
        background: activo ? "rgba(255,214,0,0.15)" : "rgba(255,255,255,0.06)",
        transition: "all 0.2s",
        display: "flex",
        alignItems: "center",
        gap: "0.4rem",
        fontSize: "0.75rem",
      }}
      aria-label={`Zona ${label}${prendaActual ? ": " + prendaActual.nombre : ": vacía"}`}
    >
      <span style={{ opacity: 0.6, fontSize: "0.65rem", minWidth: 50 }}>{label}:</span>
      {prendaActual
        ? <span>{prendaActual.emoji} <strong>{prendaActual.nombre}</strong></span>
        : <span style={{ opacity: 0.4 }}>Vacío — arrastra aquí</span>
      }
    </div>
  );
}

// ── Componente principal ─────────────────────────────────────
export default function JuegoRopa({ onVolver }) {
  const [tonoPiel, setTonoPiel] = useState(TONOS_PIEL[1]);
  const [prendas, setPrendas] = useState({}); // { zona: prenda }
  const [arrastrandoId, setArrastrandoId] = useState(null);
  const [robotMsg, setRobotMsg] = useState("¡Arrastra la ropa al personaje! 👗");
  const [felicitado, setFelicitado] = useState(false);

  const { hablar } = useSpeech();
  const { pedirRespuesta } = useRobotIA();
  const { lanzarConfeti } = useConfeti();

  const sensores = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 6 } })
  );

  useEffect(() => {
    const msg = "Hola, Vamos a vestir al amiguito. Elige un tono de piel y luego arrastra la ropa. ¡Tú decides cómo queda!";
    setRobotMsg(msg);
    hablar(msg);
  }, []);

  const resetear = () => {
    setPrendas({});
    setTonoPiel(TONOS_PIEL[1]);
    setFelicitado(false);
    const msg = "¡Listo! Empezamos de nuevo. ¿Cómo vestimos al amiguito ahora?";
    setRobotMsg(msg);
    hablar(msg);
  };

  const onDragEnd = useCallback(async ({ active, over }) => {
    setArrastrandoId(null);
    if (!over) return;

    const prenda = PRENDAS.find(p => p.id === active.id);
    if (!prenda) return;

    const zonaDestino = over.id; // ej: "cabeza", "cuerpo", etc.

    // Validar que la prenda corresponde a la zona
    if (prenda.zona !== zonaDestino) {
      const resp = await pedirRespuesta({
        esCorrecta: false,
        juego: "ropa",
        itemArrastrado: prenda.nombre,
        destinoCorrecto: prenda.zona,
        destinoElegido: zonaDestino,
        pista: `El ${prenda.nombre} va en la zona de ${prenda.zona}`,
      });
      const texto = resp?.texto || resp || "";
      setRobotMsg(texto);
      hablar(texto, { omitEmojis: true });
      return;
    }

    // Poner la prenda en la zona (reemplaza cualquier previa)
    const nuevas = { ...prendas, [zonaDestino]: prenda };
    setPrendas(nuevas);

    const msg = `¡Qué lindo queda el ${prenda.nombre}! ✨`;
    setRobotMsg(msg);
    hablar(msg);

    // Si tiene al menos cuerpo + cabeza + pies = celebrar una vez
    const zonasClave = ["cabeza", "cuerpo", "pies"];
    const completo = zonasClave.every(z => nuevas[z]);
    if (completo && !felicitado) {
      setFelicitado(true);
      lanzarConfeti();
      const respFin = await pedirRespuesta({
        esCorrecta: true,
        juego: "ropa",
        itemArrastrado: "el atuendo completo",
        destinoCorrecto: "personaje",
        destinoElegido: "personaje",
      });
      const textoFin = respFin?.texto || respFin || "";
      setTimeout(() => {
        setRobotMsg(textoFin);
        hablar(textoFin, { omitEmojis: true });
      }, 1400);
    }
  }, [prendas, felicitado, hablar, pedirRespuesta, lanzarConfeti]);

  const prendaArrastrando = PRENDAS.find(p => p.id === arrastrandoId);

  // Agrupar prendas por zona para mostrar en paneles
  const GRUPOS = [
    { label: "Cabeza 🎩",      zonas: ["cabeza"] },
    { label: "Cuerpo 👕",      zonas: ["cuerpo"] },
    { label: "Pies 👟",        zonas: ["pies"] },
    { label: "Accesorios ✨",  zonas: ["acc_cara", "acc_mov"] },
  ];

  const ZONAS_LABELS = {
    cabeza: "Cabeza", cuerpo: "Cuerpo", pies: "Pies",
    acc_cara: "Cara", acc_mov: "Movilidad",
  };

  return (
    <div className="pantalla pantalla-juego" style={{ paddingBottom: "2rem" }}>
      {/* Header */}
      <header className="juego-header">
        <button className="btn-bloque btn-rojo btn-pequeno" onClick={onVolver}>◀ Menú</button>
        <h2 className="juego-titulo">👗 Viste a mi Amiguito</h2>
        <button className="btn-bloque btn-amarillo btn-pequeno" onClick={resetear} aria-label="Reiniciar">🔄</button>
      </header>

      <div style={{ display: "flex", gap: "1rem", width: "100%", maxWidth: 720, flexWrap: "wrap", justifyContent: "center", padding: "0 0.5rem" }}>

        {/* ── Panel izquierdo: Personaje + estado ── */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.8rem", minWidth: 160 }}>

          {/* Selector de tono de piel */}
          <div style={{ background: "rgba(255,255,255,0.08)", borderRadius: 8, padding: "0.6rem", width: "100%" }}>
            <p style={{ fontSize: "0.7rem", fontWeight: 800, color: "#FFD600", marginBottom: "0.4rem", textAlign: "center" }}>
              Tono de piel
            </p>
            <div style={{ display: "flex", gap: "0.4rem", justifyContent: "center", flexWrap: "wrap" }}>
              {TONOS_PIEL.map(t => (
                <button
                  key={t.id}
                  onClick={() => { setTonoPiel(t); hablar(`Elegiste tono ${t.nombre}`); }}
                  style={{
                    width: 30, height: 30, borderRadius: "50%",
                    background: t.color,
                    border: tonoPiel.id === t.id ? "3px solid #FFD600" : "3px solid rgba(255,255,255,0.2)",
                    cursor: "pointer", transition: "transform 0.15s",
                    transform: tonoPiel.id === t.id ? "scale(1.25)" : "scale(1)",
                  }}
                  aria-label={`Tono de piel ${t.nombre}`}
                  title={t.nombre}
                />
              ))}
            </div>
          </div>

          {/* Personaje SVG */}
          <div style={{
            background: "rgba(255,255,255,0.07)",
            borderRadius: 12,
            border: "3px solid rgba(255,255,255,0.15)",
            padding: "0.8rem",
            boxShadow: "0 4px 20px rgba(0,0,0,0.4)",
          }}>
            <PersonajeSVG tonoPiel={tonoPiel} prendas={prendas} />
          </div>

          {/* Zonas droppable (estado del personaje) */}
          <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: "0.4rem" }}>
            <p style={{ fontSize: "0.65rem", color: "#FFD600", fontWeight: 800, textAlign: "center" }}>
              Zonas del personaje
            </p>
            <DndContext
              sensors={sensores}
              collisionDetection={closestCenter}
              onDragStart={({ active }) => setArrastrandoId(active.id)}
              onDragEnd={onDragEnd}
            >
              {Object.keys(ZONAS_LABELS).map(zona => (
                <ZonaPersonaje
                  key={zona}
                  zonaId={zona}
                  label={ZONAS_LABELS[zona]}
                  prendaActual={prendas[zona]}
                />
              ))}
              <DragOverlay>
                {prendaArrastrando ? (
                  <div className="comida-carta overlay-drag">
                    <span style={{ fontSize: "1.8rem" }}>{prendaArrastrando.emoji}</span>
                    <span style={{ fontSize: "0.7rem" }}>{prendaArrastrando.nombre}</span>
                  </div>
                ) : null}
              </DragOverlay>
            </DndContext>
          </div>
        </div>

        {/* ── Panel derecho: Prendas disponibles ── */}
        <div style={{ flex: 1, minWidth: 200, display: "flex", flexDirection: "column", gap: "0.8rem" }}>
          <RobotAmigo mensaje={robotMsg} hablar={false} tamaño="sm" />

          {GRUPOS.map(grupo => (
            <div key={grupo.label} style={{ background: "rgba(255,255,255,0.06)", borderRadius: 8, padding: "0.6rem" }}>
              <p style={{ fontSize: "0.65rem", fontWeight: 800, color: "#FFD600", marginBottom: "0.5rem" }}>
                {grupo.label}
              </p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                <DndContext
                  sensors={sensores}
                  collisionDetection={closestCenter}
                  onDragStart={({ active }) => setArrastrandoId(active.id)}
                  onDragEnd={onDragEnd}
                >
                  {PRENDAS
                    .filter(p => grupo.zonas.includes(p.zona))
                    .map(prenda => (
                      <PrendaCard
                        key={prenda.id}
                        prenda={prenda}
                        desactivada={
                          // Deshabilitar si ya está puesta en el personaje
                          Object.values(prendas).some(p => p?.id === prenda.id)
                        }
                      />
                    ))
                  }
                  <DragOverlay>
                    {prendaArrastrando ? (
                      <div className="comida-carta overlay-drag">
                        <span style={{ fontSize: "1.8rem" }}>{prendaArrastrando.emoji}</span>
                      </div>
                    ) : null}
                  </DragOverlay>
                </DndContext>
              </div>
            </div>
          ))}

          <button className="btn-bloque btn-rojo" onClick={resetear} style={{ alignSelf: "center" }}>
            🔄 Reiniciar personaje
          </button>
        </div>
      </div>
    </div>
  );
}
