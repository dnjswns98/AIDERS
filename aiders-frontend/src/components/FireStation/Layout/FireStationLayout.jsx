import React from 'react';
import { Outlet } from 'react-router-dom';
import FireStationHeader from '../FireStationHeader';

export default function FireStationLayout() {
  return (
    <div className="h-screen flex flex-col overflow-hidden bg-gray-100">
      <FireStationHeader className="shrink-0"/>
      <main className="flex-1 min-h-0">
        <Outlet />
      </main>
    </div>
  );
}