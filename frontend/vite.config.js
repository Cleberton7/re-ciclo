import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [react()],
    define: {
      'import.meta.env': {
        VITE_API_URL: JSON.stringify(env.VITE_API_URL),
        VITE_GOOGLE_MAPS_KEY: JSON.stringify(env.VITE_GOOGLE_MAPS_KEY),
        VITE_GOOGLE_MAPS_MAP_ID: JSON.stringify(env.VITE_GOOGLE_MAPS_MAP_ID)
      }
    },
    optimizeDeps: {
      include: [
        'react',
        'react-dom',
        'react-router-dom',
        'react-imask',
        'date-fns'
      ],
      exclude: [
        'react-icons',
        'cookie',
        'set-cookie-parser'
      ]
    },
    build: {
      sourcemap: mode === 'development',
      chunkSizeWarningLimit: 2000,
      rollupOptions: {
        external: ['react-icons'],
        output: {
          manualChunks: (id) => {
            // Agrupa bibliotecas principais separadamente
            if (id.includes('node_modules/react')) return 'react-vendor';
            if (id.includes('node_modules/react-dom')) return 'react-vendor';
            if (id.includes('node_modules/react-router-dom')) return 'router-vendor';
            
            // Agrupa pacotes pequenos juntos
            if (id.includes('node_modules/cookie') || 
                id.includes('node_modules/set-cookie-parser')) {
              return 'vendor-utils';
            }

            // Agrupa outros pacotes por nome
            const packageName = id.match(/node_modules\/([^\/]+)/)?.[1];
            if (packageName) {
              return `vendor-${packageName}`;
            }

            // Código do seu aplicativo
            if (id.includes('src/')) {
              return 'app';
            }
          },
          chunkFileNames: 'assets/[name]-[hash].js',
          assetFileNames: 'assets/[name]-[hash][extname]',
          entryFileNames: 'assets/[name]-[hash].js'
        }
      }
    },
    server: {
      proxy: {
        '/api': {
          target: env.VITE_API_URL || 'http://localhost:5000',
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
});