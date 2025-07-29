
import React from 'react';

const getStatusColor = (status) => {
    if (status === 'available') return 'bg-green-100 text-green-800';
    if (status === 'limited') return 'bg-yellow-100 text-yellow-800';
    return 'bg-gray-100 text-gray-800';
};

const getStatusText = (status) => {
    if (status === 'available') return '수용 가능';
    if (status === 'limited') return '제한적 수용';
    return '확인 중';
};

const HospitalCard = ({ hospital, isSelected, onSelect, onCallClick, onShowMap }) => {
    return (
        <div
            className={`border rounded-lg p-4 cursor-pointer transition-all duration-200 ${
                isSelected ? 'border-red-500 bg-red-50' : 'border-gray-200 hover:border-gray-300'
            }`}
            onClick={() => onSelect(hospital.id)}
        >
            <div className="flex justify-between items-start mb-2">
                <h3 className="font-bold text-lg text-gray-800">
                    {hospital.name}
                </h3>
                <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                        hospital.status
                    )}`}
                >
                    {getStatusText(hospital.status)}
                </span>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 mb-3">
                <div className="flex items-center space-x-2">
                    <i className="fas fa-clock text-blue-500"></i>
                    <span>예상 도착: {hospital.eta}</span>
                </div>
                <div className="flex items-center space-x-2">
                    <i className="fas fa-map-marker-alt text-green-500"></i>
                    <span>거리: {hospital.distance}</span>
                </div>
                <div className="flex items-center space-x-2">
                    <i className="fas fa-bed text-purple-500"></i>
                    <span>가용 병상: {hospital.availableBeds}개</span>
                </div>
                <div className="flex items-center space-x-2">
                    <i className="fas fa-user-md text-orange-500"></i>
                    <span>{hospital.specialists}</span>
                </div>
            </div>

            {isSelected && (
                <div className="border-t pt-3 mt-3 space-y-3">
                    <p className="text-sm text-gray-600 mb-1">
                        <strong>주소:</strong> {hospital.address}
                    </p>
                    <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                        <button
                            className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors whitespace-nowrap"
                            onClick={(e) => {
                                e.stopPropagation(); // Prevent card click from re-triggering
                                onCallClick(hospital);
                            }}
                        >
                            <i className="fas fa-phone mr-2"></i>병원 연락
                        </button>
                        <button className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-green-700 transition-colors whitespace-nowrap"
                            onClick={(e) => {
                                e.stopPropagation();
                                onShowMap(hospital.address);
                            }}
                        >
                            <i className="fas fa-directions mr-2"></i>길찾기
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default HospitalCard;
