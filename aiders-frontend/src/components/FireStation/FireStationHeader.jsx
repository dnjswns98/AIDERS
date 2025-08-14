import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAppContext } from '../../hooks/useAppContext';
import useFireStationStore from '../../store/useFireStationStore';

const FireStationHeader = () => {
  // ✅ 알림 관련 훅/상태 제거: notifications, setNotifications 등
  const { currentTime } = useAppContext();
  const { firestationInfo, isLoading } = useFireStationStore();

  const displayName = firestationInfo?.name || '소방서';

  return (
    <header className="bg-orange-600 text-white shadow-lg">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <NavLink to="/firestation" className="flex items-center space-x-4">
            <i className="fas fa-fire text-white-400 text-2xl"></i>
            <h1 className="text-base sm:text-lg md:text-xl font-bold">
              {isLoading ? '로딩 중...' : `${displayName}`}
            </h1>
          </NavLink>

          <nav className="flex items-center space-x-2 sm:space-x-4 md:space-x-8">
            <NavLink
              to="/firestation/dispatch"
              className={({ isActive }) =>
                `px-4 py-2 rounded-md transition-colors duration-200 !rounded-button whitespace-nowrap ${
                  isActive ? 'bg-orange-500' : 'hover:bg-orange-700'
                }`
              }
            >
              <i className="fas fa-ambulance mr-2"></i>
              배차 관리
            </NavLink>
            <NavLink
              to="/firestation/reports-list"
              className={({ isActive }) =>
                `px-4 py-2 rounded-md transition-colors duration-200 !rounded-button whitespace-nowrap ${
                  isActive ? 'bg-orange-500' : 'hover:bg-orange-700'
                }`
              }
            >
              보고서
            </NavLink>
          </nav>

          {/* ✅ 우측: 시간만 표시 (벨/알림 드롭다운 제거) */}
          <div className="text-sm whitespace-nowrap">
            {currentTime.toLocaleString('ko-KR')}
          </div>
        </div>
      </div>
    </header>
  );
};

export default FireStationHeader;
