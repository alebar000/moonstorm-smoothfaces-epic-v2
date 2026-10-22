import { defineConfig } from 'vite';

// Using base: './' guarantees the built dist/ folder works identically on:
// 1. Firebase Hosting (root or subpath, just like Garabato)
// 2. Itch.io HTML5 iframe embeds (which serve from deep CDN subpaths)
// 3. Local static preview servers
export default defineConfig({
  base: './',
  build: {
    outDir: 'dist',
    assetsDir: 'bundle',
    sourcemap: false,
    emptyOutDir: true
  },
  server: {
    port: 5173,
    open: false
  }
});
