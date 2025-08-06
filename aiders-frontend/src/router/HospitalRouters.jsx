
import AdminPage from "../pages/AdminPage";
import DashboardPage from "../pages/hospital/DashboardPage";
import EmergencyPatientPage from "../pages/hospital/EmergencyPatientPage";
import BedManagementPage from "../pages/hospital/BedManagementPage";
import NotificationPage from "../pages/hospital/NotificationPage";
import { Route, Routes } from "react-router-dom";
import TestHospitalCallPage from "../pages/hospital/TestHospitalCallPage";

function HospitalRouters() {
  return (
    <>
      <Routes>
        <Route path="/" element={<EmergencyPatientPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/emergency" element={<EmergencyPatientPage />} />
        <Route path="/beds" element={<BedManagementPage />} />
        <Route path="/notifications" element={<NotificationPage />} />
        <Route path="/main" element={<DashboardPage />} />
        <Route path="/test/hospital-call" element={<TestHospitalCallPage />} />
      </Routes>
    </>
  );
}

export default HospitalRouters;
