// src/router/AmbulanceRouters.jsx

import React, { useEffect, useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import useEmergencyStore from '../store/useEmergencyStore';
import { useAuthStore } from '../store/useAuthStore';

// 페이지 컴포넌트들을 모두 import 합니다.
import AmbulanceDashboardPage from '../pages/Emergency/AmbulanceDashboardPage';
import AmbulancePatientInputPage from '../pages/Emergency/AmbulancePatientInputPage';
import AmbulanceMapPage from '../pages/Emergency/AmbulanceMapPage';
import AmbulancePatientInfoPage from '../pages/Emergency/AmbulancePatientInfoPage';
import AmbulanceDispatchWaitingPage from '../pages/Emergency/AmbulanceDispatchWaitingPage';
import AmbulanceDispatchInProgressPage from '../pages/Emergency/AmbulanceDispatchInProgressPage';

/**
 * 구급차의 현재 상태에 따라 적절한 페이지로 리디렉션하는 컴포넌트
 */
const AmbulanceRouteGuard = () => {
    // 필요한 상태만 정확히 선택합니다.
    const selectedAmbulance = useEmergencyStore(state => state.selectedAmbulance);
    const status = selectedAmbulance?.status?.toLowerCase();

    console.log(`[RouteGuard] 현재 상태(${status}) 확인하여 경로를 결정합니다.`);

    let targetPath;
    switch (status) {
        case 'dispatch':
            targetPath = '/emergency/dispatch-in-progress';
            break;
        case 'transfer':
            targetPath = '/emergency/map';
            break;
        case 'wait':
        case 'standby':
            targetPath = '/emergency/waiting';
            break;
        default:
            targetPath = '/emergency/waiting';
            break;
    }
    
    return <Navigate to={targetPath} replace />;
};

const AmbulanceRouters = () => {
    // 🔥 수정: 스토어의 상태와 함수를 개별적으로 가져와 불필요한 리렌더링을 방지합니다.
    const selectMyAmbulance = useEmergencyStore(state => state.selectMyAmbulance);
    const isDataLoaded = useEmergencyStore(state => !!state.selectedAmbulance); // 데이터 로드 여부를 스토어 상태로 직접 판단

    const { user } = useAuthStore();
    const [isLoading, setIsLoading] = useState(true); // 컴포넌트의 로딩 상태를 관리합니다.

    useEffect(() => {
        if (user?.userId) {
            // 스토어에 데이터가 아직 로드되지 않았다면, 데이터를 가져옵니다.
            if (!isDataLoaded) {
                selectMyAmbulance().finally(() => setIsLoading(false));
            } else {
                // 이미 데이터가 있다면 로딩을 즉시 종료합니다.
                setIsLoading(false);
            }
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user?.userId, isDataLoaded]); // user와 데이터 로드 상태가 변경될 때만 실행됩니다.

    // 데이터가 준비될 때까지 로딩 화면을 표시합니다.
    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-xl text-gray-700">구급차 정보를 불러오는 중입니다...</p>
                </div>
            </div>
        );
    }

    return (
        <Routes>
            <Route path="/" element={<AmbulanceRouteGuard />} />
            <Route path="/dashboard" element={<AmbulanceDashboardPage />} />
            <Route path="/waiting" element={<AmbulanceDispatchWaitingPage />} />
            <Route path="/dispatch-in-progress" element={<AmbulanceDispatchInProgressPage />} />
            <Route path="/map" element={<AmbulanceMapPage />} />
            <Route path="/patient-input" element={<AmbulancePatientInputPage />} />
            <Route path="/patient-info" element={<AmbulancePatientInfoPage />} />
        </Routes>
    );
};

export default AmbulanceRouters;