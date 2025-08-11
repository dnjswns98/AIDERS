// src/services/globalModelManager.js

import modelCacheManager from './modelCacheManager.js';
import { preprocessImage } from '../../preprocess.js';

const ortPromise = import('onnxruntime-web');

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
                'ort-wasm.wasm': '/ort-wasm.wasm',
                'ort-wasm-threaded.wasm': '/ort-wasm-threaded.wasm',
                'ort-wasm-simd.wasm': '/ort-wasm-simd.wasm',
                'ort-wasm-simd-threaded.wasm': '/ort-wasm-simd-threaded.wasm'
            };

            ort.env.wasm.numThreads = 1;
            ort.env.wasm.simd = false;
            ort.env.wasm.proxy = false;
            ort.env.logLevel = 'info';
            
        } catch (error) {
            console.error('❌ [GlobalModelManager] ONNX Runtime 설정 실패:', error);
        }
    }

    async checkWasmFiles() {
        const wasmFiles = [
            '/ort-wasm.wasm',
            '/ort-wasm-simd.wasm'
        ];

        for (const wasmFile of wasmFiles) {
            try {
                const response = await fetch(wasmFile, { method: 'HEAD' });
                const contentType = response.headers.get('content-type');
                
                if (!response.ok) {
                    throw new Error(`WASM 파일 접근 실패: ${response.status}`);
                }
                
                if (contentType && !contentType.includes('wasm') && !contentType.includes('octet-stream')) {
                }
                
            } catch (error) {
                console.error(`❌ [WASM 체크] ${wasmFile} 접근 불가:`, error.message);
                throw new Error(`WASM 파일 준비되지 않음: ${wasmFile}`);
            }
        }
        
    }

    async initialize() {
        if (this.isLoaded && this.session) {
            return;
        }

        if (this.loadingPromise) {
            return this.loadingPromise;
        }

        this.loadingPromise = this._loadAndCreateSession();
        
        try {
            await this.loadingPromise;
            this.isLoaded = true;
        } catch (error) {
            console.error("❌ [GlobalModelManager] 모델 초기화 중 심각한 오류 발생:", error);
            this.isLoaded = false;
            this.session = null;
            this.alphabet = null;
            throw error;
        } finally {
            this.loadingPromise = null;
        }
    }

    async _loadAndCreateSession() {
        try {
            await this.checkWasmFiles();
            
            let modelArrayBuffer = await this._getModelDataFromCache(this.CACHE_KEYS.MODEL);
            let alphabetText = await this._getAlphabetDataFromCache(this.CACHE_KEYS.ALPHABET);

            if (!modelArrayBuffer || !alphabetText) {
                [modelArrayBuffer, alphabetText] = await this._fetchAndCacheAssets();
            } else {
            }

            if (performance.memory) {
                const memory = performance.memory;
            }

            
            const ort = await ortPromise;
            
            const sessionOptions = {
                executionProviders: ['wasm'],
                graphOptimizationLevel: 'disabled',
                enableCpuMemArena: false,
                enableMemPattern: false,
                executionMode: 'sequential',
                logId: 'crnn_session',
                logSeverityLevel: 2
            };


            const sessionPromise = ort.InferenceSession.create(modelArrayBuffer, sessionOptions);
            const timeoutPromise = new Promise((_, reject) => {
                setTimeout(() => reject(new Error('세션 생성 타임아웃 (60초)')), 60000);
            });
            
            this.session = await Promise.race([sessionPromise, timeoutPromise]);
            this.alphabet = alphabetText.trim().split("");

            if (performance.memory) {
                const memory = performance.memory;
            }

        } catch (error) {
            console.error("❌ [GlobalModelManager] ONNX 세션 생성에 실패했습니다.", error);
            
            if (error.message) {
            }
            if (error.stack) {
            }
            
            await this.clearCache().catch(err => console.error("캐시 삭제 중 추가 오류 발생", err));
            throw error;
        }
    }

    async _fetchAndCacheAssets() {
        const modelUrl = "/model/crnn_48x1152.onnx";
        const alphabetUrl = "/alphabets/alphabet.txt";

        const modelResponse = await fetch(modelUrl);
        
        if (!modelResponse.ok) {
            throw new Error(`모델 파일 다운로드 실패: 서버가 ${modelResponse.status} ${modelResponse.statusText} 상태로 응답했습니다.`);
        }

        const modelArrayBuffer = await modelResponse.arrayBuffer();
        
        if (modelArrayBuffer.byteLength < 4) {
            throw new Error("다운로드된 모델 파일이 너무 작습니다.");
        }

        const modelView = new Uint8Array(modelArrayBuffer, 0, 4);
        if (modelView[0] !== 0x08) {
            const textPreview = new TextDecoder().decode(modelArrayBuffer.slice(0, 100));
            throw new Error(`다운로드된 파일이 유효한 ONNX 모델이 아닙니다. 서버가 모델 대신 다른 파일(예: HTML)을 보냈을 수 있습니다.\n\n파일 내용 미리보기:\n${textPreview}`);
        }


        const alphabetResponse = await fetch(alphabetUrl);
        
        if (!alphabetResponse.ok) {
            throw new Error(`알파벳 파일 다운로드 실패: 서버가 ${alphabetResponse.status} ${alphabetResponse.statusText} 상태로 응답했습니다.`);
        }

        const alphabetText = await alphabetResponse.text();

        await Promise.all([
            modelCacheManager.saveModel(this.CACHE_KEYS.MODEL, modelUrl, modelArrayBuffer, { 
                version: this.modelVersion, 
                type: 'model' 
            }),
            modelCacheManager.saveModel(this.CACHE_KEYS.ALPHABET, alphabetUrl, new TextEncoder().encode(alphabetText).buffer, { 
                version: this.modelVersion, 
                type: 'alphabet' 
            })
        ]);

        return [modelArrayBuffer, alphabetText];
    }

    async _getModelDataFromCache(key) {
        try {
            const cached = await modelCacheManager.loadModel(key);
            return cached ? cached.data : null;
        } catch (error) {
            console.error(`❌ [GlobalModelManager] 캐시에서 ${key} 로드 실패:`, error);
            return null;
        }
    }

    async _getAlphabetDataFromCache(key) {
        try {
            const cached = await modelCacheManager.loadModel(key);
            return cached ? new TextDecoder().decode(cached.data) : null;
        } catch (error) {
            console.error(`❌ [GlobalModelManager] 캐시에서 ${key} 로드 실패:`, error);
            return null;
        }
    }

    async predict(base64String) {
        if (!this.isLoaded) {
            await this.initialize();
        }

        if (!this.session) {
            throw new Error("ONNX 세션이 유효하지 않습니다. 초기화에 실패했습니다.");
        }

        try {
            const ort = await ortPromise;
            const inputData = await preprocessImage(base64String);
            const inputTensor = new ort.Tensor("float32", inputData, [1, 1, 48, 1152]);
            const feeds = { [this.session.inputNames[0]]: inputTensor };
            
            const results = await this.session.run(feeds);
            const output = results[this.session.outputNames[0]];
            const decoded = this._ctcDecode(output);
            
            return decoded;
            
        } catch (error) {
            console.error("❌ [GlobalModelManager] 예측 중 오류 발생:", error);
            throw error;
        }
    }

    _ctcDecode(outputTensor) {
        const [timesteps, , numClasses] = outputTensor.dims;
        const data = outputTensor.data;
        let decoded = "";
        let lastIndex = -1;

        for (let t = 0; t < timesteps; t++) {
            const start = t * numClasses;
            let maxIndex = 0;
            
            for (let c = 1; c < numClasses; c++) {
                if (data[start + c] > data[start + maxIndex]) {
                    maxIndex = c;
                }
            }
            
            if (maxIndex !== lastIndex && maxIndex !== 0) {
                if (this.alphabet && this.alphabet[maxIndex - 1]) {
                    decoded += this.alphabet[maxIndex - 1];
                }
            }
            lastIndex = maxIndex;
        }

        return decoded;
    }

    async clearCache() {
        
        if (this.session && typeof this.session.release === 'function') {
            try {
                await this.session.release();
            } catch (error) {
                console.error("⚠️ [GlobalModelManager] 세션 해제 중 오류:", error);
            }
        }

        this.session = null;
        this.alphabet = null;
        this.isLoaded = false;

        try {
            await Promise.all([
                modelCacheManager.deleteModel(this.CACHE_KEYS.MODEL),
                modelCacheManager.deleteModel(this.CACHE_KEYS.ALPHABET)
            ]);
        } catch (error) {
            console.error("❌ [GlobalModelManager] 캐시 삭제 중 오류:", error);
        }
    }

    async dispose() {
        await this.clearCache();
    }
}

const globalModelManager = new GlobalModelManager();

if (typeof window !== "undefined") {
    window.globalModelManager = globalModelManager;
    
    window.addEventListener('beforeunload', () => {
        globalModelManager.dispose().catch(console.error);
    });
}

export default globalModelManager;