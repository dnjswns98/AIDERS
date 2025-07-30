
import React from 'react';
import { useAppContext } from '../../../hooks/useAppContext';

const DispatchFormModal = ({ onClose }) => {
    const { ambulances } = useAppContext();

    const handleDispatchSubmit = (e) => {
        e.preventDefault();
        // Handle dispatch logic here
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-full sm:max-w-md mx-4">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-gray-900">배차 신청</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <i className="fas fa-times text-xl"></i>
                    </button>
                </div>
                <form onSubmit={handleDispatchSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">구급차 선택</label>
                        <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm">
                            <option value="">구급차를 선택하세요</option>
                            {ambulances.filter(a => a.status === 'standby').map(ambulance => (
                                <option key={ambulance.id} value={ambulance.id}>{ambulance.number}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">환자 위치</label>
                        <div className="flex space-x-2">
                            <input type="text" className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" placeholder="상세 주소를 입력하세요" />
                            <button type="button" className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition-colors !rounded-button whitespace-nowrap">지도</button>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">신고 내용</label>
                        <textarea className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" rows={3} placeholder="신고 내용을 입력하세요"></textarea>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">이송 병원</label>
                        <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm">
                            <option value="">병원을 선택하세요</option>
                            <option value="kwak">곽병원</option>
                            <option value="kyungdae">경대병원</option>
                            <option value="gumi">구미병원</option>
                        </select>
                    </div>
                    <div className="flex space-x-3 pt-4">
                        <button type="submit" className="flex-1 bg-red-600 text-white py-2 rounded-md hover:bg-red-700 transition-colors !rounded-button whitespace-nowrap">배차 신청</button>
                        <button type="button" onClick={onClose} className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-md hover:bg-gray-400 transition-colors !rounded-button whitespace-nowrap">취소</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default DispatchFormModal;
