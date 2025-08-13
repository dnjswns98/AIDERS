import React, { forwardRef } from 'react';
import AmbulanceHeader from '../AmbulanceHeader';
import GlobalCallManager from '../GlobalCallManager'; // GlobalCallManager import 추가

const AmbulanceLayout = forwardRef(({ children }, ref) => {
  return (
    <div className="bg-gray-100 h-screen flex flex-col">
      <AmbulanceHeader />
      <main ref={ref} className="flex-grow overflow-y-auto w-full relative">
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          {children}
        </div>
        {/* 🔥 신규 추가: 어떤 페이지든 화상 통화 관리자가 항상 떠 있도록 설정 */}
        <GlobalCallManager />
      </main>
    </div>
  );
});

export default AmbulanceLayout;