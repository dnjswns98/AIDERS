// src/pages/Emergency/AmbulanceDashboardPage.jsx

import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import AmbulanceLayout from "../../components/Emergency/Layout/AmbulanceLayout";
import MapDisplay from "../../components/Emergency/MapDisplay";
import WebRtcCall from "../../components/webRTC/WebRtcCall";
import useEmergencyStore from "../../store/useEmergencyStore";
import HospitalCard from "../../components/Emergency/HospitalCard";
import { useAuthStore } from "../../store/useAuthStore";
import { requestHospitalMatching, getMatchedHospital } from "../../api/api"; // 🔥 병원 매칭 API 직접 import

export default function AmbulanceDashboardPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state || {};

  const { 
    selectedAmbulance, 
    fetchAmbulances, 
    getCurrentLocation,
    // 🔥 기존 스토어 상태들
    currentLocation: storeCurrentLocation,
    locationError: storeLocationError
  } = useEmergencyStore();
  
  const [isCalling, setIsCalling] = useState(false);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  
  // 🔥 새로 추가: 병원 자동 매칭 관련 상태들
  const [matchedHospitals, setMatchedHospitals] = useState([]);
  const [hospitalMatchingStatus, setHospitalMatchingStatus] = useState('idle'); // 'idle', 'loading', 'success', 'error'
  const [hospitalMatchingError, setHospitalMatchingError] = useState(null);
  const [isHospitalMatching, setIsHospitalMatching] = useState(false);

  const { user } = useAuthStore();
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

  const currentRealUserKey = user.userKey;
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

  const currentRealAmbulancId = user.userId;

  useEffect(() => {
    console.log("=== AmbulanceDashboardPage 마운트됨 (병원 자동 매칭 포함) ===");
    console.log("sessionID :", currentRealUserKey);
    console.log("ambulanceID :", currentRealAmbulancId);
  }, [currentRealUserKey, currentRealAmbulancId]);

  useEffect(() => {
    fetchAmbulances();
  }, [fetchAmbulances]);

  // 🔥 병원 자동 매칭 핵심 함수
  const triggerHospitalMatching = async (ambulanceId) => {
    console.log("=== triggerHospitalMatching 시작 (백엔드 연동) ===");
    console.log("ambulanceId:", ambulanceId);

    if (!ambulanceId) {
      console.error("ambulanceId가 없습니다. 병원 매칭 중단");
      return;
    }

    // 🔥 병원 매칭 상태 업데이트
    setIsHospitalMatching(true);
    setHospitalMatchingStatus('loading');
    setHospitalMatchingError(null);

    try {
      // 🔥 현재 위치 가져오기 (필수)
      let locationData = currentLocation || storeCurrentLocation;
      
      if (!locationData) {
        console.log("현재 위치가 없어서 새로 가져옵니다...");
        locationData = await getCurrentLocation();
        setCurrentLocation(locationData);
      }

      if (!locationData || !locationData.latitude || !locationData.longitude) {
        throw new Error("위치 정보를 가져올 수 없습니다. GPS를 확인해주세요.");
      }

      // 🔥 병원 매칭 요청 데이터 구성 (백엔드 MatchRequest 형태)
      const matchingRequestData = {
        ambulanceId: ambulanceId,
        latitude: locationData.latitude,
        longitude: locationData.longitude
      };

      console.log("🏥 병원 매칭 요청 데이터 (백엔드 형태):", matchingRequestData);

      // 🔥 백엔드 병원 매칭 API 호출 (PATCH /api/v1/match/{uid})
      const matchingResult = await requestHospitalMatching(matchingRequestData);
      
      console.log("🏥 병원 매칭 결과 (MatchResponse):", matchingResult);

      // 🔥 매칭 결과를 상태에 저장 (MatchResponse 형태 처리)
      if (matchingResult) {
        // MatchResponse: { hospitalId, name, address }
        const hospitalData = {
          id: matchingResult.hospitalId,
          hospitalId: matchingResult.hospitalId,
          name: matchingResult.name,
          address: matchingResult.address,
          // 🔥 추가 정보는 기본값으로 설정 (실제로는 별도 API나 확장 필요)
          distance: "계산 중...",
          eta: "계산 중...",
          departments: ["응급의학과"],
          availableBeds: "확인 중",
          emergencyLevel: "확인 중",
          isAvailable: true,
          // 지도 표시용 좌표 (실제로는 백엔드에서 받아와야 함)
          latitude: 37.5799, // 기본값 (서울대병원)
          longitude: 126.9988
        };

        setMatchedHospitals([hospitalData]); // 단일 병원을 배열로 처리
        setHospitalMatchingStatus('success');
        setHospitalMatchingError(null);

        console.log("✅ 병원 자동 매칭 완료!");
        console.log("매칭된 병원:", hospitalData);
      } else {
        throw new Error("병원 매칭 결과가 비어있습니다.");
      }

    } catch (error) {
      console.error("❌ 병원 자동 매칭 실패:", error);
      
      setHospitalMatchingStatus('error');
      setHospitalMatchingError(error.message || '병원 매칭에 실패했습니다.');
      setMatchedHospitals([]);

      // 🔥 에러 유형별 사용자 알림
      if (error.message?.includes('위치')) {
        alert("위치 정보를 가져올 수 없습니다. GPS를 확인하고 다시 시도해주세요.");
      } else if (error.response?.status === 400) {
        alert("잘못된 요청입니다. 구급차 정보를 확인해주세요.");
      } else if (error.response?.status === 404) {
        alert("구급차 정보를 찾을 수 없습니다.");
      } else if (error.response?.status === 500) {
        alert("서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
      } else {
        console.error("병원 매칭 에러:", error);
      }

      throw error;
    } finally {
      setIsHospitalMatching(false);
    }
  };

  // 🔥 매칭된 병원 정보 조회 함수
  const checkHospitalMatchingStatus = async (ambulanceId) => {
    console.log("=== checkHospitalMatchingStatus 시작 (백엔드 연동) ===");
    
    if (!ambulanceId) {
      console.error("ambulanceId가 없습니다.");
      return;
    }

    try {
      // 🔥 백엔드에서 매칭된 병원 조회 (GET /api/v1/match/{uid})
      const statusResult = await getMatchedHospital(ambulanceId);
      console.log("병원 매칭 상태 조회 결과 (MatchResponse):", statusResult);

      if (statusResult) {
        // MatchResponse 형태를 프론트엔드 형태로 변환
        const hospitalData = {
          hospitalId: statusResult.hospitalId,
          name: statusResult.name,
          address: statusResult.address,
          isAvailable: true,
          latitude: 37.5799,
          longitude: 126.9988
        };

        setMatchedHospitals([hospitalData]);
        setHospitalMatchingStatus('success');
        setHospitalMatchingError(null);

        console.log("✅ 기존 매칭된 병원 조회 완료:", hospitalData);
      } else {
        // 매칭된 병원이 없는 경우
        setMatchedHospitals([]);
        setHospitalMatchingStatus('idle');
        console.log("ℹ️ 매칭된 병원이 없습니다.");
      }

      return statusResult;
    } catch (error) {
      if (error.response?.status === 404) {
        // 404는 매칭된 병원이 없다는 의미이므로 에러가 아님
        console.log("ℹ️ 매칭된 병원이 없습니다 (404).");
        setMatchedHospitals([]);
        setHospitalMatchingStatus('idle');
        setHospitalMatchingError(null);
      } else {
        console.error("병원 매칭 상태 조회 실패:", error);
        setHospitalMatchingStatus('error');
        setHospitalMatchingError('매칭 상태 조회에 실패했습니다.');
      }
    }
  };

  // 🔥 컴포넌트 마운트 시 위치 정보 및 병원 매칭 상태 확인
  useEffect(() => {
    const loadLocationAndCheckMatching = async () => {
      setIsLoadingLocation(true);
      try {
        console.log("현재 위치 및 병원 매칭 상태 확인 시작...");
        
        // 🔥 1단계: 현재 위치 가져오기
        if (getCurrentLocation) {
          try {
            const location = await getCurrentLocation();
            setCurrentLocation(location);
            console.log("현재 구급차 위치:", location);
          } catch (locationError) {
            console.warn("위치 정보 가져오기 실패:", locationError);
          }
        }
        
        // 🔥 2단계: 기존 병원 매칭 상태 확인
        if (currentRealAmbulancId) {
          try {
            await checkHospitalMatchingStatus(currentRealAmbulancId);
            console.log("병원 매칭 상태 확인 완료");
          } catch (error) {
            console.warn("병원 매칭 상태 확인 실패:", error);
          }
        }
        
      } catch (error) {
        console.warn("초기 로딩 실패:", error);
      } finally {
        setIsLoadingLocation(false);
      }
    };
    
    loadLocationAndCheckMatching();
  }, [getCurrentLocation, currentRealAmbulancId]);

  // 🔥 환자 정보 저장 후 자동 매칭 트리거 감지
  useEffect(() => {
    if (selectedAmbulance && selectedAmbulance.patientDetails) {
      const { ktasLevel, department } = selectedAmbulance.patientDetails;
      
      // KTAS와 진료과목이 모두 있고, 아직 매칭이 안된 상태라면 자동 매칭 시도
      const hasRequiredInfo = ktasLevel && 
                             department && 
                             !ktasLevel.includes("선택") && 
                             !department.includes("선택") &&
                             ktasLevel.trim() !== "" &&
                             department.trim() !== "";
      
      const noHospitalMatched = matchedHospitals.length === 0;
      const notCurrentlyMatching = !isHospitalMatching && hospitalMatchingStatus !== 'loading';
      
      if (hasRequiredInfo && noHospitalMatched && notCurrentlyMatching) {
        console.log("🔥 환자 필수 정보 있음 + 미매칭 상태 감지 → 자동 병원 매칭 시도");
        console.log("KTAS:", ktasLevel, "진료과목:", department);
        
        // 잠시 대기 후 자동 매칭 (환자 정보 저장 API 완료 대기)
        setTimeout(() => {
          triggerHospitalMatching(currentRealAmbulancId).catch(error => {
            console.warn("자동 병원 매칭 실패:", error.message);
          });
        }, 2000);
      }
    }
  }, [selectedAmbulance?.patientDetails?.ktasLevel, selectedAmbulance?.patientDetails?.department, matchedHospitals.length, isHospitalMatching, hospitalMatchingStatus]);

  // 환자 정보는 navigation state(formData) → Zustand → 빈 객체 우선순위로 가져옴
  const patientFromState = state.formData;
  const patient = patientFromState || selectedAmbulance?.patientInfo || {};
  const details = patientFromState
    ? {
        ktasLevel: patientFromState.ktasLevel || "-",
        chiefComplaint: patientFromState.chiefComplaint || "-",
        treatmentDetails: patientFromState.treatmentDetails || "-",
        familyHistory: patientFromState.familyHistory || {},
        pastHistory: patientFromState.pastHistory || {},
        vitalSigns: patientFromState.vitalSigns || {},
        medications: patientFromState.medications || [],
        department: patientFromState.department || "-",
        ageRange: patientFromState.ageRange || "-",
      }
    : selectedAmbulance?.patientDetails || {};

  // 🔥 실제 매칭된 병원 사용 (더미 데이터 완전 제거)
  const hospitals = matchedHospitals;

  const handleModify = () => {
    if (!selectedAmbulance) return;
    const formData = {
      ...selectedAmbulance.patientInfo,
      ...selectedAmbulance.patientDetails,
      medications:
        selectedAmbulance.patientDetails?.medications
          ?.map((m) => m.name)
          .join(", ") || "",
      familyHistory:
        selectedAmbulance.patientDetails?.familyHistory?.father || "",
      pastHistory:
        selectedAmbulance.patientDetails?.pastHistory?.hypertension || "",
    };
    navigate("/emergency/patient-input", {
      state: { isEditMode: true, formData },
    });
  };

  const handleCallStart = () => setIsCalling(true);
  const handleCallEnd = () => setIsCalling(false);

  // 🔥 병원 매칭 수동 재시도 함수
  const handleRetryHospitalMatching = async () => {
    console.log("병원 매칭 수동 재시도...");
    
    if (!currentRealAmbulancId) {
      alert("구급차 ID가 없습니다.");
      return;
    }

    // 환자 정보 확인
    if (!selectedAmbulance?.patientDetails?.ktasLevel || !selectedAmbulance?.patientDetails?.department) {
      alert("환자의 KTAS와 진료과목 정보가 필요합니다. 환자 정보를 먼저 입력해주세요.");
      navigate("/emergency/patient-input");
      return;
    }

    try {
      await triggerHospitalMatching(currentRealAmbulancId);
      console.log("병원 매칭 재시도 완료");
    } catch (error) {
      console.error("병원 매칭 재시도 실패:", error);
      // triggerHospitalMatching에서 이미 alert 처리함
    }
  };

  // 🔥 병원 매칭 취소 함수 (실제로는 백엔드에 취소 API가 있어야 하지만 지금은 로컬 상태만 초기화)
  const handleCancelHospitalMatching = async () => {
    if (!currentRealAmbulancId) return;

    const confirmCancel = confirm("병원 매칭을 취소하시겠습니까?\n(다시 매칭하려면 재매칭 버튼을 눌러주세요)");
    if (!confirmCancel) return;

    try {
      // 🔥 실제로는 백엔드 취소 API 호출해야 함 (현재는 없으므로 로컬 상태만 초기화)
      // await cancelHospitalMatching(currentRealAmbulancId);
      
      setMatchedHospitals([]);
      setHospitalMatchingStatus('idle');
      setHospitalMatchingError(null);
      setIsHospitalMatching(false);
      
      console.log("병원 매칭 취소 완료 (로컬 상태 초기화)");
    } catch (error) {
      console.error("병원 매칭 취소 실패:", error);
      alert("병원 매칭 취소에 실패했습니다.");
    }
  };

  if (!selectedAmbulance && !patientFromState) {
    return (
      <AmbulanceLayout>
        <div className="bg-white p-8 rounded-lg shadow-md text-center">
          <h1 className="text-2xl font-bold mb-4">
            선택된 구급차 정보가 없습니다.
          </h1>
          <p>소방서 대시보드에서 구급차를 선택해주세요.</p>
        </div>
      </AmbulanceLayout>
    );
  }

  return (
    <AmbulanceLayout>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="flex flex-col gap-6">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">환자 정보</h2>
              <button
                onClick={handleModify}
                className="bg-blue-500 hover:bg-blue-600 text-white text-sm font-semibold py-2 px-4 rounded-lg transition-colors duration-200"
              >
                수정
              </button>
            </div>
            <div className="grid grid-cols-2 gap-4 text-gray-600">
              <p>
                <strong>이름:</strong> {patient.name || "-"}
              </p>
              <p>
                <strong>성별:</strong> {patient.gender || "-"}
              </p>
              <p>
                <strong>나이:</strong> {patient.age || "-"}
              </p>
              <p>
                <strong>증상:</strong> {details.chiefComplaint || "-"}
              </p>
              <p>
                <strong>중증도:</strong> {details.ktasLevel || "-"}
              </p>
              <p>
                <strong>진료과목:</strong> {details.department || "-"}
              </p>
            </div>

            {/* 🔥 병원 매칭 상태 표시 (완전 개선) */}
            <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-green-50 border-l-4 border-blue-400 rounded-r-lg">
              <div className="text-sm text-gray-700">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-bold text-gray-800">🏥 병원 자동 매칭 시스템</span>
                  <span className="text-xs text-gray-500">백엔드 연동</span>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <p><strong>현재 위치:</strong></p>
                    <p className="text-blue-600">
                      {currentLocation || storeCurrentLocation ? 
                        `${(currentLocation?.latitude || storeCurrentLocation?.latitude)?.toFixed(4)}, ${(currentLocation?.longitude || storeCurrentLocation?.longitude)?.toFixed(4)}` : 
                        "위치 정보 없음"}
                    </p>
                  </div>
                  <div>
                    <p><strong>매칭된 병원:</strong></p>
                    <p className="text-green-600">{hospitals.length}개</p>
                  </div>
                </div>
                
                {/* 🔥 병원 매칭 상태 표시 */}
                <div className="mt-3 flex items-center gap-2">
                  <span className="font-bold">상태:</span>
                  {hospitalMatchingStatus === 'loading' || isHospitalMatching ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                      <span className="text-blue-600 font-bold">🔄 매칭 중...</span>
                    </div>
                  ) : hospitalMatchingStatus === 'success' && hospitals.length > 0 ? (
                    <span className="text-green-600 font-bold">✅ 매칭 완료 ({hospitals.length}개 병원)</span>
                  ) : hospitalMatchingStatus === 'error' ? (
                    <span className="text-red-600 font-bold">❌ 매칭 실패</span>
                  ) : (
                    <span className="text-gray-600">⭕ 매칭 대기 중</span>
                  )}
                </div>

                {/* 🔥 병원 매칭 에러 표시 */}
                {hospitalMatchingError && (
                  <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-red-700 text-xs">
                    <strong>에러:</strong> {hospitalMatchingError}
                  </div>
                )}

                {/* 🔥 매칭된 병원 간단 정보 */}
                {hospitals.length > 0 && (
                  <div className="mt-3 p-2 bg-green-50 border border-green-200 rounded">
                    <p className="text-xs text-green-800">
                      <strong>매칭된 병원:</strong> {hospitals[0].name}
                    </p>
                    <p className="text-xs text-green-700">
                      <strong>주소:</strong> {hospitals[0].address}
                    </p>
                  </div>
                )}
              </div>
              
              {/* 🔥 병원 매칭 컨트롤 버튼들 */}
              <div className="mt-4 flex gap-2 flex-wrap">
                {hospitalMatchingStatus !== 'loading' && !isHospitalMatching && (
                  <button
                    onClick={handleRetryHospitalMatching}
                    className="px-3 py-1.5 bg-blue-500 text-white text-xs rounded-lg hover:bg-blue-600 transition-colors shadow-sm"
                  >
                    🔄 병원 {hospitals.length > 0 ? '재매칭' : '매칭 시도'}
                  </button>
                )}
                
                {hospitals.length > 0 && !isHospitalMatching && (
                  <button
                    onClick={handleCancelHospitalMatching}
                    className="px-3 py-1.5 bg-red-500 text-white text-xs rounded-lg hover:bg-red-600 transition-colors shadow-sm"
                  >
                    ❌ 매칭 취소
                  </button>
                )}

                {/* 🔥 환자 정보 부족 시 안내 */}
                {(!selectedAmbulance?.patientDetails?.ktasLevel || !selectedAmbulance?.patientDetails?.department) && (
                  <button
                    onClick={() => navigate("/emergency/patient-input")}
                    className="px-3 py-1.5 bg-orange-500 text-white text-xs rounded-lg hover:bg-orange-600 transition-colors shadow-sm"
                  >
                    📝 환자 정보 입력
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md flex-grow flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">지도</h2>
              <div className="text-xs text-gray-500 flex flex-col items-end">
                {currentLocation || storeCurrentLocation ? (
                  <span>📍 {(currentLocation?.latitude || storeCurrentLocation?.latitude)?.toFixed(4)}, {(currentLocation?.longitude || storeCurrentLocation?.longitude)?.toFixed(4)}</span>
                ) : (
                  <span>📍 위치 정보 없음</span>
                )}
                {hospitals.length > 0 && (
                  <span className="text-green-600">🏥 {hospitals.length}개 병원 표시</span>
                )}
              </div>
            </div>
            <div className="flex-grow h-96 lg:h-auto">
              {isLoadingLocation || isHospitalMatching ? (
                <div className="flex flex-col items-center justify-center h-full">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-3"></div>
                  <p className="text-center text-gray-500">
                    {isHospitalMatching ? "병원 매칭 중..." : "위치 정보 로딩 중..."}
                  </p>
                </div>
              ) : hospitals.length > 0 ? (
                <div className="h-full">
                  <MapDisplay 
                    hospital={hospitals[0]} 
                    currentLocation={currentLocation || storeCurrentLocation}
                    allHospitals={hospitals}
                  />
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full">
                  <div className="text-center mb-4">
                    <p className="text-gray-500 mb-2">
                      {hospitalMatchingStatus === 'error' 
                        ? "병원 매칭에 실패했습니다." 
                        : "매칭된 병원이 없습니다."
                      }
                    </p>
                    {hospitalMatchingError && (
                      <p className="text-red-500 text-sm mb-3">
                        {hospitalMatchingError}
                      </p>
                    )}
                    <p className="text-xs text-gray-400 mb-4">
                      환자 정보(KTAS + 진료과목)를 입력하면 자동으로 병원 매칭됩니다.
                    </p>
                  </div>
                  <button
                    onClick={handleRetryHospitalMatching}
                    className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 shadow-md"
                  >
                    🔄 병원 매칭 시도
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <div className="bg-white p-6 rounded-lg shadow-md flex-grow flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">병원 정보</h2>
              <div className="text-xs text-gray-500 flex flex-col items-end">
                {isHospitalMatching ? (
                  <span className="text-blue-600">🔄 매칭 중...</span>
                ) : hospitals.length > 0 ? (
                  <span className="text-green-600">✅ {hospitals.length}개 병원 매칭됨</span>
                ) : hospitalMatchingStatus === 'error' ? (
                  <span className="text-red-600">❌ 매칭 실패</span>
                ) : (
                  <span className="text-gray-400">⭕ 매칭된 병원 없음</span>
                )}
                {hospitals.length > 0 && (
                  <span className="text-xs text-gray-400 mt-1">백엔드 MatchingService 연동</span>
                )}
              </div>
            </div>
            
            {isHospitalMatching ? (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
                <p className="text-gray-500 mb-2">병원 매칭 중...</p>
                <p className="text-xs text-gray-400 text-center">
                  환자 정보와 현재 위치를 바탕으로<br/>
                  최적의 병원을 찾고 있습니다.
                </p>
              </div>
            ) : hospitals.length > 0 ? (
              <div className="space-y-4">
                {/* 🔥 매칭 결과 요약 */}
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-green-600 font-bold">✅ 매칭 성공</span>
                    <span className="text-xs text-green-500">백엔드 알고리즘 매칭</span>
                  </div>
                  <p className="text-sm text-green-700">
                    환자 상태(KTAS: {details.ktasLevel}, 진료과: {details.department})에 
                    최적화된 병원이 매칭되었습니다.
                  </p>
                </div>

                {/* 🔥 병원 카드들 */}
                <div className="grid grid-cols-1 gap-4">
                  {hospitals.map((hospital) => (
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
                  <p className="text-gray-500 mb-3">
                    {hospitalMatchingStatus === 'error' 
                      ? "병원 매칭에 실패했습니다." 
                      : "매칭된 병원 정보가 없습니다."
                    }
                  </p>
                  {hospitalMatchingError && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-sm text-red-700">
                        <strong>오류:</strong> {hospitalMatchingError}
                      </p>
                    </div>
                  )}
                  <p className="text-xs text-gray-400 mb-4 leading-relaxed">
                    환자 정보를 입력하고 저장하면<br/>
                    백엔드 MatchingService가 자동으로<br/>
                    최적의 병원을 찾아 매칭해드립니다.
                  </p>
                  <div className="space-y-2">
                    <button
                      onClick={handleRetryHospitalMatching}
                      className="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200 block w-full"
                    >
                      ♻️ 병원 매칭 시도
                    </button>
                    {(!selectedAmbulance?.patientDetails?.ktasLevel || !selectedAmbulance?.patientDetails?.department) && (
                      <button
                        onClick={() => navigate("/emergency/patient-input")}
                        className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200 block w-full"
                      >
                        📝 환자 정보 입력하기
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md h-full flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">화상 통화</h2>
              {!isCalling && hospitals.length > 0 && (
                <button
                  onClick={handleCallStart}
                  className="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200"
                >
                  📞 통화 시작
                </button>
              )}
            </div>
            <div className="flex-grow bg-gray-200 rounded-lg flex items-center justify-center min-h-[300px]">
              {isCalling ? (
                <WebRtcCall
                  sessionId={currentRealAmbulancId}
                  ambulanceId={currentRealAmbulancId}
                  onLeave={handleCallEnd}
                  patientName={patient.name || ""}
                  ktas={details.ktasLevel || ""}
                  hospitalId={hospitals.length > 0 ? (hospitals[0].id || hospitals[0].hospitalId || "241").toString() : "241"}
                />
              ) : hospitals.length > 0 ? (
                <div className="text-center">
                  <p className="text-gray-600 mb-3">
                    매칭된 병원과 화상 통화를 시작하세요.
                  </p>
                  <p className="text-sm text-gray-500 mb-4">
                    병원: {hospitals[0].name}
                  </p>
                  <button
                    onClick={handleCallStart}
                    className="bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
                  >
                    📞 {hospitals[0].name}와 통화 시작
                  </button>
                </div>
              ) : (
                <div className="text-center">
                  <p className="text-gray-500 mb-3">
                    병원 매칭 후 화상 통화를 사용할 수 있습니다.
                  </p>
                  <p className="text-xs text-gray-400">
                    환자 정보 입력 → 병원 매칭 → 화상 통화 순서로 진행됩니다.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 🔥 디버깅 패널 (개발 모드에서만 표시) */}
      {import.meta.env.DEV && (
        <div className="fixed bottom-4 right-4 bg-black bg-opacity-80 text-white p-4 rounded-lg text-xs max-w-sm">
          <div className="font-bold text-yellow-300 mb-2">🔧 개발 디버깅</div>
          <div className="space-y-1">
            <p>구급차 ID: {currentRealAmbulancId}</p>
            <p>차량번호: {currentRealUserKey}</p>
            <p>위치: {currentLocation ? `${currentLocation.latitude.toFixed(4)}, ${currentLocation.longitude.toFixed(4)}` : "없음"}</p>
            <p>매칭 상태: {hospitalMatchingStatus}</p>
            <p>매칭된 병원: {hospitals.length}개</p>
            <p>환자 KTAS: {selectedAmbulance?.patientDetails?.ktasLevel || "없음"}</p>
            <p>환자 진료과: {selectedAmbulance?.patientDetails?.department || "없음"}</p>
          </div>
        </div>
      )}
    </AmbulanceLayout>
  );
}
