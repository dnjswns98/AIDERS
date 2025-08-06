// src/store/useEmergencyStore.js

import { create } from "zustand";
import {
  updateAmbulanceStatus,
  saveRequiredPatientInfo,
  saveOptionalPatientInfo,
} from "../api/api";
import { useAuthStore } from "./useAuthStore";

// 🔥 구급차 대시보드에서 위치 정보 가져오는 함수
const getCurrentLocationFromDashboard = () => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      console.error('[Location] Geolocation API 지원 안 함');
      reject(new Error('Geolocation not supported'));
      return;
    }

    console.log('[Location] 구급차 대시보드에서 현재 위치 가져오는 중...');
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        const locationData = {
          latitude,
          longitude,
          accuracy,
          timestamp: new Date().toISOString()
        };
        
        console.log('[Location] 대시보드 위치 정보 획득 성공:', locationData);
        resolve(locationData);
      },
      (error) => {
        console.error('[Location] 위치 정보 획득 실패:', error);
        reject(error);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000 // 1분 캐시
      }
    );
  });
};

// 🔥 JSON 문자열을 순수 문자열로 변환하는 헬퍼 함수
const extractTextFromJsonString = (jsonString) => {
  if (!jsonString || typeof jsonString !== 'string') {
    return '';
  }
  
  try {
    // JSON 문자열인지 확인
    if (jsonString.startsWith('{') || jsonString.startsWith('[')) {
      const parsed = JSON.parse(jsonString);
      
      if (Array.isArray(parsed)) {
        // 배열인 경우: 첫 번째 요소의 name 필드 또는 문자열 반환
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
        // 객체인 경우: 첫 번째 값 반환 (빈 값 제외)
        const values = Object.values(parsed).filter(v => v && v.trim && v.trim() !== '');
        return values.length > 0 ? values[0] : '';
      } else {
        return String(parsed);
      }
    } else {
      // 일반 문자열
      return jsonString;
    }
  } catch (error) {
    console.warn('[JSON Extract] JSON 파싱 실패, 원본 반환:', jsonString, error);
    return jsonString;
  }
};

// 🔥 백엔드 엔티티에 맞춘 매핑 함수들

/**
 * 한글 나이대를 백엔드 PatientAgeRange enum으로 매핑
 */
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
  console.log('[AgeMapping]', koreanAge, '→', mapped || 'UNDECIDED');
  return mapped || 'UNDECIDED';
};

/**
 * 한글 성별을 백엔드 Integer로 매핑 (1=남, 2=여)
 */
const mapGenderToBackendInteger = (koreanGender) => {
  const genderMapping = {
    '남': 1,
    '여': 2,
    '남성': 1,
    '여성': 2
  };
  
  const mapped = genderMapping[koreanGender];
  console.log('[GenderMapping]', koreanGender, '→', mapped || 'null');
  return mapped || null;
};

/**
 * KTAS 레벨을 백엔드 Integer로 매핑
 */
const mapKtasToBackendInteger = (ktasLevel) => {
  if (typeof ktasLevel === 'string') {
    const number = parseInt(ktasLevel.replace(/[^0-9]/g, ''), 10);
    console.log('[KtasMapping]', ktasLevel, '→', number || 'null');
    return number || null;
  }
  if (typeof ktasLevel === 'number') {
    console.log('[KtasMapping]', ktasLevel, '→', ktasLevel);
    return ktasLevel;
  }
  console.log('[KtasMapping]', ktasLevel, '→', 'null');
  return null;
};

/**
 * 🔥 완전히 수정된 순수 문자열 처리 - JSON.stringify 완전 제거
 */
