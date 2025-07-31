import React, { forwardRef } from 'react';
import AmbulanceHeader from '../AmbulanceHeader';

const AmbulanceLayout = forwardRef(({ children }, ref) => {
  return (
    <div className="bg-gray-100 h-screen flex flex-col">
      <AmbulanceHeader />
      <main ref={ref} className="flex-grow overflow-y-auto w-full">
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          {children}
        </div>
      </main>
    </div>
  );
});

export default AmbulanceLayout;
