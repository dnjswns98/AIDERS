import React, { useEffect, useState, lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import useEmergencyStore from '../store/useEmergencyStore';
import { useAuthStore } from '../store/useAuthStore';
// 🔥 추가: WebRTC 컨텍스트 프로바이더와 글로벌 매니저를 임포트합니다.
import { WebRtcProvider } from '../context/WebRtcContext';
import GlobalCallManager from '../components/Emergency/GlobalCallManager';


// 🔽 수정: React.lazy를 사용하여 페이지 컴포넌트를 동적으로 임포트합니다.
const AmbulanceDashboardPage = lazy(() => import('../pages/Emergency/AmbulanceDashboardPage'));
const AmbulancePatientInputPage = lazy(() => import('../pages/Emergency/AmbulancePatientInputPage'));
const AmbulanceMapPage = lazy(() => import('../pages/Emergency/AmbulanceMapPage'));
const AmbulancePatientInfoPage = lazy(() => import('../pages/Emergency/AmbulancePatientInfoPage'));
const AmbulanceDispatchWaitingPage = lazy(() => import('../pages/Emergency/AmbulanceDispatchWaitingPage'));
const AmbulanceDispatchInProgressPage = lazy(() => import('../pages/Emergency/AmbulanceDispatchInProgressPage'));

// 로딩 중에 보여줄 스피너 컴포넌트
const LoadingSpinner = () => (
    <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-xl text-gray-700">페이지를 불러오는 중입니다...</p>
        </div>
    </div>
);

/**
 * 구급차의 현재 상태에 따라 적절한 페이지로 리디렉션하는 컴포넌트
 */
const AmbulanceRouteGuard = () => {
    const status = useEmergencyStore(state => state.selectedAmbulance?.status?.toLowerCase());

    console.log(`[RouteGuard] 현재 상태(${status}) 확인하여 경로를 결정합니다.`);

    let targetPath;
    switch (status) {
        case 'dispatch':
            targetPath = 'dispatch-in-progress';
            break;
        case 'transfer':
            // 'transfer' 상태일 때 화상통화 대시보드로 이동합니다.
            targetPath = 'dashboard';
            break;
        case 'wait':
        case 'standby':
            targetPath = 'waiting';
            break;
        default:
            // 상태를 알 수 없거나 초기 상태일 때 대기 페이지로 보냅니다.
            targetPath = 'waiting';
            break;
    }
    
    return <Navigate to={targetPath} replace />;
};

const AmbulanceRouters = () => {
    const selectMyAmbulance = useEmergencyStore(state => state.selectMyAmbulance);
    const isDataLoaded = useEmergencyStore(state => !!state.selectedAmbulance);

    const { user } = useAuthStore();
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (user?.userId) {
            if (!isDataLoaded) {
                selectMyAmbulance().finally(() => setIsLoading(false));
            } else {
                setIsLoading(false);
            }
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user?.userId, isDataLoaded]);

    if (isLoading) {
        return <LoadingSpinner />;
    }

    return (
        // 🔥 1. WebRtcProvider로 전체 라우터를 감싸서 모든 페이지가 WebRTC 상태를 공유하도록 합니다.
        <WebRtcProvider>
            {/* 🔥 2. GlobalCallManager는 Routes 외부에 위치하여 페이지가 변경되어도 항상 활성화된 상태로 PIP 모드를 관리합니다. */}
            <GlobalCallManager />
            
            {/* Suspense는 lazy로 불러온 컴포넌트가 로드될 때까지 fallback(로딩 화면)을 보여줍니다. */}
            <Suspense fallback={<LoadingSpinner />}>
                <Routes>
                    {/* 루트 경로는 상태에 따라 적절한 페이지로 리디렉션합니다. */}
                    <Route path="/" element={<AmbulanceRouteGuard />} />
                    
                    {/* '/ambulance/dashboard'가 메인 화상통화 페이지입니다. */}
                    <Route path="dashboard" element={<AmbulanceDashboardPage />} />
                    
                    {/* 아래 페이지들로 이동하면 화상통화는 자동으로 PIP 모드로 전환됩니다. */}
                    <Route path="waiting" element={<AmbulanceDispatchWaitingPage />} />
                    <Route path="dispatch-in-progress" element={<AmbulanceDispatchInProgressPage />} />
                    <Route path="map" element={<AmbulanceMapPage />} />
                    <Route path="patient-input" element={<AmbulancePatientInputPage />} />
                    <Route path="patient-info" element={<AmbulancePatientInfoPage />} />
                </Routes>
            </Suspense>
        </WebRtcProvider>
    );
};

export default AmbulanceRouters;