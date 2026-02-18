import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// SECURITY: Do NOT use `define` to inject secrets into the bundle.
// All VITE_ prefixed env vars are intentionally public (Supabase anon key, Paystack public key).
// Secrets (webhook URLs, signing keys) must live in Supabase Edge Function env vars only.

export default defineConfig({
  server: {
    port: 3000,
    host: '0.0.0.0',
  },
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
  },
  build: {
    // Suppress source maps in production to avoid leaking code structure
    sourcemap: false,
    rollupOptions: {
      output: {
        // Code splitting: vendor libs in a separate chunk for better caching
        manualChunks: {
          vendor: ['react', 'react-dom'],
          supabase: ['@supabase/supabase-js'],
          icons: ['lucide-react'],
        },
      },
    },
    // Warn if any chunk exceeds 500kB
    chunkSizeWarningLimit: 500,
  },
});
