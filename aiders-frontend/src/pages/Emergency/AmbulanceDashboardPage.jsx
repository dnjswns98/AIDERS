// src/pages/Emergency/AmbulanceDashboardPage.jsx

import React, { useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import AmbulanceLayout from "../../components/Emergency/Layout/AmbulanceLayout";
import MapDisplay from "../../components/Emergency/MapDisplay";
import HospitalCard from "../../components/Emergency/HospitalCard";
import useEmergencyStore from "../../store/useEmergencyStore";
import { useAuthStore } from "../../store/useAuthStore";
import useLiveAmbulanceLocation from "../../hooks/useLiveAmbulanceLocation";
import useWebRtcStore from "../../store/useWebRtcStore";

export default function AmbulanceDashboardPage() {
    const navigate = useNavigate();
    const { user } = useAuthStore();

    const { selectedAmbulance, selectMyAmbulance, matchedHospitals, completeTransport, resetHospitalMatching } = useEmergencyStore();
    const { startCall, isCallActive, setPipMode } = useWebRtcStore();

    // 🔥 수정: hospitalDistanceInfo도 함께 가져옵니다.
    const { ambulanceLocation, hospitalDistanceInfo } = useLiveAmbulanceLocation(user?.userId);
    
    useEffect(() => {
        setPipMode(false);
    }, [setPipMode]);

    useEffect(() => {
        if (!selectedAmbulance && user?.userId) {
            selectMyAmbulance();
        }
    }, [user?.userId, selectedAmbulance, selectMyAmbulance]);

    const handleStartCall = useCallback(() => {
        if (!matchedHospitals[0]) {
            alert("매칭된 병원 정보가 없습니다.");
            return;
        }
        startCall({
            sessionId: user.userId,
            ambulanceNumber: user.userKey,
            hospitalId: matchedHospitals[0].id || matchedHospitals[0].hospitalId,
            patientName: selectedAmbulance?.patientInfo?.name || "",
            ktas: selectedAmbulance?.patientDetails?.ktasLevel || ""
        });
    }, [user, matchedHospitals, selectedAmbulance, startCall]);

    const goToPatientInput = () => {
        const status = selectedAmbulance?.status?.toLowerCase();
        if (status === 'wait' || status === 'standby') {
            alert("출동 지시를 받은 후 환자 정보를 입력할 수 있습니다.");
            return;
        }
        navigate('/emergency/patient-input');
    };

    // 🔥 수정: completeTransport 함수에 navigate 객체를 전달합니다.
    const handleCompleteTransport = async () => {
        if (window.confirm("환자 인계를 완료하고 대기 상태로 돌아가시겠습니까?")) {
            await completeTransport(navigate);
            await resetHospitalMatching();
        }
    };

    const displayLocation = useMemo(() => ambulanceLocation || selectedAmbulance, [ambulanceLocation, selectedAmbulance]);
    const matchedHospital = useMemo(() => matchedHospitals[0], [matchedHospitals]);

    if (!selectedAmbulance) {
        return <AmbulanceLayout><p>구급차 정보 로딩 중...</p></AmbulanceLayout>;
    }

    return (
        <AmbulanceLayout>
            <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1 flex flex-col gap-6">
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold">환자 정보</h2>
                            <button onClick={goToPatientInput} className="bg-blue-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-600">
                                정보 입력/수정
                            </button>
                        </div>
                        <div className="text-sm space-y-2">
                            <p><strong>이름:</strong> {selectedAmbulance.patientInfo?.name || "-"}</p>
                            <p><strong>KTAS:</strong> {selectedAmbulance.patientDetails?.ktasLevel || "-"}</p>
                            <p><strong>주요 증상:</strong> {selectedAmbulance.patientDetails?.chiefComplaint || "-"}</p>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <h2 className="text-xl font-bold mb-4">병원 매칭</h2>
                        {matchedHospital ? <HospitalCard hospital={matchedHospital} simple /> : <p>매칭 대기 중...</p>}
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <h2 className="text-xl font-bold mb-4">이송 관리</h2>
                        <button onClick={handleCompleteTransport} className="w-full bg-green-600 text-white font-semibold py-3 rounded-lg hover:bg-green-700">
                            🏥 이송 완료 (업무 종료)
                        </button>
                    </div>
                </div>

                <div className="lg:col-span-1 bg-white p-6 rounded-lg shadow-md h-[400px] lg:h-auto">
                    <h2 className="text-xl font-bold mb-4">실시간 위치</h2>
                    {/* 🔥 수정: MapDisplay에 distanceInfo prop을 전달합니다. */}
                    <MapDisplay
                        hospital={matchedHospital}
                        ambulanceLocation={displayLocation}
                        distanceInfo={hospitalDistanceInfo}
                    />
                </div>

                <div className="lg:col-span-1 bg-white p-6 rounded-lg shadow-md relative">
                    <h2 className="text-xl font-bold mb-4">화상 통화</h2>
                    <div className="h-full min-h-[300px] bg-gray-200 rounded-lg flex items-center justify-center">
                        {!isCallActive && (
                            <div className="text-center">
                                <p className="text-gray-500 mb-4">병원과 화상 통화를 시작하세요.</p>
                                <button
                                    onClick={handleStartCall}
                                    disabled={!matchedHospital}
                                    className="bg-blue-600 text-white font-bold py-3 px-6 rounded-lg disabled:bg-gray-400"
                                >
                                    📞 통화 시작
                                </button>
                            </div>
                        )}
                        {/* isCallActive가 true가 되면 GlobalCallManager가 통화 화면을 렌더링합니다. */}
                    </div>
                </div>
            </div>
        </AmbulanceLayout>
    );
}