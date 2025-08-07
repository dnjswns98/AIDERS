// src/api/api.js

import axios from 'axios';

// 🔥 환경변수명 변경: API_BASE → API_BASE_URL
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
console.log('[API] API_BASE_URL 설정:', API_BASE_URL);

// 🔥 axios 인스턴스 생성 (JWT 토큰 자동 첨부용)
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json; charset=utf-8', // 한글 인코딩 명시
  },
  timeout: 30000, // 30초 타임아웃
});

// 🔥 핵심 수정: persist 저장소에서 토큰 가져오는 인터셉터
apiClient.interceptors.request.use(
  (config) => {
    console.log(`[API 요청] ${config.method?.toUpperCase()} ${config.url}`);
    
    let accessToken = null;
    
    // 🔥 방법 1: persist 저장소(auth-storage)에서 토큰 가져오기 - 이게 메인임!
    try {
      const authStorage = localStorage.getItem('auth-storage');
      if (authStorage) {
        const parsedAuth = JSON.parse(authStorage);
        accessToken = parsedAuth.state?.accessToken;
        console.log('[API] 🎉 persist 저장소에서 토큰 발견!');
      }
    } catch (error) {
      console.warn('[API] persist 저장소 파싱 실패:', error);
    }
    
    // 🔥 방법 2: fallback으로 직접 저장된 토큰도 시도
    if (!accessToken) {
      accessToken = localStorage.getItem('accessToken');
      if (accessToken) {
        console.log('[API] 직접 저장된 토큰에서 발견');
      }
    }
    
    // 🔥 방법 3: 마지막 수단으로 다른 키들도 확인
    if (!accessToken) {
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        console.log('[API] refreshToken은 있는데 accessToken이 없음 - 토큰 갱신 필요할 수 있음');
      }
    }
    
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
      console.log('[API] 🚀 JWT 토큰 첨부 완료:', accessToken.substring(0, 30) + '...');
    } else {
      console.error('[API] 🚨 JWT 토큰을 찾을 수 없습니다!');
      console.error('[API] persist 저장소 확인:', !!localStorage.getItem('auth-storage'));
      console.error('[API] 직접 accessToken 확인:', !!localStorage.getItem('accessToken'));
      console.warn('[API] ⚠️ 인증이 필요한 API라면 실패할 가능성 높음!');
    }
    
    // 요청 데이터 로깅
    if (config.data) {
      console.log('[API] 요청 데이터:', config.data);
    }
    
    return config;
  },
  (error) => {
    console.error('[API] 요청 인터셉터 에러:', error);
    return Promise.reject(error);
  }
);

// 🔥 응답 인터셉터 - 401/403 에러 시 자동 로그아웃
apiClient.interceptors.response.use(
  (response) => {
    console.log(`[API 응답] ${response.status} ${response.config.url} ✅`);
    return response;
  },
  (error) => {
    const status = error.response?.status;
    const url = error.config?.url;
    
    console.error(`[API 에러] ${status || 'NETWORK'} ${url || 'UNKNOWN'} ❌`);
    console.error('[API] 에러 상세:', {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      headers: error.response?.headers
    });
    
    // 🔥 인증 에러 처리 (401: 인증 없음, 403: 권한 없음)
    if (status === 401 || status === 403) {
      console.warn(`[API] ${status === 401 ? '인증 만료' : '권한 없음'} - 자동 로그아웃 처리`);
      
      // 🔥 모든 토큰 관련 데이터 삭제
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      localStorage.removeItem('auth-storage'); // persist 데이터도 삭제
      
      // 현재 페이지가 로그인 페이지가 아닐 때만 리다이렉트
      if (window.location.pathname !== '/login') {
        alert(`${status === 401 ? '로그인이 만료되었습니다' : '접근 권한이 없습니다'}. 다시 로그인해주세요.`);
        
        // 페이지 이동
        setTimeout(() => {
          window.location.href = '/login';
        }, 1000);
      }
    }
    
    return Promise.reject(error);
  }
);