const mapToBackendFields = (frontendData, type = 'optional') => {
  if (!frontendData || typeof frontendData !== 'object') return {};
  
  const backendData = {};
  
  // KTAS (Integer 타입)
  if (frontendData.ktasLevel !== undefined) {
    const mappedKtas = mapKtasToBackendInteger(frontendData.ktasLevel);
    if (mappedKtas !== null) {
      backendData.ktas = mappedKtas;
    }
  }
  
  // 진료과목 (String 타입)
  if (frontendData.department !== undefined && frontendData.department.trim() !== '') {
    backendData.department = frontendData.department;
  }
  
  // 성별 (Integer 타입: 1=남, 2=여)
  if (frontendData.gender !== undefined) {
    const mappedGender = mapGenderToBackendInteger(frontendData.gender);
    if (mappedGender !== null) {
      backendData.sex = mappedGender;
    }
  }
  
  // 나이대 (PatientAgeRange enum)
  if (frontendData.ageRange !== undefined && frontendData.ageRange.trim() !== '') {
    backendData.ageRange = mapAgeRangeToBackendEnum(frontendData.ageRange);
  }
  
  // 이름 (String 타입)
  if (frontendData.name !== undefined && frontendData.name.trim() !== '') {
    backendData.name = frontendData.name;
  }
  
  // 의무기록/주증상 (String 타입)
  if (frontendData.chiefComplaint !== undefined && frontendData.chiefComplaint.trim() !== '') {
    backendData.medicalRecord = frontendData.chiefComplaint;
  }
  
  // 🔥 가족력 (순수 문자열로 처리 - JSON.stringify 제거)
  if (frontendData.familyHistory !== undefined) {
    if (typeof frontendData.familyHistory === 'object') {
      // 객체에서 첫 번째 값만 추출하여 순수 문자열로 저장
      const values = Object.values(frontendData.familyHistory).filter(v => v && v.trim && v.trim() !== '');
      backendData.familyHistory = values.length > 0 ? values[0] : ''; // 🔥 순수 문자열
    } else if (typeof frontendData.familyHistory === 'string') {
      // JSON 문자열인 경우 파싱하여 순수 문자열 추출
      backendData.familyHistory = extractTextFromJsonString(frontendData.familyHistory); // 🔥 순수 문자열
    }
  }
  
  // 🔥 과거력 (순수 문자열로 처리 - JSON.stringify 제거)
  if (frontendData.pastHistory !== undefined) {
    if (typeof frontendData.pastHistory === 'object') {
      // 객체에서 첫 번째 값만 추출하여 순수 문자열로 저장
      const values = Object.values(frontendData.pastHistory).filter(v => v && v.trim && v.trim() !== '');
      backendData.pastHistory = values.length > 0 ? values[0] : ''; // 🔥 순수 문자열
    } else if (typeof frontendData.pastHistory === 'string') {
      // JSON 문자열인 경우 파싱하여 순수 문자열 추출
      backendData.pastHistory = extractTextFromJsonString(frontendData.pastHistory); // 🔥 순수 문자열
    }
  }
  
  // 🔥 약물 (순수 문자열로 처리 - JSON.stringify 제거)
  if (frontendData.medications !== undefined) {
    if (Array.isArray(frontendData.medications) && frontendData.medications.length > 0) {
      // 배열에서 첫 번째 약물명만 추출하여 순수 문자열로 저장
      const firstMed = frontendData.medications[0];
      if (typeof firstMed === 'object' && firstMed.name) {
        backendData.medicine = firstMed.name; // 🔥 순수 문자열
      } else if (typeof firstMed === 'string') {
        backendData.medicine = firstMed; // 🔥 순수 문자열
      } else {
        backendData.medicine = ''; // 🔥 빈 문자열
      }
    } else if (typeof frontendData.medications === 'string') {
      if (frontendData.medications.startsWith('[')) {
        // JSON 배열 문자열인 경우 파싱하여 첫 번째 약물명 추출
        backendData.medicine = extractTextFromJsonString(frontendData.medications); // 🔥 순수 문자열
      } else {
        // 쉼표로 구분된 문자열에서 첫 번째 약물만 추출
        const firstMed = frontendData.medications.split(',')[0].trim();
        backendData.medicine = firstMed || ''; // 🔥 순수 문자열
      }
    } else {
      backendData.medicine = ''; // 🔥 빈 문자열
    }
  }
  
  // 🔥 생체징후 (순수 문자열로 처리 - JSON.stringify 제거)
  if (frontendData.vitalSigns !== undefined) {
    if (typeof frontendData.vitalSigns === 'object') {
      // 객체에서 첫 번째 값만 추출하여 순수 문자열로 저장
      const values = Object.values(frontendData.vitalSigns).filter(v => v && v.trim && v.trim() !== '');
      backendData.vitalSigns = values.length > 0 ? values[0] : ''; // 🔥 순수 문자열
    } else if (typeof frontendData.vitalSigns === 'string') {
      if (frontendData.vitalSigns.startsWith('{')) {
        // JSON 객체 문자열인 경우 파싱하여 순수 문자열 추출
        backendData.vitalSigns = extractTextFromJsonString(frontendData.vitalSigns); // 🔥 순수 문자열
      } else {
        backendData.vitalSigns = frontendData.vitalSigns; // 🔥 이미 순수 문자열
      }
    } else {
      backendData.vitalSigns = ''; // 🔥 빈 문자열
    }
  }
  
  // 주민등록번호 (String 타입)
  if (frontendData.rrn !== undefined && frontendData.rrn.trim() !== '') {
    backendData.rrn = frontendData.rrn;
  }
  
  // 국적 (String 타입)
  if (frontendData.nationality !== undefined && frontendData.nationality.trim() !== '') {
    backendData.nationality = frontendData.nationality;
  }
  
  console.log(`[BackendMapping] ${type} 변환 결과 (순수 문자열 처리):`, {
    프론트엔드입력: frontendData,
    백엔드순수문자열: backendData
  });
  
  return backendData;
};

