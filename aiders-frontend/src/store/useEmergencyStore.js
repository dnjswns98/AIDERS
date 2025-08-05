// src/store/useEmergencyStore.js

import { create } from "zustand";
import {
  updateAmbulanceStatus,
  saveRequiredPatientInfo,
  saveOptionalPatientInfo,
  // getPatientInfo, // 사용하지 않음, 500 오류 방지 위해 주석 처리
} from "../api/api";
import { useAuthStore } from "./useAuthStore";

const useEmergencyStore = create((set, get) => ({
  // 선택된 구급차
  selectedAmbulance: null,
  // 구급차 목록 (실제로는 로그인된 구급차 정보만 가져옴)
  ambulances: [],


  


  // 구급차 정보 및 환자 정보 불러오기
  fetchAmbulances: async () => {
  console.log('=== fetchAmbulances 시작 ===');
  try {
    const currentUserKey = useAuthStore.getState().user?.userKey;
    console.log('currentUserKey:', currentUserKey);
    
    if (!currentUserKey) {
      console.warn('No userKey found. Cannot fetch ambulance info.');
      set({ selectedAmbulance: null, ambulances: [] });
      return;
    }

    // 현재 상태 확인 - 기존 데이터가 있으면 보존
    const currentState = get();
    const existingAmbulance = currentState.selectedAmbulance;
    
    console.log('기존 구급차 데이터:', existingAmbulance);

    // getPatientInfo 호출 대신 빈 객체 반환하여 임시 회피
    const patientData = {}; // await getPatientInfo();
    console.log('patientData:', patientData);

    // 가져온 환자 정보를 기반으로 selectedAmbulance 객체 구성
    const currentAmbulance = {
      id: currentUserKey,
      carNumber: currentUserKey, // userKey가 구급차 번호라고 가정
      status: existingAmbulance?.status || 'unknown', // 기존 상태 보존
      priority: existingAmbulance?.priority || 'unknown', // 기존 우선순위 보존
      patientInfo: {},
      patientDetails: {},
    };

    // 기존 데이터가 있으면 보존, 없으면 새로 생성
    if (existingAmbulance && (
        Object.keys(existingAmbulance.patientInfo || {}).some(key => existingAmbulance.patientInfo[key]) ||
        Object.keys(existingAmbulance.patientDetails || {}).some(key => existingAmbulance.patientDetails[key])
      )) {
      console.log('기존 환자 데이터가 있어서 보존합니다.');
      currentAmbulance.patientInfo = existingAmbulance.patientInfo;
      currentAmbulance.patientDetails = existingAmbulance.patientDetails;
    } else {
      console.log('기존 환자 데이터가 없어서 새로 생성합니다.');
      // PatientInfoResponseDto 필드 안전하게 매핑
      currentAmbulance.patientInfo = {
        name: patientData.name || '',
        gender: patientData.sex === 1 ? '남' : patientData.sex === 2 ? '여' : '',
        age: patientData.ageRange?.description || '',
      };

      currentAmbulance.patientDetails = {
        ktasLevel: patientData.ktas ? `${patientData.ktas}등급` : '',
        department: patientData.department || '',
        ageRange: patientData.ageRange?.description || '',
        chiefComplaint: patientData.medicalRecord || '',
        treatmentDetails: '',
        familyHistory: patientData.familyHistory || {},
        pastHistory: patientData.pastHistory || {},
        medications: patientData.medicine
          ? [{ name: patientData.medicine, indication: '' }]
          : [],
        vitalSigns: { bloodPressure: patientData.vitalSigns || '' },
      };
    }

    console.log('=== 최종 구성된 currentAmbulance ===');
    console.log('currentAmbulance:', currentAmbulance);
    console.log('patientInfo:', currentAmbulance.patientInfo);
    console.log('patientDetails:', currentAmbulance.patientDetails);
    
    set({ selectedAmbulance: currentAmbulance, ambulances: [currentAmbulance] });
    console.log('=== fetchAmbulances 완료 (데이터 보존됨) ===');
    
  } catch (error) {
    console.error('Failed to fetch ambulance and patient info:', error);
    set({ selectedAmbulance: null, ambulances: [] });
  }
},

  // 구급차 선택
  selectAmbulance: (ambulance) => {
    console.log("=== selectAmbulance ===");
    console.log("선택된 구급차:", ambulance);
    set({ selectedAmbulance: ambulance });
  },

  // 구급차 상태 업데이트
  updateAmbulanceStatus: async (ambulanceId, status) => {
    console.log(`=== updateAmbulanceStatus: ${ambulanceId} -> ${status} ===`);
    try {
      // 백엔드 API는 ambulanceId를 직접 받지 않으므로, 현재 로그인 구급차 상태를 변경하는 것으로 가정
      await updateAmbulanceStatus(ambulanceId, status); // ambulanceId 미사용

      set((state) => {
        const newState = {
          ambulances: state.ambulances.map((ambulance) =>
            ambulance.id === ambulanceId ? { ...ambulance, status } : ambulance
          ),
          selectedAmbulance:
            state.selectedAmbulance?.id === ambulanceId
              ? { ...state.selectedAmbulance, status }
              : state.selectedAmbulance,
        };
        console.log("상태 업데이트 완료:", newState);
        return newState;
      });
    } catch (error) {
      console.error(`Failed to update ambulance ${ambulanceId} status:`, error);
    }
  },

  // 처치 기록 추가 (상태관리용, 백엔드 API에는 따로 없음)
  addTreatmentRecord: (ambulanceId, record) => {
    console.log(`=== addTreatmentRecord: ${ambulanceId} ===`);
    console.log("추가할 기록:", record);

    const newRecord = {
      ...record,
      time: new Date().toLocaleTimeString("ko-KR", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    set((state) => {
      const newState = {
        ambulances: state.ambulances.map((ambulance) =>
          ambulance.id === ambulanceId
            ? {
                ...ambulance,
                treatmentRecords: [
                  ...(ambulance.treatmentRecords || []),
                  newRecord,
                ],
              }
            : ambulance
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
      console.log("처치 기록 추가 완료:", newState);
      return newState;
    });
  },

  // 환자 정보 업데이트 (필수+선택 정보) - 핵심 수정 부분
  updatePatientInfo: async (ambulanceId, newPatientData) => {
    console.log("=== updatePatientInfo 시작 ===");
    console.log("ambulanceId:", ambulanceId);
    console.log("newPatientData:", newPatientData);

    // 입력 데이터 검증
    if (!ambulanceId) {
      console.error("ambulanceId가 없습니다.");
      throw new Error("ambulanceId is required");
    }

    if (
      !newPatientData ||
      (!newPatientData.patientInfo && !newPatientData.patientDetails)
    ) {
      console.error("업데이트할 환자 데이터가 없습니다.");
      throw new Error("Patient data is required");
    }

    // 현재 상태 확인
    const currentState = get();
    console.log("업데이트 전 현재 상태:");
    console.log("- selectedAmbulance:", currentState.selectedAmbulance);

    // 백엔드 API 호출 (실패해도 로컬 스토어는 업데이트)
    let apiSuccess = false;

    try {
      // 필수 정보 저장 시도
      if (
        newPatientData.patientInfo &&
        Object.keys(newPatientData.patientInfo).length > 0
      ) {
        console.log("필수 환자 정보 저장 시도 중...");
        await saveRequiredPatientInfo(newPatientData.patientInfo);
        console.log("필수 환자 정보 저장 성공");
      }

      // 선택 정보 저장 시도
      if (
        newPatientData.patientDetails &&
        Object.keys(newPatientData.patientDetails).length > 0
      ) {
        console.log("선택 환자 정보 저장 시도 중...");
        await saveOptionalPatientInfo(newPatientData.patientDetails);
        console.log("선택 환자 정보 저장 성공");
      }

      apiSuccess = true;
    } catch (error) {
      console.warn(
        "API 호출 실패, 하지만 로컬 스토어는 업데이트합니다:",
        error.message
      );
      // API 실패해도 계속 진행
    }

    // 로컬 스토어는 항상 업데이트
    try {
      set((state) => {
        console.log("=== 스토어 상태 업데이트 중 ===");

        // 기존 구급차 정보 찾기
        const targetAmbulance = state.ambulances.find(
          (amb) => amb.id === ambulanceId
        );
        if (!targetAmbulance) {
          console.error(`구급차 ID ${ambulanceId}를 찾을 수 없습니다.`);
          return state; // 상태 변경 없음
        }

        console.log("업데이트 대상 구급차:", targetAmbulance);

        // 새로운 환자 정보 병합
        const updatedPatientInfo = {
          ...targetAmbulance.patientInfo,
          ...newPatientData.patientInfo,
        };

        const updatedPatientDetails = {
          ...targetAmbulance.patientDetails,
          ...newPatientData.patientDetails,
        };

        console.log("병합된 환자 정보:");
        console.log("- patientInfo:", updatedPatientInfo);
        console.log("- patientDetails:", updatedPatientDetails);

        // 업데이트된 구급차 객체 생성
        const updatedAmbulance = {
          ...targetAmbulance,
          patientInfo: updatedPatientInfo,
          patientDetails: updatedPatientDetails,
        };

        console.log("최종 업데이트된 구급차:", updatedAmbulance);

        // 새로운 상태 생성
        const newState = {
          ...state,
          ambulances: state.ambulances.map((ambulance) =>
            ambulance.id === ambulanceId ? updatedAmbulance : ambulance
          ),
          selectedAmbulance:
            state.selectedAmbulance?.id === ambulanceId
              ? updatedAmbulance
              : state.selectedAmbulance,
        };

        console.log("=== 최종 새로운 상태 ===");
        console.log(
          "- 업데이트된 selectedAmbulance:",
          newState.selectedAmbulance
        );
        console.log("=== updatePatientInfo 완료 ===");

        return newState;
      });

      // 업데이트 후 상태 확인
      setTimeout(() => {
        const updatedState = get();
        console.log("=== 업데이트 후 상태 확인 ===");
        console.log("selectedAmbulance:", updatedState.selectedAmbulance);
        console.log(
          "selectedAmbulance.patientInfo:",
          updatedState.selectedAmbulance?.patientInfo
        );
        console.log(
          "selectedAmbulance.patientDetails:",
          updatedState.selectedAmbulance?.patientDetails
        );
      }, 50);

      // 성공 메시지
      if (apiSuccess) {
        console.log("✅ API 저장 및 로컬 업데이트 모두 성공");
      } else {
        console.log("⚠️ API 저장은 실패했지만 로컬 업데이트는 성공");
      }
    } catch (error) {
      console.error(`로컬 스토어 업데이트 실패:`, error);
      throw error;
    }
  },

  // 특정 구급차 조회
  getAmbulanceById: (ambulanceId) => {
    const ambulance = get().ambulances.find(
      (ambulance) => ambulance.id === ambulanceId
    );
    console.log(`getAmbulanceById(${ambulanceId}):`, ambulance);
    return ambulance;
  },

  // 배차된 구급차 목록 조회
  getDispatchedAmbulances: () => {
    const dispatched = get().ambulances.filter((ambulance) =>
      ["dispatched", "transporting", "completed", "returning"].includes(
        ambulance.status
      )
    );
    console.log("getDispatchedAmbulances:", dispatched);
    return dispatched;
  },

  // 출동 가능한 구급차 목록
  getAvailableAmbulances: () => {
    const available = get().ambulances.filter(
      (ambulance) =>
        ambulance.status === "standby" || ambulance.status === "completed"
    );
    console.log("getAvailableAmbulances:", available);
    return available;
  },

  // 전체 통계
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
    console.log("getStatistics:", stats);
    return stats;
  },

  // 디버깅용 함수 - 현재 상태 출력
  debugCurrentState: () => {
    const state = get();
    console.log("=== 현재 스토어 상태 ===");
    console.log("selectedAmbulance:", state.selectedAmbulance);
    console.log("ambulances:", state.ambulances);
    console.log("==================");
    return state;
  },
}));

export default useEmergencyStore;
