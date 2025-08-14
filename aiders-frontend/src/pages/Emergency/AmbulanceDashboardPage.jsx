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
import Stomp from "stompjs";
import SockJS from "sockjs-client";
import WebRtcCall from "../../components/webRTC/WebRtcCall";

export default function AmbulanceDashboardPage() {
    const navigate = useNavigate();
    const { user } = useAuthStore();

    const { 
        selectedAmbulance, 
        selectMyAmbulance, 
        matchedHospitals, 
        patientInfo,
        patientDetails,
        setEditMode
    } = useEmergencyStore();
    
    const { isCallActive, callInfo, endCall, setPipMode } = useWebRtcStore();
    const { ambulanceLocation, hospitalDistanceInfo } = useLiveAmbulanceLocation(user?.userId);
    
    useEffect(() => {
        setPipMode(false);
    }, [setPipMode]);

    useEffect(() => {
        if (!selectedAmbulance && user?.userId) {
            selectMyAmbulance();
        }
    }, [user?.userId, selectedAmbulance, selectMyAmbulance]);

    const handleRequestCall = useCallback(() => {
        if (!matchedHospitals[0]) {
            alert("매칭된 병원 정보가 없습니다.");
            return;
        }

        const WS_BASE_URL = (import.meta.env.VITE_WS_BASE_URL || "ws://localhost:8080/ws")
            .replace(/^ws:\/\//, "http://").replace(/^wss:\/\//, "https://");

        const socket = new SockJS(WS_BASE_URL);
        const stompClient = Stomp.over(socket);
        stompClient.debug = null;

        stompClient.connect({}, (frame) => {
            console.log("📞 전화 요청을 위해 WebSocket 연결 성공");
            
            const requestAlarm = {
                type: "REQUEST",
                ambulanceKey: user.userKey,
                message: `구급차(${user.userKey})에서 통화를 요청했습니다.`
            };
            
            stompClient.send("/pub/alarm/send", {}, JSON.stringify(requestAlarm));
            console.log("📤 전화 요청 알림 전송:", requestAlarm);
            alert("병원에 통화를 요청했습니다.");

            setTimeout(() => {
                stompClient.disconnect(() => {
                    console.log("🔌 전화 요청 후 WebSocket 연결 종료");
                });
            }, 500);
        }, (error) => {
            console.error("❌ 전화 요청 WebSocket 연결 실패:", error);
            alert("병원에 통화 요청을 보내는 데 실패했습니다.");
        });
    }, [user, matchedHospitals]);

    const goToPatientInput = () => {
        const status = selectedAmbulance?.status?.toLowerCase();
        if (status === 'wait' || status === 'standby') {
            alert("출동 지시를 받은 후 환자 정보를 입력할 수 있습니다.");
            return;
        }
        setEditMode(true); 
        navigate('/emergency/patient-input', { state: { isEditMode: true } });
    };

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
                            <p><strong>이름:</strong> {patientInfo?.name || "-"}</p>
                            <p><strong>KTAS:</strong> {patientDetails?.ktasLevel || "-"}</p>
                            <p><strong>주요 증상:</strong> {patientDetails?.chiefComplaint || patientDetails?.medicalRecord || "-"}</p>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <h2 className="text-xl font-bold mb-4">병원 매칭</h2>
                        {matchedHospital ? <HospitalCard hospital={matchedHospital} simple /> : <p>매칭 대기 중...</p>}
                    </div>
                </div>

                <div className="lg:col-span-1 bg-white p-6 rounded-lg shadow-md h-[400px] lg:h-auto relative">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-bold">실시간 위치</h2>
                        <button 
                            onClick={() => navigate('/emergency/map')}
                            className="bg-gray-200 text-gray-700 px-3 py-1 rounded-lg text-xs hover:bg-gray-300"
                        >
                            전체화면
                        </button>
                    </div>
                    <MapDisplay
                        hospital={matchedHospital}
                        ambulanceLocation={ambulanceLocation}
                        distanceInfo={hospitalDistanceInfo}
                    />
                </div>

                <div className="lg:col-span-1 bg-white p-6 rounded-lg shadow-md flex flex-col">
                    <h2 className="text-xl font-bold mb-4">화상 통화</h2>
                    <div className="flex-grow h-full min-h-[300px] bg-gray-200 rounded-lg flex items-center justify-center">
                        {isCallActive && callInfo ? (
                            <WebRtcCall
                                sessionId={String(callInfo.sessionId)}
                                ambulanceNumber={callInfo.ambulanceNumber}
                                hospitalId={callInfo.hospitalId}
                                patientName={callInfo.patientName}
                                ktas={callInfo.ktas}
                                onLeave={endCall}
                            />
                        ) : (
                            <div className="text-center">
                                <p className="text-gray-500 mb-4">병원과 화상 통화가 필요하신가요?</p>
                                <button
                                    onClick={handleRequestCall}
                                    disabled={!matchedHospital}
                                    className="bg-orange-500 text-white font-bold py-3 px-6 rounded-lg disabled:bg-gray-400 hover:bg-orange-600"
                                >
                                    📞 전화 요청 하기
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AmbulanceLayout>
    );
}