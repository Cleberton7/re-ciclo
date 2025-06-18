import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  const isProduction = mode === 'production';
  const apiTarget = isProduction 
    ? env.VITE_API_URL 
    : 'http://localhost:5000';

  return {
    plugins: [react()],
    define: {
      // Padrão mais seguro para Vite
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
        'react-imask'
      ],
      exclude: ['react-icons'],
      // Adicione para resolver conflitos
      esbuildOptions: {
        keepNames: true
      }
    },
    build: {
      sourcemap: !isProduction,
      minify: isProduction ? 'esbuild' : false,
      chunkSizeWarningLimit: 2000,
      rollupOptions: {
        external: ['react-icons'],
        output: {
          // Configuração mais segura para chunks
          manualChunks: (id) => {
            if (id.includes('node_modules/react')) return 'react-vendor';
            if (id.includes('node_modules/react-dom')) return 'react-vendor';
            if (id.includes('node_modules/react-router-dom')) return 'router-vendor';
            
            // Agrupa por nome de pacote para evitar conflitos
            const packageName = id.match(/node_modules\/([^\/]+)/)?.[1];
            return packageName ? `vendor-${packageName}` : undefined;
          },
          // Evita minificação de nomes que causam conflitos
          hoistTransitiveImports: false,
          preserveModules: false
        }
      }
    },
    server: {
      proxy: {
        '/api': {
          target: apiTarget,
          changeOrigin: true,
          secure: isProduction,
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