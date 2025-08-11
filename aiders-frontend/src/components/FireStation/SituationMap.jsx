

// src/components/Map/SituationMap.jsx - 소속 구급차 필터링 기능 추가

import { useEffect, useRef, useState, useCallback } from 'react';
import { getStatusText, getStatusColor } from '../../utils/statusUtils';
import { getCurrentUserInfo, getFirestationLocation } from '../../api/api';
import useFireStationStore from '../../store/useFireStationStore';
import MapContainer from './MapContainer';
import AmbulanceMarkers from './AmbulanceMarkers';
import HospitalMarkers from './HospitalMarkers';
import InfoPanel from './InfoPanel';

const statusColors = {
  'dispatched': 'blue',
  'transporting': 'green', 
  'completed': 'purple',
  'returning': 'orange',
  'standby': 'gray',
  'maintenance': 'gray',
  // 새로운 상태들 추가
  'WAIT': 'red',
  'DISPATCH': 'blue', 
  'TRANSFER': 'green'
};



export default function SituationMap({ 
  ambulances = [], 
  hospitals = [], 
  selectedAmbulance, 
  center,
  showOnlyMyFirestation = true, // 🔥 새로 추가: 소속 구급차만 표시 여부
  statusFilter = 'ALL' // 🔥 새로 추가: 상태 필터
}) {
  const map = useRef(null);
  const ambulanceMarkers = useRef([]);
  const hospitalMarkers = useRef([]);
  const infoWindow = useRef(null);

  // 🔥 소방서 정보 가져오기
  const { firestationInfo, fetchFirestationInfo, fetchFirestationAmbulances, fetchDispatchHistory } = useFireStationStore();
  
  // 🔥 상태 관리
  const [currentFirestationId, setCurrentFirestationId] = useState(null);
  const [filteredAmbulances, setFilteredAmbulances] = useState([]);
  const [isMapInitialized, setIsMapInitialized] = useState(false);

  

  // 🔥 현재 사용자의 firestation_id 추출
  const getCurrentFirestationId = useCallback(() => {
    try {
      const userInfo = getCurrentUserInfo();
      
      if (userInfo) {
        const firestationId = userInfo.firestation_id || 
                             userInfo.firestationId || 
                             userInfo.stationId ||
                             userInfo.station_id ||
                             userInfo.organizationId ||
                             (userInfo.role === 'FIRESTATION' ? userInfo.id : null);
        
        return firestationId;
      }
    } catch (error) {
      console.error('[SituationMap] 사용자 정보 추출 실패:', error);
    }
    
    return null;
  }, []);

  // 🔥 소속 구급차만 필터링하는 함수 (핵심!)
  const filterFirestationAmbulances = useCallback((allAmbulances, firestationId) => {
    if (!allAmbulances || allAmbulances.length === 0) {
      return [];
    }

    if (!showOnlyMyFirestation) {
      return allAmbulances;
    }

    if (!firestationId) {
      console.warn('[SituationMap] ⚠️ firestation_id가 없음 - 모든 구급차 표시');
      return allAmbulances;
    }

    // firestation_id로 필터링
    const filtered = allAmbulances.filter(ambulance => {
      // 다양한 필드에서 firestation_id 매칭 시도
      const ambulanceStationId = ambulance.firestation_id || 
                                ambulance.firestationId || 
                                ambulance.stationId ||
                                ambulance.station_id ||
                                ambulance.organizationId;
      
      const isMatch = ambulanceStationId === firestationId ||
                      ambulanceStationId === parseInt(firestationId) ||
                      ambulanceStationId === firestationId.toString();
      
      return isMatch;
    });

    return filtered;
  }, [showOnlyMyFirestation]);

  // 🔥 상태별 추가 필터링
  const applyStatusFilter = useCallback((ambulanceList, status) => {
    if (status === 'ALL') {
      return ambulanceList;
    }
    
    return ambulanceList.filter(ambulance => {
      const currentStatus = (ambulance.currentStatus || ambulance.status || '').toUpperCase();
      return currentStatus === status.toUpperCase();
    });
  }, []);

    // 🔥 구급차 목록 필터링 (소속 + 상태)
  useEffect(() => {
    const processAmbulances = async () => {
      try {
        // 1. 현재 사용자의 firestation_id를 동기적으로 가져옵니다.
        //    이 값은 InfoPanel의 Station ID와 구급차 필터링에 사용됩니다.
        const userInfo = getCurrentUserInfo();
        const firestationId = userInfo?.userKey || userInfo?.firestation_id || userInfo?.firestationId;
        setCurrentFirestationId(firestationId); // 상태 업데이트

        // 2. 소방서 정보가 로드될 때까지 기다립니다.
        //    firestationInfo는 useFireStationStore에서 관리되며, 이름, 주소, 위도, 경도를 포함합니다.
        //    이전 단계에서 fetchFirestationInfo와 getFirestationLocation을 결합하여 업데이트됩니다.
        if (!firestationInfo || !firestationInfo.name) {
          // firestationInfo가 아직 로드되지 않았거나 이름이 없으면 잠시 기다립니다.
          // 이 부분은 상위 컴포넌트에서 firestationInfo가 완전히 로드된 후에 SituationMap이 렌더링되도록
          // 처리하는 것이 더 이상적입니다. 여기서는 간단히 재시도 로직을 추가합니다.
          setTimeout(processAmbulances, 500); 
          return;
        }

        // 3. 해당 소방서에 소속된 구급차 목록을 가져옵니다.
        //    이 호출은 useFireStationStore의 ambulances 상태를 업데이트합니다.
        //    백엔드에서 firestationId로 필터링되지 않으므로, 모든 구급차를 가져옵니다.
        if (firestationId) { // firestationId가 유효할 때만 호출
          await fetchFirestationAmbulances(firestationId); // 이 함수는 이제 모든 구급차를 가져옵니다.
        }

        // 4. useFireStationStore에서 현재 구급차 목록 상태를 가져옵니다.
        const allAmbulancesFromStore = useFireStationStore.getState().ambulances; 

        // 5. 소속 및 상태별로 구급차를 필터링합니다.
        let filtered = filterFirestationAmbulances(allAmbulancesFromStore, firestationId); 
        
        // 6. 상태별 필터링을 적용합니다.
        filtered = applyStatusFilter(filtered, statusFilter);
        
        // 7. 필터링된 구급차 목록을 상태에 설정합니다.
        setFilteredAmbulances(filtered);
        
        // 8. 출동 기록을 가져옵니다. (이전 로그에서 반복 호출되던 문제 해결을 위해 순차적으로 호출)
        await fetchDispatchHistory();

      } catch (error) {
        console.error('[SituationMap] 데이터 로드 및 필터링 실패:', error);
        setFilteredAmbulances([]);
      }
    };

    processAmbulances();
  }, [ambulances, showOnlyMyFirestation, statusFilter, getCurrentUserInfo, filterFirestationAmbulances, applyStatusFilter, fetchFirestationAmbulances, fetchDispatchHistory, firestationInfo]); // 의존성 업데이트 및 fetchDispatchHistory 추가

  // 🔥 소방서 정보 초기 로드
  useEffect(() => {
    const loadFirestationAndLocationInfo = async () => {
      if (!firestationInfo || !firestationInfo.latitude || !firestationInfo.longitude) { // firestationInfo가 없거나 좌표가 없을 때만 로드
        try {
          // 1. 사용자 정보에서 firestation_id 가져오기 (Station ID 표시용)
          const userInfo = getCurrentUserInfo();
          const firestationId = userInfo?.userKey || userInfo?.firestation_id || userInfo?.firestationId;
          if (firestationId) {
            setCurrentFirestationId(firestationId); // currentFirestationId 상태 설정
          }

          // 2. 소방서 기본 정보 (이름, 주소) 가져오기
          const infoResponse = await fetchFirestationInfo();

          // 3. 소방서 위치 정보 (위도, 경도) 가져오기
          const locationResponse = await getFirestationLocation();

          // 4. 두 정보를 결합하여 firestationInfo 상태 업데이트
          if (infoResponse && locationResponse) {
            const combinedInfo = {
              ...infoResponse,
              latitude: locationResponse.latitude,
              longitude: locationResponse.longitude,
              // 추가적으로 필요한 필드가 있다면 여기에 결합
            };
            // useFireStationStore의 firestationInfo 상태를 직접 업데이트
            useFireStationStore.setState({ firestationInfo: combinedInfo });
          } else if (infoResponse) {
            // 위치 정보가 없으면 이름/주소만이라도 설정
            useFireStationStore.setState({ firestationInfo: infoResponse });
          } else if (locationResponse) {
            // 이름/주소 정보가 없으면 위치 정보만이라도 설정
            useFireStationStore.setState({ firestationInfo: locationResponse });
          }

        } catch (error) {
          console.error('[SituationMap] 소방서 정보 및 위치 로드 실패:', error);
        }
      }
    };

    loadFirestationAndLocationInfo();
  }, [fetchFirestationInfo, getFirestationLocation, getCurrentUserInfo, firestationInfo]); // firestationInfo를 의존성에 추가하여 변경 감지

  return (
    <div className="w-full h-full relative">
      <InfoPanel 
        firestationInfo={firestationInfo}
        currentFirestationId={currentFirestationId}
        showOnlyMyFirestation={showOnlyMyFirestation}
        statusFilter={statusFilter}
        filteredAmbulances={filteredAmbulances}
        ambulances={ambulances}
        isMapInitialized={isMapInitialized}
      />
      <MapContainer 
        center={firestationInfo?.latitude && firestationInfo?.longitude ? 
          { lat: firestationInfo.latitude, lng: firestationInfo.longitude } : 
          center // 기본값으로 기존 center prop 사용
        }
        onMapInitialized={setIsMapInitialized}
        mapRef={map}
      />
      <AmbulanceMarkers 
        map={map.current}
        filteredAmbulances={filteredAmbulances}
        selectedAmbulance={selectedAmbulance}
        firestationInfo={firestationInfo}
        infoWindow={infoWindow}
      />
      <HospitalMarkers 
        map={map.current}
        hospitals={hospitals}
        infoWindow={infoWindow}
      />
    </div>
  );
}