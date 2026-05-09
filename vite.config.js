import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd())
  const geminiKey = env.VITE_GEMINI_API_KEY || ""

  return {
    plugins: [react()],
    server: {
      proxy: {
        '/api/gemini': {
          target: 'https://generativelanguage.googleapis.com',
          changeOrigin: true,
          rewrite: (path) =>
            path.replace(/^\/api\/gemini/, `/v1beta2/models/text-bison-001:generate?key=${geminiKey}`),
        },
      },
    },
  }
})
