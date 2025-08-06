// src/pages/Emergency/AmbulancePatientInputPage.jsx

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import AmbulanceLayout from "../../components/Emergency/Layout/AmbulanceLayout";
import useEmergencyStore from "../../store/useEmergencyStore";
import { useAuthStore } from "../../store/useAuthStore";
import InputModeToggle from "../../components/Emergency/PatientInput/InputModeToggle";
import PatientBasicInfoForm from "../../components/Emergency/PatientInput/PatientBasicInfoForm";
import PatientDetailInput from "../../components/Emergency/PatientInput/PatientDetailInput";

// 🔥 안전한 데이터 추출 헬퍼 함수들
const safeGetValue = (value, fallback = "") => {
  if (value === null || value === undefined) return fallback;
  if (typeof value === 'string' && value.trim() === '') return fallback;
  if (typeof value === 'string' && (
    value.includes('선택') || 
    value === '선택해주세요' || 
    value === '-' || 
    value === 'unknown'
  )) return fallback;
  return value;
};

const safeGetKtasLevel = (ktasLevel) => {
  const cleaned = safeGetValue(ktasLevel);
  if (!cleaned) return "";
  
  // "1등급" → "1" 추출
  if (typeof cleaned === 'string' && cleaned.includes('등급')) {
    const number = cleaned.replace(/[^0-9]/g, '');
    return number || "";
  }
  
  return cleaned;
};

const safeGetComplexObject = (obj, path, fallback = "") => {
  if (!obj || typeof obj !== 'object') return fallback;
  
  try {
    // path가 "familyHistory.father" 형태인 경우
    if (path.includes('.')) {
      const keys = path.split('.');
      let result = obj;
      for (const key of keys) {
        if (result && typeof result === 'object' && result[key] !== undefined) {
          result = result[key];
        } else {
          return fallback;
        }
      }
      return safeGetValue(result, fallback);
    } else {
      return safeGetValue(obj[path], fallback);
    }
  } catch (error) {
    console.warn('[safeGetComplexObject] 추출 실패:', path, error);
    return fallback;
  }
};

const safeGetMedications = (medications) => {
  if (!medications) return "";
  
  try {
    if (Array.isArray(medications)) {
      return medications
        .map(med => {
          if (typeof med === 'object' && med.name) {
            return med.name;
          }
          return med;
        })
        .filter(name => name && name.trim() !== '')
        .join(", ");
    }
    
    if (typeof medications === 'string') {
      // JSON 문자열인 경우
      if (medications.startsWith('[')) {
        const parsed = JSON.parse(medications);
        return safeGetMedications(parsed);
      }
      return medications;
    }
    
    return "";
  } catch (error) {
    console.warn('[safeGetMedications] 파싱 실패:', medications, error);
    return "";
  }
};

