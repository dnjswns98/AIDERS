// src/services/modelCacheManager.js
class ModelCacheManager {
  constructor() {
    this.dbName = 'CRNNModelCache';
    this.dbVersion = 2;
    this.storeName = 'models';
    this.db = null;
    this.isSupported = this._checkIndexedDBSupport();
    
  }

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

  async _initializeDB() {
    if (this.db) {
      return this.db;
    }

    if (!this.isSupported) {
      throw new Error('IndexedDB가 지원되지 않는 브라우저입니다');
    }


    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onerror = () => {
        console.error('❌ [ModelCacheManager] IndexedDB 열기 실패:', request.error);
        reject(new Error(`IndexedDB 열기 실패: ${request.error?.message || 'Unknown error'}`));
      };

      request.onsuccess = () => {
        this.db = request.result;
        
        this.db.onclose = () => {
          this.db = null;
        };

        this.db.onversionchange = () => {
          this.db.close();
          this.db = null;
        };

        resolve(this.db);
      };

      request.onupgradeneeded = (event) => {
        const db = event.target.result;

        if (db.objectStoreNames.contains(this.storeName)) {
          db.deleteObjectStore(this.storeName);
        }

        const store = db.createObjectStore(this.storeName, { keyPath: 'id' });
        
        store.createIndex('timestamp', 'metadata.timestamp', { unique: false });
        store.createIndex('version', 'metadata.version', { unique: false });
        store.createIndex('type', 'metadata.type', { unique: false });
        store.createIndex('url', 'url', { unique: false });

      };
    });
  }

  async saveModel(id, url, data, metadata = {}) {

    try {
      await this._initializeDB();

      if (!data || !(data instanceof ArrayBuffer)) {
        throw new Error('data는 ArrayBuffer 타입이어야 합니다');
      }

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
          resolve(true);
        };

        transaction.onerror = () => {
          console.error(`❌ [ModelCacheManager] 모델 저장 실패: ${id}`, transaction.error);
          reject(new Error(`모델 저장 실패: ${transaction.error?.message || 'Unknown error'}`));
        };

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

  async loadModel(id) {

    try {
      await this._initializeDB();

      return new Promise((resolve, reject) => {
        const transaction = this.db.transaction([this.storeName], 'readonly');
        const store = transaction.objectStore(this.storeName);
        const request = store.get(id);

        request.onsuccess = () => {
          const result = request.result;
          
          if (result) {
            resolve(result);
          } else {
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

  async hasModel(id) {
    try {
      const model = await this.loadModel(id);
      return !!model;
    } catch (error) {
      console.error(`❌ [ModelCacheManager] hasModel 에러: ${id}`, error);
      return false;
    }
  }

  async deleteModel(id) {

    try {
      await this._initializeDB();

      return new Promise((resolve, reject) => {
        const transaction = this.db.transaction([this.storeName], 'readwrite');
        const store = transaction.objectStore(this.storeName);

        transaction.oncomplete = () => {
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

  async getAllModels() {

    try {
      await this._initializeDB();

      return new Promise((resolve, reject) => {
        const transaction = this.db.transaction([this.storeName], 'readonly');
        const store = transaction.objectStore(this.storeName);
        const request = store.getAll();

        request.onsuccess = () => {
          const models = request.result || [];
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

  async getCacheStats() {

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

  async clearAllCache() {

    try {
      await this._initializeDB();

      return new Promise((resolve, reject) => {
        const transaction = this.db.transaction([this.storeName], 'readwrite');
        const store = transaction.objectStore(this.storeName);

        transaction.oncomplete = () => {
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

  async cleanupOldCache(maxAge = 30 * 24 * 60 * 60 * 1000) {

    try {
      const models = await this.getAllModels();
      const now = Date.now();
      const expiredModels = models.filter(model => 
        (now - model.metadata.timestamp) > maxAge
      );

      if (expiredModels.length === 0) {
        return 0;
      }


      const deletePromises = expiredModels.map(model => this.deleteModel(model.id));
      await Promise.all(deletePromises);

      return expiredModels.length;

    } catch (error) {
      console.error('❌ [ModelCacheManager] cleanupOldCache 에러:', error);
      throw error;
    }
  }

  async deleteModelsByVersion(version) {

    try {
      await this._initializeDB();

      return new Promise((resolve, reject) => {
        const transaction = this.db.transaction([this.storeName], 'readwrite');
        const store = transaction.objectStore(this.storeName);
        const index = store.index('version');

        let deletedCount = 0;

        transaction.oncomplete = () => {
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

  _formatBytes(bytes) {
    if (bytes === 0) return '0.00MB';
    
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    const size = (bytes / Math.pow(1024, i)).toFixed(2);
    
    return `${size}${sizes[i]}`;
  }

  async close() {
    if (this.db) {
      this.db.close();
      this.db = null;
    }
  }

  async deleteDatabase() {

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

  async getStorageQuota() {

    if (!navigator.storage || !navigator.storage.estimate) {
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

      
      return result;

    } catch (error) {
      console.error('❌ [ModelCacheManager] 스토리지 용량 조회 실패:', error);
      return null;
    }
  }

  async debugInfo() {
    
    try {

      if (this.isSupported) {
        const stats = await this.getCacheStats();

        const quota = await this.getStorageQuota();
        if (quota) {
        }

        const models = await this.getAllModels();
      }

    } catch (error) {
      console.error('디버깅 정보 조회 실패:', error);
    } finally {
    }
  }
}

const modelCacheManager = new ModelCacheManager();

if (typeof window !== 'undefined') {
  window.modelCacheManager = modelCacheManager;
}

export default modelCacheManager;