// 🔥 백엔드에서 받아온 데이터를 프론트엔드에서 처리할 때 JSON 문자열 파싱
const parseBackendDataToFrontend = (backendData) => {
  if (!backendData || typeof backendData !== 'object') return backendData;
  
  const frontendData = { ...backendData };
  
  // 🔥 JSON 문자열로 저장된 필드들을 순수 문자열로 변환
  const jsonFields = ['familyHistory', 'pastHistory', 'medications', 'vitalSigns'];
  
  jsonFields.forEach(field => {
    if (frontendData[field] && typeof frontendData[field] === 'string') {
      frontendData[field] = extractTextFromJsonString(frontendData[field]);
    }
  });
  
  console.log('[ParseBackend] JSON 문자열을 순수 문자열로 변환:', {
    원본백엔드데이터: backendData,
    변환된프론트데이터: frontendData
  });
  
  return frontendData;
};

// 🔥 빈 값 필터링 함수들
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

// 🔥 API 전송용 데이터 검증, 필터링, 매핑 + 위치 정보 추가 (순수 문자열 버전)
const validateAndFilterApiData = async (data, type = 'optional', includeLocation = false) => {
  // if (!data || typeof data !== 'object') {
  //   console.log(`[Filter] ${type} 데이터가 유효하지 않음:`, data);
  //   return null;
  // }
  
  // 1단계: 백엔드 필드명과 타입에 맞게 매핑 (순수 문자열 처리)
  const mappedData = mapToBackendFields(data, type);
  
  // 2단계: 빈 값 필터링
  const filtered = filterEmptyValues(mappedData);
  
  // 🔥 3단계: 위치 정보 추가 (필요시)
  let finalData = filtered;
  if (includeLocation) {
    try {
      console.log('[Location] 구급차 대시보드에서 위치 정보 가져오는 중...');
      const locationData = await getCurrentLocationFromDashboard();
      
      finalData = {
        ...filtered,
        latitude: locationData.latitude,    
        longitude: locationData.longitude,  
      };
      
      console.log('[Location] 위치 정보가 환자 데이터에 추가됨:', {
        latitude: locationData.latitude,
        longitude: locationData.longitude
      });
    } catch (error) {
      console.warn('[Location] 위치 정보 가져오기 실패, 위치 없이 진행:', error.message);
    }
  }
  
  const hasValidData = Object.keys(finalData).length > 0;
  
  console.log(`[Filter] ${type} 데이터 처리 결과 (순수 문자열 버전):`, {
    원본_키개수: Object.keys(data).length,
    매핑후_키개수: Object.keys(mappedData).length,
    필터링후_키개수: Object.keys(filtered).length,
    최종_키개수: Object.keys(finalData).length,
    위치정보_포함: includeLocation && finalData.latitude !== undefined,
    전송가능: hasValidData,
    최종순수문자열데이터: finalData
  });
  
  return hasValidData ? finalData : null;
};

