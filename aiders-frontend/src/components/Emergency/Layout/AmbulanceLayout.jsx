import React from 'react';
import AmbulanceHeader from '../AmbulanceHeader';

export default function AmbulanceLayout({ children }) {
  return (
    <div className="bg-gray-100 min-h-screen">
      <AmbulanceHeader />
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
}
