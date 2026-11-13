import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';

export default defineConfig(({ mode }) => mode === 'pages' ? {
  plugins: [react()],
  root: fileURLToPath(new URL('./temp', import.meta.url)),
  publicDir: fileURLToPath(new URL('./public', import.meta.url)),
  base: '/web_svnckh/',
  build: {
    outDir: fileURLToPath(new URL('./dist-pages', import.meta.url)),
    emptyOutDir: true,
  },
} : {
  plugins: [react()],
  build: {
    rollupOptions: {
      input: {
        main: fileURLToPath(new URL('./index.html', import.meta.url)),
        temp: fileURLToPath(new URL('./temp/index.html', import.meta.url)),
      },
    },
  },
});
