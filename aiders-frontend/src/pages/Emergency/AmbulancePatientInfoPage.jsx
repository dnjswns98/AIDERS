import React from "react";
import { useNavigate } from "react-router-dom";
import AmbulanceLayout from "../../components/Emergency/Layout/AmbulanceLayout";
import useEmergencyStore from "../../store/useEmergencyStore";

export default function AmbulancePatientInfoPage() {
  const navigate = useNavigate();
  const { selectedAmbulance } = useEmergencyStore();

  const handleGoToEdit = () => {
    navigate('/emergency/patient-input', { state: { isEditMode: true } });
  };

  if (!selectedAmbulance) {
    return (
      <AmbulanceLayout>
        <div className="bg-white p-8 rounded-lg shadow-md text-center">
          <h1 className="text-2xl font-bold mb-4">선택된 구급차 정보가 없습니다.</h1>
        </div>
      </AmbulanceLayout>
    );
  }

  const { patientInfo, patientDetails } = selectedAmbulance;

  return (
    <AmbulanceLayout>
      <div className="bg-white p-8 rounded-lg shadow-md max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6 border-b pb-4">
          <h1 className="text-2xl font-bold text-gray-800">환자 정보 조회</h1>
          <button
            onClick={handleGoToEdit}
            className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200"
          >
            수정하기
          </button>
        </div>
        
        {/* 필수 정보 */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">필수 정보</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-500">KTAS</label>
              <p className="mt-1 text-lg text-gray-900 p-3 bg-gray-50 rounded-md">{patientDetails.ktasLevel || '-'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500">진료 과목</label>
              <p className="mt-1 text-lg text-gray-900 p-3 bg-gray-50 rounded-md">{patientDetails.department || '-'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500">성별</label>
              <p className="mt-1 text-lg text-gray-900 p-3 bg-gray-50 rounded-md">{patientInfo.gender || '-'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500">연령대</label>
              <p className="mt-1 text-lg text-gray-900 p-3 bg-gray-50 rounded-md">{patientDetails.ageRange || '-'}</p>
            </div>
          </div>
        </div>

        {/* 상세 정보 */}
        <div>
          <h2 className="text-xl font-semibold text-gray-700 mb-4">상세 정보</h2>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-500">이름</label>
                {patientInfo.name && patientInfo.name.startsWith('data:image') ? (
                  <img src={patientInfo.name} alt="이름 필기" className="mt-1 w-full border rounded-md" />
                ) : (
                  <p className="mt-1 text-lg text-gray-900 p-3 bg-gray-50 rounded-md">{patientInfo.name || '-'}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">바이탈 사인 (혈압)</label>
                {patientDetails.vitalSigns?.bloodPressure && patientDetails.vitalSigns.bloodPressure.startsWith('data:image') ? (
                  <img src={patientDetails.vitalSigns.bloodPressure} alt="바이탈 사인 필기" className="mt-1 w-full border rounded-md" />
                ) : (
                  <p className="mt-1 text-lg text-gray-900 p-3 bg-gray-50 rounded-md">{patientDetails.vitalSigns?.bloodPressure || '-'}</p>
                )}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500">주요 증상 (상세)</label>
              {patientDetails.chiefComplaint && patientDetails.chiefComplaint.startsWith('data:image') ? (
                <img src={patientDetails.chiefComplaint} alt="주요 증상 필기" className="mt-1 w-full border rounded-md" />
              ) : (
                <p className="mt-1 text-lg text-gray-900 p-3 bg-gray-50 rounded-md">{patientDetails.chiefComplaint || '-'}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500">처치 내용</label>
              {patientDetails.treatmentDetails && patientDetails.treatmentDetails.startsWith('data:image') ? (
                <img src={patientDetails.treatmentDetails} alt="처치 내용 필기" className="mt-1 w-full border rounded-md" />
              ) : (
                <p className="mt-1 text-lg text-gray-900 p-3 bg-gray-50 rounded-md">{patientDetails.treatmentDetails || '-'}</p>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-500">과거력</label>
                {patientDetails.pastHistory?.hypertension && patientDetails.pastHistory.hypertension.startsWith('data:image') ? (
                  <img src={patientDetails.pastHistory.hypertension} alt="과거력 필기" className="mt-1 w-full border rounded-md" />
                ) : (
                  <p className="mt-1 text-lg text-gray-900 p-3 bg-gray-50 rounded-md">
                    {patientDetails.pastHistory ? Object.entries(patientDetails.pastHistory).map(([key, value]) => `${key}: ${value}`).join(', ') : '-'}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">가족력</label>
                {patientDetails.familyHistory?.father && patientDetails.familyHistory.father.startsWith('data:image') ? (
                  <img src={patientDetails.familyHistory.father} alt="가족력 필기" className="mt-1 w-full border rounded-md" />
                ) : (
                  <p className="mt-1 text-lg text-gray-900 p-3 bg-gray-50 rounded-md">
                    {patientDetails.familyHistory ? Object.entries(patientDetails.familyHistory).map(([key, value]) => `${key}: ${value}`).join(', ') : '-'}
                  </p>
                )}
              </div>
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-500">복용중인 약</label>
                {patientDetails.medications && patientDetails.medications.length > 0 && patientDetails.medications[0].name.startsWith('data:image') ? (
                  <img src={patientDetails.medications[0].name} alt="복용중인 약 필기" className="mt-1 w-full border rounded-md" />
                ) : (
                  <p className="mt-1 text-lg text-gray-900 p-3 bg-gray-50 rounded-md">{patientDetails.medications?.map(m => m.name).join(', ') || '-'}</p>
                )}
              </div>
          </div>
        </div>
      </div>
    </AmbulanceLayout>
  );
}
