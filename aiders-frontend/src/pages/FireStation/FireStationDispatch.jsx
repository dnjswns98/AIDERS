
import React, { useEffect, useState } from 'react';
import { useAppContext } from '../../hooks/useAppContext';
import { getStatusColor, getStatusText } from "../../utils/statusUtils";
import ReportSelectionModal from "../../components/FireStation/modals/ReportSelectionModal";
import DispatchFormModal from "../../components/FireStation/modals/DispatchFormModal";
import { useAuthStore } from '../../store/useAuthStore';

const Dispatch = () => {
    const { ambulances } = useAppContext();
    const [showReportSelectionModal, setShowReportSelectionModal] = useState(false);
    const [selectedReport, setSelectedReport] = useState(null);
    const [dispatchHistory, setDispatchHistory] = useState([]);
    const {accessToken} = useAuthStore();


    useEffect(() => {
        fetch('/api/v1/dispatch/history', {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        })
        .then(response => response.json())
        .then(data => {
            if (Array.isArray(data)) {
                setDispatchHistory(data);
            } else {
                console.error('Received data is not an array:', data);
                setDispatchHistory([]); // 크래시를 방지하기 위해 빈 배열로 설정
            }
        })
        .catch(error => {
            console.error('Error fetching dispatch history:', error)
            setDispatchHistory([]); // 에러 발생 시 빈 배열로 설정
        });
    }, []);

    const handleReportSelected = (report) => {
        setSelectedReport(report);
        setShowReportSelectionModal(false);
    };

    const handleDispatchFormClose = () => {
        setSelectedReport(null);
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">배차 관리</h2>
                <button onClick={() => setShowReportSelectionModal(true)} className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors !rounded-button whitespace-nowrap">
                    <i className="fas fa-plus mr-2"></i>
                    배차 신청
                </button>
            </div>
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="px-6 py-4 bg-gray-50 border-b">
                    <h3 className="text-lg font-semibold text-gray-900">배차 현황</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">구급차 번호</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">상태</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">현재 위치</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">배차 시간</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">작업</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {dispatchHistory.map((dispatch) => (
                                <tr key={dispatch.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{dispatch.ambulance.carNumber}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 text-xs font-medium rounded-full text-white ${getStatusColor(dispatch.ambulance.status)}`}>
                                            {getStatusText(dispatch.ambulance.status)}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500">{dispatch.address}</td>
                                    <td className="px-6 py-4 text-sm text-gray-500">{new Date(dispatch.dispatchTime).toLocaleString()}</td>
                                    <td className="px-6 py-4 text-sm font-medium">
                                        <button className="text-blue-600 hover:text-blue-900"><i className="fas fa-map-marker-alt mr-1"></i>위치추적</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            {showReportSelectionModal && <ReportSelectionModal onClose={() => setShowReportSelectionModal(false)} onReportSelected={handleReportSelected} />}
            {selectedReport && <DispatchFormModal report={selectedReport} onClose={handleDispatchFormClose} />}
        </div>
    );
};

export default Dispatch;
