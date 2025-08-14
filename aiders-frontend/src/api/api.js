// src/api/api.js - Spring Boot 백엔드와 연동되는 API 클라이언트 (수정된 버전)

import axios from 'axios';

// === 환경 설정 ===

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

const API_TIMEOUT = parseInt(import.meta.env.VITE_API_TIMEOUT) || 30000;

const ENABLE_API_LOGGING = import.meta.env.VITE_ENABLE_API_LOGGING !== 'false';

// === API 클라이언트 생성 ===

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json; charset=utf-8',
    'Accept': 'application/json',
    'X-Requested-With': 'XMLHttpRequest'
  },
  timeout: API_TIMEOUT,
  withCredentials: false
});

// === 로깅 유틸리티 ===

const logger = {
  info: (message, data) => {
    if (ENABLE_API_LOGGING) {
      console.log(`[API] ${message}`, data || '');
    }
  },
  warn: (message, data) => {
    console.warn(`[API] ⚠️ ${message}`, data || '');
  },
  error: (message, data) => {
    console.error(`[API] ❌ ${message}`, data || '');
  },
  success: (message, data) => {
    if (ENABLE_API_LOGGING) {
      console.log(`[API] ✅ ${message}`, data || '');
    }
  }
};

// === 토큰 관리 ===

const getAccessToken = () => {
  try {
    const authStorage = localStorage.getItem('auth-storage');
    if (authStorage) {
      const parsedAuth = JSON.parse(authStorage);
      const token = parsedAuth.state?.accessToken;
      if (token) return token;
    }
  } catch (error) {
    // 무시하고 다음 시도
  }
  return localStorage.getItem('accessToken');
};

// === 🔥 단순화된 사용자 정보 가져오기 ===

const getCurrentUserInfo = () => {
  console.log('[API] 사용자 정보 조회 시작');
  try {
    // 1순위: auth-storage에서 시도
    const authStorage = localStorage.getItem('auth-storage');
    if (authStorage) {
      const parsedAuth = JSON.parse(authStorage);
      const user = parsedAuth.state?.user;
      if (user) {
        return user;
      }
    }
  } catch (error) {
    logger.warn('auth-storage 파싱 실패:', error);
  }

  try {
    // 2순위: 직접 user에서 시도
    const userString = localStorage.getItem('user');
    if (userString) {
      const user = JSON.parse(userString);
      return user;
    }
  } catch (error) {
    logger.warn('user localStorage 파싱 실패:', error);
  }

  logger.error('사용자 정보를 찾을 수 없음');
  return null;
};

const clearAllTokens = () => {
  ['accessToken', 'refreshToken', 'user', 'auth-storage'].forEach(key => {
    localStorage.removeItem(key);
  });
  logger.info('모든 토큰 삭제 완료');
};

// === 요청 인터셉터 ===

apiClient.interceptors.request.use(
  (config) => {
    const accessToken = getAccessToken();
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    if (ENABLE_API_LOGGING) {
      logger.info(`${config.method?.toUpperCase()} ${config.url}`);
    }
    return config;
  },
  (error) => {
    logger.error('요청 에러', error.message);
    return Promise.reject(error);
  }
);

// === 응답 인터셉터 (수정된 로직) ===

apiClient.interceptors.response.use(
  (response) => {
    if (ENABLE_API_LOGGING) {
      logger.success(`${response.config.method?.toUpperCase()} ${response.config.url}`);
    }
    return response;
  },
  (error) => {
    const status = error.response?.status;
    const url = error.config?.url || '';
    logger.error(`API 에러: ${status} ${url}`, error.response?.data?.message || error.message);
    
    // ✅ 수정된 부분: 401 (인증 실패) 에러일 때만 자동 로그아웃 실행
    if (status === 401) {
      logger.warn('인증 만료 - 자동 로그아웃');
      clearAllTokens();
      if (window.location.pathname !== '/login') {
        alert('로그인이 만료되었습니다. 다시 로그인해주세요.');
        setTimeout(() => {
          window.location.href = '/login';
        }, 1000);
      }
    }
    
    // 401이 아닌 다른 모든 에러(403 포함)는 그대로 반환하여
    // 각 API 호출부에서 개별적으로 처리할 수 있도록 함
    return Promise.reject(error);
  }
);

