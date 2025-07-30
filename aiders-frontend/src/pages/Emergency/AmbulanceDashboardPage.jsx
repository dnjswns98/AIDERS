
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AmbulanceLayout from '../../components/Emergency/Layout/AmbulanceLayout';
import MapDisplay from '../../components/Emergency/MapDisplay';
import WebRtcCall from '../../components/webRTC/WebRtcCall';
import useEmergencyStore from '../../store/useEmergencyStore';
import HospitalCard from '../../components/Emergency/HospitalCard';

export default function AmbulanceDashboardPage() {
  const navigate = useNavigate();
  const { selectedAmbulance } = useEmergencyStore();
  const [isCalling, setIsCalling] = useState(false);

  // 이 페이지에서는 더 이상 병원 목록을 직접 관리하지 않습니다.
  // 필요하다면 useEmergencyStore에서 가져옵니다.
  const hospitals = []; // 예시 데이터, 실제로는 스토어나 API에서 가져와야 합니다.

  const handleModifyPatientInfo = () => {
    const currentAmbulance = useEmergencyStore.getState().selectedAmbulance;
    // 이름 대신, 필수 정보인 KTAS 레벨 존재 여부로 수정 모드를 판단합니다.
    const isEdit = !!currentAmbulance?.patientDetails?.ktasLevel;
    navigate('/emergency/patient-input', { state: { isEditMode: isEdit } });
  };

  const handleStartCall = () => {
    setIsCalling(true);
  };

  const handleEndCall = () => {
    setIsCalling(false);
  };

  if (!selectedAmbulance) {
    return (
      <AmbulanceLayout>
        <div className="bg-white p-8 rounded-lg shadow-md text-center">
          <h1 className="text-2xl font-bold mb-4">선택된 구급차 정보가 없습니다.</h1>
          <p>소방서 대시보드에서 구급차를 선택해주세요.</p>
        </div>
      </AmbulanceLayout>
    );
  }

  const { patientInfo, patientDetails } = selectedAmbulance;

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
              <p><strong>이름:</strong> {patientInfo.name}</p>
              <p><strong>성별:</strong> {patientInfo.gender}</p>
              <p><strong>나이:</strong> {patientInfo.age}</p>
              <p><strong>증상:</strong> {patientDetails.chiefComplaint}</p>
              <p><strong>중증도:</strong> {patientDetails.ktasLevel}</p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md flex-grow flex flex-col">
            <h2 className="text-xl font-bold text-gray-800 mb-4">지도</h2>
            <div className="flex-grow h-96 lg:h-auto">
              {/* 지도 컴포넌트 - 병원 위치 또는 구급차 위치 표시 */}
              {hospitals.length > 0 && <MapDisplay hospital={hospitals[0]} />}
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="flex flex-col gap-6">
          <div className="bg-white p-6 rounded-lg shadow-md flex-grow flex flex-col">
            <h2 className="text-xl font-bold text-gray-800 mb-4">병원 정보</h2>
            {hospitals.length > 0 ? (
              <div className="grid grid-cols-1 gap-4">
                {hospitals.map((hospital) => (
                  <HospitalCard key={hospital.id} hospital={hospital} simple />
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-500">매칭된 병원 정보가 없습니다.</p>
            )}
          </div>

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
            <div className="flex-grow bg-gray-200 rounded-lg flex items-center justify-center min-h-[300px]">
              {isCalling ? (
                <WebRtcCall sessionName="hospital-call" userName="ambulance-user" onLeave={handleEndCall} />
              ) : (
                <p className="text-center text-gray-500">통화 시작 버튼을 눌러 화상 통화를 시작하세요.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </AmbulanceLayout>
  );
}
