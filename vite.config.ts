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
        output: {
          manualChunks(id) {
            if (id.includes('node_modules/firebase')) return 'vendor-firebase';
            if (id.includes('node_modules/recharts') || id.includes('node_modules/d3-') || id.includes('node_modules/victory-vendor')) return 'vendor-charts';
            if (id.includes('node_modules/motion') || id.includes('node_modules/framer-motion')) return 'vendor-motion';
            if (id.includes('node_modules/lucide-react')) return 'vendor-icons';
            if (id.includes('node_modules/react') || id.includes('node_modules/scheduler')) return 'vendor-react';
          },
        },
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
