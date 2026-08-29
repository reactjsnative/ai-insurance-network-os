import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    // These are Node-only server libraries used via dynamic import in lib files.
    // They must NOT be bundled into the browser client build.
    optimizeDeps: {
      exclude: ['googleapis', 'pg', 'node-fetch', 'fs', 'path'],
    },
    build: {
      rollupOptions: {
        external: ['googleapis', 'pg', 'node-fetch', 'fs', 'path', 'child_process', 'node:util', 'node:stream', 'node:buffer'],
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