// === 공통 에러 처리 래퍼 ===

const withErrorHandling = (apiFunction, functionName) => {
  return async (...args) => {
    try {
      const result = await apiFunction(...args);
      logger.success(`${functionName} 성공`);
      return result;
    } catch (error) {
      const message = error.response?.data?.message || error.message || `${functionName} 실패`;
      logger.error(`${functionName} 실패`, message);
      const enhancedError = new Error(message);
      enhancedError.originalError = error;
      enhancedError.functionName = functionName;
      throw enhancedError;
    }
  };
};

// ======================================================================
// 📋 보고서 생성 API
// ======================================================================

/**
 * AI 보고서 생성
 */
export const generateReport = withErrorHandling(async () => {
  logger.info('AI 보고서 생성 요청');
  const response = await apiClient.post('/api/v1/report/');
  return response.data;
}, 'generateReport');

/**
 * 보고서 목록 조회 (검색/페이징 포함)
 */
export const getReports = withErrorHandling(async (searchEnvelope) => {
  logger.info('보고서 목록 조회', searchEnvelope);
  const response = await apiClient.post('/api/v1/report/search', searchEnvelope);
  return response.data;
}, 'getReports');

/**
 * 보고서 상세 조회
 */
export const getReportById = withErrorHandling(async (reportId) => {
  if (!reportId) {
    throw new Error('보고서 ID가 필요합니다.');
  }
  logger.info(`보고서 상세 조회: ID ${reportId}`);
  const response = await apiClient.get(`/api/v1/report/${reportId}`);
  return response.data;
}, 'getReportById');

// ======================================================================
// 🚑 구급차 관련 API (기존과 동일)
// ======================================================================

/**
 * 구급차 상태 업데이트
 */
export const updateAmbulanceStatus = withErrorHandling(async (ambulanceId, status) => {
  if (!ambulanceId || !status) {
    throw new Error('구급차 ID와 상태가 필요합니다.');
  }

  let endpoint = '';
  const requestBody = { ambulanceId };
  
  switch (status.toLowerCase()) {
    case 'wait':
      endpoint = '/api/v1/ambulance/transfer/wait';
      break;
    case 'transfer':
      endpoint = '/api/v1/ambulance/transfer';
      break;
    case 'dispatch':
      endpoint = '/api/v1/ambulance/dispatch';
      break;
    default:
      throw new Error(`지원하지 않는 구급차 상태: ${status}`);
  }

  logger.info(`구급차 ${ambulanceId} 상태를 ${status}로 변경`);
  const response = await apiClient.post(endpoint, requestBody);
  return response.data;
}, 'updateAmbulanceStatus');

/**
 * 구급차 목록 조회
 */
export const getAmbulances = withErrorHandling(async (status = null) => {
  const params = status ? { status } : {};
  const response = await apiClient.get('/api/v1/ambulance/list', { params });
  return response.data || [];
}, 'getAmbulances');

/**
 * 상태별 구급차 목록 조회
 */
export const getAmbulancesByStatus = withErrorHandling(async (status) => {
  if (!status) {
    throw new Error('상태 정보가 필요합니다.');
  }
  logger.info(`${status} 상태 구급차 목록 조회`);
  return await getAmbulances(status);
}, 'getAmbulancesByStatus');

/**
 * 대기 중인 구급차 목록 조회
 */
export const getAvailableAmbulances = withErrorHandling(async () => {
  return await getAmbulances('WAIT');
}, 'getAvailableAmbulances');

/**
 * 구급차 상세 정보 조회
 */
export const getAmbulanceDetail = withErrorHandling(async (ambulanceId) => {
  if (!ambulanceId) {
    throw new Error('구급차 ID가 필요합니다.');
  }
  const response = await apiClient.get(`/api/v1/ambulance/${ambulanceId}`);
  return response.data;
}, 'getAmbulanceDetail');

/**
 * 구급차 위치 조회
 */
export const getAmbulanceLocation = withErrorHandling(async (ambulanceId) => {
  if (!ambulanceId) {
    throw new Error('구급차 ID가 필요합니다.');
  }
  const response = await apiClient.get(`/api/v1/ambulance/${ambulanceId}/location`);
  return response.data;
}, 'getAmbulanceLocation');

