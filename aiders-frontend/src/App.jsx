import "./App.css";
import { Routes, Route } from "react-router-dom";
import LoginForm from "./components/login/LoginForm";
import AdminPage from "./pages/AdminPage";
import DashboardPage from "./pages/hospital/DashboardPage";
import EmergencyPatientPage from "./pages/hospital/EmergencyPatientPage";
import BedManagementPage from "./pages/hospital/BedManagementPage";
import NotificationPage from "./pages/hospital/NotificationPage";

function App() {
  const loading = false;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-pulse">🚑</div>
          <p className="text-gray-600">로딩 중...</p>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/" element={<LoginForm />} />
      <Route path="/admin" element={<AdminPage />} />
      <Route path="/hospital/dashboard" element={<DashboardPage />} />
      <Route path="/hospital/emergency" element={<EmergencyPatientPage />} />
      <Route path="/hospital/beds" element={<BedManagementPage />} />
      <Route path="/hospital/notifications" element={<NotificationPage />} />
      <Route path="/hospital" element={<DashboardPage />} />
    </Routes>
  );
}

export default App;
