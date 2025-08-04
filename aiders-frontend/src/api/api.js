// src/api/api.js

import axios from 'axios';

// 환경변수에 정의된 API 기본 URL 사용 (.env 파일에 VITE_API_BASE_URL=http://localhost:8080 으로 설정)
// API_BASE에는 /api/v1 이 포함되어 있지 않은 상태로 가정합니다.
const API_BASE = import.meta.env.VITE_API_BASE_URL;

/**
 * 구급차 상태 업데이트
 * @param {number} ambulanceId - 현재는 ambulanceId 미사용, 백엔드 API에 따라 수정 필요
 * @param {string} status - 'wait' 또는 'transfer'
 * @returns {Promise<any>}
 */
export const updateAmbulanceStatus = async (ambulanceId, status) => {
  try {
    let endpoint = '';
    if (status === 'wait') {
      endpoint = '/api/v1/ambulance/transfer/wait';
    } else if (status === 'transfer') {
      endpoint = '/api/v1/ambulance/transfer';
    } else {
      throw new Error('Invalid ambulance status');
    }
    const response = await axios.post(`${API_BASE}${endpoint}`);
    return response.data;
  } catch (error) {
    console.error(`[API] updateAmbulanceStatus(${status}) 에러:`, error);
    throw error;
  }
};

/**
 * 환자 필수 정보 저장 (PUT)
 * @param {Object} patientInfo - 환자 필수 정보
 * @returns {Promise<any>}
 */
export const saveRequiredPatientInfo = async (patientInfo) => {
  try {
    const response = await axios.put(
      `${API_BASE}/api/v1/patient/required`,
      patientInfo
    );
    return response.data;
  } catch (error) {
    console.error('[API] saveRequiredPatientInfo 에러:', error);
    throw error;
  }
};

/**
 * 환자 선택 정보 저장 (PATCH)
 * @param {Object} patientDetails - 환자 선택 정보
 * @returns {Promise<any>}
 */
export const saveOptionalPatientInfo = async (patientDetails) => {
  try {
    const response = await axios.patch(
      `${API_BASE}/api/v1/patient/optional`,
      patientDetails
    );
    return response.data;
  } catch (error) {
    console.error('[API] saveOptionalPatientInfo 에러:', error);
    throw error;
  }
};

/**
 * 환자 정보 조회 (GET)
 * 주의: 현재 백엔드에서 500 오류가 발생하면 호출하지 마십시오.
 * 필요시 백엔드 구현 후 사용 권장.
 * @returns {Promise<any>}
 */
export const getPatientInfo = async () => {
  try {
    const response = await axios.get(`${API_BASE}/api/v1/patient/`);
    return response.data;
  } catch (error) {
    console.error('[API] getPatientInfo 에러:', error);
    throw error;
  }
};

/**
 * 이송 생성 (POST)
 * @param {Object} dispatchRequest
 * @returns {Promise<any>}
 */
export const createDispatch = async (dispatchRequest) => {
  try {
    const response = await axios.post(
      `${API_BASE}/api/v1/dispatch/`,
      dispatchRequest
    );
    return response.data;
  } catch (error) {
    console.error('[API] createDispatch 에러:', error);
    throw error;
  }
};

/**
 * 이송 이력 조회 (GET)
 * @returns {Promise<any>}
 */
export const getDispatchHistory = async () => {
  try {
    const response = await axios.get(`${API_BASE}/api/v1/dispatch/history`);
    return response.data;
  } catch (error) {
    console.error('[API] getDispatchHistory 에러:', error);
    throw error;
  }
};

/**
 * 병원 진료과 정보 수정 (PATCH)
 * @param {Object} departmentUpdate
 * @returns {Promise<any>}
 */
export const updateHospitalDepartment = async (departmentUpdate) => {
  try {
    const response = await axios.patch(
      `${API_BASE}/api/v1/hospital/department`,
      departmentUpdate
    );
    return response.data;
  } catch (error) {
    console.error('[API] updateHospitalDepartment 에러:', error);
    throw error;
  }
};

/**
 * 구급차용 화상 세션 생성 및 토큰 발급
 * @param {Object} request - sessionId, ambulanceId, hospitalId, ktas, patientName 포함
 * @returns {Promise<{ token: string, sessionId: string }>}
 */
export const createAmbulanceToken = async (request) => {
  try {
    const body = {
      sessionId: request.sessionId || '',
      ambulanceId: Number(request.ambulanceId) || 0,
      hospitalId: Number(request.hospitalId) || 0,
      ktas: Number(request.ktas) || 0,
      patientName: request.patientName || '',
    };
    console.log('[API] createAmbulanceToken 요청 바디:', body);
    const response = await axios.post(
      `${API_BASE}/api/v1/video-call/ambulance/token`,
      body,
      { headers: { 'Content-Type': 'application/json' } }
    );
    return response.data;
  } catch (error) {
    console.error('[API] createAmbulanceToken 에러:', error.response?.data || error);
    throw error;
  }
};

/**
 * 병원용 화상 토큰 발급 (GET)
 * @param {string} sessionId
 * @returns {Promise<{ token: string, sessionId: string }>}
 */
export const getHospitalToken = async (sessionId) => {
  try {
    const response = await axios.get(
      `${API_BASE}/api/v1/video-call/hospital/token`,
      { params: { sessionId } }
    );
    return response.data;
  } catch (error) {
    console.error('[API] getHospitalToken 에러:', error);
    throw error;
  }
};

/**
 * 화상 통화 시작 (PUT)
 * @param {Object} request - sessionId, optional hospitalId 포함
 * @returns {Promise<any>}
 */
export const startVideoCall = async (request) => {
  try {
    const response = await axios.put(
      `${API_BASE}/api/v1/video-call/start-call`,
      request
    );
    return response.data;
  } catch (error) {
    console.error('[API] startVideoCall 에러:', error);
    throw error;
  }
};

/**
 * 화상 통화 종료 (PUT)
 * @param {Object} request - sessionId 포함
 * @returns {Promise<any>}
 */
export const endVideoCall = async (request) => {
  try {
    const response = await axios.put(
      `${API_BASE}/api/v1/video-call/end-call`,
      request
    );
    return response.data;
  } catch (error) {
    console.error('[API] endVideoCall 에러:', error);
    throw error;
  }
};

/**
 * 이송 완료 처리 (DELETE)
 * @param {string} sessionId
 * @param {number} hospitalId
 * @returns {Promise<any>}
 */
export const completeTransport = async (sessionId, hospitalId) => {
  try {
    const response = await axios.delete(
      `${API_BASE}/api/v1/video-call/session/${sessionId}/complete`,
      { params: { hospitalId } }
    );
    return response.data;
  } catch (error) {
    console.error('[API] completeTransport 에러:', error);
    throw error;
  }
};