/**
 * 구급차 상태 업데이트
 * @param {number} ambulanceId - 현재는 ambulanceId 미사용, 백엔드 API에 따라 수정 필요
 * @param {string} status - 'wait' 또는 'transfer'
 * @returns {Promise}
 */
export const updateAmbulanceStatus = async (ambulanceId, status) => {
  try {
    console.log(`[API] updateAmbulanceStatus 호출: ambulanceId=${ambulanceId}, status=${status}`);
    
    let endpoint = '';
    if (status === 'wait') {
      endpoint = '/api/v1/ambulance/transfer/wait';
    } else if (status === 'transfer') {
      endpoint = '/api/v1/ambulance/transfer';
    } else {
      throw new Error(`Invalid ambulance status: ${status}`);
    }
    
    const response = await apiClient.post(endpoint);
    console.log('[API] updateAmbulanceStatus 성공:', response.data);
    return response.data;
  } catch (error) {
    console.error(`[API] updateAmbulanceStatus(${status}) 실패:`, error.message);
    throw error;
  }
};

/**
 * 환자 필수 정보 저장 (PUT) - 🔥 위치 정보 포함 가능
 * @param {Object} patientInfo - KTAS + 진료과목 + 위치 정보(옵션)
 * @returns {Promise}
 */
export const saveRequiredPatientInfo = async (patientInfo) => {
  try {
    console.log('[API] saveRequiredPatientInfo 호출 시작');
    console.log('[API] 전송할 환자 필수 정보 (위치 포함 가능):', patientInfo);
    
    const response = await apiClient.put('/api/v1/patient/required', patientInfo);
    
    console.log('[API] saveRequiredPatientInfo 성공! 🎉');
    console.log('[API] 응답 데이터:', response.data);
    console.log("_______________________");
    return response.data;
  } catch (error) {
    console.error('[API] saveRequiredPatientInfo 실패:', error.message);
    
    // 🔥 에러 유형별 상세 로깅
    if (error.response) {
      console.error('[API] 서버 응답 에러:', {
        status: error.response.status,
        statusText: error.response.statusText,
        data: error.response.data,
        headers: error.response.headers
      });
      
      // 특정 에러 코드별 처리
      if (error.response.status === 400) {
        console.error('[API] 잘못된 요청 데이터. patientInfo를 확인하세요.');
        console.error('[API] 전송한 데이터:', patientInfo);
      } else if (error.response.status === 500) {
        console.error('[API] 서버 내부 오류. 백엔드 로그를 확인하세요.');
      }
    } else if (error.request) {
      console.error('[API] 네트워크 요청 실패:', error.request);
    } else {
      console.error('[API] 요청 설정 에러:', error.message);
    }
    
    throw error;
  }
};

/**
 * 환자 선택 정보 저장 (PATCH) - 🔥 위치 정보 포함 가능
 * @param {Object} patientDetails - 선택 정보 + 위치 정보(옵션)
 * @returns {Promise}
 */
export const saveOptionalPatientInfo = async (patientDetails) => {
  try {
    console.log('[API] saveOptionalPatientInfo 호출 시작');
    console.log('[API] 전송할 환자 선택 정보 (위치 포함 가능):', patientDetails);
    
    const response = await apiClient.patch('/api/v1/patient/optional', patientDetails);
    
    console.log('[API] saveOptionalPatientInfo 성공! 🎉');
    console.log('[API] 응답 데이터:', response.data);
    return response.data;
  } catch (error) {
    console.error('[API] saveOptionalPatientInfo 실패:', error.message);
    
    // 🔥 에러 상세 로깅
    if (error.response) {
      console.error('[API] 서버 응답 에러:', {
        status: error.response.status,
        statusText: error.response.statusText,
        data: error.response.data
      });
    }
    
    throw error;
  }
};

/**
 * 환자 정보 조회 (GET)
 * @returns {Promise}
 */
export const getPatientInfo = async () => {
  try {
    console.log('[API] getPatientInfo 호출');
    const response = await apiClient.get('/api/v1/patient/');
    console.log('[API] getPatientInfo 성공:', response.data);
    return response.data;
  } catch (error) {
    console.error('[API] getPatientInfo 실패:', error.message);
    if (error.response?.status === 500) {
      console.error('[API] 백엔드에서 500 에러 발생. 이 API는 현재 사용하지 마세요.');
    }
    throw error;
  }
};

