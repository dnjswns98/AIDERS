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

  // 🔥 인증 정보
  const { user } = useAuthStore();
  const ambulanceId = user?.userId;

  // 🔥 실시간 구급차 추적 훅
  const {
    isConnected: wsConnected,
    connectionStatus: wsStatus,
    ambulanceLocation,
    hospitalDistanceInfo,
    connectionError: wsError,
    forceReconnect: wsReconnect
  } = useLiveAmbulanceLocation(ambulanceId);

  // 🔥 응급 상황 스토어
  const {
    selectedAmbulance,
    matchedHospitals,
    hospitalMatchingStatus,
    isHospitalMatching,
    checkHospitalMatchingStatus,
  } = useEmergencyStore();

  // 🔥 UI 상태
  const [isCalling, setIsCalling] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // 🔥 병원 정보 상태 (단순화 - 대시보드와 동일)
  const [directHospitalInfo, setDirectHospitalInfo] = useState(null);
  const [isLoadingDirectHospital, setIsLoadingDirectHospital] = useState(false);

  // 🔥 URL state fallback
  const { matchedHospital: urlMatchedHospital, patientInfo: urlPatientInfo } = location.state || {};

  // 🔥 데이터 통합 처리 (memoized)
  const finalMatchedHospital = useMemo(() => {
    return matchedHospitals[0] || urlMatchedHospital || null;
  }, [matchedHospitals, urlMatchedHospital]);

  const finalPatientInfo = useMemo(() => {
    return selectedAmbulance?.patientInfo || urlPatientInfo || {};
  }, [selectedAmbulance?.patientInfo, urlPatientInfo]);

  const finalPatientDetails = useMemo(() => {
    return selectedAmbulance?.patientDetails || {};
  }, [selectedAmbulance?.patientDetails]);

  // 🔥 구급차 대시보드와 똑같은 방식으로 병원 정보 직접 조회
  const fetchDirectHospitalInfo = useCallback(async () => {
    if (!ambulanceId) {
      console.warn("⚠️ [직접조회] ambulanceId 없음");
      return;
    }

    console.log(`🔍 [직접조회] ${ambulanceId} 병원 정보 직접 조회 시작 (대시보드 방식)`);
    setIsLoadingDirectHospital(true);

    try {
      // 🔥 구급차 대시보드와 완전 동일한 방식
      const matchedInfo = await getMatchedHospital(ambulanceId);
      console.log(`📞 [직접조회] API 응답 (대시보드 방식):`, matchedInfo);

      if (matchedInfo && matchedInfo.latitude && matchedInfo.longitude) {
        const hospitalData = {
          id: matchedInfo.hospitalId || matchedInfo.id,
          hospitalId: matchedInfo.hospitalId || matchedInfo.id,
          name: matchedInfo.name || '매칭된 병원',
          address: matchedInfo.address || '',
          latitude: matchedInfo.latitude,   // 🔥 API에서 직접 받은 실제 좌표!
          longitude: matchedInfo.longitude, // 🔥 API에서 직접 받은 실제 좌표!
          department: matchedInfo.department || ''
        };

        console.log(`✅ [직접조회] 병원 정보 직접 조회 성공 (대시보드 방식)!`);
        console.log(`📍 [직접조회] 실제 좌표: ${hospitalData.latitude.toFixed(6)}, ${hospitalData.longitude.toFixed(6)}`);
        
        setDirectHospitalInfo(hospitalData);
      } else {
        console.warn(`⚠️ [직접조회] 좌표 정보 없음:`, matchedInfo);
        setDirectHospitalInfo(null);
      }

    } catch (error) {
      console.error(`❌ [직접조회] 병원 정보 직접 조회 실패:`, error);
      setDirectHospitalInfo(null);
    } finally {
      setIsLoadingDirectHospital(false);
    }
  }, [ambulanceId]);

  // 🔥 컴포넌트 로드 시 병원 정보 직접 조회 (구급차 대시보드 방식)
  useEffect(() => {
    if (ambulanceId) {
      console.log(`🎯 [직접조회] 컴포넌트 로드, 병원 정보 직접 조회 실행`);
      fetchDirectHospitalInfo();
    }
  }, [ambulanceId, fetchDirectHospitalInfo]);

  // 🔥 최종 병원 객체 (직접 조회한 정보 우선 사용)
  const safeHospital = useMemo(() => {
    // 🔥 직접 조회한 병원 정보가 있으면 최우선 사용 (대시보드 방식)
    if (directHospitalInfo) {
      console.log(`🏥 [최종병원] 직접 조회 데이터 사용 (대시보드 방식):`, directHospitalInfo.name);
      console.log(`🏥 [최종병원] 실제 좌표: ${directHospitalInfo.latitude.toFixed(6)}, ${directHospitalInfo.longitude.toFixed(6)}`);
      return directHospitalInfo;
    }

    // 🔥 fallback: 스토어 데이터 사용
    if (finalMatchedHospital) {
      console.log(`🏥 [최종병원] 스토어 데이터 fallback:`, finalMatchedHospital.name);
      return {
        ...finalMatchedHospital,
        latitude: finalMatchedHospital.latitude || 37.566826,
        longitude: finalMatchedHospital.longitude || 126.9786567
      };
    }
    
    console.log(`🏥 [최종병원] 기본 데이터 사용`);
    return { 
      latitude: 37.566826, 
      longitude: 126.9786567, 
      name: '매칭된 병원 없음', 
      address: '' 
    };
  }, [directHospitalInfo, finalMatchedHospital]);

  // 🔥 실제 좌표 사용 여부 확인 (단순화)
  const hasRealCoordinates = useMemo(() => {
    if (!safeHospital) return false;
    
    const lat = safeHospital.latitude;
    const lng = safeHospital.longitude;
    
    // 서울시청 좌표가 아니면 실제 좌표로 판단
    return !(
      (lat === 37.566826 && lng === 126.9786567) ||
      (Math.abs(lat - 37.566826) < 0.001 && Math.abs(lng - 126.9786567) < 0.001)
    );
  }, [safeHospital]);

  // 🔥 이벤트 핸들러들 (memoized)
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

  // 🔥 병원 정보 새로고침 (구급차 대시보드 방식)
  const handleRefreshHospitalInfo = useCallback(async () => {
    if (!ambulanceId) {
      alert('ambulanceId가 없습니다.');
      return;
    }

    console.log('🔄 [새로고침] 병원 정보 새로고침 시작 (대시보드 방식)');
    await fetchDirectHospitalInfo();
  }, [ambulanceId, fetchDirectHospitalInfo]);

  // 🔥 병원 재매칭 함수 (대시보드 방식)
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

      console.log("🔄 [재매칭] 요청 (대시보드 방식):", matchingRequestData);

      // 🔥 구급차 대시보드와 완전 동일한 방식
      const matchingResult = await requestHospitalMatching(matchingRequestData);
      
      if (matchingResult) {
        console.log("🔄 [재매칭] 결과 (대시보드 방식):", matchingResult);
        
        // 🔥 매칭 결과에서 바로 병원 정보 설정 (대시보드 방식)
        if (matchingResult.latitude && matchingResult.longitude) {
          const hospitalData = {
            id: matchingResult.hospitalId,
            hospitalId: matchingResult.hospitalId,
            name: matchingResult.name,
            address: matchingResult.address || '',
            latitude: matchingResult.latitude,   // 🔥 실제 좌표!
            longitude: matchingResult.longitude, // 🔥 실제 좌표!
            department: matchingResult.department || ''
          };
          
          console.log(`✅ [재매칭] 실제 좌표 포함 병원 정보 설정:`, hospitalData);
          setDirectHospitalInfo(hospitalData);
        }

        // 🔥 스토어도 업데이트
        await checkHospitalMatchingStatus(ambulanceId);
      }
      
      console.log("✅ 병원 재매칭 완료 (대시보드 방식)");
    } catch (error) {
      console.error("❌ 병원 재매칭 실패:", error);
      alert("병원 재매칭에 실패했습니다: " + error.message);
    }
  }, [ambulanceId, selectedAmbulance?.patientDetails, ambulanceLocation, navigate, checkHospitalMatchingStatus]);

  // 🔥 초기 매칭 상태 확인
  useEffect(() => {
    if (ambulanceId && matchedHospitals.length === 0) {
      console.log("🔍 [초기화] 매칭 상태 확인");
      checkHospitalMatchingStatus(ambulanceId).catch(console.warn);
    }
  }, [ambulanceId, matchedHospitals.length, checkHospitalMatchingStatus]);

  // 🔥 매칭된 병원이 없는 경우 안내 화면
  if (!finalMatchedHospital && !directHospitalInfo) {
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

  // 🔥 병원 정보 직접 조회 로딩 중 화면
  if (isLoadingDirectHospital) {
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
  }

  // 🔥 메인 지도 화면
  return (
    <AmbulanceLayout>
      <div className="relative h-screen flex bg-gray-100 overflow-hidden">
        
        {/* 🔥 지도 영역 */}
        <div className={`flex-1 relative transition-all duration-300 ${
          sidebarCollapsed ? 'mr-16' : 'mr-96'
        }`}>
          
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
                  
                  {/* 🔥 좌표 정보 표시 (대시보드 방식) */}
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
                {/* 🔥 실시간 정보 표시 */}
                <div className="flex gap-2">
                  {hospitalDistanceInfo && (
                    <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                      거리: {(hospitalDistanceInfo.distance / 1000).toFixed(2)}km
                    </span>
                  )}
                  
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    wsConnected ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    WebSocket: {wsConnected ? '연결됨' : '끊어짐'}
                  </span>
                  
                  {/* 🔥 데이터 소스 배지 */}
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

          {/* 🔥 실시간 구급차 추적 지도 */}
          <div className="h-full w-full">
            <MapDisplay 
              hospital={safeHospital}               // 🔥 대시보드 방식으로 조회한 병원 정보!
              ambulanceLocation={ambulanceLocation}
              distanceInfo={hospitalDistanceInfo}
              isFullScreen={true}
              showControls={true}
              zoom={15}
            />
          </div>

          {/* 🔥 실시간 상태 표시 */}
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
              
              {/* 🔥 병원 좌표 정보 (대시보드 방식) */}
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

          {/* 🔥 WebSocket 연결 상태 표시 */}
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

        {/* 🔥 사이드바 (대시보드 방식 병원 정보 표시) */}
        <div className={`fixed top-0 right-0 h-full bg-white shadow-xl border-l border-gray-200 transition-all duration-300 z-20 ${
          sidebarCollapsed ? 'w-16' : 'w-96'
        }`}>
          
          {sidebarCollapsed ? (
            // 접힌 상태
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
            // 펼쳐진 상태
            <div className="h-full flex flex-col">
              
              {/* 사이드바 헤더 */}
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

              {/* 스크롤 가능한 컨텐츠 */}
              <div className="flex-1 overflow-y-auto">
                
                {/* 🔥 실시간 구급차 추적 상태 */}
                <div className="p-4 border-b border-gray-100">
                  <h3 className="text-md font-semibold text-gray-800 mb-3">🚑 실시간 추적</h3>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">WebSocket 연결:</span>
                      <span className={`px-2 py-1 rounded text-xs ${
                        wsConnected ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
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
                  
                  {/* WebSocket 재연결 버튼 */}
                  {!wsConnected && (
                    <button
                      onClick={wsReconnect}
                      className="mt-3 w-full bg-red-500 hover:bg-red-600 text-white text-sm font-semibold py-2 px-4 rounded-lg transition-colors"
                    >
                      🔄 WebSocket 재연결
                    </button>
                  )}
                </div>

                {/* 🔥 환자 정보 */}
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

                {/* 🔥 병원 정보 (대시보드 방식) */}
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
                    
                    {/* 🔥 대시보드 방식 조회 상태 */}
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
                  
                  {/* 🔥 대시보드 방식 버튼들 */}
                  <div className="mt-3 space-y-2">
                    <button
                      onClick={handleRetryHospitalMatching}
                      className="w-full bg-green-500 hover:bg-green-600 text-white text-sm font-semibold py-2 px-4 rounded-lg transition-colors"
                      disabled={isLoadingDirectHospital}
                    >
                      🔄 병원 재매칭 (대시보드 방식)
                    </button>
                    
                    {!directHospitalInfo && (
                      <button
                        onClick={handleRefreshHospitalInfo}
                        className="w-full bg-blue-500 hover:bg-blue-600 text-white text-sm font-semibold py-2 px-4 rounded-lg transition-colors"
                        disabled={isLoadingDirectHospital}
                      >
                        🔍 병원 정보 직접 조회
                      </button>
                    )}
                  </div>
                </div>

                {/* 🔥 화상 통화 */}
                <div className="p-4">
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

        {/* 🔥 개발 모드 디버깅 패널 (대시보드 방식) */}
        {import.meta.env.DEV && (
          <div className="fixed bottom-4 left-4 bg-black bg-opacity-90 text-white p-3 rounded-lg text-xs max-w-sm z-30">
            <div className="font-bold text-yellow-300 mb-2">🔧 지도 페이지 디버깅 (대시보드 방식)</div>
            <div className="space-y-1">
              <p><strong>🏥 병원 정보 조회:</strong></p>
              <p>  스토어 병원: {finalMatchedHospital ? '✅' : '❌'} ({finalMatchedHospital?.name || 'N/A'})</p>
              <p>  직접 조회: {directHospitalInfo ? '✅' : '❌'} ({directHospitalInfo?.name || 'N/A'})</p>
              <p>  조회 진행 중: {isLoadingDirectHospital ? '✅' : '❌'}</p>
              <p>  실제 좌표 사용: {hasRealCoordinates ? '✅' : '❌'}</p>
              <p>  최종 좌표: {safeHospital.latitude.toFixed(4)}, {safeHospital.longitude.toFixed(4)}</p>
              
              <p><strong>🚑 구급차 추적:</strong></p>
              <p>  WebSocket: {wsConnected ? '✅' : '❌'}</p>
              <p>  구급차 위치: {ambulanceLocation ? '✅' : '❌'}</p>
              <p>  병원 거리: {hospitalDistanceInfo ? `${(hospitalDistanceInfo.distance / 1000).toFixed(2)}km` : '❌'}</p>
            </div>
            
            {/* 디버깅 버튼들 */}
            <div className="mt-3 space-y-1">
              <button
                onClick={() => {
                  console.log('🔧 대시보드 방식 상태 분석:', { 
                    finalMatchedHospital,
                    directHospitalInfo,
                    safeHospital,
                    isLoadingDirectHospital,
                    hasRealCoordinates,
                    ambulanceLocation, 
                    hospitalDistanceInfo
                  });
                }}
                className="bg-gray-600 hover:bg-gray-700 text-white px-2 py-1 rounded text-xs w-full"
              >
                🔍 대시보드 방식 상태 분석
              </button>
              
              <button
                onClick={handleRefreshHospitalInfo}
                className="bg-green-600 hover:bg-green-700 text-white px-2 py-1 rounded text-xs w-full"
                disabled={!ambulanceId || isLoadingDirectHospital}
              >
                🔄 병원 정보 직접 조회
              </button>
              
              {isLoadingDirectHospital && (
                <button
                  onClick={() => {
                    console.log('🚨 [디버깅] 직접 조회 로딩 해제');
                    setIsLoadingDirectHospital(false);
                  }}
                  className="bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded text-xs w-full"
                >
                  🚨 로딩 강제 해제
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </AmbulanceLayout>
  );
}
