import React, { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AmbulanceLayout from '../../components/Emergency/Layout/AmbulanceLayout';
import MapDisplay from '../../components/Emergency/MapDisplay';
import useEmergencyStore from '../../store/useEmergencyStore';
import { useAuthStore } from '../../store/useAuthStore';
import useLiveAmbulanceLocation from '../../hooks/useLiveAmbulanceLocation';

export default function AmbulanceDispatchInProgressPage() {
  const navigate = useNavigate();
  const { selectedAmbulance, transferToHospital } = useEmergencyStore();
  const { user } = useAuthStore();

  const { ambulanceLocation, hospitalDistanceInfo } = useLiveAmbulanceLocation(user?.userId);

  const [fsEnabled, setFsEnabled] = useState(false);

  const handleToggleFullscreen = useCallback(async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
        setFsEnabled(true);
      } else {
        await document.exitFullscreen();
        setFsEnabled(false);
      }
    } catch (e) {
      console.error('전체화면 전환 실패:', e);
    }
  }, []);

  const handlePatientTransfer = async () => {
    if (window.confirm("환자 탑승을 완료하고 이송을 시작하시겠습니까? 구급차 상태가 '이송중'으로 변경됩니다.")) {
      try {
        await transferToHospital();
        navigate('/emergency/patient-input', { state: { isEditMode: false } });
      } catch (error) {
        console.error("이송 시작 처리 실패:", error);
        alert("이송 시작 처리에 실패했습니다: " + error.message);
      }
    }
  };

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

  const patientLocation = {
    name: '환자 위치',
    address: selectedAmbulance.pAddress,
    latitude: selectedAmbulance.pLatitude,
    longitude: selectedAmbulance.pLongitude,
  };

  return (
    <AmbulanceLayout>
      {/* 전체 화면 지도: 브라우저 뷰포트에 고정 */}
      <div className="fixed inset-0 w-screen h-screen bg-black">
        {/* 지도 자체 */}
        <MapDisplay
          hospital={patientLocation}
          destinationType="patient"
          destinationIconSrc="/icon/patient.png"   // ✅ public/icon 하위 경로
          ambulanceLocation={ambulanceLocation}
          distanceInfo={hospitalDistanceInfo}
          showControls={true}
          isFullScreen={true}                        // ✅ 풀스크린 모드 UI
          zoom={6}
        />

        {/* 오버레이: 좌측 상단 출동 정보 카드 */}
        <div className="absolute top-4 left-4 z-50 max-w-md">
          <div className="bg-white/95 backdrop-blur-sm border border-gray-200 rounded-xl shadow-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">🚨</span>
              <h2 className="text-xl font-bold text-gray-800">출동 중</h2>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              환자에게 이동 중입니다. 현장 도착 후 오른쪽 아래 버튼을 눌러주세요.
            </p>

            <div className="text-left bg-gray-50 border border-gray-200 rounded-lg p-3 space-y-2">
              <div>
                <span className="font-semibold text-gray-700">📍 출동 주소:</span>
                <p className="text-gray-800 break-words">{selectedAmbulance.pAddress}</p>
              </div>
              <div>
                <span className="font-semibold text-gray-700">📋 환자 상태:</span>
                <p className="text-gray-800 break-words">
                  {selectedAmbulance.pCondition || "정보 없음"}
                </p>
              </div>
              {hospitalDistanceInfo?.distance != null && (
                <div className="text-sm text-gray-700">
                  <span className="font-semibold">↔ 예상거리:</span>{" "}
                  {(hospitalDistanceInfo.distance / 1000).toFixed(2)} km
                  {hospitalDistanceInfo.timestamp && (
                    <span className="text-gray-500"> · {new Date(hospitalDistanceInfo.timestamp).toLocaleTimeString()}</span>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 오버레이: 우측 하단 이송 시작 버튼 */}
        <div className="absolute bottom-6 right-6 z-50">
          <button
            onClick={handlePatientTransfer}
            className="px-6 py-4 bg-blue-600 text-white font-semibold rounded-lg shadow-xl hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-transform hover:scale-[1.02]"
          >
            환자 탑승 완료 (이송 시작)
          </button>
        </div>
      </div>
    </AmbulanceLayout>
  );
}