// 🔥 새로 추가: 병원 좌표 조회 API들 (HospitalController 기준)

/**
 * 현재 로그인한 병원의 좌표 정보 조회 (GET)
 * @returns {Promise<{latitude: number, longitude: number}>} HospitalLocationResponseDto
 */
export const getCurrentHospitalLocation = async () => {
  try {
    console.log('[API] 🏥 현재 병원 좌표 조회 요청');
    
    // 🔥 백엔드 HospitalController 스펙: GET /api/v1/hospital/location
    const response = await apiClient.get('/api/v1/hospital/location');
    
    console.log('[API] 🏥 현재 병원 좌표 조회 성공! 🎉');
    console.log('[API] 🏥 좌표 정보 (HospitalLocationResponseDto):', response.data);
    
    // 🔥 좌표 유효성 검사
    const { latitude, longitude } = response.data;
    if (!latitude || !longitude || isNaN(latitude) || isNaN(longitude)) {
      console.warn('⚠️ [API] 유효하지 않은 병원 좌표:', response.data);
      throw new Error('병원 좌표 정보가 유효하지 않습니다.');
    }
    
    // 🔥 대한민국 좌표 범위 확인
    if (latitude < 33 || latitude > 39 || longitude < 124 || longitude > 132) {
      console.warn('⚠️ [API] 좌표가 대한민국 범위를 벗어남:', latitude, longitude);
    }
    
    console.log(`📍 [API] 병원 실제 위치: ${latitude.toFixed(6)}, ${longitude.toFixed(6)}`);
    
    return response.data;
  } catch (error) {
    console.error('[API] 🏥 현재 병원 좌표 조회 실패:', error);
    
    if (error.response) {
      console.error('[API] 🏥 서버 응답 에러:', {
        status: error.response.status,
        statusText: error.response.statusText,
        data: error.response.data,
        url: error.response.config?.url
      });
      
      if (error.response.status === 401) {
        console.error('[API] 🏥 401 Unauthorized - 로그인 상태 확인 필요');
      } else if (error.response.status === 403) {
        console.error('[API] 🏥 403 Forbidden - 병원 계정이 아니거나 권한 없음');
      } else if (error.response.status === 404) {
        console.error('[API] 🏥 404 Not Found - 병원 정보를 찾을 수 없음');
      } else if (error.response.status === 500) {
        console.error('[API] 🏥 500 Internal Server Error - 백엔드 hospitalService.getHospitalLocation() 확인 필요');
      }
    } else {
      console.error('[API] 🏥 네트워크 또는 요청 설정 에러:', error.message);
    }
    
    throw error;
  }
};

/**
 * 특정 병원(userId)의 좌표 정보 조회 (GET)
 * @param {number|string} userId - 병원 사용자 ID
 * @returns {Promise<{latitude: number, longitude: number}>} HospitalLocationResponseDto
 */
