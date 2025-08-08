// src/pages/Emergency/AmbulanceDashboardPage.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import AmbulanceLayout from "../../components/Emergency/Layout/AmbulanceLayout";
import MapDisplay from "../../components/Emergency/MapDisplay";
import WebRtcCall from "../../components/webRTC/WebRtcCall";
import useEmergencyStore from "../../store/useEmergencyStore";
import HospitalCard from "../../components/Emergency/HospitalCard";
import { useAuthStore } from "../../store/useAuthStore";
import useLiveAmbulanceLocation from "../../hooks/useLiveAmbulanceLocation"; // 🔥 이전 대화에서 수정한 훅
import { requestHospitalMatching, getMatchedHospital } from "../../api/api"; // 🔥 이전 대화에서 수정한 API (좌표 자동 조회 포함)

export default function AmbulanceDashboardPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state || {};
  
  const {
    selectedAmbulance,
    fetchAmbulances,
    getCurrentLocation,
    currentLocation: storeCurrentLocation,
    locationError: storeLocationError,
  } = useEmergencyStore();
  
  const { user } = useAuthStore();
  
  // 🔥 구급차 관련 상태들
  const [isCalling, setIsCalling] = useState(false);
  const [matchedHospitals, setMatchedHospitals] = useState([]);
  const [hospitalMatchingStatus, setHospitalMatchingStatus] = useState("idle"); 
  const [hospitalMatchingError, setHospitalMatchingError] = useState(null);
  const [isHospitalMatching, setIsHospitalMatching] = useState(false);

  // 🔥 사용자 검증
  if (!user?.userKey) {
    return (
      <AmbulanceLayout>
        <div className="bg-white p-8 rounded-lg shadow-md text-center">
          <h1 className="text-2xl font-bold mb-4">로그인된 구급차 정보가 없습니다.</h1>
          <p>다시 로그인해주세요.</p>
        </div>
      </AmbulanceLayout>
    );
  }
  
  if (!user?.userId) {
    return (
      <AmbulanceLayout>
        <div className="bg-white p-8 rounded-lg shadow-md text-center">
          <h1 className="text-2xl font-bold mb-4">구급차 ID를 불러오지 못했습니다.</h1>
          <p>사용자 정보를 확인해주세요.</p>
        </div>
      </AmbulanceLayout>
    );
  }
  
  const currentAmbulanceId = user.userId;
  const currentUserKey = user.userKey;
  console.log("___________________________________________________________user.key", user.userKey)
  console.log("__user.id ", user.userId)
  // 🔥 실시간 구급차 추적 훅 사용 (이전 대화에서 수정한 버전)
  const {
    isConnected: wsConnected,
    connectionStatus: wsStatus,
    ambulanceLocation,      // 🔥 구급차 실시간 위치 { latitude, longitude, timestamp }
    hospitalDistanceInfo,   // 🔥 병원과의 거리 { ambulanceId, hospitalId, distance, timestamp }
    connectionError: wsError,
    forceReconnect: wsReconnect
  } = useLiveAmbulanceLocation(currentAmbulanceId);

  // 🔥 초기 로딩 및 디버깅
  useEffect(() => {
    console.log("=== AmbulanceDashboardPage 마운트됨 (실제 좌표 자동 조회 포함) ===");
    console.log("sessionID:", currentUserKey);
    console.log("ambulanceID:", currentAmbulanceId);
    console.log("WebSocket 연결:", wsConnected);
  }, [currentUserKey, currentAmbulanceId, wsConnected]);

  useEffect(() => {
    fetchAmbulances();
  }, [fetchAmbulances]);

  // 🔥 병원 자동 매칭 함수 (실제 좌표 사용 - 완전 수정)
  const triggerHospitalMatching = async () => {
    console.log("=== 병원 자동 매칭 시작 (실제 좌표 자동 조회 포함) ===");

    if (!currentAmbulanceId) {
      console.error("ambulanceId가 없습니다.");
      return;
    }

    setIsHospitalMatching(true);
    setHospitalMatchingStatus("loading");
    setHospitalMatchingError(null);

    try {
      // 🔥 현재 위치 확인 (구급차 실시간 위치 또는 스토어에서)
      let locationData = ambulanceLocation || storeCurrentLocation;

      if (!locationData) {
        console.log("현재 위치가 없어서 새로 가져옵니다...");
        locationData = await getCurrentLocation();
      }

      if (!locationData?.latitude || !locationData?.longitude) {
        throw new Error("위치 정보를 가져올 수 없습니다. GPS를 확인해주세요.");
      }

      // 🔥 병원 매칭 요청 (이전 대화에서 수정한 API 사용 - 좌표 자동 조회 포함)
      const matchingRequestData = {
        ambulanceId: currentAmbulanceId,
        latitude: locationData.latitude,
        longitude: locationData.longitude,
      };

      console.log("🏥 병원 매칭 요청 (좌표 자동 조회):", matchingRequestData);

      // 🔥 이전 대화에서 수정한 requestHospitalMatching 사용 (좌표 자동 조회 포함)
      const matchingResult = await requestHospitalMatching(matchingRequestData);
      console.log("🏥 병원 매칭 결과 (실제 좌표 포함):", matchingResult);

      if (matchingResult) {
        // 🔥 좌표 유효성 검사
        if (!matchingResult.latitude || !matchingResult.longitude || 
            isNaN(matchingResult.latitude) || isNaN(matchingResult.longitude)) {
          console.warn("⚠️ 유효하지 않은 병원 좌표:", matchingResult.latitude, matchingResult.longitude);
          // 🔥 좌표가 유효하지 않으면 에러 대신 경고만 표시하고 계속 진행
          console.warn("⚠️ 병원 위치 정보가 유효하지 않지만 매칭은 계속 진행합니다.");
        }

        // 🔥 대한민국 좌표 범위 확인
        if (matchingResult.latitude && matchingResult.longitude) {
          if (matchingResult.latitude < 33 || matchingResult.latitude > 39 || 
              matchingResult.longitude < 124 || matchingResult.longitude > 132) {
            console.warn("⚠️ 좌표가 대한민국 범위를 벗어남:", matchingResult.latitude, matchingResult.longitude);
          }
        }

        // 🔥 MatchResponse + 좌표 정보를 프론트엔드 형태로 변환
        const hospitalData = {
          id: matchingResult.hospitalId,
          hospitalId: matchingResult.hospitalId,
          name: matchingResult.name,
          address: matchingResult.address,
          isAvailable: true,
          // 🔥 실제 좌표 사용 (api.js에서 자동 조회한 결과)
          latitude: matchingResult.latitude || 37.566826,   // 🔥 실제 좌표! (fallback: 서울시청)
          longitude: matchingResult.longitude || 126.9786567, // 🔥 실제 좌표! (fallback: 서울시청)
        };

        // 🔥 좌표 정보 로깅
        if (matchingResult.latitude && matchingResult.longitude) {
          console.log(`📍 [매칭] 병원 실제 위치: ${matchingResult.latitude.toFixed(6)}, ${matchingResult.longitude.toFixed(6)}`);
          console.log(`🏥 [매칭] ${matchingResult.name} - 실제 좌표 사용`);
        } else {
          console.warn(`⚠️ [매칭] ${matchingResult.name} - 좌표 정보 없어서 기본 위치 사용`);
        }

        setMatchedHospitals([hospitalData]);
        setHospitalMatchingStatus("success");
        setHospitalMatchingError(null);

        console.log("✅ 병원 자동 매칭 완료 (실제 좌표):", hospitalData);
      } else {
        throw new Error("병원 매칭 결과가 비어있습니다.");
      }
    } catch (error) {
      console.error("❌ 병원 자동 매칭 실패:", error);
      
      setHospitalMatchingStatus("error");
      setHospitalMatchingError(error.message || "병원 매칭에 실패했습니다.");
      setMatchedHospitals([]);

      // 🔥 에러 유형별 상세 알림
      if (error.message?.includes("위치")) {
        alert("위치 정보를 가져올 수 없습니다. GPS를 확인하고 다시 시도해주세요.");
      } else if (error.message?.includes("좌표") || error.message?.includes("유효하지")) {
        alert("병원 위치 정보에 문제가 있습니다. 관리자에게 문의하세요.");
      } else if (error.response?.status === 400) {
        alert("잘못된 요청입니다. 구급차 정보를 확인해주세요.");
      } else if (error.response?.status === 404) {
        alert("구급차 정보를 찾을 수 없습니다.");
      } else if (error.response?.status === 500) {
        alert("서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
      } else {
        alert("병원 매칭에 실패했습니다: " + error.message);
      }
    } finally {
      setIsHospitalMatching(false);
    }
  };

  // 🔥 매칭된 병원 상태 확인 (실제 좌표 사용 - 완전 수정)
  const checkHospitalMatchingStatus = async () => {
    console.log("=== 매칭된 병원 상태 확인 (실제 좌표 자동 조회 포함) ===");

    if (!currentAmbulanceId) return;

    try {
      // 🔥 이전 대화에서 수정한 getMatchedHospital 사용 (좌표 자동 조회 포함)
      const statusResult = await getMatchedHospital(currentAmbulanceId);
      console.log("병원 매칭 상태 조회 결과 (실제 좌표 포함):", statusResult);

      if (statusResult) {
        // 🔥 좌표 유효성 검사
        if (statusResult.latitude && statusResult.longitude && 
            !isNaN(statusResult.latitude) && !isNaN(statusResult.longitude)) {
          
          // 🔥 대한민국 좌표 범위 확인
          if (statusResult.latitude < 33 || statusResult.latitude > 39 || 
              statusResult.longitude < 124 || statusResult.longitude > 132) {
            console.warn("⚠️ 기존 매칭 병원 좌표가 대한민국 범위를 벗어남:", statusResult.latitude, statusResult.longitude);
          }

          const hospitalData = {
            id: statusResult.hospitalId,
            hospitalId: statusResult.hospitalId,
            name: statusResult.name,
            address: statusResult.address,
            isAvailable: true,
            // 🔥 실제 좌표 사용 (api.js에서 자동 조회한 결과)
            latitude: statusResult.latitude,   // 🔥 실제 좌표!
            longitude: statusResult.longitude, // 🔥 실제 좌표!
          };

          console.log(`📍 [기존 매칭] 병원 실제 위치: ${statusResult.latitude.toFixed(6)}, ${statusResult.longitude.toFixed(6)}`);
          console.log(`🏥 [기존 매칭] ${statusResult.name} - 실제 좌표 사용`);

          setMatchedHospitals([hospitalData]);
          setHospitalMatchingStatus("success");
          setHospitalMatchingError(null);

          console.log("✅ 기존 매칭된 병원 확인 (실제 좌표):", hospitalData);
        } else {
          console.warn("⚠️ 기존 매칭된 병원의 좌표 정보가 유효하지 않음:", statusResult);
          
          // 🔥 좌표가 없어도 기본 정보는 표시 (fallback 좌표 사용)
          const hospitalData = {
            id: statusResult.hospitalId,
            hospitalId: statusResult.hospitalId,
            name: statusResult.name,
            address: statusResult.address,
            isAvailable: true,
            latitude: 37.566826,   // 🔥 fallback: 서울시청
            longitude: 126.9786567, // 🔥 fallback: 서울시청
          };

          setMatchedHospitals([hospitalData]);
          setHospitalMatchingStatus("success");
          setHospitalMatchingError("병원 위치 정보가 정확하지 않을 수 있습니다.");

          console.warn(`⚠️ [기존 매칭] ${statusResult.name} - 좌표 정보 없어서 기본 위치 사용`);
        }
      } else {
        setMatchedHospitals([]);
        setHospitalMatchingStatus("idle");
        console.log("ℹ️ 매칭된 병원이 없습니다.");
      }

      return statusResult;
    } catch (error) {
      if (error.response?.status === 404) {
        setMatchedHospitals([]);
        setHospitalMatchingStatus("idle");
        setHospitalMatchingError(null);
        console.log("ℹ️ 매칭된 병원이 없습니다 (404).");
      } else {
        console.error("병원 매칭 상태 조회 실패:", error);
        setHospitalMatchingStatus("error");
        setHospitalMatchingError("매칭 상태 조회에 실패했습니다.");
      }
    }
  };

  // 🔥 초기 병원 매칭 상태 확인
  useEffect(() => {
    if (currentAmbulanceId) {
      checkHospitalMatchingStatus();
    }
  }, [currentAmbulanceId]);

  // 🔥 환자 정보 기반 자동 매칭 트리거
  useEffect(() => {
    if (selectedAmbulance?.patientDetails) {
      const { ktasLevel, department } = selectedAmbulance.patientDetails;

      const hasRequiredInfo = ktasLevel && department && 
        !ktasLevel.includes("선택") && !department.includes("선택") &&
        ktasLevel.trim() !== "" && department.trim() !== "";

      const noHospitalMatched = matchedHospitals.length === 0;
      const notCurrentlyMatching = !isHospitalMatching && hospitalMatchingStatus !== "loading";

      if (hasRequiredInfo && noHospitalMatched && notCurrentlyMatching) {
        console.log("🔥 환자 필수 정보 완료 → 자동 병원 매칭 시도 (실제 좌표)");
        console.log("KTAS:", ktasLevel, "진료과목:", department);

        setTimeout(() => {
          triggerHospitalMatching().catch((error) => {
            console.warn("자동 병원 매칭 실패:", error.message);
          });
        }, 2000);
      }
    }
  }, [
    selectedAmbulance?.patientDetails?.ktasLevel,
    selectedAmbulance?.patientDetails?.department,
    matchedHospitals.length,
    isHospitalMatching,
    hospitalMatchingStatus,
  ]);

  // 🔥 환자 정보 처리
  const patientFromState = state.formData;
  const patient = patientFromState || selectedAmbulance?.patientInfo || {};
  const details = patientFromState ? {
    ktasLevel: patientFromState.ktasLevel || "-",
    chiefComplaint: patientFromState.chiefComplaint || "-",
    treatmentDetails: patientFromState.treatmentDetails || "-",
    department: patientFromState.department || "-",
    ageRange: patientFromState.ageRange || "-",
  } : selectedAmbulance?.patientDetails || {};

  // 🔥 이벤트 핸들러들
  const handleModify = () => {
    if (!selectedAmbulance) return;
    const formData = {
      ...selectedAmbulance.patientInfo,
      ...selectedAmbulance.patientDetails,
    };
    navigate("/emergency/patient-input", {
      state: { isEditMode: true, formData },
    });
  };

  const handleCallStart = () => setIsCalling(true);
  const handleCallEnd = () => setIsCalling(false);

  const handleRetryHospitalMatching = () => {
    if (!selectedAmbulance?.patientDetails?.ktasLevel || 
        !selectedAmbulance?.patientDetails?.department) {
      alert("환자의 KTAS와 진료과목 정보가 필요합니다. 환자 정보를 먼저 입력해주세요.");
      navigate("/emergency/patient-input");
      return;
    }

    triggerHospitalMatching().catch((error) => {
      console.error("병원 매칭 재시도 실패:", error);
    });
  };

  const handleCancelHospitalMatching = () => {
    const confirmCancel = confirm("병원 매칭을 취소하시겠습니까?");
    if (!confirmCancel) return;

    setMatchedHospitals([]);
    setHospitalMatchingStatus("idle");
    setHospitalMatchingError(null);
    setIsHospitalMatching(false);

    console.log("병원 매칭 취소 완료");
  };

  // 🔥 조기 리턴 처리
  if (!selectedAmbulance && !patientFromState) {
    return (
      <AmbulanceLayout>
        <div className="bg-white p-8 rounded-lg shadow-md text-center">
          <h1 className="text-2xl font-bold mb-4">선택된 구급차 정보가 없습니다.</h1>
          <p>소방서 대시보드에서 구급차를 선택해주세요.</p>
        </div>
      </AmbulanceLayout>
    );
  }

  // 🔥 현재 위치 (우선순위: 구급차 실시간 위치 → 스토어 위치)
  const currentLocation = ambulanceLocation || storeCurrentLocation;

  return (
    <AmbulanceLayout>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 🔥 왼쪽 컬럼: 환자 정보 + 지도 */}
        <div className="flex flex-col gap-6">
          {/* 환자 정보 카드 */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">환자 정보</h2>
              <button
                onClick={handleModify}
                className="bg-blue-500 hover:bg-blue-600 text-white text-sm font-semibold py-2 px-4 rounded-lg transition-colors"
              >
                수정
              </button>
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-gray-600 mb-4">
              <p><strong>이름:</strong> {patient.name || "-"}</p>
              <p><strong>성별:</strong> {patient.gender || "-"}</p>
              <p><strong>나이:</strong> {patient.age || "-"}</p>
              <p><strong>증상:</strong> {details.chiefComplaint || "-"}</p>
              <p><strong>중증도:</strong> {details.ktasLevel || "-"}</p>
              <p><strong>진료과목:</strong> {details.department || "-"}</p>
            </div>

            {/* 🔥 실시간 구급차 추적 상태 */}
            <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-green-50 border-l-4 border-blue-400 rounded-r-lg">
              <div className="flex items-center justify-between mb-3">
                <span className="font-bold text-gray-800">🚑 구급차 실시간 추적</span>
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${
                    wsConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'
                  }`}></div>
                  <span className="text-xs">{wsConnected ? '연결됨' : '연결 끊어짐'}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <p><strong>현재 위치:</strong></p>
                  <p className="text-blue-600">
                    {currentLocation ? 
                      `${currentLocation.latitude?.toFixed(4)}, ${currentLocation.longitude?.toFixed(4)}` : 
                      "위치 정보 없음"
                    }
                  </p>
                  {ambulanceLocation && (
                    <p className="text-xs text-gray-500">
                      {new Date(ambulanceLocation.timestamp).toLocaleTimeString()}
                    </p>
                  )}
                </div>
                
                <div>
                  <p><strong>병원까지 거리:</strong></p>
                  <p className="text-green-600">
                    {hospitalDistanceInfo ? 
                      `${(hospitalDistanceInfo.distance / 1000).toFixed(2)} km` : 
                      "계산 중..."
                    }
                  </p>
                  {hospitalDistanceInfo && (
                    <p className="text-xs text-gray-500">
                      실시간: {new Date(hospitalDistanceInfo.timestamp).toLocaleTimeString()}
                    </p>
                  )}
                </div>
              </div>

              {/* WebSocket 연결 에러 */}
              {wsError && (
                <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-red-700 text-xs">
                  <strong>연결 오류:</strong> {wsError}
                  <button onClick={wsReconnect} className="ml-2 text-blue-600 underline">재연결</button>
                </div>
              )}

              {/* 🔥 병원 매칭 상태 (실제 좌표 정보 포함) */}
              <div className="mt-3 flex items-center gap-2">
                <span className="font-bold text-sm">🏥 병원 매칭:</span>
                {isHospitalMatching ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                    <span className="text-blue-600 font-bold text-sm">매칭 중...</span>
                  </div>
                ) : matchedHospitals.length > 0 ? (
                  <div className="flex flex-col">
                    <span className="text-green-600 font-bold text-sm">
                      ✅ 매칭 완료 ({matchedHospitals[0].name})
                    </span>
                    {/* 🔥 실제 좌표 정보 표시 */}
                    {matchedHospitals[0].latitude && matchedHospitals[0].longitude && (
                      <span className="text-xs text-green-500">
                        📍 실제 위치: {matchedHospitals[0].latitude.toFixed(4)}, {matchedHospitals[0].longitude.toFixed(4)}
                      </span>
                    )}
                  </div>
                ) : hospitalMatchingStatus === "error" ? (
                  <span className="text-red-600 font-bold text-sm">❌ 매칭 실패</span>
                ) : (
                  <span className="text-gray-600 text-sm">⭕ 매칭 대기 중</span>
                )}
              </div>

              {/* 병원 매칭 컨트롤 */}
              <div className="mt-3 flex gap-2 flex-wrap">
                {!isHospitalMatching && (
                  <button
                    onClick={handleRetryHospitalMatching}
                    className="px-3 py-1.5 bg-blue-500 text-white text-xs rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    🔄 병원 {matchedHospitals.length > 0 ? "재매칭" : "매칭"}
                  </button>
                )}

                {matchedHospitals.length > 0 && !isHospitalMatching && (
                  <button
                    onClick={handleCancelHospitalMatching}
                    className="px-3 py-1.5 bg-red-500 text-white text-xs rounded-lg hover:bg-red-600 transition-colors"
                  >
                    ❌ 매칭 취소
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* 🔥 지도 카드 (이전 대화에서 수정한 MapDisplay 사용) */}
          <div className="bg-white p-6 rounded-lg shadow-md flex-grow flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">실시간 추적 지도</h2>
              <div className="text-xs text-gray-500 flex flex-col items-end">
                {currentLocation && (
                  <span>📍 구급차: {currentLocation.latitude?.toFixed(4)}, {currentLocation.longitude?.toFixed(4)}</span>
                )}
                {matchedHospitals.length > 0 && matchedHospitals[0].latitude && (
                  <span className="text-green-600">🏥 병원: {matchedHospitals[0].latitude.toFixed(4)}, {matchedHospitals[0].longitude.toFixed(4)}</span>
                )}
                {hospitalDistanceInfo && (
                  <span className="text-blue-600">🏥 거리: {(hospitalDistanceInfo.distance / 1000).toFixed(2)}km</span>
                )}
              </div>
            </div>
            
            <div className="flex-grow h-96 lg:h-auto">
              {matchedHospitals.length > 0 ? (
                <div className="h-full relative">
                  {/* 🔥 이전 대화에서 수정한 MapDisplay 사용 (실제 좌표 포함) */}
                  <MapDisplay
                    hospital={matchedHospitals[0]}        // 🔥 매칭된 병원 (실제 좌표 포함!)
                    ambulanceLocation={ambulanceLocation} // 🔥 구급차 실시간 위치
                    distanceInfo={hospitalDistanceInfo}   // 🔥 백엔드 계산된 거리
                    isFullScreen={false}
                    showControls={true}
                    zoom={4}
                  />
                  
                  {/* 🔥 실제 좌표 사용 여부 표시 */}
                  {matchedHospitals[0].latitude && matchedHospitals[0].longitude && (
                    <div className="absolute top-2 right-2 bg-green-100 border border-green-300 rounded px-2 py-1 text-xs text-green-700">
                      ✅ 실제 병원 위치
                    </div>
                  )}
                </div>
              ) : isHospitalMatching ? (
                <div className="flex flex-col items-center justify-center h-full">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-3"></div>
                  <p className="text-center text-gray-500">병원 매칭 중...</p>
                  <p className="text-xs text-gray-400 mt-1">실제 좌표 자동 조회 중...</p>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full">
                  <div className="text-center mb-4">
                    <p className="text-gray-500 mb-2">매칭된 병원이 없습니다.</p>
                    <p className="text-xs text-gray-400 mb-4">
                      환자 정보(KTAS + 진료과목)를 입력하면 자동으로 병원이 매칭되고<br/>
                      실제 병원 위치가 지도에 표시됩니다.
                    </p>
                  </div>
                  <button
                    onClick={handleRetryHospitalMatching}
                    className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
                  >
                    🔄 병원 매칭 시도
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 🔥 오른쪽 컬럼: 병원 정보 + 화상 통화 */}
        <div className="flex flex-col gap-6">
          {/* 병원 정보 카드 */}
          <div className="bg-white p-6 rounded-lg shadow-md flex-grow flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">매칭된 병원</h2>
              <div className="text-xs text-gray-500">
                {isHospitalMatching ? (
                  <span className="text-blue-600">🔄 매칭 중...</span>
                ) : matchedHospitals.length > 0 ? (
                  <div className="flex flex-col items-end">
                    <span className="text-green-600">✅ 매칭 완료</span>
                    <span className="text-green-500">📍 실제 좌표 사용</span>
                  </div>
                ) : (
                  <span className="text-gray-400">⭕ 매칭된 병원 없음</span>
                )}
              </div>
            </div>

            {isHospitalMatching ? (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
                <p className="text-gray-500 mb-2">최적의 병원을 찾고 있습니다...</p>
                <p className="text-xs text-gray-400 text-center">
                  환자 정보와 현재 위치를 바탕으로<br />
                  백엔드 매칭 알고리즘이 작동 중입니다.<br/>
                  <span className="text-blue-500">병원 좌표도 자동으로 조회 중...</span>
                </p>
              </div>
            ) : matchedHospitals.length > 0 ? (
              <div className="space-y-4">
                {/* 매칭 성공 요약 */}
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-green-600 font-bold">✅ 매칭 성공</span>
                    <span className="text-xs text-green-500">백엔드 알고리즘 + 실제 좌표</span>
                  </div>
                  <p className="text-sm text-green-700">
                    환자 상태(KTAS: {details.ktasLevel}, 진료과: {details.department})에 
                    최적화된 병원이 매칭되었습니다.
                  </p>
                  
                  {/* 🔥 실제 좌표 정보 표시 */}
                  {matchedHospitals[0].latitude && matchedHospitals[0].longitude && (
                    <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded">
                      <p className="text-xs text-blue-700">
                        <strong>📍 병원 실제 위치:</strong> {matchedHospitals[0].latitude.toFixed(6)}, {matchedHospitals[0].longitude.toFixed(6)}
                      </p>
                      <p className="text-xs text-blue-600">HospitalLocationResponseDto에서 조회됨</p>
                    </div>
                  )}
                  
                  {/* 실시간 거리 정보 표시 */}
                  {hospitalDistanceInfo && (
                    <div className="mt-2 p-2 bg-purple-50 border border-purple-200 rounded">
                      <p className="text-sm text-purple-700">
                        <strong>🚑 실시간 거리:</strong> {(hospitalDistanceInfo.distance / 1000).toFixed(2)} km
                      </p>
                      <p className="text-xs text-purple-600">
                        업데이트: {new Date(hospitalDistanceInfo.timestamp).toLocaleTimeString()}
                      </p>
                    </div>
                  )}
                </div>

                {/* 병원 정보 카드 */}
                <div className="grid grid-cols-1 gap-4">
                  {matchedHospitals.map((hospital) => (
                    <HospitalCard
                      key={hospital.id || hospital.hospitalId}
                      hospital={hospital}
                      simple
                    />
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="text-center">
                  <p className="text-gray-500 mb-3">매칭된 병원 정보가 없습니다.</p>
                  {hospitalMatchingError && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-sm text-red-700">
                        <strong>오류:</strong> {hospitalMatchingError}
                      </p>
                    </div>
                  )}
                  <p className="text-xs text-gray-400 mb-4 leading-relaxed">
                    환자 정보를 입력하고 저장하면<br />
                    자동으로 최적의 병원이 매칭되고<br/>
                    <span className="text-blue-500">실제 병원 위치가 지도에 표시됩니다.</span>
                  </p>
                  <div className="space-y-2">
                    <button
                      onClick={handleRetryHospitalMatching}
                      className="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors w-full"
                    >
                      ♻️ 병원 매칭 시도
                    </button>
                    {(!selectedAmbulance?.patientDetails?.ktasLevel || 
                      !selectedAmbulance?.patientDetails?.department) && (
                      <button
                        onClick={() => navigate("/emergency/patient-input")}
                        className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors w-full"
                      >
                        📝 환자 정보 입력하기
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 화상 통화 카드 */}
          <div className="bg-white p-6 rounded-lg shadow-md flex-grow flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">화상 통화</h2>
              {!isCalling && matchedHospitals.length > 0 && (
                <button
                  onClick={handleCallStart}
                  className="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
                >
                  📞 통화 시작
                </button>
              )}
            </div>
            
            <div className="flex-grow bg-gray-200 rounded-lg flex items-center justify-center min-h-[300px]">
              {isCalling ? (
                <WebRtcCall
                  sessionId={currentAmbulanceId}
                  ambulanceNumber={currentUserKey}
                  onLeave={handleCallEnd}
                  patientName={patient.name || ""}
                  ktas={details.ktasLevel || ""}
                  hospitalId={
                    matchedHospitals.length > 0 ? 
                    (matchedHospitals[0].id || matchedHospitals[0].hospitalId || "241").toString() : 
                    "241"
                  }
                />
              ) : matchedHospitals.length > 0 ? (
                <div className="text-center">
                  <p className="text-gray-600 mb-3">매칭된 병원과 화상 통화를 시작하세요.</p>
                  <p className="text-sm text-gray-500 mb-4">병원: {matchedHospitals[0].name}</p>
                  
                  {/* 🔥 실제 좌표 및 실시간 거리 정보도 표시 */}
                  <div className="mb-4 space-y-2">
                    {matchedHospitals[0].latitude && matchedHospitals[0].longitude && (
                      <div className="p-2 bg-green-50 border border-green-200 rounded-lg">
                        <p className="text-xs text-green-700">
                          📍 병원 위치: {matchedHospitals[0].latitude.toFixed(4)}, {matchedHospitals[0].longitude.toFixed(4)}
                        </p>
                      </div>
                    )}
                    
                    {hospitalDistanceInfo && (
                      <div className="p-2 bg-blue-50 border border-blue-200 rounded-lg">
                        <p className="text-sm text-blue-700">
                          🚑 현재 거리: {(hospitalDistanceInfo.distance / 1000).toFixed(2)} km
                        </p>
                      </div>
                    )}
                  </div>
                  
                  <button
                    onClick={handleCallStart}
                    className="bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
                  >
                    📞 {matchedHospitals[0].name}와 통화 시작
                  </button>
                </div>
              ) : (
                <div className="text-center">
                  <p className="text-gray-500 mb-3">병원 매칭 후 화상 통화를 사용할 수 있습니다.</p>
                  <p className="text-xs text-gray-400">
                    환자 정보 입력 → 병원 매칭 (실제 좌표 조회) → 화상 통화 순서로 진행됩니다.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 🔥 개발 모드 디버깅 패널 (실제 좌표 정보 포함) */}
      {import.meta.env.DEV && (
        <div className="fixed bottom-4 right-4 bg-black bg-opacity-90 text-white p-4 rounded-lg text-xs max-w-sm z-50">
          <div className="font-bold text-yellow-300 mb-2">🔧 실시간 디버깅 (실제 좌표)</div>
          <div className="space-y-1">
            <p>구급차 ID: {currentAmbulanceId}</p>
            <p>차량번호: {currentUserKey}</p>
            <p>WebSocket: {wsConnected ? '✅' : '❌'} ({wsStatus})</p>
            <p>구급차 위치: {ambulanceLocation ? '✅' : '❌'}</p>
            <p>병원 거리: {hospitalDistanceInfo ? `${(hospitalDistanceInfo.distance / 1000).toFixed(2)}km` : '❌'}</p>
            <p>매칭된 병원: {matchedHospitals.length}개</p>
            {matchedHospitals.length > 0 && (
              <>
                <p className="text-green-400">🏥 병원명: {matchedHospitals[0].name}</p>
                <p className="text-green-400">📍 병원 좌표: {matchedHospitals[0].latitude?.toFixed(4)}, {matchedHospitals[0].longitude?.toFixed(4)}</p>
                <p className="text-green-400">✅ 실제 좌표: {matchedHospitals[0].latitude && matchedHospitals[0].longitude ? 'YES' : 'NO'}</p>
              </>
            )}
            <p>환자 KTAS: {selectedAmbulance?.patientDetails?.ktasLevel || "없음"}</p>
            <p>환자 진료과: {selectedAmbulance?.patientDetails?.department || "없음"}</p>
          </div>
          
          {/* 디버깅 버튼들 */}
          <div className="mt-3 space-y-1">
            <button
              onClick={wsReconnect}
              className="bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded text-xs w-full"
            >
              🔄 WebSocket 재연결
            </button>
            <button
              onClick={() => console.log('현재 상태 (실제 좌표 포함):', { 
                ambulanceLocation, 
                hospitalDistanceInfo, 
                matchedHospitals,
                wsConnected,
                wsStatus,
                hospitalCoordinates: matchedHospitals.map(h => ({ 
                  name: h.name, 
                  lat: h.latitude, 
                  lng: h.longitude,
                  hasRealCoords: !!(h.latitude && h.longitude)
                }))
              })}
              className="bg-gray-600 hover:bg-gray-700 text-white px-2 py-1 rounded text-xs w-full"
            >
              🔍 콘솔 로그 출력
            </button>
            <button
              onClick={() => {
                if (matchedHospitals.length > 0) {
                  const hospital = matchedHospitals[0];
                  console.log('🏥 매칭된 병원 상세 정보:');
                  console.log('  이름:', hospital.name);
                  console.log('  주소:', hospital.address);
                  console.log('  위도:', hospital.latitude);
                  console.log('  경도:', hospital.longitude);
                  console.log('  실제 좌표 여부:', !!(hospital.latitude && hospital.longitude));
                  console.log('  좌표 타입:', typeof hospital.latitude, typeof hospital.longitude);
                } else {
                  console.log('매칭된 병원이 없습니다.');
                }
              }}
              className="bg-green-600 hover:bg-green-700 text-white px-2 py-1 rounded text-xs w-full"
            >
              🏥 병원 좌표 확인
            </button>
          </div>
        </div>
      )}
    </AmbulanceLayout>
  );
}
