// src/store/useEmergencyStore.js

import { create } from 'zustand';
import {
  updateAmbulanceStatus,
  saveRequiredPatientInfo,
  saveOptionalPatientInfo,
  // getPatientInfo, // 사용하지 않음, 500 오류 방지 위해 주석 처리
} from '../api/api';
import { useAuthStore } from './useAuthStore';

const useEmergencyStore = create((set, get) => ({
  // 선택된 구급차
  selectedAmbulance: null,
  // 구급차 목록 (실제로는 로그인된 구급차 정보만 가져옴)
  ambulances: [],

  // 구급차 정보 및 환자 정보 불러오기
  fetchAmbulances: async () => {
    console.log('fetchAmbulances called.');
    try {
      const currentUserKey = useAuthStore.getState().user?.userKey;
      console.log('currentUserKey:', currentUserKey);
      if (!currentUserKey) {
        console.warn('No userKey found. Cannot fetch ambulance info.');
        set({ selectedAmbulance: null, ambulances: [] });
        return;
      }

      // getPatientInfo 호출 대신 빈 객체 반환하여 임시 회피
      const patientData = {}; // await getPatientInfo();

      // 가져온 환자 정보를 기반으로 selectedAmbulance 객체 구성
      const currentAmbulance = {
        id: currentUserKey,
        carNumber: currentUserKey, // userKey가 구급차 번호라고 가정
        status: 'unknown', // 상태는 별도 API 필요
        priority: 'unknown', // 우선순위 별도 API 필요
        patientInfo: patientData.patientInfo || {},
        patientDetails: patientData.patientDetails || {},
      };

      // PatientInfoResponseDto 필드 안전하게 매핑
      currentAmbulance.patientInfo = {
        name: patientData.name || '',
        gender: patientData.sex === 1 ? '남' : patientData.sex === 2 ? '여' : '',
        age: patientData.ageRange?.description || '',
      };

      currentAmbulance.patientDetails = {
        ktasLevel: patientData.ktas ? `${patientData.ktas}등급` : '',
        department: patientData.department || '',
        chiefComplaint: patientData.medicalRecord || '',
        treatmentDetails: '',
        familyHistory: patientData.familyHistory || {},
        pastHistory: patientData.pastHistory || {},
        medications: patientData.medicine
          ? [{ name: patientData.medicine, indication: '' }]
          : [],
        vitalSigns: { bloodPressure: patientData.vitalSigns || '' },
      };

      console.log('Constructed currentAmbulance:', currentAmbulance);
      set({ selectedAmbulance: currentAmbulance, ambulances: [currentAmbulance] });
      console.log('selectedAmbulance set.');
    } catch (error) {
      console.error('Failed to fetch ambulance and patient info:', error);
      set({ selectedAmbulance: null, ambulances: [] });
    }
  },

  // 구급차 선택
  selectAmbulance: (ambulance) => {
    set({ selectedAmbulance: ambulance });
  },

  // 구급차 상태 업데이트
  updateAmbulanceStatus: async (ambulanceId, status) => {
    try {
      // 백엔드 API는 ambulanceId를 직접 받지 않으므로, 현재 로그인 구급차 상태를 변경하는 것으로 가정
      await updateAmbulanceStatus(ambulanceId, status); // ambulanceId 미사용
      set((state) => ({
        ambulances: state.ambulances.map((ambulance) =>
          ambulance.id === ambulanceId ? { ...ambulance, status } : ambulance
        ),
        selectedAmbulance:
          state.selectedAmbulance?.id === ambulanceId
            ? { ...state.selectedAmbulance, status }
            : state.selectedAmbulance,
      }));
    } catch (error) {
      console.error(`Failed to update ambulance ${ambulanceId} status:`, error);
    }
  },

  // 처치 기록 추가 (상태관리용, 백엔드 API에는 따로 없음)
  addTreatmentRecord: (ambulanceId, record) => {
    const newRecord = {
      ...record,
      time: new Date().toLocaleTimeString('ko-KR', {
        hour: '2-digit',
        minute: '2-digit',
      }),
    };
    set((state) => ({
      ambulances: state.ambulances.map((ambulance) =>
        ambulance.id === ambulanceId
          ? {
              ...ambulance,
              treatmentRecords: [...(ambulance.treatmentRecords || []), newRecord],
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
    }));
  },

  // 환자 정보 업데이트 (필수+선택 정보)
  updatePatientInfo: async (ambulanceId, newPatientData) => {
    try {
      await saveRequiredPatientInfo(newPatientData.patientInfo);
      await saveOptionalPatientInfo(newPatientData.patientDetails);

      // 백엔드에서 환자 최신 정보 조회 후 상태 업데이트 시도
      // 500 에러 발생 가능성 때문에 호출 안 함
      // const updatedPatientInfo = await getPatientInfo();

      // 임시로 상태에 바로 반영
      set((state) => ({
        ambulances: state.ambulances.map((ambulance) =>
          ambulance.id === ambulanceId
            ? {
                ...ambulance,
                patientInfo: newPatientData.patientInfo,
                patientDetails: newPatientData.patientDetails,
              }
            : ambulance
        ),
        selectedAmbulance:
          state.selectedAmbulance?.id === ambulanceId
            ? {
                ...state.selectedAmbulance,
                patientInfo: newPatientData.patientInfo,
                patientDetails: newPatientData.patientDetails,
              }
            : state.selectedAmbulance,
      }));
    } catch (error) {
      console.error(`Failed to update patient info for ambulance ${ambulanceId}:`, error);
    }
  },

  // 특정 구급차 조회
  getAmbulanceById: (ambulanceId) => {
    return get().ambulances.find((ambulance) => ambulance.id === ambulanceId);
  },

  // 배차된 구급차 목록 조회
  getDispatchedAmbulances: () => {
    return get()
      .ambulances.filter((ambulance) =>
        ['dispatched', 'transporting', 'completed', 'returning'].includes(
          ambulance.status
        )
      );
  },

  // 출동 가능한 구급차 목록
  getAvailableAmbulances: () => {
    return get().ambulances.filter(
      (ambulance) => ambulance.status === 'standby' || ambulance.status === 'completed'
    );
  },

  // 전체 통계
  getStatistics: () => {
    const ambulances = get().ambulances;
    return {
      total: ambulances.length,
      dispatched: get().getDispatchedAmbulances().length,
      available: get().getAvailableAmbulances().length,
      emergency: ambulances.filter((a) => a.priority === '응급').length,
      urgent: ambulances.filter((a) => a.priority === '긴급').length,
      normal: ambulances.filter((a) => a.priority === '보통').length,
    };
  },
}));

export default useEmergencyStore;
