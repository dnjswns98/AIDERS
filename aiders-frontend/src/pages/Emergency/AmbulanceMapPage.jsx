import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import MapDisplay from '../../components/Emergency/MapDisplay';
import WebRtcCall from '../../components/webRTC/WebRtcCall';
import AmbulanceLayout from '../../components/Emergency/Layout/AmbulanceLayout';
import useEmergencyStore from '../../store/useEmergencyStore';
import { useAuthStore } from '../../store/useAuthStore';

export default function AmbulanceMapPage() {
  const location = useLocation();
  const navigate = useNavigate();
  
  // 🔥 useEmergencyStore에서 직접 데이터 가져오기
  const { 
    selectedAmbulance,
    matchedHospitals,
    hospitalMatchingStatus,
    isHospitalMatching,
    checkHospitalMatchingStatus 
  } = useEmergencyStore();
  
  const { user } = useAuthStore();
  
  const [isCalling, setIsCalling] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false); // 🔥 사이드바 접기/펴기

  // 🔥 URL state에서도 데이터 확인 (fallback)
  const { matchedHospital: urlMatchedHospital, patientInfo: urlPatientInfo } = location.state || {};

  useEffect(() => {
    console.log("=== AmbulanceMapPage 데이터 확인 (지도 중심 레이아웃) ===");
    console.log("🏪 useEmergencyStore 데이터:");
    console.log("  selectedAmbulance:", selectedAmbulance);
    console.log("  matchedHospitals:", matchedHospitals);
    console.log("  hospitalMatchingStatus:", hospitalMatchingStatus);
    
    console.log("🔗 URL state 데이터:");
    console.log("  urlMatchedHospital:", urlMatchedHospital);
    console.log("  urlPatientInfo:", urlPatientInfo);
    
    // 🔥 스토어에 매칭된 병원이 없으면 상태 다시 확인
    if (matchedHospitals.length === 0 && user?.userId) {
      console.log("🔄 매칭된 병원이 없어서 상태 재확인 중...");
      checkHospitalMatchingStatus(user.userId).catch(error => {
        console.warn("매칭 상태 확인 실패:", error);
      });
    }
  }, [selectedAmbulance, matchedHospitals, hospitalMatchingStatus, urlMatchedHospital, urlPatientInfo, user?.userId, checkHospitalMatchingStatus]);

  const handleModifyPatientInfo = () => {
    navigate('/emergency/patient-input', { 
      state: { 
        isEditMode: true,
        formData: finalPatientInfo 
      } 
    });
  };

  const handleStartCall = () => {
    setIsCalling(true);
  };

  const handleEndCall = () => {
    setIsCalling(false);
  };

  const handleBackToDashboard = () => {
    navigate('/emergency/ambulance-dashboard');
  };

  // 🔥 사이드바 토글
  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  // 🔥 데이터 우선순위: 스토어 → URL state → 기본값
  const finalMatchedHospital = matchedHospitals[0] || urlMatchedHospital || null;
  const finalPatientInfo = selectedAmbulance?.patientInfo || urlPatientInfo || {};
  const finalPatientDetails = selectedAmbulance?.patientDetails || {};

  console.log("🎯 최종 사용할 데이터:");
  console.log("  finalMatchedHospital:", finalMatchedHospital);
  console.log("  finalPatientInfo:", finalPatientInfo);
  console.log("  finalPatientDetails:", finalPatientDetails);

  // 🔥 매칭된 병원이 없는 경우 처리
  if (!finalMatchedHospital) {
    return (
      <AmbulanceLayout>
        <div className="bg-white p-8 rounded-lg shadow-md text-center">
          <h1 className="text-2xl font-bold mb-4 text-red-600">매칭된 병원 정보가 없습니다.</h1>
          
          {isHospitalMatching ? (
            <div className="mb-6">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-3"></div>
              <p className="text-blue-600 mb-2">현재 병원 매칭이 진행 중입니다...</p>
              <p className="text-xs text-gray-500">잠시만 기다려주세요.</p>
            </div>
          ) : hospitalMatchingStatus === 'error' ? (
            <div className="mb-6">
              <p className="text-red-600 mb-2">병원 매칭에 실패했습니다.</p>
              <p className="text-gray-600 mb-4">다시 시도하거나 환자 정보를 확인해주세요.</p>
            </div>
          ) : (
            <div className="mb-6">
              <p className="text-gray-600 mb-2">환자 정보를 입력하고 병원 매칭을 먼저 진행해주세요.</p>
              <p className="text-xs text-gray-400 mb-4">
                대시보드 → 환자 정보 입력 → 병원 매칭 → 지도 확인 순서로 진행됩니다.
              </p>
            </div>
          )}

          <div className="space-y-3">
            <button
              onClick={handleBackToDashboard}
              className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-6 rounded-lg transition-colors duration-200 block w-full"
            >
              🚑 구급차 대시보드로 돌아가기
            </button>
            
            {(!selectedAmbulance?.patientDetails?.ktasLevel || !selectedAmbulance?.patientDetails?.department) && (
              <button
                onClick={() => navigate('/emergency/patient-input')}
                className="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-6 rounded-lg transition-colors duration-200 block w-full"
              >
                📝 환자 정보 입력하기
              </button>
            )}
          </div>
        </div>
      </AmbulanceLayout>
    );
  }

  // 🔥 핵심 수정: 좌표 정보 안전 처리
  const getHospitalCoordinates = (hospital) => {
    const lat = hospital.latitude || hospital.lat || null;
    const lng = hospital.longitude || hospital.lng || hospital.lon || null;
    
    console.log("좌표 추출 결과:", { lat, lng, hospital });
    
    // 좌표가 없으면 기본값 사용 (서울시청)
    if (!lat || !lng) {
      console.warn("⚠️ 병원 좌표 정보가 없어서 기본 좌표 사용:", {
        병원명: hospital.name,
        원본데이터: hospital,
        기본좌표: "서울시청 (37.5665, 126.978)"
      });
      
      return {
        latitude: 37.5665,  // 서울시청 위도
        longitude: 126.978  // 서울시청 경도
      };
    }
    
    return { latitude: lat, longitude: lng };
  };

  // 🔥 안전한 병원 객체 생성
  const coordinates = getHospitalCoordinates(finalMatchedHospital);
  const safeHospital = {
    ...finalMatchedHospital,
    ...coordinates
  };

  console.log("🔥 MapDisplay에 전달할 최종 hospital 객체:", safeHospital);

  return (
    <AmbulanceLayout>
      {/* 🔥 완전히 새로운 레이아웃: 지도 중심 + 사이드바 */}
      <div className="relative h-screen flex">
        {/* 🔥 메인 지도 영역 - 화면의 대부분 차지 */}
        <div className={`flex-1 relative transition-all duration-300 ${sidebarCollapsed ? 'mr-16' : 'mr-96'}`}>
          {/* 🔥 지도 상단 헤더 */}
          <div className="absolute top-0 left-0 right-0 z-10 bg-white bg-opacity-95 backdrop-blur-sm border-b border-gray-200 p-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-4">
                <button
                  onClick={handleBackToDashboard}
                  className="bg-gray-500 hover:bg-gray-600 text-white text-sm font-semibold py-2 px-3 rounded-lg transition-colors duration-200"
                >
                  ← 대시보드
                </button>
                <div>
                  <h1 className="text-xl font-bold text-gray-800">{safeHospital.name}</h1>
                  <p className="text-sm text-gray-600">📍 {safeHospital.address}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                {/* 🔥 병원 정보 배지들 */}
                <div className="flex gap-2">
                  {safeHospital.distance && (
                    <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                      거리: {safeHospital.distance}
                    </span>
                  )}
                  {safeHospital.eta && (
                    <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                      예상시간: {safeHospital.eta}
                    </span>
                  )}
                  {finalPatientDetails.department && (
                    <span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full">
                      {finalPatientDetails.department}
                    </span>
                  )}
                </div>
                
                <button
                  onClick={toggleSidebar}
                  className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-lg transition-colors duration-200"
                  title={sidebarCollapsed ? "정보 패널 열기" : "정보 패널 접기"}
                >
                  {sidebarCollapsed ? '📋' : '←'}
                </button>
              </div>
            </div>
          </div>

          {/* 🔥 메인 지도 영역 - 전체 화면 크기 */}
          <div className="h-full w-full bg-gray-100">
            {safeHospital.latitude && safeHospital.longitude ? (
              <MapDisplay 
                hospital={safeHospital}
                currentLocation={null}
                allHospitals={[safeHospital]}
                // 🔥 지도 전용 props (필요시 MapDisplay 컴포넌트에서 활용)
                isFullScreen={true}
                showControls={true}
                zoom={15} // 적절한 줌 레벨
              />
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-gray-500 bg-gray-100">
                <div className="text-6xl mb-4">🗺️</div>
                <h2 className="text-2xl font-bold mb-2">지도 정보를 불러올 수 없습니다</h2>
                <p className="text-center mb-4">병원 좌표 정보가 없습니다.</p>
                <div className="text-sm text-gray-400 bg-white p-3 rounded-lg">
                  <p>병원명: {safeHospital.name || 'null'}</p>
                  <p>위도: {safeHospital.latitude || 'null'}</p>
                  <p>경도: {safeHospital.longitude || 'null'}</p>
                </div>
                <button
                  onClick={() => {
                    console.log("🔧 지도 디버깅 정보:");
                    console.log("finalMatchedHospital:", finalMatchedHospital);
                    console.log("safeHospital:", safeHospital);
                    console.log("coordinates:", coordinates);
                  }}
                  className="mt-4 text-blue-500 hover:text-blue-700 underline"
                >
                  🔧 디버깅 정보 출력
                </button>
              </div>
            )}
          </div>

          {/* 🔥 지도 위 플로팅 상태 표시 */}
          <div className="absolute top-20 left-4 bg-green-50 border border-green-200 rounded-lg p-3 shadow-lg">
            <div className="flex items-center gap-2 text-green-700">
              <span className="text-green-600">✅</span>
              <span className="font-semibold text-sm">병원 매칭 완료</span>
            </div>
            <p className="text-xs text-green-600 mt-1">
              환자: {finalPatientInfo.name || "미입력"} | KTAS: {finalPatientDetails.ktasLevel || "미입력"}
            </p>
          </div>
        </div>

        {/* 🔥 우측 사이드바 - 환자 정보 + 화상 통화 */}
        <div className={`fixed top-0 right-0 h-full bg-white shadow-xl border-l border-gray-200 transition-all duration-300 z-20 ${
          sidebarCollapsed ? 'w-16' : 'w-96'
        }`}>
          
          {sidebarCollapsed ? (
            /* 🔥 접힌 상태 - 아이콘만 표시 */
            <div className="flex flex-col items-center p-4 space-y-4">
              <button
                onClick={toggleSidebar}
                className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-lg transition-colors duration-200"
                title="정보 패널 열기"
              >
                →
              </button>
              
              <div className="flex flex-col items-center space-y-3 text-gray-500">
                <div className="p-2 bg-gray-100 rounded-lg" title="환자 정보">
                  👤
                </div>
                <div className="p-2 bg-gray-100 rounded-lg" title="화상 통화">
                  📞
                </div>
                <div className="p-2 bg-gray-100 rounded-lg" title="병원 정보">
                  🏥
                </div>
              </div>
            </div>
          ) : (
            /* 🔥 펼친 상태 - 전체 정보 표시 */
            <div className="h-full flex flex-col">
              {/* 사이드바 헤더 */}
              <div className="border-b border-gray-200 p-4">
                <div className="flex justify-between items-center">
                  <h2 className="text-lg font-bold text-gray-800">환자 & 통화 정보</h2>
                  <button
                    onClick={toggleSidebar}
                    className="bg-gray-500 hover:bg-gray-600 text-white p-1 rounded text-xs"
                    title="정보 패널 접기"
                  >
                    ←
                  </button>
                </div>
              </div>

              {/* 스크롤 가능한 컨텐츠 영역 */}
              <div className="flex-1 overflow-y-auto">
                {/* 🔥 환자 정보 섹션 */}
                <div className="p-4 border-b border-gray-100">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="text-md font-semibold text-gray-800">👤 환자 정보</h3>
                    <button
                      onClick={handleModifyPatientInfo}
                      className="bg-blue-500 hover:bg-blue-600 text-white text-xs font-semibold py-1 px-2 rounded transition-colors duration-200"
                    >
                      수정
                    </button>
                  </div>
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex justify-between">
                      <span className="font-medium">이름:</span>
                      <span>{finalPatientInfo.name || "-"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">성별:</span>
                      <span>{finalPatientInfo.gender || "-"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">나이:</span>
                      <span>{finalPatientInfo.age || "-"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">증상:</span>
                      <span className="text-right">{finalPatientDetails.chiefComplaint || "-"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">중증도:</span>
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${
                        finalPatientDetails.ktasLevel?.includes('1') ? 'bg-red-100 text-red-700' :
                        finalPatientDetails.ktasLevel?.includes('2') ? 'bg-orange-100 text-orange-700' :
                        finalPatientDetails.ktasLevel?.includes('3') ? 'bg-yellow-100 text-yellow-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {finalPatientDetails.ktasLevel || "-"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">진료과:</span>
                      <span>{finalPatientDetails.department || "-"}</span>
                    </div>
                  </div>
                </div>

                {/* 🔥 병원 정보 섹션 */}
                <div className="p-4 border-b border-gray-100">
                  <h3 className="text-md font-semibold text-gray-800 mb-3">🏥 매칭 병원</h3>
                  <div className="space-y-2 text-sm text-gray-600">
                    <div>
                      <span className="font-medium">병원명:</span>
                      <p className="text-blue-600 font-semibold">{safeHospital.name}</p>
                    </div>
                    <div>
                      <span className="font-medium">주소:</span>
                      <p className="text-gray-700 text-xs leading-relaxed">{safeHospital.address}</p>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">거리:</span>
                      <span>{safeHospital.distance || "계산 중"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">예상시간:</span>
                      <span>{safeHospital.eta || "계산 중"}</span>
                    </div>
                    <div className="text-xs text-green-600 bg-green-50 p-2 rounded mt-2">
                      ✅ 백엔드 알고리즘으로 매칭된 최적 병원입니다.
                    </div>
                  </div>
                </div>

                {/* 🔥 화상 통화 섹션 */}
                <div className="p-4">
                  <h3 className="text-md font-semibold text-gray-800 mb-3">📞 화상 통화</h3>
                  
                  {isCalling ? (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                      <div className="flex items-center gap-2 text-green-700 mb-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        <span className="font-semibold text-sm">통화 중</span>
                      </div>
                      <p className="text-xs text-green-600 mb-3">
                        {safeHospital.name}과 화상 통화 중입니다.
                      </p>
                      
                      {/* 🔥 작은 화상 통화 영역 */}
                      <div className="bg-gray-800 rounded-lg h-40 mb-3 flex items-center justify-center">
                        <WebRtcCall
                          sessionId={user?.userId || `session-${Date.now()}`}
                          ambulanceId={user?.userId || 'unknown'}
                          onLeave={handleEndCall}
                          patientName={finalPatientInfo.name || "환자"}
                          ktas={finalPatientDetails.ktasLevel || ""}
                          hospitalId={safeHospital.id || safeHospital.hospitalId || "241"}
                          hospitalName={safeHospital.name}
                          // 🔥 작은 화면용 props
                          compact={true}
                        />
                      </div>
                      
                      <button
                        onClick={handleEndCall}
                        className="bg-red-500 hover:bg-red-600 text-white text-sm font-semibold py-2 px-4 rounded-lg transition-colors duration-200 w-full"
                      >
                        📞 통화 종료
                      </button>
                    </div>
                  ) : (
                    <div className="text-center">
                      <div className="bg-gray-100 rounded-lg h-32 flex items-center justify-center mb-3">
                        <div className="text-4xl mb-2">📞</div>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">
                        {safeHospital.name}과<br/>화상 통화를 시작하세요.
                      </p>
                      <button
                        onClick={handleStartCall}
                        className="bg-green-500 hover:bg-green-600 text-white text-sm font-semibold py-2 px-4 rounded-lg transition-colors duration-200 w-full"
                      >
                        📞 통화 시작
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 🔥 개발자 디버깅 패널 (개발 모드에서만) */}
        {import.meta.env.DEV && (
          <div className="fixed bottom-4 left-4 bg-black bg-opacity-90 text-white p-3 rounded-lg text-xs max-w-sm z-30">
            <div className="font-bold text-yellow-300 mb-2">🔧 지도 페이지 디버깅</div>
            <div className="space-y-1">
              <p><strong>🗺️ 지도 상태:</strong></p>
              <p>  병원 좌표: {safeHospital.latitude?.toFixed(4)}, {safeHospital.longitude?.toFixed(4)}</p>
              <p>  좌표 출처: {finalMatchedHospital.latitude ? 'API' : '기본값'}</p>
              
              <p><strong>📱 UI 상태:</strong></p>
              <p>  사이드바: {sidebarCollapsed ? '접힘' : '펼침'}</p>
              <p>  화상통화: {isCalling ? '진행중' : '대기'}</p>
              
              <p><strong>🏪 데이터 출처:</strong></p>
              <p>  {matchedHospitals.length > 0 ? 'useEmergencyStore' : 'URL state'}</p>
            </div>
          </div>
        )}
      </div>
    </AmbulanceLayout>
  );
}
