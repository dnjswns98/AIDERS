// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],

  // 🔥 WASM 파일을 정적 자산으로 인식
  assetsInclude: ['**/*.wasm', '**/*.onnx'],

  server: {
    host: '0.0.0.0',
    https: false,
    allowedHosts: [
      'localhost',
      '127.0.0.1',
      'i13d107.p.ssafy.io',
    ],

    middlewareMode: false,
    fs: {
      strict: false
    },

    configureServer(server) {
      console.log('🔧 [Vite] WASM/ONNX 파일 서빙 미들웨어 활성화');
      
      server.middlewares.use((req, res, next) => {
        // WASM 파일 요청 감지
        if (req.url && req.url.includes('.wasm')) {
          console.log('🔧 [WASM] 요청 감지:', req.url);
          res.setHeader('Content-Type', 'application/wasm');
          res.setHeader('Cache-Control', 'no-cache');
          res.setHeader('Access-Control-Allow-Origin', '*');
        }
        
        // ONNX 파일 요청 감지
        if (req.url && req.url.includes('.onnx')) {
          console.log('🔧 [ONNX] 요청 감지:', req.url);
          res.setHeader('Content-Type', 'application/octet-stream');
          res.setHeader('Cache-Control', 'no-cache');
          res.setHeader('Access-Control-Allow-Origin', '*');
        }
        
        next();
      });
    },

    cors: true,
    
    // 🔥 COEP 정책 완화 (Kakao Map과 호환)
    headers: {
      'Cross-Origin-Opener-Policy': 'same-origin',
      // 🔥 COEP를 credentialless로 변경 (더 관대한 정책)
      'Cross-Origin-Embedder-Policy': 'credentialless',
      // 또는 아예 제거하고 필요할 때만 적용:
      // 'Cross-Origin-Embedder-Policy': 'unsafe-none'
    }
  },

  publicDir: 'public'
})
