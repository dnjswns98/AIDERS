import React from 'react';
import { Outlet } from 'react-router-dom';
import FireStationHeader from '../FireStationHeader';

export default function FireStationLayout() {
  return (
    <div className="h-full flex flex-col bg-gray-100">
      <FireStationHeader />
      {/* 🔽 수정된 부분: overflow-y-auto 클래스 추가 */}
      <main className="flex-grow overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}