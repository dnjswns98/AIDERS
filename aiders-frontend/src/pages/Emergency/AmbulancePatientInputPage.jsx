// src/pages/Emergency/AmbulancePatientInputPage.jsx

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import AmbulanceLayout from "../../components/Emergency/Layout/AmbulanceLayout";
import useEmergencyStore from "../../store/useEmergencyStore";
import { useAuthStore } from "../../store/useAuthStore";
import InputModeToggle from "../../components/Emergency/PatientInput/InputModeToggle";
import PatientBasicInfoForm from "../../components/Emergency/PatientInput/PatientBasicInfoForm";
import PatientDetailInput from "../../components/Emergency/PatientInput/PatientDetailInput";

import HandwritingTextInput from "../../components/Emergency/HandwritingTextInput";
import { useCRNNModel } from "../../hooks/useCRNNModel";

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
  
  if (typeof cleaned === 'string' && cleaned.includes('등급')) {
    const number = cleaned.replace(/[^0-9]/g, '');
    return number || "";
  }
  
  return cleaned;
};

const safeGetComplexObject = (obj, path, fallback = "") => {
  if (!obj || typeof obj !== 'object') return fallback;
  
  try {
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
      if (medications.startsWith('[')) {
        const parsed = JSON.parse(medications);
        return safeGetMedications(parsed);
      }
      return medications;
    }
    
    return "";
  } catch (error) {
    return "";
  }
};

