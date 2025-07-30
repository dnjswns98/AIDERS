import React from 'react';
import { Routes, Route } from 'react-router-dom';
import AmbulanceDashboardPage from '../pages/Emergency/AmbulanceDashboardPage';
import AmbulancePatientInputPage from '../pages/Emergency/AmbulancePatientInputPage';
import AmbulanceMapPage from '../pages/Emergency/AmbulanceMapPage';
import AmbulancePatientInfoPage from '../pages/Emergency/AmbulancePatientInfoPage';

const AmbulanceRouters = () => {
    return (
        <Routes>
            <Route path="/" element={<AmbulanceDashboardPage />} />
            <Route path="/patient-input" element={<AmbulancePatientInputPage />} />
            <Route path="/patient-info" element={<AmbulancePatientInfoPage />} />
            <Route path="/map" element={<AmbulanceMapPage />} />
        </Routes>
    );
};

export default AmbulanceRouters;
