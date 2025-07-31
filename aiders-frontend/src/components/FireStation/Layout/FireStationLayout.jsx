import React from 'react';
import { Outlet } from 'react-router-dom';
import FireStationHeader from '../FireStationHeader';

export default function FireStationLayout() {
  return (
    <div className="h-full flex flex-col bg-gray-100">
      <FireStationHeader />
      <main className="flex-grow">
        <Outlet />
      </main>
    </div>
  );
}
