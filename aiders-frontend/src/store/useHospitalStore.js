import { create } from "zustand"
import { fetchWithAuth } from "../utils/apiInterceptor"

export const useHospitalStore = create((set, get) => ({
  // 상태
  loading: false,
  error: null,
  hospitalInfo: null,
  departmentStatus: null,
  bedInfo: null,

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
      set({ 
        hospitalInfo: data,
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
    set({ loading: true, error: null });
    
    try {
      const response = await fetchWithAuth(`${import.meta.env.VITE_API_BASE_URL}/api/v1/hospital/bed`, {
        method: 'GET'
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      set({ 
        bedInfo: data,
        loading: false 
      });
      
      return { success: true, data };
    } catch (error) {
      console.error('베드 정보 조회 실패:', error);
      
      // 병상 정보가 없는 경우 기본값으로 처리
      if (error.message.includes('병상 정보가 없습니다') || error.message.includes('500')) {
        const defaultBedInfo = {
          icuTotal: 0,
          icuUsed: 0,
          emergencyTotal: 0,
          emergencyUsed: 0,
          generalTotal: 0,
          generalUsed: 0
        };
        
        set({ 
          bedInfo: defaultBedInfo,
          loading: false,
          error: null
        });
        
        return { success: true, data: defaultBedInfo };
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
      const response = await fetchWithAuth(`${import.meta.env.VITE_API_BASE_URL}/api/v1/hospital/bed`, {
        method: 'PATCH',
        body: JSON.stringify(updateData)
      });

      if (!response.ok) {
        const errorText = await response.text();
        
        // 특정 에러 메시지에 대한 처리
        if (errorText.includes('병상 정보가 없습니다') || response.status === 500) {
          set({ loading: false });
          
          // 베드 정보가 없으면 초기 베드 생성 시도 (여러 번 시도)
          console.log('베드 정보가 없어서 초기 생성 시도:', updateData);
          
          try {
            // 기본값으로 다시 시도 (모든 베드를 1로 설정해서 데이터 생성)
            const initData = {
              icuTotal: updateData.icuTotal || 1,
              icuUsed: 0,
              emergencyTotal: updateData.emergencyTotal || 1, 
              emergencyUsed: 0,
              generalTotal: updateData.generalTotal || 1,
              generalUsed: 0
            };
            
            const retryResponse = await fetchWithAuth(`${import.meta.env.VITE_API_BASE_URL}/api/v1/hospital/bed`, {
              method: 'PATCH',
              body: JSON.stringify(initData)
            });
            
            if (!retryResponse.ok) {
              // 재시도도 실패하면 로컬에만 저장
              const currentBedInfo = get().bedInfo || {};
              const newBedInfo = { ...currentBedInfo, ...updateData };
              set({ bedInfo: newBedInfo });
              
              return { 
                success: false, 
                error: '베드 정보 생성에 실패했습니다. 관리자에게 문의해주세요.' 
              };
            }
            
            // 재시도 성공 시 다시 조회
            await get().fetchBedInfo();
            return { success: true, message: '베드 정보가 생성되고 업데이트되었습니다.' };
            
          } catch (retryError) {
            console.error('베드 정보 생성 재시도 실패:', retryError);
            
            // 완전 실패 시 로컬에만 저장
            const currentBedInfo = get().bedInfo || {};
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
        icuTotal: initialData.icuTotal || 0,
        icuUsed: 0,
        emergencyTotal: initialData.emergencyTotal || 0,
        emergencyUsed: 0,
        generalTotal: initialData.generalTotal || 0,
        generalUsed: 0,
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
    departmentStatus: null,
    bedInfo: null
  })
}))

export default useHospitalStore