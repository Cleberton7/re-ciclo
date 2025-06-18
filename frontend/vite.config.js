import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const isProduction = mode === 'production';

  return {
    base: './',
    plugins: [react()],
    define: {
      'import.meta.env': {
        VITE_API_URL: JSON.stringify(env.VITE_API_URL),
        VITE_GOOGLE_MAPS_KEY: JSON.stringify(env.VITE_GOOGLE_MAPS_KEY),
        VITE_GOOGLE_MAPS_MAP_ID: JSON.stringify(env.VITE_GOOGLE_MAPS_MAP_ID)
      }
    },
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
        '@components': fileURLToPath(new URL('./src/components', import.meta.url))
      },
      extensions: ['.js', '.jsx', '.ts', '.tsx']
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
          headers: {
            'Access-Control-Allow-Origin': '*'
          }
        }
      },
      watch: {
        usePolling: true
      }
    },
    build: {
      target: 'esnext',
      outDir: 'dist',
      assetsDir: 'assets',
      emptyOutDir: true,
      sourcemap: isProduction ? false : true,
      chunkSizeWarningLimit: 2000,
      rollupOptions: {
        output: {
          manualChunks: {
            react: ['react', 'react-dom'],
            router: ['react-router-dom'],
            utils: ['axios', 'date-fns'],
            vendors: ['react-imask', 'chart.js']
          },
          entryFileNames: 'assets/[name]-[hash].js',
          chunkFileNames: 'assets/[name]-[hash].js',
          assetFileNames: 'assets/[name]-[hash][extname]'
        }
      }
    },
    optimizeDeps: {
      include: [
        'react',
        'react-dom',
        'react-router-dom'
      ],
      exclude: [
        'react-icons'
      ]
    }
  };
});