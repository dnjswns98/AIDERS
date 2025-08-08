// src/services/globalModelManager.js
import * as ort from 'onnxruntime-web';
import { preprocessImage } from '../../preprocess.js';
import modelCacheManager from './modelCacheManager.js';

class GlobalModelManager {
  constructor() {
    this.model = null;
    this.alphabet = null;
    this.isLoaded = false;
    this.isLoading = false;
    this.loadingPromise = null;
    this.modelVersion = '1.0.0';
    
    // 🔥 IndexedDB 캐시 키들 (localStorage 대신)
    this.CACHE_KEYS = {
      MODEL: 'crnn_48x1152_v1.0.0',
      ALPHABET: 'alphabet_v1.0.0'
    };
    
    console.log('🤖 [GlobalModelManager] 싱글톤 인스턴스 생성 (IndexedDB 캐시)');
  }

  // 🔥 로그인 시 모델 사전 로드 및 IndexedDB 저장
  async preloadModelToLocalStorage() {
    console.log('📥 [GlobalModelManager] 구급차 로그인 - 모델 사전 로드 시작 (IndexedDB)');
    
    try {
      // 🔥 IndexedDB 지원 여부 확인
      if (!modelCacheManager.isSupported) {
        throw new Error('이 브라우저는 IndexedDB를 지원하지 않습니다');
      }

      // 이미 IndexedDB에 있는지 확인
      const hasModel = await modelCacheManager.hasModel(this.CACHE_KEYS.MODEL);
      const hasAlphabet = await modelCacheManager.hasModel(this.CACHE_KEYS.ALPHABET);
      
      if (hasModel && hasAlphabet) {
        console.log('✅ [GlobalModelManager] 이미 최신 모델이 IndexedDB에 존재');
        return true;
      }
      
      console.log('🌐 [GlobalModelManager] 네트워크에서 모델 다운로드 중...');
      
      // 🔥 ONNX 환경 설정
      ort.env.wasm.wasmPaths = '/onnx-wasm/';
      ort.env.wasm.simd = true;
      ort.env.wasm.numThreads = 1;
      
      // 모델 파일 다운로드
      console.log('📂 [GlobalModelManager] ONNX 모델 다운로드...');
      const modelResponse = await fetch('/model/crnn_48x1152.onnx');
      if (!modelResponse.ok) {
        throw new Error(`모델 다운로드 실패: ${modelResponse.status}`);
      }
      const modelArrayBuffer = await modelResponse.arrayBuffer();
      console.log(`✅ [GlobalModelManager] 모델 다운로드 완료: ${(modelArrayBuffer.byteLength / 1024 / 1024).toFixed(2)}MB`);
      
      // 알파벳 파일 다운로드
      console.log('📂 [GlobalModelManager] 알파벳 파일 다운로드...');
      const alphabetResponse = await fetch('/alphabets/alphabet.txt');
      if (!alphabetResponse.ok) {
        throw new Error(`알파벳 다운로드 실패: ${alphabetResponse.status}`);
      }
      const alphabetText = await alphabetResponse.text();
      console.log(`✅ [GlobalModelManager] 알파벳 다운로드 완료: ${alphabetText.length}문자`);
      
      // 🔥 IndexedDB에 저장 (localStorage 대신!)
      console.log('💾 [GlobalModelManager] IndexedDB에 저장 중...');
      
      // 모델 저장
      await modelCacheManager.saveModel(
        this.CACHE_KEYS.MODEL,
        '/model/crnn_48x1152.onnx',
        modelArrayBuffer,
        {
          version: this.modelVersion,
          type: 'onnx_model',
          description: 'CRNN 필기 인식 모델'
        }
      );

      // 알파벳 저장 (문자열을 ArrayBuffer로 변환)
      const alphabetArrayBuffer = new TextEncoder().encode(alphabetText);
      await modelCacheManager.saveModel(
        this.CACHE_KEYS.ALPHABET,
        '/alphabets/alphabet.txt',
        alphabetArrayBuffer.buffer,
        {
          version: this.modelVersion,
          type: 'alphabet',
          description: 'CRNN 알파벳 데이터'
        }
      );
      
      console.log('✅ [GlobalModelManager] IndexedDB 저장 완료');
      
      // 🔥 즉시 메모리에도 로드
      await this.loadModelFromIndexedDB();
      
      return true;
      
    } catch (error) {
      console.error('❌ [GlobalModelManager] 사전 로드 실패:', error);
      throw error;
    }
  }

