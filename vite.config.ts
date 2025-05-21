import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

// Get __dirname in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig({
  // Entry point for the frontend
  root: resolve(__dirname, 'client'),

  plugins: [react()],

  // Fix for alias imports like "@/components/..."
  resolve: {
    alias: {
      '@': resolve(__dirname, 'client', 'src'),
    },
  },

  // Build output config
  build: {
    outDir: resolve(__dirname, 'client', 'dist'),
    emptyOutDir: true,
  },

  // Ensures relative paths work (especially in deployments like Vercel or Render)
  base: './',
});
