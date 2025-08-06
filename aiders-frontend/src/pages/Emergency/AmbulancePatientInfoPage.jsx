import React from "react";
import { useNavigate } from "react-router-dom";
import AmbulanceLayout from "../../components/Emergency/Layout/AmbulanceLayout";
import useEmergencyStore from "../../store/useEmergencyStore";

// 🔥 데이터 안전 처리 헬퍼 함수들
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
    console.warn('[JSON Parse] 파싱 실패:', data, error);
  }
  return fallback;
};

const safeRenderObject = (data, emptyText = '-') => {
  try {
    console.log('[SafeRender] 입력 데이터:', data, 'type:', typeof data);
    
    // null이나 undefined인 경우
    if (!data) return emptyText;
    
    // 이미 문자열이고 JSON이 아닌 경우 (일반 텍스트)
    if (typeof data === 'string') {
      // JSON 문자열인지 확인 ({}나 []로 시작하는지)
      if (data.startsWith('{') || data.startsWith('[')) {
        try {
          const parsed = JSON.parse(data);
          if (typeof parsed === 'object' && parsed !== null) {
            // 객체나 배열로 파싱된 경우
            if (Array.isArray(parsed)) {
              return parsed.map(item => 
                typeof item === 'object' ? Object.entries(item).map(([k, v]) => `${k}: ${v}`).join(', ') : item
              ).join(' | ');
            } else {
              // 객체인 경우
              return Object.entries(parsed).map(([key, value]) => `${key}: ${value}`).join(', ');
            }
          }
        } catch (e) {
          console.warn('[SafeRender] JSON 파싱 실패, 문자열 그대로 반환:', data);
          return data; // JSON 파싱 실패하면 문자열 그대로 반환
        }
      } else {
        // 일반 텍스트 문자열
        return data;
      }
    }
    
    // 이미 객체인 경우
    if (typeof data === 'object') {
      if (Array.isArray(data)) {
        return data.map(item => 
          typeof item === 'object' ? Object.entries(item).map(([k, v]) => `${k}: ${v}`).join(', ') : item
        ).join(' | ');
      } else {
        return Object.entries(data).map(([key, value]) => `${key}: ${value}`).join(', ');
      }
    }
    
    // 기타 타입 (number, boolean 등)
    return String(data);
    
  } catch (error) {
    console.error('[SafeRender] 렌더링 에러:', error, 'data:', data);
    return emptyText;
  }
};

const safeRenderMedications = (medications, emptyText = '-') => {
  try {
    console.log('[SafeRenderMeds] 입력 데이터:', medications, 'type:', typeof medications);
    
    if (!medications) return emptyText;
    
    // 문자열인 경우
    if (typeof medications === 'string') {
      // JSON 배열 문자열인지 확인
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
          console.warn('[SafeRenderMeds] JSON 파싱 실패, 문자열 그대로 반환:', medications);
        }
      }
      // 일반 문자열
      return medications;
    }
    
    // 이미 배열인 경우
    if (Array.isArray(medications)) {
      return medications.map(med => {
        if (typeof med === 'object' && med.name) {
          return med.name;
        }
        return med;
      }).join(', ');
    }
    
    // 객체인 경우 (단일 약물)
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

  // 🔥 디버깅용 로그 추가
  console.log('=== AmbulancePatientInfoPage 디버깅 ===');
  console.log('selectedAmbulance:', selectedAmbulance);
  console.log('patientInfo:', patientInfo);
  console.log('patientDetails:', patientDetails);
  console.log('pastHistory type:', typeof patientDetails?.pastHistory);
  console.log('pastHistory value:', patientDetails?.pastHistory);
  console.log('familyHistory type:', typeof patientDetails?.familyHistory);
  console.log('familyHistory value:', patientDetails?.familyHistory);
  console.log('medications type:', typeof patientDetails?.medications);
  console.log('medications value:', patientDetails?.medications);

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
              <p className="mt-1 text-lg text-gray-900 p-3 bg-gray-50 rounded-md">{patientDetails?.ktasLevel || '-'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500">진료 과목</label>
              <p className="mt-1 text-lg text-gray-900 p-3 bg-gray-50 rounded-md">{patientDetails?.department || '-'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500">성별</label>
              <p className="mt-1 text-lg text-gray-900 p-3 bg-gray-50 rounded-md">{patientInfo?.gender || '-'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500">연령대</label>
              <p className="mt-1 text-lg text-gray-900 p-3 bg-gray-50 rounded-md">{patientDetails?.ageRange || '-'}</p>
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
                  <p className="mt-1 text-lg text-gray-900 p-3 bg-gray-50 rounded-md">{patientDetails?.vitalSigns?.bloodPressure || '-'}</p>
                )}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500">주요 증상 (상세)</label>
              {patientDetails?.chiefComplaint && patientDetails.chiefComplaint.startsWith('data:image') ? (
                <img src={patientDetails.chiefComplaint} alt="주요 증상 필기" className="mt-1 w-full border rounded-md" />
              ) : (
                <p className="mt-1 text-lg text-gray-900 p-3 bg-gray-50 rounded-md">{patientDetails?.chiefComplaint || '-'}</p>
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
                    {/* 🔥 핵심 수정: 안전한 렌더링 함수 사용 */}
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
                    {/* 🔥 핵심 수정: 안전한 렌더링 함수 사용 */}
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
                  {/* 🔥 핵심 수정: 약물 전용 안전 렌더링 함수 사용 */}
                  {safeRenderMedications(patientDetails?.medications)}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* 🔥 디버깅 정보 (개발 환경에서만 표시) */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <h3 className="text-sm font-semibold text-yellow-800 mb-2">🔍 디버깅 정보</h3>
            <div className="text-xs text-yellow-700 space-y-1">
              <p><strong>과거력 타입:</strong> {typeof patientDetails?.pastHistory}</p>
              <p><strong>과거력 값:</strong> {JSON.stringify(patientDetails?.pastHistory)?.substring(0, 100)}...</p>
              <p><strong>가족력 타입:</strong> {typeof patientDetails?.familyHistory}</p>
              <p><strong>가족력 값:</strong> {JSON.stringify(patientDetails?.familyHistory)?.substring(0, 100)}...</p>
              <p><strong>약물 타입:</strong> {typeof patientDetails?.medications}</p>
              <p><strong>약물 값:</strong> {JSON.stringify(patientDetails?.medications)?.substring(0, 100)}...</p>
            </div>
            <div className="mt-3 space-y-1 text-xs">
              <p><strong>안전 렌더링 결과:</strong></p>
              <p><strong>과거력:</strong> {safeRenderObject(patientDetails?.pastHistory)}</p>
              <p><strong>가족력:</strong> {safeRenderObject(patientDetails?.familyHistory)}</p>
              <p><strong>약물:</strong> {safeRenderMedications(patientDetails?.medications)}</p>
            </div>
          </div>
        )}
      </div>
    </AmbulanceLayout>
  );
}
