import { create } from "zustand";
import {
  createDispatch,
  getDispatchHistory,
  getDispatchDetail,
  updateAmbulanceStatus,
  getAmbulanceDetail,
  getAmbulances,
  getAmbulancesByStatus,
  getAvailableAmbulances,
  getAmbulanceLocation,
  getFirestationInfo,
  getFirestationLocation,
  getFirestationInfoById,
  getCurrentUserInfo
} from "../api/api";
import { fetchWithAuth } from "../utils/apiInterceptor";
import { useAuthStore } from "./useAuthStore";

// 유틸리티 함수들...
const getStatusText = (status) => {
  const statusMap = {
    'WAIT': '대기중', 'DISPATCH': '출동중', 'TRANSFER': '이송중',
    'MAINTENANCE': '정비중', 'completed': '완료'
  };
  return statusMap[status] || status || '알 수 없음';
};

const getPriorityColor = (priority) => {
    const colorMap = {
      'emergency': 'text-red-600 bg-red-50', 'urgent': 'text-orange-600 bg-orange-50',
      'normal': 'text-blue-600 bg-blue-50'
    };
    return colorMap[priority] || colorMap.normal;
};
  
const calculateResponseTimeMinutes = (startTime, endTime) => {
    if (!startTime || !endTime) return 0;
    const start = new Date(startTime);
    const end = new Date(endTime);
    return Math.round((end - start) / 60000);
};

const isToday = (dateString) => {
    if (!dateString) return false;
    const date = new Date(dateString);
    const today = new Date();
    return date.toDateString() === today.toDateString();
};


