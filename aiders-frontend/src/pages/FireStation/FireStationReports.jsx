
import React, { useState } from 'react';
import { useAppContext } from '../../hooks/useAppContext';
import { getPriorityColor, getPriorityText } from "../../utils/statusUtils";
import NewReportModal from "../../components/FireStation/modals/NewReportModal";
import EditReportModal from "../../components/FireStation/modals/EditReportModal";
import PatientModal from "../../components/FireStation/modals/PatientModal";

const Reports = () => {
    const { reports } = useAppContext();
    const [showNewReportModal, setShowNewReportModal] = useState(false);
    const [showEditReportModal, setShowEditReportModal] = useState(false);
    const [showPatientModal, setShowPatientModal] = useState(false);
    const [selectedReport, setSelectedReport] = useState(null);

    const handleEditClick = (report) => {
        setSelectedReport(report);
        setShowEditReportModal(true);
    };

    const handlePatientInfoClick = (report) => {
        setSelectedReport(report);
        setShowPatientModal(true);
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">신고 접수 현황</h2>
                <button onClick={() => setShowNewReportModal(true)} className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors !rounded-button whitespace-nowrap">
                    <i className="fas fa-plus mr-2"></i>
                    신규 신고
                </button>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {reports.map((report) => (
                    <div key={report.id} className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between mb-4">
                            <div>
                                <div className="text-lg font-semibold text-gray-900 mb-1">신고번호: {report.reportNumber}</div>
                                <div className="text-sm text-gray-500">{report.date}</div>
                            </div>
                            <div className={`px-3 py-1 rounded-full text-xs font-medium border ${getPriorityColor(report.priority)}`}>
                                {getPriorityText(report.priority)}
                            </div>
                        </div>
                        <div className="space-y-3">
                            <div className="flex items-start space-x-2">
                                <i className="fas fa-map-marker-alt text-red-500 mt-1"></i>
                                <div className="text-sm text-gray-700">{report.location}</div>
                            </div>
                            <div className="flex items-start space-x-2">
                                <i className="fas fa-file-medical text-blue-500 mt-1"></i>
                                <div className="text-sm text-gray-700">{report.content}</div>
                            </div>
                        </div>
                        <div className="flex flex-wrap items-center justify-end gap-2 mt-6">
                            <button onClick={() => handlePatientInfoClick(report)} className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 transition-colors !rounded-button whitespace-nowrap">환자정보</button>
                            <button className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 transition-colors !rounded-button whitespace-nowrap">배차요청</button>
                            <button onClick={() => handleEditClick(report)} className="bg-gray-600 text-white px-3 py-1 rounded text-sm hover:bg-gray-700 transition-colors !rounded-button whitespace-nowrap">수정</button>
                        </div>
                    </div>
                ))}
            </div>

            {showNewReportModal && <NewReportModal onClose={() => setShowNewReportModal(false)} />}
            {showEditReportModal && selectedReport && <EditReportModal report={selectedReport} onClose={() => setShowEditReportModal(false)} />}
            {showPatientModal && selectedReport && <PatientModal report={selectedReport} onClose={() => setShowPatientModal(false)} />}
        </div>
    );
};

export default Reports;