export const getHospitalLocationByUserId = async (userId) => {
  try {
    console.log('[API] 🏥 병원 좌표 조회 요청 - userId:', userId);
    
    if (!userId) {
      throw new Error('userId는 필수값입니다.');
    }
    
    // 🔥 백엔드 HospitalController 스펙: GET /api/v1/hospital/location/{userId}
    const response = await apiClient.get(`/api/v1/hospital/location/${userId}`);
    
    console.log('[API] 🏥 병원 좌표 조회 성공! 🎉');
    console.log('[API] 🏥 좌표 정보 (HospitalLocationResponseDto):', response.data);
    
    // 🔥 좌표 유효성 검사
    const { latitude, longitude } = response.data;
    if (!latitude || !longitude || isNaN(latitude) || isNaN(longitude)) {
      console.warn(`⚠️ [API] 유효하지 않은 병원 좌표 (userId: ${userId}):`, response.data);
      throw new Error(`병원 ${userId}의 좌표 정보가 유효하지 않습니다.`);
    }
    
    // 🔥 대한민국 좌표 범위 확인
    if (latitude < 33 || latitude > 39 || longitude < 124 || longitude > 132) {
      console.warn(`⚠️ [API] 좌표가 대한민국 범위를 벗어남 (userId: ${userId}):`, latitude, longitude);
    }
    
    console.log(`📍 [API] 병원 ${userId} 실제 위치: ${latitude.toFixed(6)}, ${longitude.toFixed(6)}`);
    
    return response.data;
  } catch (error) {
    console.error(`[API] 🏥 병원 좌표 조회 실패 (userId: ${userId}):`, error);
    
    if (error.response) {
      console.error('[API] 🏥 서버 응답 에러:', {
        status: error.response.status,
        statusText: error.response.statusText,
        data: error.response.data,
        url: error.response.config?.url,
        userId: userId
      });
      
      if (error.response.status === 400) {
        console.error('[API] 🏥 400 Bad Request - userId 형태 확인 필요');
      } else if (error.response.status === 401) {
        console.error('[API] 🏥 401 Unauthorized - 로그인 상태 확인 필요');
      } else if (error.response.status === 403) {
        console.error('[API] 🏥 403 Forbidden - 해당 병원 정보 접근 권한 없음');
      } else if (error.response.status === 404) {
        console.error(`[API] 🏥 404 Not Found - userId ${userId}에 해당하는 병원을 찾을 수 없음`);
      } else if (error.response.status === 500) {
        console.error('[API] 🏥 500 Internal Server Error - 백엔드 hospitalService.getHospitalLocationByUserId() 확인 필요');
      }
    } else {
      console.error('[API] 🏥 네트워크 또는 요청 설정 에러:', error.message);
    }
    
    throw error;
  }
};

// 🔥 병원 자동 매칭 API들 (좌표 정보 자동 조회 기능 추가)

/**
 * 병원 자동 매칭 실행 (PATCH) - 🔥 좌표 정보 자동 조회 기능 추가
 * @param {Object} matchingData - { ambulanceId, latitude, longitude }
 * @returns {Promise<{hospitalId: number, name: string, address: string, latitude?: number, longitude?: number}>}
 */
export const requestHospitalMatching = async (matchingData) => {
  try {
    console.log('[API] 🏥 병원 자동 매칭 요청 시작 (좌표 자동 조회 포함)');
    console.log('[API] 매칭 요청 데이터:', matchingData);
    
    const { ambulanceId, latitude, longitude, ...otherData } = matchingData;
    
    // 🔥 백엔드 MatchRequest 형태에 맞게 요청 데이터 구성
    const requestBody = {
      latitude: latitude,
      longitude: longitude
    };
    
    console.log('[API] 🏥 전송할 요청 바디 (MatchRequest 형태):', requestBody);
    console.log('[API] 🏥 ambulanceId (Path Variable):', ambulanceId);
    
    // 🔥 백엔드 스펙: PATCH /api/v1/match/{uid}
    const response = await apiClient.patch(`/api/v1/match/${ambulanceId}`, requestBody);
    
    console.log('[API] 🏥 병원 자동 매칭 성공! 🎉');
    console.log('[API] 🏥 매칭 결과 (MatchResponse):', response.data);
    
    // 🔥 매칭 결과에 좌표가 없으면 별도 조회
    if (response.data && !response.data.latitude && response.data.hospitalId) {
      console.log('[API] 🏥 좌표 정보 없음, HospitalLocationResponseDto로 별도 조회 시작...');
      
      try {
        // 🔥 병원 ID를 userId로 가정하고 좌표 조회 (실제 구조에 따라 조정 필요)
        const locationInfo = await getHospitalLocationByUserId(response.data.hospitalId);
        
        // 🔥 매칭 결과에 좌표 정보 추가
        const enhancedResult = {
          ...response.data,
          latitude: locationInfo.latitude,
          longitude: locationInfo.longitude
        };
        
        console.log('[API] 🏥 병원 매칭 결과 (실제 좌표 포함):', enhancedResult);
        console.log(`📍 [API] 매칭된 병원 실제 위치: ${locationInfo.latitude.toFixed(6)}, ${locationInfo.longitude.toFixed(6)}`);
        
        return enhancedResult;
        
      } catch (locationError) {
        console.error('[API] 🏥 병원 좌표 별도 조회 실패:', locationError);
        console.warn('[API] 🏥 좌표 조회 실패해도 기본 매칭 결과는 반환합니다.');
        
        // 좌표 조회 실패해도 기본 매칭 결과는 반환
        return response.data;
      }
    }
    
    // 🔥 매칭 결과에 이미 좌표가 있으면 그대로 반환
    if (response.data.latitude && response.data.longitude) {
      console.log(`📍 [API] 매칭 결과에 좌표 이미 포함됨: ${response.data.latitude.toFixed(6)}, ${response.data.longitude.toFixed(6)}`);
    }
    
    return response.data;
  } catch (error) {
    console.error('[API] 🏥 병원 자동 매칭 실패:', error);
    
    if (error.response) {
      console.error('[API] 🏥 서버 응답 에러:', {
        status: error.response.status,
        statusText: error.response.statusText,
        data: error.response.data,
        url: error.response.config?.url,
        method: error.response.config?.method,
        sentData: error.response.config?.data
      });
      
      if (error.response.status === 400) {
        console.error('[API] 🏥 400 Bad Request - 요청 데이터나 ambulanceId 확인 필요');
        console.error('[API] 🏥 전송한 데이터:', { ambulanceId, requestBody: error.response.config?.data });
      } else if (error.response.status === 404) {
        console.error('[API] 🏥 404 Not Found - ambulanceId를 찾을 수 없음');
      } else if (error.response.status === 500) {
        console.error('[API] 🏥 500 Internal Server Error - 백엔드 병원 매칭 로직 에러');
        console.error('[API] 🏥 백엔드 MatchingService.autoMatch() 메서드 확인 필요');
      }
    } else if (error.request) {
      console.error('[API] 🏥 네트워크 요청 실패:', error.request);
    } else {
      console.error('[API] 🏥 요청 설정 에러:', error.message);
    }
    
    throw error;
  }
};

