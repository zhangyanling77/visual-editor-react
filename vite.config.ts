// @ts-ignore
import reactRefresh from '@vitejs/plugin-react-refresh'
import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    base: '/react-demo/',
    outDir: 'docs',
  },
  optimizeDeps: {
    include: []
  },
  plugins: [reactRefresh()],
  esbuild: {
    jsxInject: "import React from 'react'",
  },
})
