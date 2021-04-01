// @ts-ignore
import reactRefresh from '@vitejs/plugin-react-refresh';
import { defineConfig } from 'vite';

const path = require('path');

export default defineConfig({
  base: '/visual-editor',
  build: {
    outDir: 'docs',
  },
  optimizeDeps: {
    include: []
  },
  plugins: [reactRefresh()],
  esbuild: {
    jsxInject: "import React from 'react'",
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    }
  },
  css: {
    preprocessorOptions: {
      less: {
        // 支持内联 JavaScript
        javascriptEnabled: true,
        // 重写 less 变量，定制样式
        modifyVars: {
          '@primary-color': '#eb2f96',
        },
      },
      scss: {
        // 自动导入全局样式
        additionalData: "@import '@/styles/base.scss';", 
      }
    },
  },
});
