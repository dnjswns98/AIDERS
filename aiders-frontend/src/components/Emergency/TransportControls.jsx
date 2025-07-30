
import React from 'react';

const TransportControls = ({ transportStatus, onTransportStart, onTransportComplete }) => {
    return (
        <div className="bg-white rounded-lg shadow-md p-4">
            <h3 className="font-bold text-lg mb-4 text-gray-800">이송 관리</h3>

            {transportStatus === 'ready' && (
                <button
                    onClick={onTransportStart}
                    className="w-full bg-green-600 text-white py-4 rounded-lg font-bold text-lg hover:bg-green-700 transition-colors whitespace-nowrap"
                >
                    <i className="fas fa-ambulance mr-2"></i>이송 시작
                </button>
            )}

            {transportStatus === 'started' && (
                <div className="space-y-3">
                    <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded-lg">
                        <div className="flex items-center">
                            <i className="fas fa-info-circle mr-2"></i>
                            <span>이송이 진행 중입니다.</span>
                        </div>
                    </div>
                    <button
                        onClick={onTransportComplete}
                        className="w-full bg-blue-600 text-white py-4 rounded-lg font-bold text-lg hover:bg-blue-700 transition-colors whitespace-nowrap"
                    >
                        <i className="fas fa-check mr-2"></i>이송 완료
                    </button>
                </div>
            )}

            {transportStatus === 'completed' && (
                <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg">
                    <div className="flex items-center">
                        <i className="fas fa-check-circle mr-2"></i>
                        <span>이송이 완료되었습니다.</span>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TransportControls;
