// src/pages/Emergency/AmbulancePatientInputPage.jsx

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import AmbulanceLayout from "../../components/Emergency/Layout/AmbulanceLayout";
import useEmergencyStore from "../../store/useEmergencyStore";
import { useAuthStore } from "../../store/useAuthStore";
import PatientBasicInfoForm from "../../components/Emergency/PatientInput/PatientBasicInfoForm";
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
    selectMyAmbulance,
    debugCurrentState
  } = useEmergencyStore();

  const { user } = useAuthStore();
  const { isModelLoaded, isProcessing, convertHandwritingToText, initializeModel } = useCRNNModel();

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

  const mainContentRef = useRef(null);
  const [isDataLoaded, setIsDataLoaded] = useState(false);

  const ktasOptions = [
    { level: "1", label: "1등급", description: "즉시", color: "bg-red-500 hover:bg-red-600" },
    { level: "2", label: "2등급", description: "10분", color: "bg-orange-500 hover:bg-orange-600" },
    { level: "3", label: "3등급", description: "30분", color: "bg-yellow-500 hover:bg-yellow-600" },
    { level: "4", label: "4등급", description: "60분", color: "bg-green-500 hover:bg-green-600" },
    { level: "5", label: "5등급", description: "120분", color: "bg-blue-500 hover:bg-blue-600" }
  ];

  const departmentOptions = [
    "응급의학과", "내과", "외과", "정형외과", "신경외과", "흉부외과",
    "산부인과", "소아청소년과", "신경과", "정신건강의학과", "안과", "이비인후과",
    "피부과", "비뇨의학과", "영상의학과", "마취통증의학과", "기타"
  ];

  const genderOptions = [
    { value: "남성", label: "남성", icon: "👨" },
    { value: "여성", label: "여성", icon: "👩" }
  ];

  const ageRangeOptions = [
    "영아 (0-1세)", "유아 (2-7세)", "아동 (8-13세)", 
    "청소년 (14-19세)", "청년 (20-39세)", "중년 (40-64세)", "노년 (65세 이상)"
  ];

  const steps = ["KTAS", "진료과목", "성별", "연령대"];

  const isEssentialDataComplete = formData.ktasLevel && formData.department;
  
  const isAllBasicDataComplete = formData.ktasLevel && formData.department && formData.gender && formData.ageRange;

  useEffect(() => {
    initializeModel();
  }, [initializeModel]);

  useEffect(() => {
    if (!selectedAmbulance) {
      selectMyAmbulance();
    }
  }, [selectedAmbulance, selectMyAmbulance]);

  useEffect(() => {
    if (isEditMode && selectedAmbulance && !isDataLoaded) {
      const patientInfo = selectedAmbulance.patientInfo || {};
      const patientDetails = selectedAmbulance.patientDetails || {};
      
      const newFormData = {
        ktasLevel: safeGetKtasLevel(patientDetails.ktasLevel),
        department: safeGetValue(patientDetails.department),
        gender: safeGetValue(patientInfo.gender),
        ageRange: safeGetValue(patientDetails.ageRange),
        name: safeGetValue(patientInfo.name),
        chiefComplaint: safeGetValue(patientDetails.chiefComplaint),
        treatmentDetails: safeGetValue(patientDetails.treatmentDetails),
        familyHistory: safeGetComplexObject(patientDetails.familyHistory, 'father'),
        pastHistory: safeGetComplexObject(patientDetails.pastHistory, 'hypertension'),
        medications: safeGetMedications(patientDetails.medications),
        vitalSigns: safeGetComplexObject(patientDetails.vitalSigns, 'bloodPressure'),
      };
      
      setFormData(newFormData);
      setIsDataLoaded(true);
      
    } else if (!isEditMode && !isDataLoaded) {
      setFormData({
        ktasLevel: "", department: "", gender: "", ageRange: "", name: "",
        chiefComplaint: "", treatmentDetails: "", familyHistory: "",
        pastHistory: "", medications: "", vitalSigns: "",
      });
      setIsDataLoaded(true);
    }
  }, [isEditMode, selectedAmbulance, isDataLoaded]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleHandwritingInputChange = useCallback((fieldName) => (value) => {
    setFormData((prev) => ({ ...prev, [fieldName]: value }));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedAmbulance || !selectedAmbulance.id) {
      alert("구급차 정보를 불러올 수 없습니다. 로그인 상태를 확인하고 다시 시도해주세요.");
      return;
    }

    if (
      !formData.ktasLevel || formData.ktasLevel.includes("선택") ||
      !formData.department || formData.department.includes("선택")
    ) {
      alert("KTAS(중증도)와 진료 과목은 필수 항목입니다.");
      return;
    }

    const updatedInfo = {
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
            .split(",").map((name) => ({ name: name.trim(), indication: "" })).filter((m) => m.name),
          vitalSigns: { bloodPressure: formData.vitalSigns },
        },
    };

    try {
      await updatePatientInfo(selectedAmbulance.id, updatedInfo);
      
      // ✅ 수정된 부분: 환자 정보 입력 후 '지도' 페이지로 이동
      navigate("/emergency/map", { state: { formData } });
      
    } catch (error) {
      console.error("[handleSubmit] updatePatientInfo 호출 실패:", error);
      alert("저장에 실패했습니다. 입력 정보를 확인하고 다시 시도해주세요.");
    }
  };

  const renderKtasStep = () => (
    <div className="space-y-4">
      <h3 className="text-xl font-bold text-gray-800 mb-4">1. KTAS 등급 선택</h3>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {ktasOptions.map((option) => (
          <button
            key={option.level}
            type="button"
            onClick={() => {
              setFormData((prev) => ({ ...prev, ktasLevel: option.level }));
              setCurrentStep(1);
            }}
            className={`px-4 py-8 rounded-lg shadow-md transition-colors duration-200 text-white font-bold text-lg text-center ${option.color}`}
          >
            {option.label}
            <p className="text-xs font-normal mt-1">{option.description}</p>
          </button>
        ))}
      </div>
    </div>
  );

  const renderDepartmentStep = () => (
    <div className="space-y-4">
      <h3 className="text-xl font-bold text-gray-800 mb-4">2. 진료 과목 선택</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {departmentOptions.map((dept) => (
          <button
            key={dept}
            type="button"
            onClick={() => {
              setFormData((prev) => ({ ...prev, department: dept }));
              setCurrentStep(2);
            }}
            className={`px-4 py-3 rounded-lg shadow-sm transition-colors duration-200 text-sm font-medium ${
              formData.department === dept
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {dept}
          </button>
        ))}
      </div>
    </div>
  );

  const renderGenderStep = () => (
    <div className="space-y-4">
      <h3 className="text-xl font-bold text-gray-800 mb-4">3. 환자 성별 선택</h3>
      <div className="flex flex-wrap gap-4">
        {genderOptions.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => {
              setFormData((prev) => ({ ...prev, gender: option.value }));
              setCurrentStep(3);
            }}
            className={`flex-1 p-8 rounded-lg shadow-md transition-colors duration-200 text-lg text-center ${
              formData.gender === option.value
                ? 'bg-purple-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            <span className="text-4xl block mb-2">{option.icon}</span>
            <span className="font-bold">{option.label}</span>
          </button>
        ))}
      </div>
    </div>
  );

  const renderAgeRangeStep = () => (
    <div className="space-y-4">
      <h3 className="text-xl font-bold text-gray-800 mb-4">4. 환자 연령대 선택</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {ageRangeOptions.map((range) => (
          <button
            key={range}
            type="button"
            onClick={() => {
              setFormData((prev) => ({ ...prev, ageRange: range }));
              setCurrentStep(4);
            }}
            className={`px-4 py-3 rounded-lg shadow-sm transition-colors duration-200 text-sm font-medium ${
              formData.ageRange === range
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {range}
          </button>
        ))}
      </div>
    </div>
  );

  const renderCompletionStep = () => (
    <div className="text-center space-y-6">
      <div className="text-6xl text-green-500">
        ✅
      </div>
      <h3 className="text-2xl font-bold text-gray-800">
        환자 정보 입력 완료
      </h3>
      <p className="text-lg text-gray-600">
        환자 정보가 성공적으로 입력되었습니다.
      </p>
      <div className="flex justify-center space-x-4 pt-6">
        <button
          onClick={() => navigate("/emergency")}
          className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-100 transition-colors"
        >
          대시보드로 돌아가기
        </button>
        <button
          onClick={() => setCurrentStep(5)}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
        >
          추가 정보 입력
        </button>
      </div>
    </div>
  );
  
  const renderDetailInputStep = () => (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="p-4 bg-gray-50 rounded-lg">
        <h3 className="text-xl font-bold text-gray-800 mb-4">5. 환자 추가 정보 입력 (선택)</h3>
        <p className="text-sm text-gray-600 mb-6">
          필요한 경우, 아래 항목에 필기 또는 타이핑으로 추가 정보를 입력하세요.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <HandwritingTextInput
            label="환자 이름"
            name="name"
            value={formData.name}
            onChange={handleHandwritingInputChange('name')}
          />
          <HandwritingTextInput
            label="활력 징후 (Vital Signs)"
            name="vitalSigns"
            value={formData.vitalSigns}
            onChange={handleHandwritingInputChange('vitalSigns')}
          />
        </div>

        <div className="mt-4">
          <HandwritingTextInput
            label="주요 증상 (Chief Complaint)"
            name="chiefComplaint"
            value={formData.chiefComplaint}
            onChange={handleHandwritingInputChange('chiefComplaint')}
          />
        </div>
        <div className="mt-4">
          <HandwritingTextInput
            label="처치 내용 (Treatment Details)"
            name="treatmentDetails"
            value={formData.treatmentDetails}
            onChange={handleHandwritingInputChange('treatmentDetails')}
          />
        </div>
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <HandwritingTextInput
            label="과거력 (Past History)"
            name="pastHistory"
            value={formData.pastHistory}
            onChange={handleHandwritingInputChange('pastHistory')}
          />
          <HandwritingTextInput
            label="가족력 (Family History)"
            name="familyHistory"
            value={formData.familyHistory}
            onChange={handleHandwritingInputChange('familyHistory')}
          />
        </div>
        <div className="mt-4">
          <HandwritingTextInput
            label="복용중인 약 (Medications)"
            name="medications"
            value={formData.medications}
            onChange={handleHandwritingInputChange('medications')}
          />
        </div>

        <div className="flex justify-between items-center mt-6">
          <button
            type="button"
            onClick={() => setCurrentStep(4)}
            className="px-6 py-3 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            ← 이전 단계
          </button>
          <button
            type="submit"
            className="px-6 py-3 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors"
          >
            저장
          </button>
        </div>
      </div>
    </form>
  );

  return (
    <AmbulanceLayout ref={mainContentRef}>
      <div className="bg-white p-8 rounded-lg shadow-md max-w-4xl mx-auto relative">
        <h1 className="text-2xl font-bold mb-6 text-gray-800">
          {isEditMode ? "환자 상세 정보 수정" : "환자 필수 정보 입력"}
          <span className="ml-2 text-sm text-blue-600 font-normal">
            🖋️ 필기 인식 지원
          </span>
        </h1>
        
        <div className="bg-white rounded-lg shadow-lg p-6">
          {currentStep === 0 && renderKtasStep()}
          {currentStep === 1 && renderDepartmentStep()}
          {currentStep === 2 && renderGenderStep()}
          {currentStep === 3 && renderAgeRangeStep()}
          {currentStep === 4 && renderCompletionStep()}
          {currentStep === 5 && renderDetailInputStep()}
        </div>

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