/**
 * 매칭된 병원 정보 조회 (GET) - 🔥 좌표 정보 자동 조회 기능 추가
 * @param {number|string} ambulanceId - 구급차 ID
 * @returns {Promise<{hospitalId: number, name: string, address: string, latitude?: number, longitude?: number}>}
 */
export const getMatchedHospital = async (ambulanceId) => {
  try {
    console.log('[API] 🏥 매칭된 병원 정보 조회 시작 (좌표 자동 조회 포함)');
    console.log('[API] 🏥 ambulanceId:', ambulanceId);
    
    // 🔥 백엔드 스펙: GET /api/v1/match/{uid}
    const response = await apiClient.get(`/api/v1/match/${ambulanceId}`);
    
    console.log('[API] 🏥 매칭된 병원 정보 조회 성공! 🎉');
    console.log('[API] 🏥 매칭된 병원 (MatchResponse):', response.data);
    
    // 🔥 매칭 결과에 좌표가 없으면 별도 조회
    if (response.data && !response.data.latitude && response.data.hospitalId) {
      console.log('[API] 🏥 기존 매칭 병원 좌표 별도 조회...');
      
      try {
        const locationInfo = await getHospitalLocationByUserId(response.data.hospitalId);
        
        const enhancedResult = {
          ...response.data,
          latitude: locationInfo.latitude,
          longitude: locationInfo.longitude
        };
        
        console.log('[API] 🏥 매칭된 병원 조회 결과 (실제 좌표 포함):', enhancedResult);
        console.log(`📍 [API] 기존 매칭된 병원 실제 위치: ${locationInfo.latitude.toFixed(6)}, ${locationInfo.longitude.toFixed(6)}`);
        
        return enhancedResult;
        
      } catch (locationError) {
        console.error('[API] 🏥 기존 매칭 병원 좌표 조회 실패:', locationError);
        console.warn('[API] 🏥 좌표 조회 실패해도 기본 매칭 결과는 반환합니다.');
        
        return response.data;
      }
    }
    
    // 🔥 매칭 결과에 이미 좌표가 있으면 그대로 반환
    if (response.data?.latitude && response.data?.longitude) {
      console.log(`📍 [API] 기존 매칭 결과에 좌표 이미 포함됨: ${response.data.latitude.toFixed(6)}, ${response.data.longitude.toFixed(6)}`);
    }
    
    return response.data;
  } catch (error) {
    console.error('[API] 🏥 매칭된 병원 정보 조회 실패:', error);
    
    if (error.response) {
      console.error('[API] 🏥 서버 응답 에러:', {
        status: error.response.status,
        statusText: error.response.statusText,
        data: error.response.data,
        url: error.response.config?.url
      });
      
      if (error.response.status === 400) {
        console.error('[API] 🏥 400 Bad Request - ambulanceId 형태 확인 필요');
      } else if (error.response.status === 404) {
        console.error('[API] 🏥 404 Not Found - ambulanceId를 찾을 수 없거나 매칭된 병원이 없음');
      } else if (error.response.status === 500) {
        console.error('[API] 🏥 500 Internal Server Error - 백엔드 병원 조회 로직 에러');
        console.error('[API] 🏥 백엔드 MatchingService.getMatchedHospital() 메서드 확인 필요');
      }
    } else {
      console.error('[API] 🏥 네트워크 또는 요청 설정 에러:', error.message);
    }
    
    throw error;
  }
};

