// src/store/useEmergencyStore.js - 구급차 전용 상태관리 (소방서 배차 연동 지원)

import { create } from "zustand";
import { 
  // 구급차 관련 API
  getAmbulances,
  getAmbulanceDetail,
  updateAmbulanceStatus,
  getAmbulanceLocation,
  
  // 환자 정보 API
  saveRequiredPatientInfo,
  saveOptionalPatientInfo,
  getPatientInfo,
  
  // 병원 매칭 API
  requestHospitalMatching,
  getMatchedHospital,
  getHospitals,
  
  // 출동 관련 API
  getDispatchHistory,
  
  // 위치 관련 API
  geocodeAddress,
  reverseGeocode,
  calculateDistance
} from "../api/api";

import { useAuthStore } from "./useAuthStore";

// === 유틸리티 함수들 ===

/**
 * 현재 위치 조회 (GPS)
 */
const getCurrentLocationFromDashboard = () => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('이 기기에서는 GPS를 지원하지 않습니다.'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        const locationData = {
          latitude,
          longitude,
          accuracy,
          timestamp: new Date().toISOString(),
          source: 'gps'
        };
        
        console.log('[GPS] 위치 조회 성공:', locationData);
        resolve(locationData);
      },
      (error) => {
        let errorMessage = 'GPS 위치 조회에 실패했습니다.';
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'GPS 권한이 거부되었습니다. 설정에서 위치 권한을 허용해주세요.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'GPS 위치를 확인할 수 없습니다. 실외에서 다시 시도해주세요.';
            break;
          case error.TIMEOUT:
            errorMessage = 'GPS 위치 조회 시간이 초과되었습니다. 다시 시도해주세요.';
            break;
        }
        
        console.error('[GPS] 위치 조회 실패:', error);
        reject(new Error(errorMessage));
      },
      {
        enableHighAccuracy: true,
        timeout: 15000, // 15초로 증가
        maximumAge: 60000 // 1분
      }
    );
  });
};

/**
 * 환자 정보 데이터 검증 및 변환
 */
const validatePatientData = (patientData) => {
  if (!patientData || typeof patientData !== 'object') {
    return { isValid: false, errors: ['환자 정보가 유효하지 않습니다.'] };
  }

  const errors = [];
  const validated = {};

  // KTAS 검증
  if (patientData.ktasLevel) {
    const ktas = parseInt(patientData.ktasLevel.replace(/[^0-9]/g, ''), 10);
    if (ktas >= 1 && ktas <= 5) {
      validated.ktas = ktas;
    } else {
      errors.push('KTAS는 1-5등급 사이여야 합니다.');
    }
  }

  // 진료과 검증
  if (patientData.department && patientData.department.trim()) {
    validated.department = patientData.department.trim();
  }

  // 이름 검증
  if (patientData.name && patientData.name.trim()) {
    validated.name = patientData.name.trim();
  }

  // 성별 검증
  if (patientData.gender) {
    const genderMap = { '남': 1, '여': 2, '남성': 1, '여성': 2 };
    const sex = genderMap[patientData.gender];
    if (sex) {
      validated.sex = sex;
    }
  }

  // 연령대 검증
  if (patientData.ageRange) {
    const ageMap = {
      '신생아': 'NEWBORN', '유아': 'INFANT', '어린이': 'KIDS',
      '청소년': 'TEENAGER', '성인': 'ADULT', '노인': 'ELDERLY'
    };
    const mappedAge = ageMap[patientData.ageRange];
    if (mappedAge) {
      validated.ageRange = mappedAge;
    }
  }

  // 의료 정보 검증
  ['chiefComplaint', 'familyHistory', 'pastHistory', 'medications', 'vitalSigns'].forEach(field => {
    if (patientData[field]) {
      let value = patientData[field];
      
      // JSON 문자열인 경우 파싱
      if (typeof value === 'string' && (value.startsWith('{') || value.startsWith('['))) {
        try {
          const parsed = JSON.parse(value);
          if (Array.isArray(parsed) && parsed.length > 0) {
            value = parsed[0].name || parsed[0] || '';
          } else if (typeof parsed === 'object') {
            const values = Object.values(parsed).filter(v => v && v.trim);
            value = values.length > 0 ? values[0] : '';
          }
        } catch (e) {
          // 파싱 실패시 원본 문자열 사용
        }
      }
      
      if (typeof value === 'string' && value.trim()) {
        // 백엔드 필드명으로 매핑
        const fieldMap = {
          chiefComplaint: 'medicalRecord',
          medications: 'medicine'
        };
        const backendField = fieldMap[field] || field;
        validated[backendField] = value.trim();
      }
    }
  });

  // 주민등록번호, 국적 등
  if (patientData.rrn && patientData.rrn.trim()) {
    validated.rrn = patientData.rrn.trim();
  }
  
  if (patientData.nationality && patientData.nationality.trim()) {
    validated.nationality = patientData.nationality.trim();
  }

  return {
    isValid: errors.length === 0,
    errors,
    data: validated
  };
};

