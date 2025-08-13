import { create } from "zustand";
import {
  getAmbulances,
  updateAmbulanceStatus,
  getAmbulanceLocation,
  saveRequiredPatientInfo,
  saveOptionalPatientInfo,
  getPatientInfo,
  requestHospitalMatching,
  getMatchedHospital,
  getHospitals,
  geocodeAddress,
  reverseGeocode,
  calculateDistance,
  getMyAmbulanceStatus,
  getMyAmbulancePatientInfo,
  generateReport,
} from "../api/api";
import { useAuthStore } from "./useAuthStore";

// === 유틸리티 함수들 ===
const getCurrentLocationFromDashboard = () => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('이 기기에서는 GPS를 지원하지 않습니다.'));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        const locationData = { latitude, longitude, accuracy, timestamp: new Date().toISOString(), source: 'gps' };
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
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 60000 }
    );
  });
};

const validatePatientData = (patientData) => {
  if (!patientData || typeof patientData !== 'object') {
    return { isValid: false, errors: ['환자 정보가 유효하지 않습니다.'] };
  }
  const errors = [];
  const validated = {};
  if (patientData.ktasLevel) {
    const ktas = parseInt(patientData.ktasLevel.replace(/[^0-9]/g, ''), 10);
    if (ktas >= 1 && ktas <= 5) {
      validated.ktas = ktas;
    } else {
      errors.push('KTAS는 1-5등급 사이여야 합니다.');
    }
  }
  if (patientData.department && patientData.department.trim()) {
    validated.department = patientData.department.trim();
  }
  if (patientData.name && patientData.name.trim()) {
    validated.name = patientData.name.trim();
  }
  if (patientData.gender) {
    const genderMap = { '남': 1, '여': 2, '남성': 1, '여성': 2 };
    const sex = genderMap[patientData.gender];
    if (sex) {
      validated.sex = sex;
    }
  }
  if (patientData.ageRange) {
    const ageMap = {
      '신생아': 'NEWBORN', '유아': 'INFANT', '아동': 'KIDS',
      '청소년': 'TEENAGER', '성인': 'ADULT', '노인': 'ELDERLY'
    };
    const mappedAge = ageMap[patientData.ageRange];
    if (mappedAge) {
      validated.ageRange = mappedAge;
    }
  }
  ['chiefComplaint', 'familyHistory', 'pastHistory', 'medications', 'vitalSigns'].forEach(field => {
    if (patientData[field]) {
      let value = patientData[field];
      if (typeof value === 'string' && (value.startsWith('{') || value.startsWith('['))) {
        try {
          const parsed = JSON.parse(value);
          if (Array.isArray(parsed) && parsed.length > 0) {
            value = parsed[0].name || parsed[0] || '';
          } else if (typeof parsed === 'object') {
            const values = Object.values(parsed).filter(v => v && v.trim);
            value = values.length > 0 ? values[0] : '';
          }
        } catch (e) { }
      }
      if (typeof value === 'string' && value.trim()) {
        const fieldMap = { chiefComplaint: 'medicalRecord', medications: 'medicine' };
        const backendField = fieldMap[field] || field;
        validated[backendField] = value.trim();
      }
    }
  });
  if (patientData.rrn && patientData.rrn.trim()) {
    validated.rrn = patientData.rrn.trim();
  }
  if (patientData.nationality && patientData.nationality.trim()) {
    validated.nationality = patientData.nationality.trim();
  }
  return { isValid: errors.length === 0, errors, data: validated };
};

