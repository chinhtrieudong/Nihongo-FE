import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
  },
  resolve: {
    alias: {
      "@components": path.resolve(__dirname, "./src/components"),
      "@pages": path.resolve(__dirname, "./src/pages"),
      "@services": path.resolve(__dirname, "./src/services"),
      "@utils": path.resolve(__dirname, "./src/utils"),
      "@hooks": path.resolve(__dirname, "./src/hooks"),
      "@contexts": path.resolve(__dirname, "./src/contexts"),
      "@store": path.resolve(__dirname, "./src/store"),
      "@types": path.resolve(__dirname, "./src/types"),
      "@constants": path.resolve(__dirname, "./src/constants"),
      "@styles": path.resolve(__dirname, "./src/styles"),
      "@kanji-types": path.resolve(__dirname, "./src/types/kanji.ts"),
      "@lesson-types": path.resolve(__dirname, "./src/types/lesson.ts"),
      // Relative path aliases
      "../store": path.resolve(__dirname, "./src/store"),
      "../constants": path.resolve(__dirname, "./src/constants"),
      "./conversation": path.resolve(
        __dirname,
        "./src/components/conversation",
      ),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom')) {
              return 'react-vendor';
            }
            if (id.includes('react-router')) {
              return 'router-vendor';
            }
            if (id.includes('antd') || id.includes('@ant-design')) {
              return 'ui-vendor';
            }
            if (id.includes('@reduxjs') || id.includes('react-redux')) {
              return 'state-vendor';
            }
            if (id.includes('axios') || id.includes('framer-motion') || id.includes('wanakana') || id.includes('kanjivg')) {
              return 'utils-chunk';
            }
          }
        },
      },
    },
    chunkSizeWarningLimit: 1000,
  },
  optimizeDeps: {
    include: ["react", "react-dom", "react-router-dom", "antd"],
  },
  server: {
    port: 3000,
    strictPort: false,
    host: true,
    open: false,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