/**
 * 구급차 상태 한글 변환
 */
const getAmbulanceStatusText = (status) => {
  const statusMap = {
    'WAIT': '대기중',
    'DISPATCH': '출동중',
    'TRANSFER': '이송중',
    'standby': '대기중',
    'dispatched': '출동중',
    'transporting': '이송중',
    'completed': '완료',
    'maintenance': '정비중'
  };
  return statusMap[status] || '알 수 없음';
};

// === 메인 스토어 ===

const useEmergencyStore = create((set, get) => ({
  // === 기본 상태 ===
  selectedAmbulance: null,
  ambulances: [],
  isLoading: false,
  error: null,
  lastUpdated: null,

  // === 위치 관련 ===
  currentLocation: null,
  locationError: null,
  isLocationLoading: false,

  // === 병원 매칭 관련 ===
  matchedHospitals: [],
  hospitalMatchingStatus: 'idle', // idle, loading, success, error
  hospitalMatchingError: null,
  isHospitalMatching: false,

  // === 환자 정보 관련 ===
  patientInfo: {
    name: '',
    gender: '',
    ageRange: '',
    ktasLevel: '',
    department: ''
  },
  patientDetails: {
    medicalRecord: '',
    familyHistory: '',
    pastHistory: '',
    medicine: '',
    vitalSigns: '',
    rrn: '',
    nationality: ''
  },
  isPatientDataSaving: false,
  patientDataError: null,

  // === 실시간 업데이트 관련 ===
  lastDispatchNotification: null,
  dispatchHistory: [],
  realtimeUpdates: new Map(), // ambulanceId -> updateData

  // ======================================================================
  // 🚑 구급차 관련 액션들
  // ======================================================================

  /**
   * 구급차 목록 조회 (실제 API 호출)
   */
  fetchAmbulances: async () => {
    console.log('[Emergency Store] 구급차 목록 조회 시작');
    set({ isLoading: true, error: null });

    try {
      const authState = useAuthStore.getState();
      const currentUser = authState.user;
      const accessToken = authState.accessToken;

      if (!currentUser || !accessToken) {
        console.warn('[Emergency Store] 인증 정보 없음 - 더미 데이터로 대체');
        
        // 현재 사용자 기반 더미 구급차 데이터
        const dummyAmbulance = {
          id: currentUser?.userId || 1,
          carNumber: currentUser?.userKey || '구급차-01',
          userKey: currentUser?.userKey,
          currentStatus: 'WAIT',
          status: 'standby',
          priority: 'normal',
          location: '구미시 소재',
          lastUpdate: new Date().toISOString(),
          patientInfo: get().patientInfo,
          patientDetails: get().patientDetails
        };

        set({
          selectedAmbulance: dummyAmbulance,
          ambulances: [dummyAmbulance],
          isLoading: false,
          lastUpdated: new Date().toISOString()
        });
        return [dummyAmbulance];
      }

      // 실제 API 호출
      console.log('[Emergency Store] 실제 구급차 목록 API 호출');
      const ambulanceList = await getAmbulances();
      
      // 현재 사용자의 구급차만 필터링
      const userAmbulance = ambulanceList.find(amb => 
        amb.userKey === currentUser.userKey || amb.id === currentUser.userId
      );

      if (!userAmbulance) {
        throw new Error('사용자의 구급차 정보를 찾을 수 없습니다.');
      }

      // 환자 정보 보완
      const enrichedAmbulance = {
        ...userAmbulance,
        patientInfo: get().patientInfo,
        patientDetails: get().patientDetails,
        statusText: getAmbulanceStatusText(userAmbulance.currentStatus || userAmbulance.status)
      };

      set({
        selectedAmbulance: enrichedAmbulance,
        ambulances: [enrichedAmbulance],
        isLoading: false,
        lastUpdated: new Date().toISOString()
      });

      console.log('[Emergency Store] 구급차 목록 조회 성공:', enrichedAmbulance);
      return [enrichedAmbulance];

    } catch (error) {
      console.error('[Emergency Store] 구급차 목록 조회 실패:', error);
      
      const errorMessage = error.response?.data?.message || error.message || '구급차 정보를 불러오는데 실패했습니다.';
      
      set({
        error: errorMessage,
        isLoading: false
      });

      // 사용자에게 에러 알림
      alert(`❌ 구급차 정보 조회 실패\n${errorMessage}`);
      
      throw error;
    }
  },

  /**
   * 구급차 상태 업데이트 (소방서 배차와 연동)
   */
  updateAmbulanceStatus: async (ambulanceId, status) => {
    console.log(`[Emergency Store] 구급차 ${ambulanceId} 상태 변경: ${status}`);

    try {
      // API 호출
      await updateAmbulanceStatus(ambulanceId, status);
      
      // 로컬 상태 업데이트
      set(state => {
        const updatedAmbulances = state.ambulances.map(amb =>
          amb.id === ambulanceId 
            ? { 
                ...amb, 
                currentStatus: status.toUpperCase(),
                status: status.toLowerCase(),
                statusText: getAmbulanceStatusText(status),
                lastUpdate: new Date().toISOString()
              }
            : amb
        );

        const updatedSelected = state.selectedAmbulance?.id === ambulanceId
          ? updatedAmbulances.find(amb => amb.id === ambulanceId)
          : state.selectedAmbulance;

        return {
          ambulances: updatedAmbulances,
          selectedAmbulance: updatedSelected,
          lastUpdated: new Date().toISOString()
        };
      });

      // 성공 알림
      const statusText = getAmbulanceStatusText(status);
      alert(`✅ 구급차 상태가 '${statusText}'로 변경되었습니다.`);
      
      console.log(`[Emergency Store] 구급차 상태 변경 성공: ${status}`);

    } catch (error) {
      console.error('[Emergency Store] 구급차 상태 변경 실패:', error);
      
      const errorMessage = error.response?.data?.message || error.message || '구급차 상태 변경에 실패했습니다.';
      
      set({ error: errorMessage });
      alert(`❌ 구급차 상태 변경 실패\n${errorMessage}`);
      
      throw error;
    }
  },

  /**
   * 구급차 상세 정보 조회
   */
  fetchAmbulanceDetail: async (ambulanceId) => {
    console.log(`[Emergency Store] 구급차 ${ambulanceId} 상세 정보 조회`);

    try {
      const ambulanceDetail = await getAmbulanceDetail(ambulanceId);
      
      // 환자 정보가 있으면 스토어에 반영
      if (ambulanceDetail.patientInfo) {
        set(state => ({
          patientInfo: { ...state.patientInfo, ...ambulanceDetail.patientInfo },
          patientDetails: { ...state.patientDetails, ...ambulanceDetail.patientDetails }
        }));
      }

      console.log('[Emergency Store] 구급차 상세 정보 조회 성공:', ambulanceDetail);
      return ambulanceDetail;

    } catch (error) {
      console.error('[Emergency Store] 구급차 상세 정보 조회 실패:', error);
      
      const errorMessage = error.response?.data?.message || error.message || '구급차 상세 정보 조회에 실패했습니다.';
      set({ error: errorMessage });
      
      throw error;
    }
  },

  /**
   * 구급차 위치 조회
   */
  fetchAmbulanceLocation: async (ambulanceId) => {
    try {
      const locationData = await getAmbulanceLocation(ambulanceId);
      
      // 위치를 주소로 변환 (선택적)
      try {
        const addressInfo = await reverseGeocode(locationData.latitude, locationData.longitude);
        locationData.address = addressInfo.address;
      } catch (geocodeError) {
        console.warn('[Emergency Store] 주소 변환 실패, 좌표만 사용:', geocodeError.message);
      }

      console.log('[Emergency Store] 구급차 위치 조회 성공:', locationData);
      return locationData;

    } catch (error) {
      console.error('[Emergency Store] 구급차 위치 조회 실패:', error);
      throw error;
    }
  },

  // ======================================================================
  // 📍 위치 관련 액션들
  // ======================================================================

  /**
   * 현재 위치 조회 (GPS)
   */
  getCurrentLocation: async () => {
    console.log('[Emergency Store] GPS 위치 조회 시작');
    set({ isLocationLoading: true, locationError: null });

    try {
      const locationData = await getCurrentLocationFromDashboard();
      
      set({
        currentLocation: locationData,
        locationError: null,
        isLocationLoading: false
      });

      console.log('[Emergency Store] GPS 위치 조회 성공:', locationData);
      return locationData;

    } catch (error) {
      console.error('[Emergency Store] GPS 위치 조회 실패:', error);
      
      set({
        locationError: error.message,
        isLocationLoading: false
      });

      throw error;
    }
  },

  /**
   * 주소를 좌표로 변환
   */
  geocodeAddress: async (address) => {
    try {
      console.log('[Emergency Store] 주소 좌표 변환:', address);
      
      const result = await geocodeAddress(address);
      
      console.log('[Emergency Store] 주소 변환 성공:', result);
      return result;

    } catch (error) {
      console.error('[Emergency Store] 주소 변환 실패:', error);
      throw error;
    }
  },

  // ======================================================================
  // 👨‍⚕️ 환자 정보 관련 액션들
  // ======================================================================

  /**
   * 환자 기본 정보 업데이트
   */
  updatePatientInfo: (patientInfo) => {
    console.log('[Emergency Store] 환자 기본 정보 업데이트:', patientInfo);
    
    set(state => ({
      patientInfo: { ...state.patientInfo, ...patientInfo },
      selectedAmbulance: state.selectedAmbulance ? {
        ...state.selectedAmbulance,
        patientInfo: { ...state.selectedAmbulance.patientInfo, ...patientInfo }
      } : null
    }));
  },

  /**
   * 환자 상세 정보 업데이트
   */
  updatePatientDetails: (patientDetails) => {
    console.log('[Emergency Store] 환자 상세 정보 업데이트:', patientDetails);
    
    set(state => ({
      patientDetails: { ...state.patientDetails, ...patientDetails },
      selectedAmbulance: state.selectedAmbulance ? {
        ...state.selectedAmbulance,
        patientDetails: { ...state.selectedAmbulance.patientDetails, ...patientDetails }
      } : null
    }));
  },

  /**
   * 환자 필수 정보 저장 (KTAS, 진료과)
   */
  saveRequiredPatientInfo: async (requiredData) => {
    console.log('[Emergency Store] 환자 필수 정보 저장 시작:', requiredData);
    set({ isPatientDataSaving: true, patientDataError: null });

    try {
      // 데이터 검증
      const validation = validatePatientData(requiredData);
      if (!validation.isValid) {
        throw new Error(validation.errors.join(', '));
      }

      // KTAS와 진료과가 필수
      if (!validation.data.ktas || !validation.data.department) {
        throw new Error('KTAS와 진료과는 필수 입력 항목입니다.');
      }

      // 위치 정보 추가 (병원 매칭용)
      const currentLocation = get().currentLocation;
      let locationData = currentLocation;
      
      if (!locationData) {
        try {
          locationData = await get().getCurrentLocation();
        } catch (locationError) {
          console.warn('[Emergency Store] 위치 정보 없이 환자 정보 저장:', locationError.message);
        }
      }

      const apiData = {
        ...validation.data,
        ...(locationData && {
          latitude: locationData.latitude,
          longitude: locationData.longitude
        })
      };

      // API 호출
      await saveRequiredPatientInfo(apiData);

      // 로컬 상태 업데이트
      get().updatePatientInfo(requiredData);
      get().updatePatientDetails(requiredData);

      set({ isPatientDataSaving: false });

      // 병원 자동 매칭 트리거 (KTAS와 진료과가 있을 때)
      if (validation.data.ktas && validation.data.department && locationData) {
        const selectedAmbulance = get().selectedAmbulance;
        if (selectedAmbulance?.id) {
          console.log('[Emergency Store] 병원 자동 매칭 트리거');
          await get().triggerHospitalMatching(selectedAmbulance.id);
        }
      }

      console.log('[Emergency Store] 환자 필수 정보 저장 성공');
      return apiData;

    } catch (error) {
      console.error('[Emergency Store] 환자 필수 정보 저장 실패:', error);
      
      const errorMessage = error.response?.data?.message || error.message || '환자 정보 저장에 실패했습니다.';
      
      set({
        patientDataError: errorMessage,
        isPatientDataSaving: false
      });

      alert(`❌ 환자 정보 저장 실패\n${errorMessage}`);
      throw error;
    }
  },

  /**
   * 환자 선택 정보 저장
   */
  saveOptionalPatientInfo: async (optionalData) => {
    console.log('[Emergency Store] 환자 선택 정보 저장 시작:', optionalData);
    set({ isPatientDataSaving: true, patientDataError: null });

    try {
      // 데이터 검증
      const validation = validatePatientData(optionalData);
      if (!validation.isValid) {
        throw new Error(validation.errors.join(', '));
      }

      // 저장할 데이터가 있는지 확인
      if (Object.keys(validation.data).length === 0) {
        console.warn('[Emergency Store] 저장할 선택 정보가 없음');
        set({ isPatientDataSaving: false });
        return;
      }

      // API 호출
      await saveOptionalPatientInfo(validation.data);

      // 로컬 상태 업데이트
      get().updatePatientInfo(optionalData);
      get().updatePatientDetails(optionalData);

      set({ isPatientDataSaving: false });

      console.log('[Emergency Store] 환자 선택 정보 저장 성공');
      return validation.data;

    } catch (error) {
      console.error('[Emergency Store] 환자 선택 정보 저장 실패:', error);
      
      const errorMessage = error.response?.data?.message || error.message || '환자 정보 저장에 실패했습니다.';
      
      set({
        patientDataError: errorMessage,
        isPatientDataSaving: false
      });

      // 선택 정보는 실패해도 크리티컬하지 않으므로 alert 없이 로그만
      console.warn(`환자 선택 정보 저장 실패: ${errorMessage}`);
      throw error;
    }
  },

  /**
   * 환자 정보 조회
   */
  fetchPatientInfo: async (ambulanceId = null) => {
    try {
      console.log('[Emergency Store] 환자 정보 조회:', ambulanceId);
      
      const patientData = await getPatientInfo(ambulanceId);
      
      if (patientData) {
        set(state => ({
          patientInfo: { ...state.patientInfo, ...patientData },
          patientDetails: { ...state.patientDetails, ...patientData }
        }));
      }

      console.log('[Emergency Store] 환자 정보 조회 성공:', patientData);
      return patientData;

    } catch (error) {
      console.error('[Emergency Store] 환자 정보 조회 실패:', error);
      throw error;
    }
  },

  // ======================================================================
  // 🏥 병원 매칭 관련 액션들
  // ======================================================================

  /**
   * 병원 자동 매칭 요청
   */
  triggerHospitalMatching: async (ambulanceId) => {
    console.log(`[Emergency Store] 병원 자동 매칭 시작: ${ambulanceId}`);
    
    if (!ambulanceId) {
      throw new Error('구급차 ID가 필요합니다.');
    }

    set({
      isHospitalMatching: true,
      hospitalMatchingStatus: 'loading',
      hospitalMatchingError: null
    });

    try {
      // 현재 위치 확인
      let locationData = get().currentLocation;
      if (!locationData) {
        console.log('[Emergency Store] 위치 정보 없음, GPS 조회 시작');
        locationData = await get().getCurrentLocation();
      }

      if (!locationData || !locationData.latitude || !locationData.longitude) {
        throw new Error('위치 정보를 확인할 수 없습니다. GPS를 활성화해주세요.');
      }

      // 병원 매칭 요청
      const matchingData = {
        ambulanceId,
        latitude: locationData.latitude,
        longitude: locationData.longitude
      };

      console.log('[Emergency Store] 병원 매칭 API 호출:', matchingData);
      const matchingResult = await requestHospitalMatching(matchingData);

      if (!matchingResult || !matchingResult.hospitalId) {
        throw new Error('매칭 가능한 병원이 없습니다.');
      }

      // 병원과의 거리 계산
      let distance = null;
      if (matchingResult.latitude && matchingResult.longitude) {
        try {
          const distanceResult = await calculateDistance(
            { latitude: locationData.latitude, longitude: locationData.longitude },
            { latitude: matchingResult.latitude, longitude: matchingResult.longitude }
          );
          distance = distanceResult.distance;
        } catch (distanceError) {
          console.warn('[Emergency Store] 거리 계산 실패:', distanceError.message);
        }
      }

      // 매칭된 병원 정보 구성
      const hospitalData = {
        id: matchingResult.hospitalId,
        hospitalId: matchingResult.hospitalId,
        name: matchingResult.name || '매칭된 병원',
        address: matchingResult.address || '주소 확인 중',
        distance: distance ? `${(distance / 1000).toFixed(1)}km` : '거리 계산 중',
        eta: distance ? `약 ${Math.ceil(distance / 1000 * 2)}분` : '소요시간 계산 중',
        departments: [get().patientDetails.department || '응급의학과'],
        availableBeds: '확인 중',
        emergencyLevel: 'Level1',
        isAvailable: true,
        latitude: matchingResult.latitude || 37.5799,
        longitude: matchingResult.longitude || 126.9988,
        matchedAt: new Date().toISOString()
      };

      set({
        matchedHospitals: [hospitalData],
        hospitalMatchingStatus: 'success',
        hospitalMatchingError: null,
        isHospitalMatching: false
      });

      // 성공 알림
      alert(`✅ 병원 매칭 성공!\n${hospitalData.name}\n거리: ${hospitalData.distance}`);

      console.log('[Emergency Store] 병원 매칭 성공:', hospitalData);
      return matchingResult;

    } catch (error) {
      console.error('[Emergency Store] 병원 매칭 실패:', error);
      
      const errorMessage = error.response?.data?.message || error.message || '병원 매칭에 실패했습니다.';
      
      set({
        hospitalMatchingStatus: 'error',
        hospitalMatchingError: errorMessage,
        isHospitalMatching: false,
        matchedHospitals: []
      });

      alert(`❌ 병원 매칭 실패\n${errorMessage}`);
      throw error;
    }
  },

  /**
   * 기존 병원 매칭 상태 확인
   */
  checkHospitalMatchingStatus: async (ambulanceId) => {
    if (!ambulanceId) return;

    try {
      console.log(`[Emergency Store] 병원 매칭 상태 확인: ${ambulanceId}`);
      
      const statusResult = await getMatchedHospital(ambulanceId);

      if (statusResult && statusResult.hospitalId) {
        const hospitalData = {
          id: statusResult.hospitalId,
          hospitalId: statusResult.hospitalId,
          name: statusResult.name || '기존 매칭 병원',
          address: statusResult.address || '주소 확인 중',
          distance: '기존 매칭',
          eta: '기존 매칭',
          departments: ['응급의학과'],
          availableBeds: '확인 중',
          emergencyLevel: 'Level1',
          isAvailable: true,
          latitude: statusResult.latitude || 37.5799,
          longitude: statusResult.longitude || 126.9988,
          isExistingMatch: true
        };

        set({
          matchedHospitals: [hospitalData],
          hospitalMatchingStatus: 'success',
          hospitalMatchingError: null
        });

        console.log('[Emergency Store] 기존 매칭 병원 확인:', hospitalData);
      } else {
        set({
          matchedHospitals: [],
          hospitalMatchingStatus: 'idle',
          hospitalMatchingError: null
        });

        console.log('[Emergency Store] 기존 매칭 병원 없음');
      }

      return statusResult;

    } catch (error) {
      if (error.response?.status === 404) {
        // 404는 정상 상황 (매칭된 병원 없음)
        set({
          matchedHospitals: [],
          hospitalMatchingStatus: 'idle',
          hospitalMatchingError: null
        });
      } else {
        console.error('[Emergency Store] 병원 매칭 상태 확인 실패:', error);
        set({
          hospitalMatchingStatus: 'error',
          hospitalMatchingError: '매칭 상태 확인에 실패했습니다.'
        });
      }
    }
  },

  /**
   * 병원 매칭 취소/리셋
   */
  resetHospitalMatching: () => {
    console.log('[Emergency Store] 병원 매칭 초기화');
    
    set({
      matchedHospitals: [],
      hospitalMatchingStatus: 'idle',
      hospitalMatchingError: null,
      isHospitalMatching: false
    });
  },

  // ======================================================================
  // 🚨 출동 관련 액션들 (소방서와 연동)
  // ======================================================================

  /**
   * 출동 기록 조회
   */
  fetchDispatchHistory: async () => {
    try {
      console.log('[Emergency Store] 출동 기록 조회');
      
      const history = await getDispatchHistory();
      
      set({
        dispatchHistory: history || [],
        lastUpdated: new Date().toISOString()
      });

      console.log('[Emergency Store] 출동 기록 조회 성공:', history?.length, '건');
      return history;

    } catch (error) {
      console.error('[Emergency Store] 출동 기록 조회 실패:', error);
      throw error;
    }
  },

  /**
   * 소방서 배차 알림 처리 (WebSocket에서 호출)
   */
  handleDispatchNotification: (dispatchData) => {
    console.log('[Emergency Store] 소방서 배차 알림 수신:', dispatchData);
    
    const notification = {
      id: Date.now(),
      type: 'dispatch',
      title: '출동 지시',
      message: `출동 지시가 접수되었습니다.`,
      address: dispatchData.address,
      condition: dispatchData.condition,
      priority: dispatchData.priority || 'normal',
      hospitalId: dispatchData.hospitalId,
      timestamp: new Date().toISOString(),
      isRead: false
    };

    set({
      lastDispatchNotification: notification
    });

    // 구급차 상태 자동 업데이트
    const selectedAmbulance = get().selectedAmbulance;
    if (selectedAmbulance?.id && dispatchData.ambulanceIds?.includes(selectedAmbulance.id)) {
      get().updateAmbulanceStatus(selectedAmbulance.id, 'dispatch');
    }

    // 사용자 알림
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('🚑 출동 지시', {
        body: `${dispatchData.address}\n${dispatchData.condition}`,
        icon: '/ambulance-icon.png',
        badge: '/ambulance-badge.png'
      });
    } else {
      alert(`🚑 출동 지시 접수\n주소: ${dispatchData.address}\n상태: ${dispatchData.condition}`);
    }
  },

  // ======================================================================
  // 📊 통계 및 유틸리티
  // ======================================================================

  /**
   * 구급차 통계 조회
   */
  getStatistics: () => {
    const ambulances = get().ambulances;
    const dispatched = ambulances.filter(amb => 
      ['DISPATCH', 'dispatched', 'transporting'].includes(amb.currentStatus || amb.status)
    );
    const available = ambulances.filter(amb => 
      ['WAIT', 'standby', 'completed'].includes(amb.currentStatus || amb.status)
    );

    return {
      total: ambulances.length,
      dispatched: dispatched.length,
      available: available.length,
      emergency: ambulances.filter(amb => amb.priority === '응급').length,
      urgent: ambulances.filter(amb => amb.priority === '긴급').length,
      normal: ambulances.filter(amb => amb.priority === '보통').length
    };
  },

  /**
   * 구급차 ID로 조회
   */
  getAmbulanceById: (ambulanceId) => {
    return get().ambulances.find(amb => amb.id === ambulanceId);
  },

  /**
   * 출동 중인 구급차 목록
   */
  getDispatchedAmbulances: () => {
    return get().ambulances.filter(amb => 
      ['DISPATCH', 'dispatched', 'transporting'].includes(amb.currentStatus || amb.status)
    );
  },

  /**
   * 대기 중인 구급차 목록
   */
  getAvailableAmbulances: () => {
    return get().ambulances.filter(amb => 
      ['WAIT', 'standby', 'completed'].includes(amb.currentStatus || amb.status)
    );
  },

  /**
   * 에러 클리어
   */
  clearError: () => {
    set({ error: null, patientDataError: null, locationError: null, hospitalMatchingError: null });
  },

  /**
   * 전체 상태 초기화
   */
  reset: () => {
    console.log('[Emergency Store] 전체 상태 초기화');
    
    set({
      selectedAmbulance: null,
      ambulances: [],
      isLoading: false,
      error: null,
      lastUpdated: null,
      currentLocation: null,
      locationError: null,
      isLocationLoading: false,
      matchedHospitals: [],
      hospitalMatchingStatus: 'idle',
      hospitalMatchingError: null,
      isHospitalMatching: false,
      patientInfo: {
        name: '',
        gender: '',
        ageRange: '',
        ktasLevel: '',
        department: ''
      },
      patientDetails: {
        medicalRecord: '',
        familyHistory: '',
        pastHistory: '',
        medicine: '',
        vitalSigns: '',
        rrn: '',
        nationality: ''
      },
      isPatientDataSaving: false,
      patientDataError: null,
      lastDispatchNotification: null,
      dispatchHistory: [],
      realtimeUpdates: new Map()
    });
  },

  // ======================================================================
  // 🔧 디버깅 및 테스트 함수들
  // ======================================================================

  /**
   * 현재 상태 디버깅
   */
  debugCurrentState: () => {
    const state = get();
    const authState = useAuthStore.getState();
    
    console.log('=== Emergency Store Debug ===');
    console.log('Selected Ambulance:', state.selectedAmbulance);
    console.log('Ambulances:', state.ambulances);
    console.log('Current Location:', state.currentLocation);
    console.log('Matched Hospitals:', state.matchedHospitals);
    console.log('Patient Info:', state.patientInfo);
    console.log('Patient Details:', state.patientDetails);
    console.log('Auth State:', authState);
    console.log('=============================');
    
    return { emergencyState: state, authState };
  },

  /**
   * 병원 매칭 테스트
   */
  testHospitalMatching: async (testData) => {
    try {
      console.log('[Test] 병원 매칭 테스트:', testData);
      
      const result = await requestHospitalMatching(testData);
      
      console.log('[Test] 병원 매칭 테스트 성공:', result);
      return result;

    } catch (error) {
      console.error('[Test] 병원 매칭 테스트 실패:', error);
      throw error;
    }
  },

  /**
   * 환자 데이터 검증 테스트
   */
  testPatientDataValidation: (testData) => {
    const validation = validatePatientData(testData);
    
    console.log('[Test] 환자 데이터 검증 결과:', validation);
    return validation;
  }
}));

// ======================================================================
// 📡 실시간 업데이트 리스너 (WebSocket 연결시 활성화)
// ======================================================================

// WebSocket 연결이 구현되면 이 함수들을 사용
export const setupRealtimeListeners = (ambulanceId) => {
  console.log(`[Emergency Store] 구급차 ${ambulanceId} 실시간 리스너 설정`);
  
  // WebSocket 연결 및 리스너 설정
  // 구급차 상태 변경, 출동 지시, 병원 매칭 등의 실시간 이벤트 처리
  
  return () => {
    console.log(`[Emergency Store] 구급차 ${ambulanceId} 실시간 리스너 해제`);
    // WebSocket 연결 해제
  };
};

export default useEmergencyStore;