/**
 * 이송 생성 (POST)
 * @param {Object} dispatchRequest
 * @returns {Promise}
 */
export const createDispatch = async (dispatchRequest) => {
  try {
    console.log('[API] createDispatch 호출:', dispatchRequest);
    const response = await apiClient.post('/api/v1/dispatch/', dispatchRequest);
    console.log('[API] createDispatch 성공:', response.data);
    return response.data;
  } catch (error) {
    console.error('[API] createDispatch 실패:', error.message);
    throw error;
  }
};

/**
 * 이송 이력 조회 (GET)
 * @returns {Promise}
 */
export const getDispatchHistory = async () => {
  try {
    console.log('[API] getDispatchHistory 호출');
    const response = await apiClient.get('/api/v1/dispatch/history');
    console.log('[API] getDispatchHistory 성공:', response.data);
    return response.data;
  } catch (error) {
    console.error('[API] getDispatchHistory 실패:', error.message);
    throw error;
  }
};

/**
 * 병원 진료과 정보 수정 (PATCH)
 * @param {Object} departmentUpdate
 * @returns {Promise}
 */
export const updateHospitalDepartment = async (departmentUpdate) => {
  try {
    console.log('[API] updateHospitalDepartment 호출:', departmentUpdate);
    const response = await apiClient.patch('/api/v1/hospital/department', departmentUpdate);
    console.log('[API] updateHospitalDepartment 성공:', response.data);
    return response.data;
  } catch (error) {
    console.error('[API] updateHospitalDepartment 실패:', error.message);
    throw error;
  }
};

/**
 * 병원별 대기 중인 구급차 목록 조회 (GET)
 * @param {string|number} hospitalId - 병원 ID
 * @returns {Promise<Array>} 대기 중인 VideoSessionInfo 목록
 */
export const getWaitingAmbulances = async (hospitalId) => {
  try {
    console.log('[API] getWaitingAmbulances 호출:', hospitalId);
    const response = await apiClient.get(`/api/v1/redis/waiting/${hospitalId}`);
    console.log('[API] getWaitingAmbulances 성공:', response.data);
    return response.data;
  } catch (error) {
    console.error('[API] getWaitingAmbulances 실패:', error.message);
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
    
    console.log('[API] createAmbulanceToken 호출');
    console.log('[API] 요청 바디:', body);
    
    const response = await apiClient.post('/api/v1/video-call/ambulance/token', body);
    console.log('[API] createAmbulanceToken 성공:', response.data);
    return response.data;
  } catch (error) {
    console.error('[API] createAmbulanceToken 실패:', error.response?.data || error.message);
    throw error;
  }
};

/**
 * 병원용 화상 토큰 발급 (GET)
 * @param {string} sessionId
 * @returns {Promise<{ token: string, sessionId: string }>}
 */
