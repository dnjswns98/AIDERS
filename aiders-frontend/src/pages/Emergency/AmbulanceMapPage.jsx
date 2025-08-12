// src/pages/Emergency/AmbulanceMapPage.jsx
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import MapDisplay from '../../components/Emergency/MapDisplay';
import WebRtcCall from '../../components/webRTC/WebRtcCall';
import AmbulanceLayout from '../../components/Emergency/Layout/AmbulanceLayout';
import useEmergencyStore from '../../store/useEmergencyStore';
import { useAuthStore } from '../../store/useAuthStore';
import useLiveAmbulanceLocation from '../../hooks/useLiveAmbulanceLocation';
import { 
  requestHospitalMatching, 
  getMatchedHospital
} from '../../api/api';

export default function AmbulanceMapPage() {
  const location = useLocation();
  const navigate = useNavigate();

  const { user } = useAuthStore();
  const ambulanceId = user?.userId;

  const {
    isConnected: wsConnected,
    connectionStatus: wsStatus,
    ambulanceLocation,
    hospitalDistanceInfo,
    connectionError: wsError,
    forceReconnect: wsReconnect
  } = useLiveAmbulanceLocation(ambulanceId);

  const {
    selectedAmbulance,
    matchedHospitals,
    hospitalMatchingStatus,
    isHospitalMatching,
    checkHospitalMatchingStatus,
    completeTransport, // 🔥 추가: 이송 완료 함수
    transferToHospital,
  } = useEmergencyStore();

  const [isCalling, setIsCalling] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const [directHospitalInfo, setDirectHospitalInfo] = useState(null);
  const [isLoadingDirectHospital, setIsLoadingDirectHospital] = useState(false);

  const { matchedHospital: urlMatchedHospital, patientInfo: urlPatientInfo } = location.state || {};

  const finalMatchedHospital = useMemo(() => {
    return matchedHospitals[0] || urlMatchedHospital || null;
  }, [matchedHospitals, urlMatchedHospital]);

  const finalPatientInfo = useMemo(() => {
    return selectedAmbulance?.patientInfo || urlPatientInfo || {};
  }, [selectedAmbulance?.patientInfo, urlPatientInfo]);

  const finalPatientDetails = useMemo(() => {
    return selectedAmbulance?.patientDetails || {};
  }, [selectedAmbulance?.patientDetails]);

  const fetchDirectHospitalInfo = useCallback(async () => {
    if (!ambulanceId) {
      return;
    }

    setIsLoadingDirectHospital(true);

    try {
      const matchedInfo = await getMatchedHospital(ambulanceId);

      if (matchedInfo && matchedInfo.latitude && matchedInfo.longitude) {
        const hospitalData = {
          id: matchedInfo.hospitalId || matchedInfo.id,
          hospitalId: matchedInfo.hospitalId || matchedInfo.id,
          name: matchedInfo.name || '매칭된 병원',
          address: matchedInfo.address || '',
          latitude: matchedInfo.latitude,
          longitude: matchedInfo.longitude,
          department: matchedInfo.department || ''
        };

        setDirectHospitalInfo(hospitalData);
      } else {
        setDirectHospitalInfo(null);
      }

    } catch (error) {
      console.error(`❌ [직접조회] 병원 정보 직접 조회 실패:`, error);
      setDirectHospitalInfo(null);
    } finally {
      setIsLoadingDirectHospital(false);
    }
  }, [ambulanceId]);

  

  const safeHospital = useMemo(() => {
    if (directHospitalInfo) {
      return directHospitalInfo;
    }

    if (finalMatchedHospital) {
      return {
        ...finalMatchedHospital,
        latitude: finalMatchedHospital.latitude || 37.566826,
        longitude: finalMatchedHospital.longitude || 126.9786567
      };
    }
    
    return { 
      latitude: 37.566826, 
      longitude: 126.9786567, 
      name: '매칭된 병원 없음', 
      address: '' 
    };
  }, [directHospitalInfo, finalMatchedHospital]);

  const hasRealCoordinates = useMemo(() => {
    if (!safeHospital) return false;
    
    const lat = safeHospital.latitude;
    const lng = safeHospital.longitude;
    
    return !(
      (lat === 37.566826 && lng === 126.9786567) ||
      (Math.abs(lat - 37.566826) < 0.001 && Math.abs(lng - 126.9786567) < 0.001)
    );
  }, [safeHospital]);

  const handleModifyPatientInfo = useCallback(() => {
    if (!selectedAmbulance) return;
    navigate('/emergency/patient-input', { 
      state: { 
        isEditMode: true, 
        formData: selectedAmbulance.patientInfo 
      } 
    });
  }, [selectedAmbulance, navigate]);

  const handleStartCall = useCallback(() => setIsCalling(true), []);
  const handleEndCall = useCallback(() => setIsCalling(false), []);
  const handleBackToDashboard = useCallback(() => navigate('/emergency/ambulance-dashboard'), [navigate]);
  const toggleSidebar = useCallback(() => setSidebarCollapsed(prev => !prev), []);

  const handleRefreshHospitalInfo = useCallback(async () => {
    if (!ambulanceId) {
      alert('ambulanceId가 없습니다.');
      return;
    }

    await fetchDirectHospitalInfo();
  }, [ambulanceId, fetchDirectHospitalInfo]);

  const handlePatientTransfer = async () => {
    if (window.confirm("환자 탑승 및 정보 입력을 시작하시겠습니까? 구급차 상태가 '이송중'으로 변경됩니다.")) {
      await transferToHospital();
      navigate('/emergency/patient-input', { state: { isEditMode: false } });
    }
  };

  const handleRetryHospitalMatching = useCallback(async () => {
    if (!ambulanceId) return;
    
    if (!selectedAmbulance?.patientDetails?.ktasLevel || 
        !selectedAmbulance?.patientDetails?.department) {
      alert("환자의 KTAS와 진료과목 정보가 필요합니다.");
      navigate("/emergency/patient-input");
      return;
    }

    try {
      if (!ambulanceLocation?.latitude || !ambulanceLocation?.longitude) {
        throw new Error("구급차 위치 정보를 가져올 수 없습니다.");
      }

      const matchingRequestData = {
        ambulanceId: ambulanceId,
        latitude: ambulanceLocation.latitude,
        longitude: ambulanceLocation.longitude,
      };

      const matchingResult = await requestHospitalMatching(matchingRequestData);
      
      if (matchingResult) {
        
        if (matchingResult.latitude && matchingResult.longitude) {
          const hospitalData = {
            id: matchingResult.hospitalId,
            hospitalId: matchingResult.hospitalId,
            name: matchingResult.name,
            address: matchingResult.address || '',
            latitude: matchingResult.latitude,
            longitude: matchingResult.longitude,
            department: matchingResult.department || ''
          };
          
          setDirectHospitalInfo(hospitalData);
        }

        await checkHospitalMatchingStatus(ambulanceId);
      }
      
    } catch (error) {
      console.error("❌ 병원 재매칭 실패:", error);
      alert("병원 재매칭에 실패했습니다: " + error.message);
    }
  }, [ambulanceId, selectedAmbulance?.patientDetails, ambulanceLocation, navigate, checkHospitalMatchingStatus]);

  

  // 🔥 추가: 이송 완료 핸들러
  const handleCompleteTransport = useCallback(async () => {
    if (window.confirm("환자 인계가 완료되었습니까? 이송이 종료되고 대기 상태로 돌아갑니다.")) {
      try {
        await completeTransport();
        await navigate('/emergency');
      } catch (error) {
        console.error('이송 완료 실패:', error);
        alert('이송 완료 처리 중 오류가 발생했습니다.');
      }
    }
  }, [completeTransport, navigate]);

  const currentAmbulanceStatus = selectedAmbulance?.status?.toLowerCase();

  if (currentAmbulanceStatus === 'dispatch') {
    // '출동 중' 상태일 때는 지도와 기본 컨트롤을 표시합니다.
    // 병원 매칭 정보는 아직 필요하지 않습니다.
  } else if (isLoadingDirectHospital) {
    return (
      <AmbulanceLayout>
        <div className="bg-white p-8 rounded-lg shadow-md text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h1 className="text-xl font-bold mb-2">병원 정보 조회 중...</h1>
          <p className="text-gray-600 mb-2">
            구급차 대시보드와 동일한 방식으로 실제 좌표 정보를 가져오고 있습니다.
          </p>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-4">
            <p className="text-xs text-blue-700">
              📞 getMatchedHospital API 직접 호출 중...<br/>
              🔍 대시보드 방식으로 실제 병원 좌표 조회
            </p>
          </div>
        </div>
      </AmbulanceLayout>
    );
  } else if (currentAmbulanceStatus === 'transfer' && !finalMatchedHospital && !directHospitalInfo) {
    // '이송 중' 상태인데 병원이 매칭되지 않았을 때만 이 메시지를 표시합니다.
    return (
      <AmbulanceLayout>
        <div className="bg-white p-8 rounded-lg shadow-md text-center">
          <h1 className="text-2xl font-bold mb-4 text-red-600">매칭된 병원 정보가 없습니다.</h1>
          
          {isHospitalMatching ? (
            <div className="mb-6">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-3"></div>
              <p className="text-blue-600 mb-2">현재 병원 매칭이 진행 중입니다...</p>
              <p className="text-xs text-gray-500">완료되면 자동으로 실제 좌표 정보를 조회합니다.</p>
            </div>
          ) : (
            <div className="mb-6">
              <p className="text-gray-600 mb-2">환자 정보를 입력하고 병원 매칭을 먼저 진행해주세요.</p>
            </div>
          )}
          
          <div className="space-y-3">
            <button
              onClick={handleBackToDashboard}
              className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-6 rounded-lg transition-colors duration-200 block w-full"
            >
              🚑 구급차 대시보드로 돌아가기
            </button>
            
            {(!selectedAmbulance?.patientDetails?.ktasLevel || 
              !selectedAmbulance?.patientDetails?.department) && (
              <button
                onClick={() => navigate('/emergency/patient-input')}
                className="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-6 rounded-lg transition-colors duration-200 block w-full"
              >
                📝 환자 정보 입력하기
              </button>
            )}
            
            <button
              onClick={handleRetryHospitalMatching}
              className="bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2 px-6 rounded-lg transition-colors duration-200 block w-full"
            >
              🔄 병원 매칭 재시도 (대시보드 방식)
            </button>
          </div>
        </div>
      </AmbulanceLayout>
    );
  }

  return (
    <AmbulanceLayout>
      <div className="relative h-screen flex bg-gray-100 overflow-hidden">
        
        <div className={`flex-1 relative transition-all duration-300 ${
          sidebarCollapsed ? 'mr-16' : 'mr-96'
        }`}>
          
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
                  
                  {directHospitalInfo && hasRealCoordinates ? (
                    <p className="text-xs text-green-600">
                      ✅ 실제 병원 좌표 ({safeHospital.latitude.toFixed(4)}, {safeHospital.longitude.toFixed(4)})
                      <span className="ml-2 text-green-500 font-semibold">대시보드 방식 조회</span>
                    </p>
                  ) : directHospitalInfo ? (
                    <p className="text-xs text-orange-600">
                      ⚠️ 기본 위치 사용 (좌표 정보 부족)
                    </p>
                  ) : (
                    <p className="text-xs text-gray-500">
                      스토어 데이터 사용 중...
                      <button
                        onClick={handleRefreshHospitalInfo}
                        className="ml-2 text-blue-600 hover:text-blue-800 underline"
                        disabled={isLoadingDirectHospital}
                      >
                        직접 조회하기
                      </button>
                    </p>
                  )}
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="flex gap-2">
                  {hospitalDistanceInfo && (
                    <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                      거리: {(hospitalDistanceInfo.distance / 1000).toFixed(2)}km
                    </span>
                  )}
                  
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    wsConnected ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-800'
                  }`}>
                    WebSocket: {wsConnected ? '연결됨' : '끊어짐'}
                  </span>
                  
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    directHospitalInfo ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {directHospitalInfo ? '📍 직접조회' : '📍 스토어'}
                  </span>
                  
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

          <div className="h-full w-full">
            <MapDisplay 
              hospital={safeHospital}
              ambulanceLocation={ambulanceLocation}
              distanceInfo={hospitalDistanceInfo}
              isFullScreen={true}
              showControls={true}
              zoom={15}
            />
          </div>

          <div className="absolute top-20 left-4 bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-3 shadow-lg z-20">
            <div className="flex items-center gap-2 text-green-700 mb-2">
              <span className="text-green-600">✅</span>
              <span className="font-semibold text-sm">구급차 실시간 추적 중</span>
            </div>
            
            <div className="text-xs space-y-1">
              <p className="text-green-600">
                환자: {finalPatientInfo.name || "미입력"} | KTAS: {finalPatientDetails.ktasLevel || "미입력"}
              </p>
              
              {ambulanceLocation && (
                <p className="text-blue-600">
                  구급차: {ambulanceLocation.latitude.toFixed(4)}, {ambulanceLocation.longitude.toFixed(4)}
                </p>
              )}
              
              {directHospitalInfo && hasRealCoordinates ? (
                <p className="text-green-600">
                  병원 실제위치: {safeHospital.latitude.toFixed(4)}, {safeHospital.longitude.toFixed(4)}
                  <span className="ml-2 text-green-500 font-semibold">직접조회완료</span>
                </p>
              ) : (
                <p className="text-orange-600">
                  병원 위치: {safeHospital.latitude.toFixed(4)}, {safeHospital.longitude.toFixed(4)}
                  <span className="ml-2 text-orange-500">{directHospitalInfo ? '좌표부족' : '스토어사용'}</span>
                </p>
              )}
              
              {hospitalDistanceInfo && (
                <p className="text-purple-600">
                  실시간 거리: {(hospitalDistanceInfo.distance / 1000).toFixed(2)}km 
                  <span className="ml-1 text-gray-500">
                    ({new Date(hospitalDistanceInfo.timestamp).toLocaleTimeString()})
                  </span>
                </p>
              )}
            </div>
          </div>

          {wsError && (
            <div className="absolute top-36 left-4 bg-red-50 border border-red-200 rounded-lg p-3 shadow-lg z-20">
              <div className="flex items-center gap-2 text-red-700 mb-2">
                <span className="text-red-600">❌</span>
                <span className="font-semibold text-sm">연결 오류</span>
              </div>
              <p className="text-xs text-red-600 mb-2">{wsError}</p>
              <button
                onClick={wsReconnect}
                className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded text-xs"
              >
                🔄 재연결
              </button>
            </div>
          )}
        </div>

        <div className={`fixed top-0 right-0 h-full bg-white shadow-xl border-l border-gray-200 transition-all duration-300 z-20 ${
          sidebarCollapsed ? 'w-16' : 'w-96'
        }`}>
          
          {sidebarCollapsed ? (
            <div className="flex flex-col items-center p-4 space-y-4">
              <button
                onClick={toggleSidebar}
                className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-lg transition-colors duration-200"
                title="정보 패널 열기"
              >
                →
              </button>
              
              <div className="flex flex-col items-center space-y-3 text-gray-500">
                <div className="p-2 bg-gray-100 rounded-lg" title="환자 정보">👤</div>
                <div className="p-2 bg-gray-100 rounded-lg" title="병원 정보">🏥</div>
                <div className="p-2 bg-gray-100 rounded-lg" title="화상 통화">📞</div>
                <div className="p-2 bg-gray-100 rounded-lg" title="실시간 추적">🚑</div>
                <div className={`p-2 rounded-lg ${
                  directHospitalInfo ? 'bg-blue-100' : 'bg-gray-100'
                }`} title="데이터 소스">📍</div>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col">
              
              <div className="border-b border-gray-200 p-4">
                <div className="flex justify-between items-center">
                  <h2 className="text-lg font-bold text-gray-800">실시간 추적 정보</h2>
                  <button
                    onClick={toggleSidebar}
                    className="bg-gray-500 hover:bg-gray-600 text-white p-1 rounded text-xs"
                    title="정보 패널 접기"
                  >
                    ←
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto">
                
                <div className="p-4 border-b border-gray-100">
                  <h3 className="text-md font-semibold text-gray-800 mb-3">🚑 실시간 추적</h3>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">WebSocket 연결:</span>
                      <span className={`px-2 py-1 rounded text-xs ${
                        wsConnected ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-800'
                      }`}>
                        {wsConnected ? '연결됨' : '끊어짐'}
                      </span>
                    </div>
                    
                    {ambulanceLocation && (
                      <>
                        <div className="flex justify-between">
                          <span className="font-medium">구급차 위치:</span>
                          <span className="text-blue-600">추적 중</span>
                        </div>
                        <div className="text-xs text-gray-500 bg-blue-50 p-2 rounded">
                          위도: {ambulanceLocation.latitude.toFixed(6)}<br/>
                          경도: {ambulanceLocation.longitude.toFixed(6)}<br/>
                          업데이트: {new Date(ambulanceLocation.timestamp).toLocaleTimeString()}
                        </div>
                      </>
                    )}
                    
                    {hospitalDistanceInfo && (
                      <>
                        <div className="flex justify-between">
                          <span className="font-medium">병원까지 거리:</span>
                          <span className="text-green-600 font-bold">
                            {(hospitalDistanceInfo.distance / 1000).toFixed(2)} km
                          </span>
                        </div>
                        <div className="text-xs text-gray-500">
                          실시간 계산: {new Date(hospitalDistanceInfo.timestamp).toLocaleTimeString()}
                        </div>
                      </>
                    )}
                  </div>
                  
                  {!wsConnected && (
                    <button
                      onClick={wsReconnect}
                      className="mt-3 w-full bg-red-500 hover:bg-red-600 text-white text-sm font-semibold py-2 px-4 rounded-lg transition-colors"
                    >
                      🔄 WebSocket 재연결
                    </button>
                  )}
                </div>

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

                <div className="p-4 border-b border-gray-100">
                  <h3 className="text-md font-semibold text-gray-800 mb-3">🏥 매칭 병원</h3>
                  
                  <div className="space-y-2 text-sm text-gray-600">
                    <div>
                      <span className="font-medium">병원명:</span>
                      <p className="text-blue-600 font-semibold">{safeHospital.name}</p>
                    </div>
                    <div>
                      <span className="font-medium">주소:</span>
                      <p className="text-gray-700 text-xs">{safeHospital.address}</p>
                    </div>
                    
                    <div className="mt-3">
                      {directHospitalInfo && hasRealCoordinates ? (
                        <div className="text-xs text-green-600 bg-green-50 p-3 rounded">
                          <p className="font-semibold text-green-700 mb-1">✅ 대시보드 방식 조회 성공!</p>
                          <p>📍 실제 좌표: {safeHospital.latitude.toFixed(6)}, {safeHospital.longitude.toFixed(6)}</p>
                          <p className="text-green-500 mt-1">getMatchedHospital API 직접 호출</p>
                        </div>
                      ) : directHospitalInfo ? (
                        <div className="text-xs text-orange-600 bg-orange-50 p-3 rounded">
                          <p className="font-semibold text-orange-700 mb-1">⚠️ 좌표 정보 부족</p>
                          <p>📍 기본 좌표: {safeHospital.latitude.toFixed(6)}, {safeHospital.longitude.toFixed(6)}</p>
                          <p className="text-orange-500 mt-1">API 조회했으나 좌표 없음</p>
                        </div>
                      ) : (
                        <div className="text-xs text-gray-600 bg-gray-50 p-3 rounded">
                          <p className="font-semibold text-gray-700 mb-1">📍 스토어 데이터 사용</p>
                          <p>좌표: {safeHospital.latitude.toFixed(6)}, {safeHospital.longitude.toFixed(6)}</p>
                          <p className="text-gray-500 mt-1">대시보드 방식 조회 대기</p>
                        </div>
                      )}
                    </div>
                    
                    {hospitalDistanceInfo && (
                      <div className="text-xs text-purple-600 bg-purple-50 p-2 rounded mt-2">
                        🚑 실시간 거리: {(hospitalDistanceInfo.distance / 1000).toFixed(2)}km
                      </div>
                    )}
                  </div>
                </div>

                <div className="p-4 border-b border-gray-100">
                  <h3 className="text-md font-semibold text-gray-800 mb-3">🚑 환자 탑승</h3>
                  <button
                    onClick={handlePatientTransfer}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200"
                  >
                    환자 정보 입력 시작
                  </button>
                  <p className="text-xs text-gray-500 mt-2 text-center">
                    환자 탑승 후 이 버튼을 눌러 정보 입력을 시작하고 상태를 '이송중'으로 변경하세요.
                  </p>
                </div>

                <div className="p-4 border-t border-gray-100 flex flex-col gap-2">
                   {/* 🔥 추가: 이송 완료 버튼 */}
                  <button
                    onClick={handleCompleteTransport}
                    className="w-full bg-green-600 text-white text-sm font-semibold py-2 px-4 rounded-lg transition-colors duration-200"
                  >
                    🏥 이송 완료
                  </button>
                  <h3 className="text-md font-semibold text-gray-800 mb-3">📞 화상 통화</h3>
                  
                  {isCalling ? (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                      <div className="flex items-center gap-2 text-green-700 mb-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        <span className="font-semibold text-sm">통화 중</span>
                      </div>
                      
                      <div className="bg-gray-800 rounded-lg h-40 mb-3 flex items-center justify-center">
                        <WebRtcCall
                          sessionId={ambulanceId || `session-${Date.now()}`}
                          ambulanceId={ambulanceId || 'unknown'}
                          onLeave={handleEndCall}
                          patientName={finalPatientInfo.name || "환자"}
                          ktas={finalPatientDetails.ktasLevel || ""}
                          hospitalId={safeHospital.id || safeHospital.hospitalId || "241"}
                          hospitalName={safeHospital.name}
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
      </div>
    </AmbulanceLayout>
  );
}