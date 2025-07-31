import React from 'react';
import { getStatusText } from '../../utils/statusUtils';

const statusStyles = {
  'dispatched': { bg: 'bg-blue-100', text: 'text-blue-800', border: 'border-blue-500' },
  'transporting': { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-500' },
  'completed': { bg: 'bg-purple-100', text: 'text-purple-800', border: 'border-purple-500' },
  'returning': { bg: 'bg-orange-100', text: 'text-orange-800', border: 'border-orange-500' },
  'standby': { bg: 'bg-gray-100', text: 'text-gray-800', border: 'border-gray-500' },
  'maintenance': { bg: 'bg-gray-100', text: 'text-gray-800', border: 'border-gray-500' },
};

const getStatusChip = (status) => {
  const style = statusStyles[status] || statusStyles['standby'];
  return (
    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${style.bg} ${style.text}`}>
      {getStatusText(status)}
    </span>
  );
};

export default function AmbulanceStatusList({ ambulances, onSelectAmbulance, selectedAmbulanceId }) {
  return (
    <div className="h-full bg-white">
      <div className="p-4 border-b">
        <h2 className="text-xl font-bold text-gray-800">배차된 구급차 ({ambulances.length})</h2>
      </div>
      <ul className="divide-y divide-gray-200">
        {ambulances.length === 0 && (
          <li className="p-4 text-center text-gray-500">
            현재 배차된 구급차가 없습니다.
          </li>
        )}
        {ambulances.map(ambulance => (
          <li
            key={ambulance.id}
            onClick={() => onSelectAmbulance(ambulance)}
            className={`p-4 cursor-pointer hover:bg-gray-100 transition-colors duration-200 ${selectedAmbulanceId === ambulance.id ? 'bg-blue-50 border-l-4 ' + statusStyles[ambulance.status].border : ''}`}
          >
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-lg font-semibold text-gray-900">{ambulance.number}</h3>
              {getStatusChip(ambulance.status)}
            </div>
            <div className="text-sm text-gray-600 space-y-1">
              <p><strong>환자:</strong> {ambulance.patientInfo?.name ?? 'N/A'} ({ambulance.patientInfo?.basicInfo ?? 'N/A'})</p>
              <p><strong>주요증상:</strong> {ambulance.condition}</p>
              <p><strong>신고시각:</strong> {ambulance.callTime}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}