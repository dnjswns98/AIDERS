import { create } from "zustand";

// 테스트용 실시간 구급차 위치 데이터 Store (실시간 데이터와 함께 표시됨)
export const useTestRealtimeStore = create((set, get) => ({
  // 병원 위치 정보 (실제 병원 좌표를 받아와서 설정)
  hospitalLocation: null,
  
  // Mock 구급차 기본 템플릿 (병원 기준 상대적 거리와 방향)
  mockAmbulanceTemplates: [
    { id: 9001, number: "구미119-01", direction: "north", distanceKm: 0.8 },      // 북쪽 800m
    { id: 9002, number: "구미119-02", direction: "southwest", distanceKm: 0.7 },  // 남서쪽 700m
    { id: 9003, number: "구미119-03", direction: "east", distanceKm: 0.5 },       // 동쪽 500m
    { id: 9004, number: "구미119-04", direction: "south", distanceKm: 0.6 },      // 남쪽 600m
    { id: 9005, number: "구미119-05", direction: "northeast", distanceKm: 0.9 }   // 북동쪽 900m
  ],
  
  // 동적으로 생성된 Mock 구급차 데이터
  mockAmbulances: [],

  // 병원 위치 설정 (실제 병원 좌표를 받아와서 설정)
  setHospitalLocation: (latitude, longitude) => {
    set({ hospitalLocation: { latitude, longitude } });
    console.log(`🏥 [TestRealtime] 병원 위치 설정: ${latitude}, ${longitude}`);
    
    // 병원 위치가 설정되면 Mock 구급차 데이터 자동 생성
    get().generateMockAmbulances();
  },

  // Mock 구급차 데이터 동적 생성 (병원 위치 기준)
  generateMockAmbulances: () => {
    const { hospitalLocation, mockAmbulanceTemplates } = get();
    
    if (!hospitalLocation) {
      console.warn('🏥 [TestRealtime] 병원 위치가 설정되지 않았습니다.');
      return;
    }

    const mockAmbulances = mockAmbulanceTemplates.map(template => {
      const position = calculatePositionFromDirection(
        hospitalLocation.latitude,
        hospitalLocation.longitude,
        template.direction,
        template.distanceKm
      );

      return {
        ambulanceId: template.id,
        hospitalId: 1,
        ambulanceNumber: template.number,
        latitude: position.latitude,
        longitude: position.longitude,
        distance: template.distanceKm
      };
    });

    set({ mockAmbulances });
    console.log(`🚑 [TestRealtime] Mock 구급차 ${mockAmbulances.length}대 생성 완료`);
  },

  // Mock 구급차 위치 업데이트 (시뮬레이션)
  updateMockAmbulancePosition: (ambulanceId, newLatitude, newLongitude) => {
    const { mockAmbulances, hospitalLocation } = get();
    
    if (!hospitalLocation) return;

    const updatedAmbulances = mockAmbulances.map(ambulance => {
      if (ambulance.ambulanceId === ambulanceId) {
        const distance = calculateDistance(
          newLatitude, 
          newLongitude, 
          hospitalLocation.latitude, 
          hospitalLocation.longitude
        );
        
        return {
          ...ambulance,
          latitude: newLatitude,
          longitude: newLongitude,
          distance: distance
        };
      }
      return ambulance;
    });
    
    set({ mockAmbulances: updatedAmbulances });
    console.log(`🚑 [TestRealtime] 구급차 ${ambulanceId} 위치 업데이트: ${newLatitude}, ${newLongitude}`);
  },

  // 새로운 Mock 구급차 추가
  addMockAmbulance: (ambulanceData) => {
    const { mockAmbulances } = get();
    const newAmbulance = {
      ambulanceId: Date.now(), // 임시 ID
      hospitalId: 1,
      ambulanceNumber: ambulanceData.ambulanceNumber || `테스트-${mockAmbulances.length + 1}`,
      latitude: ambulanceData.latitude || 37.5665,
      longitude: ambulanceData.longitude || 126.9780,
      distance: ambulanceData.distance || 0
    };
    
    set({ mockAmbulances: [...mockAmbulances, newAmbulance] });
    console.log(`➕ [TestRealtime] 새 Mock 구급차 추가:`, newAmbulance);
  },

  // Mock 구급차 제거
  removeMockAmbulance: (ambulanceId) => {
    const { mockAmbulances } = get();
    const filteredAmbulances = mockAmbulances.filter(ambulance => ambulance.ambulanceId !== ambulanceId);
    set({ mockAmbulances: filteredAmbulances });
    console.log(`➖ [TestRealtime] Mock 구급차 ${ambulanceId} 제거`);
  },

  // 모든 Mock 구급차 초기화
  clearAllMockAmbulances: () => {
    set({ mockAmbulances: [] });
    console.log(`🗑️ [TestRealtime] 모든 Mock 구급차 데이터 초기화`);
  },

  // 랜덤 위치 시뮬레이션 (구급차들이 자동으로 움직임) - 항상 작동
  startRandomMovement: () => {
    setInterval(() => {
      const { mockAmbulances: currentAmbulances, hospitalLocation } = get();
      
      if (!hospitalLocation || currentAmbulances.length === 0) return;
      
      const updatedAmbulances = currentAmbulances.map(ambulance => {
        // 랜덤하게 위치 조금씩 변경 (±0.001 정도)
        const latChange = (Math.random() - 0.5) * 0.002;
        const lngChange = (Math.random() - 0.5) * 0.002;
        
        const newLat = ambulance.latitude + latChange;
        const newLng = ambulance.longitude + lngChange;
        
        // 거리 재계산 (병원 실제 위치 기준)
        const distance = calculateDistance(
          newLat, 
          newLng, 
          hospitalLocation.latitude, 
          hospitalLocation.longitude
        );
        
        return {
          ...ambulance,
          latitude: newLat,
          longitude: newLng,
          distance: distance
        };
      });
      
      set({ mockAmbulances: updatedAmbulances });
    }, 3000); // 3초마다 위치 업데이트
  },

  // Store 초기화
  reset: () => set({
    mockAmbulances: []
  })
}));

