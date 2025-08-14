import React, { useEffect, useState, useCallback, useMemo } from 'react';
import useFireStationStore from '../../store/useFireStationStore';
import { useAuthStore } from '../../store/useAuthStore';
import Pagination from "../../components/admin/Pagination";

const FireStationDispatch = () => {
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

    const [currentPage, setCurrentPage] = useState(0);
    const itemsPerPage = 10;

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

    const paginatedHistory = useMemo(() => {
        const sortedHistory = [...dispatchHistory].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        const startIndex = currentPage * itemsPerPage;
        return sortedHistory.slice(startIndex, startIndex + itemsPerPage);
    }, [dispatchHistory, currentPage]);

    const totalPages = Math.ceil(dispatchHistory.length / itemsPerPage);

    const handlePageChange = (page) => {
        setCurrentPage(page - 1);
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
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">출동 주소</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">배차 시간</th>
                                {/* --- '환자 상태' th 제거 --- */}
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {paginatedHistory && paginatedHistory.length > 0 ? (
                                paginatedHistory.map((dispatch, index) => {
                                    const ambulanceNumbers = dispatch.ambulanceIds
                                        .map(id => ambulances.find(a => a.ambulanceId === id)?.userKey)
                                        .filter(Boolean)
                                        .join(', ');

                                    return (
                                        <tr key={dispatch.id || index} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 text-sm font-medium text-gray-900">
                                                {ambulanceNumbers || '정보 없음'}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-500">{dispatch.address}</td>
                                            <td className="px-6 py-4 text-sm text-gray-500">{formatDateTime(dispatch.createdAt)}</td>
                                            {/* --- '환자 상태' td 제거 --- */}
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    {/* --- colSpan을 3으로 수정 --- */}
                                    <td colSpan="3" className="px-6 py-4 text-center text-gray-500">
                                        배차 내역이 없습니다.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
                {totalPages > 1 && (
                     <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={handlePageChange}
                    />
                )}
            </div>
        </div>
    );
};

export default FireStationDispatch;