  // 🔥 IndexedDB에서 모델 로드 (localStorage 대신)
  async loadModelFromIndexedDB() {
    console.log('💾 [GlobalModelManager] IndexedDB에서 모델 로드 시작');
    
    try {
      // 모델 데이터 가져오기
      const modelData = await modelCacheManager.loadModel(this.CACHE_KEYS.MODEL);
      const alphabetData = await modelCacheManager.loadModel(this.CACHE_KEYS.ALPHABET);
      
      if (!modelData || !alphabetData) {
        throw new Error('IndexedDB에 모델 데이터 없음');
      }
      
      console.log('🔄 [GlobalModelManager] IndexedDB 데이터 변환 중...');
      
      // 🔥 ONNX 모델 생성
      console.log('🤖 [GlobalModelManager] ONNX 세션 생성 중...');
      this.model = await ort.InferenceSession.create(modelData.data, {
        executionProviders: ['wasm', 'webgl', 'cpu'],
        graphOptimizationLevel: 'all'
      });
      
      // 알파벳 설정 (ArrayBuffer에서 문자열로 변환)
      const alphabetText = new TextDecoder().decode(alphabetData.data);
      this.alphabet = alphabetText.trim().split('');
      
      this.isLoaded = true;
      console.log(`✅ [GlobalModelManager] IndexedDB에서 로드 완료! (${this.alphabet.length}문자)`);
      
      return true;
      
    } catch (error) {
      console.error('❌ [GlobalModelManager] IndexedDB 로드 실패:', error);
      throw error;
    }
  }

  // 🔥 모델 초기화 (IndexedDB 우선, 실패 시 네트워크)
  async initializeModel() {
    if (this.isLoaded && this.model && this.alphabet) {
      console.log('✅ [GlobalModelManager] 이미 로드된 모델 재사용');
      return this.model;
    }
    
    if (this.isLoading && this.loadingPromise) {
      console.log('⏳ [GlobalModelManager] 이미 로딩 중, 기존 Promise 대기');
      return this.loadingPromise;
    }
    
    console.log('🚀 [GlobalModelManager] 모델 초기화 시작');
    this.isLoading = true;
    
    this.loadingPromise = this._initializeWithFallback();
    
    try {
      const result = await this.loadingPromise;
      this.isLoaded = true;
      console.log('✅ [GlobalModelManager] 모델 초기화 완료');
      return result;
    } catch (error) {
      console.error('❌ [GlobalModelManager] 모델 초기화 실패:', error);
      throw error;
    } finally {
      this.isLoading = false;
      this.loadingPromise = null;
    }
  }

  // 🔥 IndexedDB → 네트워크 fallback 로직
  async _initializeWithFallback() {
    try {
      // 1차: IndexedDB에서 로드 시도
      console.log('1️⃣ [GlobalModelManager] IndexedDB에서 로드 시도');
      await this.loadModelFromIndexedDB();
      console.log('🎉 [GlobalModelManager] IndexedDB에서 로드 성공!');
      return this.model;
      
    } catch (indexedDBError) {
      console.warn('⚠️ [GlobalModelManager] IndexedDB 로드 실패:', indexedDBError.message);
      
      try {
        // 2차: 네트워크에서 다운로드 후 IndexedDB 저장
        console.log('2️⃣ [GlobalModelManager] 네트워크에서 다운로드 후 IndexedDB 저장');
        await this.preloadModelToLocalStorage();
        console.log('🎉 [GlobalModelManager] 네트워크 다운로드 및 IndexedDB 저장 성공!');
        return this.model;
        
      } catch (networkError) {
        console.error('❌ [GlobalModelManager] 네트워크 다운로드도 실패:', networkError);
        throw networkError;
      }
    }
  }

