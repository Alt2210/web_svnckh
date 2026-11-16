import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';

const frontendRoot = fileURLToPath(new URL('.', import.meta.url));
const repositoryRoot = fileURLToPath(new URL('..', import.meta.url));

export default defineConfig(({ mode }) => {
  // Keep existing local configuration at repository root. Only VITE_ is exposed.
  const env = loadEnv(mode, repositoryRoot, 'VITE_');
  const key = env.VITE_SUPABASE_PUBLISHABLE_KEY || env.VITE_SUPABASE_ANON_KEY || '';
  let role = '';
  if (key.split('.').length === 3) {
    try { role = JSON.parse(Buffer.from(key.split('.')[1], 'base64url').toString()).role || ''; } catch { /* Validated by Supabase if configured. */ }
  }
  if (key.startsWith('sb_secret_') || role === 'service_role') throw new Error('Never use a Supabase secret/service_role key in VITE_ variables. Use a publishable or anon key.');
  return {
  root: frontendRoot,
  envDir: repositoryRoot,
  plugins: [react()],
  // The custom domain serves this application at its root, including assets
  // and Supabase email callbacks. Can be overridden for subdirectory hosting.
  base: env.VITE_BASE_PATH || '/',
  build: {
    outDir: mode === 'pages' ? 'dist-pages' : 'dist',
    emptyOutDir: true,
  },
  };
});
