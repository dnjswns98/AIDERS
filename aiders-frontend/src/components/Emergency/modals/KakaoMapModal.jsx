import React from 'react';
import MapDisplay from '../MapDisplay';

const KakaoMapModal = ({ isOpen, onClose, hospital, patientInfo }) => {
  if (!isOpen) return null; // 모달이 닫혀있으면 아무것도 렌더링하지 않음

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4 h-3/4 flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
          <h3 className="text-lg font-semibold text-gray-900">병원 길찾기</h3>
          {hospital && <p className="text-sm text-gray-700">매칭 병원: {hospital.name}</p>}
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <i className="fas fa-times text-xl"></i>
          </button>
        </div>
        <div className="flex-grow">
          <MapDisplay hospital={hospital} />
        </div>
      </div>
    </div>
  );
};

export default KakaoMapModal;


