// src/api/api.js

import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json; charset=utf-8',
  },
  timeout: 30000,
});

apiClient.interceptors.request.use(
  (config) => {
    let accessToken = null;
    try {
      const authStorage = localStorage.getItem('auth-storage');
      if (authStorage) {
        const parsedAuth = JSON.parse(authStorage);
        accessToken = parsedAuth.state?.accessToken;
      }
    } catch (error) {
      console.warn('[API] persist 저장소 파싱 실패:', error);
    }
    
    if (!accessToken) {
      accessToken = localStorage.getItem('accessToken');
    }
    
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    } else {
      console.error('[API] 🚨 JWT 토큰을 찾을 수 없습니다!');
    }
    
    return config;
  },
  (error) => {
    console.error('[API] 요청 인터셉터 에러:', error);
    return Promise.reject(error);
  }
);

apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    const status = error.response?.status;
    
    console.error(`[API 에러] ${status || 'NETWORK'} ${error.config?.url || 'UNKNOWN'} ❌`);
    
    if (status === 401 || status === 403) {
      console.warn(`[API] ${status === 401 ? '인증 만료' : '권한 없음'} - 자동 로그아웃 처리`);
      
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      localStorage.removeItem('auth-storage');
      
      if (window.location.pathname !== '/login') {
        alert(`${status === 401 ? '로그인이 만료되었습니다' : '접근 권한이 없습니다'}. 다시 로그인해주세요.`);
        
        setTimeout(() => {
          window.location.href = '/login';
        }, 1000);
      }
    }
    
    return Promise.reject(error);
  }
);

export const updateAmbulanceStatus = async (ambulanceId, status) => {
  try {
    let endpoint = '';
    if (status === 'wait') {
      endpoint = '/api/v1/ambulance/transfer/wait';
    } else if (status === 'transfer') {
      endpoint = '/api/v1/ambulance/transfer';
    } else {
      throw new Error(`Invalid ambulance status: ${status}`);
    }
    const response = await apiClient.post(endpoint);
    return response.data;
  } catch (error) {
    console.error(`[API] updateAmbulanceStatus(${status}) 실패:`, error.message);
    throw error;
  }
};

export const saveRequiredPatientInfo = async (patientInfo) => {
  try {
    const response = await apiClient.put('/api/v1/patient/required', patientInfo);
    return response.data;
  } catch (error) {
    console.error('[API] saveRequiredPatientInfo 실패:', error.message);
    if (error.response) {
      console.error('[API] 서버 응답 에러:', {
        status: error.response.status,
        data: error.response.data,
      });
    }
    throw error;
  }
};

export const saveOptionalPatientInfo = async (patientDetails) => {
  try {
    const response = await apiClient.patch('/api/v1/patient/optional', patientDetails);
    return response.data;
  } catch (error) {
    console.error('[API] saveOptionalPatientInfo 실패:', error.message);
    if (error.response) {
      console.error('[API] 서버 응답 에러:', {
        status: error.response.status,
        data: error.response.data
      });
    }
    throw error;
  }
};

export const getPatientInfo = async () => {
  try {
    const response = await apiClient.get('/api/v1/patient/');
    return response.data;
  } catch (error) {
    console.error('[API] getPatientInfo 실패:', error.message);
    throw error;
  }
};

export const getCurrentHospitalLocation = async () => {
  try {
    const response = await apiClient.get('/api/v1/hospital/location');
    const { latitude, longitude } = response.data;
    if (!latitude || !longitude || isNaN(latitude) || isNaN(longitude)) {
      throw new Error('병원 좌표 정보가 유효하지 않습니다.');
    }
    return response.data;
  } catch (error) {
    console.error('[API] 🏥 현재 병원 좌표 조회 실패:', error);
    throw error;
  }
};

export const getHospitalLocationByUserId = async (userId) => {
  try {
    if (!userId) {
      throw new Error('userId는 필수값입니다.');
    }
    const response = await apiClient.get(`/api/v1/hospital/location/${userId}`);
    const { latitude, longitude } = response.data;
    if (!latitude || !longitude || isNaN(latitude) || isNaN(longitude)) {
      throw new Error(`병원 ${userId}의 좌표 정보가 유효하지 않습니다.`);
    }
    return response.data;
  } catch (error) {
    console.error(`[API] 🏥 병원 좌표 조회 실패 (userId: ${userId}):`, error);
    throw error;
  }
};

