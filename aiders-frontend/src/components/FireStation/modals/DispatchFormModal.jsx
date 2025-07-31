
import React, { useState, useEffect } from 'react';
import { useAppContext } from '../../../hooks/useAppContext';
import useEmergencyStore from '../../../store/useEmergencyStore';
import useBedStore from '../../../store/useBedStore';
import AddressSearchModal from './AddressSearchModal';

const DispatchFormModal = ({ report, onClose }) => {
    const { ambulances, setAmbulances, updateReport } = useAppContext();
    const { getHospitals } = useBedStore();
    const { updateAmbulanceStatus, getAvailableAmbulances } = useEmergencyStore();
    
    const [isMapModalOpen, setMapModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        ambulanceId: '',
        location: '',
        reportContent: '',
        hospitalId: ''
    });

    useEffect(() => {
        if (report) {
            setFormData(prev => ({
                ...prev,
                location: report.location,
                reportContent: report.content,
            }));
        }
    }, [report]);

    const handleDispatchSubmit = (e) => {
        e.preventDefault();
        if (!formData.ambulanceId || !formData.hospitalId) {
            alert('출동할 구급차와 이송할 병원을 모두 선택해주세요.');
            return;
        }
        // Update ambulance status to '출동중'
        // Ensure ambulanceId is a number for correct matching in the store
        updateAmbulanceStatus(parseInt(formData.ambulanceId, 10), 'dispatched', setAmbulances);
        updateReport({ ...report, isDispatched: true, ambulanceId: parseInt(formData.ambulanceId, 10) });
        console.log("Dispatching ambulance:", formData.ambulanceId, "for report:", report.id, "to hospital:", formData.hospitalId);
        onClose();
    };

    const handleAddressSelect = (address) => {
        setFormData(prev => ({ ...prev, location: address }));
    };

    if (!report) return null;

    return (
        <>
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-xl p-6 w-full max-w-full sm:max-w-md mx-4">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-semibold text-gray-900">배차 신청 (신고번호: {report.reportNumber})</h3>
                        <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                            <i className="fas fa-times text-xl"></i>
                        </button>
                    </div>
                    <form onSubmit={handleDispatchSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">출동 가능 구급차</label>
                            <select 
                                value={formData.ambulanceId}
                                onChange={(e) => setFormData(prev => ({ ...prev, ambulanceId: e.target.value }))}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                            >
                                <option value="">구급차를 선택하세요</option>
                                {getAvailableAmbulances(ambulances).map(ambulance => (
                                    <option key={ambulance.id} value={ambulance.id}>{ambulance.number}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">환자 위치</label>
                            <input 
                                type="text" 
                                value={formData.location}
                                readOnly
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-sm w-full" 
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">신고 내용</label>
                            <textarea 
                                value={formData.reportContent}
                                readOnly
                                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-sm" 
                                rows={3}
                            ></textarea>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">이송 병원</label>
                            <select 
                                value={formData.hospitalId}
                                onChange={(e) => setFormData(prev => ({ ...prev, hospitalId: e.target.value }))}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                            >
                                <option value="">병원을 선택하세요</option>
                                {getHospitals().map(hospital => (
                                    <option key={hospital.id} value={hospital.id}>{hospital.name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="flex space-x-3 pt-4">
                            <button type="submit" className="flex-1 bg-red-600 text-white py-2 rounded-md hover:bg-red-700 transition-colors !rounded-button whitespace-nowrap">배차 확정</button>
                            <button type="button" onClick={onClose} className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-md hover:bg-gray-400 transition-colors !rounded-button whitespace-nowrap">취소</button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
};

export default DispatchFormModal;