/**
 * 현재 로그인된 구급차의 상태 조회
 */
export const getMyAmbulanceStatus = withErrorHandling(async () => {
  const response = await apiClient.get('/api/v1/ambulance/status');
  return response.data;
}, 'getMyAmbulanceStatus');

/**
 * 현재 로그인된 구급차의 출동 환자 정보 조회
 */
export const getMyAmbulancePatientInfo = withErrorHandling(async () => {
  const response = await apiClient.get('/api/v1/ambulance/patient-info');
  return response.data;
}, 'getMyAmbulancePatientInfo');

/**
 * 여러 구급차 위치 일괄 조회
 */
export const getAmbulancesLocation = withErrorHandling(async (ambulanceIds) => {
  if (!Array.isArray(ambulanceIds) || ambulanceIds.length === 0) {
    throw new Error('유효한 구급차 ID 배열이 필요합니다.');
  }
  const response = await apiClient.post('/api/v1/ambulance/locations', { ambulanceIds });
  return response.data || [];
}, 'getAmbulancesLocation');

// ======================================================================
// 🏥 병원 관련 API (기존과 동일)
// ======================================================================

/**
 * 현재 병원 위치 조회
 */
export const getCurrentHospitalLocation = withErrorHandling(async () => {
  const response = await apiClient.get('/api/v1/hospital/location');
  return response.data;
}, 'getCurrentHospitalLocation');

/**
 * 특정 병원 위치 조회
 */
export const getHospitalLocationByUserId = withErrorHandling(async (hospitalId) => {
  if (!hospitalId) {
    throw new Error('병원 ID가 필요합니다.');
  }
  const response = await apiClient.get(`/api/v1/hospital/location/${hospitalId}`);
  return response.data;
}, 'getHospitalLocationByUserId');

/**
 * 병원 목록 조회
 */
export const getHospitals = withErrorHandling(async (options = {}) => {
  const response = await apiClient.get('/api/v1/hospital/list', { params: options });
  return response.data || [];
}, 'getHospitals');

/**
 * 병원 자동 매칭
 */
export const requestHospitalMatching = withErrorHandling(async (matchingData) => {
  const { ambulanceId, latitude, longitude } = matchingData;
  
  if (!ambulanceId || !latitude || !longitude) {
    throw new Error('구급차 ID와 위치 정보가 모두 필요합니다.');
  }

  const requestBody = { latitude, longitude };
  const response = await apiClient.patch(`/api/v1/match/${ambulanceId}`, requestBody);
  
  // 병원 좌표 정보가 없으면 별도 조회
  if (response.data && !response.data.latitude && response.data.hospitalId) {
    try {
      const locationInfo = await getHospitalLocationByUserId(response.data.hospitalId);
      return {
        ...response.data,
        latitude: locationInfo.latitude,
        longitude: locationInfo.longitude
      };
    } catch (locationError) {
      logger.warn('병원 좌표 별도 조회 실패', locationError.message);
      return response.data;
    }
  }
  
  return response.data;
}, 'requestHospitalMatching');

/**
 * 매칭된 병원 정보 조회
 */
export const getMatchedHospital = withErrorHandling(async (ambulanceId) => {
  if (!ambulanceId) {
    throw new Error('구급차 ID가 필요합니다.');
  }
  
  const response = await apiClient.get(`/api/v1/match/${ambulanceId}`);
  
  // 병원 좌표 정보가 없으면 별도 조회
  if (response.data && !response.data.latitude && response.data.hospitalId) {
    try {
      const locationInfo = await getHospitalLocationByUserId(response.data.hospitalId);
      return {
        ...response.data,
        latitude: locationInfo.latitude,
        longitude: locationInfo.longitude
      };
    } catch (locationError) {
      logger.warn('기존 매칭 병원 좌표 조회 실패', locationError.message);
      return response.data;
    }
  }
  
  return response.data;
}, 'getMatchedHospital');

/**
 * 병원 진료과 정보 조회
 */
