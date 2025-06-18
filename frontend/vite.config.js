import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd());

  const baseConfig = {
    plugins: [react()],
    optimizeDeps: {
      include: ['react-imask', 'react', 'react-dom', 'react-router-dom'],
      exclude: ['react-icons']
    },
    define: {
      __APP_ENV__: JSON.stringify(env.APP_ENV || mode),
    },
    build: {
      sourcemap: mode === 'development',
      chunkSizeWarningLimit: 1600,
      rollupOptions: {
        external: ['react-icons'],
        output: {
          manualChunks: (id) => {
            if (id.includes('node_modules/react')) return 'react-vendor';
            if (id.includes('node_modules/react-router-dom')) return 'router-vendor';
            if (id.includes('node_modules')) return 'other-vendor';
          }
        }
      }
    }
  };

  const proxyConfig = {
    '/api': {
      target: env.VITE_API_URL,
      changeOrigin: true,
      secure: env.VITE_API_URL?.startsWith('https://'),
      rewrite: (path) => path.replace(/^\/api/, ''),
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Connection': 'keep-alive'
      }
    }
  };

  return {
    ...baseConfig,
    server: {
      proxy: proxyConfig,
      watch: {
        usePolling: true
      }
    },
    preview: {
      port: 5173,
      proxy: proxyConfig
    }
  };
});