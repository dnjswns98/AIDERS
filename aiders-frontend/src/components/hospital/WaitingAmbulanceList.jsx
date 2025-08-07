import React, { useEffect } from 'react';
import useWaitingAmbulanceStore from '../../store/useWaitingAmbulanceStore';
import { useAuthStore } from '../../store/useAuthStore';

const WaitingAmbulanceList = ({ onStartCall }) => {
  const { ambulances, isLoading, error, fetchWaitingAmbulances } = useWaitingAmbulanceStore();
  const { user } = useAuthStore();
  
  const handleCallStart = (ambulance) => {
    console.log('[WaitingAmbulanceList] 통화 시작:', ambulance);
    if (onStartCall) {
      onStartCall({
        sessionId: ambulance.sessionId,
        ambulanceId: ambulance.ambulanceId,
        hospitalId: user?.userId,
        patientName: ambulance.patientName,
        ktas: ambulance.ktas
      });
    }
  };

  useEffect(() => {
    if (user?.userId) {
      console.log('[WaitingAmbulanceList] Fetching for hospital:', user.userId);
      fetchWaitingAmbulances(user.userId);

      // 30초마다 목록을 새로고침합니다.
      const intervalId = setInterval(() => fetchWaitingAmbulances(user.userId), 30000);

      return () => clearInterval(intervalId);
    }
  }, [fetchWaitingAmbulances, user?.userId]);

  if (isLoading) {
    return <div>로딩 중...</div>;
  }

  if (error) {
    return <div>오류가 발생했습니다: {error}</div>;
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-bold text-gray-800 mb-4">대기중인 구급차</h2>
      {ambulances.length === 0 ? (
        <p className="text-gray-500">현재 대기중인 구급차가 없습니다.</p>
      ) : (
        <div className="space-y-3">
          {ambulances.map((ambulance) => (
            <div key={ambulance.sessionId} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
              <div className="flex justify-between items-start mb-2">
                <div className="flex-1">
                  <div className="font-semibold text-gray-800">구급차 ID: {ambulance.ambulanceId}</div>
                  <div className="text-sm text-gray-600">
                    환자: {ambulance.patientName || <span className="text-gray-400">DB에서 조회 필요</span>}
                  </div>
                  <div className="text-sm text-gray-600">
                    KTAS: {ambulance.ktas ? `${ambulance.ktas}등급` : <span className="text-gray-400">DB에서 조회 필요</span>}
                  </div>
                  <div className="text-xs text-blue-600">세션: {ambulance.sessionId}</div>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${ambulance.isInCall ? 'bg-red-500' : 'bg-green-500'}`}></div>
                  <span className={`text-xs font-medium ${ambulance.isInCall ? 'text-red-600' : 'text-green-600'}`}>
                    {ambulance.isInCall ? '통화중' : '대기중'}
                  </span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <div className="text-xs text-gray-500">
                  {ambulance.createdAt ? new Date(ambulance.createdAt).toLocaleString('ko-KR') : '방금전'}
                </div>
                <button 
                  onClick={() => handleCallStart(ambulance)}
                  className="bg-blue-500 hover:bg-blue-600 text-white text-sm font-semibold py-1 px-3 rounded-lg transition-colors duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed"
                  disabled={ambulance.isInCall}
                >
                  {ambulance.isInCall ? '통화중' : '통화'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default WaitingAmbulanceList;
