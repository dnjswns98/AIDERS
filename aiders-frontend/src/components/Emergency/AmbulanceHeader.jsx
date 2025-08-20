// src/components/Emergency/AmbulanceHeader.jsx

import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAppContext } from '../../hooks/useAppContext';
import { useAuthStore } from '../../store/useAuthStore';
import useEmergencyStore from '../../store/useEmergencyStore';

const AmbulanceHeader = ({ disableInteraction = false }) => {
    const { currentTime } = useAppContext();
    const { logout } = useAuthStore();
    const navigate = useNavigate();

    const { selectedAmbulance, completeTransport, resetHospitalMatching } = useEmergencyStore();

    const ambulanceStatus = selectedAmbulance?.status?.toLowerCase() || selectedAmbulance?.currentStatus?.toLowerCase();

    const handleCompleteTransport = async () => {
        if (disableInteraction) return; // 상호작용 비활성화 시 클릭 무시
        if (window.confirm("환자 인계를 완료하고 대기 상태로 돌아가시겠습니까?")) {
            await completeTransport(navigate);
        }
    };

    // 구급차 상태가 'transfer'일 때만 헤더를 렌더링합니다.
    if (ambulanceStatus !== 'transfer') {
        return null;
    }

    const headerClasses = `bg-blue-800 text-white shadow-lg ${disableInteraction ? 'pointer-events-none opacity-50' : ''}`;

    return (
        <header className={headerClasses}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <div className="flex items-center space-x-4">
                        <i className="fas fa-ambulance text-green-400 text-2xl"></i>
                        <NavLink to="/emergency" className={disableInteraction ? 'pointer-events-none' : ''}>
                            <h1 className="text-base sm:text-lg md:text-xl font-bold">구급차 현장 관리 시스템</h1>
                        </NavLink>
                    </div>
                    <nav className="flex items-center space-x-2 sm:space-x-4 md:space-x-8">
                        <NavLink to="/emergency/map" className={({ isActive }) => `px-4 py-2 rounded-md transition-colors duration-200 !rounded-button whitespace-nowrap ${isActive ? 'bg-blue-600' : 'hover:bg-blue-700'} ${disableInteraction ? 'pointer-events-none' : ''}`}>
                            지도
                        </NavLink>
                        <NavLink to="/emergency/patient-info" className={({ isActive }) => `px-4 py-2 rounded-md transition-colors duration-200 !rounded-button whitespace-nowrap ${isActive ? 'bg-blue-600' : 'hover:bg-blue-700'} ${disableInteraction ? 'pointer-events-none' : ''}`}>
                            환자 정보 조회
                        </NavLink>
                    </nav>
                    <div className="flex items-center space-x-4">
                        <div className="text-sm">{currentTime.toLocaleString('ko-KR')}</div>
                        
                        {/* 🔥 구급차 상태가 'transfer'일 때만 '이송 완료' 버튼을 표시합니다. */}
                        {ambulanceStatus === 'transfer' && (
                            <button 
                                onClick={handleCompleteTransport} 
                                className="px-4 py-2 rounded-md bg-green-600 hover:bg-green-700 transition-colors font-semibold"
                                disabled={disableInteraction}
                            >
                                🏥 이송 완료
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
};

export default AmbulanceHeader;