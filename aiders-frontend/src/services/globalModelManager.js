// src/services/globalModelManager.js

import modelCacheManager from './modelCacheManager.js';
import { preprocessImage } from '../../preprocess.js';

// onnxruntime-web 모듈을 동적으로 가져옵니다.
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
        
        console.log("🤖 [GlobalModelManager] 인스턴스가 생성되었습니다.");
        
        // 생성자에서 ONNX Runtime 초기 설정
        this.setupOnnxRuntime();
    }

    // ONNX Runtime 설정 함수 (생성자에서 즉시 실행)
    async setupOnnxRuntime() {
        try {
            console.log('🔧 [GlobalModelManager] ONNX Runtime 설정 시작...');
            
            const ort = await ortPromise;
            
            // 🔥 WASM 파일 경로 올바르게 설정 - public 폴더 루트에 있음
            ort.env.wasm.wasmPaths = {
                'ort-wasm.wasm': '/ort-wasm.wasm',
                'ort-wasm-threaded.wasm': '/ort-wasm-threaded.wasm',
                'ort-wasm-simd.wasm': '/ort-wasm-simd.wasm',
                'ort-wasm-simd-threaded.wasm': '/ort-wasm-simd-threaded.wasm'
            };

            // 안정성을 위한 설정
            ort.env.wasm.numThreads = 1; // 멀티스레딩 비활성화
            ort.env.wasm.simd = false;   // SIMD 비활성화 (호환성 우선)
            ort.env.wasm.proxy = false;  // 프록시 비활성화
            ort.env.logLevel = 'info';   // 로그 레벨 설정
            
            console.log('✅ [GlobalModelManager] ONNX Runtime 설정 완료');
            console.log('🗂️ [WASM 경로]:', ort.env.wasm.wasmPaths);
            
        } catch (error) {
            console.error('❌ [GlobalModelManager] ONNX Runtime 설정 실패:', error);
        }
    }

    // WASM 파일 접근성 사전 체크
    async checkWasmFiles() {
        console.log('🔍 [GlobalModelManager] WASM 파일 접근성 체크...');
        
        const wasmFiles = [
            '/ort-wasm.wasm',
            '/ort-wasm-simd.wasm'
        ];

        for (const wasmFile of wasmFiles) {
            try {
                const response = await fetch(wasmFile, { method: 'HEAD' });
                const contentType = response.headers.get('content-type');
                
                console.log(`🔍 [WASM 체크] ${wasmFile}: ${response.status} (${contentType})`);
                
                if (!response.ok) {
                    throw new Error(`WASM 파일 접근 실패: ${response.status}`);
                }
                
                // MIME 타입 체크 (선택적 경고)
                if (contentType && !contentType.includes('wasm') && !contentType.includes('octet-stream')) {
                    console.warn(`⚠️ [WASM 체크] ${wasmFile}: 잘못된 MIME 타입 (${contentType})`);
                }
                
            } catch (error) {
                console.error(`❌ [WASM 체크] ${wasmFile} 접근 불가:`, error.message);
                throw new Error(`WASM 파일 준비되지 않음: ${wasmFile}`);
            }
        }
        
        console.log('✅ [GlobalModelManager] WASM 파일 접근성 체크 완료');
    }

    async initialize() {
        if (this.isLoaded && this.session) {
            console.log("✅ [GlobalModelManager] 이미 로드된 모델을 재사용합니다.");
            return;
        }

        if (this.loadingPromise) {
            console.log("⏳ [GlobalModelManager] 모델 로딩이 진행 중입니다. 완료를 기다립니다.");
            return this.loadingPromise;
        }

        console.log("🚀 [GlobalModelManager] 모델 초기화를 시작합니다.");
        this.loadingPromise = this._loadAndCreateSession();
        
        try {
            await this.loadingPromise;
            this.isLoaded = true;
            console.log("🎉 [GlobalModelManager] 모델 초기화가 성공적으로 완료되었습니다!");
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
            // 🔥 WASM 파일 접근성 사전 체크
            await this.checkWasmFiles();
            
            let modelArrayBuffer = await this._getModelDataFromCache(this.CACHE_KEYS.MODEL);
            let alphabetText = await this._getAlphabetDataFromCache(this.CACHE_KEYS.ALPHABET);

            if (!modelArrayBuffer || !alphabetText) {
                console.log("🌐 [GlobalModelManager] 캐시된 데이터가 없어 네트워크에서 다운로드합니다.");
                [modelArrayBuffer, alphabetText] = await this._fetchAndCacheAssets();
            } else {
                console.log("💾 [GlobalModelManager] IndexedDB 캐시에서 모델과 알파벳을 불러왔습니다.");
            }

            // 메모리 체크
            if (performance.memory) {
                const memory = performance.memory;
                console.log('🧠 [메모리 체크 - 세션 생성 전]', {
                    used: `${(memory.usedJSHeapSize / 1024 / 1024).toFixed(2)}MB`,
                    total: `${(memory.totalJSHeapSize / 1024 / 1024).toFixed(2)}MB`,
                    limit: `${(memory.jsHeapSizeLimit / 1024 / 1024).toFixed(2)}MB`
                });
            }

            console.log("🧠 [GlobalModelManager] ONNX 세션 생성을 시작합니다...");
            
            const ort = await ortPromise;
            
            // 🔥 세션 생성 옵션 강화
            const sessionOptions = {
                executionProviders: ['wasm'], // WASM만 사용 (CPU 제외)
                graphOptimizationLevel: 'disabled', // 최적화 비활성화 (안정성 우선)
                enableCpuMemArena: false, // 메모리 아레나 비활성화
                enableMemPattern: false, // 메모리 패턴 비활성화
                executionMode: 'sequential', // 순차 실행 모드
                logId: 'crnn_session',
                logSeverityLevel: 2 // Warning 레벨 로그
            };

            console.log('🔧 [GlobalModelManager] 세션 옵션:', sessionOptions);

            // 🔥 타임아웃과 함께 세션 생성
            const sessionPromise = ort.InferenceSession.create(modelArrayBuffer, sessionOptions);
            const timeoutPromise = new Promise((_, reject) => {
                setTimeout(() => reject(new Error('세션 생성 타임아웃 (60초)')), 60000);
            });
            
            this.session = await Promise.race([sessionPromise, timeoutPromise]);
            this.alphabet = alphabetText.trim().split("");

            console.log(`✅ [GlobalModelManager] ONNX 세션 생성 완료!`);
            console.log(`📊 [GlobalModelManager] 입력 이름: ${this.session.inputNames.join(', ')}`);
            console.log(`📊 [GlobalModelManager] 출력 이름: ${this.session.outputNames.join(', ')}`);
            console.log(`📊 [GlobalModelManager] 알파벳 크기: ${this.alphabet.length}글자`);

            // 메모리 체크 (세션 생성 후)
            if (performance.memory) {
                const memory = performance.memory;
                console.log('🧠 [메모리 체크 - 세션 생성 후]', {
                    used: `${(memory.usedJSHeapSize / 1024 / 1024).toFixed(2)}MB`,
                    total: `${(memory.totalJSHeapSize / 1024 / 1024).toFixed(2)}MB`,
                    limit: `${(memory.jsHeapSizeLimit / 1024 / 1024).toFixed(2)}MB`
                });
            }

        } catch (error) {
            console.error("❌ [GlobalModelManager] ONNX 세션 생성에 실패했습니다.", error);
            
            // 🔥 에러 상세 정보 로깅
            if (error.message) {
                console.error('📄 [에러 메시지]:', error.message);
            }
            if (error.stack) {
                console.error('📄 [에러 스택]:', error.stack);
            }
            
            console.warn("⚠️ [GlobalModelManager] 세션 생성 실패로 캐시를 삭제합니다.");
            await this.clearCache().catch(err => console.error("캐시 삭제 중 추가 오류 발생", err));
            throw error; // 원본 에러를 그대로 전파
        }
    }

    async _fetchAndCacheAssets() {
        const modelUrl = "/model/crnn_48x1152.onnx";
        const alphabetUrl = "/alphabets/alphabet.txt";

        console.log(`⬇️ [GlobalModelManager] '${modelUrl}' 다운로드 중...`);
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

        console.log(`✅ [GlobalModelManager] 모델 다운로드 완료: ${(modelArrayBuffer.byteLength / 1024 / 1024).toFixed(2)}MB`);

        console.log(`⬇️ [GlobalModelManager] '${alphabetUrl}' 다운로드 중...`);
        const alphabetResponse = await fetch(alphabetUrl);
        
        if (!alphabetResponse.ok) {
            throw new Error(`알파벳 파일 다운로드 실패: 서버가 ${alphabetResponse.status} ${alphabetResponse.statusText} 상태로 응답했습니다.`);
        }

        const alphabetText = await alphabetResponse.text();
        console.log(`✅ [GlobalModelManager] 알파벳 다운로드 완료: ${alphabetText.length} 문자`);

        // 🔥 병렬로 캐시 저장
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

        console.log("💾 [GlobalModelManager] 다운로드한 자산을 IndexedDB에 저장했습니다.");
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
            console.log("⚠️ [GlobalModelManager] 모델이 준비되지 않아 먼저 초기화를 실행합니다.");
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
            
            console.log('🔮 [GlobalModelManager] 추론 시작...');
            const results = await this.session.run(feeds);
            const output = results[this.session.outputNames[0]];
            const decoded = this._ctcDecode(output);
            
            console.log(`✒️ [GlobalModelManager] 예측 결과: "${decoded}"`);
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
        console.log("🧹 [GlobalModelManager] 모든 캐시를 삭제합니다.");
        
        // 세션 정리
        if (this.session && typeof this.session.release === 'function') {
            try {
                await this.session.release();
                console.log("🧹 [GlobalModelManager] ONNX 세션 해제 완료");
            } catch (error) {
                console.error("⚠️ [GlobalModelManager] 세션 해제 중 오류:", error);
            }
        }

        this.session = null;
        this.alphabet = null;
        this.isLoaded = false;

        // 캐시 삭제
        try {
            await Promise.all([
                modelCacheManager.deleteModel(this.CACHE_KEYS.MODEL),
                modelCacheManager.deleteModel(this.CACHE_KEYS.ALPHABET)
            ]);
            console.log("✅ [GlobalModelManager] 캐시 삭제 완료.");
        } catch (error) {
            console.error("❌ [GlobalModelManager] 캐시 삭제 중 오류:", error);
        }
    }

    // 리소스 정리 함수
    async dispose() {
        await this.clearCache();
        console.log("🧹 [GlobalModelManager] 모든 리소스 정리 완료");
    }
}

const globalModelManager = new GlobalModelManager();

// 브라우저 환경에서 전역 객체에 등록
if (typeof window !== "undefined") {
    window.globalModelManager = globalModelManager;
    
    // 페이지 언로드 시 리소스 정리
    window.addEventListener('beforeunload', () => {
        globalModelManager.dispose().catch(console.error);
    });
}

export default globalModelManager;
