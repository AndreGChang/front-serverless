import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: "/", // 🔥 Define a base corretamente
  server: {
    middlewareMode: true, // Garante que as rotas sejam servidas corretamente
  }
});