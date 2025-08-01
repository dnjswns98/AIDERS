import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'


export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server:{
    host:'0.0.0.0',
    https: false,
    allowedHosts: [
        'localhost',
        '127.0.0.1',
        'i13d107.p.ssafy.io'
    ]
  }
})