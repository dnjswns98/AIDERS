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

    // 🔥 더 직접적인 WASM 파일 처리
    middlewareMode: false,
    fs: {
      strict: false // WASM 파일 접근 허용
    },

    // 🔥 미들웨어 방식 개선 (API 이름만 수정!)
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

    // 🔥 CORS 및 헤더 설정
    cors: true,
    headers: {
      'Cross-Origin-Opener-Policy': 'same-origin',
      'Cross-Origin-Embedder-Policy': 'require-corp',
    }
  },

  // 🔥 개발 시 정적 파일 처리 강화
  publicDir: 'public'
})
