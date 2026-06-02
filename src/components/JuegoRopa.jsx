import { useState, useEffect, useCallback } from "react";
import RobotAmigo from "./RobotAmigo";
import { useSpeech } from "../hooks/useSpeech";
import { useRobotIA } from "../hooks/useRobotIA";
import { useConfeti } from "../hooks/useConfeti";
import PersonajeSVG from "./PersonajeSVG";
import RoperoPrendas from "./RoperoPrendas";

const TONOS_PIEL = [
  { id: "piel1", color: "#FDDBB4", nombre: "Clarito" },
  { id: "piel2", color: "#F1C27D", nombre: "Medio" },
  { id: "piel3", color: "#C68642", nombre: "Canela" },
  { id: "piel4", color: "#8D5524", nombre: "Moreno" },
  { id: "piel5", color: "#4A2912", nombre: "Oscuro" },
];

const REGIONES = ["Costa", "Sierra", "Selva"];

const PRENDAS = [
  { id: "sombrero_paja",  zona: "cabeza",   region: "Costa",  nombre: "Sombrero de Paja",   emoji: "👒", color: "#F0C040" },
  { id: "chullo",         zona: "cabeza",   region: "Sierra", nombre: "Chullo de Lana",      emoji: "🧢", color: "#E53935" },
  { id: "corona_plumas",  zona: "cabeza",   region: "Selva",  nombre: "Corona de Plumas",    emoji: "🪶", color: "#4CAF50" },
  { id: "camiseta_costa", zona: "cuerpo",   region: "Costa",  nombre: "Camiseta de Playa",   emoji: "👕", color: "#29B6F6" },
  { id: "poncho_sierra",  zona: "cuerpo",   region: "Sierra", nombre: "Poncho de Lana",       emoji: "🧣", color: "#AB47BC" },
  { id: "cushma_selva",   zona: "cuerpo",   region: "Selva",  nombre: "Cushma",               emoji: "👘", color: "#66BB6A" },
  { id: "sandalias",      zona: "pies",     region: "Costa",  nombre: "Sandalias",            emoji: "🩴", color: "#FF7043" },
  { id: "ojotas",         zona: "pies",     region: "Sierra", nombre: "Ojotas",               emoji: "👟", color: "#8D6E63" },
  { id: "descalzo",       zona: "pies",     region: "Selva",  nombre: "Pie Descalzo",         emoji: "🦶", color: "#C68642" },
  { id: "lentes",         zona: "acc_cara", region: "todos",  nombre: "Lentes",               emoji: "👓", color: "#1565C0" },
  { id: "audifonos",      zona: "acc_cara", region: "todos",  nombre: "Audífonos",            emoji: "🎧", color: "#FF6B35" },
  { id: "silla_ruedas",   zona: "acc_mov",  region: "todos",  nombre: "Silla de Ruedas",      emoji: "♿", color: "#0288D1" },
  { id: "baston",         zona: "acc_mov",  region: "todos",  nombre: "Bastón",               emoji: "🦯", color: "#795548" },
];

const ZONAS = [
  { id: "cabeza", label: "Cabeza", emoji: "🎩" },
  { id: "cuerpo", label: "Cuerpo", emoji: "👕" },
  { id: "pies", label: "Pies", emoji: "👟" },
  { id: "acc_cara", label: "Accesorios cara", emoji: "👓" },
  { id: "acc_mov", label: "Accesorios movilidad", emoji: "♿" },
];

