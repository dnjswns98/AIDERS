
import { useEffect } from 'react';
import AdminPage from "../pages/AdminPage";
import DashboardPage from "../pages/hospital/DashboardPage";
import EmergencyPatientPage from "../pages/hospital/EmergencyPatientPage";
import BedManagementPage from "../pages/hospital/BedManagementPage";
import NotificationPage from "../pages/hospital/NotificationPage";
import TestPage from "../pages/hospital/TestPage";
import DepartmentsPage from "../pages/hospital/DepartmentsPage";
import { Route, Routes } from "react-router-dom";
import TestHospitalCallPage from "../pages/hospital/TestHospitalCallPage";
import { useHospitalStore } from '../store/useHospitalStore';
import { HospitalAlarmProvider } from '../context/HospitalAlarmContext';
import AlarmToast from '../components/hospital/AlarmToast';

function HospitalRouters() {
  const { fetchHospitalInfo } = useHospitalStore();

  useEffect(() => {
    fetchHospitalInfo();
  }, [fetchHospitalInfo]);

  return (
    <HospitalAlarmProvider>
      <Routes>
        <Route path="/" element={<EmergencyPatientPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/emergency" element={<EmergencyPatientPage />} />
        <Route path="/beds" element={<BedManagementPage />} />
        <Route path="/departments" element={<DepartmentsPage />} />
        <Route path="/webrtc-test" element={<TestPage />} />
        <Route path="/notifications" element={<NotificationPage />} />
        <Route path="/main" element={<DashboardPage />} />
        <Route path="/test/hospital-call" element={<TestHospitalCallPage />} />
      </Routes>
      
      {/* 전역 알림 토스트 */}
      <AlarmToast />
    </HospitalAlarmProvider>
  );
}

export default HospitalRouters;
