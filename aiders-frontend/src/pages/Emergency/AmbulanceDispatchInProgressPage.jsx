import React from 'react';
import { useNavigate } from 'react-router-dom';
import AmbulanceLayout from '../../components/Emergency/Layout/AmbulanceLayout';
import useEmergencyStore from '../../store/useEmergencyStore';

// 이 컴포넌트는 구급차가 출동 지시를 받고 환자에게 이동하는 동안의 화면을 담당합니다.
export default function AmbulanceDispatchInProgressPage() {
  const navigate = useNavigate();
  const { selectedAmbulance, transferToHospital } = useEmergencyStore();

  // 환자 탑승 및 이송 시작 처리 핸들러
  const handlePatientTransfer = async () => {
    if (window.confirm("환자 탑승을 완료하고 이송을 시작하시겠습니까? 구급차 상태가 '이송중'으로 변경됩니다.")) {
      try {
        await transferToHospital();
        // 환자 정보 입력 페이지로 이동
        navigate('/emergency/patient-input', { state: { isEditMode: false } });
      } catch (error) {
        console.error("이송 시작 처리 실패:", error);
        alert("이송 시작 처리에 실패했습니다: " + error.message);
      }
    }
  };

  // 출동 정보가 없을 경우를 대비한 UI
  if (!selectedAmbulance?.pAddress) {
    return (
      <AmbulanceLayout>
        <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500 mx-auto mb-4"></div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">출동 정보를 불러오는 중...</h1>
            <p className="text-gray-600">배차 정보를 확인하고 있습니다. 잠시만 기다려주세요.</p>
        </div>
      </AmbulanceLayout>
    );
  }

  return (
    <AmbulanceLayout>
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
        <div className="w-full max-w-lg mx-auto bg-white rounded-xl shadow-lg p-8 text-center">
          
          {/* 아이콘 및 상태 */}
          <div className="animate-pulse text-6xl mb-4">🚨</div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">출동 중</h1>
          <p className="text-gray-600 mb-6">환자에게 이동 중입니다. 현장 도착 후 아래 버튼을 눌러주세요.</p>

          {/* 출동 정보 */}
          <div className="text-left bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-2 mb-8">
            <div>
              <span className="font-semibold text-gray-700">📍 출동 주소:</span>
              <p className="text-gray-800">{selectedAmbulance.pAddress}</p>
            </div>
            <div>
              <span className="font-semibold text-gray-700">📋 환자 상태:</span>
              <p className="text-gray-800">{selectedAmbulance.pCondition || "정보 없음"}</p>
            </div>
          </div>
          
          {/* 핵심 액션 버튼 */}
          <button
            onClick={handlePatientTransfer}
            className="w-full px-6 py-4 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-transform transform hover:scale-105"
          >
            환자 탑승 완료 (이송 시작)
          </button>

        </div>
      </div>
    </AmbulanceLayout>
  );
}