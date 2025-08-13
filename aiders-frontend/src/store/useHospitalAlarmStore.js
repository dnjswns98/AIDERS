import { create } from "zustand"
import { 
  getAllAlarms, 
  getMatchingAlarms, 
  getRequestAlarms, 
  getEditAlarms,
  deleteMatchingAlarm,
  deleteRequestAlarm,
  deleteEditAlarm,
  deleteAllAlarms
} from "../api/alarmAPI"

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
      return { success: false, error: 'Hospital ID가 필요합니다.' };
    }

    set({ loading: true, error: null });
    
    try {
      const data = await getAllAlarms(id);
      set({ 
        allAlarms: data,
        loading: false 
      });
      
      return { success: true, data };
    } catch (error) {
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
      const data = await getMatchingAlarms(id);
      set({ 
        matchingAlarms: data,
        loading: false 
      });
      
      return { success: true, data };
    } catch (error) {
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
      const data = await getRequestAlarms(id);
      set({ 
        requestAlarms: data,
        loading: false 
      });
      
      return { success: true, data };
    } catch (error) {
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
      const data = await getEditAlarms(id);
      set({ 
        editAlarms: data,
        loading: false 
      });
      
      return { success: true, data };
    } catch (error) {
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
      const result = await deleteMatchingAlarm(alarmId);
      set({ loading: false });
      
      // 삭제 후 다시 조회
      await get().fetchMatchingAlarms();
      
      return result;
    } catch (error) {
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
      const result = await deleteRequestAlarm(alarmId);
      set({ loading: false });
      
      // 삭제 후 다시 조회
      await get().fetchRequestAlarms();
      
      return result;
    } catch (error) {
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
      const result = await deleteEditAlarm(alarmId);
      set({ loading: false });
      
      // 삭제 후 다시 조회
      await get().fetchEditAlarms();
      
      return result;
    } catch (error) {
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
      const result = await deleteAllAlarms(id);
      set({ loading: false });
      
      // 삭제 후 모든 알림 다시 조회
      await get().fetchAllAlarms();
      await get().fetchMatchingAlarms();
      await get().fetchRequestAlarms();
      await get().fetchEditAlarms();
      
      return result;
    } catch (error) {
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