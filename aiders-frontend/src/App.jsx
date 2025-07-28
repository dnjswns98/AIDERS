import "./App.css";
import { Routes, Route } from "react-router-dom";
import LoginForm from "./components/login/LoginForm";
import AdminPage from "./pages/AdminPage";
import HospitalPage from "./pages/hospital/HospitalPage";

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
      <Route path="/hospital" element={<HospitalPage />} />
    </Routes>
  );
}

export default App;
