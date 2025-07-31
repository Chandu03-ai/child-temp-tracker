import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  console.log('Loaded environment variables:', env.VITE_API_BASE_URL);

  return {
    plugins: [react()],
    optimizeDeps: {
      exclude: ['lucide-react'],
    },
    server: {
      allowedHosts: ['tempui.aiyensi.com'],
      proxy: {
        '/api': {
          target: env.VITE_API_BASE_URL || 'http://192.168.0.107:8001',
          changeOrigin: true,
          rewrite: path => path.replace(/^\/api/, ''),
        },
      },
    },
  };
});
