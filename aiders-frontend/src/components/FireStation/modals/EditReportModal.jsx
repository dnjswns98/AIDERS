
import React, { useState } from 'react';
import { useAppContext } from '../../../hooks/useAppContext';

const EditReportModal = ({ report, onClose }) => {
    const { updateReport } = useAppContext();
    const [formData, setFormData] = useState(report);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        updateReport(formData);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-full sm:max-w-lg mx-4">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-gray-900">신고 정보 수정</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <i className="fas fa-times text-xl"></i>
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">신고번호</label>
                        <input type="text" value={formData.reportNumber} disabled className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md text-sm" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">접수일시</label>
                        <input type="text" name="date" value={formData.date} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">신고위치</label>
                        <div className="flex space-x-2">
                            <input type="text" name="location" value={formData.location} onChange={handleChange} className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
                            <button type="button" className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition-colors !rounded-button whitespace-nowrap">지도</button>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">신고내용</label>
                        <textarea name="content" value={formData.content} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" rows={3}></textarea>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">우선순위</label>
                        <select name="priority" value={formData.priority} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm">
                            <option value="emergency">응급</option>
                            <option value="urgent">준응급</option>
                            <option value="semi-urgent">준급성</option>
                            <option value="non-urgent">비응급</option>
                        </select>
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

export default EditReportModal;
