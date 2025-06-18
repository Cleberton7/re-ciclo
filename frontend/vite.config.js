import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { visualizer } from 'rollup-plugin-visualizer';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const isProduction = mode === 'production';

  return {
    plugins: [
      react(),
      isProduction && visualizer({
        open: true,
        filename: 'dist/bundle-stats.html'
      })
    ],
    define: {
      'import.meta.env': JSON.stringify({
        VITE_API_URL: env.VITE_API_URL,
        VITE_GOOGLE_MAPS_KEY: env.VITE_GOOGLE_MAPS_KEY,
        VITE_GOOGLE_MAPS_MAP_ID: env.VITE_GOOGLE_MAPS_MAP_ID,
        MODE: mode
      })
    },
    server: {
      port: 5173,
      strictPort: true,
      proxy: {
        '/api': {
          target: env.VITE_API_URL || 'http://localhost:5000',
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path.replace(/^\/api/, ''),
          configure: (proxy) => {
            proxy.on('error', (err) => {
              console.error('Proxy error:', err);
            });
          }
        }
      }
    },
    build: {
      target: 'esnext',
      minify: isProduction ? 'terser' : false,
      sourcemap: !isProduction,
      chunkSizeWarningLimit: 2500,
      rollupOptions: {
        output: {
          manualChunks: {
            react: ['react', 'react-dom'],
            router: ['react-router-dom'],
            charts: ['chart.js', '@vis.gl/react-google-maps'],
            utils: ['axios', 'date-fns', 'imask'],
            vendors: [
              /node_modules\/@?[a-z0-9-]+/,
              '!react*',
              '!react-router*'
            ]
          },
          entryFileNames: 'assets/[name]-[hash].js',
          chunkFileNames: 'assets/[name]-[hash].js',
          assetFileNames: 'assets/[name]-[hash][extname]'
        }
      },
      terserOptions: {
        compress: {
          drop_console: isProduction
        }
      }
    }
  };
});