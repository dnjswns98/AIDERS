
import React from 'react';

const CallDialog = ({ hospital, onClose }) => {
    if (!hospital) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
                <h3 className="text-xl font-bold mb-4 text-gray-800">통화 확인</h3>
                <p className="text-gray-600 mb-2">
                    <strong>{hospital.name}</strong>에 연락하시겠습니까?
                </p>
                <p className="text-gray-600 mb-6">
                    전화번호: {hospital.phone}
                </p>
                <div className="flex space-x-3">
                    <a href={`tel:${hospital.phone}`} className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors whitespace-nowrap text-center">
                        통화하기
                    </a>
                    <button onClick={onClose} className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-lg font-medium hover:bg-gray-300 transition-colors whitespace-nowrap">
                        취소
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CallDialog;
