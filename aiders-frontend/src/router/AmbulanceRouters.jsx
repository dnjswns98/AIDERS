// src/router/AmbulanceRouters.jsx

import React, { useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import useEmergencyStore from '../store/useEmergencyStore';
import { useAuthStore } from '../store/useAuthStore';
import AmbulanceDashboardPage from '../pages/Emergency/AmbulanceDashboardPage';
import AmbulancePatientInputPage from '../pages/Emergency/AmbulancePatientInputPage';
import AmbulanceMapPage from '../pages/Emergency/AmbulanceMapPage';
import AmbulancePatientInfoPage from '../pages/Emergency/AmbulancePatientInfoPage';
import AmbulanceDispatchWaitingPage from '../pages/Emergency/AmbulanceDispatchWaitingPage';

const AmbulanceRouters = () => {
    const { selectedAmbulance, selectMyAmbulance } = useEmergencyStore();
    const { user } = useAuthStore();
    const navigate = useNavigate();

    // 로그인 시 자신의 구급차 정보를 선택합니다.
    useEffect(() => {
        if (!selectedAmbulance && user?.userId) {
            selectMyAmbulance();
        }
    }, [user, selectedAmbulance, selectMyAmbulance]);

    // === 추가된 상태 폴링 로직 ===
    useEffect(() => {
        // user가 있고 selectedAmbulance가 있을 때만 폴링 시작
        if (user?.userId && selectedAmbulance) {
            const pollingInterval = setInterval(() => {
                // 3초마다 구급차 상태를 새로고침합니다.
                selectMyAmbulance();
                console.log("[AmbulanceRouters] 구급차 상태 새로고침 (3초마다)");
            }, 3000); // 3000ms = 3초

            // 컴포넌트 언마운트 시 인터벌을 정리합니다.
            return () => clearInterval(pollingInterval);
        }
    }, [user, selectedAmbulance, selectMyAmbulance]);
    // =============================

    const renderAmbulanceContent = () => {
        if (!selectedAmbulance) {
            return (
                <div className="flex items-center justify-center min-h-screen">
                    <div className="text-center">
                        <p className="text-xl text-gray-700">구급차 정보를 불러오는 중입니다...</p>
                    </div>
                </div>
            );
        }

        const status = selectedAmbulance?.status?.toLowerCase();
        
        console.log(`[AmbulanceRouters] 현재 구급차 상태: ${status}`);

        if (status === 'wait' || status === 'standby') {
            return <AmbulanceDispatchWaitingPage />;
        }
        
        if (status === 'dispatched' || status === 'transfer') {
            return <AmbulanceMapPage />;
        }
        
        return <AmbulanceDashboardPage />;
    };

    return (
        <Routes>
            <Route path="/" element={renderAmbulanceContent()} />
            <Route path="/waiting" element={<AmbulanceDispatchWaitingPage />} />
            <Route path="/patient-input" element={<AmbulancePatientInputPage />} />
            <Route path="/patient-info" element={<AmbulancePatientInfoPage />} />
            <Route path="/map" element={<AmbulanceMapPage />} />
        </Routes>
    );
};

export default AmbulanceRouters;