import React from 'react';
import { Routes, Route } from 'react-router-dom';
import HospitalSearchPage from '../pages/Emergency/HospitalSearchPage';
import AmbulancePatientInputPage from '../pages/Emergency/AmbulancePatientInputPage';
import AmbulanceMapPage from '../pages/Emergency/AmbulanceMapPage';

const AmbulanceRouters = () => {
    return (
        <Routes>
            <Route path="/" element={<HospitalSearchPage />} />
            <Route path="/patient-input" element={<AmbulancePatientInputPage />} />
            <Route path="/map" element={<AmbulanceMapPage />} />
        </Routes>
    );
};

export default AmbulanceRouters;