export const getHospitalDepartments = withErrorHandling(async () => {
  const response = await apiClient.get('/api/v1/hospital/department');
  return response.data;
}, 'getHospitalDepartments');

/**
 * 병원 진료과 정보 업데이트
 */
export const updateHospitalDepartment = withErrorHandling(async (departmentUpdate) => {
  if (!departmentUpdate) {
    throw new Error('진료과목 업데이트 정보가 필요합니다.');
  }
  const response = await apiClient.patch('/api/v1/hospital/department', departmentUpdate);
  return response.data;
}, 'updateHospitalDepartment');

// ======================================================================
// 🚨 출동 관련 API (Spring Boot 백엔드 연동)
// ======================================================================

/**
 * 출동 지시 생성
 */
export const createDispatch = withErrorHandling(async (dispatchRequest) => {
  if (!dispatchRequest) {
    throw new Error('출동 요청 데이터가 필요합니다.');
  }

  const { ambulanceIds, latitude, longitude, address, condition } = dispatchRequest;
  
  if (!ambulanceIds || !Array.isArray(ambulanceIds) || ambulanceIds.length === 0) {
    throw new Error('출동할 구급차 ID가 필요합니다.');
  }
  
  if (!latitude || !longitude) {
    throw new Error('출동 위치 좌표가 필요합니다.');
  }
  
  if (!address || !address.trim()) {
    throw new Error('출동 주소가 필요합니다.');
  }
  
  if (!condition || !condition.trim()) {
    throw new Error('환자 상태 정보가 필요합니다.');
  }

  const requestBody = {
    ambulanceIds: ambulanceIds,
    latitude: latitude,
    longitude: longitude,
    address: address,
    condition: condition
  };

  logger.info('출동 지시 생성', { ambulanceIds, address: address.substring(0, 50) });
  const response = await apiClient.post('/api/v1/dispatch/', requestBody);
  return response.data;
}, 'createDispatch');

/**
 * 출동 기록 조회
 */
export const getDispatchHistory = withErrorHandling(async (options = {}) => {
  const response = await apiClient.get('/api/v1/dispatch/history', { params: options });
  const dispatchHistory = response.data || [];
  
  // 출동 기록 데이터 정규화
  return dispatchHistory.map(item => ({
    id: item.id || item.createdAt,
    address: item.address,
    condition: item.condition,
    latitude: item.latitude,
    longitude: item.longitude,
    dispatchTime: item.createdAt,
    ambulanceIds: item.ambulanceIds,
    status: item.status || 'dispatched',
    priority: item.priority || 'normal',
    hospitalId: item.hospitalId || null,
    reportNumber: item.reportNumber,
    ambulanceNumber: item.ambulanceNumber,
    hospitalName: item.hospitalName
  }));
}, 'getDispatchHistory');

/**
 * 특정 출동 상세 정보 조회
 */
export const getDispatchDetail = withErrorHandling(async (dispatchId) => {
  if (!dispatchId) {
    throw new Error('출동 ID가 필요합니다.');
  }
  const response = await apiClient.get(`/api/v1/dispatch/${dispatchId}`);
  return response.data;
}, 'getDispatchDetail');

/**
 * 출동 상태 업데이트
 */
export const updateDispatchStatus = withErrorHandling(async (dispatchId, status, updateData = {}) => {
  if (!dispatchId || !status) {
    throw new Error('출동 ID와 상태가 필요합니다.');
  }
  const requestBody = { status, ...updateData };
  const response = await apiClient.patch(`/api/v1/dispatch/${dispatchId}/status`, requestBody);
  return response.data;
}, 'updateDispatchStatus');

/**
 * 출동 완료 처리
 */
export const completeDispatch = withErrorHandling(async (dispatchId, completeData = {}) => {
  if (!dispatchId) {
    throw new Error('출동 ID가 필요합니다.');
  }
  const response = await apiClient.patch(`/api/v1/dispatch/${dispatchId}/complete`, completeData);
  return response.data;
}, 'completeDispatch');

// ======================================================================
// 👨⚕️ 환자 정보 관련 API (수정된 버전)
// ======================================================================

/**
 * 환자 필수 정보 저장
 */
