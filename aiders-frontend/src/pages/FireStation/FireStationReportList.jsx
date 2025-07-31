import React from 'react';
import { useAppContext } from '../../hooks/useAppContext';

const FireStationReportList = () => {
    const { reports } = useAppContext(); // 임시로 reports를 사용

    return (
        <div className="p-8 bg-gray-50 min-h-full">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">소방서 보고서 목록</h2>
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">보고서 ID</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">신고 번호</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">환자 이름</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">이송 시각</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">상태</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {reports.filter(report => report.isDispatched).map(report => (
                            <tr key={report.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{report.id}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{report.reportNumber}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{report.patientInfo?.name || 'N/A'}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{report.callTime || 'N/A'}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{report.isDispatched ? '완료' : '미완료'}</td>
                            </tr>
                        ))}
                        {reports.filter(report => report.isDispatched).length === 0 && (
                            <tr>
                                <td colSpan="5" className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">생성된 보고서가 없습니다.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default FireStationReportList;