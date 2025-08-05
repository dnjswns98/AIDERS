import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import AmbulanceLayout from "../../components/Emergency/Layout/AmbulanceLayout";
import MapDisplay from "../../components/Emergency/MapDisplay";
import WebRtcCall from "../../components/webRTC/WebRtcCall";
import useEmergencyStore from "../../store/useEmergencyStore";
import HospitalCard from "../../components/Emergency/HospitalCard";
import { useAuthStore } from "../../store/useAuthStore";

export default function AmbulanceDashboardPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state || {};

  const { selectedAmbulance, fetchAmbulances } = useEmergencyStore();
  const [isCalling, setIsCalling] = useState(false);

  const { user } = useAuthStore();
  if (!user?.userKey) {
    return <div>로그인된 구급차 정보가 없습니다.</div>;
  }

  const currentRealUserKey = user.userKey;
  if (!user?.userId) {
    return <div>구급차 ID를 불러오지 못했다. 노오력이 부족하다.</div>;
  }

  const currentRealAmbulancId = user.userId;

  useEffect(() => {
    console.log("sessionID :", currentRealUserKey);
    console.log("ambulanceID :", currentRealAmbulancId);
  }, [currentRealUserKey, currentRealAmbulancId]);

  useEffect(() => {
    fetchAmbulances();
  }, [fetchAmbulances]);

  // 환자 정보는 navigation state(formData) → Zustand → 빈 객체 우선순위로 가져옴
  const patientFromState = state.formData;
  const patient = patientFromState || selectedAmbulance?.patientInfo || {};
  const details = patientFromState
    ? {
        ktasLevel: patientFromState.ktasLevel || "-",
        chiefComplaint: patientFromState.chiefComplaint || "-",
        treatmentDetails: patientFromState.treatmentDetails || "-",
        familyHistory: patientFromState.familyHistory || {},
        pastHistory: patientFromState.pastHistory || {},
        vitalSigns: patientFromState.vitalSigns || {},
        medications: patientFromState.medications || [],
        department: patientFromState.department || "-",
        ageRange: patientFromState.ageRange || "-",
      }
    : selectedAmbulance?.patientDetails || {};

  const hospitals = []; // 실제 병원 데이터 사용 시 API 등으로 대체

  const handleModify = () => {
    if (!selectedAmbulance) return;
    const formData = {
      ...selectedAmbulance.patientInfo,
      ...selectedAmbulance.patientDetails,
      medications:
        selectedAmbulance.patientDetails?.medications
          ?.map((m) => m.name)
          .join(", ") || "",
      familyHistory:
        selectedAmbulance.patientDetails?.familyHistory?.father || "",
      pastHistory:
        selectedAmbulance.patientDetails?.pastHistory?.hypertension || "",
    };
    navigate("/emergency/patient-input", {
      state: { isEditMode: true, formData },
    });
  };

  const handleCallStart = () => setIsCalling(true);
  const handleCallEnd = () => setIsCalling(false);

  if (!selectedAmbulance && !patientFromState) {
    return (
      <AmbulanceLayout>
        <div className="bg-white p-8 rounded-lg shadow-md text-center">
          <h1 className="text-2xl font-bold mb-4">
            선택된 구급차 정보가 없습니다.
          </h1>
          <p>소방서 대시보드에서 구급차를 선택해주세요.</p>
        </div>
      </AmbulanceLayout>
    );
  }

  return (
    <AmbulanceLayout>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="flex flex-col gap-6">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">환자 정보</h2>
              <button
                onClick={handleModify}
                className="bg-blue-500 hover:bg-blue-600 text-white text-sm font-semibold py-2 px-4 rounded-lg transition-colors duration-200"
              >
                수정
              </button>
            </div>
            <div className="grid grid-cols-2 gap-4 text-gray-600">
              <p>
                <strong>이름:</strong> {patient.name || "-"}
              </p>
              <p>
                <strong>성별:</strong> {patient.gender || "-"}
              </p>
              <p>
                <strong>나이:</strong> {patient.age || "-"}
              </p>
              <p>
                <strong>증상:</strong> {details.chiefComplaint || "-"}
              </p>
              <p>
                <strong>중증도:</strong> {details.ktasLevel || "-"}
              </p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md flex-grow flex flex-col">
            <h2 className="text-xl font-bold text-gray-800 mb-4">지도</h2>
            <div className="flex-grow h-96 lg:h-auto">
              {hospitals.length > 0 ? (
                <MapDisplay hospital={hospitals[0]} />
              ) : (
                <p className="text-center text-gray-500">
                  병원 위치 정보가 없습니다.
                </p>
              )}
            </div>
          </div>
        </div>

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
              <p className="text-center text-gray-500">
                매칭된 병원 정보가 없습니다.
              </p>
            )}
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md h-full flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">화상 통화</h2>
              {!isCalling && (
                <button
                  onClick={handleCallStart}
                  className="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200"
                >
                  통화 시작
                </button>
              )}
            </div>
            <div className="flex-grow bg-gray-200 rounded-lg flex items-center justify-center min-h-[300px]">
              {isCalling ? (
                <WebRtcCall
                  sessionId={currentRealAmbulancId}
                  ambulanceId={currentRealAmbulancId}
                  onLeave={handleCallEnd}
                  patientName={patient.name || ""}
                  ktas={details.ktasLevel || ""}
                  // hospitalId={hospitals.length > 0 ? hospitals[0].id : 0}
                  hospitalId='241' 
                />
              ) : (
                <p className="text-center text-gray-500">
                  통화 시작 버튼을 눌러 화상 통화를 시작하세요.
                </p>
              )}
            </div>
          </div>
        </div>

        <button>asdai</button>
      </div>
    </AmbulanceLayout>
  );
}
