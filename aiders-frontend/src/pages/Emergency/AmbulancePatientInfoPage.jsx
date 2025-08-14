import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AmbulanceLayout from "../../components/Emergency/Layout/AmbulanceLayout";
import useEmergencyStore from "../../store/useEmergencyStore";
import useWebRtcStore from "../../store/useWebRtcStore";

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
    // Fallback for simple strings that are not JSON
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
          // Not a valid JSON string, return as is
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
        return Object.entries(parsed).map(([key, value]) => `${key}: ${value}`).join(', ');
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
          // Not a valid JSON array string
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
  const { selectedAmbulance, ambulanceDetails, patientInfo, patientDetails, setEditMode } = useEmergencyStore();
  const { setPipMode } = useWebRtcStore();

  useEffect(() => {
    setPipMode(true);
  }, [setPipMode]);

  const dataSource = ambulanceDetails || selectedAmbulance;
  const isHospitalView = !!ambulanceDetails;

  const handleGoToEdit = () => {
    setEditMode(true); // 전역 상태를 '수정 모드'로 변경
    navigate('/emergency/patient-input', { state: { isEditMode: true } }); // 페이지 이동 시 state로도 전달
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

  const displayPatientInfo = isHospitalView ? (dataSource.patientInfo || dataSource) : patientInfo;
  const displayPatientDetails = isHospitalView ? (dataSource.patientDetails || dataSource) : patientDetails;

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
              <p className="mt-1 text-lg text-gray-900 p-3 bg-gray-50 rounded-md">{displayPatientDetails?.ktasLevel || displayPatientDetails?.ktas || '-'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500">진료 과목</label>
              <p className="mt-1 text-lg text-gray-900 p-3 bg-gray-50 rounded-md">{displayPatientDetails?.department || '-'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500">성별</label>
              <p className="mt-1 text-lg text-gray-900 p-3 bg-gray-50 rounded-md">{displayPatientInfo?.gender || displayPatientInfo?.sex || '-'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500">연령대</label>
              <p className="mt-1 text-lg text-gray-900 p-3 bg-gray-50 rounded-md">{displayPatientDetails?.ageRange || '-'}</p>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-700 mb-4">상세 정보</h2>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-500">이름</label>
                {displayPatientInfo?.name && displayPatientInfo.name.startsWith('data:image') ? (
                  <img src={displayPatientInfo.name} alt="이름 필기" className="mt-1 w-full border rounded-md" />
                ) : (
                  <p className="mt-1 text-lg text-gray-900 p-3 bg-gray-50 rounded-md">{displayPatientInfo?.name || '-'}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">바이탈 사인 (혈압)</label>
                {displayPatientDetails?.vitalSigns?.bloodPressure && displayPatientDetails.vitalSigns.bloodPressure.startsWith('data:image') ? (
                  <img src={displayPatientDetails.vitalSigns.bloodPressure} alt="바이탈 사인 필기" className="mt-1 w-full border rounded-md" />
                ) : (
                  <p className="mt-1 text-lg text-gray-900 p-3 bg-gray-50 rounded-md">{displayPatientDetails?.vitalSigns?.bloodPressure || displayPatientDetails?.vitalSigns || '-'}</p>
                )}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500">주요 증상 (상세)</label>
              {displayPatientDetails?.chiefComplaint && displayPatientDetails.chiefComplaint.startsWith('data:image') ? (
                <img src={displayPatientDetails.chiefComplaint} alt="주요 증상 필기" className="mt-1 w-full border rounded-md" />
              ) : (
                <p className="mt-1 text-lg text-gray-900 p-3 bg-gray-50 rounded-md">{displayPatientDetails?.chiefComplaint || displayPatientDetails?.medicalRecord || '-'}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500">처치 내용</label>
              {displayPatientDetails?.treatmentDetails && displayPatientDetails.treatmentDetails.startsWith('data:image') ? (
                <img src={displayPatientDetails.treatmentDetails} alt="처치 내용 필기" className="mt-1 w-full border rounded-md" />
              ) : (
                <p className="mt-1 text-lg text-gray-900 p-3 bg-gray-50 rounded-md">{displayPatientDetails?.treatmentDetails || '-'}</p>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-500">과거력</label>
                {displayPatientDetails?.pastHistory && typeof displayPatientDetails.pastHistory === 'string' && displayPatientDetails.pastHistory.startsWith('data:image') ? (
                  <img src={displayPatientDetails.pastHistory} alt="과거력 필기" className="mt-1 w-full border rounded-md" />
                ) : (
                  <p className="mt-1 text-lg text-gray-900 p-3 bg-gray-50 rounded-md">
                    {safeRenderObject(displayPatientDetails?.pastHistory)}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">가족력</label>
                {displayPatientDetails?.familyHistory && typeof displayPatientDetails.familyHistory === 'string' && displayPatientDetails.familyHistory.startsWith('data:image') ? (
                  <img src={displayPatientDetails.familyHistory} alt="가족력 필기" className="mt-1 w-full border rounded-md" />
                ) : (
                  <p className="mt-1 text-lg text-gray-900 p-3 bg-gray-50 rounded-md">
                    {safeRenderObject(displayPatientDetails?.familyHistory)}
                  </p>
                )}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500">복용중인 약</label>
              {displayPatientDetails?.medications && typeof displayPatientDetails.medications === 'string' && displayPatientDetails.medications.startsWith('data:image') ? (
                <img src={displayPatientDetails.medications} alt="복용중인 약 필기" className="mt-1 w-full border rounded-md" />
              ) : (
                <p className="mt-1 text-lg text-gray-900 p-3 bg-gray-50 rounded-md">
                  {safeRenderMedications(displayPatientDetails?.medications || displayPatientDetails?.medicine)}
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