export default function AmbulancePatientInputPage() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const isEditMode = state?.isEditMode || false;

  const { 
    selectedAmbulance, 
    updatePatientInfo, 
    fetchAmbulances, 
    debugCurrentState 
  } = useEmergencyStore();
  const { user } = useAuthStore();

  const { isModelLoaded, isProcessing, convertHandwritingToText, initializeModel } = useCRNNModel();

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

  const [inputModes, setInputModes] = useState({
    name: "typing",
    chiefComplaint: "typing", 
    treatmentDetails: "typing",
    familyHistory: "typing",
    pastHistory: "typing",
    medications: "typing",
    vitalSigns: "typing"
  });

  const [handwritingData, setHandwritingData] = useState({
    name: "",
    chiefComplaint: "",
    treatmentDetails: "",
    familyHistory: "",
    pastHistory: "",
    medications: "",
    vitalSigns: ""
  });

  const [inputMode, setInputMode] = useState("drawing");
  const detailInputRefs = useRef([]);
  const [currentDrawingIndex, setCurrentDrawingIndex] = useState(0);
  const mainContentRef = useRef(null);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [isDataLoaded, setIsDataLoaded] = useState(false);

  useEffect(() => {
    initializeModel();
  }, [initializeModel]);

  useEffect(() => {
    debugCurrentState();
    
    if (!selectedAmbulance) {
      fetchAmbulances();
    } else if (selectedAmbulance.id !== user?.userId) {
      fetchAmbulances();
    }
  }, []);

  useEffect(() => {
  }, [selectedAmbulance]);

  useEffect(() => {
    if (isEditMode && selectedAmbulance && !isDataLoaded) {
      
      const patientInfo = selectedAmbulance.patientInfo || {};
      const patientDetails = selectedAmbulance.patientDetails || {};
      
      const extractedKtas = safeGetKtasLevel(patientDetails.ktasLevel);
      const extractedDepartment = safeGetValue(patientDetails.department);
      const extractedGender = safeGetValue(patientInfo.gender);
      const extractedAgeRange = safeGetValue(patientDetails.ageRange);
      const extractedName = safeGetValue(patientInfo.name);
      const extractedChiefComplaint = safeGetValue(patientDetails.chiefComplaint);
      const extractedTreatmentDetails = safeGetValue(patientDetails.treatmentDetails);
      const extractedFamilyHistory = safeGetComplexObject(patientDetails.familyHistory, 'father');
      const extractedPastHistory = safeGetComplexObject(patientDetails.pastHistory, 'hypertension');
      const extractedMedications = safeGetMedications(patientDetails.medications);
      const extractedVitalSigns = safeGetComplexObject(patientDetails.vitalSigns, 'bloodPressure');
      
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
      
      const hasValidData = Object.values(newFormData).some(value => 
        value && value.trim && value.trim() !== ""
      );
      
      if (hasValidData) {
        setFormData(newFormData);
        setIsDataLoaded(true);
      } else {
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
      
    } else if (!isEditMode && !isDataLoaded) {
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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    setFormData((prev) => {
      const newData = { ...prev, [name]: value };
      return newData;
    });
  };

  const handleHandwritingInputChange = useCallback((fieldName) => (value) => {
    
    setFormData((prev) => {
      const newData = { ...prev, [fieldName]: value };
      return newData;
    });
  }, []);

  const toggleInputMode = () => {
    setInputMode((prevMode) => (prevMode === "drawing" ? "typing" : "drawing"));
  };

  const validateFormData = () => {
    const issues = [];
    
    Object.entries(formData).forEach(([key, value]) => {
      if (value && (
        value.includes('선택') || 
        value === '선택해주세요' || 
        value === 'unknown' ||
        value === '1' ||
        value === '외과'
      )) {
        issues.push(`${key}: ${value} (의심스러운 기본값)`);
      }
    });
    
    if (issues.length > 0) {
      return false;
    }
    
    return true;
  };

  const handleRetryDataLoad = async () => {
    setIsDataLoaded(false);
    try {
      await fetchAmbulances();
    } catch (error) {
      console.error("데이터 재로딩 실패:", error);
      alert("데이터를 불러오는데 실패했습니다. 페이지를 새로고침 해주세요.");
    }
  };

  const handleResetForm = () => {
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
    
    setHandwritingData({
      name: "",
      chiefComplaint: "",
      treatmentDetails: "",
      familyHistory: "",
      pastHistory: "",
      medications: "",
      vitalSigns: ""
    });
    
    setIsDataLoaded(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateFormData()) {
      const confirmSubmit = confirm("기본값으로 보이는 데이터가 감지되었습니다. 정말 저장하시겠습니까?");
      if (!confirmSubmit) {
        return;
      }
    }

    if (!selectedAmbulance || !selectedAmbulance.id) {
      
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

    if (selectedAmbulance.id !== user?.userId) {
      alert("사용자 정보와 구급차 정보가 일치하지 않습니다. 다시 로그인해주세요.");
      return;
    }

    if (
      formData.ktasLevel.includes("선택") ||
      formData.department.includes("선택") ||
      formData.ktasLevel === "" ||
      formData.department === ""
    ) {
      alert("KTAS(중증도)와 진료 과목은 필수 항목입니다.");
      return;
    }

    let updatedInfo;
    if (isEditMode) {
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

    try {
      
      await updatePatientInfo(selectedAmbulance.id, updatedInfo);
      
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

  const scrollToNextDrawingArea = () => {
    const nextIndex = currentDrawingIndex + 1;
    if (nextIndex < detailInputRefs.current.length) {
      detailInputRefs.current[nextIndex].scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
      setCurrentDrawingIndex(nextIndex);
    } else {
      detailInputRefs.current[0].scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
      setCurrentDrawingIndex(0);
    }
  };

  const handleScroll = useCallback(() => {
    const target = mainContentRef.current;
    if (!target) return;
    
    const { scrollTop, scrollHeight, clientHeight } = target;
    const isAtBottom = scrollHeight - scrollTop - clientHeight < 10;
    
    setShowScrollButton(!isAtBottom && scrollHeight > clientHeight);
  }, []);

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
        <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-400 rounded-r-lg">
          <div className="text-xs font-mono space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-gray-700">🚑 구급차 정보 (필기 인식 통합 버전)</span>
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
            
            <div className="mt-2 p-2 bg-gradient-to-r from-green-50 to-blue-50 rounded border">
              <div className="text-gray-600 text-xs font-semibold mb-1">🤖 CRNN 필기 인식 모델</div>
              <div className="flex gap-4 flex-wrap">
                <div><span className="font-bold">모델 로드:</span> 
                  <span className={isModelLoaded ? "text-green-600 font-bold ml-1" : "text-yellow-600 font-bold ml-1"}>
                    {isModelLoaded ? "✅ 완료" : "⏳ 로딩중"}
                  </span>
                </div>
                <div><span className="font-bold">처리 상태:</span> 
                  <span className={isProcessing ? "text-blue-600 font-bold ml-1" : "text-gray-600 ml-1"}>
                    {isProcessing ? "🔄 변환중" : "⏸️ 대기"}
                  </span>
                </div>
                <div className="text-xs text-gray-500">
                  필기 → 텍스트 자동 변환 지원
                </div>
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

        <h1 className="text-2xl font-bold mb-6 text-gray-800">
          {isEditMode ? "환자 상세 정보 수정" : "환자 필수 정보 입력"}
          <span className="ml-2 text-sm text-blue-600 font-normal">
            🖋️ 필기 인식 지원
          </span>
        </h1>
        
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
        
        <form onSubmit={handleSubmit} className="space-y-6" id="patient-form">
          <PatientBasicInfoForm
            formData={formData}
            handleInputChange={handleInputChange}
          />

          <div className="space-y-6 pt-6 relative">
            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <span className="mr-2">📝</span>
                상세 정보 (필기 또는 타이핑 입력)
                {!isModelLoaded && (
                  <div className="ml-3 flex items-center text-xs text-orange-600">
                    <div className="animate-spin rounded-full h-3 w-3 border-b border-orange-600 mr-1"></div>
                    <span>CRNN 모델 로딩중...</span>
                  </div>
                )}
              </h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <HandwritingTextInput
                label="환자 이름"
                value={formData.name}
                onChange={handleHandwritingInputChange('name')}
                placeholder="환자의 이름을 입력하거나 필기로 작성하세요"
                disabled={!isModelLoaded}
              />
              
              <HandwritingTextInput
                label="바이탈 사인 (혈압)"
                value={formData.vitalSigns}
                onChange={handleHandwritingInputChange('vitalSigns')}
                placeholder="혈압 수치를 입력하거나 필기로 작성하세요"
                disabled={!isModelLoaded}
              />
            </div>
            
            <HandwritingTextInput
              label="주요 증상 (상세)"
              value={formData.chiefComplaint}
              onChange={handleHandwritingInputChange('chiefComplaint')}
              placeholder="환자의 주요 증상을 상세히 입력하거나 필기로 작성하세요"
              disabled={!isModelLoaded}
              required
            />
            
            <HandwritingTextInput
              label="처치 내용"
              value={formData.treatmentDetails}
              onChange={handleHandwritingInputChange('treatmentDetails')}
              placeholder="현장에서 실시한 처치 내용을 입력하거나 필기로 작성하세요"
              disabled={!isModelLoaded}
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <HandwritingTextInput
                label="과거 병력"
                value={formData.pastHistory}
                onChange={handleHandwritingInputChange('pastHistory')}
                placeholder="환자의 과거 병력을 입력하거나 필기로 작성하세요"
                disabled={!isModelLoaded}
              />
              
              <HandwritingTextInput
                label="가족력"
                value={formData.familyHistory}
                onChange={handleHandwritingInputChange('familyHistory')}
                placeholder="가족의 병력을 입력하거나 필기로 작성하세요"
                disabled={!isModelLoaded}
              />
            </div>
            
            <HandwritingTextInput
              label="복용 중인 약물"
              value={formData.medications}
              onChange={handleHandwritingInputChange('medications')}
              placeholder="현재 복용 중인 약물을 입력하거나 필기로 작성하세요 (쉼표로 구분)"
              disabled={!isModelLoaded}
            />
          </div>
          
          <div className="flex justify-end pt-6 border-t border-gray-200">
            <button
              type="submit"
              className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 shadow-md hover:shadow-lg"
            >
              {isEditMode ? "정보 저장" : "병원 매칭"}
            </button>
          </div>
        </form>
      </div>
      
      {showScrollButton && (
        <button
          onClick={scrollToNextDrawingArea}
          className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-gray-700 hover:bg-gray-800 text-white font-bold py-3 px-6 rounded-full shadow-lg z-50 opacity-60 hover:opacity-100 transition-all duration-300 hover:scale-110"
          title="다음 필기 공간으로 이동"
        >
          <span className="flex items-center space-x-2">
            <span>🖋️</span>
            <span className="text-sm">다음 필기 영역</span>
            <i className="fas fa-chevron-down text-sm"></i>
          </span>
        </button>
      )}

      {!isModelLoaded && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 shadow-xl max-w-md mx-4">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">필기 인식 모델 로딩 중...</h3>
              <p className="text-sm text-gray-600 mb-4">
                CRNN 모델을 불러오고 있습니다. 잠시만 기다려주세요.
              </p>
              <div className="bg-blue-50 border border-blue-200 rounded p-3">
                <p className="text-xs text-blue-700">
                  📂 모델 파일: public/model/<br/>
                  📂 알파벳: public/alphabet/<br/>
                  🤖 필기 → 텍스트 자동 변환 준비 중
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </AmbulanceLayout>
  );
}