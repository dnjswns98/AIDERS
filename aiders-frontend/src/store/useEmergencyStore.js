import { create } from 'zustand';
import { updateAmbulanceStatus, saveRequiredPatientInfo, saveOptionalPatientInfo, getPatientInfo } from '../api/api';
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

      // 로그인된 구급차의 환자 정보를 가져옵니다.
      const patientData = await getPatientInfo();
      console.log('patientData from getPatientInfo:', patientData);

      // 가져온 환자 정보를 기반으로 selectedAmbulance 객체를 구성합니다.
      // 구급차의 ID는 userKey를 사용하고, carNumber는 userKey가 carNumber라고 가정합니다.
      const currentAmbulance = {
        id: currentUserKey,
        carNumber: currentUserKey, // userKey가 구급차 번호라고 가정
        status: 'unknown', // 백엔드에서 구급차 상태를 가져오는 API가 없으므로 임시로 설정
        priority: 'unknown', // 백엔드에서 구급차 우선순위를 가져오는 API가 없으므로 임시로 설정
        patientInfo: patientData.patientInfo || {}, // PatientInfoResponseDto에서 patientInfo가 직접 제공되지 않으므로, DTO의 필드를 매핑
        patientDetails: patientData.patientDetails || {}, // PatientInfoResponseDto에서 patientDetails가 직접 제공되지 않으므로, DTO의 필드를 매핑
        // PatientInfoResponseDto의 필드를 patientInfo와 patientDetails에 맞게 매핑
        // 예시: patientInfo: { name: patientData.name, gender: patientData.sex === 1 ? '남' : '여', age: patientData.ageRange.description },
        // patientDetails: { ktasLevel: patientData.ktas + '등급', department: patientData.department, chiefComplaint: patientData.medicalRecord, vitalSigns: { bloodPressure: patientData.vitalSigns } }
      };

      // PatientInfoResponseDto의 필드를 selectedAmbulance의 patientInfo와 patientDetails에 매핑
      currentAmbulance.patientInfo = {
        name: patientData.name || '',
        gender: patientData.sex === 1 ? '남' : (patientData.sex === 2 ? '여' : ''),
        age: patientData.ageRange?.description || '',
      };

      currentAmbulance.patientDetails = {
        ktasLevel: patientData.ktas ? `${patientData.ktas}등급` : '',
        department: patientData.department || '',
        chiefComplaint: patientData.medicalRecord || '',
        treatmentDetails: '', // 백엔드 DTO에 없음
        familyHistory: patientData.familyHistory || {},
        pastHistory: patientData.pastHistory || {},
        medications: patientData.medicine ? [{ name: patientData.medicine, indication: '' }] : [],
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
      // 백엔드 API는 ambulanceId를 직접 받지 않으므로, 현재 로그인된 구급차의 상태를 변경하는 것으로 가정합니다.
      await updateAmbulanceStatus(ambulanceId, status); // ambulanceId는 현재 사용되지 않음
      set(state => ({
        ambulances: state.ambulances.map(ambulance =>
          ambulance.id === ambulanceId
            ? { ...ambulance, status }
            : ambulance
        ),
        selectedAmbulance: state.selectedAmbulance?.id === ambulanceId
          ? { ...state.selectedAmbulance, status }
          : state.selectedAmbulance
      }));
    } catch (error) {
      console.error(`Failed to update ambulance ${ambulanceId} status:`, error);
    }
  },

  // 처치 기록 추가 (백엔드 API에 직접 매핑되는 엔드포인트 없음, 환자 정보 업데이트에 포함될 수 있음)
  addTreatmentRecord: (ambulanceId, record) => {
    const newRecord = {
      ...record,
      time: new Date().toLocaleTimeString('ko-KR', { 
        hour: '2-digit', 
        minute: '2-digit' 
      })
    };

    set(state => ({
      ambulances: state.ambulances.map(ambulance =>
        ambulance.id === ambulanceId
          ? { 
              ...ambulance, 
              treatmentRecords: [...(ambulance.treatmentRecords || []), newRecord]
            }
          : ambulance
      ),
      selectedAmbulance: state.selectedAmbulance?.id === ambulanceId
        ? { 
            ...state.selectedAmbulance, 
            treatmentRecords: [...(state.selectedAmbulance.treatmentRecords || []), newRecord]
            }
          : state.selectedAmbulance
    }));
  },

  // 환자 정보 업데이트
  updatePatientInfo: async (ambulanceId, newPatientData) => {
    try {
      // 백엔드 API는 필수 정보와 선택 정보를 분리하여 저장합니다.
      // 여기서는 편의상 두 API를 모두 호출합니다.
      await saveRequiredPatientInfo(newPatientData.patientInfo);
      await saveOptionalPatientInfo(newPatientData.patientDetails);

      // 백엔드에서 최신 환자 정보를 다시 가져와서 상태를 업데이트합니다.
      const updatedPatientInfo = await getPatientInfo();

      set(state => ({
        ambulances: state.ambulances.map(ambulance =>
          ambulance.id === ambulanceId
            ? { 
                ...ambulance, 
                patientInfo: updatedPatientInfo.patientInfo,
                patientDetails: updatedPatientInfo.patientDetails
              }
            : ambulance
        ),
        selectedAmbulance: state.selectedAmbulance?.id === ambulanceId
          ? { 
              ...state.selectedAmbulance, 
              patientInfo: updatedPatientInfo.patientInfo,
              patientDetails: updatedPatientInfo.patientDetails
            }
          : state.selectedAmbulance
      }));
    } catch (error) {
      console.error(`Failed to update patient info for ambulance ${ambulanceId}:`, error);
    }
  },

  // 특정 구급차 정보 가져오기
  getAmbulanceById: (ambulanceId) => {
    return get().ambulances.find(ambulance => ambulance.id === ambulanceId);
  },

  // 배차된 구급차 목록 가져오기
  getDispatchedAmbulances: () => {
    return get().ambulances.filter(ambulance => 
      ['dispatched', 'transporting', 'completed', 'returning'].includes(ambulance.status)
    );
  },

  // 출동 가능한 구급차 목록 가져오기
  getAvailableAmbulances: () => {
    return get().ambulances.filter(ambulance => ambulance.status === 'standby' || ambulance.status === 'completed');
  },

  // 전체 통계
  getStatistics: () => {
    const ambulances = get().ambulances;
    return {
      total: ambulances.length,
      dispatched: get().getDispatchedAmbulances().length,
      available: get().getAvailableAmbulances().length,
      emergency: ambulances.filter(a => a.priority === '응급').length,
      urgent: ambulances.filter(a => a.priority === '긴급').length,
      normal: ambulances.filter(a => a.priority === '보통').length
    };
  }
}));

export default useEmergencyStore;