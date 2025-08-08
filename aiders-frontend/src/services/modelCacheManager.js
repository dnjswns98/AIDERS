// src/services/modelCacheManager.js
class ModelCacheManager {
  constructor() {
    this.dbName = 'CRNNModelCache';
    this.dbVersion = 2;
    this.storeName = 'models';
    this.db = null;
    this.isSupported = this._checkIndexedDBSupport();
    
    console.log('💾 [ModelCacheManager] 인스턴스 생성');
    console.log('💾 [ModelCacheManager] IndexedDB 지원:', this.isSupported);
  }

  // 🔥 IndexedDB 지원 여부 확인
  _checkIndexedDBSupport() {
    if (typeof window === 'undefined') {
      return false;
    }
    
    return !!(window.indexedDB && 
              window.indexedDB.open && 
              window.indexedDB.deleteDatabase &&
              window.IDBTransaction &&
              window.IDBKeyRange);
  }

  // 🔥 static 메서드로 지원 여부 확인 (외부에서 사용)
  static isSupported() {
    if (typeof window === 'undefined') {
      return false;
    }
    
    return !!(window.indexedDB && 
              window.indexedDB.open && 
              window.indexedDB.deleteDatabase &&
              window.IDBTransaction &&
              window.IDBKeyRange);
  }

