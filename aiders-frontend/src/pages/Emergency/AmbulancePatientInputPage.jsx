// src/pages/Emergency/AmbulancePatientInputPage.jsx

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import AmbulanceLayout from "../../components/Emergency/Layout/AmbulanceLayout";
import useEmergencyStore from "../../store/useEmergencyStore";
import { useAuthStore } from "../../store/useAuthStore";
import PatientDetailInput from "../../components/Emergency/PatientInput/PatientDetailInput";
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

  // 단계 관리 (0: KTAS, 1: 진료과목, 2: 성별, 3: 연령대, 4: 완료)
  const [currentStep, setCurrentStep] = useState(0);
  
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

  const [isDataLoaded, setIsDataLoaded] = useState(false);

  // KTAS 등급 옵션
  const ktasOptions = [
    { level: "1", label: "1등급", description: "즉시", color: "bg-red-500 hover:bg-red-600" },
    { level: "2", label: "2등급", description: "10분", color: "bg-orange-500 hover:bg-orange-600" },
    { level: "3", label: "3등급", description: "30분", color: "bg-yellow-500 hover:bg-yellow-600" },
    { level: "4", label: "4등급", description: "60분", color: "bg-green-500 hover:bg-green-600" },
    { level: "5", label: "5등급", description: "120분", color: "bg-blue-500 hover:bg-blue-600" }
  ];

  // 진료과목 옵션
  const departmentOptions = [
    "응급의학과", "내과", "외과", "정형외과", "신경외과", "흉부외과",
    "산부인과", "소아청소년과", "신경과", "정신건강의학과", "안과", "이비인후과",
    "피부과", "비뇨의학과", "영상의학과", "마취통증의학과", "기타"
  ];

  // 성별 옵션
  const genderOptions = [
    { value: "남성", label: "남성", icon: "👨" },
    { value: "여성", label: "여성", icon: "👩" }
  ];

  // 연령대 옵션
  const ageRangeOptions = [
    "영아 (0-1세)", "유아 (2-7세)", "아동 (8-13세)", 
    "청소년 (14-19세)", "청년 (20-39세)", "중년 (40-64세)", "노년 (65세 이상)"
  ];

  const steps = ["KTAS", "진료과목", "성별", "연령대"];

  // 필수 정보 입력 완료 여부 확인
  const isEssentialDataComplete = formData.ktasLevel && formData.department;
  
  // 모든 기본 정보 입력 완료 여부 확인  
  const isAllBasicDataComplete = formData.ktasLevel && formData.department && formData.gender && formData.ageRange;

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
        // 편집 모드일 때는 완료 단계로 이동
        if (newFormData.ktasLevel && newFormData.department && newFormData.gender && newFormData.ageRange) {
          setCurrentStep(4);
        }
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

  // 단계별 선택 핸들러
  const handleStepSelection = (step, value) => {
    const fieldMap = {
      0: 'ktasLevel',
      1: 'department', 
      2: 'gender',
      3: 'ageRange'
    };

    setFormData(prev => ({
      ...prev,
      [fieldMap[step]]: value
    }));

    // 다음 단계로 자동 이동
    if (step < 3) {
      setTimeout(() => {
        setCurrentStep(step + 1);
      }, 300);
    } else {
      // 마지막 단계 완료
      setTimeout(() => {
        setCurrentStep(4);
      }, 300);
    }
  };

  // 단계 클릭으로 해당 단계로 이동
  const goToStep = (step) => {
    setCurrentStep(step);
  };

  // 병원 매칭 (기본 정보만으로)
  const handleHospitalMatching = async () => {
    if (!formData.ktasLevel || !formData.department) {
      alert("KTAS와 진료과목은 필수입니다!");
      return;
    }

    await submitBasicInfo();
  };

  // 선택사항 입력 후 병원 매칭
  const handleDetailedInput = () => {
    // 선택사항 입력 화면으로 이동하면서 병원 매칭도 진행
    setCurrentStep(5); // 상세 입력 단계
  };

  const submitBasicInfo = async () => {
    if (!selectedAmbulance || !selectedAmbulance.id) {
      try {
        await fetchAmbulances();
        setTimeout(() => {
          const currentState = useEmergencyStore.getState();
          if (!currentState.selectedAmbulance) {
            alert("구급차 정보를 불러올 수 없습니다. 로그인 상태를 확인하고 다시 시도해주세요.");
            return;
          }
          submitBasicInfo();
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
            ? formData.medications.split(",").map((name) => ({ name: name.trim(), indication: "" })).filter((m) => m.name)
            : [],
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

  const handleDetailSubmit = async (detailData) => {
    // 상세 정보와 함께 저장하고 병원 매칭
    setFormData(prev => ({ ...prev, ...detailData }));
    await submitBasicInfo();
  };

  // 진행 표시줄 렌더링
  const renderProgressBar = () => (
    <div className="mb-6">
      <div className="flex justify-between items-center mb-4">
        {steps.map((step, index) => (
          <div
            key={index}
            onClick={() => goToStep(index)}
            className={`flex-1 text-center cursor-pointer transition-all duration-300 ${
              index === currentStep 
                ? 'text-blue-600 font-bold' 
                : index < currentStep 
                  ? 'text-green-600 font-medium' 
                  : 'text-gray-400'
            }`}
          >
            <div className={`w-8 h-8 mx-auto mb-2 rounded-full flex items-center justify-center text-white text-sm font-bold ${
              index === currentStep 
                ? 'bg-blue-600' 
                : index < currentStep 
                  ? 'bg-green-600' 
                  : 'bg-gray-300'
            }`}>
              {index < currentStep ? '✓' : index + 1}
            </div>
            <div className="text-xs">{step}</div>
          </div>
        ))}
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div 
          className="bg-blue-600 h-2 rounded-full transition-all duration-500"
          style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
        ></div>
      </div>
    </div>
  );

  // KTAS 선택 화면
  const renderKtasStep = () => (
    <div className="text-center">
      <h2 className="text-2xl font-bold mb-2 text-gray-800">중증도 분류 (KTAS)</h2>
      <p className="text-gray-600 mb-8">환자의 중증도를 선택해주세요</p>
      
      <div className="space-y-4">
        {ktasOptions.map((option) => (
          <button
            key={option.level}
            onClick={() => handleStepSelection(0, option.level)}
            className={`w-full p-6 rounded-xl border-2 transition-all duration-300 ${
              formData.ktasLevel === option.level
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            } ${option.color} text-white hover:shadow-lg transform hover:scale-105`}
          >
            <div className="flex items-center justify-between">
              <div className="text-left">
                <div className="text-xl font-bold">{option.label}</div>
                <div className="text-sm opacity-90">{option.description} 이내</div>
              </div>
              <div className="text-3xl font-bold">{option.level}</div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );

  // 진료과목 선택 화면
  const renderDepartmentStep = () => (
    <div className="text-center">
      <h2 className="text-2xl font-bold mb-2 text-gray-800">진료과목</h2>
      <p className="text-gray-600 mb-8">해당하는 진료과목을 선택해주세요</p>
      
      <div className="grid grid-cols-2 gap-3">
        {departmentOptions.map((dept) => (
          <button
            key={dept}
            onClick={() => handleStepSelection(1, dept)}
            className={`p-4 rounded-lg border-2 transition-all duration-300 ${
              formData.department === dept
                ? 'border-blue-500 bg-blue-50 text-blue-700'
                : 'border-gray-200 hover:border-gray-300 text-gray-700'
            } hover:shadow-md transform hover:scale-105`}
          >
            <div className="font-medium">{dept}</div>
          </button>
        ))}
      </div>
    </div>
  );

  // 성별 선택 화면
  const renderGenderStep = () => (
    <div className="text-center">
      <h2 className="text-2xl font-bold mb-2 text-gray-800">성별</h2>
      <p className="text-gray-600 mb-8">환자의 성별을 선택해주세요</p>
      
      <div className="grid grid-cols-2 gap-6">
        {genderOptions.map((gender) => (
          <button
            key={gender.value}
            onClick={() => handleStepSelection(2, gender.value)}
            className={`p-8 rounded-xl border-2 transition-all duration-300 ${
              formData.gender === gender.value
                ? 'border-blue-500 bg-blue-50 text-blue-700'
                : 'border-gray-200 hover:border-gray-300 text-gray-700'
            } hover:shadow-lg transform hover:scale-105`}
          >
            <div className="text-4xl mb-2">{gender.icon}</div>
            <div className="text-xl font-medium">{gender.label}</div>
          </button>
        ))}
      </div>
    </div>
  );

  // 연령대 선택 화면
  const renderAgeRangeStep = () => (
    <div className="text-center">
      <h2 className="text-2xl font-bold mb-2 text-gray-800">연령대</h2>
      <p className="text-gray-600 mb-8">환자의 연령대를 선택해주세요</p>
      
      <div className="space-y-3">
        {ageRangeOptions.map((age) => (
          <button
            key={age}
            onClick={() => handleStepSelection(3, age)}
            className={`w-full p-4 rounded-lg border-2 transition-all duration-300 ${
              formData.ageRange === age
                ? 'border-blue-500 bg-blue-50 text-blue-700'
                : 'border-gray-200 hover:border-gray-300 text-gray-700'
            } hover:shadow-md transform hover:scale-105`}
          >
            <div className="font-medium">{age}</div>
          </button>
        ))}
      </div>
    </div>
  );

  // 완료 화면 (선택지 제공)
  const renderCompletionStep = () => (
    <div className="text-center">
      <h2 className="text-2xl font-bold mb-2 text-gray-800">기본 정보 입력 완료</h2>
      <p className="text-gray-600 mb-8">다음 단계를 선택해주세요</p>
      
      {/* 입력된 정보 요약 */}
      <div className="bg-gray-50 p-6 rounded-lg mb-8">
        <h3 className="font-bold mb-4">입력된 정보</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="font-medium">KTAS:</span> {formData.ktasLevel}등급
          </div>
          <div>
            <span className="font-medium">진료과목:</span> {formData.department}
          </div>
          <div>
            <span className="font-medium">성별:</span> {formData.gender}
          </div>
          <div>
            <span className="font-medium">연령대:</span> {formData.ageRange}
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <button
          onClick={handleHospitalMatching}
          className="w-full p-6 bg-blue-600 text-white rounded-xl font-bold text-lg hover:bg-blue-700 transition-all duration-300 transform hover:scale-105 shadow-lg"
        >
          🏥 병원 매칭하기
          <div className="text-sm font-normal opacity-90 mt-1">기본 정보로 바로 병원을 찾습니다</div>
        </button>
        
        <button
          onClick={handleDetailedInput}
          className="w-full p-6 bg-green-600 text-white rounded-xl font-bold text-lg hover:bg-green-700 transition-all duration-300 transform hover:scale-105 shadow-lg"
        >
          📝 선택사항 입력하기
          <div className="text-sm font-normal opacity-90 mt-1">추가 정보를 입력한 후 병원을 찾습니다</div>
        </button>
      </div>
    </div>
  );

  // 상세 입력 화면
  const renderDetailInputStep = () => (
    <div>
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold mb-2 text-gray-800">상세 정보 입력 (선택사항)</h2>
        <p className="text-gray-600">추가 정보를 입력하면 더 정확한 병원 매칭이 가능합니다</p>
      </div>
      
      <PatientDetailInput
        formData={formData}
        onInputChange={(field, value) => setFormData(prev => ({ ...prev, [field]: value }))}
        onSubmit={handleDetailSubmit}
        isModelLoaded={isModelLoaded}
        isProcessing={isProcessing}
      />
    </div>
  );

  // 하단 고정 버튼 영역 렌더링
  const renderBottomActions = () => {
    // 상세 입력 단계에서는 하단 버튼 숨김
    if (currentStep === 5) return null;
    
    // 완료 단계에서는 하단 버튼 숨김 (이미 위에 버튼들이 있음)
    if (currentStep === 4) return null;

    return (
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg p-4 z-50">
        <div className="max-w-2xl mx-auto">
          {/* 필수 정보(KTAS + 진료과목) 입력 완료 시 병원 매칭 버튼 표시 */}
          {isEssentialDataComplete && (
            <div className="space-y-3">
              {/* 입력된 필수 정보 미니 요약 */}
              <div className="text-center text-sm text-gray-600 mb-3">
                <span className="font-medium text-blue-600">
                  KTAS {formData.ktasLevel}등급 • {formData.department}
                </span>
                {formData.gender && <span> • {formData.gender}</span>}
                {formData.ageRange && <span> • {formData.ageRange}</span>}
              </div>
              
              <button
                onClick={handleHospitalMatching}
                className="w-full p-4 bg-blue-600 text-white rounded-xl font-bold text-lg hover:bg-blue-700 transition-all duration-300 shadow-lg"
              >
                🏥 병원 매칭하기
                <div className="text-sm font-normal opacity-90">필수 정보로 바로 병원을 찾습니다</div>
              </button>
              
              {/* 모든 기본 정보가 완료되면 상세 입력 버튼도 표시 */}
              {isAllBasicDataComplete && (
                <button
                  onClick={handleDetailedInput}
                  className="w-full p-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-all duration-300"
                >
                  📝 상세 정보 추가 입력
                </button>
              )}
            </div>
          )}
          
          {/* 필수 정보가 아직 미완료인 경우 */}
          {!isEssentialDataComplete && (
            <div className="text-center text-gray-500">
              <div className="text-sm mb-2">병원 매칭을 위해 다음 정보가 필요합니다</div>
              <div className="flex justify-center space-x-4 text-xs">
                <span className={formData.ktasLevel ? 'text-green-600' : 'text-red-500'}>
                  {formData.ktasLevel ? '✓' : '✗'} KTAS
                </span>
                <span className={formData.department ? 'text-green-600' : 'text-red-500'}>
                  {formData.department ? '✓' : '✗'} 진료과목
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <AmbulanceLayout>
      <div className="max-w-2xl mx-auto p-6 min-h-screen pb-32">
        {/* 단계가 4(완료) 미만일 때만 진행 표시줄 표시 */}
        {currentStep < 4 && renderProgressBar()}
        
        <div className="bg-white rounded-lg shadow-lg p-6">
          {currentStep === 0 && renderKtasStep()}
          {currentStep === 1 && renderDepartmentStep()}
          {currentStep === 2 && renderGenderStep()}
          {currentStep === 3 && renderAgeRangeStep()}
          {currentStep === 4 && renderCompletionStep()}
          {currentStep === 5 && renderDetailInputStep()}
        </div>

        {/* 뒷걸음질 버튼 (첫 단계가 아닐 때만) */}
        {currentStep > 0 && currentStep < 5 && (
          <div className="mt-4 text-center mb-20">
            <button
              onClick={() => setCurrentStep(currentStep - 1)}
              className="px-6 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-all duration-300"
            >
              ← 이전 단계
            </button>
          </div>
        )}
      </div>

      {/* 하단 고정 버튼 영역 */}
      {renderBottomActions()}
    </AmbulanceLayout>
  );
}
