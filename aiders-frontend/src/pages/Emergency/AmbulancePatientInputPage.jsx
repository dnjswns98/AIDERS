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
    selectMyAmbulance, // [!code ++]
    // fetchAmbulances, // [!code --]
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

  const mainContentRef = useRef(null);
  const [isDataLoaded, setIsDataLoaded] = useState(false);

  useEffect(() => {
    initializeModel();
  }, [initializeModel]);

  // [!code focus start]
  // 🔥 핵심 수정: 페이지 로딩 시 전체 목록 대신 내 정보만 선택
  useEffect(() => {
    // selectedAmbulance 상태가 비어있다면,
    // 로그인 정보를 바탕으로 내 구급차 정보를 설정합니다.
    if (!selectedAmbulance) {
      selectMyAmbulance();
    }
  }, [selectedAmbulance, selectMyAmbulance]);
  // [!code focus end]

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
      navigate("/emergency/", { state: { formData } });
    } catch (error) {
      console.error("[handleSubmit] updatePatientInfo 호출 실패:", error);
      alert("저장에 실패했습니다. 입력 정보를 확인하고 다시 시도해주세요.");
    }
  };

  return (
    <AmbulanceLayout ref={mainContentRef}>
      <div className="bg-white p-8 rounded-lg shadow-md max-w-4xl mx-auto relative">
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