  // 🔥 텍스트 변환 (네가 준 preprocess.js 사용)
  async predict(base64String) {
    console.log('🖋️ [GlobalModelManager] 텍스트 변환 시작');
    
    // 모델이 로드되지 않았으면 초기화
    if (!this.isLoaded) {
      console.log('⚠️ [GlobalModelManager] 모델 미로드 상태, 초기화 실행');
      await this.initializeModel();
    }
    
    if (!this.model || !this.alphabet) {
      throw new Error('모델 또는 알파벳이 로드되지 않음');
    }

    try {
      console.time('전처리');
      const inputData = await preprocessImage(base64String);
      const inputTensor = new ort.Tensor('float32', inputData, [1, 1, 48, 1152]);
      console.timeEnd('전처리');

      console.time('AI 추론');
      const feeds = { [this.model.inputNames[0]]: inputTensor };
      const results = await this.model.run(feeds);
      const output = results[this.model.outputNames[0]];
      console.timeEnd('AI 추론');

      console.time('텍스트 디코딩');
      const decoded = this._ctcDecode(output);
      console.timeEnd('텍스트 디코딩');
      
      console.log(`✅ [GlobalModelManager] 변환 완료: "${decoded}"`);
      return decoded;
      
    } catch (error) {
      console.error('❌ [GlobalModelManager] 변환 실패:', error);
      throw error;
    }
  }

  // 🔥 CTC 디코딩 (기존과 동일)
  _ctcDecode(outputTensor) {
    const [timesteps, batchSize, numClasses] = outputTensor.dims;
    const data = outputTensor.data;

    let decoded = '';
    let lastIndex = -1;

    for (let t = 0; t < timesteps; t++) {
      const start = t * numClasses;
      let maxProb = -Infinity;
      let maxIndex = -1;

      for (let c = 0; c < numClasses; c++) {
        const val = data[start + c];
        if (val > maxProb) {
          maxProb = val;
          maxIndex = c;
        }
      }

      if (maxIndex !== lastIndex && maxIndex !== 0) {
        decoded += this.alphabet[maxIndex - 1];
      }

      lastIndex = maxIndex;
    }

    return decoded;
  }

  // 🔥 IndexedDB 캐시 정리
  async clearCache() {
    console.log('🧹 [GlobalModelManager] IndexedDB 캐시 정리');
    
    try {
      await modelCacheManager.deleteModel(this.CACHE_KEYS.MODEL);
      await modelCacheManager.deleteModel(this.CACHE_KEYS.ALPHABET);
      
      this.model = null;
      this.alphabet = null;
      this.isLoaded = false;
      this.isLoading = false;
      
      console.log('✅ [GlobalModelManager] 캐시 정리 완료');
    } catch (error) {
      console.error('❌ [GlobalModelManager] 캐시 정리 실패:', error);
    }
  }

  // 🔥 상태 정보 (IndexedDB 기반)
  async getStatus() {
    try {
      const hasModel = await modelCacheManager.hasModel(this.CACHE_KEYS.MODEL);
      const hasAlphabet = await modelCacheManager.hasModel(this.CACHE_KEYS.ALPHABET);
      const cacheStats = await modelCacheManager.getCacheStats();
      
      return {
        isLoaded: this.isLoaded,
        isLoading: this.isLoading,
        hasIndexedDB: hasModel && hasAlphabet,
        cacheSupported: modelCacheManager.isSupported,
        version: this.modelVersion,
        alphabetLength: this.alphabet?.length || 0,
        cacheStats: cacheStats
      };
    } catch (error) {
      console.error('❌ [GlobalModelManager] 상태 조회 실패:', error);
      return {
        isLoaded: this.isLoaded,
        isLoading: this.isLoading,
        hasIndexedDB: false,
        cacheSupported: false,
        version: this.modelVersion,
        alphabetLength: this.alphabet?.length || 0
      };
    }
  }
}

// 🔥 싱글톤 인스턴스 생성
const globalModelManager = new GlobalModelManager();

// 🔥 전역 접근 가능
if (typeof window !== 'undefined') {
  window.globalModelManager = globalModelManager;
}

export default globalModelManager;