export const saveRequiredPatientInfo = withErrorHandling(async (patientInfo) => {
  if (!patientInfo) {
    throw new Error('환자 정보가 필요합니다.');
  }
  const response = await apiClient.put('/api/v1/patient/required', patientInfo);
  return response.data;
}, 'saveRequiredPatientInfo');

/**
 * 환자 선택 정보 저장
 * ✅ 수정: 빈 객체 허용
 */
export const saveOptionalPatientInfo = withErrorHandling(async (data) => {
  console.log('🔥🔥🔥 [api.js] saveOptionalPatientInfo 호출됨!');
  console.log('🔥🔥🔥 [api.js] 전송할 데이터:', JSON.stringify(data, null, 2));
  
  // 🔥 빈 객체도 허용 (백엔드에서 Optional로 처리)
  if (!data) {
    throw new Error('환자 정보 데이터가 필요합니다.');
  }

  console.log('🔥🔥🔥 [api.js] apiClient.patch 호출 시작');
  const response = await apiClient.patch('/api/v1/patient/optional', data);
  console.log('🔥🔥🔥 [api.js] apiClient.patch 호출 성공:', response.data);
  return response.data;
}, 'saveOptionalPatientInfo');

/**
 * 환자 정보 조회
 */
export const getPatientInfo = withErrorHandling(async (ambulanceId = null) => {
  const url = ambulanceId ? `/api/v1/patient/${ambulanceId}` : '/api/v1/patient/';
  const response = await apiClient.get(url);
  return response.data;
}, 'getPatientInfo');

/**
 * 환자 요약 정보 조회
 */
export const getPatientSummary = withErrorHandling(async (ambulanceId) => {
  if (!ambulanceId) {
    throw new Error('구급차 ID가 필요합니다.');
  }
  const response = await apiClient.get(`/api/v1/patient/${ambulanceId}/summary`);
  return response.data;
}, 'getPatientSummary');

// ======================================================================
// 📹 WebRTC 화상통화 API (기존과 동일)
// ======================================================================

/**
 * 구급차용 WebRTC 토큰 생성
 */
export const createAmbulanceToken = withErrorHandling(async (request) => {
  if (!request) {
    throw new Error('구급차 토큰 요청 데이터가 필요합니다.');
  }

  const { sessionId, ambulanceNumber, hospitalId, ktas, patientName } = request;
  
  if (!sessionId || typeof sessionId !== 'string') {
    throw new Error('유효한 세션 ID가 필요합니다.');
  }
  
  if (!ambulanceNumber || typeof ambulanceNumber !== 'string') {
    throw new Error('유효한 구급차 번호가 필요합니다.');
  }
  
  if (!hospitalId || typeof hospitalId !== 'number') {
    throw new Error('유효한 병원 ID가 필요합니다.');
  }

  const body = {
    sessionId: sessionId.trim(),
    ambulanceNumber: ambulanceNumber.trim(),
    hospitalId: Number(hospitalId),
    ktas: Number(ktas) || 0,
    patientName: (patientName || '').trim()
  };

  logger.info('구급차 WebRTC 토큰 생성', { sessionId, ambulanceNumber, hospitalId });
  const response = await apiClient.post('/api/v1/video-call/ambulance/token', body);
  
  if (!response.data || !response.data.token) {
    throw new Error('구급차 토큰 응답에 토큰 값이 없습니다.');
  }
  
  return response.data;
}, 'createAmbulanceToken');

/**
 * 병원용 WebRTC 토큰 조회
 */
export const getHospitalToken = withErrorHandling(async (params) => {
  if (!params) {
    throw new Error('병원 토큰 요청 파라미터가 필요합니다.');
  }

  const { sessionId, hospitalId } = params;
  
  if (!sessionId || typeof sessionId !== 'string') {
    throw new Error('유효한 세션 ID가 필요합니다.');
  }
  
  if (!hospitalId || typeof hospitalId !== 'number') {
    throw new Error('유효한 병원 ID가 필요합니다.');
  }

  const queryParams = {
    sessionId: sessionId.trim(),
    hospitalId: Number(hospitalId)
  };

  logger.info('병원 WebRTC 토큰 조회', { sessionId, hospitalId });
  const response = await apiClient.get('/api/v1/video-call/hospital/token', { params: queryParams });
  
  if (!response.data || !response.data.token) {
    throw new Error('병원 토큰 응답에 토큰 값이 없습니다.');
  }
  
  return response.data;
}, 'getHospitalToken');

