// src/components/Emergency/Layout/AmbulanceLayout.jsx

import React, { forwardRef } from 'react';
import AmbulanceHeader from '../AmbulanceHeader';
import useLiveAmbulanceLocationSender from '../../../hooks/useLiveAmbulanceLocationSender';

// showHeader prop을 받아서 헤더를 조건부로 렌더링합니다.
const AmbulanceLayout = forwardRef(({ children, showHeader = true, disableHeaderInteraction = false }, ref) => {
  useLiveAmbulanceLocationSender();

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-gray-100">
      {showHeader && <AmbulanceHeader />}
      <main ref={ref} className="flex-1 -full overflow-y-auto w-full relative">
        <div className="min-h-[100dvh] pb-[calc(env(safe-area-inset-bottom)+96px)]">
          {children}
        </div>
      </main>
    </div>
  );
});

export default AmbulanceLayout;