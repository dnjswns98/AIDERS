import { create } from 'zustand';

// 대기중인 구급차 목록 데이터
const initialAmbulances = [
  {
    id: 1,
    vehicleNumber: "서울응급01호",
    patientInfo: {
      name: "안영희",
      gender: "여성",
      age: 65,
      basicInfo: "여성, 65세"
    },
    condition: "갑작스런 호흡곤란",
    eta: "5분",
    distance: "1.2km",
    priority: "긴급",
    status: "connected", // connected, waiting
    callTime: "13:20",
    // 상세 환자 정보
    patientDetails: {
      ktasLevel: "KTAS 2등급 (긴급)",
      chiefComplaint: "갑작스런 호흡곤란, 가슴 답답함, 어지러움",
      admissionRoute: "점심식사 후 호흡곤란 발생, 가족이 119 신고",
      duration: "약 2시간 전부터 시작되어 점차 악화",
      onsetSituation: "점심식사 후 갑작스럽게 호흡곤란 발생",
      accompanyingSymptoms: "어지러움, 전신 무력감, 식은땀, 창백",
      vitalSigns: {
        bloodPressure: "165/95 mmHg",
        pulse: "110회/분 (빈맥)",
        respiration: "28회/분 (빈호흡)",
        temperature: "36.8°C",
        oxygenSaturation: "88% (실내공기)",
        consciousness: "명료하나 불안해함"
      },
      pastHistory: {
        hypertension: "10년 전 진단, 약물 치료 중",
        diabetes: "5년 전 진단, 경구혈당강하제 복용",
        hypothyroidism: "3년 전 진단, 호르몬 보충 치료",
        osteoporosis: "2년 전 진단, 칼슘/비타민D 보충"
      },
      medications: [
        { name: "아모디핀 5mg", frequency: "1일 1회", indication: "고혈압" },
        { name: "메트포르민 500mg", frequency: "1일 2회", indication: "당뇨병" },
        { name: "신지로이드 75mcg", frequency: "1일 1회", indication: "갑상선기능저하증" },
        { name: "칼슘600 1정", frequency: "1일 2회", indication: "골다공증" },
        { name: "비타민D 1000IU", frequency: "1일 1회", indication: "" }
      ],
      familyHistory: {
        father: "고혈압, 뇌출혈로 사망(75세)",
        mother: "당뇨병, 심근경색으로 사망(78세)",
        siblings: "2남 1녀 중 둘째, 언니는 유방암 병력"
      },
      transportInfo: {
        dispatchTime: "오후 1시 20분",
        arrivalTime: "오후 1시 26분 (6분 소요)",
        departureTime: "오후 1시 30분",
        hospitalArrival: "오후 1시 35분 (5분 소요)",
        totalDistance: "4.0km (현장까지 2.8km + 병원까지 1.2km)"
      }
    },
    // 응급처치 기록
    treatmentRecords: [
      { 
        time: '13:26', 
        action: '현장 도착 및 환자 발견', 
        detail: '호흡곤란, 가슴 답답함 호소, 의식 명료하나 불안해함' 
      },
      { 
        time: '13:27', 
        action: '초기 활력징후 측정', 
        detail: '혈압 165/95, 맥박 110, 호흡 28, 산소포화도 88%' 
      },
      { 
        time: '13:28', 
        action: '기도 및 호흡 관리', 
        detail: '고농도 산소 투여 (10L/min, reservoir mask), 반좌위 체위' 
      },
      { 
        time: '13:29', 
        action: '순환기계 처치', 
        detail: '말초 정맥로 확보 (18G IV cannula), 심전도 모니터링 시작' 
      },
      { 
        time: '13:30', 
        action: '현장 출발', 
        detail: '지속적 산소포화도 모니터링 하에 병원 이송 시작' 
      },
      { 
        time: '13:35', 
        action: '병원 도착', 
        detail: '응급실 인계, 추가 검사 및 치료 계획 수립' 
      }
    ]
  },
  {
    id: 2,
    vehicleNumber: "서울응급02호", 
    patientInfo: {
      name: "김철수",
      gender: "남성",
      age: 45,
      basicInfo: "남성, 45세"
    },
    condition: "교통사고",
    eta: "12분",
    distance: "4.1km",
    priority: "긴급",
    status: "waiting",
    callTime: "14:35",
    patientDetails: {
      ktasLevel: "KTAS 2등급 (긴급)",
      chiefComplaint: "교통사고로 인한 외상",
      admissionRoute: "교통사고 현장에서 119 신고"
    },
    treatmentRecords: []
  },
  {
    id: 3,
    vehicleNumber: "서울응급03호",
    patientInfo: {
      name: "박민수",
      gender: "남성", 
      age: 28,
      basicInfo: "남성, 28세"
    },
    condition: "의식잃음",
    eta: "8분",
    distance: "3.2km",
    priority: "응급",
    status: "waiting",
    callTime: "14:38",
    patientDetails: {
      ktasLevel: "KTAS 1등급 (응급)",
      chiefComplaint: "의식 소실",
      admissionRoute: "길에서 쓰러진 것을 발견하여 119 신고"
    },
    treatmentRecords: []
  },
  {
    id: 4,
    vehicleNumber: "서울응급04호",
    patientInfo: {
      name: "이순자",
      gender: "여성",
      age: 72,
      basicInfo: "여성, 72세"
    },
    condition: "낙상사고",
    eta: "15분",
    distance: "5.1km",
    priority: "보통",
    status: "waiting",
    callTime: "14:42",
    patientDetails: {
      ktasLevel: "KTAS 3등급 (보통)",
      chiefComplaint: "낙상으로 인한 외상",
      admissionRoute: "집에서 넘어져 가족이 119 신고"
    },
    treatmentRecords: []
  }
];

