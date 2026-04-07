import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
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
        manualChunks: {
          // Vendor chunks
          "react-vendor": ["react", "react-dom"],
          "router-vendor": ["react-router-dom"],
          "ui-vendor": ["antd", "@ant-design/icons"],
          "state-vendor": ["@reduxjs/toolkit", "react-redux"],

          // Feature chunks
          "kanji-chunk": [
            "./src/pages/KanjiDetail",
            "./src/pages/RadicalDetail",
          ],
          "pronunciation-chunk": ["./src/pages/Pronunciation"],
          "conversation-chunk": [
            "./src/pages/Conversation",
            "./src/pages/ConversationLesson",
          ],
          "tests-chunk": [
            "./src/pages/Tests",
            "./src/pages/TestDetail",
            "./src/pages/TestResults",
          ],
          "admin-chunk": ["./src/components/admin/AdminLayout"],

          // Utils and libraries
          "utils-chunk": [
            "axios",
            "framer-motion",
            "wanakana",
            "kanjivg-js",
          ],
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
  },
});
