import React, { useState, useEffect, useRef, useCallback } from "react";
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

  const [inputMode, setInputMode] = useState("drawing");

  const detailInputRefs = useRef([]);
  const [currentDrawingIndex, setCurrentDrawingIndex] = useState(0);

  const mainContentRef = useRef(null);
  const [showScrollButton, setShowScrollButton] = useState(false);

  const toggleInputMode = () => {
    setInputMode((prevMode) => (prevMode === "drawing" ? "typing" : "drawing"));
  };

  useEffect(() => {
    if (isEditMode && selectedAmbulance) {
      setFormData({
        ktasLevel:
          selectedAmbulance.patientDetails.ktasLevel?.split(" ")[0] ?? "",
        department: selectedAmbulance.patientDetails.department ?? "",
        gender: selectedAmbulance.patientInfo.gender ?? "",
        ageRange: selectedAmbulance.patientDetails.ageRange ?? "",
        name: selectedAmbulance.patientInfo.name ?? "",
        chiefComplaint: selectedAmbulance.patientDetails.chiefComplaint ?? "",
        treatmentDetails:
          selectedAmbulance.patientDetails.treatmentDetails ?? "",
        familyHistory: {
          father: selectedAmbulance.patientDetails.familyHistory?.father ?? "",
        }.father, // Ensure it's a string
        pastHistory: {
          hypertension:
            selectedAmbulance.patientDetails.pastHistory?.hypertension ?? "",
        }.hypertension, // Ensure it's a string
        medications:
          selectedAmbulance.patientDetails.medications
            ?.map((m) => m.name)
            .join(", ") ?? "",
        vitalSigns:
          selectedAmbulance.patientDetails.vitalSigns?.bloodPressure ?? "",
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
      formData.ktasLevel.includes("선택") ||
      formData.department.includes("선택") ||
      formData.ktasLevel === "" ||
      formData.department === ""
    ) {
      alert("KTAS(중증도)와 진료 과목은 필수 항목입니다.");
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
              father: formData.familyHistory,
            },
            pastHistory: {
              ...existingPatientDetails.pastHistory,
              hypertension: formData.pastHistory,
            },
            medications: formData.medications
              .split(",")
              .map((name) => ({ name: name.trim(), indication: "" }))
              .filter((m) => m.name),
            vitalSigns: {
              ...existingPatientDetails.vitalSigns,
              bloodPressure: formData.vitalSigns,
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
      updatePatientInfo(selectedAmbulance.id, updatedInfo);
    }
    navigate("/emergency");
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

  // 스크롤 이벤트 핸들러
  const handleScroll = useCallback(() => {
    const target = mainContentRef.current;
    if (!target) return;

    const { scrollTop, scrollHeight, clientHeight } = target;

    // 스크롤이 거의 끝에 도달했는지 확인 (10px 여유)
    const isAtBottom = scrollHeight - scrollTop - clientHeight < 10;

    // 스크롤이 가능하고, 하단에 도달하지 않았을 때만 버튼 표시
    setShowScrollButton(!isAtBottom && scrollHeight > clientHeight);
  }, []);

  useEffect(() => {
    const scrollContainer = mainContentRef.current;
    if (!scrollContainer) return;

    // 초기 상태 체크
    handleScroll();

    scrollContainer.addEventListener("scroll", handleScroll);

    // ResizeObserver를 사용하여 콘텐츠 크기 변경 감지
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
        <h1 className="text-2xl font-bold mb-6 text-gray-800">
          {isEditMode ? "환자 상세 정보 수정" : "환자 필수 정보 입력"}
        </h1>
        {!isEditMode && (
          <div className="absolute top-4 right-4">
            <button
              type="submit"
              form="patient-form"
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200"
            >
              병원 매칭하기 (저장)
            </button>
          </div>
        )}
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
            <PatientDetailInput
              label="주요 증상 (상세)"
              name="chiefComplaint"
              value={formData.chiefComplaint}
              onChange={handleInputChange}
              inputMode={inputMode}
              isTextArea={true}
              ref={(el) => (detailInputRefs.current[2] = el)}
            />
            <PatientDetailInput
              label="처치 내용"
              name="treatmentDetails"
              value={formData.treatmentDetails}
              onChange={handleInputChange}
              inputMode={inputMode}
              isTextArea={true}
              ref={(el) => (detailInputRefs.current[3] = el)}
            />
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
            <PatientDetailInput
              label="복용중인 약"
              name="medications"
              value={formData.medications}
              onChange={handleInputChange}
              inputMode={inputMode}
              ref={(el) => (detailInputRefs.current[6] = el)}
            />
          </div>

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

      {/* 고정된 "다음 필기 공간" 버튼 - 그리기 모드이고, 스크롤이 하단에 도달하지 않았을 때 렌더링 */}
      {inputMode === 'drawing' && showScrollButton && (
        <button
          onClick={scrollToNextDrawingArea}
          className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-gray-700 hover:bg-gray-800 text-white font-bold py-3 px-6 rounded-full shadow-lg z-50 opacity-60 hover:opacity-100 transition-all duration-300"
          title="다음 필기 공간으로 이동"
        >
          <i className="fas fa-chevron-down text-xl"></i>
        </button>
      )}
    </AmbulanceLayout>
  );
}