export const getHospitalToken = async (params) => {
  try {
    console.log('[API] getHospitalToken 호출:', params);
    const response = await apiClient.get('/api/v1/video-call/hospital/token', {
      params: params
    });
    console.log('[API] getHospitalToken 성공:', response.data);
    return response.data;
  } catch (error) {
    console.error('[API] getHospitalToken 실패:', error.message);
    throw error;
  }
};

/**
 * 화상 통화 시작 (PUT)
 * @param {Object} request - sessionId, optional hospitalId 포함
 * @returns {Promise}
 */
export const startVideoCall = async (request) => {
  try {
    console.log('[API] startVideoCall 호출:', request);
    const response = await apiClient.put('/api/v1/video-call/start-call', request);
    console.log('[API] startVideoCall 성공:', response.data);
    return response.data;
  } catch (error) {
    console.error('[API] startVideoCall 실패:', error.message);
    throw error;
  }
};

/**
 * 화상 통화 종료 (PUT)
 * @param {Object} request - sessionId 포함
 * @returns {Promise}
 */
export const endVideoCall = async (request) => {
  try {
    console.log('[API] endVideoCall 호출:', request);
    const response = await apiClient.put('/api/v1/video-call/end-call', request);
    console.log('[API] endVideoCall 성공:', response.data);
    return response.data;
  } catch (error) {
    console.error('[API] endVideoCall 실패:', error.message);
    throw error;
  }
};

/**
 * 이송 완료 처리 (DELETE)
 * @param {string} sessionId
 * @param {number} hospitalId
 * @returns {Promise}
 */
export const completeTransport = async (sessionId, hospitalId) => {
  try {
    console.log('[API] completeTransport 호출:', { sessionId, hospitalId });
    const response = await apiClient.delete(`/api/v1/video-call/session/${sessionId}/complete`, {
      params: { hospitalId }
    });
    console.log('[API] completeTransport 성공:', response.data);
    return response.data;
  } catch (error) {
    console.error('[API] completeTransport 실패:', error.message);
    throw error;
  }
};

/**
 * 대기목록에서 구급차 삭제 (DELETE)
 * @param {string|number} hospitalId - 병원 ID
 * @param {string} sessionId - 세션 ID (구급차 번호)
 * @returns {Promise}
 */
export const removeFromWaitingList = async (hospitalId, sessionId) => {
  try {
    console.log('[API] removeFromWaitingList 호출:', { hospitalId, sessionId });
    const response = await apiClient.delete(`/api/v1/redis/waiting/${hospitalId}/${sessionId}`);
    console.log('[API] removeFromWaitingList 성공:', response.data);
    return response.data;
  } catch (error) {
    console.error('[API] removeFromWaitingList 실패:', error.message);
    throw error;
  }
};

// 🔥 디버깅용 함수 - 현실적인 버전

/**
 * API 클라이언트 상태 확인용 함수 (병원 좌표 조회 기능 포함)
 */