// 두 지점 간 거리 계산 함수 (Haversine formula)
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // 지구 반지름 (km)
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R * c;
  return Math.round(distance * 10) / 10; // 소수점 첫째자리까지
}

// 방향과 거리를 기반으로 새로운 좌표 계산 함수
function calculatePositionFromDirection(baseLat, baseLng, direction, distanceKm) {
  const R = 6371; // 지구 반지름 (km)
  const d = distanceKm / R; // 거리를 라디안으로 변환
  
  // 방향별 각도 설정 (북쪽을 0도 기준)
  const directionAngles = {
    north: 0,
    northeast: 45,
    east: 90,
    southeast: 135,
    south: 180,
    southwest: 225,
    west: 270,
    northwest: 315
  };
  
  const bearing = (directionAngles[direction] || 0) * Math.PI / 180; // 라디안 변환
  const lat1 = baseLat * Math.PI / 180; // 기준 위도 라디안
  const lng1 = baseLng * Math.PI / 180; // 기준 경도 라디안
  
  // 새로운 위도 계산
  const lat2 = Math.asin(
    Math.sin(lat1) * Math.cos(d) +
    Math.cos(lat1) * Math.sin(d) * Math.cos(bearing)
  );
  
  // 새로운 경도 계산
  const lng2 = lng1 + Math.atan2(
    Math.sin(bearing) * Math.sin(d) * Math.cos(lat1),
    Math.cos(d) - Math.sin(lat1) * Math.sin(lat2)
  );
  
  return {
    latitude: lat2 * 180 / Math.PI, // 도 단위로 변환
    longitude: lng2 * 180 / Math.PI // 도 단위로 변환
  };
}

export default useTestRealtimeStore;