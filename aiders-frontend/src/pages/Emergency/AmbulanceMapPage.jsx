import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import MapDisplay from '../../components/Emergency/MapDisplay';
import WebRtcCall from '../../components/webRTC/WebRtcCall';

export default function AmbulanceMapPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { matchedHospital, patientInfo } = location.state || {};
  const [isCalling, setIsCalling] = useState(false);

  const handleModifyPatientInfo = () => {
    navigate('/emergency/patient-input', { state: { patientInfoForEdit: patientInfo } });
  };

  const handleStartCall = () => {
    setIsCalling(true);
  };

  const handleEndCall = () => {
    setIsCalling(false);
  };

  if (!matchedHospital) {
    return (
      <div className="container mx-auto p-4 text-center">
        <h1 className="text-2xl font-bold mb-4">매칭된 병원 정보가 없습니다.</h1>
        <p>환자 정보를 먼저 입력해주세요.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 h-screen flex flex-col lg:flex-row lg:space-x-4">
      <div className="flex flex-col w-full lg:w-1/2">
        <div className="bg-white p-6 rounded-lg shadow-md mb-4">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-xl font-semibold">환자 정보</h2>
            <button
              onClick={handleModifyPatientInfo}
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 text-sm py-1 px-3 rounded"
            >
              수정
            </button>
          </div>
          <p><strong>증상:</strong> {patientInfo.symptoms}</p>
          <p><strong>중증도:</strong> {patientInfo.severity}</p>
          <p><strong>나이:</strong> {patientInfo.age}</p>
          <p><strong>성별:</strong> {patientInfo.gender}</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md flex-grow flex flex-col">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-xl font-semibold">매칭 병원: {matchedHospital.name}</h2>
          </div>
          <p className="mb-4">주소: {matchedHospital.address}</p>
          <div className="flex-grow">
            <MapDisplay hospital={matchedHospital} />
          </div>
        </div>
      </div>

      <div className="w-full lg:w-1/2 mt-4 lg:mt-0">
        <div className="bg-white p-6 rounded-lg shadow-md h-full flex flex-col">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-xl font-semibold">화상 통화</h2>
            {!isCalling && (
              <button
                onClick={handleStartCall}
                className="bg-green-500 hover:bg-green-600 text-white text-sm py-1 px-3 rounded"
              >
                통화 시작
              </button>
            )}
          </div>
          <div className="flex-grow">
            {isCalling ? (
              <WebRtcCall sessionName="hospital-call" userName="ambulance-user" onLeave={handleEndCall} />
            ) : (
              <p className="text-center text-gray-500">통화 시작 버튼을 눌러 화상 통화를 시작하세요.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
