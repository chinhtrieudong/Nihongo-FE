import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunks
          'react-vendor': ['react', 'react-dom'],
          'router-vendor': ['react-router-dom'],
          'ui-vendor': ['antd', '@ant-design/icons'],
          'state-vendor': ['@reduxjs/toolkit', 'react-redux'],

          // Feature chunks
          'kanji-chunk': ['./src/pages/Kanji', './src/pages/KanjiDetail', './src/pages/RadicalDetail'],
          'pronunciation-chunk': ['./src/pages/Pronunciation'],
          'conversation-chunk': ['./src/pages/Conversation', './src/pages/ConversationLesson'],
          'tests-chunk': ['./src/pages/Tests', './src/pages/TestDetail', './src/pages/TestResults'],
          'admin-chunk': ['./src/pages/AdminDataManager', './src/components/AdminLayout'],

          // Utils and libraries
          'utils-chunk': ['axios', 'framer-motion', 'wanakana', 'hanzi-writer', 'kanjivg-js'],
        },
      },
    },
    chunkSizeWarningLimit: 1000,
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom', 'antd'],
  },
  server: {
    port: 3000,
    strictPort: false,
  },
});
