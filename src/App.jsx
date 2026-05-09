// ============================================================
// App.jsx — Máquina de estados principal de "Mi Robot Amigo"
// Flujo: INICIO → CUENTOS → MENU → JUEGO → (volver a MENU)
// ============================================================

import { useState, useCallback } from "react";
import PantallaInicio from "./components/PantallaInicio";
import CuentosRobot from "./components/CuentosRobot";
import MenuJuegos from "./components/MenuJuegos";
import JuegoComida from "./components/JuegoComida";
import JuegoRopa from "./components/JuegoRopa";
import JuegoCasita from "./components/JuegoCasita";

// ---------- Definición de los estados posibles ----------
// "INICIO"  → Pantalla de bienvenida
// "CUENTOS" → Fase de 3 mini-cuentos narrados por el robot
// "MENU"    → Menú principal con los 3 minijuegos
// "JUEGO"   → El minijuego elegido (sub-estado: juegoActivo)
const ESTADOS = {
  INICIO: "INICIO",
  CUENTOS: "CUENTOS",
  MENU: "MENU",
  JUEGO: "JUEGO",
};

// Nombre simulado del niño (en un MVP real vendría de un form de registro)
const NOMBRE_NINO = "Amiguito";

export default function App() {
  const [estado, setEstado] = useState(ESTADOS.INICIO);
  const [juegoActivo, setJuegoActivo] = useState(null); // "comida" | "ropa" | "casita"

  // ── Transiciones ──────────────────────────────────────────
  const irACuentos = useCallback(() => setEstado(ESTADOS.CUENTOS), []);

  // Llamado por CuentosRobot cuando termina el 3er cuento
  const irAMenu = useCallback(() => setEstado(ESTADOS.MENU), []);

  // Llamado por MenuJuegos al seleccionar un minijuego
  const irAJuego = useCallback((juego) => {
    setJuegoActivo(juego);
    setEstado(ESTADOS.JUEGO);
  }, []);

  // Llamado por cualquier minijuego al terminar o presionar "Volver"
  const volverAMenu = useCallback(() => {
    setJuegoActivo(null);
    setEstado(ESTADOS.MENU);
  }, []);

  // ── Render según estado ───────────────────────────────────
  return (
    <div className="app-root">
      {estado === ESTADOS.INICIO && (
        <PantallaInicio nombreNino={NOMBRE_NINO} onJugar={irACuentos} />
      )}

      {estado === ESTADOS.CUENTOS && (
        <CuentosRobot
          nombreNino={NOMBRE_NINO}
          onCuentosTerminados={irAMenu}
        />
      )}

      {estado === ESTADOS.MENU && (
        <MenuJuegos onSeleccionarJuego={irAJuego} />
      )}

      {estado === ESTADOS.JUEGO && juegoActivo === "comida" && (
        <JuegoComida onVolver={volverAMenu} />
      )}

      {estado === ESTADOS.JUEGO && juegoActivo === "ropa" && (
        <JuegoRopa onVolver={volverAMenu} />
      )}

      {estado === ESTADOS.JUEGO && juegoActivo === "casita" && (
        <JuegoCasita onVolver={volverAMenu} />
      )}
    </div>
  );
}
