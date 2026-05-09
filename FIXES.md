# 🔧 Fixes aplicados — Mi Robot Amigo

## 1. Fix de voz (speechSynthesis no sonaba)

**Problema:** Los navegadores modernos bloquean el audio hasta que el usuario
hace clic. Intentar hablar al montar el componente falla silenciosamente.

**Solución:** Se exportó `desbloquearVoz()` en `useSpeech.js`. Se llama
en el `onClick` del botón "¡Jugar!" en `PantallaInicio.jsx`:

```js
const handleJugar = () => {
  desbloquearVoz();           // ← desbloquea en el primer clic
  setTimeout(() => {
    hablar("¡Vamos!", { onEnd: () => onJugar() });
  }, 200);
};
```

## 2. Integración con Gemini Pro

Configura tu API key en `.env`:
```
VITE_GEMINI_API_KEY=AIza_TU_CLAVE_AQUI
```

El hook `useRobotIA` en `src/hooks/useRobotIA.js`:
- Llama a Gemini con un prompt de sistema para niños de 4-5 años
- Si Gemini falla o no hay API key → usa respuestas locales (sin error)
- Usado en JuegoComida y JuegoRopa

## 3. Juego de Ropa completo

`JuegoRopa.jsx` ahora tiene:
- Personaje SVG en capas (piel, cuerpo, cabeza, pies, accesorios)
- 5 tonos de piel seleccionables
- Validación: cada zona acepta solo 1 prenda (no puede tener 2 sombreros)
- Accesorios inclusivos: lentes, audífonos, silla de ruedas, bastón
- Visualización en tiempo real del personaje armado
- Botón de reset
- Retroalimentación por voz con Gemini

## 4. Pasos para subir a Vercel con la API key

En Vercel → tu proyecto → Settings → Environment Variables:
  Nombre: VITE_GEMINI_API_KEY
  Valor: tu clave de Gemini

Esto es más seguro que poner la clave en el código.
