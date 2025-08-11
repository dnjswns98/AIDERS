import React from "react";
import { useNavigate } from "react-router-dom";
import AmbulanceLayout from "../../components/Emergency/Layout/AmbulanceLayout";
import useEmergencyStore from "../../store/useEmergencyStore";

const safeParseJSON = (data, fallback = {}) => {
  try {
    if (typeof data === 'string') {
      const parsed = JSON.parse(data);
      return typeof parsed === 'object' && parsed !== null ? parsed : fallback;
    }
    if (typeof data === 'object' && data !== null) {
      return data;
    }
  } catch (error) {
  }
  return fallback;
};

const safeRenderObject = (data, emptyText = '-') => {
  try {
    if (!data) return emptyText;
    
    if (typeof data === 'string') {
      if (data.startsWith('{') || data.startsWith('[')) {
        try {
          const parsed = JSON.parse(data);
          if (typeof parsed === 'object' && parsed !== null) {
            if (Array.isArray(parsed)) {
              return parsed.map(item => 
                typeof item === 'object' ? Object.entries(item).map(([k, v]) => `${k}: ${v}`).join(', ') : item
              ).join(' | ');
            } else {
              return Object.entries(parsed).map(([key, value]) => `${key}: ${value}`).join(', ');
            }
          }
        } catch (e) {
          return data;
        }
      } else {
        return data;
      }
    }
    
    if (typeof data === 'object') {
      if (Array.isArray(data)) {
        return data.map(item => 
          typeof item === 'object' ? Object.entries(item).map(([k, v]) => `${k}: ${v}`).join(', ') : item
        ).join(' | ');
      } else {
        return Object.entries(data).map(([key, value]) => `${key}: ${value}`).join(', ');
      }
    }
    
    return String(data);
    
  } catch (error) {
    console.error('[SafeRender] 렌더링 에러:', error, 'data:', data);
    return emptyText;
  }
};

const safeRenderMedications = (medications, emptyText = '-') => {
  try {
    if (!medications) return emptyText;
    
    if (typeof medications === 'string') {
      if (medications.startsWith('[')) {
        try {
          const parsed = JSON.parse(medications);
          if (Array.isArray(parsed)) {
            return parsed.map(med => {
              if (typeof med === 'object' && med.name) {
                return med.name;
              }
              return med;
            }).join(', ');
          }
        } catch (e) {
        }
      }
      return medications;
    }
    
    if (Array.isArray(medications)) {
      return medications.map(med => {
        if (typeof med === 'object' && med.name) {
          return med.name;
        }
        return med;
      }).join(', ');
    }
    
    if (typeof medications === 'object' && medications.name) {
      return medications.name;
    }
    
    return String(medications);
    
  } catch (error) {
    console.error('[SafeRenderMeds] 렌더링 에러:', error, 'medications:', medications);
    return emptyText;
  }
};

