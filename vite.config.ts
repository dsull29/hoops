// vite.config.js
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/hoops/', // Keep your existing base path
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          // Check if the module ID (path) includes 'node_modules'
          if (id.includes('node_modules')) {
            // If it's an Ant Design module, put it in a 'vendor-antd' chunk
            if (id.includes('antd')) {
              return 'vendor-antd';
            }
            // If it's React or React DOM, put it in a 'vendor-react' chunk
            if (id.includes('react') || id.includes('react-dom')) {
              return 'vendor-react';
            }
            // For other node_modules, you could create a general 'vendor' chunk
            // or let Vite handle them (they might be smaller or already optimized)
            // For simplicity, we'll just focus on antd and react for now.
            // You can expand this logic if other large vendors appear.
          }
        },
      },
    },
    chunkSizeWarningLimit: 1000,
  },
});
