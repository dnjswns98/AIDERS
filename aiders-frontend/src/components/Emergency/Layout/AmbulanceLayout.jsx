// src/components/Emergency/Layout/AmbulanceLayout.jsx

import React, { forwardRef } from 'react';
import AmbulanceHeader from '../AmbulanceHeader';
import useLiveAmbulanceLocationSender from '../../../hooks/useLiveAmbulanceLocationSender';

// showHeader prop을 받아서 헤더를 조건부로 렌더링합니다.
const AmbulanceLayout = forwardRef(({ children, showHeader = true, disableHeaderInteraction = false }, ref) => {
  useLiveAmbulanceLocationSender();

  return (
    <div className="bg-gray-100 h-screen flex flex-col">
      {showHeader && <AmbulanceHeader disableInteraction={disableHeaderInteraction} />}
      <main ref={ref} className="flex-grow overflow-y-auto w-full relative">
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          {children}
        </div>
      </main>
    </div>
  );
});

export default AmbulanceLayout;