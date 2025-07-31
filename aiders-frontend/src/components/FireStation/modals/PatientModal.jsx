
import React, { useEffect, useState } from 'react';
import { useAppContext } from '../../../hooks/useAppContext';
import useEmergencyStore from '../../../store/useEmergencyStore';

const PatientModal = ({ report, onClose, onSave }) => {
    const { ambulances, updateReport, setAmbulances } = useAppContext();
    const { updatePatientInfo } = useEmergencyStore();
    const [formData, setFormData] = useState({
        patientName: '',
        gender: '',
        ageGroup: '',
        symptoms: report.content || '',
        transportStartTime: '',
        ambulanceId: report.ambulanceId || ''
    });

    useEffect(() => {
        setFormData({
            patientName: report.patientInfo?.name || '',
            gender: report.patientInfo?.gender || '',
            ageGroup: report.patientInfo?.ageGroup || '',
            symptoms: report.condition || report.content || '',
            transportStartTime: report.callTime || '',
            ambulanceId: report.ambulanceId || ''
        });
    }, [report]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // Handle patient data submission
        const updatedReport = {
            ...report,
            patientInfo: {
                name: formData.patientName,
                gender: formData.gender,
                ageGroup: formData.ageGroup,
                basicInfo: `${formData.gender}, ${formData.ageGroup}` // 예시로 basicInfo 추가
            },
            condition: formData.symptoms,
            callTime: formData.transportStartTime,
            ambulanceId: formData.ambulanceId
        };
        updateReport(updatedReport);

        // 구급차의 환자 정보도 업데이트
        if (report.ambulanceId) {
            updatePatientInfo(report.ambulanceId, {
                patientInfo: {
                    name: formData.patientName,
                    gender: formData.gender,
                    ageGroup: formData.ageGroup,
                    basicInfo: `${formData.gender}, ${formData.ageGroup}`
                },
                patientDetails: { // 필요하다면 여기에 상세 정보 추가
                    chiefComplaint: formData.symptoms,
                    callTime: formData.transportStartTime
                }
            }, setAmbulances);
        }

        console.log("Patient Info Submitted:", updatedReport);
        onSave(updatedReport);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-full sm:max-w-lg mx-4">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-gray-900">환자 정보</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <i className="fas fa-times text-xl"></i>
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">구조자명</label>
                            <input type="text" name="patientName" value={formData.patientName} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" placeholder="환자 이름" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">성별</label>
                            <select name="gender" value={formData.gender} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm">
                                <option value="">선택</option>
                                <option value="male">남성</option>
                                <option value="female">여성</option>
                            </select>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">연령대</label>
                        <select name="ageGroup" value={formData.ageGroup} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm">
                            <option value="">선택</option>
                            <option value="child">소아 (0-12세)</option>
                            <option value="teen">청소년 (13-19세)</option>
                            <option value="adult">성인 (20-64세)</option>
                            <option value="senior">고령자 (65세 이상)</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">주요 증상</label>
                        <textarea name="symptoms" value={formData.symptoms} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" rows={3} placeholder="환자의 주요 증상을 입력하세요"></textarea>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">이송 시작 시각</label>
                            <input type="time" name="transportStartTime" value={formData.transportStartTime} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">구급차 번호</label>
                            {report.isDispatched ? (
                                <input
                                    type="text"
                                    value={ambulances.find(amb => amb.id === report.ambulanceId)?.number || '배차 정보 없음'}
                                    readOnly
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-sm"
                                />
                            ) : (
                                <select name="ambulanceId" value={formData.ambulanceId} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm">
                                    <option value="">선택</option>
                                    {ambulances.map(ambulance => (
                                        <option key={ambulance.id} value={ambulance.id}>{ambulance.number}</option>
                                    ))}
                                </select>
                            )}
                        </div>
                    </div>
                    <div className="flex space-x-3 pt-4">
                        <button type="submit" className="flex-1 bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition-colors !rounded-button whitespace-nowrap">저장</button>
                        <button type="button" onClick={onClose} className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-md hover:bg-gray-400 transition-colors !rounded-button whitespace-nowrap">취소</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default PatientModal;
