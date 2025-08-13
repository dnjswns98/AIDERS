import React from 'react';
import { Link } from 'react-router-dom';
import useFireStationStore from '../../store/useFireStationStore'; // EmergencyStore 대신 FireStationStore를 사용합니다.
import { useAppContext } from '../../hooks/useAppContext';

const StatCard = ({ title, value, icon, linkTo, linkText }) => (
  <div className="bg-white p-6 rounded-lg shadow-md flex flex-col">
    <div className="flex items-center">
      <div className="p-3 bg-blue-100 rounded-full">
        <i className={`fas ${icon} text-blue-600 text-2xl`}></i>
      </div>
      <div className="ml-4">
        <p className="text-gray-500 text-sm">{title}</p>
        <p className="text-3xl font-bold text-gray-800">{value}</p>
      </div>
    </div>
    <div className="mt-4 pt-4 border-t border-gray-200 flex-grow flex items-end">
      <Link to={linkTo} className="text-blue-600 hover:text-blue-800 font-semibold w-full text-center">
        {linkText} &rarr;
      </Link>
    </div>
  </div>
);

export default function FireStationDashboard() {
  const { ambulances } = useAppContext();
  // 🔽 useEmergencyStore 대신 useFireStationStore의 todayStats를 사용합니다.
  const { todayStats } = useFireStationStore();

  return (
    <div className="p-8 bg-gray-50 min-h-full">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">종합 현황</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard
          title="실시간 상황판"
          // 🔽 todayStats에서 activeDispatches 값을 사용합니다.
          value={`${todayStats.activeDispatches}대 출동중`}
          icon="fa-map-marked-alt"
          linkTo="/firestation/situation-board"
          linkText="상황판으로 이동"
        />
        <StatCard
          title="신고 관리"
          value="3건 미처리" // Placeholder
          icon="fa-file-medical-alt"
          linkTo="/firestation/reports"
          linkText="신고 목록 보기"
        />
        <StatCard
          title="배차 관리"
          // 🔽 ambulances 배열에서 대기 중인 구급차 수를 직접 계산합니다.
          value={`${ambulances.filter(a => a.status?.toLowerCase() === 'wait' || a.status?.toLowerCase() === 'standby').length}대 출동가능`}
          icon="fa-ambulance"
          linkTo="/firestation/dispatch"
          linkText="배차 관리하기"
        />
      </div>
      {/* 추가적인 요약 정보나 차트를 여기에 추가할 수 있습니다. */}
    </div>
  );
}