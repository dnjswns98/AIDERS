// src/store/useEmergencyStore.js

import { create } from "zustand";
import {
  updateAmbulanceStatus,
  saveRequiredPatientInfo,
  saveOptionalPatientInfo,
  requestHospitalMatching,
  getMatchedHospital,
  getAmbulancePatientDetail
} from "../api/api";
import { useAuthStore } from "./useAuthStore";

const getCurrentLocationFromDashboard = () => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation not supported'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        const locationData = {
          latitude,
          longitude,
          accuracy,
          timestamp: new Date().toISOString()
        };
        
        resolve(locationData);
      },
      (error) => {
        reject(error);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
      }
    );
  });
};

const extractTextFromJsonString = (jsonString) => {
  if (!jsonString || typeof jsonString !== 'string') {
    return '';
  }
  
  try {
    if (jsonString.startsWith('{') || jsonString.startsWith('[')) {
      const parsed = JSON.parse(jsonString);
      
      if (Array.isArray(parsed)) {
        if (parsed.length > 0) {
          const firstItem = parsed[0];
          if (typeof firstItem === 'object' && firstItem.name) {
            return firstItem.name;
          } else if (typeof firstItem === 'string') {
            return firstItem;
          }
        }
        return '';
      } else if (typeof parsed === 'object') {
        const values = Object.values(parsed).filter(v => v && v.trim && v.trim() !== '');
        return values.length > 0 ? values[0] : '';
      } else {
        return String(parsed);
      }
    } else {
      return jsonString;
    }
  } catch (error) {
    return jsonString;
  }
};

const mapAgeRangeToBackendEnum = (koreanAge) => {
  const ageMapping = {
    '신생아': 'NEWBORN',
    '유아': 'INFANT', 
    '어린이': 'KIDS',
    '청소년': 'TEENAGER',
    '성인': 'ADULT',
    '노인': 'ELDERLY'
  };
  
  const mapped = ageMapping[koreanAge];
  return mapped || 'UNDECIDED';
};

const mapGenderToBackendInteger = (koreanGender) => {
  const genderMapping = {
    '남': 1,
    '여': 2,
    '남성': 1,
    '여성': 2
  };
  
  const mapped = genderMapping[koreanGender];
  return mapped || null;
};

const mapKtasToBackendInteger = (ktasLevel) => {
  if (typeof ktasLevel === 'string') {
    const number = parseInt(ktasLevel.replace(/[^0-9]/g, ''), 10);
    return number || null;
  }
  if (typeof ktasLevel === 'number') {
    return ktasLevel;
  }
  return null;
};

