import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig({
  root: resolve(__dirname, 'client'), // 👈 frontend entry
  plugins: [react()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'client', 'src'),
    },
  },
  build: {
    outDir: resolve(__dirname, 'client', 'dist'), // 👈 ensures it outputs inside client
    emptyOutDir: true,
  },
  base: './', // 👈 required so relative paths work in production (like on Render)
});
