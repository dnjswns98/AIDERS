import React, { useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import FireStationDispatch from "../pages/FireStation/FireStationDispatch";
import FireStationLayout from "../components/FireStation/Layout/FireStationLayout";
import FireStationSituationBoard from "../pages/FireStation/FireStationSituationBoard";
import FireStationReportList from "../pages/FireStation/FireStationReportList";
import FireStationReportDetail from "../pages/FireStation/FireStationReportDetail"; // 🔥 신규 import
import useFireStationStore from "../store/useFireStationStore";
import { useAuthStore } from "../store/useAuthStore";

const FireStationRouters = () => {
  const { user } = useAuthStore();
  const { 
    initializeData,
    isLoading
  } = useFireStationStore();

  useEffect(() => {
    if (user?.userId) {
        initializeData();
    }
  }, [user, initializeData]);

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <Routes>
      <Route element={<FireStationLayout />}>
        {/* FireStation Routes */}
        <Route index element={<FireStationSituationBoard />}/>
        <Route path="/" element={<FireStationSituationBoard />} />
        <Route path="/dispatch" element={<FireStationDispatch />} />
        <Route path="/reports-list" element={<FireStationReportList />} />
        {/* 🔥 신규 라우트 추가 */}
        <Route path="/reports/:reportId" element={<FireStationReportDetail />} /> 
      </Route>
    </Routes>
  );
};

export default FireStationRouters;