export const requestHospitalMatching = async (matchingData) => {
  try {
    const { ambulanceId, latitude, longitude } = matchingData;
    const requestBody = { latitude, longitude };
    const response = await apiClient.patch(`/api/v1/match/${ambulanceId}`, requestBody);
    
    if (response.data && !response.data.latitude && response.data.hospitalId) {
      try {
        const locationInfo = await getHospitalLocationByUserId(response.data.hospitalId);
        return {
          ...response.data,
          latitude: locationInfo.latitude,
          longitude: locationInfo.longitude
        };
      } catch (locationError) {
        console.error('[API] 🏥 병원 좌표 별도 조회 실패:', locationError);
        return response.data;
      }
    }
    return response.data;
  } catch (error) {
    console.error('[API] 🏥 병원 자동 매칭 실패:', error);
    throw error;
  }
};

export const getMatchedHospital = async (ambulanceId) => {
  try {
    const response = await apiClient.get(`/api/v1/match/${ambulanceId}`);
    if (response.data && !response.data.latitude && response.data.hospitalId) {
      try {
        const locationInfo = await getHospitalLocationByUserId(response.data.hospitalId);
        return {
          ...response.data,
          latitude: locationInfo.latitude,
          longitude: locationInfo.longitude
        };
      } catch (locationError) {
        console.error('[API] 🏥 기존 매칭 병원 좌표 조회 실패:', locationError);
        return response.data;
      }
    }
    return response.data;
  } catch (error) {
    console.error('[API] 🏥 매칭된 병원 정보 조회 실패:', error);
    throw error;
  }
};

export const createDispatch = async (dispatchRequest) => {
  try {
    const response = await apiClient.post('/api/v1/dispatch/', dispatchRequest);
    return response.data;
  } catch (error) {
    console.error('[API] createDispatch 실패:', error.message);
    throw error;
  }
};

export const getDispatchHistory = async () => {
  try {
    const response = await apiClient.get('/api/v1/dispatch/history');
    return response.data;
  } catch (error) {
    console.error('[API] getDispatchHistory 실패:', error.message);
    throw error;
  }
};

export const updateHospitalDepartment = async (departmentUpdate) => {
  try {
    const response = await apiClient.patch('/api/v1/hospital/department', departmentUpdate);
    return response.data;
  } catch (error) {
    console.error('[API] updateHospitalDepartment 실패:', error.message);
    throw error;
  }
};

export const getWaitingAmbulances = async (hospitalId) => {
  try {
    const response = await apiClient.get(`/api/v1/redis/waiting/${hospitalId}`);
    return response.data;
  } catch (error) {
    console.error('[API] getWaitingAmbulances 실패:', error.message);
    throw error;
  }
};

export const getAmbulancePatientDetail = async (hospitalId, ambulanceId) => {
  try {
    const response = await apiClient.get(`/api/v1/redis/waiting/${hospitalId}/${ambulanceId}/detail`);
    return response.data;
  } catch (error) {
    console.error('[API] getAmbulancePatientDetail 실패:', error.message);
    throw error;
  }
};

export const createAmbulanceToken = async (request) => {
  try {
    const body = {
      sessionId: request.sessionId || '',
      ambulanceNumber: request.ambulanceNumber || '',
      hospitalId: Number(request.hospitalId) || 0,
      ktas: Number(request.ktas) || 0,
      patientName: request.patientName || '',
    };
    const response = await apiClient.post('/api/v1/video-call/ambulance/token', body);
    return response.data;
  } catch (error) {
    console.error('[API] createAmbulanceToken 실패:', error.response?.data || error.message);
    throw error;
  }
};

export const getHospitalToken = async (params) => {
  try {
    const response = await apiClient.get('/api/v1/video-call/hospital/token', { params });
    return response.data;
  } catch (error) {
    console.error('[API] getHospitalToken 실패:', error.message);
    throw error;
  }
};

export const startVideoCall = async (request) => {
  try {
    const response = await apiClient.put('/api/v1/video-call/start-call', request);
    return response.data;
  } catch (error) {
    console.error('[API] startVideoCall 실패:', error.message);
    throw error;
  }
};

export const endVideoCall = async (request) => {
  try {
    const response = await apiClient.put('/api/v1/video-call/end-call', request);
    return response.data;
  } catch (error) {
    console.error('[API] endVideoCall 실패:', error.message);
    throw error;
  }
};

export const completeTransport = async (sessionId, hospitalId) => {
  try {
    const response = await apiClient.delete(`/api/v1/video-call/session/${sessionId}/complete`, {
      params: { hospitalId }
    });
    return response.data;
  } catch (error) {
    console.error('[API] completeTransport 실패:', error.message);
    throw error;
  }
};

export const removeFromWaitingList = async (hospitalId, sessionId) => {
  try {
    const response = await apiClient.delete(`/api/v1/redis/waiting/${hospitalId}/${sessionId}`);
    return response.data;
  } catch (error) {
    console.error('[API] removeFromWaitingList 실패:', error.message);
    throw error;
  }
};