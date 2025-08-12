import React from 'react';

const InfoPanel = ({ firestationInfo, currentFirestationId, showOnlyMyFirestation, statusFilter, filteredAmbulances, ambulances, isMapInitialized }) => {
  return (
    <div className="absolute top-4 left-4 bg-white bg-opacity-90 rounded-lg shadow-lg p-3 z-10 min-w-64">
      <div className="text-sm">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold text-gray-800 flex items-center">
            🗺️ 구급차 현황
            {!isMapInitialized && (
              <div className="ml-2 w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            )}
          </h3>
        </div>
        
        <div className="space-y-1 text-xs">
          <div className="flex justify-between">
            <span className="text-gray-600">소속 소방서:</span>
            <span className="font-medium">{firestationInfo?.name || '로딩중...'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Station ID:</span>
            <span className="font-medium">{currentFirestationId || 'N/A'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">표시 모드:</span>
            <span className="font-medium text-blue-600">
              {showOnlyMyFirestation ? '소속만' : '전체'}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">상태 필터:</span>
            <span className="font-medium text-green-600">{statusFilter}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">표시된 구급차:</span>
            <span className="font-medium text-purple-600">{filteredAmbulances.length}대</span>
          </div>
          {showOnlyMyFirestation && (
            <div className="flex justify-between">
              <span className="text-gray-600">전체 구급차:</span>
              <span className="font-medium text-gray-500">{ambulances.length}대</span>
            </div>
          )}
        </div>

        {/* 상태별 구급차 개수 */}
        <div className="mt-3 pt-2 border-t border-gray-200">
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              <span>대기: {filteredAmbulances.filter(a => a.status?.toUpperCase() === 'WAIT').length}</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span>출동: {filteredAmbulances.filter(a => a.status?.toUpperCase() === 'DISPATCH').length}</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>이송: {filteredAmbulances.filter(a => a.status?.toUpperCase() === 'TRANSFER').length}</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
              <span>기타: {filteredAmbulances.filter(a => !['WAIT', 'DISPATCH', 'TRANSFER'].includes(a.status?.toUpperCase())).length}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InfoPanel;
