import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import * as path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    // Optimizaciones de producción
    target: 'esnext',
    // Usa esbuild (viene incluido por defecto)
    minify: 'esbuild',
    rollupOptions: {
      output: {
        // Code splitting para mejor carga
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'framer-motion': ['framer-motion'],
          'radix-ui': [
            '@radix-ui/react-checkbox',
            '@radix-ui/react-dialog',
            '@radix-ui/react-label',
            '@radix-ui/react-scroll-area',
            '@radix-ui/react-tabs',
            '@radix-ui/react-toast',
            '@radix-ui/react-tooltip',
          ],
        },
      },
    },
    // Tamaño de chunk warning más alto
    chunkSizeWarningLimit: 1000,
    // Optimizar CSS
    cssCodeSplit: true,
    // Source maps solo en desarrollo
    sourcemap: false,
  },
  // Optimizar dependencias pre-bundleadas
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'framer-motion',
      'react-router-dom',
      'lucide-react',
    ],
  },
  // Eliminar console.log en producción
  esbuild: {
    drop: ['console', 'debugger'],
  },
})
