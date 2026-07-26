import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { fileURLToPath, URL } from 'node:url'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      // P3-1：配置 @/ 路径别名，统一用 @/components/... 取代 ../../ 相对路径
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
})