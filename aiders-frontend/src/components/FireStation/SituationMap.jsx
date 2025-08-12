import { useEffect, useRef, useState, useCallback } from 'react';
import { getCurrentUserInfo, getFirestationLocation } from '../../api/api';
import useFireStationStore from '../../store/useFireStationStore';
import MapContainer from './MapContainer';
import AmbulanceMarkers from './AmbulanceMarkers';
import HospitalMarkers from './HospitalMarkers';
import InfoPanel from './InfoPanel';


export default function SituationMap({
  ambulances = [],
  hospitals = [],
  selectedAmbulance,
  center,
  showOnlyMyFirestation = true,
  statusFilter = 'ALL'
}) {
  const map = useRef(null);
  const infoWindow = useRef(null);
  const firestationMarker = useRef(null);

  const { firestationInfo } = useFireStationStore();
  const [currentFirestationId, setCurrentFirestationId] = useState(null);
  const [isMapInitialized, setIsMapInitialized] = useState(false);

  // 현재 사용자의 firestation_id 추출
  const getCurrentFirestationId = useCallback(() => {
    try {
      const userInfo = getCurrentUserInfo();
      if (userInfo) {
        return userInfo.firestation_id || userInfo.firestationId || userInfo.userKey;
      }
    } catch (error) {
      console.error('[SituationMap] 사용자 정보 추출 실패:', error);
    }
    return null;
  }, []);

  useEffect(() => {
    setCurrentFirestationId(getCurrentFirestationId());
  }, [getCurrentFirestationId]);

  // 지도 초기화 및 마커 생성
  useEffect(() => {
    if (!map.current || !window.kakao || !window.kakao.maps || !isMapInitialized) {
      return;
    }

    if (!infoWindow.current) {
      infoWindow.current = new window.kakao.maps.InfoWindow({ zIndex: 1 });
    }

    // 기존 소방서 마커 삭제
    if (firestationMarker.current) {
      firestationMarker.current.setMap(null);
      firestationMarker.current = null;
    }
    
    // 소방서 마커 생성
    if (firestationInfo?.latitude && firestationInfo?.longitude) {
      const position = new window.kakao.maps.LatLng(firestationInfo.latitude, firestationInfo.longitude);
      const markerImage = new window.kakao.maps.MarkerImage(
        'https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/marker_red.png',
        new window.kakao.maps.Size(32, 32)
      );

      firestationMarker.current = new window.kakao.maps.Marker({
        position: position,
        image: markerImage,
        map: map.current,
        title: firestationInfo.name || '소방서',
        zIndex: 5,
      });

      const content = `
        <div style="padding:10px; min-width:200px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
            <div style="font-weight:bold; color:#d9534f; font-size:14px;">
              🚒 ${firestationInfo.name || '소방서'}
            </div>
            <button onclick="this.closest('div.info-window-content').remove();" style="border: none; background: none; font-size: 16px; cursor: pointer; color: #999;">×</button>
          </div>
          <div style="font-size:12px; color:#666;">
            ${firestationInfo.address || '주소 정보 없음'}
          </div>
        </div>
      `;

      window.kakao.maps.event.addListener(firestationMarker.current, 'click', () => {
        infoWindow.current.setContent(`<div class="info-window-content">${content}</div>`);
        infoWindow.current.open(map.current, firestationMarker.current);
      });
    }

    infoWindow.current?.close();

    if (map.current) {
      map.current.relayout();
    }

  }, [isMapInitialized, firestationInfo, center]);


  return (
    <div className="w-full h-full relative">
      <InfoPanel
        firestationInfo={firestationInfo}
        currentFirestationId={currentFirestationId}
        showOnlyMyFirestation={showOnlyMyFirestation}
        statusFilter={statusFilter}
        filteredAmbulances={ambulances}
        ambulances={ambulances}
        isMapInitialized={isMapInitialized}
      />
      <MapContainer
        center={firestationInfo?.latitude && firestationInfo?.longitude ?
          { lat: firestationInfo.latitude, lng: firestationInfo.longitude } :
          center
        }
        onMapInitialized={setIsMapInitialized}
        mapRef={map}
      />
      <AmbulanceMarkers
        map={map.current}
        filteredAmbulances={ambulances}
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