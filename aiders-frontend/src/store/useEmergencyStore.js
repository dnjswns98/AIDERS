import { create } from "zustand";
import {
  getAmbulances,
  updateAmbulanceStatus,
  getAmbulanceLocation,
  saveRequiredPatientInfo as saveRequiredPatientInfoApi,
  saveOptionalPatientInfo as saveOptionalPatientInfoApi,
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
  completeTransport as completeTransportApi,
} from "../api/api";
import { useAuthStore } from "./useAuthStore";
import useWebRtcStore from "./useWebRtcStore";

// === 유틸리티 함수들 ===
const getCurrentLocationFromDashboard = () => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("이 기기에서는 GPS를 지원하지 않습니다."));
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
          source: "gps",
        };
        console.log("[GPS] 위치 조회 성공:", locationData);
        resolve(locationData);
      },
      (error) => {
        let errorMessage = "GPS 위치 조회에 실패했습니다.";
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = "GPS 권한이 거부되었습니다. 설정에서 위치 권한을 허용해주세요.";
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = "GPS 위치를 확인할 수 없습니다. 실외에서 다시 시도해주세요.";
            break;
          case error.TIMEOUT:
            errorMessage = "GPS 위치 조회 시간이 초과되었습니다. 다시 시도해주세요.";
            break;
        }
        console.error("[GPS] 위치 조회 실패:", error);
        reject(new Error(errorMessage));
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 60000 }
    );
  });
};

const ageRangeMap = {
  '영아': 'NEWBORN',
  '유아': 'INFANT',
  '아동': 'KIDS',
  '청소년': 'TEENAGER',
  '청년': 'ADULT',
  '중년': 'ADULT',
  '노년': 'ELDERLY'
};

const convertFormDataForApi = (formData) => {
  console.log('🔥🔥🔥 [convertFormDataForApi] 입력:', formData);
 
  let processedAgeRange = null;
  if (formData.ageRange) {
    const ageKey = formData.ageRange.split(' ')[0].replace(/[^가-힣]/g, '');
    processedAgeRange = ageRangeMap[ageKey] || null;
  }

  let processedSex = null;
  if (formData.gender === '남성') {
    processedSex = 1;
  } else if (formData.gender === '여성') {
    processedSex = 0;
  }

  const apiData = {
    ktas: formData.ktasLevel ? parseInt(formData.ktasLevel) : null,
    department: formData.department || null,
    sex: processedSex,
    ageRange: processedAgeRange,
    medicalRecord: formData.chiefComplaint || null,
    familyHistory: formData.familyHistory || null,
    pastHistory: formData.pastHistory || null,
    medicine: formData.medications || null,
    name: formData.name || null,
    rrn: formData.rrn || null,
    nationality: formData.nationality || null,
    vitalSigns: formData.vitalSigns || null
  };

  if (formData.treatmentDetails && formData.chiefComplaint) {
    apiData.medicalRecord = `${formData.chiefComplaint}\n\n[현장처치] ${formData.treatmentDetails}`;
  } else if (formData.treatmentDetails) {
    apiData.medicalRecord = `[현장처치] ${formData.treatmentDetails}`;
  }

  console.log('🔥🔥🔥 [convertFormDataForApi] 최종 데이터:', JSON.stringify(apiData, null, 2));
  return apiData;
};

const getAmbulanceStatusText = (status) => {
  const statusMap = {
    WAIT: "대기중",
    DISPATCH: "출동중",
    TRANSFER: "이송중",
    standby: "대기중",
    dispatched: "출동중",
    transporting: "이송중",
    completed: "완료",
    maintenance: "정비중",
  };
  return statusMap[status] || "알 수 없음";
};

