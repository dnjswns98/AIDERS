import React, { forwardRef } from 'react';
import AmbulanceHeader from '../AmbulanceHeader';
import useLiveAmbulanceLocationSender from '../../../hooks/useLiveAmbulanceLocationSender'; // 1. 새로 만든 훅 import

const AmbulanceLayout = forwardRef(({ children }, ref) => {
  // 2. 훅을 호출하여 위치 전송을 시작합니다.
  useLiveAmbulanceLocationSender();

  return (
    <div className="bg-gray-100 h-screen flex flex-col">
      <AmbulanceHeader />
      <main ref={ref} className="flex-grow overflow-y-auto w-full relative">
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          {children}
        </div>
      </main>
    </div>
  );
});

export default AmbulanceLayout;