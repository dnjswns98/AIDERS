import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import AmbulanceLayout from "../../components/Emergency/Layout/AmbulanceLayout";
import useEmergencyStore from "../../store/useEmergencyStore";
import InputModeToggle from "../../components/Emergency/PatientInput/InputModeToggle";
import PatientBasicInfoForm from "../../components/Emergency/PatientInput/PatientBasicInfoForm";
import PatientDetailInput from "../../components/Emergency/PatientInput/PatientDetailInput";

export default function AmbulancePatientInputPage() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const isEditMode = state?.isEditMode || false;

  const { selectedAmbulance, updatePatientInfo } = useEmergencyStore();

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

  const [inputMode, setInputMode] = useState('drawing'); // 'drawing' 또는 'typing'

  const toggleInputMode = () => {
    setInputMode(prevMode => prevMode === 'drawing' ? 'typing' : 'drawing');
  };

  useEffect(() => {
    if (isEditMode && selectedAmbulance) {
      setFormData({
        ktasLevel: selectedAmbulance.patientDetails.ktasLevel?.split(' ')[0] ?? '',
        department: selectedAmbulance.patientDetails.department ?? '',
        gender: selectedAmbulance.patientInfo.gender ?? '',
        ageRange: selectedAmbulance.patientDetails.ageRange ?? '',
        name: selectedAmbulance.patientInfo.name ?? '',
        chiefComplaint: selectedAmbulance.patientDetails.chiefComplaint ?? '',
        treatmentDetails: selectedAmbulance.patientDetails.treatmentDetails ?? '',
        familyHistory: selectedAmbulance.patientDetails.familyHistory?.father ?? '',
        pastHistory: selectedAmbulance.patientDetails.pastHistory?.hypertension ?? '',
        medications: selectedAmbulance.patientDetails.medications?.map(m => m.name).join(', ') ?? '',
        vitalSigns: selectedAmbulance.patientDetails.vitalSigns?.bloodPressure ?? '',
      });
    }
  }, [isEditMode, selectedAmbulance]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (
      formData.ktasLevel.includes('선택') ||
      formData.department.includes('선택') ||
      formData.ktasLevel === ''||
      formData.department === '' 
    ) {
      alert('KTAS(중증도)와 진료 과목은 필수 항목입니다.');
      return;
    }

    if (selectedAmbulance) {
      let updatedInfo;

      if (isEditMode) {
        const existingPatientInfo = selectedAmbulance.patientInfo;
        const existingPatientDetails = selectedAmbulance.patientDetails;
        updatedInfo = {
          patientInfo: {
            ...existingPatientInfo,
            gender: formData.gender,
            name: formData.name,
            age: formData.ageRange,
          },
          patientDetails: {
            ...existingPatientDetails,
            ktasLevel: `${formData.ktasLevel}등급`,
            department: formData.department,
            ageRange: formData.ageRange,
            chiefComplaint: formData.chiefComplaint,
            treatmentDetails: formData.treatmentDetails,
            familyHistory: { 
                ...existingPatientDetails.familyHistory,
                father: formData.familyHistory 
            },
            pastHistory: { 
                ...existingPatientDetails.pastHistory,
                hypertension: formData.pastHistory 
            },
            medications: formData.medications.split(',').map(name => ({ name: name.trim(), indication: '' })).filter(m => m.name),
            vitalSigns: { 
                ...existingPatientDetails.vitalSigns,
                bloodPressure: formData.vitalSigns 
            },
          },
        };
      } else {
        updatedInfo = {
          patientInfo: {
            gender: formData.gender,
            name: '',
            age: formData.ageRange,
          },
          patientDetails: {
            ktasLevel: `${formData.ktasLevel}등급`,
            department: formData.department,
            ageRange: formData.ageRange,
            chiefComplaint: '',
            treatmentDetails: '',
            familyHistory: { father: '' },
            pastHistory: { hypertension: '' },
            medications: [],
            vitalSigns: { bloodPressure: '' },
          },
        };
      }
      updatePatientInfo(selectedAmbulance.id, updatedInfo);
    }
    navigate("/emergency");
  };

  return (
    <AmbulanceLayout>
      <div className="bg-white p-8 rounded-lg shadow-md max-w-4xl mx-auto relative">
        <h1 className="text-2xl font-bold mb-6 text-gray-800">
          {isEditMode ? "환자 상세 정보 수정" : "환자 필수 정보 입력"}
        </h1>
        {isEditMode && (
          <InputModeToggle inputMode={inputMode} toggleInputMode={toggleInputMode} />
        )}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 필수 정보 섹션 */}
          <PatientBasicInfoForm formData={formData} handleInputChange={handleInputChange} />

          {/* 상세 정보 섹션 (수정 모드) */}
          {isEditMode && (
            <div className="space-y-6 pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <PatientDetailInput
                  label="이름"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  inputMode={inputMode}
                  canvasHeight={50}
                />
                <PatientDetailInput
                  label="바이탈 사인 (혈압)"
                  name="vitalSigns"
                  value={formData.vitalSigns}
                  onChange={handleInputChange}
                  inputMode={inputMode}
                  canvasHeight={50}
                />
              </div>
              <PatientDetailInput
                label="주요 증상 (상세)"
                name="chiefComplaint"
                value={formData.chiefComplaint}
                onChange={handleInputChange}
                inputMode={inputMode}
                canvasHeight={150}
                isTextArea={true}
              />
              <PatientDetailInput
                label="처치 내용"
                name="treatmentDetails"
                value={formData.treatmentDetails}
                onChange={handleInputChange}
                inputMode={inputMode}
                canvasHeight={150}
                isTextArea={true}
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <PatientDetailInput
                  label="과거력"
                  name="pastHistory"
                  value={formData.pastHistory}
                  onChange={handleInputChange}
                  inputMode={inputMode}
                  canvasHeight={50}
                />
                <PatientDetailInput
                  label="가족력"
                  name="familyHistory"
                  value={formData.familyHistory}
                  onChange={handleInputChange}
                  inputMode={inputMode}
                  canvasHeight={50}
                />
              </div>
              <PatientDetailInput
                label="복용중인 약"
                name="medications"
                value={formData.medications}
                onChange={handleInputChange}
                inputMode={inputMode}
                canvasHeight={50}
              />
            </div>
          )}

          <div className="flex justify-end pt-4">
            <button
              type="submit"
              className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
            >
              {isEditMode ? "정보 저장" : "병원 매칭"}
            </button>
          </div>
        </form>
      </div>
    </AmbulanceLayout>
  );
}