// === 메인 스토어 ===
const useEmergencyStore = create((set, get) => ({
  selectedAmbulance: null,
  ambulances: [],
  isLoading: false,
  error: null,
  lastUpdated: null,
  currentLocation: null,
  locationError: null,
  isLocationLoading: false,
  matchedHospitals: [],
  hospitalMatchingStatus: "idle",
  hospitalMatchingError: null,
  isHospitalMatching: false,
  
  isEditMode: false,
  setEditMode: (isEdit) => {
    console.log(`🔥 [setEditMode] 수정 모드 상태 변경: ${isEdit}`);
    if (isEdit) {
      set({ 
        isEditMode: true, 
        hospitalMatchingStatus: "idle", 
        hospitalMatchingError: null,
        isHospitalMatching: false 
      });
    } else {
      set({ isEditMode: false });
    }
  },
  
  patientInfo: {
    name: "",
    gender: "",
    ageRange: "",
  },
  patientDetails: {
    ktasLevel: "",
    department: "",
    medicalRecord: "",
    familyHistory: "",
    pastHistory: "",
    medicine: "",
    vitalSigns: "",
    rrn: "",
    nationality: "",
  },
  isPatientDataSaving: false,
  patientDataError: null,
  lastDispatchNotification: null,
  dispatchHistory: [],
  realtimeUpdates: new Map(),

  // <<<<<<<< 추가된 함수 및 수정된 함수 >>>>>>>>
  isCallActive: false,
  callInfo: null,
  isRequestInProgress: false,

  // 오류 해결을 위해 추가된 함수
  updateAmbulanceCallStatus: (ambulanceId, isCallActive) => {
    set((state) => ({
      ambulances: state.ambulances.map((amb) =>
        amb.id === ambulanceId ? { ...amb, isCallActive } : amb
      ),
    }));
  },

  // 화상 통화 시작 함수
  startVideoCall: async (ambulance) => {
    if (get().isRequestInProgress) return;
    set({ isRequestInProgress: true, error: null });
    try {
      set({
        isCallActive: true,
        callInfo: {
          sessionId: ambulance.sessionId,
          ambulanceNumber: ambulance.ambulanceNumber,
          hospitalId: ambulance.hospitalId,
          patientName: ambulance.patientName,
          ktas: ambulance.ktas,
        },
        selectedAmbulance: ambulance,
      });
      get().updateAmbulanceCallStatus(ambulance.id, true);
    } catch (error) {
      console.error('[startVideoCall] Error starting video call:', error);
      set({ error: 'Failed to start video call', isCallActive: false, callInfo: null });
    } finally {
      set({ isRequestInProgress: false });
    }
  },
  
  // 화상 통화 종료 함수
  endVideoCall: () => {
    const { selectedAmbulance } = get();
    if (selectedAmbulance) {
      get().updateAmbulanceCallStatus(selectedAmbulance.id, false);
    }
    set({
      isCallActive: false,
      callInfo: null,
      selectedAmbulance: null,
    });
  },
  // <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<

  _fetchAndSetPatientInfo: async () => {
    try {
      const dbPatientInfo = await getPatientInfo();
      if (dbPatientInfo) {
        console.log("✅ DB에서 환자 정보 조회 성공:", dbPatientInfo);
        
        const ageRangeLabel = Object.entries(ageRangeMap).find(([key, value]) => value === dbPatientInfo.ageRange)?.[0] || '';
        const ageRangeOptions = [ "영아 (0-1세)", "유아 (2-7세)", "아동 (8-13세)", "청소년 (14-19세)", "청년 (20-39세)", "중년 (40-64세)", "노년 (65세 이상)"];
        const fullAgeRangeLabel = ageRangeOptions.find(opt => opt.startsWith(ageRangeLabel)) || '';

        const patientInfo = {
          name: dbPatientInfo.name || '',
          gender: dbPatientInfo.sex === 1 ? '남성' : dbPatientInfo.sex === 0 ? '여성' : '',
          ageRange: fullAgeRangeLabel,
        };

        const patientDetails = {
          ktasLevel: dbPatientInfo.ktas ? String(dbPatientInfo.ktas) : '',
          department: dbPatientInfo.department || '',
          chiefComplaint: dbPatientInfo.medicalRecord || '',
          familyHistory: dbPatientInfo.familyHistory || '',
          pastHistory: dbPatientInfo.pastHistory || '',
          medications: dbPatientInfo.medicine || '',
          vitalSigns: dbPatientInfo.vitalSigns || '',
          rrn: dbPatientInfo.rrn || '',
          nationality: dbPatientInfo.nationality || '',
        };

        set(state => ({
          patientInfo,
          patientDetails,
          selectedAmbulance: state.selectedAmbulance ? {
            ...state.selectedAmbulance,
            patientInfo: { ...state.selectedAmbulance.patientInfo, ...patientInfo },
            patientDetails: { ...state.selectedAmbulance.patientDetails, ...patientDetails },
          } : null
        }));
      }
    } catch (error) {
      console.error("⚠️ DB에서 환자 정보 조회 실패:", error);
    }
  },

  selectMyAmbulance: async (skipPatientInfoLoad = false) => {
    const { user } = useAuthStore.getState();
    if (!user || (user.role !== "ambulance" && user.userType !== "ambulance")) {
      console.warn("[Emergency Store] 구급차 사용자가 아니거나 사용자 정보가 없습니다.");
      return;
    }

    set({ isLoading: true, error: null });
    try {
      const ambulanceStatusResponse = await getMyAmbulanceStatus();
      const myAmbulanceStatus = ambulanceStatusResponse.ambCurrentStatus || "wait";
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

      set({
        selectedAmbulance: updatedAmbulance,
        ambulances: [updatedAmbulance],
        isLoading: false,
        error: null,
      });

      const currentState = get();
      if (!skipPatientInfoLoad && !currentState.isEditMode) {
        await get()._fetchAndSetPatientInfo();
      } else {
        console.log("🔥 [selectMyAmbulance] 환자 정보 로드 스킵됨 (수정 모드 또는 명시적 스킵)");
      }
      
    } catch (error) {
      console.error("[useEmergencyStore] 내 구급차 정보 조회 실패:", error);
      set({
        isLoading: false,
        error: error.message || "내 구급차 정보 조회 실패",
      });
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
      set((state) => {
        const updatedAmbulances = state.ambulances.map((amb) =>
          amb.id === ambulanceId
            ? {
                ...amb,
                currentStatus: status.toUpperCase(),
                status: status.toLowerCase(),
                statusText: getAmbulanceStatusText(status),
                lastUpdate: new Date().toISOString(),
              }
            : amb
        );

        const updatedSelected =
          state.selectedAmbulance?.id === ambulanceId
            ? updatedAmbulances.find((amb) => amb.id === ambulanceId)
            : state.selectedAmbulance;

        return {
          ambulances: updatedAmbulances,
          selectedAmbulance: updatedSelected,
          lastUpdated: new Date().toISOString(),
        };
      });

      const statusText = getAmbulanceStatusText(status);
      console.log(`[Emergency Store] 구급차 상태 변경 성공: ${statusText}`);
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "구급차 상태 변경에 실패했습니다.";
      set({ error: errorMessage });
      alert(`❌ 구급차 상태 변경 실패\n${errorMessage}`);
      throw error;
    }
  },

  fetchAmbulanceDetail: async (ambulanceId) => {
    try {
      const ambulanceDetail = await getAmbulanceDetail(ambulanceId);
      if (ambulanceDetail.patientInfo) {
        set((state) => ({
          patientInfo: { ...state.patientInfo, ...ambulanceDetail.patientInfo },
          patientDetails: {
            ...state.patientDetails,
            ...ambulanceDetail.patientDetails,
          },
        }));
      }
      return ambulanceDetail;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "구급차 상세 정보 조회에 실패했습니다.";
      set({ error: errorMessage });
      throw error;
    }
  },

  fetchAmbulanceLocation: async (ambulanceId) => {
    try {
      const locationData = await getAmbulanceLocation(ambulanceId);
      try {
        const addressInfo = await reverseGeocode(
          locationData.latitude,
          locationData.longitude
        );
        locationData.address = addressInfo.address;
      } catch (geocodeError) {
        console.warn(
          "[Emergency Store] 주소 변환 실패, 좌표만 사용:",
          geocodeError.message
        );
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
      set({
        currentLocation: locationData,
        locationError: null,
        isLocationLoading: false,
      });
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
    console.log("📝 [updatePatientInfo] 환자 기본 정보 업데이트:", patientInfo);
    set((state) => ({
      patientInfo: { ...state.patientInfo, ...patientInfo },
      selectedAmbulance: state.selectedAmbulance
        ? {
            ...state.selectedAmbulance,
            patientInfo: {
              ...state.selectedAmbulance.patientInfo,
              ...patientInfo,
            },
          }
        : null,
    }));
  },

  updatePatientDetails: (patientDetails) => {
    console.log(
      "📝 [updatePatientDetails] 환자 상세 정보 업데이트:",
      patientDetails
    );
    set((state) => ({
      patientDetails: { ...state.patientDetails, ...patientDetails },
      selectedAmbulance: state.selectedAmbulance
        ? {
            ...state.selectedAmbulance,
            patientDetails: {
              ...state.selectedAmbulance.patientDetails,
              ...patientDetails,
            },
          }
        : null,
    }));
  },

  saveOptionalPatientInfo: async (optionalData) => {
    set({ isPatientDataSaving: true, patientDataError: null });
    
    try {
      const apiPayload = convertFormDataForApi(optionalData);
      const result = await saveOptionalPatientInfoApi(apiPayload);
      
      console.log("✅ 정보 저장 성공. 최신 정보를 다시 불러와 상태를 동기화합니다.");
      await get()._fetchAndSetPatientInfo();
      
      set({ isPatientDataSaving: false, patientDataError: null });
      console.log("✅ [saveOptionalPatientInfo] 선택 정보 저장 및 동기화 완료");
      return { success: true, data: result };
    } catch (error) {
      console.error("🔥🔥🔥 [saveOptionalPatientInfo] 에러 발생:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "환자 선택 정보 저장에 실패했습니다.";
      set({ patientDataError: errorMessage, isPatientDataSaving: false });
      throw new Error(errorMessage);
    }
  },

  saveAllPatientInfoAndMatch: async (allFormData) => {
    if (!allFormData.ktasLevel || !allFormData.department) {
      const errorMsg = "병원 매칭을 위해 KTAS와 진료과는 필수입니다.";
      alert(errorMsg);
      throw new Error(errorMsg);
    }

    set({
      isHospitalMatching: true,
      hospitalMatchingStatus: "loading",
      hospitalMatchingError: null,
    });

    try {
      const apiPayload = convertFormDataForApi(allFormData);
      await saveOptionalPatientInfoApi(apiPayload);

      await get()._fetchAndSetPatientInfo();

      console.log("✅ [saveAllPatientInfoAndMatch] 모든 환자 정보 저장 및 동기화 완료. 병원 매칭을 시작합니다.");

      const { selectedAmbulance } = get();
      if (selectedAmbulance?.id) {
        console.log("🏥 [saveAllPatientInfoAndMatch] 병원 매칭 시작");
        await get().triggerHospitalMatching(selectedAmbulance.id);
        console.log("✅ [saveAllPatientInfoAndMatch] 병원 매칭 성공");
      } else {
        throw new Error("구급차 정보를 찾을 수 없어 매칭을 시작할 수 없습니다.");
      }
    } catch (error) {
      const errorMessage = error.message || "정보 저장 또는 매칭 중 오류 발생";
      set({
        isHospitalMatching: false,
        hospitalMatchingStatus: "error",
        hospitalMatchingError: errorMessage,
      });
      alert(`❌ 오류 발생:\n${errorMessage}`);
      throw new Error(errorMessage);
    }
  },

  quickHospitalMatch: async (ktasLevel, department) => {
    if (!ktasLevel || !department) {
      const errorMsg = "병원 매칭을 위해 KTAS와 진료과는 필수입니다.";
      alert(errorMsg);
      throw new Error(errorMsg);
    }

    set({
      isHospitalMatching: true,
      hospitalMatchingStatus: "loading",
      hospitalMatchingError: null,
    });

    try {
      const apiPayload = {
        ktas: parseInt(ktasLevel),
        department: department,
        sex: null,
        ageRange: null,
        medicalRecord: null,
        familyHistory: null,
        pastHistory: null,
        medicine: null,
        name: null,
        rrn: null,
        nationality: null,
        vitalSigns: null,
      };

      await saveOptionalPatientInfoApi(apiPayload);
      await get()._fetchAndSetPatientInfo();

      const { selectedAmbulance } = get();
      if (selectedAmbulance?.id) {
        await get().triggerHospitalMatching(selectedAmbulance.id);
      } else {
        throw new Error("구급차 정보를 찾을 수 없어 매칭을 시작할 수 없습니다.");
      }
    } catch (error) {
      const errorMessage = error.message || "빠른 매칭 중 오류 발생";
      set({
        isHospitalMatching: false,
        hospitalMatchingStatus: "error",
        hospitalMatchingError: errorMessage,
      });
      alert(`❌ 오류 발생:\n${errorMessage}`);
      throw new Error(errorMessage);
    }
  },

  fetchPatientInfo: async (ambulanceId = null) => {
    try {
      const patientData = await getPatientInfo(ambulanceId);
      if (patientData) {
        set((state) => ({
          patientInfo: { ...state.patientInfo, ...patientData },
          patientDetails: { ...state.patientDetails, ...patientData },
        }));
      }
      return patientData;
    } catch (error) {
      throw error;
    }
  },

  triggerHospitalMatching: async (ambulanceId) => {
    if (!ambulanceId) throw new Error("구급차 ID가 필요합니다.");

    set({
      isHospitalMatching: true,
      hospitalMatchingStatus: "loading",
      hospitalMatchingError: null,
    });

    try {
      const locationData =
        get().currentLocation || (await get().getCurrentLocation());

      if (!locationData?.latitude || !locationData?.longitude)
        throw new Error("위치 정보를 확인할 수 없습니다. GPS를 활성화해주세요.");

      const matchingData = {
        ambulanceId,
        latitude: locationData.latitude,
        longitude: locationData.longitude,
      };

      const matchingResult = await requestHospitalMatching(matchingData);

      if (!matchingResult?.hospitalId)
        throw new Error("매칭 가능한 병원이 없습니다.");

      let distance = null;
      if (matchingResult.latitude && matchingResult.longitude) {
        try {
          const distanceResult = await calculateDistance(
            {
              latitude: locationData.latitude,
              longitude: locationData.longitude,
            },
            {
              latitude: matchingResult.latitude,
              longitude: matchingResult.longitude,
            }
          );
          distance = distanceResult.distance;
        } catch (distanceError) {
          console.warn("[Emergency Store] 거리 계산 실패:", distanceError.message);
        }
      }

      const hospitalData = {
        id: matchingResult.hospitalId,
        hospitalId: matchingResult.hospitalId,
        name: matchingResult.name || "매칭된 병원",
        address: matchingResult.address || "주소 확인 중",
        distance: distance
          ? `${(distance / 1000).toFixed(1)}km`
          : "거리 계산 중",
        eta: distance
          ? `약 ${Math.ceil((distance / 1000) * 2)}분`
          : "소요시간 계산 중",
        departments: [get().patientDetails.department || "응급의학과"],
        availableBeds: "확인 중",
        emergencyLevel: "Level1",
        isAvailable: true,
        latitude: matchingResult.latitude || 37.5799,
        longitude: matchingResult.longitude || 126.9988,
        matchedAt: new Date().toISOString(),
      };

      set({
        matchedHospitals: [hospitalData],
        hospitalMatchingStatus: "success",
        hospitalMatchingError: null,
        isHospitalMatching: false,
      });

      return matchingResult;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "병원 매칭에 실패했습니다.";

      set({
        hospitalMatchingStatus: "error",
        hospitalMatchingError: errorMessage,
        isHospitalMatching: false,
        matchedHospitals: [],
      });

      throw error;
    }
  },

  resetHospitalMatching: () => {
    set({
      matchedHospitals: [],
      hospitalMatchingStatus: "idle",
      hospitalMatchingError: null,
      isHospitalMatching: false,
    });
  },

  completeTransport: async (navigate = null) => {
    const { selectedAmbulance, matchedHospitals } = get();
    const { callInfo, endCall } = useWebRtcStore.getState();

    if (!selectedAmbulance) {
      alert("구급차 정보가 없습니다.");
      return;
    }

    try {
      const sessionId = callInfo?.sessionId || selectedAmbulance.id;
      const hospitalId = matchedHospitals[0]?.id || callInfo?.hospitalId;

      if (sessionId && hospitalId) {
        console.log(`🚀 [이송완료] API 호출 시작: sessionId=${sessionId}, hospitalId=${hospitalId}`);
        console.log(`📡 [이송완료] 백엔드에서 다음 토픽으로 COMPLETE 알람 전송 예상: /topic/alarm/${hospitalId}`);
        await completeTransportApi(String(sessionId), hospitalId);
        console.log("✅ [이송완료] 서버 세션 정리 완료");
      } else {
        console.warn("⚠️ [이송완료] 세션 또는 병원 ID가 없어 서버 세션 정리를 건너뜁니다.", {sessionId, hospitalId});
      }

      if (callInfo) {
        endCall();
        console.log("📞 WebRTC 통화 종료 및 PIP 모드 해제");
      }

      try {
        console.log("📝 AI 보고서 생성을 시작합니다...");
        const report = await generateReport();
        console.log(`✅ 보고서 생성 완료: ${report.reportId}`);
      } catch (reportError) {
        console.error("⚠️ 보고서 생성 실패:", reportError);
        alert(`⚠️ 보고서 생성에 실패했습니다: ${reportError.message}`);
      }
      
      await updateAmbulanceStatus(selectedAmbulance.id, "wait");
      console.log('✅ 구급차 상태가 서버에 "대기"로 업데이트되었습니다.');

      alert("✅ 이송 완료 처리되었습니다. 잠시 후 대기 상태로 전환됩니다.");

      const initialPatientInfo = { name: "", gender: "", ageRange: "" };
      const initialPatientDetails = {
        ktasLevel: "", department: "", medicalRecord: "", familyHistory: "",
        pastHistory: "", medicine: "", vitalSigns: "", rrn: "", nationality: "",
      };

      set({
        selectedAmbulance: {
          ...selectedAmbulance,
          currentStatus: "WAIT", status: "wait",
          patientInfo: initialPatientInfo, patientDetails: initialPatientDetails,
        },
        patientInfo: initialPatientInfo,
        patientDetails: initialPatientDetails,
        matchedHospitals: [],
        hospitalMatchingStatus: "idle",
        isEditMode: false,
      });

      if (navigate) {
        navigate("/emergency/waiting", { replace: true });
      }

    } catch (error) {
      console.error("❌ 이송 완료 처리 중 심각한 오류 발생:", error);
      alert("❌ 이송 완료 처리에 실패했습니다: " + error.message);
      if (navigate) {
        navigate("/emergency/waiting", { replace: true });
      }
    }
  },

  selectAmbulance: (ambulance) => {
    console.log("🚑 [selectAmbulance] 구급차 선택:", ambulance);
    set({ selectedAmbulance: ambulance });
  },

  transferToHospital: async () => {
    const { selectedAmbulance } = get();
    if (!selectedAmbulance) {
      alert("구급차 정보가 없습니다.");
      return;
    }

    const currentStatus = (
      selectedAmbulance.currentStatus || selectedAmbulance.status
    )?.toLowerCase();

    if (currentStatus !== "dispatch" && currentStatus !== "dispatched") {
      alert("환자를 태우기 전에는 상태를 변경할 수 없습니다.");
      return;
    }

    try {
      await updateAmbulanceStatus(selectedAmbulance.id, "transfer");
      set((state) => ({
        selectedAmbulance: {
          ...state.selectedAmbulance,
          currentStatus: "TRANSFER",
          status: "transfer",
        },
      }));
      alert("✅ 환자를 태우고 병원으로 이송을 시작합니다.");
    } catch (error) {
      set({ error: error.message });
      alert("❌ 이송 상태 변경 실패: " + error.message);
    }
  },
}));

export default useEmergencyStore;