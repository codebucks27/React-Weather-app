import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), 'PUBLIC_URL');

  return {
    plugins: [react()],
    base: env.PUBLIC_URL || '/',
    envPrefix: ['VITE_', 'REACT_APP_'],
    appType: 'spa',
    server: { port: 3000 },
    preview: { port: 3000 },
    build: { outDir: 'build' },
    test: {
      environment: 'jsdom',
      setupFiles: ['./src/setupTests.js'],
    },
  };
});
