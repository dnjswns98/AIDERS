import React from 'react';
import { Link } from 'react-router-dom';
import useEmergencyStore from '../../store/useEmergencyStore';
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
  const { getStatistics } = useEmergencyStore();
  const stats = getStatistics(ambulances);

  



  return (
    <div className="p-8 bg-gray-50 min-h-full">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">종합 현황</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard
          title="실시간 상황판"
          value={`${stats.dispatched}대 출동중`}
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
          value={`${stats.available}대 출동가능`}
          icon="fa-ambulance"
          linkTo="/firestation/dispatch"
          linkText="배차 관리하기"
        />
      </div>
      {/* 추가적인 요약 정보나 차트를 여기에 추가할 수 있습니다. */}
    </div>
  );
}