const useFireStationStore = create((set, get) => ({
  ambulances: [],
  dispatchHistory: [],
  isLoading: false,
  error: null,
  lastUpdated: null,
  reports: [],
  reportPage: 0,
  reportTotalPages: 0,
  isReportLoading: false,
  dispatchingAmbulances: new Map(),
  recentDispatches: [],
  dispatchQueue: [],
  todayStats: {
    totalDispatches: 0, completedDispatches: 0, activeDispatches: 0,
    averageResponseTime: 0, emergencyDispatches: 0, urgentDispatches: 0, normalDispatches: 0
  },
  ambulanceStatusCache: new Map(),
  ambulanceDetailsCache: new Map(),
  firestationInfo: null,
  firestationLocation: null,

  fetchDispatchHistory: async (options = {}) => {
    try {
      const history = await getDispatchHistory(options);
      const todayDispatches = history?.filter(dispatch => isToday(dispatch.createdAt)) || [];
      const completedToday = todayDispatches.filter(dispatch => ['completed', 'arrived', 'WAIT'].includes(dispatch.status || dispatch.ambulance?.currentStatus));
      const activeToday = todayDispatches.filter(dispatch => ['dispatched', 'transporting', 'DISPATCH', 'TRANSFER'].includes(dispatch.status || dispatch.ambulance?.currentStatus));
      const completedWithTimes = completedToday.filter(d => d.createdAt && (d.completeTime || d.arrivalTime));
      const averageResponseTime = completedWithTimes.length > 0
        ? Math.round(completedWithTimes.reduce((sum, d) => sum + calculateResponseTimeMinutes(d.createdAt, d.completeTime || d.arrivalTime), 0) / completedWithTimes.length)
        : 0;

      const newStats = {
        totalDispatches: todayDispatches.length, completedDispatches: completedToday.length,
        activeDispatches: activeToday.length, averageResponseTime,
        emergencyDispatches: todayDispatches.filter(d => d.priority === 'emergency').length,
        urgentDispatches: todayDispatches.filter(d => d.priority === 'urgent').length,
        normalDispatches: todayDispatches.filter(d => d.priority === 'normal').length
      };

      set({ dispatchHistory: history || [], todayStats: newStats, lastUpdated: new Date().toISOString() });
      return history;
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || "출동 기록을 불러오는데 실패했습니다.";
      set({ error: errorMessage });
      throw error;
    }
  },

  dispatchAmbulance: async (dispatchRequest) => {
    const { ambulanceIds } = dispatchRequest;
    const ambulanceId = ambulanceIds?.[0];

    if (!ambulanceId) throw new Error('구급차 ID가 필요합니다.');

    set(state => ({
      dispatchingAmbulances: new Map(state.dispatchingAmbulances).set(ambulanceId, { status: "requesting", timestamp: Date.now() }),
      error: null
    }));

    try {
      const dispatchResult = await createDispatch(dispatchRequest);
      await get().fetchDispatchHistory();
      set(state => {
        const newDispatchingAmbulances = new Map(state.dispatchingAmbulances);
        newDispatchingAmbulances.delete(ambulanceId);
        return { dispatchingAmbulances: newDispatchingAmbulances };
      });
      return { ...dispatchResult, success: true };
    } catch (error) {
      set(state => ({
        dispatchingAmbulances: new Map(state.dispatchingAmbulances).set(ambulanceId, { status: "error", error: error.message }),
        error: error.message
      }));
      throw error;
    }
  },

  fetchFirestationAmbulances: async (firestationId) => {
    try {
        const ambulanceList = await getAmbulances();
        set({ ambulances: ambulanceList || [] });
        return ambulanceList;
    } catch (error) {
        const errorMessage = error.message || "소방서 소속 구급차를 불러오는데 실패했습니다.";
        set({ error: errorMessage, ambulances: [] });
        throw error;
    }
  },
  
  // --- 🔽 핵심 수정 부분 ---
  fetchFirestationInfo: async () => {
    try {
      const { user } = useAuthStore.getState();
      if (!user?.userId) {
        throw new Error('로그인 정보에서 소방서 ID를 찾을 수 없습니다.');
      }
  
      const [info, location] = await Promise.all([
        getFirestationInfo(),
        getFirestationLocation()
      ]);
  
      // API 응답(info)과 로그인 정보(user)를 조합하여 완전한 소방서 정보 객체를 만듭니다.
      const combinedInfo = {
        id: user.userId, // 로그인된 사용자의 ID를 소방서 ID로 사용
        userKey: user.userKey,
        name: info?.name || '소방서 정보 없음',
        address: info?.address || '주소 정보 없음',
        latitude: location?.latitude || null,
        longitude: location?.longitude || null,
      };
  
      set({ firestationInfo: combinedInfo });
      return combinedInfo;
    } catch (error) {
      set({ error: error.message });
      throw error;
    }
  },

  fetchReportById: async (reportId) => {
    set({ isReportLoading: true, error: null });
    try {
        const { getReportById } = await import("../api/api");
        const report = await getReportById(reportId);
        return report;
    } catch (error) {
        const errorMessage = error.response?.data?.message || error.message || "보고서 상세 정보를 불러오는데 실패했습니다.";
        set({ error: errorMessage });
        throw error;
    } finally {
        set({ isReportLoading: false });
    }
  },

  fetchReports: async (page = 0, size = 10, searchOptions = {}) => {
    set({ isReportLoading: true, error: null });
    try {
      const { getReports } = await import("../api/api");
      const searchEnvelope = { request: searchOptions, page, size, sort: "createdAt,desc" };
      const response = await getReports(searchEnvelope);
      
      set({
        reports: response.content || [], reportPage: response.number || 0,
        reportTotalPages: response.totalPages || 0, isReportLoading: false
      });
      return response;
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || "보고서 목록을 불러오는데 실패했습니다.";
      set({ error: errorMessage, isReportLoading: false, reports: [] });
      throw error;
    }
  },

  initializeData: async () => {
    set({ isLoading: true, error: null });
    const { user } = useAuthStore.getState();
    if (!user?.userId) {
      set({ isLoading: false, error: '사용자 정보가 없습니다.' });
      return;
    }

    try {
      await Promise.all([
        get().fetchFirestationInfo(),
        get().fetchFirestationAmbulances(user.userId),
        get().fetchDispatchHistory(),
        get().fetchReports()
      ]);
      set({ isLoading: false });
    } catch (error) {
      console.error("초기 데이터 로딩 실패:", error);
      set({ isLoading: false, error: error.message || '초기 데이터 로딩에 실패했습니다.' });
    }
  },

  isAmbulanceDispatching: (ambulanceId) => !!get().dispatchingAmbulances.get(ambulanceId),
  getDispatchProgress: (ambulanceId) => get().dispatchingAmbulances.get(ambulanceId) || null,
  
  refreshTodayStats: async () => {
    try {
      await get().fetchDispatchHistory(); // fetchDispatchHistory가 통계를 다시 계산함
    } catch (error) {
      console.error("오늘 통계 새로고침 실패:", error);
    }
  },

  clearError: () => set({ error: null }),
  reset: () => set({
    ambulances: [], dispatchHistory: [], isLoading: false, error: null,
    dispatchingAmbulances: new Map(), recentDispatches: [], firestationInfo: null,
    reports: [], reportPage: 0, reportTotalPages: 0, isReportLoading: false,
  })
}));

export default useFireStationStore;