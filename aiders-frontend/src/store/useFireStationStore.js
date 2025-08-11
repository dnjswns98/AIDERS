// src/store/useFireStationStore.js - 소방서 전용 상태관리 (최종 수정 버전)

import { create } from "zustand";
import { useAuthStore } from './useAuthStore';
import {
  createDispatch,
  getDispatchHistory,
  getDispatchDetail,
  updateDispatchStatus,
  completeDispatch,
  updateAmbulanceStatus,
  getAmbulanceDetail,
  getAmbulances,
  getAmbulancesByStatus,
  getAvailableAmbulances,
  getAmbulanceLocation,
  getTodayStats,
  getAmbulanceStats,
  getDispatchStats,
  getResponseTimeAnalysis,
  getFirestationInfo,
  getFirestationLocation,
  getFirestationInfoById,
  getCurrentUserInfo
} from "../api/api";
import { fetchWithAuth } from "../utils/apiInterceptor";

// === 유틸리티 함수들 ===
const getStatusText = (status) => {
  const statusMap = {
    'WAIT': '대기중',
    'DISPATCH': '출동중',
    'TRANSFER': '이송중',
    'MAINTENANCE': '정비중',
    'requesting': '배차 요청 중',
    'dispatching': '배차 처리 중',
    'updating_status': '상태 업데이트 중',
    'refreshing': '데이터 새로고침 중',
    'completed': '완료'
  };
  return statusMap[status] || status || '알 수 없음';
};

const getPriorityColor = (priority) => {
  const colorMap = {
    'emergency': 'text-red-600 bg-red-50',
    'urgent': 'text-orange-600 bg-orange-50',
    'normal': 'text-blue-600 bg-blue-50'
  };
  return colorMap[priority] || colorMap.normal;
};

const calculateResponseTimeMinutes = (startTime, endTime) => {
  if (!startTime || !endTime) return 0;
  
  const start = typeof startTime === 'string' ? new Date(startTime) : startTime;
  const end = typeof endTime === 'string' ? new Date(endTime) : endTime;
  
  return Math.round((end - start) / (1000 * 60));
};

const isToday = (dateString) => {
  if (!dateString) return false;
  const date = new Date(dateString);
  const today = new Date();
  return date.toDateString() === today.toDateString();
};


// === 메인 스토어 ===

const useFireStationStore = create((set, get) => ({
  // === 기본 상태 ===
  ambulances: [],
  dispatchHistory: [],
  isLoading: false,
  error: null,
  lastUpdated: null,
  
  // === 실시간 배차 추적 ===
  dispatchingAmbulances: new Map(),
  recentDispatches: [],
  dispatchQueue: [],
  
  // === 통계 데이터 ===
  todayStats: {
    totalDispatches: 0,
    completedDispatches: 0,
    activeDispatches: 0,
    averageResponseTime: 0,
    emergencyDispatches: 0,
    urgentDispatches: 0,
    normalDispatches: 0
  },
  
  // === 구급차 현황 캐시 ===
  ambulanceStatusCache: new Map(),
  ambulanceDetailsCache: new Map(),
  
  // === 소방서 정보 ===
  firestationInfo: null,
  firestationLocation: null,

  // ======================================================================
  // 🚨 출동 관련 액션들
  // ======================================================================

  fetchDispatchHistory: async (options = {}) => {
    set({ isLoading: true, error: null });
    
    try {
      const history = await getDispatchHistory(options);
      
      const todayDispatches = history?.filter(dispatch => isToday(dispatch.dispatchTime)) || [];
      const completedToday = todayDispatches.filter(dispatch => 
        ['completed', 'arrived'].includes(dispatch.status) || 
        ['WAIT'].includes(dispatch.ambulance?.currentStatus)
      );
      const activeToday = todayDispatches.filter(dispatch => 
        ['dispatched', 'transporting'].includes(dispatch.status) ||
        ['DISPATCH', 'TRANSFER'].includes(dispatch.ambulance?.currentStatus)
      );
      
      const completedWithTimes = completedToday.filter(d => d.dispatchTime && (d.completeTime || d.arrivalTime));
      const averageResponseTime = completedWithTimes.length > 0
        ? Math.round(completedWithTimes.reduce((sum, d) => sum + calculateResponseTimeMinutes(d.dispatchTime, d.completeTime || d.arrivalTime), 0) / completedWithTimes.length)
        : 0;

      set({
        dispatchHistory: history || [],
        isLoading: false,
        lastUpdated: new Date().toISOString(),
        todayStats: {
          totalDispatches: todayDispatches.length,
          completedDispatches: completedToday.length,
          activeDispatches: activeToday.length,
          averageResponseTime: averageResponseTime,
          emergencyDispatches: todayDispatches.filter(d => d.priority === 'emergency').length,
          urgentDispatches: todayDispatches.filter(d => d.priority === 'urgent').length,
          normalDispatches: todayDispatches.filter(d => d.priority === 'normal').length
        }
      });
      return history;
      
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || "출동 기록을 불러오는데 실패했습니다.";
      set({ error: errorMessage, isLoading: false });
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

  // ======================================================================
  // 🚑 구급차 관련 액션들
  // ======================================================================

  fetchFirestationAmbulances: async (firestationId) => {
    set({ isLoading: true, error: null });
    try {
        const ambulanceList = await getAmbulances();
        set({ ambulances: ambulanceList || [], isLoading: false });
        return ambulanceList;
    } catch (error) {
        const errorMessage = error.message || "소방서 소속 구급차를 불러오는데 실패했습니다.";
        set({ error: errorMessage, isLoading: false, ambulances: [] });
        throw error;
    }
  },

  fetchFirestationInfo: async () => {
    set({ isLoading: true, error: null });
    try {
      const [info, location] = await Promise.all([
        getFirestationInfo(),
        getFirestationLocation()
      ]);

      const combinedInfo = {
        ...(info || {}),
        latitude: location?.latitude || null,
        longitude: location?.longitude || null,
      };

      set({ firestationInfo: combinedInfo, isLoading: false });
      return combinedInfo;
    } catch (error) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  // [!code focus start]
  // ======================================================================
  // 🛠️ 유틸리티 및 상태 추적 함수 (누락된 부분 추가)
  // ======================================================================
  
  isAmbulanceDispatching: (ambulanceId) => {
    if (!ambulanceId) return false;
    const dispatching = get().dispatchingAmbulances.get(ambulanceId);
    return !!dispatching;
  },

  getDispatchProgress: (ambulanceId) => {
    if (!ambulanceId) return null;
    return get().dispatchingAmbulances.get(ambulanceId) || null;
  },

  refreshTodayStats: async () => {
    try {
      const stats = await getTodayStats();
      set(state => ({
        todayStats: { ...state.todayStats, ...stats }
      }));
    } catch (error) {
      console.error("오늘 통계 새로고침 실패:", error);
    }
  },
  // [!code focus end]
  
  clearError: () => set({ error: null }),

  reset: () => {
    set({
      ambulances: [],
      dispatchHistory: [],
      isLoading: false,
      error: null,
      dispatchingAmbulances: new Map(),
      recentDispatches: [],
      firestationInfo: null,
    });
  }
}));

export default useFireStationStore;