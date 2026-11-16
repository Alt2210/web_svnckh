import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), 'VITE_');
  const key = env.VITE_SUPABASE_PUBLISHABLE_KEY || env.VITE_SUPABASE_ANON_KEY || '';
  let role = '';
  if (key.split('.').length === 3) {
    try { role = JSON.parse(Buffer.from(key.split('.')[1], 'base64url').toString()).role || ''; } catch { /* Validated by Supabase if configured. */ }
  }
  if (key.startsWith('sb_secret_') || role === 'service_role') throw new Error('Never use a Supabase secret/service_role key in VITE_ variables. Use a publishable or anon key.');
  return {
  plugins: [react()],
  base: mode === 'pages' ? '/web_svnckh/' : '/',
  build: {
    outDir: mode === 'pages' ? 'dist-pages' : 'dist',
    emptyOutDir: true,
  },
  };
});
