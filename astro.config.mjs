import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  vite: {
    plugins: [tailwindcss()],
    // MapLibre is one ~1.1 MB chunk (~290 KB gzipped); Maps.astro loads it only when the map nears the viewport.
    build: { chunkSizeWarningLimit: 1200 },
  },
});
