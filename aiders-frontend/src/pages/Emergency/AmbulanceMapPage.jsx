import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import MapDisplay from '../../components/Emergency/MapDisplay';
import WebRtcCall from '../../components/webRTC/WebRtcCall';
import AmbulanceLayout from '../../components/Emergency/Layout/AmbulanceLayout';

export default function AmbulanceMapPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { matchedHospital, patientInfo } = location.state || {};
  const [isCalling, setIsCalling] = useState(false);

  const handleModifyPatientInfo = () => {
    navigate('/emergency/patient', { state: { patientInfoForEdit: patientInfo } });
  };

  const handleStartCall = () => {
    setIsCalling(true);
  };

  const handleEndCall = () => {
    setIsCalling(false);
  };

  if (!matchedHospital) {
    return (
      <AmbulanceLayout>
        <div className="bg-white p-8 rounded-lg shadow-md text-center">
          <h1 className="text-2xl font-bold mb-4">매칭된 병원 정보가 없습니다.</h1>
          <p>환자 정보를 먼저 입력해주세요.</p>
        </div>
      </AmbulanceLayout>
    );
  }

  return (
    <AmbulanceLayout>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column */}
        <div className="flex flex-col gap-6">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">환자 정보</h2>
              <button
                onClick={handleModifyPatientInfo}
                className="bg-blue-500 hover:bg-blue-600 text-white text-sm font-semibold py-2 px-4 rounded-lg transition-colors duration-200"
              >
                수정
              </button>
            </div>
            <div className="grid grid-cols-2 gap-4 text-gray-600">
              <p><strong>증상:</strong> {patientInfo.symptoms}</p>
              <p><strong>중증도:</strong> {patientInfo.severity}</p>
              <p><strong>나이:</strong> {patientInfo.age}</p>
              <p><strong>성별:</strong> {patientInfo.gender}</p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md flex-grow flex flex-col">
            <h2 className="text-xl font-bold text-gray-800 mb-4">매칭 병원: {matchedHospital.name}</h2>
            <p className="mb-4 text-gray-600">주소: {matchedHospital.address}</p>
            <div className="flex-grow h-64 lg:h-auto">
              <MapDisplay hospital={matchedHospital} />
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="bg-white p-6 rounded-lg shadow-md h-full flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-800">화상 통화</h2>
            {!isCalling && (
              <button
                onClick={handleStartCall}
                className="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200"
              >
                통화 시작
              </button>
            )}
          </div>
          <div className="flex-grow bg-gray-200 rounded-lg flex items-center justify-center min-h-[400px]">
            {isCalling ? (
              <WebRtcCall sessionName="hospital-call" userName="ambulance-user" onLeave={handleEndCall} />
            ) : (
              <p className="text-center text-gray-500">통화 시작 버튼을 눌러 화상 통화를 시작하세요.</p>
            )}
          </div>
        </div>
      </div>
    </AmbulanceLayout>
  );
}

