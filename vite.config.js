import { defineConfig } from 'vite';

// Rutas relativas: la misma compilación sirve para GitHub Pages y para la app de escritorio.
export default defineConfig({
  base: './',
  build: { outDir: 'dist', chunkSizeWarningLimit: 1500 }
});
