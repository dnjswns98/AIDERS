import React, { useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import FireStationDashboard from "../pages/FireStation/FireStationDashboard";
import FireStationReports from "../pages/FireStation/FireStationReports";
import FireStationDispatch from "../pages/FireStation/FireStationDispatch";
import FireStationLayout from "../components/FireStation/Layout/FireStationLayout";
import FireStationSituationBoard from "../pages/FireStation/FireStationSituationBoard";
import FireStationReportList from "../pages/FireStation/FireStationReportList";
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
        <Route path="/" element={<FireStationDashboard />} />
        <Route path="/situation-board" element={<FireStationSituationBoard />} />
        <Route path="/reports" element={<FireStationReports />} />
        <Route path="/dispatch" element={<FireStationDispatch />} />
        <Route path="/reports-list" element={<FireStationReportList />} />
      </Route>
    </Routes>
  );
};

export default FireStationRouters;