import { create } from "zustand"
import { fetchWithAuth } from "../utils/apiInterceptor"

export const useHospitalAlarmStore = create((set, get) => ({
  // 상태
  loading: false,
  error: null,
  allAlarms: [],
  matchingAlarms: [],
  requestAlarms: [],
  editAlarms: [],
  hospitalId: null,

  // 병원 ID 설정
  setHospitalId: (id) => set({ hospitalId: id }),

  // 전체 알림 조회
  fetchAllAlarms: async (hospitalId) => {
    const id = hospitalId || get().hospitalId;
    if (!id) {
      console.error('Hospital ID가 설정되지 않았습니다.');
      return { success: false, error: 'Hospital ID가 필요합니다.' };
    }

    set({ loading: true, error: null });
    
    try {
      const response = await fetchWithAuth(`${import.meta.env.VITE_API_BASE_URL}/api/alarm/${id}`, {
        method: 'GET'
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      set({ 
        allAlarms: data,
        loading: false 
      });
      
      return { success: true, data };
    } catch (error) {
      console.error('전체 알림 조회 실패:', error);
      set({ 
        error: error.message,
        loading: false
      });
      return { success: false, error: error.message };
    }
  },

  // 매칭 알림 조회
  fetchMatchingAlarms: async (hospitalId) => {
    const id = hospitalId || get().hospitalId;
    if (!id) return { success: false, error: 'Hospital ID가 필요합니다.' };

    set({ loading: true, error: null });
    
    try {
      const response = await fetchWithAuth(`${import.meta.env.VITE_API_BASE_URL}/api/alarm/matching/${id}`, {
        method: 'GET'
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      set({ 
        matchingAlarms: data,
        loading: false 
      });
      
      return { success: true, data };
    } catch (error) {
      console.error('매칭 알림 조회 실패:', error);
      set({ 
        error: error.message,
        loading: false
      });
      return { success: false, error: error.message };
    }
  },

  // 통화 요청 알림 조회
  fetchRequestAlarms: async (hospitalId) => {
    const id = hospitalId || get().hospitalId;
    if (!id) return { success: false, error: 'Hospital ID가 필요합니다.' };

    set({ loading: true, error: null });
    
    try {
      const response = await fetchWithAuth(`${import.meta.env.VITE_API_BASE_URL}/api/alarm/request/${id}`, {
        method: 'GET'
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      set({ 
        requestAlarms: data,
        loading: false 
      });
      
      return { success: true, data };
    } catch (error) {
      console.error('통화 요청 알림 조회 실패:', error);
      set({ 
        error: error.message,
        loading: false
      });
      return { success: false, error: error.message };
    }
  },

  // 수정 알림 조회
  fetchEditAlarms: async (hospitalId) => {
    const id = hospitalId || get().hospitalId;
    if (!id) return { success: false, error: 'Hospital ID가 필요합니다.' };

    set({ loading: true, error: null });
    
    try {
      const response = await fetchWithAuth(`${import.meta.env.VITE_API_BASE_URL}/api/alarm/edit/${id}`, {
        method: 'GET'
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      set({ 
        editAlarms: data,
        loading: false 
      });
      
      return { success: true, data };
    } catch (error) {
      console.error('수정 알림 조회 실패:', error);
      set({ 
        error: error.message,
        loading: false
      });
      return { success: false, error: error.message };
    }
  },

  // 매칭 알림 삭제
  deleteMatchingAlarm: async (alarmId) => {
    set({ loading: true, error: null });
    
    try {
      const response = await fetchWithAuth(`${import.meta.env.VITE_API_BASE_URL}/api/alarm/matching/${alarmId}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
      }

      set({ loading: false });
      
      // 삭제 후 다시 조회
      await get().fetchMatchingAlarms();
      
      return { success: true, message: '매칭 알림이 삭제되었습니다.' };
    } catch (error) {
      console.error('매칭 알림 삭제 실패:', error);
      set({ 
        error: error.message,
        loading: false
      });
      return { success: false, error: error.message };
    }
  },

  // 통화 요청 알림 삭제
  deleteRequestAlarm: async (alarmId) => {
    set({ loading: true, error: null });
    
    try {
      const response = await fetchWithAuth(`${import.meta.env.VITE_API_BASE_URL}/api/alarm/request/${alarmId}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
      }

      set({ loading: false });
      
      // 삭제 후 다시 조회
      await get().fetchRequestAlarms();
      
      return { success: true, message: '통화 요청 알림이 삭제되었습니다.' };
    } catch (error) {
      console.error('통화 요청 알림 삭제 실패:', error);
      set({ 
        error: error.message,
        loading: false
      });
      return { success: false, error: error.message };
    }
  },

  // 수정 알림 삭제
  deleteEditAlarm: async (alarmId) => {
    set({ loading: true, error: null });
    
    try {
      const response = await fetchWithAuth(`${import.meta.env.VITE_API_BASE_URL}/api/alarm/edit/${alarmId}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
      }

      set({ loading: false });
      
      // 삭제 후 다시 조회
      await get().fetchEditAlarms();
      
      return { success: true, message: '수정 알림이 삭제되었습니다.' };
    } catch (error) {
      console.error('수정 알림 삭제 실패:', error);
      set({ 
        error: error.message,
        loading: false
      });
      return { success: false, error: error.message };
    }
  },

  // 병원의 모든 알림 삭제
  deleteAllAlarms: async (hospitalId) => {
    const id = hospitalId || get().hospitalId;
    if (!id) return { success: false, error: 'Hospital ID가 필요합니다.' };

    set({ loading: true, error: null });
    
    try {
      const response = await fetchWithAuth(`${import.meta.env.VITE_API_BASE_URL}/api/alarm/hospital/${id}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
      }

      set({ loading: false });
      
      // 삭제 후 모든 알림 다시 조회
      await get().fetchAllAlarms();
      await get().fetchMatchingAlarms();
      await get().fetchRequestAlarms();
      await get().fetchEditAlarms();
      
      return { success: true, message: '모든 알림이 삭제되었습니다.' };
    } catch (error) {
      console.error('모든 알림 삭제 실패:', error);
      set({ 
        error: error.message,
        loading: false
      });
      return { success: false, error: error.message };
    }
  },

  // 모든 알림 새로고침
  refreshAllAlarms: async () => {
    const hospitalId = get().hospitalId;
    if (!hospitalId) return;

    await Promise.all([
      get().fetchAllAlarms(hospitalId),
      get().fetchMatchingAlarms(hospitalId),
      get().fetchRequestAlarms(hospitalId),
      get().fetchEditAlarms(hospitalId)
    ]);
  },

  // 에러 초기화
  clearError: () => set({ error: null }),

  // 전체 데이터 초기화
  reset: () => set({
    loading: false,
    error: null,
    allAlarms: [],
    matchingAlarms: [],
    requestAlarms: [],
    editAlarms: [],
    hospitalId: null
  })
}))

export default useHospitalAlarmStore