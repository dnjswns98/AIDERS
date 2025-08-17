// src/components/Emergency/Layout/AmbulanceLayout.jsx

import React, { forwardRef } from 'react';
import AmbulanceHeader from '../AmbulanceHeader';
import useLiveAmbulanceLocationSender from '../../../hooks/useLiveAmbulanceLocationSender';

// showHeader prop을 받아서 헤더를 조건부로 렌더링합니다.
const AmbulanceLayout = forwardRef(({ children, showHeader = true }, ref) => {
  useLiveAmbulanceLocationSender();

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-gray-100">
      {showHeader && <AmbulanceHeader />}
      <main ref={ref} className="flex-1 -full overflow-y-auto w-full relative">
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          {children}
        </div>
      </main>
    </div>
  );
});

export default AmbulanceLayout;