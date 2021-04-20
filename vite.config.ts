// @ts-ignore
import reactRefresh from '@vitejs/plugin-react-refresh';
import { defineConfig } from 'vite';
// import vitePluginImp from 'vite-plugin-imp'; // 按需引入
import { resolve } from 'path';

export default defineConfig({
  base: '/visual-editor-react/',
  build: {
    outDir: 'public',
  },
  optimizeDeps: {
    include: []
  },
  plugins: [
    reactRefresh(),
    // vitePluginImp({
    //   libList: [
    //     {
    //       libName: "antd",
    //       style: (name) => `antd/lib/${name}/style/index.less`,
    //     },
    //   ],
    // }),
  ],
  esbuild: {
    jsxInject: "import React from 'react'",
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
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
      },
    },
  },
});