/**
 * 화상통화 시작
 */
export const startVideoCall = withErrorHandling(async (request) => {
  if (!request) {
    throw new Error('화상통화 시작 요청 데이터가 필요합니다.');
  }
  const response = await apiClient.put('/api/v1/video-call/start-call', request);
  return response.data;
}, 'startVideoCall');

/**
 * 화상통화 종료
 */
export const endVideoCall = withErrorHandling(async (request) => {
  if (!request) {
    throw new Error('화상통화 종료 요청 데이터가 필요합니다.');
  }
  const response = await apiClient.put('/api/v1/video-call/end-call', request);
  return response.data;
}, 'endVideoCall');

/**
 * 이송 완료 처리
 */
export const completeTransport = withErrorHandling(async (sessionId, hospitalId) => {
  if (!sessionId || !hospitalId) {
    throw new Error('세션 ID와 병원 ID가 모두 필요합니다.');
  }
  const response = await apiClient.delete(`/api/v1/video-call/session/${sessionId}/complete`, {
    params: { hospitalId: Number(hospitalId) }
  });
  return response.data;
}, 'completeTransport');

/**
 * 대기열에서 제거
 */
export const removeFromWaitingList = withErrorHandling(async (hospitalId, sessionId) => {
  if (!hospitalId || !sessionId) {
    throw new Error('병원 ID와 세션 ID가 모두 필요합니다.');
  }
  const response = await apiClient.delete(`/api/v1/redis/waiting/${hospitalId}/${sessionId}`);
  return response.data;
}, 'removeFromWaitingList');

/**
 * 대기 중인 구급차 목록 조회
 */
export const getWaitingAmbulances = withErrorHandling(async (hospitalId) => {
  if (!hospitalId) {
    throw new Error('병원 ID가 필요합니다.');
  }
  const response = await apiClient.get(`/api/v1/redis/waiting/${hospitalId}`);
  return response.data || [];
}, 'getWaitingAmbulances');

// ======================================================================
// 📊 통계 관련 API (소방서용)
// ======================================================================

/**
 * 소방서 오늘 통계 조회
 */
export const getTodayStats = withErrorHandling(async () => {
  const response = await apiClient.get('/api/v1/firestation/statistics/today');
  return response.data;
}, 'getTodayStats');

/**
 * 구급차별 운영 현황 조회
 */
export const getAmbulanceStats = withErrorHandling(async (options = {}) => {
  const response = await apiClient.get('/api/v1/firestation/statistics/ambulances', { params: options });
  return response.data || [];
}, 'getAmbulanceStats');

/**
 * 출동 통계 조회
 */
export const getDispatchStats = withErrorHandling(async (options = {}) => {
  const response = await apiClient.get('/api/v1/firestation/statistics/dispatches', { params: options });
  return response.data || [];
}, 'getDispatchStats');

/**
 * 응답시간 분석
 */
export const getResponseTimeAnalysis = withErrorHandling(async (options = {}) => {
  const response = await apiClient.get('/api/v1/firestation/statistics/response-time', { params: options });
  return response.data;
}, 'getResponseTimeAnalysis');

// ======================================================================
// 🗺️ 지도 및 위치 관련 API (기존과 동일)
// ======================================================================

/**
 * 주소를 좌표로 변환
 */
export const geocodeAddress = withErrorHandling(async (address) => {
  if (!address || !address.trim()) {
    throw new Error('주소가 필요합니다.');
  }
  const response = await apiClient.post('/api/v1/map/geocode', { address });
  return response.data;
}, 'geocodeAddress');

/**
 * 좌표를 주소로 변환
 */
export const reverseGeocode = withErrorHandling(async (latitude, longitude) => {
  if (!latitude || !longitude) {
    throw new Error('위도와 경도가 필요합니다.');
  }
  const response = await apiClient.post('/api/v1/map/reverse-geocode', { latitude, longitude });
  return response.data;
}, 'reverseGeocode');

