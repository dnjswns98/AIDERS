import { create } from "zustand"
import { fetchWithAuth } from "../utils/apiInterceptor"

export const useHospitalStore = create((set, get) => ({
  // 상태
  loading: false,
  error: null,
  hospitalInfo: null,
  hospitalLocation: null,
  departmentStatus: null,
  bedInfo: null,

  // 병원 정보 조회 (이름, 주소)
  fetchHospitalInfo: async () => {
    set({ loading: true, error: null });
    
    try {
      const response = await fetchWithAuth(`${import.meta.env.VITE_API_BASE_URL}/api/v1/hospital/me`, {
        method: 'GET'
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      // console.log('🏥 병원 정보 조회 성공 (/api/v1/hospital/me):', {
      //   name: data.name,
      //   address: data.address,
      //   fullData: data
      // });
      set({ 
        hospitalInfo: data,
        loading: false 
      });
      
      return { success: true, data };
    } catch (error) {
      console.error('병원 정보 조회 실패:', error);
      set({ 
        error: error.message,
        loading: false
      });
      return { success: false, error: error.message };
    }
  },

  // 병원 위치 정보 조회
  fetchHospitalLocation: async () => {
    set({ loading: true, error: null });
    
    try {
      const response = await fetchWithAuth(`${import.meta.env.VITE_API_BASE_URL}/api/v1/hospital/location`, {
        method: 'GET'
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      // console.log('📍 병원 위치 정보 조회 성공 (/api/v1/hospital/location):', {
      //   latitude: data.latitude,
      //   longitude: data.longitude,
      //   fullData: data
      // });
      set({ 
        hospitalLocation: data,
        loading: false 
      });
      
      return { success: true, data };
    } catch (error) {
      console.error('병원 위치 정보 조회 실패:', error);
      set({ 
        error: error.message,
        loading: false
      });
      return { success: false, error: error.message };
    }
  },

  // 진료과 상태 조회
  fetchDepartmentStatus: async () => {
    set({ loading: true, error: null });
    
    try {
      const response = await fetchWithAuth(`${import.meta.env.VITE_API_BASE_URL}/api/v1/hospital/department`, {
        method: 'GET'
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      // console.log('🏥 진료과 상태 조회 성공 (/api/v1/hospital/department):', {
      //   fullData: data
      // });
      set({ 
        departmentStatus: data,
        loading: false 
      });
      
      return { success: true, data };
    } catch (error) {
      console.error('진료과 상태 조회 실패:', error);
      set({ 
        error: error.message,
        loading: false
      });
      return { success: false, error: error.message };
    }
  },

  // 진료과 상태 업데이트
  updateDepartmentStatus: async (updateData) => {
    set({ loading: true, error: null });
    
    try {
      const response = await fetchWithAuth(`${import.meta.env.VITE_API_BASE_URL}/api/v1/hospital/department`, {
        method: 'PATCH',
        body: JSON.stringify(updateData)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
      }

      set({ loading: false });
      
      // 업데이트 후 다시 조회
      await get().fetchDepartmentStatus();
      
      return { success: true, message: '진료과 상태가 업데이트되었습니다.' };
    } catch (error) {
      console.error('진료과 상태 업데이트 실패:', error);
      set({ 
        error: error.message,
        loading: false
      });
      return { success: false, error: error.message };
    }
  },

  // 베드 정보 조회
  fetchBedInfo: async () => {
    // console.log('🔍 fetchBedInfo 시작 - API 요청 전');
    // console.log('🔍 API URL:', `${import.meta.env.VITE_API_BASE_URL}/api/v1/hospital/bed`);
    
    set({ loading: true, error: null });
    
    try {
      const response = await fetchWithAuth(`${import.meta.env.VITE_API_BASE_URL}/api/v1/hospital/bed`, {
        method: 'GET'
      });
      
      // console.log('🔍 fetchBedInfo - Response 상태:', {
      //   status: response.status,
      //   statusText: response.statusText,
      //   ok: response.ok
      // });

      if (!response.ok) {
        const errorText = await response.text();
        
        // 500 에러 또는 병상 정보가 없는 경우 처리
        if (response.status === 500 || errorText.includes('병상 정보가 없습니다')) {
          // console.log('병상 정보가 없어서 기본값으로 초기화합니다.');
          
          const defaultBedInfo = {
            generalTotalBed: 0,
            generalAvailableBed: 0,
            generalIsAvailable: true,
            generalIsExist: true,
            pediatricTotalBed: 0,
            pediatricAvailableBed: 0,
            pediatricIsAvailable: true,
            pediatricIsExist: true,
            traumaTotalBed: 0,
            traumaAvailableBed: 0,
            traumaIsAvailable: true,
            traumaIsExist: true,
            neonatalTotalBed: 0,
            neonatalAvailableBed: 0,
            neonatalIsAvailable: true,
            neonatalIsExist: true
          };
          
          set({ 
            bedInfo: defaultBedInfo,
            loading: false,
            error: null
          });
          
          return { success: true, data: defaultBedInfo, isDefault: true };
        }
        
        throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      // console.log('🛏️ 베드 정보 조회 성공 (/api/v1/hospital/bed):', {
      //   fullData: data,
      //   allKeys: Object.keys(data)
      // });
      
      // // 실제 필드명 확인을 위한 상세 로그
      // console.log('🔍 베드 정보 상세 분석:', {
      //   generalTotalBed: data.generalTotalBed,
      //   generalAvailableBed: data.generalAvailableBed,
      //   generalIsAvailable: data.generalIsAvailable,
      //   generalIsExist: data.generalIsExist,
      //   pediatricTotalBed: data.pediatricTotalBed,
      //   pediatricAvailableBed: data.pediatricAvailableBed,
      //   traumaTotalBed: data.traumaTotalBed,
      //   traumaAvailableBed: data.traumaAvailableBed,
      //   neonatalTotalBed: data.neonatalTotalBed,
      //   neonatalAvailableBed: data.neonatalAvailableBed
      // });
      set({ 
        bedInfo: data,
        loading: false 
      });
      
      return { success: true, data };
    } catch (error) {
      console.error('베드 정보 조회 실패:', error);
      
      // 병상 정보가 없는 경우 기본값으로 처리
      if (error.message.includes('병상 정보가 없습니다') || error.message.includes('500')) {
        // console.log('에러 처리: 병상 정보가 없어서 기본값으로 초기화합니다.');
        
        const defaultBedInfo = {
          generalTotalBed: 0,
          generalAvailableBed: 0,
          generalIsAvailable: true,
          generalIsExist: true,
          pediatricTotalBed: 0,
          pediatricAvailableBed: 0,
          pediatricIsAvailable: true,
          pediatricIsExist: true,
          traumaTotalBed: 0,
          traumaAvailableBed: 0,
          traumaIsAvailable: true,
          traumaIsExist: true,
          neonatalTotalBed: 0,
          neonatalAvailableBed: 0,
          neonatalIsAvailable: true,
          neonatalIsExist: true
        };
        
        set({ 
          bedInfo: defaultBedInfo,
          loading: false,
          error: null
        });
        
        return { success: true, data: defaultBedInfo, isDefault: true };
      }
      
      set({ 
        error: error.message,
        loading: false
      });
      return { success: false, error: error.message };
    }
  },

  // 베드 정보 업데이트
  updateBedInfo: async (updateData) => {
    set({ loading: true, error: null });
    
    try {
      // 현재 베드 정보를 가져와서 완전한 데이터로 병합
      const currentBedInfo = get().bedInfo || {};
      
      // 기본값으로 완전한 베드 정보 구성
      const completeData = {
        generalTotalBed: currentBedInfo.generalTotalBed || 0,
        generalAvailableBed: currentBedInfo.generalAvailableBed || 0,
        generalIsAvailable: currentBedInfo.generalIsAvailable !== undefined ? currentBedInfo.generalIsAvailable : true,
        generalIsExist: currentBedInfo.generalIsExist !== undefined ? currentBedInfo.generalIsExist : true,
        pediatricTotalBed: currentBedInfo.pediatricTotalBed || 0,
        pediatricAvailableBed: currentBedInfo.pediatricAvailableBed || 0,
        pediatricIsAvailable: currentBedInfo.pediatricIsAvailable !== undefined ? currentBedInfo.pediatricIsAvailable : true,
        pediatricIsExist: currentBedInfo.pediatricIsExist !== undefined ? currentBedInfo.pediatricIsExist : true,
        traumaTotalBed: currentBedInfo.traumaTotalBed || 0,
        traumaAvailableBed: currentBedInfo.traumaAvailableBed || 0,
        traumaIsAvailable: currentBedInfo.traumaIsAvailable !== undefined ? currentBedInfo.traumaIsAvailable : true,
        traumaIsExist: currentBedInfo.traumaIsExist !== undefined ? currentBedInfo.traumaIsExist : true,
        neonatalTotalBed: currentBedInfo.neonatalTotalBed || 0,
        neonatalAvailableBed: currentBedInfo.neonatalAvailableBed || 0,
        neonatalIsAvailable: currentBedInfo.neonatalIsAvailable !== undefined ? currentBedInfo.neonatalIsAvailable : true,
        neonatalIsExist: currentBedInfo.neonatalIsExist !== undefined ? currentBedInfo.neonatalIsExist : true,
        ...updateData  // 업데이트할 데이터로 덮어쓰기
      };
      
      // console.log('🔍 완전한 베드 업데이트 데이터:', completeData);

      const response = await fetchWithAuth(`${import.meta.env.VITE_API_BASE_URL}/api/v1/hospital/bed`, {
        method: 'PATCH',
        body: JSON.stringify(completeData)
      });

      if (!response.ok) {
        const errorText = await response.text();
        // console.error('🚨 베드 업데이트 실패 응답:', {
        //   status: response.status,
        //   statusText: response.statusText,
        //   errorText: errorText
        // });
        
        // 특정 에러 메시지에 대한 처리
        if (errorText.includes('병상 정보가 없습니다') || response.status === 500) {
          set({ loading: false });
          
          // 베드 정보가 없으면 초기 베드 생성 시도 
          // console.log('베드 정보가 없어서 초기 생성 시도:', completeData);
          
          try {
            // 기본값으로 다시 시도 (모든 베드를 최소 1로 설정해서 데이터 생성)
            const initData = {
              generalTotalBed: Math.max(completeData.generalTotalBed, 1),
              generalAvailableBed: Math.max(completeData.generalAvailableBed, 1),
              generalIsAvailable: true,
              generalIsExist: true,
              pediatricTotalBed: Math.max(completeData.pediatricTotalBed, 1),
              pediatricAvailableBed: Math.max(completeData.pediatricAvailableBed, 1),
              pediatricIsAvailable: true,
              pediatricIsExist: true,
              traumaTotalBed: Math.max(completeData.traumaTotalBed, 1),
              traumaAvailableBed: Math.max(completeData.traumaAvailableBed, 1),
              traumaIsAvailable: true,
              traumaIsExist: true,
              neonatalTotalBed: Math.max(completeData.neonatalTotalBed, 1),
              neonatalAvailableBed: Math.max(completeData.neonatalAvailableBed, 1),
              neonatalIsAvailable: true,
              neonatalIsExist: true
            };
            
            // console.log('🔄 재시도 데이터:', initData);
            
            const retryResponse = await fetchWithAuth(`${import.meta.env.VITE_API_BASE_URL}/api/v1/hospital/bed`, {
              method: 'PATCH',
              body: JSON.stringify(initData)
            });
            
            if (!retryResponse.ok) {
              const retryErrorText = await retryResponse.text();
              // console.error('🚨 재시도도 실패:', {
              //   status: retryResponse.status,
              //   errorText: retryErrorText
              // });
              
              // 재시도도 실패하면 로컬에만 저장
              const newBedInfo = { ...currentBedInfo, ...updateData };
              set({ bedInfo: newBedInfo });
              
              return { 
                success: false, 
                error: `베드 정보 생성에 실패했습니다. 서버 응답: ${retryResponse.status} - ${retryErrorText}` 
              };
            }
            
            // 재시도 성공 시 다시 조회
            await get().fetchBedInfo();
            return { success: true, message: '베드 정보가 생성되고 업데이트되었습니다.' };
            
          } catch (retryError) {
            console.error('베드 정보 생성 재시도 실패:', retryError);
            
            // 완전 실패 시 로컬에만 저장
            const newBedInfo = { ...currentBedInfo, ...updateData };
            set({ bedInfo: newBedInfo });
            
            return { 
              success: false, 
              error: '베드 정보를 서버에 저장할 수 없습니다. 임시로 로컬에 저장되었습니다.' 
            };
          }
        }
        
        throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
      }

      set({ loading: false });
      
      // 업데이트 후 다시 조회
      await get().fetchBedInfo();
      
      return { success: true, message: '베드 정보가 업데이트되었습니다.' };
    } catch (error) {
      console.error('베드 정보 업데이트 실패:', error);
      set({ 
        error: error.message,
        loading: false
      });
      return { success: false, error: error.message };
    }
  },

  // 베드 수동 감소
  decreaseBedManually: async (bedType) => {
    set({ loading: true, error: null });
    
    try {
      const response = await fetchWithAuth(`${import.meta.env.VITE_API_BASE_URL}/api/v1/hospital/bed/decrease/manual?type=${bedType}`, {
        method: 'POST'
      });

      if (!response.ok) {
        const errorText = await response.text();
        
        // 특정 에러 메시지에 대한 처리
        if (errorText.includes('병상 정보가 없습니다') || response.status === 500) {
          set({ loading: false });
          return { 
            success: false, 
            error: '베드 정보가 아직 생성되지 않았습니다. 먼저 총 베드 수를 설정해주세요.' 
          };
        }
        
        throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
      }

      set({ loading: false });
      
      // 업데이트 후 다시 조회
      await get().fetchBedInfo();
      
      return { success: true, message: '베드가 감소되었습니다.' };
    } catch (error) {
      console.error('베드 감소 실패:', error);
      set({ 
        error: error.message,
        loading: false
      });
      return { success: false, error: error.message };
    }
  },

  // 베드 수동 증가
  increaseBedManually: async (bedType) => {
    set({ loading: true, error: null });
    
    try {
      const response = await fetchWithAuth(`${import.meta.env.VITE_API_BASE_URL}/api/v1/hospital/bed/increase/manual?type=${bedType}`, {
        method: 'POST'
      });

      if (!response.ok) {
        const errorText = await response.text();
        
        // 특정 에러 메시지에 대한 처리
        if (errorText.includes('병상 정보가 없습니다') || response.status === 500) {
          set({ loading: false });
          return { 
            success: false, 
            error: '베드 정보가 아직 생성되지 않았습니다. 먼저 총 베드 수를 설정해주세요.' 
          };
        }
        
        throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
      }

      set({ loading: false });
      
      // 업데이트 후 다시 조회
      await get().fetchBedInfo();
      
      return { success: true, message: '베드가 증가되었습니다.' };
    } catch (error) {
      console.error('베드 증가 실패:', error);
      set({ 
        error: error.message,
        loading: false
      });
      return { success: false, error: error.message };
    }
  },

  // 초기 베드 정보 생성 (POST)
  createInitialBedInfo: async (initialData = {}) => {
    set({ loading: true, error: null });
    
    try {
      // 기본 베드 정보로 POST 요청 시도
      const defaultBedInfo = {
        generalTotalBed: initialData.generalTotalBed || 0,
        generalAvailableBed: initialData.generalAvailableBed || 0,
        generalIsAvailable: true,
        generalIsExist: true,
        pediatricTotalBed: initialData.pediatricTotalBed || 0,
        pediatricAvailableBed: initialData.pediatricAvailableBed || 0,
        pediatricIsAvailable: true,
        pediatricIsExist: true,
        traumaTotalBed: initialData.traumaTotalBed || 0,
        traumaAvailableBed: initialData.traumaAvailableBed || 0,
        traumaIsAvailable: true,
        traumaIsExist: true,
        neonatalTotalBed: initialData.neonatalTotalBed || 0,
        neonatalAvailableBed: initialData.neonatalAvailableBed || 0,
        neonatalIsAvailable: true,
        neonatalIsExist: true,
        ...initialData
      };

      // 혹시 POST API가 있다면 사용, 없다면 PATCH 사용
      const response = await fetchWithAuth(`${import.meta.env.VITE_API_BASE_URL}/api/v1/hospital/bed`, {
        method: 'POST',
        body: JSON.stringify(defaultBedInfo)
      });

      if (response.ok) {
        // POST 성공
        set({ loading: false });
        await get().fetchBedInfo();
        return { success: true, message: '베드 정보가 생성되었습니다.' };
      } else if (response.status === 404 || response.status === 405) {
        // POST API가 없으면 PATCH로 시도
        const patchResponse = await fetchWithAuth(`${import.meta.env.VITE_API_BASE_URL}/api/v1/hospital/bed`, {
          method: 'PATCH',
          body: JSON.stringify(defaultBedInfo)
        });
        
        if (patchResponse.ok) {
          set({ loading: false });
          await get().fetchBedInfo();
          return { success: true, message: '베드 정보가 생성되었습니다.' };
        }
      }
      
      throw new Error('베드 정보 생성 실패');
      
    } catch (error) {
      console.error('초기 베드 정보 생성 실패:', error);
      set({ 
        error: error.message,
        loading: false
      });
      return { success: false, error: error.message };
    }
  },

  // 에러 초기화
  clearError: () => set({ error: null }),

  // 전체 데이터 초기화
  reset: () => set({
    loading: false,
    error: null,
    hospitalInfo: null,
    hospitalLocation: null,
    departmentStatus: null,
    bedInfo: null
  })
}))

export default useHospitalStore