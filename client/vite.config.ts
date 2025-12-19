import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import svgr from "vite-plugin-svgr";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    svgr({
      svgrOptions: {
        icon: true,
        // This will transform your SVG to a React component
        exportType: "named",
        namedExport: "ReactComponent",
      },
    }),
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          // Clerk authentication
          if (id.includes('node_modules/@clerk')) {
            return 'clerk';
          }
          // Recharts
          if (id.includes('node_modules/recharts')) {
            return 'recharts';
          }
          // All other node_modules including React
          if (id.includes('node_modules')) {
            return 'vendor';
          }
        },
      },
    },
    chunkSizeWarningLimit: 1000,
    sourcemap: false,
  },
  resolve: {
    dedupe: ['react', 'react-dom', 'react-router-dom'],
  },
});
