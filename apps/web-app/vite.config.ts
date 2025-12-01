import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      '@ita-rp/shared-types': resolve(__dirname, '../../packages/shared-types/src'),
      '@ita-rp/core-engine': resolve(__dirname, '../../packages/core-engine/src'),
      '@ita-rp/ui-components': resolve(__dirname, '../../packages/ui-components/src'),
      '@ita-rp/game-logic': resolve(__dirname, '../../packages/game-logic/src'),
      '@ita-rp/curriculum': resolve(__dirname, '../../packages/curriculum/src'),
    },
  },
  server: {
    port: 3000,
    host: true,
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
});