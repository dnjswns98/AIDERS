// vite.config.js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],

  server: {
    host: "0.0.0.0",
    port: 5173, // 포트 번호 명시
    https: false,
    allowedHosts: ["localhost", "127.0.0.1", "i13d107.p.ssafy.io"],
    fs: {
      strict: false, // 경로 문제 발생 시 유연하게 대처
    },

    // 🔥 추가: Vite 개발 서버가 .wasm 파일을 올바른 MIME 타입으로 제공하도록 미들웨어 설정
    // 이것이 'Incorrect response MIME type' 오류를 해결합니다.
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (req.url.endsWith(".wasm")) {
          res.setHeader("Content-Type", "application/wasm");
        }
        next();
      });
    },

    // WASM을 위한 COOP/COEP 헤더 설정은 매우 중요하므로 유지합니다.
    headers: {
      "Cross-Origin-Opener-Policy": "same-origin",
      "Cross-Origin-Embedder-Policy": "credentialless",
    },
  },

  publicDir: "public",
});