const mapToBackendFields = (frontendData, type = 'optional') => {
  if (!frontendData || typeof frontendData !== 'object') return {};
  
  const backendData = {};
  
  if (frontendData.ktasLevel !== undefined) {
    const mappedKtas = mapKtasToBackendInteger(frontendData.ktasLevel);
    if (mappedKtas !== null) {
      backendData.ktas = mappedKtas;
    }
  }
  
  if (frontendData.department !== undefined && frontendData.department.trim() !== '') {
    backendData.department = frontendData.department;
  }
  
  if (frontendData.gender !== undefined) {
    const mappedGender = mapGenderToBackendInteger(frontendData.gender);
    if (mappedGender !== null) {
      backendData.sex = mappedGender;
    }
  }
  
  if (frontendData.ageRange !== undefined && frontendData.ageRange.trim() !== '') {
    backendData.ageRange = mapAgeRangeToBackendEnum(frontendData.ageRange);
  }
  
  if (frontendData.name !== undefined && frontendData.name.trim() !== '') {
    backendData.name = frontendData.name;
  }
  
  if (frontendData.chiefComplaint !== undefined && frontendData.chiefComplaint.trim() !== '') {
    backendData.medicalRecord = frontendData.chiefComplaint;
  }
  
  if (frontendData.familyHistory !== undefined) {
    if (typeof frontendData.familyHistory === 'object') {
      const values = Object.values(frontendData.familyHistory).filter(v => v && v.trim && v.trim() !== '');
      backendData.familyHistory = values.length > 0 ? values[0] : '';
    } else if (typeof frontendData.familyHistory === 'string') {
      backendData.familyHistory = extractTextFromJsonString(frontendData.familyHistory);
    }
  }
  
  if (frontendData.pastHistory !== undefined) {
    if (typeof frontendData.pastHistory === 'object') {
      const values = Object.values(frontendData.pastHistory).filter(v => v && v.trim && v.trim() !== '');
      backendData.pastHistory = values.length > 0 ? values[0] : '';
    } else if (typeof frontendData.pastHistory === 'string') {
      backendData.pastHistory = extractTextFromJsonString(frontendData.pastHistory);
    }
  }
  
  if (frontendData.medications !== undefined) {
    if (Array.isArray(frontendData.medications) && frontendData.medications.length > 0) {
      const firstMed = frontendData.medications[0];
      if (typeof firstMed === 'object' && firstMed.name) {
        backendData.medicine = firstMed.name;
      } else if (typeof firstMed === 'string') {
        backendData.medicine = firstMed;
      } else {
        backendData.medicine = '';
      }
    } else if (typeof frontendData.medications === 'string') {
      if (frontendData.medications.startsWith('[')) {
        backendData.medicine = extractTextFromJsonString(frontendData.medications);
      } else {
        const firstMed = frontendData.medications.split(',')[0].trim();
        backendData.medicine = firstMed || '';
      }
    } else {
      backendData.medicine = '';
    }
  }
  
  if (frontendData.vitalSigns !== undefined) {
    if (typeof frontendData.vitalSigns === 'object') {
      const values = Object.values(frontendData.vitalSigns).filter(v => v && v.trim && v.trim() !== '');
      backendData.vitalSigns = values.length > 0 ? values[0] : '';
    } else if (typeof frontendData.vitalSigns === 'string') {
      if (frontendData.vitalSigns.startsWith('{')) {
        backendData.vitalSigns = extractTextFromJsonString(frontendData.vitalSigns);
      } else {
        backendData.vitalSigns = frontendData.vitalSigns;
      }
    } else {
      backendData.vitalSigns = '';
    }
  }
  
  if (frontendData.rrn !== undefined && frontendData.rrn.trim() !== '') {
    backendData.rrn = frontendData.rrn;
  }
  
  if (frontendData.nationality !== undefined && frontendData.nationality.trim() !== '') {
    backendData.nationality = frontendData.nationality;
  }
  
  return backendData;
};

const parseBackendDataToFrontend = (backendData) => {
  if (!backendData || typeof backendData !== 'object') return backendData;
  
  const frontendData = { ...backendData };
  
  const jsonFields = ['familyHistory', 'pastHistory', 'medications', 'vitalSigns'];
  
  jsonFields.forEach(field => {
    if (frontendData[field] && typeof frontendData[field] === 'string') {
      frontendData[field] = extractTextFromJsonString(frontendData[field]);
    }
  });
  
  return frontendData;
};

const isValidValue = (value) => {
  if (value === null || value === undefined) return false;
  if (typeof value === 'string' && value.trim() === '') return false;
  if (typeof value === 'number') return true;
  if (typeof value === 'boolean') return true;
  return true;
};

const filterEmptyValues = (obj) => {
  if (!obj || typeof obj !== 'object' || Array.isArray(obj)) {
    return obj;
  }
  
  const filtered = {};
  
  Object.entries(obj).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      const filteredArray = value
        .map(item => {
          if (typeof item === 'object' && item !== null) {
            return filterEmptyValues(item);
          }
          return item;
        })
        .filter(item => {
          if (typeof item === 'object' && item !== null) {
            return Object.keys(item).length > 0;
          }
          return isValidValue(item);
        });
        
      if (filteredArray.length > 0) {
        filtered[key] = filteredArray;
      }
    }
    else if (typeof value === 'object' && value !== null) {
      const nestedFiltered = filterEmptyValues(value);
      if (Object.keys(nestedFiltered).length > 0) {
        filtered[key] = nestedFiltered;
      }
    }
    else if (isValidValue(value)) {
      filtered[key] = value;
    }
  });
  
  return filtered;
};

const validateAndFilterApiData = async (data, type = 'optional', includeLocation = false) => {
  if (!data || typeof data !== 'object') {
    return null;
  }
  
  const mappedData = mapToBackendFields(data, type);
  
  const filtered = filterEmptyValues(mappedData);
  
  let finalData = filtered;
  if (includeLocation) {
    try {
      const locationData = await getCurrentLocationFromDashboard();
      
      finalData = {
        ...filtered,
        latitude: locationData.latitude,    
        longitude: locationData.longitude,  
      };
      
    } catch (error) {
    }
  }
  
  const hasValidData = Object.keys(finalData).length > 0;
  
  return hasValidData ? finalData : null;
};