  // 🔥 IndexedDB 초기화
  async _initializeDB() {
    if (this.db) {
      console.log('💾 [ModelCacheManager] 이미 초기화된 DB 재사용');
      return this.db;
    }

    if (!this.isSupported) {
      throw new Error('IndexedDB가 지원되지 않는 브라우저입니다');
    }

    console.log('💾 [ModelCacheManager] IndexedDB 초기화 시작');

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onerror = () => {
        console.error('❌ [ModelCacheManager] IndexedDB 열기 실패:', request.error);
        reject(new Error(`IndexedDB 열기 실패: ${request.error?.message || 'Unknown error'}`));
      };

      request.onsuccess = () => {
        this.db = request.result;
        console.log('✅ [ModelCacheManager] IndexedDB 열기 성공');
        
        // 🔥 예상치 못한 close 이벤트 처리
        this.db.onclose = () => {
          console.warn('⚠️ [ModelCacheManager] IndexedDB 연결이 예상치 못하게 닫힘');
          this.db = null;
        };

        // 🔥 버전 변경 감지
        this.db.onversionchange = () => {
          console.warn('⚠️ [ModelCacheManager] 다른 탭에서 DB 버전 변경 감지');
          this.db.close();
          this.db = null;
        };

        resolve(this.db);
      };

      request.onupgradeneeded = (event) => {
        console.log('🔧 [ModelCacheManager] IndexedDB 스키마 업그레이드');
        const db = event.target.result;

        // 🔥 기존 스토어가 있으면 삭제 후 재생성
        if (db.objectStoreNames.contains(this.storeName)) {
          console.log('🗑️ [ModelCacheManager] 기존 스토어 삭제');
          db.deleteObjectStore(this.storeName);
        }

        // 🔥 새로운 모델 스토어 생성
        const store = db.createObjectStore(this.storeName, { keyPath: 'id' });
        
        // 🔥 인덱스 생성 (검색 성능 향상)
        store.createIndex('timestamp', 'metadata.timestamp', { unique: false });
        store.createIndex('version', 'metadata.version', { unique: false });
        store.createIndex('type', 'metadata.type', { unique: false });
        store.createIndex('url', 'url', { unique: false });

        console.log('✅ [ModelCacheManager] 스토어 및 인덱스 생성 완료');
      };
    });
  }

  // 🔥 모델 저장 (ArrayBuffer 데이터를 IndexedDB에 저장)
  async saveModel(id, url, data, metadata = {}) {
    console.log(`💾 [ModelCacheManager] 모델 저장 시작: ${id}`);

    try {
      await this._initializeDB();

      if (!data || !(data instanceof ArrayBuffer)) {
        throw new Error('data는 ArrayBuffer 타입이어야 합니다');
      }

      // 🔥 메타데이터 생성
      const modelData = {
        id: id,
        url: url,
        data: data,
        metadata: {
          timestamp: Date.now(),
          size: data.byteLength,
          sizeFormatted: this._formatBytes(data.byteLength),
          version: metadata.version || '1.0.0',
          type: metadata.type || 'model',
          description: metadata.description || '',
          userAgent: navigator.userAgent,
          ...metadata
        }
      };

      return new Promise((resolve, reject) => {
        const transaction = this.db.transaction([this.storeName], 'readwrite');
        const store = transaction.objectStore(this.storeName);

        transaction.oncomplete = () => {
          console.log(`✅ [ModelCacheManager] 모델 저장 성공: ${id} (${modelData.metadata.sizeFormatted})`);
          resolve(true);
        };

        transaction.onerror = () => {
          console.error(`❌ [ModelCacheManager] 모델 저장 실패: ${id}`, transaction.error);
          reject(new Error(`모델 저장 실패: ${transaction.error?.message || 'Unknown error'}`));
        };

        // 🔥 실제 데이터 저장
        const request = store.put(modelData);
        
        request.onerror = () => {
          console.error(`❌ [ModelCacheManager] 데이터 쓰기 실패: ${id}`, request.error);
          reject(new Error(`데이터 쓰기 실패: ${request.error?.message || 'Unknown error'}`));
        };
      });

    } catch (error) {
      console.error(`❌ [ModelCacheManager] saveModel 에러: ${id}`, error);
      throw error;
    }
  }

  // 🔥 모델 로드 (IndexedDB에서 ArrayBuffer 반환)
  async loadModel(id) {
    console.log(`📂 [ModelCacheManager] 모델 로드 시도: ${id}`);

    try {
      await this._initializeDB();

      return new Promise((resolve, reject) => {
        const transaction = this.db.transaction([this.storeName], 'readonly');
        const store = transaction.objectStore(this.storeName);
        const request = store.get(id);

        request.onsuccess = () => {
          const result = request.result;
          
          if (result) {
            console.log(`✅ [ModelCacheManager] 모델 로드 성공: ${id} (${result.metadata.sizeFormatted})`);
            console.log(`📊 [ModelCacheManager] 저장일: ${new Date(result.metadata.timestamp).toLocaleString()}`);
            resolve(result);
          } else {
            console.log(`❌ [ModelCacheManager] 모델 로드 실패: ${id} (캐시에 없음)`);
            resolve(null);
          }
        };

        request.onerror = () => {
          console.error(`❌ [ModelCacheManager] 모델 로드 에러: ${id}`, request.error);
          reject(new Error(`모델 로드 에러: ${request.error?.message || 'Unknown error'}`));
        };
      });

    } catch (error) {
      console.error(`❌ [ModelCacheManager] loadModel 에러: ${id}`, error);
      throw error;
    }
  }

  // 🔥 모델 존재 여부 확인
  async hasModel(id) {
    try {
      const model = await this.loadModel(id);
      return !!model;
    } catch (error) {
      console.error(`❌ [ModelCacheManager] hasModel 에러: ${id}`, error);
      return false;
    }
  }

  // 🔥 모델 삭제
  async deleteModel(id) {
    console.log(`🗑️ [ModelCacheManager] 모델 삭제: ${id}`);

    try {
      await this._initializeDB();

      return new Promise((resolve, reject) => {
        const transaction = this.db.transaction([this.storeName], 'readwrite');
        const store = transaction.objectStore(this.storeName);

        transaction.oncomplete = () => {
          console.log(`✅ [ModelCacheManager] 모델 삭제 성공: ${id}`);
          resolve(true);
        };

        transaction.onerror = () => {
          console.error(`❌ [ModelCacheManager] 모델 삭제 실패: ${id}`, transaction.error);
          reject(new Error(`모델 삭제 실패: ${transaction.error?.message || 'Unknown error'}`));
        };

        const request = store.delete(id);
        
        request.onerror = () => {
          console.error(`❌ [ModelCacheManager] 삭제 요청 실패: ${id}`, request.error);
          reject(new Error(`삭제 요청 실패: ${request.error?.message || 'Unknown error'}`));
        };
      });

    } catch (error) {
      console.error(`❌ [ModelCacheManager] deleteModel 에러: ${id}`, error);
      throw error;
    }
  }

  // 🔥 모든 모델 목록 조회
  async getAllModels() {
    console.log('📋 [ModelCacheManager] 모든 모델 목록 조회');

    try {
      await this._initializeDB();

      return new Promise((resolve, reject) => {
        const transaction = this.db.transaction([this.storeName], 'readonly');
        const store = transaction.objectStore(this.storeName);
        const request = store.getAll();

        request.onsuccess = () => {
          const models = request.result || [];
          console.log(`📋 [ModelCacheManager] 캐시된 모델 목록 (${models.length}개):`, 
                     models.map(m => ({ id: m.id, size: m.metadata.sizeFormatted, date: new Date(m.metadata.timestamp).toLocaleDateString() })));
          resolve(models);
        };

        request.onerror = () => {
          console.error('❌ [ModelCacheManager] 모델 목록 조회 실패:', request.error);
          reject(new Error(`모델 목록 조회 실패: ${request.error?.message || 'Unknown error'}`));
        };
      });

    } catch (error) {
      console.error('❌ [ModelCacheManager] getAllModels 에러:', error);
      throw error;
    }
  }

  // 🔥 캐시 통계 정보
  async getCacheStats() {
    console.log('📊 [ModelCacheManager] 캐시 통계 조회');

    try {
      const models = await this.getAllModels();
      
      const totalSize = models.reduce((sum, model) => sum + (model.metadata.size || 0), 0);
      const totalCount = models.length;
      
      const stats = {
        totalSize: totalSize,
        totalCount: totalCount,
        totalSizeFormatted: this._formatBytes(totalSize),
        models: models.map(model => ({
          id: model.id,
          size: model.metadata.size,
          sizeFormatted: model.metadata.sizeFormatted,
          timestamp: model.metadata.timestamp,
          version: model.metadata.version,
          type: model.metadata.type
        }))
      };

      console.log(`📊 [ModelCacheManager] 캐시 통계: ${stats.totalSizeFormatted}, ${stats.totalCount}개 모델`);
      
      return stats;

    } catch (error) {
      console.error('❌ [ModelCacheManager] getCacheStats 에러:', error);
      return {
        totalSize: 0,
        totalCount: 0,
        totalSizeFormatted: '0.00MB',
        models: []
      };
    }
  }

  // 🔥 전체 캐시 정리
  async clearAllCache() {
    console.log('🧹 [ModelCacheManager] 전체 캐시 정리 시작');

    try {
      await this._initializeDB();

      return new Promise((resolve, reject) => {
        const transaction = this.db.transaction([this.storeName], 'readwrite');
        const store = transaction.objectStore(this.storeName);

        transaction.oncomplete = () => {
          console.log('✅ [ModelCacheManager] 전체 캐시 정리 완료');
          resolve(true);
        };

        transaction.onerror = () => {
          console.error('❌ [ModelCacheManager] 캐시 정리 실패:', transaction.error);
          reject(new Error(`캐시 정리 실패: ${transaction.error?.message || 'Unknown error'}`));
        };

        const request = store.clear();
        
        request.onerror = () => {
          console.error('❌ [ModelCacheManager] 클리어 요청 실패:', request.error);
          reject(new Error(`클리어 요청 실패: ${request.error?.message || 'Unknown error'}`));
        };
      });

    } catch (error) {
      console.error('❌ [ModelCacheManager] clearAllCache 에러:', error);
      throw error;
    }
  }

  // 🔥 오래된 캐시 정리 (일정 기간 지난 모델들 삭제)
  async cleanupOldCache(maxAge = 30 * 24 * 60 * 60 * 1000) { // 기본 30일
    console.log('🧹 [ModelCacheManager] 오래된 캐시 정리 시작');

    try {
      const models = await this.getAllModels();
      const now = Date.now();
      const expiredModels = models.filter(model => 
        (now - model.metadata.timestamp) > maxAge
      );

      if (expiredModels.length === 0) {
        console.log('✅ [ModelCacheManager] 정리할 오래된 캐시 없음');
        return 0;
      }

      console.log(`🗑️ [ModelCacheManager] ${expiredModels.length}개 오래된 모델 삭제 중...`);

      const deletePromises = expiredModels.map(model => this.deleteModel(model.id));
      await Promise.all(deletePromises);

      console.log(`✅ [ModelCacheManager] 오래된 캐시 정리 완료: ${expiredModels.length}개 삭제`);
      return expiredModels.length;

    } catch (error) {
      console.error('❌ [ModelCacheManager] cleanupOldCache 에러:', error);
      throw error;
    }
  }

  // 🔥 특정 버전의 모델들 삭제
  async deleteModelsByVersion(version) {
    console.log(`🗑️ [ModelCacheManager] 버전 ${version} 모델들 삭제`);

    try {
      await this._initializeDB();

      return new Promise((resolve, reject) => {
        const transaction = this.db.transaction([this.storeName], 'readwrite');
        const store = transaction.objectStore(this.storeName);
        const index = store.index('version');

        let deletedCount = 0;

        transaction.oncomplete = () => {
          console.log(`✅ [ModelCacheManager] 버전 ${version} 모델 삭제 완료: ${deletedCount}개`);
          resolve(deletedCount);
        };

        transaction.onerror = () => {
          console.error(`❌ [ModelCacheManager] 버전별 삭제 실패: ${version}`, transaction.error);
          reject(new Error(`버전별 삭제 실패: ${transaction.error?.message || 'Unknown error'}`));
        };

        const request = index.openCursor(IDBKeyRange.only(version));

        request.onsuccess = (event) => {
          const cursor = event.target.result;
          if (cursor) {
            cursor.delete();
            deletedCount++;
            cursor.continue();
          }
        };

        request.onerror = () => {
          console.error(`❌ [ModelCacheManager] 버전별 커서 에러: ${version}`, request.error);
          reject(new Error(`버전별 커서 에러: ${request.error?.message || 'Unknown error'}`));
        };
      });

    } catch (error) {
      console.error(`❌ [ModelCacheManager] deleteModelsByVersion 에러: ${version}`, error);
      throw error;
    }
  }

  // 🔥 파일 크기 포맷팅 유틸리티
  _formatBytes(bytes) {
    if (bytes === 0) return '0.00MB';
    
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    const size = (bytes / Math.pow(1024, i)).toFixed(2);
    
    return `${size}${sizes[i]}`;
  }

  // 🔥 DB 연결 종료
  async close() {
    if (this.db) {
      console.log('🔌 [ModelCacheManager] IndexedDB 연결 종료');
      this.db.close();
      this.db = null;
    }
  }

  // 🔥 전체 데이터베이스 삭제
  async deleteDatabase() {
    console.log('💣 [ModelCacheManager] 데이터베이스 완전 삭제');

    if (this.db) {
      this.db.close();
      this.db = null;
    }

    if (!this.isSupported) {
      throw new Error('IndexedDB가 지원되지 않는 브라우저입니다');
    }

    return new Promise((resolve, reject) => {
      const request = indexedDB.deleteDatabase(this.dbName);

      request.onsuccess = () => {
        console.log('✅ [ModelCacheManager] 데이터베이스 삭제 완료');
        resolve(true);
      };

      request.onerror = () => {
        console.error('❌ [ModelCacheManager] 데이터베이스 삭제 실패:', request.error);
        reject(new Error(`데이터베이스 삭제 실패: ${request.error?.message || 'Unknown error'}`));
      };

      request.onblocked = () => {
        console.warn('⚠️ [ModelCacheManager] 데이터베이스 삭제가 다른 연결에 의해 차단됨');
        reject(new Error('데이터베이스 삭제가 차단되었습니다. 다른 탭을 닫고 다시 시도해주세요.'));
      };
    });
  }

  // 🔥 IndexedDB 용량 추정 (브라우저별로 다를 수 있음)
  async getStorageQuota() {
    console.log('📊 [ModelCacheManager] 스토리지 용량 조회');

    if (!navigator.storage || !navigator.storage.estimate) {
      console.warn('⚠️ [ModelCacheManager] Storage API 미지원');
      return null;
    }

    try {
      const estimate = await navigator.storage.estimate();
      
      const result = {
        quota: estimate.quota,
        usage: estimate.usage,
        quotaFormatted: this._formatBytes(estimate.quota || 0),
        usageFormatted: this._formatBytes(estimate.usage || 0),
        usagePercentage: estimate.quota ? ((estimate.usage / estimate.quota) * 100).toFixed(2) : 0
      };

      console.log(`📊 [ModelCacheManager] 스토리지 사용량: ${result.usageFormatted} / ${result.quotaFormatted} (${result.usagePercentage}%)`);
      
      return result;

    } catch (error) {
      console.error('❌ [ModelCacheManager] 스토리지 용량 조회 실패:', error);
      return null;
    }
  }

  // 🔥 디버깅 정보 출력
  async debugInfo() {
    console.group('🔧 [ModelCacheManager] 디버깅 정보');
    
    try {
      console.log('지원 여부:', this.isSupported);
      console.log('DB 이름:', this.dbName);
      console.log('DB 버전:', this.dbVersion);
      console.log('스토어 이름:', this.storeName);
      console.log('DB 연결 상태:', !!this.db);

      if (this.isSupported) {
        const stats = await this.getCacheStats();
        console.log('캐시 통계:', stats);

        const quota = await this.getStorageQuota();
        if (quota) {
          console.log('스토리지 정보:', quota);
        }

        const models = await this.getAllModels();
        console.log('저장된 모델들:', models);
      }

    } catch (error) {
      console.error('디버깅 정보 조회 실패:', error);
    } finally {
      console.groupEnd();
    }
  }
}

// 🔥 싱글톤 인스턴스 생성
const modelCacheManager = new ModelCacheManager();

// 🔥 전역 접근 가능 (디버깅용)
if (typeof window !== 'undefined') {
  window.modelCacheManager = modelCacheManager;
}

export default modelCacheManager;
