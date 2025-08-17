// src/pages/Emergency/AmbulancePatientInputPage.jsx

import React, {
  useState,
  useEffect,
  useMemo,
  useCallback,
  useRef,
} from "react";
import { useNavigate, useLocation } from "react-router-dom";
import AmbulanceLayout from "../../components/Emergency/Layout/AmbulanceLayout";
import useEmergencyStore from "../../store/useEmergencyStore";
import { useAuthStore } from "../../store/useAuthStore";
import useWebRtcStore from "../../store/useWebRtcStore";
import HandwritingTextInput from "../../components/Emergency/HandwritingTextInput";
import { useCRNNModel } from "../../hooks/useCRNNModel";
import Stomp from "stompjs";
import SockJS from "sockjs-client";

const ageRangeMap = {
  신생아: "NEWBORN",
  영아: "INFANT",
  어린이: "KIDS",
  청소년: "TEENAGER",
  청년: "ADULT",
  노년: "ELDERLY",
  미정: "UNDECIDED",
};


export default function AmbulancePatientInputPage() {
  const navigate = useNavigate();
  const { state } = useLocation();
  
  const {
    selectedAmbulance,
    selectMyAmbulance,
    saveOptionalPatientInfo,
    saveAllPatientInfoAndMatch,
    quickHospitalMatch,
    isHospitalMatching,
    hospitalMatchingStatus,
    hospitalMatchingError,
    matchedHospitals,
    resetHospitalMatching,
    isPatientDataSaving,
    patientDataError,
    patientInfo,
    patientDetails,
    isEditMode: isEditModeFromStore, // Store에서 가져온 isEditMode
    setEditMode,
  } = useEmergencyStore();
  
  const isEditMode = state?.isEditMode || isEditModeFromStore;

  const { user } = useAuthStore();
  const { startCall, setPipMode } = useWebRtcStore();
  const { isModelLoaded, initializeModel } = useCRNNModel();

  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    ktasLevel: "",
    department: "",
    gender: 0,
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
  const [saveStatus, setSaveStatus] = useState(null);

  const isEssentialDataComplete = useMemo(() => {
    return !!(formData.ktasLevel && formData.department);
  }, [formData.ktasLevel, formData.department]);

  const ktasOptions = [
    { level: "1", label: "1등급", description: "즉시", color: "bg-red-500 hover:bg-red-600" },
    { level: "2", label: "2등급", description: "10분", color: "bg-orange-500 hover:bg-orange-600" },
    { level: "3", label: "3등급", description: "30분", color: "bg-yellow-500 hover:bg-yellow-600" },
    { level: "4", label: "4등급", description: "60분", color: "bg-green-500 hover:bg-green-600" },
    { level: "5", label: "5등급", description: "120분", color: "bg-blue-500 hover:bg-blue-600" },
  ];

  const departmentOptions = [
    "내과", "외과", "신경과", "신경외과", "정형외과", "흉부외과", "성형외과", "산부인과", "소아청소년과",
    "안과", "이비인후과", "피부과", "비뇨의학과", "정신건강의학과", "치과"
  ];

  const genderOptions = [
    { value: 1, label: "남성", icon: "👨" },
    { value: 2, label: "여성", icon: "👩" },
  ];

  const ageRangeOptions = [
    "영아 (0-1세)", "유아 (2-7세)", "아동 (8-13세)", "청소년 (14-19세)",
    "청년 (20-39세)", "중년 (40-64세)", "노년 (65세 이상)",
  ];

  const sendWebSocketAlarms = useCallback((type = 'MATCHING') => {
    return new Promise((resolve, reject) => {
      const WS_BASE_URL = (import.meta.env.VITE_WS_BASE_URL || "ws://localhost:8080/ws")
        .replace(/^ws:\/\//, "http://").replace(/^wss:\/\//, "https://");

      const socket = new SockJS(WS_BASE_URL);
      const stompClient = Stomp.over(socket);
      stompClient.debug = null;

      stompClient.connect({}, (frame) => {
        console.log(`🚀 WebSocket 연결 성공 (${type} 알림 전송용)`);

        if (type === 'MATCHING') {
          const matchingAlarm = {
            type: "MATCHING", ambulanceKey: user.userKey, patientName: formData.name || "환자",
            ktas: parseInt(formData.ktasLevel), message: `환자 ${formData.name || "정보없음"} / KTAS ${formData.ktasLevel} 등급`,
          };
          stompClient.send("/pub/alarm/send", {}, JSON.stringify(matchingAlarm));
          console.log("📤 매칭 알림 전송:", matchingAlarm);

          const requestAlarm = {
            type: "REQUEST", ambulanceKey: user.userKey, message: "구급대원이 화상통화를 요청했습니다.",
          };
          stompClient.send("/pub/alarm/send", {}, JSON.stringify(requestAlarm));
          console.log("📤 통화 요청 알림 전송:", requestAlarm);

        } else if (type === 'EDIT') {
          const editAlarm = {
            type: "EDIT", ambulanceKey: user.userKey, message: `구급차(${user.userKey})의 환자 정보가 수정되었습니다.`,
          };
          stompClient.send("/pub/alarm/send", {}, JSON.stringify(editAlarm));
          console.log("📤 수정 알림 전송:", editAlarm);
        }
        
        setTimeout(() => {
          stompClient.disconnect(() => {
            console.log(`🔌 WebSocket 연결 종료 (${type} 알림 전송용)`);
            resolve();
          });
        }, 500);
      }, (error) => {
        console.error(`❌ WebSocket 연결 실패 (${type} 알림):`, error);
        reject(new Error(`병원에 ${type} 알림을 보내는 데 실패했습니다.`));
      });
    });
  }, [user, formData]);
  
  useEffect(() => {
    // 페이지에 들어올 때, location state나 전역 상태를 기준으로 모드 설정
    setEditMode(isEditMode);
    
    // 페이지를 벗어날 때(unmount) isEditMode를 false로 초기화
    return () => {
      console.log("PatientInputPage Unmounting: isEditMode를 false로 초기화합니다.");
      setEditMode(false);
    };
  }, [isEditMode, setEditMode]);


  useEffect(() => {
    if (!isEditMode) {
      resetHospitalMatching();
    }
  }, [resetHospitalMatching, isEditMode]);
  
  useEffect(() => {
    initializeModel();
    if (!selectedAmbulance) {
      selectMyAmbulance();
    }
  }, [initializeModel, selectedAmbulance, selectMyAmbulance]);
  
  useEffect(() => {
    if (isEditMode && (patientInfo || patientDetails) && !isDataLoaded) {
      console.log("Input Page (Edit Mode): 스토어에서 폼 데이터를 채웁니다.");
      setFormData({
        ktasLevel: patientDetails.ktasLevel || "",
        department: patientDetails.department || "",
        gender: patientInfo.gender || "",
        ageRange: patientInfo.ageRange || "",
        name: patientInfo.name || "",
        chiefComplaint: patientDetails.chiefComplaint || "",
        treatmentDetails: patientDetails.treatmentDetails || "",
        familyHistory: patientDetails.familyHistory || "",
        pastHistory: patientDetails.pastHistory || "",
        medications: patientDetails.medications || "",
        vitalSigns: patientDetails.vitalSigns || "",
      });
      setIsDataLoaded(true);
    } else if (!isEditMode && !isDataLoaded) {
       console.log("Input Page (New Entry Mode): 폼을 비운 상태로 시작합니다.");
       setFormData({
        ktasLevel: "", department: "", gender: "", ageRange: "", name: "",
        chiefComplaint: "", treatmentDetails: "", familyHistory: "",
        pastHistory: "", medications: "", vitalSigns: "",
      });
      setIsDataLoaded(true);
    }
  }, [isEditMode, patientInfo, patientDetails, isDataLoaded]);

  useEffect(() => {
    setPipMode(true);
    return () => {
      setPipMode(false);
    };
  }, [setPipMode]);

  const handleHandwritingInputChange = useCallback((fieldName, value) => {
    console.log(`📝 [handleHandwritingInputChange] ${fieldName}:`, value);
    setFormData((prev) => ({ ...prev, [fieldName]: value }));
  }, []);

  useEffect(() => {
    if (!isEditMode && hospitalMatchingStatus === "success" && matchedHospitals.length > 0) {
      const executePostMatchingTasks = async () => {
        try {
          await sendWebSocketAlarms('MATCHING');
          console.log("✅ 병원에 WebSocket 알림 전송 완료.");

          const callInfo = {
            sessionId: user.userId,
            ambulanceNumber: user.userKey,
            hospitalId: matchedHospitals[0].id || matchedHospitals[0].hospitalId,
            patientName: formData.name || "환자",
            ktas: formData.ktasLevel || "미분류",
          };

          startCall(callInfo);
          console.log("📞 화상 통화 시작:", callInfo);

          alert(`${matchedHospitals[0].name}(으)로 이송 및 화상 통화를 시작합니다.`);
          navigate("/emergency/dashboard");
        } catch (error) {
          alert(`오류가 발생했습니다: ${error.message}`);
        }
      };

      executePostMatchingTasks();
    }
  }, [isEditMode, hospitalMatchingStatus, matchedHospitals, sendWebSocketAlarms, startCall, user, formData, navigate]);
  
  const handleQuickMatch = async () => {
    if (!isEssentialDataComplete) {
      alert("병원 매칭을 위해 KTAS와 진료과는 필수입니다.");
      return;
    }
    setSaveStatus("saving");
    try {
      await quickHospitalMatch(formData.ktasLevel, formData.department);
      setSaveStatus("success");
    } catch (error) {
      setSaveStatus("error");
      alert(`❌ 빠른 매칭 실패: ${error.message}`);
    }
  };

  const handleMatchHospital = async () => {
    if (!isEssentialDataComplete) {
      alert("병원 매칭을 위해 KTAS와 진료과는 필수입니다.");
      return;
    }
    setSaveStatus("saving");
    try {
      await saveAllPatientInfoAndMatch(formData);
      setSaveStatus("success");
    } catch (error) {
      setSaveStatus("error");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaveStatus("saving");
    try {
      await saveOptionalPatientInfo(formData);
      if (isEditMode) {
        await sendWebSocketAlarms('EDIT');
        alert("✅ 환자 정보가 성공적으로 수정되었고, 병원에 알림을 전송했습니다.");
        navigate('/emergency/patient-info');
      } else {
        alert("✅ 환자 정보가 성공적으로 저장되었습니다.");
      }
      setSaveStatus("success");
      setTimeout(() => setSaveStatus(null), 3000);
    } catch (error) {
      setSaveStatus("error");
      const errorMessage = error.message || "저장에 실패했습니다.";
      alert(`❌ 저장 실패: ${errorMessage}`);
      setTimeout(() => setSaveStatus(null), 5000);
    }
  };

  const renderKtasStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          KTAS 등급 선택
        </h2>
        <p className="text-gray-600">
          환자의 중증도에 따라 적절한 등급을 선택해주세요.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {ktasOptions.map((option) => (
          <button
            key={option.level}
            type="button"
            onClick={() =>
              setFormData((prev) => ({ ...prev, ktasLevel: prev.ktasLevel === option.level ? "" : option.level }))
            }
            className={`
              p-6 rounded-xl border-2 transition-all duration-200 text-white font-bold
              ${
                formData.ktasLevel === option.level
                  ? `${option.color} border-gray-800 shadow-lg transform scale-105`
                  : `${option.color.replace(
                      "hover:",
                      ""
                    )} border-gray-300 hover:border-gray-400 opacity-80 hover:opacity-100`
              }
            `}
          >
            <div className="text-3xl mb-2">{option.label}</div>
            <div className="text-sm opacity-90">{option.description}</div>
          </button>
        ))}
      </div>

      {formData.ktasLevel && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="text-blue-600 font-semibold">
              선택된 등급: KTAS {formData.ktasLevel}등급
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderDepartmentStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">진료과 선택</h2>
        <p className="text-gray-600">환자에게 적합한 진료과를 선택해주세요.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {departmentOptions.map((dept) => (
          <button
            key={dept}
            type="button"
            onClick={() =>
              setFormData((prev) => ({ ...prev, department: prev.department === dept ? "" : dept }))
            }
            className={`
              p-4 rounded-lg border-2 transition-all duration-200 text-sm font-medium
              ${
                formData.department === dept
                  ? "bg-blue-600 text-white border-blue-600 shadow-lg"
                  : "bg-white text-gray-700 border-gray-300 hover:border-blue-300 hover:bg-blue-50"
              }
            `}
          >
            {dept}
          </button>
        ))}
      </div>

      {formData.department && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="text-green-600 font-semibold">
              선택된 진료과: {formData.department}
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderPatientInfoStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          환자 기본 정보
        </h2>
        <p className="text-gray-600">
          환자의 기본 정보를 입력해주세요. (선택사항)
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            환자명
          </label>
          <HandwritingTextInput
            value={formData.name}
            onChange={(value) => handleHandwritingInputChange("name", value)}
            placeholder="환자 이름을 입력하세요"
            label="환자명"
            disabled={!isModelLoaded}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            성별
          </label>
          <div className="grid grid-cols-2 gap-3">
            {genderOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() =>
                  setFormData((prev) => ({ ...prev, gender: prev.gender === option.value ? 0 : option.value }))
                }
                className={`
                  p-3 rounded-lg border-2 transition-all duration-200 flex items-center justify-center space-x-2
                  ${
                    formData.gender === option.value
                      ? "bg-blue-600 text-white border-blue-600 shadow-lg"
                      : "bg-white text-gray-700 border-gray-300 hover:border-blue-300 hover:bg-blue-50"
                  }
                `}
              >
                <span className="text-lg">{option.icon}</span>
                <span className="font-medium">{option.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            연령대
          </label>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2">
            {ageRangeOptions.map((age) => (
              <button
                key={age}
                type="button"
                onClick={() =>
                  setFormData((prev) => ({ ...prev, ageRange: prev.ageRange === age ? "" : age }))
                }
                className={`
                  p-2 rounded-lg border transition-all duration-200 text-xs font-medium
                  ${
                    formData.ageRange === age
                      ? "bg-blue-600 text-white border-blue-600 shadow-lg"
                      : "bg-white text-gray-700 border-gray-300 hover:border-blue-300 hover:bg-blue-50"
                  }
                `}
              >
                {age}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderDetailsStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          환자 상세 정보
        </h2>
        <p className="text-gray-600">
          추가적인 환자 정보를 입력해주세요. (선택사항)
        </p>
      </div>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            주 증상
          </label>
          <HandwritingTextInput
            value={formData.chiefComplaint}
            onChange={(value) =>
              handleHandwritingInputChange("chiefComplaint", value)
            }
            placeholder="환자의 주 증상을 설명해주세요"
            label="주 증상"
            disabled={!isModelLoaded}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            현장 처치 내용
          </label>
          <HandwritingTextInput
            value={formData.treatmentDetails}
            onChange={(value) =>
              handleHandwritingInputChange("treatmentDetails", value)
            }
            placeholder="현장에서 실시한 응급처치 내용을 입력하세요"
            label="처치 내용"
            disabled={!isModelLoaded}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            기존 병력
          </label>
          <HandwritingTextInput
            value={formData.pastHistory}
            onChange={(value) =>
              handleHandwritingInputChange("pastHistory", value)
            }
            placeholder="환자의 기존 질병이나 수술 이력을 입력하세요"
            label="기존 병력"
            disabled={!isModelLoaded}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            가족력
          </label>
          <HandwritingTextInput
            value={formData.familyHistory}
            onChange={(value) =>
              handleHandwritingInputChange("familyHistory", value)
            }
            placeholder="가족의 유전적 질병 등을 입력하세요"
            label="가족력"
            disabled={!isModelLoaded}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            복용 중인 약물
          </label>
          <HandwritingTextInput
            value={formData.medications}
            onChange={(value) =>
              handleHandwritingInputChange("medications", value)
            }
            placeholder="현재 복용 중인 약물명을 입력하세요"
            label="복용 약물"
            disabled={!isModelLoaded}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            활력징후
          </label>
          <HandwritingTextInput
            value={formData.vitalSigns}
            onChange={(value) =>
              handleHandwritingInputChange("vitalSigns", value)
            }
            placeholder="혈압, 맥박, 호흡수, 체온 등을 입력하세요"
            label="활력징후"
            disabled={!isModelLoaded}
          />
        </div>
      </div>
    </div>
  );

  const isStepCompleted = useCallback((index) => {
    if (index === 0) return !!formData.ktasLevel; // KTAS
    if (index === 1) return !!formData.department; // 진료과

    if (index === 2) {
      // 기본정보 단계: name, gender, ageRange 중 하나라도 입력 시 완료
      return !!(formData.name || formData.gender || formData.ageRange);
    }

    if (index === 3) {
      // 상세정보 단계: chiefComplaint, treatmentDetails, pastHistory, familyHistory, medications, vitalSigns 중 하나라도 입력 시 완료
      return !!(
        formData.chiefComplaint ||
        formData.treatmentDetails ||
        formData.pastHistory ||
        formData.familyHistory ||
        formData.medications ||
        formData.vitalSigns
      );
    }

    return false;
  }, [formData]);

  // 현재 단계에서 특정 단계로 이동 가능한지 판단
  const canGoToStep = useCallback((targetIndex) => {
    if (targetIndex <= currentStep) return true;         // 뒤로 가기는 항상 허용
    if (targetIndex >= 1 && !formData.ktasLevel) return false;   // 1단계(진료과)로 가려면 KTAS 필요
    if (targetIndex >= 2 && !formData.department) return false;  // 2단계(기본정보)로 가려면 진료과 필요
    // 3단계(상세정보)는 추가 요구조건 없음 (필요 시 확장)
    return true;
  }, [currentStep, formData.ktasLevel, formData.department]);

  const handleStepClick = useCallback((index) => {
    if (canGoToStep(index)) {
      setCurrentStep(index);
    } else {
      alert("이 단계로 이동하려면 앞 단계의 필수 항목을 먼저 완료해 주세요. (KTAS, 진료과)");
    }
  }, [canGoToStep]);

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 0:
        return renderKtasStep();
      case 1:
        return renderDepartmentStep();
      case 2:
        return renderPatientInfoStep();
      case 3:
        return renderDetailsStep();
      default:
        return renderKtasStep();
    }
  };

  const canProceedToNext = () => {
    switch (currentStep) {
      case 0:
        return !!formData.ktasLevel;
      case 1:
        return !!formData.department;
      case 2:
        return true;
      case 3:
        return true;
      default:
        return false;
    }
  };

  const isLastStep = currentStep === 3;

  return (
    <AmbulanceLayout ref={mainContentRef} showHeader={isEditMode}>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {isEditMode ? "환자 정보 수정" : "환자 정보 입력"}
            </h1>
            <div className="flex justify-center space-x-4 text-sm text-gray-600">
              <span>구급차: {selectedAmbulance?.carNumber || "정보 없음"}</span>
              <span>•</span>
              <span>상태: {selectedAmbulance?.currentStatus || "대기중"}</span>
            </div>
          </div>

          <div className="mb-8">
            <div className="flex justify-between items-center">
              <div className="flex-grow flex justify-center">
                <div className="flex space-x-4">
                  {["KTAS", "진료과", "기본정보", "상세정보"].map((step, index) => {
                    const isActive = index === currentStep;
                    const completed = isStepCompleted(index);
                    const disabled = !canGoToStep(index);

                    // 기본 배경/글씨색: 완료면 초록, 아니면 회색
                    const baseClasses = completed
                      ? "bg-green-600 text-white"
                      : "bg-gray-200 text-gray-600";

                    // 활성 단계면 “완료색 유지 + 활성 강조” (테두리/링/살짝 음영)
                    const activeAccent = isActive
                      ? "ring-2 ring-offset-2 ring-blue-300 shadow"
                      : "";

                    const bulletClasses = "w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold";
                    const bulletStateClasses = completed
                      ? "bg-white/20 text-white ring-1 ring-white/30"
                      : "bg-white text-gray-700 ring-1 ring-gray-300";

                    return (
                      <button
                        key={step}
                        type="button"
                        onClick={() => handleStepClick(index)}
                        disabled={disabled}
                        className={`flex items-center space-x-2 px-4 py-2 rounded-full text-sm font-medium ${baseClasses} ${activeAccent}
                                    ${disabled ? "opacity-60 cursor-not-allowed" : "hover:opacity-90 cursor-pointer"}`}
                        aria-current={isActive ? "step" : undefined}
                        title={disabled ? "이전 단계의 필수 항목을 먼저 완료하세요" : `${step} 단계로 이동`}
                      >
                        <span className={`${bulletClasses} ${bulletStateClasses}`}>
                          {completed ? "✓" : index + 1}
                        </span>
                        <span>{step}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {!isEditMode && (
                <button
                  type="button"
                  onClick={handleQuickMatch}
                  disabled={!isEssentialDataComplete || isHospitalMatching}
                  className="px-4 py-2 bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-lg hover:from-green-600 hover:to-blue-600 disabled:opacity-50 disabled:cursor-not-allowed font-semibold shadow-md whitespace-nowrap"
                >
                  ⚡ 병원 매칭
                </button>
              )}
            </div>
          </div>

          {(saveStatus || isPatientDataSaving || patientDataError) && (
            <div className="mb-6">
              {(saveStatus === "saving" || isPatientDataSaving) && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-3"></div>
                    <span className="text-blue-700 font-medium">
                      저장 중...
                    </span>
                  </div>
                </div>
              )}
              {saveStatus === "success" && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <span className="text-green-600 font-medium">
                      ✅ 저장 완료
                    </span>
                  </div>
                </div>
              )}
              {(saveStatus === "error" || patientDataError) && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <span className="text-red-600 font-medium">
                      ❌ 저장 실패: {patientDataError || "알 수 없는 오류"}
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            className="bg-white rounded-2xl shadow-lg p-8"
          >
            {renderCurrentStep()}
            <div className="flex justify-between items-center mt-8 pt-6 border-t">
              <button
                type="button"
                onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
                disabled={currentStep === 0}
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                이전
              </button>
              <div className="flex space-x-3">
                {isEditMode ? (
                  <>
                    {!isLastStep && (
                       <button
                          type="button"
                          onClick={() => setCurrentStep(Math.min(3, currentStep + 1))}
                          className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                       >
                         다음
                       </button>
                    )}
                    <button
                      type="submit"
                      disabled={isPatientDataSaving || saveStatus === "saving"}
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isPatientDataSaving || saveStatus === "saving" ? "저장 중..." : "수정 완료"}
                    </button>
                  </>
                ) : isLastStep ? (
                  <button
                    type="button"
                    onClick={handleMatchHospital}
                    disabled={!isEssentialDataComplete || isHospitalMatching}
                    className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isHospitalMatching ? "매칭 중..." : "병원 매칭"}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setCurrentStep(Math.min(3, currentStep + 1))}
                    disabled={!canProceedToNext()}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    다음
                  </button>
                )}
              </div>
            </div>
          </form>

          {isLastStep && !isEditMode && (
            <div className="mt-6 p-6 bg-gradient-to-r from-blue-50 to-green-50 rounded-xl border border-blue-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                💡 다음 단계 안내
              </h3>
              {isEssentialDataComplete ? (
                <p className="text-green-700">
                  ✅ 필수 정보(KTAS, 진료과)가 입력되었습니다. 이제 병원 매칭을
                  진행하거나, 환자의 상세 정보를 추가로 입력할 수 있습니다.
                </p>
              ) : (
                <p className="text-orange-700">
                  ⚠️ 병원 매칭을 위해서는 KTAS 등급과 진료과 선택이 필수입니다.
                </p>
              )}
              <div className="mt-3 text-sm text-gray-600">
                <p>• <strong>저장</strong>: 입력된 정보를 저장합니다.</p>
                <p>• <strong>병원 매칭</strong>: KTAS와 진료과 기준으로 최적의 병원을 찾습니다.</p>
              </div>
            </div>
          )}

          {currentStep >= 2 && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-sm text-gray-600">
                💡 <strong>필기 인식 기능</strong>: 필요한 경우, 아래 항목에
                필기 또는 타이핑으로 {isEditMode ? "정보를 수정하세요" : "추가 정보를 입력하세요"}.
                {!isModelLoaded && " (AI 모델 로딩 중...)"}
              </p>
            </div>
          )}

          {isHospitalMatching && !isEditMode && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    병원 매칭 중
                  </h3>
                  <p className="text-gray-600">
                    최적의 병원을 찾고 있습니다...
                  </p>
                  <p className="text-sm text-gray-500 mt-2">
                    잠시만 기다려주세요.
                  </p>
                </div>
              </div>
            </div>
          )}

          {hospitalMatchingError && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700">
                ❌ 병원 매칭 실패: {hospitalMatchingError}
              </p>
            </div>
          )}
        </div>
      </div>
    </AmbulanceLayout>
  );
}