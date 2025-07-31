import { create } from 'zustand';

const useEmergencyStore = create((set, get) => ({
  // 선택된 구급차
  selectedAmbulance: null,

  // 구급차 선택
  selectAmbulance: (ambulance) => {
    set({ selectedAmbulance: ambulance });
  },

  // 구급차 상태 업데이트
  updateAmbulanceStatus: (ambulanceId, status, setAmbulances) => {
    setAmbulances(prevAmbulances => prevAmbulances.map(ambulance =>
      ambulance.id === ambulanceId
        ? { ...ambulance, status }
        : ambulance
    ));
    set(state => ({
      selectedAmbulance: state.selectedAmbulance?.id === ambulanceId
        ? { ...state.selectedAmbulance, status }
        : state.selectedAmbulance
    }));
  },

  // 처치 기록 추가
  addTreatmentRecord: (ambulanceId, record, setAmbulances) => {
    const newRecord = {
      ...record,
      time: new Date().toLocaleTimeString('ko-KR', { 
        hour: '2-digit', 
        minute: '2-digit' 
      })
    };

    setAmbulances(prevAmbulances => prevAmbulances.map(ambulance =>
      ambulance.id === ambulanceId
        ? { 
              ...ambulance, 
              treatmentRecords: [...(ambulance.treatmentRecords || []), newRecord]
            }
          : ambulance
      ));
    set(state => ({
      selectedAmbulance: state.selectedAmbulance?.id === ambulanceId
        ? { 
            ...state.selectedAmbulance, 
            treatmentRecords: [...(state.selectedAmbulance.treatmentRecords || []), newRecord]
            }
          : state.selectedAmbulance
    }));
  },

  // 환자 정보 업데이트
  updatePatientInfo: (ambulanceId, newPatientData, setAmbulances) => {
    setAmbulances(prevAmbulances => prevAmbulances.map(ambulance =>
      ambulance.id === ambulanceId
        ? { 
              ...ambulance, 
              patientInfo: { ...ambulance.patientInfo, ...newPatientData.patientInfo },
              patientDetails: { ...ambulance.patientDetails, ...newPatientData.patientDetails }
            }
          : ambulance
      ));
    set(state => ({
      selectedAmbulance: state.selectedAmbulance?.id === ambulanceId
        ? { 
            ...state.selectedAmbulance, 
            patientInfo: { ...state.selectedAmbulance.patientInfo, ...newPatientData.patientInfo },
            patientDetails: { ...state.selectedAmbulance.patientDetails, ...newPatientData.patientDetails }
            }
          : state.selectedAmbulance
    }));
  },

  // 특정 구급차 정보 가져오기
  getAmbulanceById: (ambulances, ambulanceId) => {
    return ambulances.find(ambulance => ambulance.id === ambulanceId);
  },

  // 배차된 구급차 목록 가져오기
  getDispatchedAmbulances: (ambulances) => {
    return ambulances.filter(ambulance => 
      ['dispatched', 'transporting', 'completed', 'returning'].includes(ambulance.status)
    );
  },

  // 출동 가능한 구급차 목록 가져오기
  getAvailableAmbulances: (ambulances) => {
    return ambulances.filter(ambulance => ambulance.status === 'standby' || ambulance.status === 'completed');
  },

  // 전체 통계
  getStatistics: (ambulances) => {
    return {
      total: ambulances.length,
      dispatched: get().getDispatchedAmbulances(ambulances).length,
      available: get().getAvailableAmbulances(ambulances).length,
      emergency: ambulances.filter(a => a.priority === '응급').length,
      urgent: ambulances.filter(a => a.priority === '긴급').length,
      normal: ambulances.filter(a => a.priority === '보통').length
    };
  }
}));

export default useEmergencyStore;