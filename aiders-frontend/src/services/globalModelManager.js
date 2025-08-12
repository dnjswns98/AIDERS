// src/services/globalModelManager.js

import modelCacheManager from "./modelCacheManager.js";
import { preprocessImage } from "../../preprocess.js"; // 동일 경로 사용 통일

const ortPromise = import("onnxruntime-web");

class GlobalModelManager {
  constructor() {
    this.session = null;
    this.alphabet = null;
    this.isLoaded = false;
    this.loadingPromise = null;
    this.modelVersion = "1.0.0";
    this.CACHE_KEYS = {
      MODEL: `crnn_model_${this.modelVersion}`,
      ALPHABET: `crnn_alphabet_${this.modelVersion}`,
    };
    this.setupOnnxRuntime();
  }

  async setupOnnxRuntime() {
    try {
      const ort = await ortPromise;
      ort.env.wasm.wasmPaths = {
        "ort-wasm.wasm": "/ort-wasm.wasm",
        "ort-wasm-threaded.wasm": "/ort-wasm-threaded.wasm",
        "ort-wasm-simd.wasm": "/ort-wasm-simd.wasm",
        "ort-wasm-simd-threaded.wasm": "/ort-wasm-simd-threaded.wasm",
      };
      ort.env.wasm.numThreads = 1;
      ort.env.wasm.simd = false;
      ort.env.wasm.proxy = false;
      ort.env.logLevel = "info";
    } catch (error) {
      console.error("❌ [GlobalModelManager] ONNX Runtime 설정 실패:", error);
    }
  }

  async checkWasmFiles() {
    const wasmFiles = ["/ort-wasm.wasm", "/ort-wasm-simd.wasm"];
    for (const wasmFile of wasmFiles) {
      try {
        const resp = await fetch(wasmFile, { method: "HEAD" });
        if (!resp.ok) throw new Error(`${wasmFile} 접근 실패 (${resp.status})`);
      } catch (error) {
        console.error(`❌ [WASM 체크] ${wasmFile}:`, error.message);
        throw error;
      }
    }
  }

  async initialize() {
    if (this.isLoaded && this.session) return;
    if (this.loadingPromise) return this.loadingPromise;

    this.loadingPromise = this._loadAndCreateSession();

    try {
      await this.loadingPromise;
      this.isLoaded = true;

      // 🔹alphabet 유효성 검사
      if (!this.alphabet || this.alphabet.length < 5 || !/[가-힣]/.test(this.alphabet.join(""))) {
        console.error("❌ [Alphabet 오류] 한글 데이터가 아니거나 너무 짧음 → 캐시 삭제 & 재로드");
        await this.clearCache();
        await this._loadAndCreateSession();
      }
    } catch (error) {
      console.error("❌ [GlobalModelManager] 모델 초기화 실패:", error);
      this.isLoaded = false;
      this.session = null;
      this.alphabet = null;
      throw error;
    } finally {
      this.loadingPromise = null;
    }
  }