export const debugApiClient = () => {
  const directToken = localStorage.getItem('accessToken');
  const authStorage = localStorage.getItem('auth-storage');
  let persistToken = null;
  
  try {
    if (authStorage) {
      const parsed = JSON.parse(authStorage);
      persistToken = parsed.state?.accessToken;
    }
  } catch (error) {
    console.error('persist 저장소 파싱 실패:', error);
  }
  
  console.log('=== API 클라이언트 디버깅 정보 (병원 좌표 조회 포함) ===');
  console.log('API_BASE_URL:', API_BASE_URL);
  console.log('직접 저장된 토큰 존재:', !!directToken);
  console.log('persist 저장소 토큰 존재:', !!persistToken);
  console.log('사용될 토큰 (일부):', (persistToken || directToken)?.substring(0, 50) + '...' || '없음');
  console.log('auth-storage 전체:', authStorage);
  console.log('apiClient 기본 설정:', apiClient.defaults);
  
  console.log('📋 실제 백엔드에 존재하는 API 함수들:');
  console.log(' ✅ updateAmbulanceStatus');
  console.log(' ✅ saveRequiredPatientInfo (위치 정보 포함 가능)');
  console.log(' ✅ saveOptionalPatientInfo (위치 정보 포함 가능)');
  console.log(' ✅ getPatientInfo');
  console.log(' ✅ createDispatch');
  console.log(' ✅ getDispatchHistory');
  console.log(' ✅ updateHospitalDepartment');
  console.log(' ✅ 화상 통화 관련 API들...');
  
  console.log('🏥 병원 자동 매칭 API들 (좌표 자동 조회 포함):');
  console.log(' ✅ requestHospitalMatching (PATCH /api/v1/match/{uid}) - 좌표 자동 조회');
  console.log(' ✅ getMatchedHospital (GET /api/v1/match/{uid}) - 좌표 자동 조회');
  
  console.log('📍 새로 추가된 병원 좌표 조회 API들:');
  console.log(' ✅ getCurrentHospitalLocation (GET /api/v1/hospital/location)');
  console.log(' ✅ getHospitalLocationByUserId (GET /api/v1/hospital/location/{userId})');
  console.log(' ✅ 응답: { latitude: number, longitude: number } (HospitalLocationResponseDto)');
  
  console.log('🚫 제거된 백엔드에 없는 가상 API들:');
  console.log(' ❌ sendLocationUpdate (백엔드에 없음)');
  console.log(' ❌ getAmbulanceStatus (백엔드에 없음)');
  console.log(' ❌ getNearbyHospitals (백엔드에 없음)');
  
  console.log('💡 병원 자동 매칭 + 좌표 조회 사용법:');
  console.log(' 🏥 requestHospitalMatching({ ambulanceId, latitude, longitude })');
  console.log(' 🏥 → 매칭 결과에 좌표 없으면 자동으로 getHospitalLocationByUserId() 호출');
  console.log(' 🏥 → 최종 응답: { hospitalId, name, address, latitude, longitude }');
  console.log(' 🏥 getMatchedHospital(ambulanceId) → 동일한 방식으로 좌표 자동 조회');
  
  console.log('📍 위치 정보 전송 방법:');
  console.log(' 📍 구급차 대시보드 지도에서 getCurrentPosition() 사용');
  console.log(' 📍 환자 정보 저장시 위치 정보를 함께 포함해서 전송');
  console.log(' 📍 병원 매칭시 위치 정보를 requestHospitalMatching()에 전달');
  console.log(' 📍 매칭된 병원의 실제 좌표 자동 조회 → 지도에 정확한 위치 표시');
  console.log('===============================================');
  
  return {
    directToken: !!directToken,
    persistToken: !!persistToken,
    authStorage,
    finalToken: persistToken || directToken
  };
};

// 🔥 전역에서 디버깅 함수 사용 가능하게 window에 추가 (개발 환경에서만)
if (import.meta.env.DEV) {
  window.debugApiClient = debugApiClient;
  console.log('[API] 개발 모드: window.debugApiClient() 함수 사용 가능');
}

// 🔥 모듈 로드 시점 로그 - 병원 좌표 조회 포함 버전
(() => {
  const authStorage = localStorage.getItem('auth-storage');
  const directToken = localStorage.getItem('accessToken');
  
  console.log('[API] 모듈 로드 시점 (병원 좌표 조회 기능 포함 버전):');
  console.log('- persist 저장소 존재:', !!authStorage);
  console.log('- 직접 토큰 존재:', !!directToken);
  
  if (authStorage) {
    try {
      const parsed = JSON.parse(authStorage);
      console.log('- persist 토큰 존재:', !!parsed.state?.accessToken);
    } catch (e) {
      console.log('- persist 파싱 실패');
    }
  }
  
  console.log('[API] 📍 위치 정보는 기존 환자 정보 API에 포함해서 전송됩니다');
  console.log('[API] 🏥 병원 자동 매칭 API 2개 + 좌표 자동 조회 기능 추가됨');
  console.log('[API] 📍 병원 좌표 조회 API 2개 추가됨 (HospitalLocationResponseDto 활용)');
  console.log('[API] 🚫 백엔드에 없는 가상 API들 모두 제거됨');
  console.log('[API] ✅ 이제 지도에서 병원 실제 위치가 정확히 표시될 예정!');
})();
