import { useEffect, useCallback } from 'react';

/**
 * 병원 WebSocket 알람 수신 시 자동 새로고침 훅
 * @param {Function} refreshCallback - 새로고침할 때 실행할 콜백 함수
 * @param {Array} alarmTypes - 반응할 알람 타입들 (기본값: 모든 알람)
 * @param {number} debounceMs - 디바운스 시간 (밀리초, 기본값: 1000)
 */
const useHospitalAlarmRefresh = (refreshCallback, alarmTypes = [], debounceMs = 1000) => {
  let debounceTimer = null;

  const debouncedRefresh = useCallback(() => {
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }
    
    debounceTimer = setTimeout(() => {
      if (typeof refreshCallback === 'function') {
        console.log('🔄 알람으로 인한 자동 새로고침 실행');
        refreshCallback();
      }
    }, debounceMs);
  }, [refreshCallback, debounceMs]);

  useEffect(() => {
    const handleAlarmReceived = (event) => {
      const alarmData = event.detail;
      console.log('🔔 알람 수신으로 인한 새로고침 체크:', alarmData.type);
      
      // 특정 알람 타입만 처리하도록 설정된 경우
      if (alarmTypes.length > 0 && !alarmTypes.includes(alarmData.type)) {
        console.log('🔕 무시된 알람 타입:', alarmData.type);
        return;
      }
      
      // 디바운스된 새로고침 실행
      debouncedRefresh();
    };

    // 이벤트 리스너 등록
    window.addEventListener('hospitalAlarmReceived', handleAlarmReceived);

    // 정리 함수
    return () => {
      window.removeEventListener('hospitalAlarmReceived', handleAlarmReceived);
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }
    };
  }, [debouncedRefresh, alarmTypes]);
};

export default useHospitalAlarmRefresh;