  async _loadAndCreateSession() {
    await this.checkWasmFiles();

    let modelArrayBuffer = await this._getModelDataFromCache(this.CACHE_KEYS.MODEL);
    let alphabetText = await this._getAlphabetDataFromCache(this.CACHE_KEYS.ALPHABET);

    if (!modelArrayBuffer || !alphabetText) {
      [modelArrayBuffer, alphabetText] = await this._fetchAndCacheAssets();
    }

    const ort = await ortPromise;
    const sessionOptions = {
      executionProviders: ["wasm"],
      graphOptimizationLevel: "disabled",
      enableCpuMemArena: false,
      enableMemPattern: false,
      executionMode: "sequential",
      logId: "crnn_session",
      logSeverityLevel: 2,
    };

    const sessionPromise = ort.InferenceSession.create(modelArrayBuffer, sessionOptions);
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error("세션 생성 타임아웃 (60초)")), 60000)
    );

    this.session = await Promise.race([sessionPromise, timeoutPromise]);
    this.alphabet = alphabetText.trim().split("");

    console.log(`✅ 모델·알파벳 로드 (${this.alphabet.length}자)`);
    console.log("📖 Alphabet (앞 50자):", this.alphabet.slice(0, 50).join(""));
  }

  async _fetchAndCacheAssets() {
    const modelUrl = "/model/crnn_48x1152.onnx";
    const alphabetUrl = "/alphabets/alphabet.txt";

    const modelResponse = await fetch(modelUrl);
    if (!modelResponse.ok) throw new Error(`모델 다운로드 실패: ${modelResponse.status}`);
    const modelArrayBuffer = await modelResponse.arrayBuffer();

    const alphabetResponse = await fetch(alphabetUrl);
    if (!alphabetResponse.ok) throw new Error(`알파벳 다운로드 실패: ${alphabetResponse.status}`);
    const alphabetText = await alphabetResponse.text();

    await Promise.all([
      modelCacheManager.saveModel(this.CACHE_KEYS.MODEL, modelUrl, modelArrayBuffer, {
        version: this.modelVersion,
        type: "model"
      }),
      modelCacheManager.saveModel(this.CACHE_KEYS.ALPHABET, alphabetUrl, new TextEncoder().encode(alphabetText).buffer, {
        version: this.modelVersion,
        type: "alphabet"
      }),
    ]);
    return [modelArrayBuffer, alphabetText];
  }

  async _getModelDataFromCache(key) {
    try {
      const cached = await modelCacheManager.loadModel(key);
      return cached?.data || null;
    } catch {
      return null;
    }
  }

  async _getAlphabetDataFromCache(key) {
    try {
      const cached = await modelCacheManager.loadModel(key);
      return cached ? new TextDecoder().decode(cached.data) : null;
    } catch {
      return null;
    }
  }

  async predict(base64String) {
    if (!this.isLoaded) await this.initialize();
    if (!this.session) throw new Error("ONNX 세션이 유효하지 않습니다.");

    try {
      console.log(`📌 Predict 시작 (base64 length: ${base64String?.length || 0})`);
      const ort = await ortPromise;
      const inputData = await preprocessImage(base64String);

      console.log("📊 입력 텐서:", {
        length: inputData.length,
        min: Math.min(...inputData),
        max: Math.max(...inputData)
      });

      console.log("📖 Alphabet(앞 30자):", this.alphabet.slice(0, 30).join(""));

      const inputTensor = new ort.Tensor("float32", inputData, [1, 1, 48, 1152]);
      const feeds = { [this.session.inputNames[0]]: inputTensor };
      const results = await this.session.run(feeds);
      const output = results[this.session.outputNames[0]];

      const decoded = this._ctcDecode(output);
      console.log("🔍 예측 결과:", decoded);
      return decoded;
    } catch (err) {
      console.error("❌ [GlobalModelManager] 예측 오류:", err);
      throw err;
    }
  }

  _ctcDecode(outputTensor) {
    const [timesteps, , numClasses] = outputTensor.dims;
    const data = outputTensor.data;
    let decoded = "", lastIndex = -1;

    for (let t = 0; t < timesteps; t++) {
      const start = t * numClasses;
      let maxProb = -Infinity, maxIndex = -1;
      for (let c = 0; c < numClasses; c++) {
        const val = data[start + c];
        if (val > maxProb) {
          maxProb = val;
          maxIndex = c;
        }
      }
      if (maxIndex !== lastIndex && maxIndex !== 0) {
        decoded += this.alphabet[maxIndex - 1] || "?";
      }
      lastIndex = maxIndex;
    }
    return decoded;
  }

  async clearCache() {
    if (this.session?.release) {
      try { await this.session.release(); } catch {}
    }
    this.session = null;
    this.alphabet = null;
    this.isLoaded = false;
    try {
      await Promise.all([
        modelCacheManager.deleteModel(this.CACHE_KEYS.MODEL),
        modelCacheManager.deleteModel(this.CACHE_KEYS.ALPHABET),
      ]);
    } catch {}
  }

  async dispose() {
    await this.clearCache();
  }
}

const globalModelManager = new GlobalModelManager();

if (typeof window !== "undefined") {
  window.globalModelManager = globalModelManager;
  window.addEventListener("beforeunload", () => {
    globalModelManager.dispose().catch(console.error);
  });
}

export default globalModelManager;
