// src/pages/Emergency/AmbulancePatientInputPage.jsx

import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import AmbulanceLayout from "../../components/Emergency/Layout/AmbulanceLayout";
import useEmergencyStore from "../../store/useEmergencyStore";
import { useAuthStore } from "../../store/useAuthStore";
import HandwritingTextInput from "../../components/Emergency/HandwritingTextInput";
import { useCRNNModel } from "../../hooks/useCRNNModel";
import Stomp from "stompjs";
import SockJS from "sockjs-client";

// Helper functions (기존과 동일)
const safeGetValue = (value, fallback = "") => {
    if (value === null || value === undefined) return fallback;
    if (typeof value === 'string' && value.trim() === '') return fallback;
    if (typeof value === 'string' && (value.includes('선택') || value === '선택해주세요' || value === '-' || value === 'unknown')) return fallback;
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
            return medications.map(med => (typeof med === 'object' && med.name) ? med.name : med).filter(name => name && name.trim() !== '').join(", ");
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

const ageRangeMap = { '영아': 'INFANT', '유아': 'KIDS', '아동': 'KIDS', '청소년': 'TEENAGER', '청년': 'ADULT', '중년': 'ADULT', '노년': 'ELDERLY' };

export default function AmbulancePatientInputPage() {
    const navigate = useNavigate();
    const { state } = useLocation();
    const isEditMode = state?.isEditMode || false;

    const {
        selectedAmbulance,
        selectMyAmbulance,
        saveRequiredPatientInfo,
        saveOptionalPatientInfo,
        triggerHospitalMatching,
        isHospitalMatching,
        hospitalMatchingStatus,
        hospitalMatchingError,
        matchedHospitals,
        resetHospitalMatching,
    } = useEmergencyStore();

    const { user } = useAuthStore();
    const { isModelLoaded, initializeModel } = useCRNNModel();

    const [currentStep, setCurrentStep] = useState(0);
    const [formData, setFormData] = useState({
        ktasLevel: "", department: "", gender: "", ageRange: "", name: "",
        chiefComplaint: "", treatmentDetails: "", familyHistory: "",
        pastHistory: "", medications: "", vitalSigns: "",
    });

    const mainContentRef = useRef(null);
    const [isDataLoaded, setIsDataLoaded] = useState(false);
    
    const isEssentialDataComplete = useMemo(() => {
        return !!(formData.ktasLevel && formData.department);
    }, [formData.ktasLevel, formData.department]);

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
    
    useEffect(() => {
        resetHospitalMatching();
    }, [resetHospitalMatching, currentStep]);
    
    useEffect(() => {
        initializeModel();
        if (!selectedAmbulance) {
            selectMyAmbulance();
        }
    }, [initializeModel, selectedAmbulance, selectMyAmbulance]);

    useEffect(() => {
        if (isEditMode && selectedAmbulance && !isDataLoaded) {
            const patientInfo = selectedAmbulance.patientInfo || {};
            const patientDetails = selectedAmbulance.patientDetails || {};
            setFormData({
                ktasLevel: safeGetKtasLevel(patientDetails.ktasLevel),
                department: safeGetValue(patientDetails.department),
                gender: safeGetValue(patientInfo.gender),
                ageRange: safeGetValue(patientDetails.ageRange),
                name: safeGetValue(patientInfo.name),
                chiefComplaint: safeGetValue(patientDetails.chiefComplaint || patientDetails.medicalRecord),
                treatmentDetails: safeGetValue(patientDetails.treatmentDetails),
                familyHistory: safeGetComplexObject(patientDetails.familyHistory, 'father'),
                pastHistory: safeGetComplexObject(patientDetails.pastHistory, 'hypertension'),
                medications: safeGetMedications(patientDetails.medications || patientDetails.medicine),
                vitalSigns: safeGetComplexObject(patientDetails.vitalSigns, 'bloodPressure'),
            });
            setIsDataLoaded(true);
        } else if (!isDataLoaded) {
            setIsDataLoaded(true);
        }
    }, [isEditMode, selectedAmbulance, isDataLoaded]);

    const handleHandwritingInputChange = useCallback((fieldName, value) => {
        setFormData((prev) => ({ ...prev, [fieldName]: value }));
    }, []);

    useEffect(() => {
        if (hospitalMatchingStatus === 'success' && matchedHospitals.length > 0) {
            const executePostMatchingTasks = async () => {
                try {
                    await sendWebSocketAlarms();
                    console.log("✅ 병원에 WebSocket 알림 전송 완료.");

                    alert(`${matchedHospitals[0].name}(으)로 이송을 시작합니다.`);
                    navigate('/emergency/map', {
                        state: {
                            matchedHospital: matchedHospitals[0],
                            patientInfo: formData
                        }
                    });
                } catch (error) {
                    alert(`오류가 발생했습니다: ${error.message}`);
                }
            };
            executePostMatchingTasks();
        }
    }, [hospitalMatchingStatus, matchedHospitals, navigate, formData]);


    const sendWebSocketAlarms = () => {
        return new Promise((resolve, reject) => {
            // 🔥 'ws://' 주소를 'http://'로 변환
            const WS_BASE_URL = (import.meta.env.VITE_WS_BASE_URL || "ws://localhost:8080/ws")
                .replace(/^ws:\/\//, 'http://')
                .replace(/^wss:\/\//, 'https://');
            
            const socket = new SockJS(WS_BASE_URL);
            const stompClient = Stomp.over(socket);

            stompClient.connect({}, 
                (frame) => {
                    console.log("🚀 WebSocket 연결 성공 (알림 전송용)");

                    const matchingAlarm = {
                        type: "MATCHING", ambulanceKey: user.userKey,
                        patientName: formData.name || "환자", ktas: parseInt(formData.ktasLevel),
                    };
                    stompClient.send("/pub/alarm/send", {}, JSON.stringify(matchingAlarm));
                    console.log("📤 매칭 알림 전송:", matchingAlarm);

                    const requestAlarm = { type: "REQUEST", ambulanceKey: user.userKey };
                    stompClient.send("/pub/alarm/send", {}, JSON.stringify(requestAlarm));
                    console.log("📤 통화 요청 알림 전송:", requestAlarm);

                    setTimeout(() => {
                        stompClient.disconnect(() => {
                            console.log("🔌 WebSocket 연결 종료 (알림 전송용)");
                            resolve();
                        });
                    }, 500);
                },
                (error) => {
                    console.error("❌ WebSocket 연결 실패:", error);
                    reject(new Error("병원에 알림을 보내는 데 실패했습니다."));
                }
            );
        });
    };
    
    const handleMatchHospital = async () => {
        if (!selectedAmbulance?.id) {
            alert("구급차 정보를 불러올 수 없습니다.");
            return;
        }

        try {
            await saveRequiredPatientInfo({
                ktasLevel: formData.ktasLevel,
                department: formData.department,
            });
        } catch (error) {
            console.error("병원 매칭 시작 실패:", error);
        }
    };
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (matchedHospitals.length === 0) {
            const proceed = window.confirm("아직 병원 매칭이 완료되지 않았습니다. 상세 정보만 저장하고 계속 진행하시겠습니까?");
            if (!proceed) return;
        }
        try {
            const ageKey = formData.ageRange ? formData.ageRange.split(' ')[0].replace(/[^가-힣]/g, '') : null;
            await saveOptionalPatientInfo({
                ktas: parseInt(formData.ktasLevel), department: formData.department,
                sex: formData.gender === '남성' ? 1 : (formData.gender === '여성' ? 2 : undefined),
                ageRange: ageKey ? (ageRangeMap[ageKey] || 'ADULT') : undefined,
                name: formData.name, medicalRecord: formData.chiefComplaint,
                familyHistory: formData.familyHistory, pastHistory: formData.pastHistory,
                medicine: formData.medications, vitalSigns: formData.vitalSigns,
            });
            alert("환자 정보가 저장되었습니다. 지도를 보며 이송을 시작합니다.");
            navigate("/emergency/map");
        } catch (error) {
            alert("저장에 실패했습니다: " + error.message);
        }
    };
    
    const renderKtasStep = () => (
        <div className="space-y-4">
            <h3 className="text-xl font-bold text-gray-800 mb-4">1. KTAS 등급 선택</h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {ktasOptions.map((option) => (
                    <button key={option.level} type="button" onClick={() => { setFormData((prev) => ({ ...prev, ktasLevel: option.level })); setCurrentStep(1); }} className={`px-4 py-8 rounded-lg shadow-md transition-colors duration-200 text-white font-bold text-lg text-center ${option.color}`}>
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
                    <button key={dept} type="button" onClick={() => { setFormData((prev) => ({ ...prev, department: dept })); setCurrentStep(2); }} className={`px-4 py-3 rounded-lg shadow-sm transition-colors duration-200 text-sm font-medium ${formData.department === dept ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}>
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
                    <button key={option.value} type="button" onClick={() => { setFormData((prev) => ({ ...prev, gender: option.value })); setCurrentStep(3); }} className={`flex-1 p-8 rounded-lg shadow-md transition-colors duration-200 text-lg text-center ${formData.gender === option.value ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}>
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
                    <button key={range} type="button" onClick={() => { setFormData((prev) => ({ ...prev, ageRange: range })); setCurrentStep(4); }} className={`px-4 py-3 rounded-lg shadow-sm transition-colors duration-200 text-sm font-medium ${formData.ageRange === range ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}>
                        {range}
                    </button>
                ))}
            </div>
        </div>
    );

    const renderCompletionStep = () => (
        <div className="text-center space-y-6">
            <div className="text-6xl text-green-500">✅</div>
            <h3 className="text-2xl font-bold text-gray-800">기본 정보 입력 완료</h3>
            <p className="text-lg text-gray-600">이제 병원 매칭을 진행하거나, 환자의 상세 정보를 추가로 입력할 수 있습니다.</p>
        </div>
    );

    const renderDetailInputStep = () => (
        <div className="space-y-6">
          <div className="p-4 bg-gray-50 rounded-lg">
            <h3 className="text-xl font-bold text-gray-800 mb-4">추가 정보 입력 (선택)</h3>
            <p className="text-sm text-gray-600 mb-6">필요한 경우, 아래 항목에 필기 또는 타이핑으로 추가 정보를 입력하세요.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <HandwritingTextInput label="환자 이름" name="name" value={formData.name} onChange={(value) => handleHandwritingInputChange('name', value)} />
              <HandwritingTextInput label="활력 징후" name="vitalSigns" value={formData.vitalSigns} onChange={(value) => handleHandwritingInputChange('vitalSigns', value)} />
            </div>
            <div className="mt-4">
              <HandwritingTextInput label="주요 증상 (상세)" name="chiefComplaint" value={formData.chiefComplaint} onChange={(value) => handleHandwritingInputChange('chiefComplaint', value)} />
            </div>
            <div className="mt-4">
              <HandwritingTextInput label="처치 내용" name="treatmentDetails" value={formData.treatmentDetails} onChange={(value) => handleHandwritingInputChange('treatmentDetails', value)} />
            </div>
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <HandwritingTextInput label="과거력" name="pastHistory" value={formData.pastHistory} onChange={(value) => handleHandwritingInputChange('pastHistory', value)} />
              <HandwritingTextInput label="가족력" name="familyHistory" value={formData.familyHistory} onChange={(value) => handleHandwritingInputChange('familyHistory', value)} />
            </div>
            <div className="mt-4">
              <HandwritingTextInput label="복용중인 약" name="medications" value={formData.medications} onChange={(value) => handleHandwritingInputChange('medications', value)} />
            </div>
          </div>
        </div>
    );

    const renderStepContent = () => {
        switch (currentStep) {
            case 0: return renderKtasStep();
            case 1: return renderDepartmentStep();
            case 2: return renderGenderStep();
            case 3: return renderAgeRangeStep();
            case 4: return renderCompletionStep();
            case 5: return renderDetailInputStep();
            default: return null;
        }
    };
    
    return (
        <AmbulanceLayout ref={mainContentRef}>
            <div className="bg-white p-8 rounded-lg shadow-md max-w-4xl mx-auto relative">
                <h1 className="text-2xl font-bold mb-6 text-gray-800">
                    {isEditMode ? "환자 상세 정보 수정" : "환자 정보 입력"}
                </h1>
                
                <form onSubmit={handleSubmit}>
                    <div className="bg-white rounded-lg shadow-lg p-6 space-y-8">
                        {renderStepContent()}
                    </div>

                    <div className="mt-8 pt-6 border-t flex items-center justify-between min-h-[60px]">
                        <div>
                            {currentStep > 0 && (
                                <button type="button" onClick={() => currentStep <= 4 ? setCurrentStep(currentStep - 1) : setCurrentStep(4)} className="px-6 py-3 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors">
                                    ← 이전 단계
                                </button>
                            )}
                        </div>

                        <div className="flex items-center space-x-4">
                            {currentStep >= 2 && currentStep <= 4 && (
                                <div className="flex flex-col items-center">
                                    <button 
                                        type="button" 
                                        onClick={handleMatchHospital} 
                                        disabled={isHospitalMatching || hospitalMatchingStatus === 'success'} 
                                        className="px-6 py-3 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                                    >
                                        {isHospitalMatching ? "매칭 중..." : hospitalMatchingStatus === 'success' ? `✅ ${matchedHospitals[0]?.name}` : "🏥 병원 매칭하기"}
                                    </button>
                                    {hospitalMatchingStatus === 'error' && <p className="text-xs text-red-500 mt-1">{hospitalMatchingError}</p>}
                                </div>
                            )}

                            {currentStep === 4 && (
                                <>
                                    <button type="button" onClick={() => setCurrentStep(5)} className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors">
                                        상세 정보 입력
                                    </button>
                                </>
                            )}
                            
                            {currentStep === 5 && (
                                <button type="submit" disabled={matchedHospitals.length === 0} className="px-6 py-3 bg-red-600 text-white font-bold text-lg rounded-lg shadow-md hover:bg-red-700 disabled:bg-gray-400">
                                    저장 및 이송 시작
                                </button>
                            )}
                        </div>
                    </div>
                </form>
            </div>
            
            {!isModelLoaded && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 shadow-xl max-w-md mx-4 text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                        <h3 className="text-lg font-semibold text-gray-800 mb-2">필기 인식 모델 로딩 중...</h3>
                        <p className="text-sm text-gray-600">잠시만 기다려주세요.</p>
                    </div>
                </div>
            )}
        </AmbulanceLayout>
    );
}