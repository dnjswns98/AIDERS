import React from "react";
import { Routes, Route } from "react-router-dom";
import FireStationDashboard from "../pages/FireStation/FireStationDashboard";
import FireStationReports from "../pages/FireStation/FireStationReports";
import FireStationDispatch from "../pages/FireStation/FireStationDispatch";
import FireStationLayout from "../components/FireStation/Layout/FireStationLayout";

const FireStationRouters = () => {
  return (
    <Routes>
      <Route element={<FireStationLayout />}>
        {/* FireStation Routes */}
        <Route path="/" element={<FireStationDashboard />} />
        <Route path="/reports" element={<FireStationReports />} />
        <Route path="/dispatch" element={<FireStationDispatch />} />
      </Route>
    </Routes>
  );
};

export default FireStationRouters;