const getAmbulanceStatusText = (status) => {
  const statusMap = {
    'WAIT': '대기중', 'DISPATCH': '출동중', 'TRANSFER': '이송중',
    'standby': '대기중', 'dispatched': '출동중', 'transporting': '이송중',
    'completed': '완료', 'maintenance': '정비중'
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

  selectMyAmbulance: async () => {
    const { user } = useAuthStore.getState();
    if (!user || (user.role !== 'ambulance' && user.userType !== 'ambulance')) {
        console.warn("[Emergency Store] 구급차 사용자가 아니거나 사용자 정보가 없습니다.");
        return;
    }
    set({ isLoading: true, error: null });
    try {
        const ambulanceStatusResponse = await getMyAmbulanceStatus();
        const myAmbulanceStatus = ambulanceStatusResponse.ambCurrentStatus || 'wait';
        const dispatchInfoResponse = await getMyAmbulancePatientInfo();
        const updatedAmbulance = {
            id: user.userId,
            userKey: user.userKey,
            carNumber: user.userKey,
            currentStatus: myAmbulanceStatus.toUpperCase(),
            status: myAmbulanceStatus.toLowerCase(),
            pAddress: dispatchInfoResponse?.address,
            pCondition: dispatchInfoResponse?.condition,
            pLatitude: dispatchInfoResponse?.latitude,
            pLongitude: dispatchInfoResponse?.longitude,
            patientInfo: get().patientInfo,
            patientDetails: get().patientDetails,
        };
        set({ selectedAmbulance: updatedAmbulance, ambulances: [updatedAmbulance], isLoading: false, error: null });
    } catch (error) {
        console.error("[useEmergencyStore] 내 구급차 정보 조회 실패:", error);
        set({ isLoading: false, error: error.message || '내 구급차 정보 조회 실패' });
    }
  },

  fetchAmbulances: async () => {
    set({ isLoading: true, error: null });
    try {
      const ambulanceList = await getAmbulances();
      set({ ambulances: ambulanceList, isLoading: false });
      return ambulanceList;
    } catch (error) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  updateAmbulanceStatus: async (ambulanceId, status) => {
    try {
      await updateAmbulanceStatus(ambulanceId, status);
      set(state => {
        const updatedAmbulances = state.ambulances.map(amb =>
          amb.id === ambulanceId 
            ? { ...amb, currentStatus: status.toUpperCase(), status: status.toLowerCase(), statusText: getAmbulanceStatusText(status), lastUpdate: new Date().toISOString() }
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
      const statusText = getAmbulanceStatusText(status);
      console.log(`[Emergency Store] 구급차 상태 변경 성공: ${statusText}`);
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || '구급차 상태 변경에 실패했습니다.';
      set({ error: errorMessage });
      alert(`❌ 구급차 상태 변경 실패\n${errorMessage}`);
      throw error;
    }
  },

  fetchAmbulanceDetail: async (ambulanceId) => {
    try {
      const ambulanceDetail = await getAmbulanceDetail(ambulanceId);
      if (ambulanceDetail.patientInfo) {
        set(state => ({
          patientInfo: { ...state.patientInfo, ...ambulanceDetail.patientInfo },
          patientDetails: { ...state.patientDetails, ...ambulanceDetail.patientDetails }
        }));
      }
      return ambulanceDetail;
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || '구급차 상세 정보 조회에 실패했습니다.';
      set({ error: errorMessage });
      throw error;
    }
  },

  fetchAmbulanceLocation: async (ambulanceId) => {
    try {
      const locationData = await getAmbulanceLocation(ambulanceId);
      try {
        const addressInfo = await reverseGeocode(locationData.latitude, locationData.longitude);
        locationData.address = addressInfo.address;
      } catch (geocodeError) {
        console.warn('[Emergency Store] 주소 변환 실패, 좌표만 사용:', geocodeError.message);
      }
      return locationData;
    } catch (error) {
      throw error;
    }
  },

  getCurrentLocation: async () => {
    set({ isLocationLoading: true, locationError: null });
    try {
      const locationData = await getCurrentLocationFromDashboard();
      set({ currentLocation: locationData, locationError: null, isLocationLoading: false });
      return locationData;
    } catch (error) {
      set({ locationError: error.message, isLocationLoading: false });
      throw error;
    }
  },

  geocodeAddress: async (address) => {
    try {
      return await geocodeAddress(address);
    } catch (error) {
      throw error;
    }
  },
  
  updatePatientInfo: (patientInfo) => {
    set(state => ({
      patientInfo: { ...state.patientInfo, ...patientInfo },
      selectedAmbulance: state.selectedAmbulance ? { ...state.selectedAmbulance, patientInfo: { ...state.selectedAmbulance.patientInfo, ...patientInfo } } : null
    }));
  },
  
  updatePatientDetails: (patientDetails) => {
    set(state => ({
      patientDetails: { ...state.patientDetails, ...patientDetails },
      selectedAmbulance: state.selectedAmbulance ? { ...state.selectedAmbulance, patientDetails: { ...state.selectedAmbulance.patientDetails, ...patientDetails } } : null
    }));
  },
  
  saveRequiredPatientInfo: async (requiredData) => {
    set({ isPatientDataSaving: true, patientDataError: null });
    try {
      const validation = validatePatientData(requiredData);
      if (!validation.isValid) throw new Error(validation.errors.join(', '));
      if (!validation.data.ktas || !validation.data.department) throw new Error('KTAS와 진료과는 필수 입력 항목입니다.');
      const locationData = get().currentLocation || await get().getCurrentLocation();
      const apiData = { ...validation.data, ...(locationData && { latitude: locationData.latitude, longitude: locationData.longitude }) };
      await saveRequiredPatientInfo(apiData);
      get().updatePatientInfo(requiredData);
      get().updatePatientDetails(requiredData);
      set({ isPatientDataSaving: false });
      if (validation.data.ktas && validation.data.department && locationData) {
        const selectedAmbulance = get().selectedAmbulance;
        if (selectedAmbulance?.id) await get().triggerHospitalMatching(selectedAmbulance.id);
      }
      return apiData;
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || '환자 정보 저장에 실패했습니다.';
      set({ patientDataError: errorMessage, isPatientDataSaving: false });
      alert(`❌ 환자 정보 저장 실패\n${errorMessage}`);
      throw error;
    }
  },
  
  saveOptionalPatientInfo: async (optionalData) => {
    set({ isPatientDataSaving: true, patientDataError: null });
    try {
      const validation = validatePatientData(optionalData);
      if (!validation.isValid) throw new Error(validation.errors.join(', '));
      if (Object.keys(validation.data).length === 0) {
        set({ isPatientDataSaving: false });
        return;
      }
      await saveOptionalPatientInfo(validation.data);
      get().updatePatientInfo(optionalData);
      get().updatePatientDetails(optionalData);
      set({ isPatientDataSaving: false });
      return validation.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || '환자 정보 저장에 실패했습니다.';
      set({ patientDataError: errorMessage, isPatientDataSaving: false });
      throw error;
    }
  },
  
  fetchPatientInfo: async (ambulanceId = null) => {
    try {
      const patientData = await getPatientInfo(ambulanceId);
      if (patientData) {
        set(state => ({
          patientInfo: { ...state.patientInfo, ...patientData },
          patientDetails: { ...state.patientDetails, ...patientData }
        }));
      }
      return patientData;
    } catch (error) {
      throw error;
    }
  },
  
  triggerHospitalMatching: async (ambulanceId) => {
    if (!ambulanceId) throw new Error('구급차 ID가 필요합니다.');
    set({ isHospitalMatching: true, hospitalMatchingStatus: 'loading', hospitalMatchingError: null });
    try {
      const locationData = get().currentLocation || await get().getCurrentLocation();
      if (!locationData?.latitude || !locationData?.longitude) throw new Error('위치 정보를 확인할 수 없습니다. GPS를 활성화해주세요.');
      const matchingData = { ambulanceId, latitude: locationData.latitude, longitude: locationData.longitude };
      const matchingResult = await requestHospitalMatching(matchingData);
      if (!matchingResult?.hospitalId) throw new Error('매칭 가능한 병원이 없습니다.');
      
      let distance = null;
      if (matchingResult.latitude && matchingResult.longitude) {
        try {
          const distanceResult = await calculateDistance({ latitude: locationData.latitude, longitude: locationData.longitude }, { latitude: matchingResult.latitude, longitude: matchingResult.longitude });
          distance = distanceResult.distance;
        } catch (distanceError) {
          console.warn('[Emergency Store] 거리 계산 실패:', distanceError.message);
        }
      }
      
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
      
      set({ matchedHospitals: [hospitalData], hospitalMatchingStatus: 'success', hospitalMatchingError: null, isHospitalMatching: false });
      alert(`✅ 병원 매칭 성공!\n${hospitalData.name}\n거리: ${hospitalData.distance}`);
      return matchingResult;
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || '병원 매칭에 실패했습니다.';
      set({ hospitalMatchingStatus: 'error', hospitalMatchingError: errorMessage, isHospitalMatching: false, matchedHospitals: [] });
      alert(`❌ 병원 매칭 실패\n${errorMessage}`);
      throw error;
    }
  },
  
  resetHospitalMatching: () => {
    set({ matchedHospitals: [], hospitalMatchingStatus: 'idle', hospitalMatchingError: null, isHospitalMatching: false });
  },
  
  /**
   * 🔥 수정된 이송 완료 함수
   * 페이지 이동을 먼저 처리하고, API 통신을 백그라운드에서 수행합니다.
   * @param {function | null} navigate - React Router의 navigate 함수 (선택 사항)
   */
  completeTransport: async (navigate = null) => {
    const { selectedAmbulance } = get();
    if (!selectedAmbulance) {
      alert('구급차 정보가 없습니다.');
      return;
    }

    // 1. 사용자 경험을 위해 즉시 상태를 변경하고 페이지를 이동시킴
    alert('✅ 이송 완료 처리되었습니다. 잠시 후 대기 상태로 전환됩니다.');
    set(state => ({
      selectedAmbulance: {
        ...state.selectedAmbulance,
        currentStatus: 'WAIT',
        status: 'wait',
        patientInfo: { name: '', gender: '', ageRange: '', ktasLevel: '', department: '' },
        patientDetails: { medicalRecord: '', familyHistory: '', pastHistory: '', medicine: '', vitalSigns: '', rrn: '', nationality: '' },
      },
      matchedHospitals: [],
      hospitalMatchingStatus: 'idle',
    }));

    if (navigate) {
      navigate('/emergency/waiting', { replace: true });
    }

    // 2. 백그라운드에서 API 통신 시도
    try {
      try {
        console.log('📝 AI 보고서 생성을 시작합니다...');
        const report = await generateReport();
        console.log(`✅ 보고서 생성 완료: ${report.reportId}`);
      } catch (reportError) {
        console.error('⚠️ 보고서 생성 실패:', reportError);
        alert(`⚠️ 보고서 생성에 실패했습니다: ${reportError.message}`);
      }
      
      await updateAmbulanceStatus(selectedAmbulance.id, 'wait');
      console.log('✅ 구급차 상태가 서버에 "대기"로 업데이트되었습니다.');

    } catch (error) {
      console.error('❌ 이송 완료 백그라운드 처리 실패:', error);
      alert('❌ 서버에 이송 완료 상태를 저장하는 데 실패했습니다: ' + error.message);
    }
  },
  
  transferToHospital: async () => {
    const { selectedAmbulance } = get();
    if (!selectedAmbulance) {
      alert('구급차 정보가 없습니다.');
      return;
    }
    const currentStatus = (selectedAmbulance.currentStatus || selectedAmbulance.status)?.toLowerCase();
    if (currentStatus !== 'dispatch' && currentStatus !== 'dispatched') {
      alert('환자를 태우기 전에는 상태를 변경할 수 없습니다.');
      return;
    }
    try {
      await updateAmbulanceStatus(selectedAmbulance.id, 'transfer');
      set(state => ({
        selectedAmbulance: { ...state.selectedAmbulance, currentStatus: 'TRANSFER', status: 'transfer' }
      }));
      alert('✅ 환자를 태우고 병원으로 이송을 시작합니다.');
    } catch (error) {
      set({ error: error.message });
      alert('❌ 이송 상태 변경 실패: ' + error.message);
    }
  },
}));

export default useEmergencyStore;