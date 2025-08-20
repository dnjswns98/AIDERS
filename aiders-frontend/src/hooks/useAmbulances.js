// src/hooks/useAmbulances.js

import { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { getAmbulances } from '../api/api'; // API import

/**
 * useAmbulances 커스텀 훅
 * - 구급차 상태, 갱신 로직, 토스트 상태 관리
 */
function useAmbulances() {
  const { ambulances, setAmbulances, setShowToast } = useAppContext();
  const [isRefreshing, setIsRefreshing] = useState(false);

  /**
   * refreshAmbulances
   * - API 콜 후 구급차 데이터 업데이트
   */
  const refreshAmbulances = async () => {
    setIsRefreshing(true);
    try {
      const newAmbulances = await getAmbulances(); // 실제 API 호출
      setAmbulances(newAmbulances); // 상태 업데이트 함수 직접 호출
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);     // 3초 후 토스트 숨김
    } catch (err) {
      console.error('Failed to refresh ambulances:', err);
    } finally {
      setIsRefreshing(false);
    }
  };

  return {
    ambulances,                    // 구급차 목록
    isRefreshing,                  // 새로고침 진행 중 여부
    refreshAmbulances              // 새로고침 함수
  };
}
export default useAmbulances;