export default function JuegoRopa({ onVolver }) {
  const [modo, setModo] = useState(null);
  const [tonoPiel, setTonoPiel] = useState(TONOS_PIEL[1]);
  const [prendas, setPrendas] = useState({});
  const [robotMsg, setRobotMsg] = useState("Elige un modo para comenzar 👗");
  
  const [regionesOrden, setRegionesOrden] = useState([]);
  const [retoActualIdx, setRetoActualIdx] = useState(0);
  const [retoActualRegion, setRetoActualRegion] = useState(null);
  const [retoCompletado, setRetoCompletado] = useState(false);
  const [retroalimentacion, setRetroalimentacion] = useState(null);
  const [zonaActiva, setZonaActiva] = useState("cabeza");

  const { hablar } = useSpeech();
  const { lanzarConfeti } = useConfeti();

  const iniciarReto = useCallback(async () => {
    const regionesAleatorias = REGIONES.sort(() => Math.random() - 0.5);
    setRegionesOrden(regionesAleatorias);
    setRetoActualIdx(0);
    setRetoCompletado(false);
    setPrendas({});
    setRetroalimentacion(null);

    const primeraRegion = regionesAleatorias[0];
    setRetoActualRegion(primeraRegion);

    const msg = `¡Reto 1 de ${regionesAleatorias.length}! Vamos a vestir al amiguito con ropa de la ${primeraRegion}. ¿Listos? 🎯`;
    setRobotMsg(msg);
    hablar(msg);
    setModo("reto");
  }, [hablar]);

  const iniciarLibre = useCallback(async () => {
    setPrendas({});
    setRetroalimentacion(null);
    const msg = "¡Modo libre! Viste al amiguito como quieras. Sin reglas, solo diversión. 🎨";
    setRobotMsg(msg);
    hablar(msg);
    setModo("libre");
  }, [hablar]);

  const seleccionarPrenda = (prenda) => {
    setPrendas(prev => ({
      ...prev,
      [prenda.zona]: prenda
    }));
  };

  const quitarPrenda = (zona) => {
    setPrendas(prev => {
      const nuevo = { ...prev };
      delete nuevo[zona];
      return nuevo;
    });
  };

  const validarReto = useCallback(async () => {
    if (!retoActualRegion) return;

    const prendasRegion = PRENDAS.filter(p => p.region === retoActualRegion);
    const zonasRequeridas = [...new Set(prendasRegion.map(p => p.zona))];

    const estoyCorrecto = zonasRequeridas.every(zona => {
      const prendaActual = prendas[zona];
      return prendaActual && prendasRegion.some(p => p.id === prendaActual.id);
    });

    let msg = "";
    if (estoyCorrecto) {
      lanzarConfeti();
      
      if (retoActualIdx === regionesOrden.length - 1) {
        msg = "¡EXCELENTE! ¡Completaste TODOS los retos! Eres un experto en moda peruana 🏆";
        setRetoCompletado(true);
        hablar(msg);
        setRobotMsg(msg);
      } else {
        const siguienteIdx = retoActualIdx + 1;
        const siguienteRegion = regionesOrden[siguienteIdx];
        setRetoActualIdx(siguienteIdx);
        setRetoActualRegion(siguienteRegion);
        setPrendas({});
        msg = `¡Correcto! 🎉 Reto ${siguienteIdx + 1} de ${regionesOrden.length}: Ahora ropa de la ${siguienteRegion}`;
        hablar(msg);
        setRobotMsg(msg);
      }
    } else {
      const prendasMal = [];
      zonasRequeridas.forEach(zona => {
        const prendaActual = prendas[zona];
        const prendasCorrectas = prendasRegion.filter(p => p.zona === zona);
        
        if (!prendaActual) {
          prendasMal.push(`Falta ropa en ${zona}`);
        } else if (!prendasCorrectas.some(p => p.id === prendaActual.id)) {
          prendasMal.push(`${prendaActual.nombre} es de otra región`);
        }
      });

      msg = `Casi casi... 🤔 ${prendasMal.join(", ")}`;
      setRetroalimentacion(prendasMal);
      hablar(msg);
      setRobotMsg(msg);
    }
  }, [prendas, retoActualRegion, retoActualIdx, regionesOrden, hablar, lanzarConfeti]);

  const resetear = () => {
    setModo(null);
    setPrendas({});
    setTonoPiel(TONOS_PIEL[1]);
    setRetroalimentacion(null);
    setRetoCompletado(false);
    const msg = "¡Volvemos al inicio! ¿Qué prefieres hacer?";
    setRobotMsg(msg);
    hablar(msg);
  };

  if (!modo) {
    return (
      <div className="pantalla pantalla-juego" style={{ paddingBottom: "2rem" }}>
        <header className="juego-header">
          <button className="btn-bloque btn-rojo btn-pequeno" onClick={onVolver}>◀ Menú</button>
          <h2 className="juego-titulo">👗 Viste a mi Amiguito</h2>
          <div style={{ width: 40 }} />
        </header>

        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "2rem", marginTop: "3rem" }}>
          <RobotAmigo mensaje={robotMsg} hablar={false} tamaño="md" />

          <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", justifyContent: "center" }}>
            <button 
              className="btn-bloque btn-amarillo" 
              onClick={iniciarReto}
              style={{ fontSize: "1.1rem", padding: "1rem 2rem" }}
            >
              🎯 Modo Reto
            </button>
            <button 
              className="btn-bloque btn-verde" 
              onClick={iniciarLibre}
              style={{ fontSize: "1.1rem", padding: "1rem 2rem" }}
            >
              🎨 Modo Libre
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pantalla pantalla-juego" style={{ paddingBottom: "2rem" }}>
      <header className="juego-header">
        <button className="btn-bloque btn-rojo btn-pequeno" onClick={onVolver}>◀ Menú</button>
        <h2 className="juego-titulo">
          👗 {modo === "reto" ? "Reto" : "Libre"}
          {modo === "reto" && ` (${retoActualIdx + 1}/${regionesOrden.length})`}
        </h2>
        <button className="btn-bloque btn-amarillo btn-pequeno" onClick={resetear}>⏮</button>
      </header>

      <div style={{ display: "flex", gap: "1rem", justifyContent: "center", maxWidth: 1000, margin: "0 auto", padding: "1rem" }}>
        {/* Left: zonas */}
        <div style={{ width: 160, display: "flex", flexDirection: "column", gap: 8 }}>
          {ZONAS.map(z => (
            <button
              key={z.id}
              onClick={() => setZonaActiva(z.id)}
              style={{
                padding: "0.8rem",
                borderRadius: 8,
                background: zonaActiva === z.id ? "#FFD600" : "rgba(255,255,255,0.04)",
                color: zonaActiva === z.id ? "#1f1f1f" : "#FFD600",
                border: zonaActiva === z.id ? "2px solid rgba(0,0,0,0.08)" : "1px solid rgba(255,255,255,0.06)",
                cursor: "pointer",
                textAlign: "left",
                fontWeight: 900,
                display: "flex",
                alignItems: "center",
                gap: 10,
                fontSize: 14,
              }}
            >
              <span style={{ fontSize: 20 }}>{z.emoji}</span>
              <span>{z.label}</span>
            </button>
          ))}

          <div style={{ marginTop: 12, textAlign: "center", color: "#FFD600", fontSize: "0.85rem" }}>
            {Object.keys(prendas).length === 0 ? "Elige ropa →" : `Prendas: ${Object.keys(prendas).length}`}
          </div>
        </div>

        {/* Center: personaje */}
        <div style={{ flex: "0 0 340px", display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
          <div style={{ background: "rgba(255,255,255,0.07)", borderRadius: 12, border: "2px solid rgba(255,255,255,0.15)", padding: "1rem" }}>
            <PersonajeSVG tonoPiel={tonoPiel} prendas={prendas} />
          </div>

          <div style={{ background: "rgba(255,255,255,0.08)", borderRadius: 8, padding: "0.6rem" }}>
            <p style={{ fontSize: "0.7rem", fontWeight: 800, color: "#FFD600", marginBottom: "0.4rem", textAlign: "center" }}>
              Tono de piel
            </p>
            <div style={{ display: "flex", gap: "0.4rem" }}>
              {TONOS_PIEL.map(t => (
                <button
                  key={t.id}
                  onClick={() => setTonoPiel(t)}
                  style={{
                    width: 32, height: 32, borderRadius: "50%",
                    background: t.color,
                    border: tonoPiel.id === t.id ? "3px solid #FFD600" : "2px solid rgba(255,255,255,0.2)",
                    cursor: "pointer",
                    transform: tonoPiel.id === t.id ? "scale(1.2)" : "scale(1)",
                    transition: "transform 0.15s",
                  }}
                  title={t.nombre}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Right: opciones de la zona activa */}
        <RoperoPrendas
          prendas={prendas}
          onSeleccionar={seleccionarPrenda}
          onQuitar={quitarPrenda}
          zonaActiva={zonaActiva}
        />
      </div>

      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "1rem", marginTop: "2rem" }}>
        <RobotAmigo mensaje={robotMsg} hablar={false} tamaño="sm" />
        
        {modo === "reto" && !retoCompletado && (
          <button className="btn-bloque btn-verde" onClick={validarReto} style={{ fontSize: "1rem", padding: "0.8rem 2rem" }}>
            ✅ Listo - Validar
          </button>
        )}

        {retoCompletado && (
          <button className="btn-bloque btn-amarillo" onClick={resetear} style={{ fontSize: "1rem", padding: "0.8rem 2rem" }}>
            🎪 Jugar de nuevo
          </button>
        )}

        {modo === "libre" && (
          <div style={{ color: "#FFD600", fontSize: "0.9rem", fontStyle: "italic", textAlign: "center" }}>
            Crea tu propio estilo sin restricciones ✨
          </div>
        )}
      </div>
    </div>
  );
}