const useEmergencyStore = create((set, get) => ({
  // 기본 상태들
  selectedAmbulance: null,
  ambulances: [],
  
  // 🔥 위치 정보 상태
  currentLocation: null,
  locationError: null,

  // 🔥 fetchAmbulances (순수 문자열 버전)
  fetchAmbulances: async () => {
    console.log("=== fetchAmbulances 시작 (순수 문자열 버전) ===");
    try {
      const authState = useAuthStore.getState();
      const currentUser = authState.user;
      const accessToken = authState.accessToken;
      
      console.log("authState:", authState);
      console.log("currentUser:", currentUser);
      console.log("accessToken 존재:", !!accessToken);
      
      const userId = currentUser?.userId;
      const userKey = currentUser?.userKey;
      
      console.log("userId (구급차 식별용):", userId);
      console.log("userKey (차량번호 표시용):", userKey);

      if (!currentUser || !userId) {
        console.warn("userId가 없습니다. selectedAmbulance 초기화");
        set({ selectedAmbulance: null, ambulances: [] });
        return;
      }

      if (!accessToken) {
        console.warn("accessToken이 없습니다. 인증 문제 가능성 있음");
      }

      // 🔥 실제로는 여기서 백엔드 API 호출해서 환자 데이터 가져와야 함
      // const patientData = await getPatientInfo(userId);
      // 백엔드에서 받아온 데이터에 JSON 문자열이 있으면 파싱 처리
      
      const currentState = get();
      const existingAmbulance = currentState.selectedAmbulance;
      console.log("기존 selectedAmbulance:", existingAmbulance);

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
        console.log("기존 환자 데이터가 있어서 보존합니다.");
        
        // 🔥 기존 데이터도 JSON 문자열이 있으면 파싱 처리
        currentAmbulance.patientInfo = parseBackendDataToFrontend(existingAmbulance.patientInfo);
        currentAmbulance.patientDetails = parseBackendDataToFrontend(existingAmbulance.patientDetails);
      } else {
        console.log("기존 환자 데이터가 없어서 빈 값으로 초기화합니다.");
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
          familyHistory: "",    // 🔥 순수 문자열
          pastHistory: "",      // 🔥 순수 문자열
          medications: "",      // 🔥 순수 문자열
          vitalSigns: "",       // 🔥 순수 문자열
        };
      }

      console.log("선택된 구급차로 설정할 데이터 (순수 문자열 버전):", currentAmbulance);

      set({ selectedAmbulance: currentAmbulance, ambulances: [currentAmbulance] });

      console.log("=== fetchAmbulances 완료 (순수 문자열 버전) ===");
    } catch (error) {
      console.error("fetchAmbulances 오류:", error);
      set({ selectedAmbulance: null, ambulances: [] });
    }
  },

  // 🔥 완전히 수정된 updatePatientInfo - 순수 문자열 처리
  updatePatientInfo: async (ambulanceId, newPatientData) => {
    console.log("=== updatePatientInfo 시작 (순수 문자열 처리) ===");
    console.log("ambulanceId (userId):", ambulanceId);
    console.log("newPatientData:", newPatientData);

    if (!ambulanceId) {
      console.error("ambulanceId(userId)가 없습니다. updatePatientInfo 중단");
      return;
    }

    if (
      !newPatientData ||
      (!newPatientData.patientInfo && !newPatientData.patientDetails)
    ) {
      console.error("업데이트할 환자 데이터가 없습니다. 중단");
      return;
    }

    const currentState = get();
    console.log("업데이트 전 상태 selectedAmbulance:", currentState.selectedAmbulance);

    let apiSuccess = false;
    try {
      // 🔥 핵심 수정 1: 필수 정보 = KTAS(Integer) + 진료과목(String) + 위치 정보
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
            true // 위치 정보 포함
          );
          
          if (validatedRequired) {
            console.log("🔥 필수 정보 저장 시도 (순수 문자열 형식):", validatedRequired);
            console.log("🔥 예상 DB 저장 형태 (순수 문자열):", {
              "pKtas": `${validatedRequired.ktas} (Integer)`,
              "pDepartment": `"${validatedRequired.department}" (String)`,
              "pLatitude": `${validatedRequired.latitude} (Double)`,
              "pLongitude": `${validatedRequired.longitude} (Double)`
            });
            
            await saveRequiredPatientInfo(validatedRequired);
            console.log("✅ 필수 정보 저장 성공!");
            
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
          } else {
            console.warn("⚠️ 필수 정보가 검증을 통과하지 못함");
          }
        } else {
          console.warn("⚠️ KTAS 또는 진료과목이 유효하지 않아서 필수 정보 저장 생략");
          console.warn("ktasLevel:", ktasLevel, "유효:", isValidKtas);
          console.warn("department:", department, "유효:", isValidDepartment);
        }
      }

      // 🔥 핵심 수정 2: 선택 정보는 순수 문자열로 변환 후 전송
      if (
        newPatientData.patientInfo &&
        Object.keys(newPatientData.patientInfo).length > 0
      ) {
        console.log("🔥 선택 환자 정보 순수 문자열 변환:", newPatientData.patientInfo);
        
        const filteredPatientInfo = await validateAndFilterApiData(
          newPatientData.patientInfo, 
          'optional',
          false
        );
        
        if (filteredPatientInfo) {
          console.log("🔥 선택 환자 정보 저장 시도 (순수 문자열):", filteredPatientInfo);
          console.log("🔥 예상 DB 저장 형태 (순수 문자열):", {
            "pName": `"${filteredPatientInfo.name || ''}" (String)`,
            "pSex": `${filteredPatientInfo.sex || 'null'} (Integer: 1=남, 2=여)`,
            "pAgeRange": `"${filteredPatientInfo.ageRange || 'UNDECIDED'}" (Enum)`
          });
          
          await saveOptionalPatientInfo(filteredPatientInfo);
          console.log("✅ 선택 환자 정보 저장 성공!");
        } else {
          console.log("⚠️ 모든 환자 기본 정보가 빈 값이어서 저장 생략");
        }
      }

      // 🔥 핵심 수정 3: 추가 상세 정보도 순수 문자열로 변환 후 전송
      if (
        newPatientData.patientDetails &&
        Object.keys(newPatientData.patientDetails).length > 0
      ) {
        const { ktasLevel, department, ...otherDetails } = newPatientData.patientDetails;
        
        console.log("🔥 추가 선택 정보 순수 문자열 변환:", otherDetails);
        
        const filteredOtherDetails = await validateAndFilterApiData(
          otherDetails, 
          'optional',
          false
        );
        
        if (filteredOtherDetails) {
          console.log("🔥 추가 선택 정보 저장 시도 (순수 문자열):", filteredOtherDetails);
          console.log("🔥 예상 DB 저장 형태 (순수 문자열):", {
            "pMedicalRecord": `"${filteredOtherDetails.medicalRecord || ''}" (String)`,
            "pFamilyHistory": `"${filteredOtherDetails.familyHistory || ''}" (순수 문자열)`,
            "pPastHistory": `"${filteredOtherDetails.pastHistory || ''}" (순수 문자열)`,
            "pMedicine": `"${filteredOtherDetails.medicine || ''}" (순수 문자열)`,
            "pVitalSigns": `"${filteredOtherDetails.vitalSigns || ''}" (순수 문자열)`
          });
          
          await saveOptionalPatientInfo(filteredOtherDetails);
          console.log("✅ 추가 선택 정보 저장 성공!");
        } else {
          console.log("⚠️ 모든 추가 상세 정보가 빈 값이어서 저장 생략");
        }
      }

      apiSuccess = true;
      console.log("🎉 모든 API 호출 완료! (순수 문자열로 저장됨)");

    } catch (error) {
      console.warn("❌ API 호출 실패하였으나 로컬 스토어 업데이트 계속:", error.message);
      
      if (error.response) {
        console.error("서버 응답 에러:", {
          status: error.response.status,
          statusText: error.response.statusText,
          data: error.response.data,
          url: error.response.config?.url,
          method: error.response.config?.method,
          sentData: error.response.config?.data
        });
        
        if (error.response.status === 400) {
          console.error("🚨 400 Bad Request - 데이터 검증 실패");
          console.error("전송된 데이터:", error.response.config?.data);
          console.error("서버 에러 메시지:", error.response.data);
        }
      }
    }

    // 로컬 스토어 업데이트 (기존과 동일)
    try {
      set((state) => {
        const targetAmbulance = state.ambulances.find(
          (amb) => amb.id === ambulanceId
        );
        if (!targetAmbulance) {
          console.error(`구급차 ID(userId) ${ambulanceId}를 찾지 못함. 상태 변경 없음`);
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

        console.log("✅ 로컬 업데이트 완료. 새 상태:", newState.selectedAmbulance);
        return newState;
      });

      setTimeout(() => {
        const updatedState = get();
        console.log("=== 업데이트 후 상태 확인 (순수 문자열 버전) ===");
        console.log("selectedAmbulance:", updatedState.selectedAmbulance);
        console.log("현재 위치:", updatedState.currentLocation);
      }, 50);

      if (apiSuccess) {
        console.log("🎉 API 저장 및 로컬 업데이트 모두 성공! (순수 문자열로 저장)");
      } else {
        console.log("⚠️ API 저장은 실패했지만 로컬 업데이트 성공");
      }
    } catch (err) {
      console.error("로컬 상태 업데이트 실패:", err);
      throw err;
    }
  },

  // 🔥 현재 위치 가져오는 함수
  getCurrentLocation: async () => {
    try {
      console.log('[Location] 대시보드에서 현재 위치 수동 조회...');
      const locationData = await getCurrentLocationFromDashboard();
      
      set({ 
        currentLocation: locationData,
        locationError: null 
      });
      
      console.log('[Location] 현재 위치 업데이트 완료:', locationData);
      return locationData;
    } catch (error) {
      console.error('[Location] 위치 조회 실패:', error);
      set({ locationError: error.message });
      throw error;
    }
  },

  // 기타 기존 함수들 (기존과 동일)
  selectAmbulance: (ambulance) => {
    console.log("=== selectAmbulance 호출 (userId 기반) ===");
    console.log("선택된 구급차:", ambulance);
    set({ selectedAmbulance: ambulance });
  },

  updateAmbulanceStatus: async (ambulanceId, status) => {
    console.log(`=== updateAmbulanceStatus: ${ambulanceId} -> ${status} (userId 기반) ===`);
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
        console.log("상태 업데이트 완료 (userId 기반):", newState);
        return newState;
      });
    } catch (error) {
      console.warn(`updateAmbulanceStatus 오류 (userId: ${ambulanceId}):`, error);
    }
  },

  addTreatmentRecord: (ambulanceId, record) => {
    console.log(`=== addTreatmentRecord: ${ambulanceId} (userId 기반) ===`, record);
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
      console.log("처치 기록 추가 완료 (userId 기반):", newState);
      return newState;
    });
  },

  getAmbulanceById: (ambulanceId) => {
    const ambulance = get().ambulances.find((amb) => amb.id === ambulanceId);
    console.log(`getAmbulanceById(${ambulanceId}) - userId 기반:`, ambulance);
    return ambulance;
  },

  getDispatchedAmbulances: () => {
    const dispatched = get().ambulances.filter((amb) =>
      ["dispatched", "transporting", "completed", "returning"].includes(
        amb.status
      )
    );
    console.log("getDispatchedAmbulances (userId 기반):", dispatched);
    return dispatched;
  },

  getAvailableAmbulances: () => {
    const available = get().ambulances.filter(
      (amb) => amb.status === "standby" || amb.status === "completed"
    );
    console.log("getAvailableAmbulances (userId 기반):", available);
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
    console.log("getStatistics (userId 기반):", stats);
    return stats;
  },

  // 🔥 완전 순수 문자열 디버깅 함수
  debugCurrentState: () => {
    const state = get();
    const authState = useAuthStore.getState();
    
    console.log("=== 현재 스토어 상태 (순수 문자열 버전) ===");
    console.log("🚑 Emergency Store:");
    console.log("  selectedAmbulance:", state.selectedAmbulance);
    console.log("  selectedAmbulance.id (userId):", state.selectedAmbulance?.id);
    console.log("  selectedAmbulance.carNumber (userKey):", state.selectedAmbulance?.carNumber);
    console.log("  ambulances 개수:", state.ambulances.length);
    
    console.log("📍 위치 정보 (대시보드에서):");
    console.log("  현재 위치:", state.currentLocation);
    console.log("  위치 에러:", state.locationError);
    
    console.log("🔐 Auth Store:");
    console.log("  user:", authState.user);
    console.log("  userId:", authState.user?.userId);
    console.log("  userKey:", authState.user?.userKey);
    console.log("  accessToken 존재:", !!authState.accessToken);
    
    console.log("💾 LocalStorage:");
    console.log("  accessToken 존재:", !!localStorage.getItem('accessToken'));
    
    // 🔥 순수 문자열 매핑 테스트
    if (state.selectedAmbulance) {
      console.log("🧪 순수 문자열 매핑 테스트:");
      
      const testPatientInfo = state.selectedAmbulance.patientInfo;
      const mappedPatientInfo = mapToBackendFields(testPatientInfo, 'optional');
      console.log("  프론트 patientInfo:", testPatientInfo);
      console.log("  DB 저장 형태 (순수 문자열):", mappedPatientInfo);
      
      const testPatientDetails = state.selectedAmbulance.patientDetails;
      const mappedPatientDetails = mapToBackendFields(testPatientDetails, 'optional');
      console.log("  프론트 patientDetails:", testPatientDetails);
      console.log("  DB 저장 형태 (순수 문자열):", mappedPatientDetails);
    }
    
    console.log("🔄 순수 문자열 필드 매핑:");
    console.log("  프론트 → DB 저장 형태:");
    console.log("  ktasLevel → pKtas (Integer)");
    console.log("  department → pDepartment (String)");
    console.log("  gender → pSex (Integer: 1=남, 2=여)");
    console.log("  ageRange → pAgeRange (PatientAgeRange enum)");
    console.log("  name → pName (String)");
    console.log("  chiefComplaint → pMedicalRecord (String)");
    console.log("  familyHistory → pFamilyHistory (순수 문자열)");
    console.log("  pastHistory → pPastHistory (순수 문자열)");
    console.log("  medications → pMedicine (순수 문자열)");
    console.log("  vitalSigns → pVitalSigns (순수 문자열)");
    console.log("  latitude → pLatitude (Double)");
    console.log("  longitude → pLongitude (Double)");
    
    console.log("🎯 이제 JSON 문자열 완전 제거! 모든 필드가 순수 문자열로 저장됨!");
    
    console.log("==================");
    return { emergencyState: state, authState };
  },

  // 🔥 순수 문자열 매핑 테스트 함수
  testPureStringMapping: async (testData, includeLocation = false) => {
    console.log("=== 순수 문자열 매핑 테스트 ===");
    console.log("입력 프론트엔드 데이터:", testData);
    console.log("위치 포함 여부:", includeLocation);
    
    const mappedRequired = await validateAndFilterApiData(testData, 'required', includeLocation);
    console.log("필수 정보 순수 문자열 매핑 결과:", mappedRequired);
    
    const mappedOptional = await validateAndFilterApiData(testData, 'optional', false);
    console.log("선택 정보 순수 문자열 매핑 결과:", mappedOptional);
    
    console.log("🔍 예상 DB 저장 형태 (순수 문자열):");
    if (mappedRequired) {
      console.log("  필수 정보:");
      Object.entries(mappedRequired).forEach(([key, value]) => {
        console.log(`    p${key.charAt(0).toUpperCase() + key.slice(1)}: "${value}" (${typeof value})`);
      });
    }
    if (mappedOptional) {
      console.log("  선택 정보:");
      Object.entries(mappedOptional).forEach(([key, value]) => {
        console.log(`    p${key.charAt(0).toUpperCase() + key.slice(1)}: "${value}" (${typeof value})`);
      });
    }
    
    return { mappedRequired, mappedOptional };
  },

  // 🔥 JSON 문자열 파싱 테스트 함수
  testJsonStringParsing: (testJsonStrings) => {
    console.log("=== JSON 문자열 파싱 테스트 ===");
    
    const results = {};
    Object.entries(testJsonStrings).forEach(([field, jsonString]) => {
      const extracted = extractTextFromJsonString(jsonString);
      results[field] = extracted;
      console.log(`${field}: "${jsonString}" → "${extracted}"`);
    });
    
    console.log("파싱 결과 (순수 문자열):", results);
    return results;
  }
}));

export default useEmergencyStore;