export default function AmbulancePatientInfoPage() {
  const navigate = useNavigate();
  const { selectedAmbulance, ambulanceDetails } = useEmergencyStore();

  // Determine the source of data to display
  const dataSource = ambulanceDetails || selectedAmbulance;
  const isHospitalView = !!ambulanceDetails; // If ambulanceDetails exists, it's a hospital view

  const handleGoToEdit = () => {
    navigate('/emergency/patient-input', { state: { isEditMode: true } });
  };

  if (!dataSource) {
    return (
      <AmbulanceLayout>
        <div className="bg-white p-8 rounded-lg shadow-md text-center">
          <h1 className="text-2xl font-bold mb-4">환자 정보가 없습니다.</h1>
          <p className="text-gray-600">표시할 구급차 정보가 선택되지 않았거나, 통화가 연결되지 않았습니다.</p>
        </div>
      </AmbulanceLayout>
    );
  }

  // The API for getAmbulancePatientDetail might return a flat object.
  // The existing component expects patientInfo and patientDetails.
  // We will accommodate both structures.
  const patientInfo = dataSource.patientInfo || dataSource;
  const patientDetails = dataSource.patientDetails || dataSource;

  return (
    <AmbulanceLayout>
      <div className="bg-white p-8 rounded-lg shadow-md max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6 border-b pb-4">
          <h1 className="text-2xl font-bold text-gray-800">환자 정보 조회</h1>
          {!isHospitalView && (
            <button
              onClick={handleGoToEdit}
              className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200"
            >
              수정하기
            </button>
          )}
        </div>
        
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">필수 정보</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-500">KTAS</label>
              <p className="mt-1 text-lg text-gray-900 p-3 bg-gray-50 rounded-md">{patientDetails?.ktasLevel || patientDetails?.ktas || '-'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500">진료 과목</label>
              <p className="mt-1 text-lg text-gray-900 p-3 bg-gray-50 rounded-md">{patientDetails?.department || '-'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500">성별</label>
              <p className="mt-1 text-lg text-gray-900 p-3 bg-gray-50 rounded-md">{patientInfo?.gender || patientInfo?.sex || '-'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500">연령대</label>
              <p className="mt-1 text-lg text-gray-900 p-3 bg-gray-50 rounded-md">{patientDetails?.ageRange || '-'}</p>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-700 mb-4">상세 정보</h2>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-500">이름</label>
                {patientInfo?.name && patientInfo.name.startsWith('data:image') ? (
                  <img src={patientInfo.name} alt="이름 필기" className="mt-1 w-full border rounded-md" />
                ) : (
                  <p className="mt-1 text-lg text-gray-900 p-3 bg-gray-50 rounded-md">{patientInfo?.name || '-'}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">바이탈 사인 (혈압)</label>
                {patientDetails?.vitalSigns?.bloodPressure && patientDetails.vitalSigns.bloodPressure.startsWith('data:image') ? (
                  <img src={patientDetails.vitalSigns.bloodPressure} alt="바이탈 사인 필기" className="mt-1 w-full border rounded-md" />
                ) : (
                  <p className="mt-1 text-lg text-gray-900 p-3 bg-gray-50 rounded-md">{patientDetails?.vitalSigns?.bloodPressure || patientDetails?.vitalSigns || '-'}</p>
                )}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500">주요 증상 (상세)</label>
              {patientDetails?.chiefComplaint && patientDetails.chiefComplaint.startsWith('data:image') ? (
                <img src={patientDetails.chiefComplaint} alt="주요 증상 필기" className="mt-1 w-full border rounded-md" />
              ) : (
                <p className="mt-1 text-lg text-gray-900 p-3 bg-gray-50 rounded-md">{patientDetails?.chiefComplaint || patientDetails?.medicalRecord || '-'}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500">처치 내용</label>
              {patientDetails?.treatmentDetails && patientDetails.treatmentDetails.startsWith('data:image') ? (
                <img src={patientDetails.treatmentDetails} alt="처치 내용 필기" className="mt-1 w-full border rounded-md" />
              ) : (
                <p className="mt-1 text-lg text-gray-900 p-3 bg-gray-50 rounded-md">{patientDetails?.treatmentDetails || '-'}</p>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-500">과거력</label>
                {patientDetails?.pastHistory && typeof patientDetails.pastHistory === 'string' && patientDetails.pastHistory.startsWith('data:image') ? (
                  <img src={patientDetails.pastHistory} alt="과거력 필기" className="mt-1 w-full border rounded-md" />
                ) : (
                  <p className="mt-1 text-lg text-gray-900 p-3 bg-gray-50 rounded-md">
                    {safeRenderObject(patientDetails?.pastHistory)}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">가족력</label>
                {patientDetails?.familyHistory && typeof patientDetails.familyHistory === 'string' && patientDetails.familyHistory.startsWith('data:image') ? (
                  <img src={patientDetails.familyHistory} alt="가족력 필기" className="mt-1 w-full border rounded-md" />
                ) : (
                  <p className="mt-1 text-lg text-gray-900 p-3 bg-gray-50 rounded-md">
                    {safeRenderObject(patientDetails?.familyHistory)}
                  </p>
                )}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500">복용중인 약</label>
              {patientDetails?.medications && typeof patientDetails.medications === 'string' && patientDetails.medications.startsWith('data:image') ? (
                <img src={patientDetails.medications} alt="복용중인 약 필기" className="mt-1 w-full border rounded-md" />
              ) : (
                <p className="mt-1 text-lg text-gray-900 p-3 bg-gray-50 rounded-md">
                  {safeRenderMedications(patientDetails?.medications || patientDetails?.medicine)}
                </p>
              )}
            </div>
          </div>
        </div>

        {process.env.NODE_ENV === 'development' && (
          <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <h3 className="text-sm font-semibold text-yellow-800 mb-2">🔍 디버깅 정보</h3>
            <p><strong>Data Source:</strong> {isHospitalView ? 'ambulanceDetails (Hospital View)' : 'selectedAmbulance (Ambulance View)'}</p>
            <div className="text-xs text-yellow-700 space-y-1">
              <p><strong>Raw Data:</strong> {JSON.stringify(dataSource)?.substring(0, 300)}...</p>
            </div>
          </div>
        )}
      </div>
    </AmbulanceLayout>
  );
}