
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import FireStationDashboard from '../pages/FireStation/FireStationDashboard';
import FireStationReports from '../pages/FireStation/FireStationReports';
import FireStationDispatch from '../pages/FireStation/FireStationDispatch';
import HospitalSearchPage from '../pages/Emergency/HospitalSearchPage';

const AppRouter = () => {
    return (
        <Routes>
            {/* FireStation Routes */}
            <Route path="/" element={<FireStationDashboard />} />
            <Route path="/reports" element={<FireStationReports />} />
            <Route path="/dispatch" element={<FireStationDispatch />} />

            {/* Emergency Routes */}
            <Route path="/emergency" element={<HospitalSearchPage />} />
        </Routes>
    );
};

export default AppRouter;
