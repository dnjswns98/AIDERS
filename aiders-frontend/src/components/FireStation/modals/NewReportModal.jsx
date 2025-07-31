
import React, { useState } from 'react';
import { useAppContext } from '../../../hooks/useAppContext';
import AddressSearchModal from './AddressSearchModal';

const NewReportModal = ({ onClose, onReportCreated }) => {
    const { addReport } = useAppContext();
    const [isMapModalOpen, setMapModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        reporterName: '',
        reporterTel: '',
        location: '',
        patientStatus: '',
        content: '',
        priority: ''
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleAddressSelect = (address) => {
        setFormData(prev => ({ ...prev, location: address }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const newReport = {
            id: Date.now(),
            reportNumber: `20250728${Date.now().toString().slice(-4)}`,
            date: new Date().toLocaleString('sv-SE').replace(' ', '-'),
            ...formData
        };
        addReport(newReport);
        onClose();
        if (onReportCreated) {
            onReportCreated(newReport);
        }
    };

    return (
        <>
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-xl p-6 w-full max-w-full sm:max-w-lg mx-4">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-semibold text-gray-900">신규 신고 등록</h3>
                        <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                            <i className="fas fa-times text-xl"></i>
                        </button>
                    </div>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">신고자 성명</label>
                                <input type="text" name="reporterName" value={formData.reporterName} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" placeholder="신고자 이름을 입력하세요" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">연락처</label>
                                <input type="tel" name="reporterTel" value={formData.reporterTel} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" placeholder="010-0000-0000" />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">신고 위치</label>
                            <div className="flex space-x-2">
                                <input type="text" name="location" value={formData.location} onChange={handleChange} className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" placeholder="상세 주소를 입력하세요" />
                                <button type="button" onClick={() => setMapModalOpen(true)} className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition-colors !rounded-button whitespace-nowrap">지도</button>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">환자 상태</label>
                            <textarea name="patientStatus" value={formData.patientStatus} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" rows={3} placeholder="환자의 현재 상태를 상세히 입력하세요" maxLength={500}></textarea>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">신고 내용</label>
                            <textarea name="content" value={formData.content} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" rows={3} placeholder="신고 내용을 상세히 입력하세요" maxLength={500}></textarea>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">우선순위</label>
                            <select name="priority" value={formData.priority} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm">
                                <option value="">선택</option>
                                <option value="emergency">응급</option>
                                <option value="urgent">준응급</option>
                                <option value="semi-urgent">준급성</option>
                                <option value="non-urgent">비응급</option>
                            </select>
                        </div>
                        <div className="flex space-x-3 pt-4">
                            <button type="submit" className="flex-1 bg-red-600 text-white py-2 rounded-md hover:bg-red-700 transition-colors !rounded-button whitespace-nowrap">등록</button>
                            <button type="button" onClick={onClose} className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-md hover:bg-gray-400 transition-colors !rounded-button whitespace-nowrap">취소</button>
                        </div>
                    </form>
                </div>
            </div>
            <AddressSearchModal 
                isOpen={isMapModalOpen}
                onClose={() => setMapModalOpen(false)}
                onAddressSelect={handleAddressSelect}
            />
        </>
    );
};

export default NewReportModal;