const useEmergencyStore = create((set, get) => ({
  // 구급차 목록
  ambulances: initialAmbulances,
  
  // 선택된 구급차
  selectedAmbulance: initialAmbulances[0],

  // 구급차 선택
  selectAmbulance: (ambulance) => {
    set({ selectedAmbulance: ambulance });
  },

  // 구급차 상태 업데이트
  updateAmbulanceStatus: (ambulanceId, status) => {
    set((state) => ({
      ambulances: state.ambulances.map(ambulance =>
        ambulance.id === ambulanceId
          ? { ...ambulance, status }
          : ambulance
      ),
      selectedAmbulance: state.selectedAmbulance?.id === ambulanceId
        ? { ...state.selectedAmbulance, status }
        : state.selectedAmbulance
    }));
  },

  // 처치 기록 추가
  addTreatmentRecord: (ambulanceId, record) => {
    const newRecord = {
      ...record,
      time: new Date().toLocaleTimeString('ko-KR', { 
        hour: '2-digit', 
        minute: '2-digit' 
      })
    };

    set((state) => ({
      ambulances: state.ambulances.map(ambulance =>
        ambulance.id === ambulanceId
          ? { 
              ...ambulance, 
              treatmentRecords: [...ambulance.treatmentRecords, newRecord]
            }
          : ambulance
      ),
      selectedAmbulance: state.selectedAmbulance?.id === ambulanceId
        ? { 
            ...state.selectedAmbulance, 
            treatmentRecords: [...state.selectedAmbulance.treatmentRecords, newRecord]
          }
        : state.selectedAmbulance
    }));
  },

  // 환자 정보 업데이트
  updatePatientInfo: (ambulanceId, patientInfo) => {
    set((state) => ({
      ambulances: state.ambulances.map(ambulance =>
        ambulance.id === ambulanceId
          ? { 
              ...ambulance, 
              patientDetails: { ...ambulance.patientDetails, ...patientInfo }
            }
          : ambulance
      ),
      selectedAmbulance: state.selectedAmbulance?.id === ambulanceId
        ? { 
            ...state.selectedAmbulance, 
            patientDetails: { ...state.selectedAmbulance.patientDetails, ...patientInfo }
          }
        : state.selectedAmbulance
    }));
  },

  // 특정 구급차 정보 가져오기
  getAmbulanceById: (ambulanceId) => {
    return get().ambulances.find(ambulance => ambulance.id === ambulanceId);
  },

  // 연결된 구급차 목록 가져오기
  getConnectedAmbulances: () => {
    return get().ambulances.filter(ambulance => ambulance.status === 'connected');
  },

  // 대기중인 구급차 목록 가져오기
  getWaitingAmbulances: () => {
    return get().ambulances.filter(ambulance => ambulance.status === 'waiting');
  },

  // 전체 통계
  getStatistics: () => {
    const ambulances = get().ambulances;
    return {
      total: ambulances.length,
      connected: ambulances.filter(a => a.status === 'connected').length,
      waiting: ambulances.filter(a => a.status === 'waiting').length,
      emergency: ambulances.filter(a => a.priority === '응급').length,
      urgent: ambulances.filter(a => a.priority === '긴급').length,
      normal: ambulances.filter(a => a.priority === '보통').length
    };
  }
}));

export default useEmergencyStore;