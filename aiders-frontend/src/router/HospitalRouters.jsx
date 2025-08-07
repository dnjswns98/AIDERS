
import { useEffect } from 'react';
import AdminPage from "../pages/AdminPage";
import DashboardPage from "../pages/hospital/DashboardPage";
import EmergencyPatientPage from "../pages/hospital/EmergencyPatientPage";
import BedManagementPage from "../pages/hospital/BedManagementPage";
import NotificationPage from "../pages/hospital/NotificationPage";
import WebRtcTestPage from "../pages/hospital/WebRtcTestPage";
import { Route, Routes } from "react-router-dom";
import TestHospitalCallPage from "../pages/hospital/TestHospitalCallPage";
import { useHospitalStore } from '../store/useHospitalStore';

function HospitalRouters() {
  const { fetchHospitalInfo } = useHospitalStore();

  useEffect(() => {
    fetchHospitalInfo();
  }, [fetchHospitalInfo]);

  return (
    <>
      <Routes>
        <Route path="/" element={<EmergencyPatientPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/emergency" element={<EmergencyPatientPage />} />
        <Route path="/beds" element={<BedManagementPage />} />
        <Route path="/webrtc-test" element={<WebRtcTestPage />} />
        <Route path="/notifications" element={<NotificationPage />} />
        <Route path="/main" element={<DashboardPage />} />
        <Route path="/test/hospital-call" element={<TestHospitalCallPage />} />
      </Routes>
    </>
  );
}

export default HospitalRouters;
