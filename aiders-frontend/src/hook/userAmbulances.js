// src/hooks/useAmbulances.js
import { useState } from 'react';
import { useAppContext } from '../context/AppContext';

/**
 * useAmbulances 커스텀 훅
 * - 구급차 상태, 갱신 로직, 토스트 상태 관리
 */
function useAmbulances() {
  const { state, dispatch } = useAppContext();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showToast, setShowToast] = useState(false);

  /**
   * refreshAmbulances
   * - API 콜 시뮬레이션 후 구급차 데이터 업데이트
   */
  const refreshAmbulances = async () => {
    setIsRefreshing(true);
    try {
      await new Promise(res => setTimeout(res, 1000)); // 1초 대기
      const newAmbulances = [ /* ...새 데이터... */ ];
      dispatch({ type: 'UPDATE_AMBULANCES', payload: newAmbulances });
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);     // 3초 후 토스트 숨김
    } catch (err) {
      console.error('Failed to refresh ambulances:', err);
    } finally {
      setIsRefreshing(false);
    }
  };

  return {
    ambulances: state.ambulances,  // 구급차 목록
    isRefreshing,                  // 새로고침 진행 중 여부
    showToast,                     // 토스트 표시 여부
    refreshAmbulances              // 새로고침 함수
  };
}
export default useAmbulances