const useEmergencyStore = create((set, get) => ({
  selectedAmbulance: null,
  ambulances: [],
  ambulanceDetails: null,
  
  currentLocation: null,
  locationError: null,

  matchedHospitals: [],
  hospitalMatchingStatus: 'idle',
  hospitalMatchingError: null,
  isHospitalMatching: false,

  fetchAmbulances: async () => {
    try {
      const authState = useAuthStore.getState();
      const currentUser = authState.user;
      const accessToken = authState.accessToken;
      
      const userId = currentUser?.userId;
      const userKey = currentUser?.userKey;
      
      if (!currentUser || !userId) {
        set({ selectedAmbulance: null, ambulances: [] });
        return;
      }

      if (!accessToken) {
      }

      const currentState = get();
      const existingAmbulance = currentState.selectedAmbulance;

      const currentAmbulance = {
        id: userId,
        carNumber: userKey || `구급차-${userId}`,
        status: existingAmbulance?.status || "unknown",
        priority: existingAmbulance?.priority || "unknown",
        patientInfo: {},
        patientDetails: {},
      };

      if (
        existingAmbulance &&
        (Object.values(existingAmbulance.patientInfo || {}).some(Boolean) ||
          Object.values(existingAmbulance.patientDetails || {}).some(Boolean))
      ) {
        
        currentAmbulance.patientInfo = parseBackendDataToFrontend(existingAmbulance.patientInfo);
        currentAmbulance.patientDetails = parseBackendDataToFrontend(existingAmbulance.patientDetails);
      } else {
        currentAmbulance.patientInfo = {
          name: "",
          gender: "",
          age: "",
        };
        currentAmbulance.patientDetails = {
          ktasLevel: "",
          department: "",
          ageRange: "",
          chiefComplaint: "",
          treatmentDetails: "",
          familyHistory: "",
          pastHistory: "",
          medications: "",
          vitalSigns: "",
        };
      }

      set({ selectedAmbulance: currentAmbulance, ambulances: [currentAmbulance] });

    } catch (error) {
      console.error("fetchAmbulances 오류:", error);
      set({ selectedAmbulance: null, ambulances: [] });
    }
  },

  updatePatientInfo: async (ambulanceId, newPatientData) => {

    if (!ambulanceId) {
      return;
    }

    if (
      !newPatientData ||
      (!newPatientData.patientInfo && !newPatientData.patientDetails)
    ) {
      return;
    }

    const currentState = get();

    let apiSuccess = false;
    let hospitalMatchingTriggered = false;

    try {
      if (
        newPatientData.patientDetails &&
        Object.keys(newPatientData.patientDetails).length > 0
      ) {
        const { ktasLevel, department } = newPatientData.patientDetails;
        
        const isValidKtas = ktasLevel && 
                           !ktasLevel.includes("선택") && 
                           ktasLevel.trim() !== "" && 
                           ktasLevel !== "선택해주세요";
                           
        const isValidDepartment = department && 
                                 !department.includes("선택") && 
                                 department.trim() !== "" && 
                                 department !== "선택해주세요";
        
        if (isValidKtas && isValidDepartment) {
          const requiredInfo = {
            ktasLevel: ktasLevel,
            department: department
          };
          
          const validatedRequired = await validateAndFilterApiData(
            requiredInfo, 
            'required', 
            true
          );
          
          if (validatedRequired) {
            
            await saveRequiredPatientInfo(validatedRequired);
            
            if (validatedRequired.latitude && validatedRequired.longitude) {
              set({ 
                currentLocation: {
                  latitude: validatedRequired.latitude,
                  longitude: validatedRequired.longitude,
                  timestamp: new Date().toISOString()
                },
                locationError: null
              });
            }

            hospitalMatchingTriggered = true;
            
          } else {
          }
        } else {
        }
      }

      if (
        newPatientData.patientInfo &&
        Object.keys(newPatientData.patientInfo).length > 0
      ) {
        
        const filteredPatientInfo = await validateAndFilterApiData(
          newPatientData.patientInfo, 
          'optional',
          false
        );
        
        if (filteredPatientInfo) {
          
          await saveOptionalPatientInfo(filteredPatientInfo);
        } else {
        }
      }

      if (
        newPatientData.patientDetails &&
        Object.keys(newPatientData.patientDetails).length > 0
      ) {
        const { ktasLevel, department, ...otherDetails } = newPatientData.patientDetails;
        
        
        const filteredOtherDetails = await validateAndFilterApiData(
          otherDetails, 
          'optional',
          false
        );
        
        if (filteredOtherDetails) {
          
          await saveOptionalPatientInfo(filteredOtherDetails);
        } else {
        }
      }

      apiSuccess = true;

      if (hospitalMatchingTriggered) {
        try {
          await get().triggerHospitalMatching(ambulanceId);
        } catch (matchingError) {
        }
      }

    } catch (error) {
      
      if (error.response) {
        
        if (error.response.status === 400) {
        }
      }
    }

    try {
      set((state) => {
        const targetAmbulance = state.ambulances.find(
          (amb) => amb.id === ambulanceId
        );
        if (!targetAmbulance) {
          return state;
        }

        const updatedPatientInfo = {
          ...targetAmbulance.patientInfo,
          ...newPatientData.patientInfo,
        };
        const updatedPatientDetails = {
          ...targetAmbulance.patientDetails,
          ...newPatientData.patientDetails,
        };

        const updatedAmbulance = {
          ...targetAmbulance,
          patientInfo: updatedPatientInfo,
          patientDetails: updatedPatientDetails,
        };

        const newState = {
          ...state,
          ambulances: state.ambulances.map((amb) =>
            amb.id === ambulanceId ? updatedAmbulance : amb
          ),
          selectedAmbulance:
            state.selectedAmbulance?.id === ambulanceId
              ? updatedAmbulance
              : state.selectedAmbulance,
        };

        return newState;
      });

      setTimeout(() => {
        const updatedState = get();
      }, 50);

      if (apiSuccess && hospitalMatchingTriggered) {
      } else if (apiSuccess) {
      }
    } catch (err) {
      console.error("로컬 상태 업데이트 실패:", err);
      throw err;
    }
  },

  triggerHospitalMatching: async (ambulanceId) => {

    if (!ambulanceId) {
      return;
    }

    const currentState = get();
    const selectedAmbulance = currentState.selectedAmbulance;
    const currentLocation = currentState.currentLocation;

    if (!selectedAmbulance) {
      return;
    }

    set({ 
      isHospitalMatching: true, 
      hospitalMatchingStatus: 'loading',
      hospitalMatchingError: null 
    });

    try {
      let locationData = currentLocation;
      
      if (!locationData) {
        locationData = await get().getCurrentLocation();
      }

      if (!locationData || !locationData.latitude || !locationData.longitude) {
        throw new Error("위치 정보를 가져올 수 없습니다. GPS를 확인해주세요.");
      }

      const matchingRequestData = {
        ambulanceId: ambulanceId,
        latitude: locationData.latitude,
        longitude: locationData.longitude
      };

      const matchingResult = await requestHospitalMatching(matchingRequestData);
      
      if (matchingResult) {
        const hospitalData = {
          id: matchingResult.hospitalId,
          hospitalId: matchingResult.hospitalId,
          name: matchingResult.name,
          address: matchingResult.address,
          distance: "매칭됨",
          eta: "최적화됨",
          departments: [selectedAmbulance.patientDetails?.department || "응급의학과"],
          availableBeds: "확인 중",
          emergencyLevel: "Level1",
          isAvailable: true,
          latitude: 37.5799,
          longitude: 126.9988
        };

        set({ 
          matchedHospitals: [hospitalData],
          hospitalMatchingStatus: 'success',
          hospitalMatchingError: null,
          isHospitalMatching: false
        });

        return matchingResult;
      } else {
        throw new Error("병원 매칭 결과가 비어있습니다.");
      }

    } catch (error) {
      console.error("❌ 병원 자동 매칭 실패:", error);
      
      set({ 
        hospitalMatchingStatus: 'error',
        hospitalMatchingError: error.message || '병원 매칭에 실패했습니다.',
        isHospitalMatching: false,
        matchedHospitals: []
      });

      throw error;
    }
  },

  checkHospitalMatchingStatus: async (ambulanceId) => {
    
    if (!ambulanceId) {
      return;
    }

    try {
      const statusResult = await getMatchedHospital(ambulanceId);

      if (statusResult) {
        const hospitalData = {
          id: statusResult.hospitalId,
          hospitalId: statusResult.hospitalId,
          name: statusResult.name,
          address: statusResult.address,
          distance: "기존 매칭",
          eta: "기존 매칭",
          departments: ["응급의학과"],
          availableBeds: "확인 중",
          emergencyLevel: "Level1",
          isAvailable: true,
          latitude: 37.5799,
          longitude: 126.9988
        };

        set({ 
          matchedHospitals: [hospitalData],
          hospitalMatchingStatus: 'success',
          hospitalMatchingError: null
        });

      } else {
        set({ 
          matchedHospitals: [],
          hospitalMatchingStatus: 'idle'
        });
      }

      return statusResult;
    } catch (error) {
      if (error.response?.status === 404) {
        set({ 
          matchedHospitals: [],
          hospitalMatchingStatus: 'idle',
          hospitalMatchingError: null
        });
      } else {
        console.error("병원 매칭 상태 조회 실패:", error);
        set({ 
          hospitalMatchingStatus: 'error',
          hospitalMatchingError: '매칭 상태 조회에 실패했습니다.'
        });
      }
    }
  },

  cancelHospitalMatching: async (ambulanceId) => {
    
    if (!ambulanceId) {
      return;
    }

    try {
      
      set({ 
        matchedHospitals: [],
        hospitalMatchingStatus: 'idle',
        hospitalMatchingError: null,
        isHospitalMatching: false
      });
      
    } catch (error) {
      console.error("병원 매칭 취소 실패:", error);
      throw error;
    }
  },

  resetHospitalMatching: () => {
    set({ 
      matchedHospitals: [],
      hospitalMatchingStatus: 'idle',
      hospitalMatchingError: null,
      isHospitalMatching: false
    });
  },

  getCurrentLocation: async () => {
    try {
      const locationData = await getCurrentLocationFromDashboard();
      
      set({ 
        currentLocation: locationData,
        locationError: null 
      });
      
      return locationData;
    } catch (error) {
      console.error('[Location] 위치 조회 실패:', error);
      set({ locationError: error.message });
      throw error;
    }
  },

  selectAmbulance: (ambulance) => {
    set({ selectedAmbulance: ambulance });
  },

  updateAmbulanceStatus: async (ambulanceId, status) => {
    try {
      await updateAmbulanceStatus(ambulanceId, status);

      set((state) => {
        const newState = {
          ambulances: state.ambulances.map((amb) =>
            amb.id === ambulanceId ? { ...amb, status } : amb
          ),
          selectedAmbulance:
            state.selectedAmbulance?.id === ambulanceId
              ? { ...state.selectedAmbulance, status }
              : state.selectedAmbulance,
        };
        return newState;
      });
    } catch (error) {
    }
  },

  addTreatmentRecord: (ambulanceId, record) => {
    const newRecord = {
      ...record,
      time: new Date().toLocaleTimeString("ko-KR", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
    set((state) => {
      const newState = {
        ambulances: state.ambulances.map((amb) =>
          amb.id === ambulanceId
            ? {
                ...amb,
                treatmentRecords: [...(amb.treatmentRecords || []), newRecord],
              }
            : amb
        ),
        selectedAmbulance:
          state.selectedAmbulance?.id === ambulanceId
            ? {
                ...state.selectedAmbulance,
                treatmentRecords: [
                  ...(state.selectedAmbulance.treatmentRecords || []),
                  newRecord,
                ],
              }
            : state.selectedAmbulance,
      };
      return newState;
    });
  },

  getAmbulanceById: (ambulanceId) => {
    const ambulance = get().ambulances.find((amb) => amb.id === ambulanceId);
    return ambulance;
  },

  getDispatchedAmbulances: () => {
    const dispatched = get().ambulances.filter((amb) =>
      ["dispatched", "transporting", "completed", "returning"].includes(
        amb.status
      )
    );
    return dispatched;
  },

  getAvailableAmbulances: () => {
    const available = get().ambulances.filter(
      (amb) => amb.status === "standby" || amb.status === "completed"
    );
    return available;
  },

  getStatistics: () => {
    const ambulances = get().ambulances;
    const stats = {
      total: ambulances.length,
      dispatched: get().getDispatchedAmbulances().length,
      available: get().getAvailableAmbulances().length,
      emergency: ambulances.filter((a) => a.priority === "응급").length,
      urgent: ambulances.filter((a) => a.priority === "긴급").length,
      normal: ambulances.filter((a) => a.priority === "보통").length,
    };
    return stats;
  },

  debugCurrentState: () => {
    const state = get();
    const authState = useAuthStore.getState();
    
    return { emergencyState: state, authState };
  },

  testHospitalMatching: async (testData) => {
    
    try {
      const result = await requestHospitalMatching(testData);
      return result;
    } catch (error) {
      console.error("병원 매칭 테스트 실패:", error);
      throw error;
    }
  },

  testPureStringMapping: async (testData, includeLocation = false) => {
    
    const mappedRequired = await validateAndFilterApiData(testData, 'required', includeLocation);
    
    const mappedOptional = await validateAndFilterApiData(testData, 'optional', false);
    
    if (mappedRequired) {
      Object.entries(mappedRequired).forEach(([key, value]) => {
      });
    }
    if (mappedOptional) {
      Object.entries(mappedOptional).forEach(([key, value]) => {
      });
    }
    
    return { mappedRequired, mappedOptional };
  },

  testJsonStringParsing: (testJsonStrings) => {
    
    const results = {};
    Object.entries(testJsonStrings).forEach(([field, jsonString]) => {
      const extracted = extractTextFromJsonString(jsonString);
      results[field] = extracted;
    });
    
    return results;
  },

  fetchAmbulanceDetails: async (hospitalId, ambulanceId) => {
    try {
      const details = await getAmbulancePatientDetail(hospitalId, ambulanceId);
      set({ ambulanceDetails: details });
      return details;
    } catch (error) {
      console.error(`Failed to fetch details for ambulance ${ambulanceId}:`, error);
      set({ ambulanceDetails: null });
      throw error;
    }
  }
}));

export default useEmergencyStore;

export const useEmergency = () => useEmergencyStore();
export const useAmbulance = (ambulanceId) => {
  return useEmergencyStore((state) =>
    state.ambulances.find((amb) => amb.id === ambulanceId)
  );
};
export const useSelectedAmbulance = () => {
  return useEmergencyStore((state) => state.selectedAmbulance);
};
export const useAmbulanceActions = () => {
  return useEmergencyStore((state) => ({
    selectAmbulance: state.selectAmbulance,
    updateAmbulanceStatus: state.updateAmbulanceStatus,
    addTreatmentRecord: state.addTreatmentRecord,
    updatePatientInfo: state.updatePatientInfo,
    fetchAmbulances: state.fetchAmbulances,
    triggerHospitalMatching: state.triggerHospitalMatching,
    checkHospitalMatchingStatus: state.checkHospitalMatchingStatus,
    cancelHospitalMatching: state.cancelHospitalMatching,
    resetHospitalMatching: state.resetHospitalMatching,
    getCurrentLocation: state.getCurrentLocation,
    debugCurrentState: state.debugCurrentState,
    testHospitalMatching: state.testHospitalMatching,
    testPureStringMapping: state.testPureStringMapping,
    testJsonStringParsing: state.testJsonStringParsing,
  }));
};
export const useAmbulanceList = () => {
  return useEmergencyStore((state) => ({
    ambulances: state.ambulances,
    dispatched: state.getDispatchedAmbulances(),
    available: state.getAvailableAmbulances(),
    stats: state.getStatistics(),
  }));
};
export const useHospitalMatching = () => {
  return useEmergencyStore((state) => ({
    matchedHospitals: state.matchedHospitals,
    status: state.hospitalMatchingStatus,
    error: state.hospitalMatchingError,
    isMatching: state.isMatching,
  }));
};
export const usePatientData = (ambulanceId) => {
  return useEmergencyStore((state) => {
    const ambulance = state.ambulances.find((amb) => amb.id === ambulanceId);
    if (!ambulance) return { patientInfo: {}, patientDetails: {} };
    return {
      patientInfo: ambulance.patientInfo,
      patientDetails: ambulance.patientDetails,
    };
  });
};
export const useCurrentLocation = () => {
  return useEmergencyStore((state) => ({
    location: state.currentLocation,
    error: state.locationError,
  }));
};
