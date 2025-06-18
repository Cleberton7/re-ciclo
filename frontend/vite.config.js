import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd());

  return {
    plugins: [react()],
    
    // Configuração otimizada de dependências
    optimizeDeps: {
      include: [
        'react',
        'react-dom',
        'react-router-dom',
        'react-imask'
      ],
      exclude: ['react-icons'],
      force: true // Força re-otimização quando necessário
    },

    // Configuração de build melhorada
    build: {
      sourcemap: mode === 'development',
      minify: mode === 'production' ? 'esbuild' : false,
      chunkSizeWarningLimit: 2000,
      rollupOptions: {
        external: ['react-icons'],
        output: {
          manualChunks: (id) => {
            if (id.includes('node_modules/react')) {
              return 'react-vendor';
            }
            if (id.includes('node_modules/react-router-dom')) {
              return 'router-vendor';
            }
            if (id.includes('node_modules')) {
              // Agrupa outras dependências por pacote
              const packageName = id.match(/node_modules\/([^\/]+)/)?.[1];
              return packageName ? `vendor-${packageName}` : 'other-vendor';
            }
          },
          // Evita conflitos de nomes
          chunkFileNames: `assets/[name]-[hash].js`,
          entryFileNames: `assets/[name]-[hash].js`
        }
      }
    },

    // Configuração do servidor
    server: {
      proxy: {
        '/api': {
          target: env.VITE_API_URL,
          changeOrigin: true,
          secure: env.VITE_API_URL?.startsWith('https://'),
          rewrite: (path) => path.replace(/^\/api/, ''),
          configure: (proxy) => {
            proxy.on('error', (err) => {
              console.error('Proxy error:', err);
            });
          }
        }
      },
      watch: {
        usePolling: true,
        interval: 1000
      }
    },

    // Configuração de preview
    preview: {
      port: 5173,
      strictPort: true,
      proxy: {
        '/api': {
          target: env.VITE_API_URL,
          changeOrigin: true,
          secure: env.VITE_API_URL?.startsWith('https://')
        }
      }
    }
  };
});