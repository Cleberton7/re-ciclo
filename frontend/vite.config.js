import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // Carrega variáveis de ambiente
  const env = loadEnv(mode, process.cwd(), '');

  // Configurações base
  const baseConfig = {
    plugins: [react()],
    optimizeDeps: {
      include: [
        'react-imask',
        'react',
        'react-dom',
        'react-router-dom'
      ],
      exclude: ['react-icons']
    },
    define: {
      'process.env': {
        VITE_API_URL: JSON.stringify(env.VITE_API_URL),
        VITE_GOOGLE_MAPS_KEY: JSON.stringify(env.VITE_GOOGLE_MAPS_KEY),
        VITE_GOOGLE_MAPS_MAP_ID: JSON.stringify(env.VITE_GOOGLE_MAPS_MAP_ID)
      }
    },
    build: {
      sourcemap: mode === 'development',
      chunkSizeWarningLimit: 1600,
      rollupOptions: {
        external: ['react-icons'],
        output: {
          manualChunks: {
            react: ['react', 'react-dom'],
            router: ['react-router-dom'],
            vendors: ['react-imask', 'date-fns']
          }
        }
      }
    }
  };

  // Configurações específicas por ambiente
  if (mode === 'development') {
    return {
      ...baseConfig,
      server: {
        proxy: {
          '/api': {
            target: 'http://localhost:5000',
            changeOrigin: true,
            secure: false,
            rewrite: (path) => path.replace(/^\/api/, ''),
            headers: {
              'Access-Control-Allow-Origin': '*'
            }
          }
        },
        watch: {
          usePolling: true
        }
      }
    };
  }

  // Configuração para produção
  return {
    ...baseConfig,
    server: {
      proxy: {
        '/api': {
          target: env.VITE_API_URL || 'https://re-cicle-production.up.railway.app',
          changeOrigin: true,
          secure: true,
          rewrite: (path) => path.replace(/^\/api/, '')
        }
      }
    },
    preview: {
      port: 5173,
      strictPort: true
    }
  };
});