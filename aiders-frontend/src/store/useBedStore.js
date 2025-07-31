import { create } from 'zustand';

const initialHospitals = [
  { id: 1, name: '순천향대학교 부속 구미병원', latitude: 36.139, longitude: 128.333, beds: 250 },
  { id: 2, name: '구미차병원', latitude: 36.115, longitude: 128.421, beds: 300 },
  { id: 3, name: '구미강동병원', latitude: 36.108, longitude: 128.418, beds: 150 },
  { id: 4, name: '김천제일병원', latitude: 36.138, longitude: 128.111, beds: 200 },
];

const initialBedData = [
  // ... (기존 병상 데이터는 그대로 유지)
  { id: 1, category: "중환자실", name: "일반", status: "occupied", totalBeds: 5, currentPatients: 3 },
  { id: 2, category: "중환자실", name: "음압격리", status: "occupied", totalBeds: 3, currentPatients: 3 },
  { id: 3, category: "중환자실", name: "소아", status: "occupied", totalBeds: 2, currentPatients: 2 },
  { id: 4, category: "중환자실", name: "신생아", status: "available", totalBeds: 4, currentPatients: 1 },
  { id: 5, category: "중환자실", name: "내과", status: "available", totalBeds: 6, currentPatients: 2 },
  { id: 6, category: "중환자실", name: "심장내과", status: "available", totalBeds: 3, currentPatients: 1 },
  { id: 7, category: "중환자실", name: "신경과", status: "available", totalBeds: 4, currentPatients: 1 },
  { id: 8, category: "중환자실", name: "하상", status: "available", totalBeds: 2, currentPatients: 0 },
  { id: 9, category: "중환자실", name: "외과", status: "available", totalBeds: 5, currentPatients: 2 },
  { id: 10, category: "중환자실", name: "신경외과", status: "occupied", totalBeds: 3, currentPatients: 3 },
  { id: 11, category: "중환자실", name: "흉부외과", status: "occupied", totalBeds: 2, currentPatients: 2 },
  { id: 12, category: "응급진료", name: "입원실", status: "unknown", totalBeds: 8, currentPatients: 4 },
  { id: 13, category: "응급진료", name: "입원실 음압격리", status: "available", totalBeds: 4, currentPatients: 1 },
  { id: 14, category: "응급진료", name: "입원실 일반격리", status: "occupied", totalBeds: 6, currentPatients: 6 },
  { id: 15, category: "응급진료", name: "중환자실", status: "available", totalBeds: 3, currentPatients: 1 },
  { id: 16, category: "응급진료", name: "중환자실 음압격리", status: "available", totalBeds: 2, currentPatients: 0 },
  { id: 17, category: "응급진료", name: "중환자실 일반격리", status: "none", totalBeds: 4, currentPatients: 2 },
  { id: 18, category: "응급진료", name: "소아입원실", status: "none", totalBeds: 3, currentPatients: 1 },
  { id: 19, category: "응급진료", name: "소아중환자실", status: "none", totalBeds: 2, currentPatients: 0 },
  { id: 20, category: "외상진료", name: "중환자실", status: "none", totalBeds: 4, currentPatients: 2 },
  { id: 21, category: "외상진료", name: "입원실", status: "none", totalBeds: 6, currentPatients: 3 },
  { id: 22, category: "외상진료", name: "수술실", status: "none", totalBeds: 3, currentPatients: 1 },
  { id: 23, category: "입원실", name: "일반", status: "none", totalBeds: 10, currentPatients: 5 },
  { id: 24, category: "입원실", name: "음압격리", status: "none", totalBeds: 5, currentPatients: 2 },
  { id: 25, category: "입원실", name: "정신과 패쇄병동", status: "none", totalBeds: 4, currentPatients: 1 },
  { id: 26, category: "기타", name: "수술실", status: "none", totalBeds: 8, currentPatients: 3 },
  { id: 27, category: "기타", name: "분만실", status: "none", totalBeds: 3, currentPatients: 1 },
  { id: 28, category: "기타", name: "화상전용처치실", status: "none", totalBeds: 2, currentPatients: 0 },
];

// 병상 상태 자동 계산 함수
const calculateBedStatus = (totalBeds, currentPatients) => {
  if (totalBeds === 0 || currentPatients >= totalBeds) {
    return 'occupied';
  }
  return 'available';
};

const useBedStore = create((set, get) => ({
  hospitals: initialHospitals,
  beds: initialBedData.map(bed => ({
    ...bed,
    status: calculateBedStatus(bed.totalBeds, bed.currentPatients)
  })),

  getHospitals: () => {
    return get().hospitals;
  },

  updateTotalBeds: (bedId, newTotal) => {
    set((state) => ({
      beds: state.beds.map(bed => 
        bed.id === bedId 
          ? { 
              ...bed, 
              totalBeds: Math.max(0, newTotal),
              status: calculateBedStatus(Math.max(0, newTotal), bed.currentPatients)
            }
          : bed
      )
    }));
  },

  updateCurrentPatients: (bedId, newCurrent) => {
    set((state) => ({
      beds: state.beds.map(bed => 
        bed.id === bedId 
          ? { 
              ...bed, 
              currentPatients: Math.max(0, Math.min(newCurrent, bed.totalBeds)),
              status: calculateBedStatus(bed.totalBeds, Math.max(0, Math.min(newCurrent, bed.totalBeds)))
            }
          : bed
      )
    }));
  },

  toggleBedStatus: (bedId) => {
    set((state) => ({
      beds: state.beds.map(bed => 
        bed.id === bedId 
          ? { 
              ...bed, 
              status: bed.status === 'available' ? 'occupied' : 'available'
            }
          : bed
      )
    }));
  },

  getBedById: (bedId) => {
    return get().beds.find(bed => bed.id === bedId);
  },

  getBedsByCategory: (category) => {
    return get().beds.filter(bed => bed.category === category);
  },

  getStatistics: () => {
    const beds = get().beds;
    return {
      totalBeds: beds.reduce((sum, bed) => sum + bed.totalBeds, 0),
      totalPatients: beds.reduce((sum, bed) => sum + bed.currentPatients, 0),
      availableBeds: beds.reduce((sum, bed) => sum + (bed.totalBeds - bed.currentPatients), 0),
      occupiedBedsCount: beds.filter(bed => bed.status === 'occupied').length,
      availableBedsCount: beds.filter(bed => bed.status === 'available').length
    };
  }
}));

export default useBedStore;
