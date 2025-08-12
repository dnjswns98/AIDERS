// src/pages/Emergency/AmbulanceDashboardPage.jsx

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import AmbulanceLayout from "../../components/Emergency/Layout/AmbulanceLayout";
import MapDisplay from "../../components/Emergency/MapDisplay";
import HospitalCard from "../../components/Emergency/HospitalCard";
import WebRtcCall from "../../components/webRTC/WebRtcCall";
import useEmergencyStore from "../../store/useEmergencyStore";
import { useAuthStore } from "../../store/useAuthStore";
import useLiveAmbulanceLocation from "../../hooks/useLiveAmbulanceLocation";
import Stomp from "stompjs";
import SockJS from "sockjs-client";

export default function AmbulanceDashboardPage() {
    const navigate = useNavigate();
    const { user } = useAuthStore();

    // 🔥 수정: 필요한 상태와 함수를 개별적으로 선택하여 가져옵니다.
    const selectedAmbulance = useEmergencyStore(state => state.selectedAmbulance);
    const selectMyAmbulance = useEmergencyStore(state => state.selectMyAmbulance);
    const currentLocation = useEmergencyStore(state => state.currentLocation);
    const matchedHospitals = useEmergencyStore(state => state.matchedHospitals);
    const hospitalMatchingStatus = useEmergencyStore(state => state.hospitalMatchingStatus);
    const isHospitalMatching = useEmergencyStore(state => state.isHospitalMatching);
    const hospitalMatchingError = useEmergencyStore(state => state.hospitalMatchingError);
    const transferToHospital = useEmergencyStore(state => state.transferToHospital);
    const completeTransport = useEmergencyStore(state => state.completeTransport);
    const resetHospitalMatching = useEmergencyStore(state => state.resetHospitalMatching);

    const { ambulanceLocation } = useLiveAmbulanceLocation(user?.userId);
    const [isCalling, setIsCalling] = useState(false);

    useEffect(() => {
        if (!selectedAmbulance && user?.userId) {
            selectMyAmbulance();
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user?.userId]);

    useEffect(() => {
        if (hospitalMatchingStatus === 'success' && matchedHospitals.length > 0 && !isCalling) {
            const startCallAndNotify = async () => {
                try {
                    await transferToHospital();
                    await sendWebSocketAlarms();
                    setIsCalling(true);
                } catch (error) {
                    console.error("❌ 매칭 후 작업 실패:", error);
                    alert(`오류가 발생했습니다: ${error.message}`);
                }
            };
            startCallAndNotify();
        }
    }, [hospitalMatchingStatus, matchedHospitals, isCalling, transferToHospital]);

    const sendWebSocketAlarms = () => {
        return new Promise((resolve, reject) => {
            const WS_BASE_URL = (import.meta.env.VITE_WS_BASE_URL || "ws://localhost:8080/ws")
                .replace(/^ws:\/\//, 'http://')
                .replace(/^wss:\/\//, 'https://');
            const socket = new SockJS(WS_BASE_URL);
            const stompClient = Stomp.over(socket);
            stompClient.connect({},
                () => {
                    const patientInfo = selectedAmbulance?.patientInfo || {};
                    const patientDetails = selectedAmbulance?.patientDetails || {};
                    const matchingAlarm = {
                        type: "MATCHING", ambulanceKey: user.userKey,
                        patientName: patientInfo.name || "환자", ktas: parseInt(patientDetails.ktasLevel) || 3,
                    };
                    stompClient.send("/pub/alarm/send", {}, JSON.stringify(matchingAlarm));
                    const requestAlarm = { type: "REQUEST", ambulanceKey: user.userKey };
                    stompClient.send("/pub/alarm/send", {}, JSON.stringify(requestAlarm));
                    setTimeout(() => { stompClient.disconnect(() => { resolve(); }); }, 500);
                },
                (error) => { reject(new Error("병원에 알림을 보내는 데 실패했습니다.")); }
            );
        });
    };

    const goToPatientInput = () => {
        const status = selectedAmbulance?.status?.toLowerCase();
        if (status === 'wait' || status === 'standby') {
            alert("출동 지시를 받은 후 환자 정보를 입력할 수 있습니다.");
            return;
        }
        navigate('/emergency/patient-input');
    };
    
    const handleCompleteTransport = async () => {
        if (window.confirm("환자 인계를 완료하고 대기 상태로 돌아가시겠습니까? 모든 환자 및 병원 정보가 초기화됩니다.")) {
            try {
                await completeTransport();
                await resetHospitalMatching();
            } catch (error) {
                console.error('이송 완료 처리 실패:', error);
                alert('이송 완료 처리에 실패했습니다: ' + error.message);
            }
        }
    };

    const displayLocation = useMemo(() => ambulanceLocation || currentLocation, [ambulanceLocation, currentLocation]);
    const matchedHospital = useMemo(() => matchedHospitals[0], [matchedHospitals]);

    if (!selectedAmbulance) {
        return (
            <AmbulanceLayout>
                <div className="flex items-center justify-center h-full">
                    <p>구급차 정보를 불러오는 중입니다...</p>
                </div>
            </AmbulanceLayout>
        );
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
                        {isHospitalMatching ? (
                            <p>최적의 병원을 찾는 중...</p>
                        ) : hospitalMatchingStatus === 'success' && matchedHospital ? (
                            <HospitalCard hospital={matchedHospital} simple />
                        ) : (
                            <div>
                                <p className="text-sm text-gray-600 mb-4">환자 정보 입력 후 병원 매칭을 시작하세요.</p>
                                {hospitalMatchingError && <p className="text-red-500 text-sm">{hospitalMatchingError}</p>}
                            </div>
                        )}
                    </div>
                    
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <h2 className="text-xl font-bold mb-4">이송 관리</h2>
                        <button
                            onClick={handleCompleteTransport}
                            className="w-full bg-green-600 text-white font-semibold py-3 rounded-lg hover:bg-green-700 transition-colors"
                        >
                            🏥 이송 완료 (업무 종료)
                        </button>
                        <p className="text-xs text-gray-500 mt-2 text-center">
                            병원에 환자 인계를 마친 후 클릭하세요.
                        </p>
                    </div>
                </div>

                <div className="lg:col-span-1 bg-white p-6 rounded-lg shadow-md h-[400px] lg:h-auto">
                    <h2 className="text-xl font-bold mb-4">실시간 위치</h2>
                    <MapDisplay
                        hospital={matchedHospital}
                        ambulanceLocation={displayLocation}
                    />
                </div>

                <div className="lg:col-span-1 bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-xl font-bold mb-4">화상 통화</h2>
                    <div className="h-full min-h-[300px] bg-gray-200 rounded-lg flex items-center justify-center">
                        {isCalling && matchedHospital ? (
                            <WebRtcCall
                                sessionId={user.userId.toString()}
                                ambulanceNumber={user.userKey}
                                onLeave={() => setIsCalling(false)}
                                patientName={selectedAmbulance.patientInfo?.name || ""}
                                ktas={selectedAmbulance.patientDetails?.ktasLevel || ""}
                                hospitalId={matchedHospital.id || matchedHospital.hospitalId}
                            />
                        ) : (
                            <div className="text-center">
                                <p className="text-gray-500">
                                    {matchedHospital ? "매칭된 병원과 통화를 시작합니다..." : "병원 매칭 대기 중..."}
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AmbulanceLayout>
    );
}