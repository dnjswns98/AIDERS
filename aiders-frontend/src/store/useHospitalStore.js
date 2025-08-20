import { create } from "zustand"
import { fetchWithAuth } from "../utils/apiInterceptor"

export const useHospitalStore = create((set, get) => ({
  loading: false,
  error: null,
  hospitalInfo: null,
  hospitalLocation: null,
  departmentStatus: null,
  bedInfo: null,

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

  fetchBedInfo: async () => {
    
    set({ loading: true, error: null });
    
    try {
      const response = await fetchWithAuth(`${import.meta.env.VITE_API_BASE_URL}/api/v1/hospital/bed`, {
        method: 'GET'
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        
        if (response.status === 500 || errorText.includes('병상 정보가 없습니다')) {
          
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
      set({ 
        bedInfo: data,
        loading: false 
      });
      
      return { success: true, data };
    } catch (error) {
      console.error('베드 정보 조회 실패:', error);
      
      if (error.message.includes('병상 정보가 없습니다') || error.message.includes('500')) {
        
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

  updateBedInfo: async (updateData) => {
    set({ loading: true, error: null });
    
    try {
      const currentBedInfo = get().bedInfo || {};
      
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
        ...updateData
      };
      

      const response = await fetchWithAuth(`${import.meta.env.VITE_API_BASE_URL}/api/v1/hospital/bed`, {
        method: 'PATCH',
        body: JSON.stringify(completeData)
      });

      if (!response.ok) {
        const errorText = await response.text();
        
        if (errorText.includes('병상 정보가 없습니다') || response.status === 500) {
          set({ loading: false });
          
          try {
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
            
            const retryResponse = await fetchWithAuth(`${import.meta.env.VITE_API_BASE_URL}/api/v1/hospital/bed`, {
              method: 'PATCH',
              body: JSON.stringify(initData)
            });
            
            if (!retryResponse.ok) {
              const retryErrorText = await retryResponse.text();
              
              const newBedInfo = { ...currentBedInfo, ...updateData };
              set({ bedInfo: newBedInfo });
              
              return { 
                success: false, 
                error: `베드 정보 생성에 실패했습니다. 서버 응답: ${retryResponse.status} - ${retryErrorText}` 
              };
            }
            
            await get().fetchBedInfo();
            return { success: true, message: '베드 정보가 생성되고 업데이트되었습니다.' };
            
          } catch (retryError) {
            console.error('베드 정보 생성 재시도 실패:', retryError);
            
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

  decreaseBedManually: async (bedType) => {
    set({ loading: true, error: null });
    
    try {
      const response = await fetchWithAuth(`${import.meta.env.VITE_API_BASE_URL}/api/v1/hospital/bed/decrease/manual?type=${bedType}`, {
        method: 'POST'
      });

      if (!response.ok) {
        const errorText = await response.text();
        
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

  increaseBedManually: async (bedType) => {
    set({ loading: true, error: null });
    
    try {
      const response = await fetchWithAuth(`${import.meta.env.VITE_API_BASE_URL}/api/v1/hospital/bed/increase/manual?type=${bedType}`, {
        method: 'POST'
      });

      if (!response.ok) {
        const errorText = await response.text();
        
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

  createInitialBedInfo: async (initialData = {}) => {
    set({ loading: true, error: null });
    
    try {
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

      const response = await fetchWithAuth(`${import.meta.env.VITE_API_BASE_URL}/api/v1/hospital/bed`, {
        method: 'POST',
        body: JSON.stringify(defaultBedInfo)
      });

      if (response.ok) {
        set({ loading: false });
        await get().fetchBedInfo();
        return { success: true, message: '베드 정보가 생성되었습니다.' };
      } else if (response.status === 404 || response.status === 405) {
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

  clearError: () => set({ error: null }),

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