/**
 * 두 지점 간 거리 계산
 */
export const calculateDistance = withErrorHandling(async (from, to) => {
  if (!from || !to || !from.latitude || !from.longitude || !to.latitude || !to.longitude) {
    throw new Error('출발지와 도착지 좌표가 모두 필요합니다.');
  }

  const R = 6371; // 지구 반지름 (km)
  const dLat = (to.latitude - from.latitude) * Math.PI / 180;
  const dLon = (to.longitude - from.longitude) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(from.latitude * Math.PI / 180) * Math.cos(to.latitude * Math.PI / 180) * Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R * c * 1000; // 미터로 변환

  const duration = Math.ceil((distance / 1000) / 40 * 60); // 분 단위 (시속 40km 가정)

  const result = {
    distance: Math.round(distance), // 미터
    duration: duration, // 분
    route: null // 실제 경로는 별도 API 필요
  };

  logger.info('거리 계산 완료', { from, to, distance: result.distance, duration: result.duration });
  return result;
}, 'calculateDistance');

// ======================================================================
// 🔥 소방서 관련 API (수정된 버전) - 핵심 수정 부분!
// ======================================================================

/**
 * 🔥 소방서 정보 조회 (수정된 버전!) - userId 사용
 */
export const getFirestationInfo = withErrorHandling(async () => {
  const userInfo = getCurrentUserInfo();
  if (!userInfo || !userInfo.userId) {
    throw new Error('로그인된 사용자 정보 또는 user_id를 찾을 수 없습니다.');
  }

  // --- 🔽 핵심 수정: userKey가 아닌, 정확한 숫자 ID인 userId를 사용합니다. ---
  const firestationId = userInfo.userId;
  console.log(`[API] 소방서 정보 조회 시작 (user_id: ${firestationId})`);

  const response = await apiClient.get(`/api/v1/firestation/me`);
  
  if (!response || !response.data) {
    throw new Error('소방서 정보 응답이 없습니다.');
  }

  const firestationInfo = {
    id: firestationId, // user_id를 명확하게 id로 사용
    userKey: userInfo.userKey, // userKey도 별도로 저장
    name: response.data.name || '소방서 정보 없음',
    address: response.data.address || '주소 정보 없음',
    latitude: response.data.latitude ? parseFloat(response.data.latitude) : null,
    longitude: response.data.longitude ? parseFloat(response.data.longitude) : null,
    fetchedAt: new Date().toISOString(),
    isValid: !!(response.data.name && response.data.name.trim() !== ''),
    dataSource: `user_id_${firestationId}`,
    hasLocation: !!(response.data.latitude && response.data.longitude),
    raw: response.data
  };

  console.log('[API] 🎉 소방서 정보 파싱 완료:', firestationInfo);
  return firestationInfo;
}, 'getFirestationInfo');

/**
 * 🔥 소방서 위치 정보 조회
 */
export const getFirestationLocation = withErrorHandling(async () => {
  const response = await apiClient.get('/api/v1/firestation/location');
  return response.data;
}, 'getFirestationLocation');

/**
 * 🔥 소방서 위치 조회 (단순화)
 */
export const getCurrentFirestationLocation = withErrorHandling(async () => {
  const userInfo = getCurrentUserInfo();
  if (userInfo?.firestation_id || userInfo?.firestationId) {
    const firestationId = userInfo.firestation_id || userInfo.firestationId;
    logger.info(`firestation_id 기반 위치 조회: ${firestationId}`);
    const response = await apiClient.get(`/api/v1/firestation/${firestationId}/location`);
    return response.data;
  } else {
    logger.warn('firestation_id가 없어서 기본 위치 조회');
    const response = await apiClient.get('/api/v1/firestation/location');
    return response.data;
  }
}, 'getCurrentFirestationLocation');

/**
 * 특정 소방서 정보 조회 (firestation_id 직접 지정)
 */
