import React from 'react';
import { useAppContext } from '../../../hooks/useAppContext';

const ReportSelectionModal = ({ onClose, onReportSelected }) => {
    const { reports } = useAppContext();

    const handleSelectReport = (report) => {
        onReportSelected(report);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-full sm:max-w-md mx-4">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-gray-900">신고 선택</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <i className="fas fa-times text-xl"></i>
                    </button>
                </div>
                <div className="space-y-4 max-h-96 overflow-y-auto">
                    {reports.filter(report => !report.isDispatched).length === 0 ? (
                        <p className="text-gray-600">현재 배차 가능한 신고가 없습니다.</p>
                    ) : (
                        reports.filter(report => !report.isDispatched).map((report) => (
                            <div
                                key={report.id}
                                className="p-4 border border-gray-200 rounded-md cursor-pointer hover:bg-gray-50"
                                onClick={() => handleSelectReport(report)}
                            >
                                <p className="text-sm font-medium text-gray-800">신고번호: {report.reportNumber}</p>
                                <p className="text-xs text-gray-600">위치: {report.location}</p>
                                <p className="text-xs text-gray-600">내용: {report.content}</p>
                                <p className="text-xs text-gray-600">우선순위: {report.priority}</p>
                            </div>
                        ))
                    )}
                </div>
                <div className="flex justify-end pt-4">
                    <button type="button" onClick={onClose} className="bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 transition-colors !rounded-button whitespace-nowrap">닫기</button>
                </div>
            </div>
        </div>
    );
};

export default ReportSelectionModal;