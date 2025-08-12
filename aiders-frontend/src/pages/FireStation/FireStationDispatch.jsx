import React, { useEffect, useState, useCallback } from 'react';
import useFireStationStore from '../../store/useFireStationStore';
import { useAuthStore } from '../../store/useAuthStore';
import { getStatusColor, getStatusText } from "../../utils/statusUtils";
import DispatchFormModal from "../../components/FireStation/modals/DispatchFormModal";

const Dispatch = () => {
    const { user } = useAuthStore();
    
    const { 
        dispatchHistory, 
        fetchDispatchHistory, 
        ambulances, 
        fetchFirestationAmbulances,
        firestationInfo,
        fetchFirestationInfo,
        isLoading 
    } = useFireStationStore();

    const [showDispatchModal, setShowDispatchModal] = useState(false);

    const fetchData = useCallback(async () => {
        if (user?.userId) {
            await fetchFirestationInfo();
            await fetchFirestationAmbulances(user.userId);
            await fetchDispatchHistory();
        }
    }, [user?.userId, fetchFirestationInfo, fetchFirestationAmbulances, fetchDispatchHistory]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleDispatchSuccess = () => {
        fetchData();
        setShowDispatchModal(false);
    };

    const formatDateTime = (dateString) => {
        if (!dateString) return '시간 정보 없음';
        
        try {
            const date = new Date(dateString);
            if (date instanceof Date && !isNaN(date)) {
                return date.toLocaleString('ko-KR', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                    hour12: false
                });
            }
        } catch (e) {
            console.error("날짜 파싱 오류:", e);
        }
        return '시간 정보 없음';
    };

    if (isLoading && !dispatchHistory.length) {
        return (
            <div className="p-8 bg-gray-50 min-h-full flex items-center justify-center">
                <div className="text-center text-gray-500">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p>배차 데이터를 불러오는 중입니다...</p>
                </div>
            </div>
        );
    }
    
    return (
        <div className="p-8 bg-gray-50 min-h-full">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">배차 관리</h2>
                <button 
                    onClick={() => setShowDispatchModal(true)} 
                    className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors !rounded-button whitespace-nowrap flex items-center"
                >
                    <i className="fas fa-plus mr-2"></i>
                    신규 배차
                </button>
            </div>
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="px-6 py-4 bg-gray-50 border-b">
                    <h3 className="text-lg font-semibold text-gray-900">최근 배차 현황</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">구급차 번호</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">상태</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">출동 주소</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">배차 시간</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">환자 상태</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {dispatchHistory && dispatchHistory.length > 0 ? (
                                dispatchHistory.map((dispatch, index) => {
                                    const ambulance = ambulances[index] || null;
                                    const ambulanceStatus = ambulance?.status || 'UNKNOWN';

                                    return (
                                        <tr key={dispatch.id || index} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 text-sm font-medium text-gray-900">
                                                {ambulance ? ambulance.userKey : `ID: ${index}`}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-1 text-xs font-medium rounded-full text-white ${
                                                    ambulance ? getStatusColor(ambulanceStatus) : 'bg-gray-400'
                                                }`}>
                                                    {ambulance ? getStatusText(ambulanceStatus) : '정보 없음'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-500">{dispatch.address}</td>
                                            <td className="px-6 py-4 text-sm text-gray-500">{formatDateTime(dispatch.id)}</td>
                                            <td className="px-6 py-4 text-sm text-gray-500">{dispatch.condition}</td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                                        배차 내역이 없습니다.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
            
            <DispatchFormModal
                isOpen={showDispatchModal}
                onClose={() => setShowDispatchModal(false)}
                onDispatchSuccess={handleDispatchSuccess}
                firestationInfo={firestationInfo}
            />
        </div>
    );
};

export default Dispatch;