export default function AmbulancePatientInputPage() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const isEditMode = state?.isEditMode || false;

  // 🔥 스토어에서 가져오기 - userId 기반
  const { 
    selectedAmbulance, 
    updatePatientInfo, 
    fetchAmbulances, 
    debugCurrentState 
  } = useEmergencyStore();
  const { user } = useAuthStore();

  // 🔥 폼 데이터 상태 관리 - 완전 초기화
  const [formData, setFormData] = useState({
    ktasLevel: "",
    department: "",
    gender: "",
    ageRange: "",
    name: "",
    chiefComplaint: "",
    treatmentDetails: "",
    familyHistory: "",
    pastHistory: "",
    medications: "",
    vitalSigns: "",
  });

  const [inputMode, setInputMode] = useState("drawing");
  const detailInputRefs = useRef([]);
  const [currentDrawingIndex, setCurrentDrawingIndex] = useState(0);
  const mainContentRef = useRef(null);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [isDataLoaded, setIsDataLoaded] = useState(false); // 🔥 데이터 로딩 상태 추가

  // 🔥 컴포넌트 마운트 시 디버깅 정보 출력 및 fetchAmbulances 강제 호출 (userId 기반)
  useEffect(() => {
    console.log("=== AmbulancePatientInputPage 마운트됨 (편집 모드 개선) ===");
    console.log("현재 로그인 유저:", user);
    console.log("userId:", user?.userId);
    console.log("userKey (차량번호):", user?.userKey);
    console.log("현재 selectedAmbulance:", selectedAmbulance);
    console.log("편집 모드:", isEditMode);
    
    // 디버깅용 현재 상태 출력
    debugCurrentState();
    
    // selectedAmbulance가 없거나 userId와 다르면 강제로 fetchAmbulances 호출
    if (!selectedAmbulance) {
      console.log("selectedAmbulance가 없어서 fetchAmbulances 강제 호출");
      fetchAmbulances();
    } else if (selectedAmbulance.id !== user?.userId) {
      console.log("selectedAmbulance ID와 현재 userId가 다름. 재조회 필요");
      console.log("selectedAmbulance.id:", selectedAmbulance.id);
      console.log("user.userId:", user?.userId);
      fetchAmbulances();
    }
  }, []);

  // 🔥 selectedAmbulance 변화 감지 (userId 기반)
  useEffect(() => {
    console.log("selectedAmbulance 변화 감지:", selectedAmbulance);
    if (selectedAmbulance) {
      console.log("구급차 ID (userId):", selectedAmbulance.id);
      console.log("차량번호:", selectedAmbulance.carNumber);
      console.log("환자 정보:", selectedAmbulance.patientInfo);
      console.log("환자 상세정보:", selectedAmbulance.patientDetails);
    }
  }, [selectedAmbulance]);

  // 🔥 편집 모드일 때 기존 데이터로 폼 초기화 - 완전 개선
  useEffect(() => {
    if (isEditMode && selectedAmbulance && !isDataLoaded) {
      console.log("=== 편집 모드 폼 데이터 초기화 시작 (개선된 버전) ===");
      console.log("selectedAmbulance 전체:", selectedAmbulance);
      console.log("patientInfo:", selectedAmbulance.patientInfo);
      console.log("patientDetails:", selectedAmbulance.patientDetails);
      
      // 🔥 안전한 데이터 추출
      const patientInfo = selectedAmbulance.patientInfo || {};
      const patientDetails = selectedAmbulance.patientDetails || {};
      
      console.log("=== 필드별 데이터 추출 과정 ===");
      
      // KTAS 추출
      const extractedKtas = safeGetKtasLevel(patientDetails.ktasLevel);
      console.log("KTAS 추출:", patientDetails.ktasLevel, "→", extractedKtas);
      
      // 진료과목 추출
      const extractedDepartment = safeGetValue(patientDetails.department);
      console.log("진료과목 추출:", patientDetails.department, "→", extractedDepartment);
      
      // 성별 추출
      const extractedGender = safeGetValue(patientInfo.gender);
      console.log("성별 추출:", patientInfo.gender, "→", extractedGender);
      
      // 나이대 추출
      const extractedAgeRange = safeGetValue(patientDetails.ageRange);
      console.log("나이대 추출:", patientDetails.ageRange, "→", extractedAgeRange);
      
      // 이름 추출
      const extractedName = safeGetValue(patientInfo.name);
      console.log("이름 추출:", patientInfo.name, "→", extractedName);
      
      // 주증상 추출
      const extractedChiefComplaint = safeGetValue(patientDetails.chiefComplaint);
      console.log("주증상 추출:", patientDetails.chiefComplaint, "→", extractedChiefComplaint);
      
      // 처치내용 추출
      const extractedTreatmentDetails = safeGetValue(patientDetails.treatmentDetails);
      console.log("처치내용 추출:", patientDetails.treatmentDetails, "→", extractedTreatmentDetails);
      
      // 가족력 추출 (복잡한 객체 처리)
      const extractedFamilyHistory = safeGetComplexObject(patientDetails.familyHistory, 'father');
      console.log("가족력 추출:", patientDetails.familyHistory, "→", extractedFamilyHistory);
      
      // 과거력 추출 (복잡한 객체 처리)
      const extractedPastHistory = safeGetComplexObject(patientDetails.pastHistory, 'hypertension');
      console.log("과거력 추출:", patientDetails.pastHistory, "→", extractedPastHistory);
      
      // 약물 추출 (배열 처리)
      const extractedMedications = safeGetMedications(patientDetails.medications);
      console.log("약물 추출:", patientDetails.medications, "→", extractedMedications);
      
      // 생체징후 추출 (복잡한 객체 처리)
      const extractedVitalSigns = safeGetComplexObject(patientDetails.vitalSigns, 'bloodPressure');
      console.log("생체징후 추출:", patientDetails.vitalSigns, "→", extractedVitalSigns);
      
      // 🔥 추출된 데이터로 폼 초기화
      const newFormData = {
        ktasLevel: extractedKtas,
        department: extractedDepartment,
        gender: extractedGender,
        ageRange: extractedAgeRange,
        name: extractedName,
        chiefComplaint: extractedChiefComplaint,
        treatmentDetails: extractedTreatmentDetails,
        familyHistory: extractedFamilyHistory,
        pastHistory: extractedPastHistory,
        medications: extractedMedications,
        vitalSigns: extractedVitalSigns,
      };
      
      console.log("=== 최종 폼 데이터 ===");
      console.log("newFormData:", newFormData);
      
      // 🔥 빈 값들만 있는지 검증
      const hasValidData = Object.values(newFormData).some(value => 
        value && value.trim && value.trim() !== ""
      );
      
      if (hasValidData) {
        console.log("✅ 유효한 데이터가 있어서 폼에 설정");
        setFormData(newFormData);
        setIsDataLoaded(true);
      } else {
        console.warn("⚠️ 모든 데이터가 빈 값이어서 폼 초기화 생략");
        console.warn("selectedAmbulance에 실제 저장된 데이터가 없는 것 같습니다.");
        
        // 🔥 빈 값으로 초기화 (기본값 제거)
        setFormData({
          ktasLevel: "",
          department: "",
          gender: "",
          ageRange: "",
          name: "",
          chiefComplaint: "",
          treatmentDetails: "",
          familyHistory: "",
          pastHistory: "",
          medications: "",
          vitalSigns: "",
        });
        setIsDataLoaded(true);
      }
      
      console.log("=== 편집 모드 폼 데이터 초기화 완료 ===");
    } else if (isEditMode && !selectedAmbulance) {
      console.warn("편집 모드인데 selectedAmbulance가 없음. fetchAmbulances 재호출 필요");
    } else if (!isEditMode && !isDataLoaded) {
      // 🔥 신규 입력 모드일 때는 빈 폼으로 초기화
      console.log("신규 입력 모드: 빈 폼으로 초기화");
      setFormData({
        ktasLevel: "",
        department: "",
        gender: "",
        ageRange: "",
        name: "",
        chiefComplaint: "",
        treatmentDetails: "",
        familyHistory: "",
        pastHistory: "",
        medications: "",
        vitalSigns: "",
      });
      setIsDataLoaded(true);
    }
  }, [isEditMode, selectedAmbulance, isDataLoaded]);

  // 🔥 폼 초기화 실패 시 재시도 버튼
  const handleRetryDataLoad = async () => {
    console.log("데이터 재로딩 시도");
    setIsDataLoaded(false);
    try {
      await fetchAmbulances();
      // fetchAmbulances 완료 후 위의 useEffect가 다시 실행됨
    } catch (error) {
      console.error("데이터 재로딩 실패:", error);
      alert("데이터를 불러오는데 실패했습니다. 페이지를 새로고침 해주세요.");
    }
  };

  // 🔥 폼 데이터 강제 초기화 버튼 (디버깅용)
  const handleResetForm = () => {
    console.log("폼 데이터 강제 초기화");
    setFormData({
      ktasLevel: "",
      department: "",
      gender: "",
      ageRange: "",
      name: "",
      chiefComplaint: "",
      treatmentDetails: "",
      familyHistory: "",
      pastHistory: "",
      medications: "",
      vitalSigns: "",
    });
    setIsDataLoaded(false);
  };

  // 🔥 폼 데이터 개별 검증 함수
  const validateFormData = () => {
    console.log("=== 폼 데이터 검증 ===");
    const issues = [];
    
    Object.entries(formData).forEach(([key, value]) => {
      if (value && (
        value.includes('선택') || 
        value === '선택해주세요' || 
        value === 'unknown' ||
        value === '1' || // 🔥 의심스러운 기본값 감지
        value === '외과' // 🔥 의심스러운 기본값 감지
      )) {
        issues.push(`${key}: ${value} (의심스러운 기본값)`);
      }
    });
    
    if (issues.length > 0) {
      console.warn("⚠️ 의심스러운 기본값 감지:", issues);
      return false;
    }
    
    console.log("✅ 폼 데이터 검증 통과");
    return true;
  };

  // 🔥 폼 데이터 변경 핸들러 - 로깅 추가
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    console.log(`[폼 변경] ${name}: "${value}"`);
    
    setFormData((prev) => {
      const newData = { ...prev, [name]: value };
      console.log("업데이트된 폼 데이터:", newData);
      return newData;
    });
  };

  // 🔥 필기/타이핑 모드 토글
  const toggleInputMode = () => {
    setInputMode((prevMode) => (prevMode === "drawing" ? "typing" : "drawing"));
    console.log("입력 모드 변경:", inputMode === "drawing" ? "typing" : "drawing");
  };

  // 🔥 저장(병원 매칭) 버튼 클릭 시 실행 (userId 기반) - 검증 로직 추가
  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("[handleSubmit] 저장 버튼 클릭됨! (편집 모드 개선)");
    console.log("[handleSubmit] 현재 selectedAmbulance:", selectedAmbulance);
    console.log("[handleSubmit] 현재 로그인 유저:", user);
    console.log("[handleSubmit] 현재 폼 데이터:", formData);

    // 🔥 폼 데이터 검증
    if (!validateFormData()) {
      const confirmSubmit = confirm("기본값으로 보이는 데이터가 감지되었습니다. 정말 저장하시겠습니까?");
      if (!confirmSubmit) {
        return;
      }
    }

    // 🔥 selectedAmbulance 상태 재확인 (userId 기반)
    if (!selectedAmbulance || !selectedAmbulance.id) {
      console.error("selectedAmbulance가 없음. 강제로 fetchAmbulances 재시도");
      
      try {
        await fetchAmbulances();
        
        setTimeout(() => {
          const currentState = useEmergencyStore.getState();
          if (!currentState.selectedAmbulance) {
            alert("구급차 정보를 불러올 수 없습니다. 로그인 상태를 확인하고 다시 시도해주세요.");
            return;
          }
          handleSubmit(e);
        }, 1000);
      } catch (error) {
        console.error("fetchAmbulances 재호출 실패:", error);
        alert("구급차 정보 조회에 실패했습니다. 페이지를 새로고침 해주세요.");
      }
      return;
    }

    // 🔥 userId 검증 추가
    if (selectedAmbulance.id !== user?.userId) {
      console.error("selectedAmbulance ID와 현재 userId가 일치하지 않음");
      console.error("selectedAmbulance.id:", selectedAmbulance.id);
      console.error("user.userId:", user?.userId);
      alert("사용자 정보와 구급차 정보가 일치하지 않습니다. 다시 로그인해주세요.");
      return;
    }

    // 🔥 필수 입력값 체크
    if (
      formData.ktasLevel.includes("선택") ||
      formData.department.includes("선택") ||
      formData.ktasLevel === "" ||
      formData.department === ""
    ) {
      alert("KTAS(중증도)와 진료 과목은 필수 항목입니다.");
      console.warn("필수 입력값 누락:", { ktasLevel: formData.ktasLevel, department: formData.department });
      return;
    }

    // 🔥 업데이트할 환자 정보 구성 (userId 기반)
    let updatedInfo;
    if (isEditMode) {
      console.log("편집 모드: 기존 정보 업데이트");
      const existingPatientInfo = selectedAmbulance.patientInfo || {};
      const existingPatientDetails = selectedAmbulance.patientDetails || {};
      
      updatedInfo = {
        patientInfo: {
          ...existingPatientInfo,
          gender: formData.gender || existingPatientInfo.gender,
          name: formData.name || existingPatientInfo.name,
          age: formData.ageRange || existingPatientInfo.age,
        },
        patientDetails: {
          ...existingPatientDetails,
          ktasLevel: `${formData.ktasLevel}등급`,
          department: formData.department,
          ageRange: formData.ageRange || existingPatientDetails.ageRange,
          chiefComplaint: formData.chiefComplaint || existingPatientDetails.chiefComplaint,
          treatmentDetails: formData.treatmentDetails || existingPatientDetails.treatmentDetails,
          familyHistory: {
            ...(existingPatientDetails.familyHistory || {}),
            father: formData.familyHistory || safeGetComplexObject(existingPatientDetails.familyHistory, 'father'),
          },
          pastHistory: {
            ...(existingPatientDetails.pastHistory || {}),
            hypertension: formData.pastHistory || safeGetComplexObject(existingPatientDetails.pastHistory, 'hypertension'),
          },
          medications: formData.medications
            ? formData.medications.split(",").map((name) => ({ name: name.trim(), indication: "" })).filter((m) => m.name)
            : (existingPatientDetails.medications || []),
          vitalSigns: {
            ...(existingPatientDetails.vitalSigns || {}),
            bloodPressure: formData.vitalSigns || safeGetComplexObject(existingPatientDetails.vitalSigns, 'bloodPressure'),
          },
        },
      };
    } else {
      console.log("신규 입력 모드: 새 정보 생성");
      updatedInfo = {
        patientInfo: {
          gender: formData.gender,
          name: formData.name,
          age: formData.ageRange,
        },
        patientDetails: {
          ktasLevel: `${formData.ktasLevel}등급`,
          department: formData.department,
          ageRange: formData.ageRange,
          chiefComplaint: formData.chiefComplaint,
          treatmentDetails: formData.treatmentDetails,
          familyHistory: { father: formData.familyHistory },
          pastHistory: { hypertension: formData.pastHistory },
          medications: formData.medications
            .split(",")
            .map((name) => ({ name: name.trim(), indication: "" }))
            .filter((m) => m.name),
          vitalSigns: { bloodPressure: formData.vitalSigns },
        },
      };
    }

    // 🔥 API 호출 및 저장 처리 (userId 기반)
    try {
      console.log("[handleSubmit] updatePatientInfo 호출전");
      console.log("ambulanceId (userId):", selectedAmbulance.id);
      console.log("updatedInfo:", updatedInfo);
      
      await updatePatientInfo(selectedAmbulance.id, updatedInfo);
      
      console.log("[handleSubmit] updatePatientInfo 서버 저장 성공 → 페이지 이동");
      navigate("/emergency/", { state: { formData } });
    } catch (error) {
      console.error("[handleSubmit] updatePatientInfo 호출 실패:", error);
      
      if (error.message && error.message.includes("인증")) {
        alert("인증이 만료되었습니다. 다시 로그인해주세요.");
      } else if (error.message && error.message.includes("네트워크")) {
        alert("네트워크 문제가 발생했습니다. 인터넷 연결을 확인해주세요.");
      } else {
        alert("저장에 실패했습니다. 입력 정보를 확인하고 다시 시도해주세요.");
      }
    }
  };

  // 🔥 다음 필기 영역으로 스크롤 이동
  const scrollToNextDrawingArea = () => {
    const nextIndex = currentDrawingIndex + 1;
    if (nextIndex < detailInputRefs.current.length) {
      detailInputRefs.current[nextIndex].scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
      setCurrentDrawingIndex(nextIndex);
      console.log("다음 필기 영역으로 이동:", nextIndex);
    } else {
      detailInputRefs.current[0].scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
      setCurrentDrawingIndex(0);
      console.log("첫 번째 필기 영역으로 이동");
    }
  };

  // 🔥 스크롤 이벤트 핸들러
  const handleScroll = useCallback(() => {
    const target = mainContentRef.current;
    if (!target) return;
    
    const { scrollTop, scrollHeight, clientHeight } = target;
    const isAtBottom = scrollHeight - scrollTop - clientHeight < 10;
    
    setShowScrollButton(!isAtBottom && scrollHeight > clientHeight);
  }, []);

  // 🔥 스크롤 이벤트 리스너 등록
  useEffect(() => {
    const scrollContainer = mainContentRef.current;
    if (!scrollContainer) return;
    
    handleScroll();
    scrollContainer.addEventListener("scroll", handleScroll);
    
    const resizeObserver = new ResizeObserver(handleScroll);
    resizeObserver.observe(scrollContainer);
    
    return () => {
      scrollContainer.removeEventListener("scroll", handleScroll);
      resizeObserver.disconnect();
    };
  }, [handleScroll]);

  return (
    <AmbulanceLayout ref={mainContentRef}>
      <div className="bg-white p-8 rounded-lg shadow-md max-w-4xl mx-auto relative">
        {/* 🔥 디버깅 정보 표시 - 편집 모드 개선 버전 */}
        <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-400 rounded-r-lg">
          <div className="text-xs font-mono space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-gray-700">🚑 구급차 정보 (편집 모드 개선)</span>
              <div className="flex gap-2">
                <button
                  onClick={handleRetryDataLoad}
                  className="px-2 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600 transition-colors"
                  title="데이터 재로딩"
                >
                  🔄 새로고침
                </button>
                <button
                  onClick={handleResetForm}
                  className="px-2 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600 transition-colors"
                  title="폼 초기화"
                >
                  🗑️ 폼 리셋
                </button>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-3">
              <div className="bg-white p-2 rounded border">
                <div className="text-gray-600 text-xs font-semibold mb-1">로그인 정보</div>
                <div><span className="font-bold text-blue-600">유저 ID:</span> <span className="text-blue-800 font-mono">{user?.userId || "❌ 없음"}</span></div>
                <div><span className="font-bold text-green-600">차량번호:</span> <span className="text-green-800 font-mono">{user?.userKey || "❌ 없음"}</span></div>
              </div>
              
              <div className="bg-white p-2 rounded border">
                <div className="text-gray-600 text-xs font-semibold mb-1">선택된 구급차</div>
                <div><span className="font-bold text-purple-600">구급차 ID:</span> <span className="text-purple-800 font-mono">{selectedAmbulance?.id || "❌ 없음"}</span></div>
                <div><span className="font-bold text-orange-600">차량 표시:</span> <span className="text-orange-800 font-mono">{selectedAmbulance?.carNumber || "❌ 없음"}</span></div>
              </div>
            </div>
            
            <div className="mt-2 p-2 bg-white rounded border">
              <div className="text-gray-600 text-xs font-semibold mb-1">편집 모드 상태</div>
              <div className="flex gap-4 flex-wrap">
                <div><span className="font-bold">편집 모드:</span> <span className={isEditMode ? "text-blue-600 font-bold" : "text-gray-600"}>{isEditMode ? "✅ ON" : "❌ OFF"}</span></div>
                <div><span className="font-bold">데이터 로딩:</span> <span className={isDataLoaded ? "text-green-600 font-bold" : "text-yellow-600 font-bold"}>{isDataLoaded ? "✅ 완료" : "⏳ 진행중"}</span></div>
                <div><span className="font-bold">구급차 상태:</span> <span className={selectedAmbulance ? "text-green-600 font-bold" : "text-red-600 font-bold"}>{selectedAmbulance ? "✅ 있음" : "❌ 없음"}</span></div>
                <div><span className="font-bold">ID 일치:</span> <span className={(selectedAmbulance?.id === user?.userId) ? "text-green-600 font-bold" : "text-red-600 font-bold"}>{(selectedAmbulance?.id === user?.userId) ? "✅ 일치" : "❌ 불일치"}</span></div>
              </div>
            </div>

            {/* 🔥 현재 폼 데이터 미리보기 */}
            <div className="mt-2 p-2 bg-yellow-50 rounded border">
              <div className="text-gray-600 text-xs font-semibold mb-1">현재 폼 데이터 미리보기</div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-1 text-xs">
                <div><span className="font-bold">KTAS:</span> <span className={formData.ktasLevel === "1" || formData.ktasLevel === "" ? "text-red-600" : "text-black"}>{formData.ktasLevel || "(빈값)"}</span></div>
                <div><span className="font-bold">진료과목:</span> <span className={formData.department === "외과" || formData.department === "" ? "text-red-600" : "text-black"}>{formData.department || "(빈값)"}</span></div>
                <div><span className="font-bold">성별:</span> <span>{formData.gender || "(빈값)"}</span></div>
                <div><span className="font-bold">이름:</span> <span>{formData.name || "(빈값)"}</span></div>
              </div>
            </div>
          </div>
        </div>

        {/* 🔥 페이지 제목 */}
        <h1 className="text-2xl font-bold mb-6 text-gray-800">
          {isEditMode ? "환자 상세 정보 수정" : "환자 필수 정보 입력"}
        </h1>
        
        {/* 🔥 상단 저장 버튼 (비편집 모드시에만) */}
        {!isEditMode && (
          <div className="absolute top-4 right-4">
            <button
              type="submit"
              form="patient-form"
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg"
            >
              병원 매칭하기 (저장)
            </button>
          </div>
        )}
        
        {/* 🔥 메인 폼 */}
        <form onSubmit={handleSubmit} className="space-y-6" id="patient-form">
          {/* 필수 정보 섹션 */}
          <PatientBasicInfoForm
            formData={formData}
            handleInputChange={handleInputChange}
          />

          {/* 상세 정보 섹션 */}
          <div className="space-y-6 pt-6 relative">
            <InputModeToggle
              inputMode={inputMode}
              toggleInputMode={toggleInputMode}
            />
            
            {/* 이름 + 바이탈 사인 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <PatientDetailInput
                label="이름"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                inputMode={inputMode}
                ref={(el) => (detailInputRefs.current[0] = el)}
              />
              <PatientDetailInput
                label="바이탈 사인 (혈압)"
                name="vitalSigns"
                value={formData.vitalSigns}
                onChange={handleInputChange}
                inputMode={inputMode}
                ref={(el) => (detailInputRefs.current[1] = el)}
              />
            </div>
            
            {/* 주요 증상 (상세) */}
            <PatientDetailInput
              label="주요 증상 (상세)"
              name="chiefComplaint"
              value={formData.chiefComplaint}
              onChange={handleInputChange}
              inputMode={inputMode}
              isTextArea={true}
              ref={(el) => (detailInputRefs.current[2] = el)}
            />
            
            {/* 처치 내용 */}
            <PatientDetailInput
              label="처치 내용"
              name="treatmentDetails"
              value={formData.treatmentDetails}
              onChange={handleInputChange}
              inputMode={inputMode}
              isTextArea={true}
              ref={(el) => (detailInputRefs.current[3] = el)}
            />
            
            {/* 과거력 + 가족력 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <PatientDetailInput
                label="과거력"
                name="pastHistory"
                value={formData.pastHistory}
                onChange={handleInputChange}
                inputMode={inputMode}
                ref={(el) => (detailInputRefs.current[4] = el)}
              />
              <PatientDetailInput
                label="가족력"
                name="familyHistory"
                value={formData.familyHistory}
                onChange={handleInputChange}
                inputMode={inputMode}
                ref={(el) => (detailInputRefs.current[5] = el)}
              />
            </div>
            
            {/* 복용중인 약 */}
            <PatientDetailInput
              label="복용중인 약"
              name="medications"
              value={formData.medications}
              onChange={handleInputChange}
              inputMode={inputMode}
              ref={(el) => (detailInputRefs.current[6] = el)}
            />
          </div>
          
          {/* 🔥 하단 저장 버튼 */}
          <div className="flex justify-end pt-6 border-t border-gray-200">
            <button
              type="submit"
              className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105"
            >
              {isEditMode ? "정보 저장" : "병원 매칭"}
            </button>
          </div>
        </form>
      </div>
      
      {/* 🔥 고정된 "다음 필기 공간" 버튼 - 그리기 모드에서만 표시 */}
      {inputMode === "drawing" && showScrollButton && (
        <button
          onClick={scrollToNextDrawingArea}
          className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-gray-700 hover:bg-gray-800 text-white font-bold py-3 px-6 rounded-full shadow-lg z-50 opacity-60 hover:opacity-100 transition-all duration-300 hover:scale-110"
          title="다음 필기 공간으로 이동"
        >
          <i className="fas fa-chevron-down text-xl"></i>
        </button>
      )}
    </AmbulanceLayout>
  );
}
