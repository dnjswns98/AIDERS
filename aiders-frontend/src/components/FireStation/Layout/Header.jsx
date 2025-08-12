import React, { useEffect } from 'react';
import useFireStationStore from '../../../store/useFireStationStore';
import { Link } from 'react-router-dom';

function Header() {
  const { firestationInfo, fetchFirestationInfo, isLoading, error } = useFireStationStore();

  useEffect(() => {
    if (!firestationInfo) {
      fetchFirestationInfo();
    }
  }, [fetchFirestationInfo, firestationInfo]);

  const displayName = firestationInfo?.name || '소방서';

  return (
    <header className="bg-red-600 text-white p-4 flex justify-between items-center">
      <h1 className="text-xl font-bold">
        {isLoading ? '로딩 중...' : `${displayName} 구급차 관리시스템`}
      </h1>
      <nav>
        <Link to="/firestation/dashboard" className="mr-4 hover:text-gray-200">
          대시보드
        </Link>
        <Link to="/firestation/dispatch" className="mr-4 hover:text-gray-200">
          출동 관리
        </Link>
        <Link to="/firestation/reports" className="hover:text-gray-200">
          보고서 관리
        </Link>
      </nav>
      {error && <div className="text-yellow-300">오류: {error}</div>}
    </header>
  );
}

export default Header;
