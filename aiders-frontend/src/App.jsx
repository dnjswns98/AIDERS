import "./App.css";
import { Routes, Route } from "react-router-dom";
import LoginForm from "./components/login/LoginForm";
import AdminPage from "./pages/AdminPage";
import DashboardPage from "./pages/hospital/DashboardPage";
import EmergencyPatientPage from "./pages/hospital/EmergencyPatientPage";
import BedManagementPage from "./pages/hospital/BedManagementPage";
import NotificationPage from "./pages/hospital/NotificationPage";

import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { useAppContext } from './hooks/useAppContext';
import FireStationHeader from './components/FireStation/FireStationHeader';
import Toast from './components/Toast';
import AppRouter from './router/AppRouter';

const AppContent = () => {
    const { showToast } = useAppContext();

    return (
        <div className="min-h-screen bg-gray-50 relative" style={{ fontFamily: 'NanumGothic, sans-serif' }}>
            {showToast && <Toast message="구급차 정보가 업데이트되었습니다" />}
            <FireStationHeader />
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <AppRouter />
            </main>
        </div>
    );
};

const App = () => {
    return (
        <AppProvider>
            <Router>
                <AppContent />
            </Router>
        </AppProvider>
    );
};

export default App;