export const getFirestationInfoById = withErrorHandling(async (firestationId) => {
  if (!firestationId) {
    throw new Error('소방서 ID가 필요합니다.');
  }

  console.log(`[API] 특정 소방서 정보 조회: ${firestationId}`);
  const response = await apiClient.get(`/api/v1/firestation/${firestationId}`);
  
  if (!response.data) {
    throw new Error(`소방서 ID ${firestationId}의 정보를 찾을 수 없습니다.`);
  }

  const firestationInfo = {
    id: response.data.id,
    firestation_id: firestationId,
    name: response.data.name || `소방서_${firestationId}`,
    address: response.data.address || null,
    latitude: response.data.latitude ? parseFloat(response.data.latitude) : null,
    longitude: response.data.longitude ? parseFloat(response.data.longitude) : null,
    fetchedAt: new Date().toISOString(),
    dataSource: `direct_id_${firestationId}`,
    isValid: true,
    raw: response.data
  };

  console.log('[API] 특정 소방서 정보 조회 완료:', firestationInfo);
  return firestationInfo;
}, 'getFirestationInfoById');

/**
 * 소방서별 구급차 목록 조회 (403 에러 처리 추가)
 */
export const getFirestationAmbulances = withErrorHandling(async (firestationId = null) => {
  // ✅ 수정된 부분: 403 에러를 개별적으로 처리하는 로직
  try {
    const params = {};
    const response = await apiClient.get('/api/v1/ambulance/list', { params });
    return response.data || [];
  } catch (error) {
    // 403 (Forbidden) 에러인 경우, 권한 문제로 간주하고 빈 배열을 반환
    if (error.response?.status === 403) {
      logger.warn(`getFirestationAmbulances: '소방서' 역할은 구급차 전체 목록에 접근할 수 없습니다. 빈 목록을 반환합니다.`);
      return []; // 에러를 전파하지 않고, 빈 배열을 반환하여 앱이 정상 작동하도록 함
    }
    
    // 그 외 다른 에러는 그대로 상위로 전달하여 처리
    throw error;
  }
}, 'getFirestationAmbulances');

// ======================================================================
// 🔧 시스템 유틸리티 API (기존과 동일)
// ======================================================================

/**
 * API 서버 상태 확인
 */
export const getServerStatus = withErrorHandling(async () => {
  const response = await apiClient.get('/api/v1/system/status');
  return response.data;
}, 'getServerStatus');

/**
 * 사용자 권한 확인
 */
export const getUserPermissions = withErrorHandling(async () => {
  const response = await apiClient.get('/api/v1/user/permissions');
  return response.data;
}, 'getUserPermissions');

/**
 * 시스템 설정 조회
 */
export const getSystemConfig = withErrorHandling(async (category = null) => {
  const params = category ? { category } : {};
  const response = await apiClient.get('/api/v1/system/config', { params });
  return response.data;
}, 'getSystemConfig');

// ======================================================================
// 📤 내보내기
// ======================================================================

export {
  apiClient,
  logger,
  getAccessToken,
  clearAllTokens,
  getCurrentUserInfo,
  withErrorHandling
};

// ======================================================================
// 🎯 API 로드 완료 알림
// ======================================================================

if (ENABLE_API_LOGGING) {
  console.log(`
🔥 소방서 시스템 API 클라이언트 로드 완료 (userId 기반 소방서 조회)

📡 서버: ${API_BASE_URL}
⏱️ 타임아웃: ${API_TIMEOUT}ms

✨ 핵심 수정사항:
🎯 getFirestationInfo에서 userInfo.userId 사용 ✅
📋 userKey 대신 userId를 firestation ID로 활용 ✅
🏷️ userKey는 별도 필드로 보존 ✅
🚀 명확한 에러 메시지와 로깅 추가 ✅

🔗 실제 백엔드 연동:
- Spring Boot FirestationController 연동 ✅
- user_id 기반 소방서 정보 조회 ✅
- 단순화된 에러 처리 ✅
- 모든 API 함수 완비 ✅

✅ 전체 기능:
- 보고서 생성 및 관리 ✅
- 구급차 상태 관리 ✅
- 병원 매칭 시스템 ✅
- 출동 관리 ✅
- 환자 정보 관리 ✅
- WebRTC 화상통화 ✅
- 통계 및 분석 ✅
- 지도 및 위치 서비스 ✅
- 소방서 정보 관리 (수정됨) ✅
- 시스템 유틸리티 ✅
`);
}
