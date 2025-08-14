import { useEffect, useRef, useState, useCallback } from 'react';
import { getCurrentUserInfo } from '../../api/api';
import useFireStationStore from '../../store/useFireStationStore';
import MapContainer from './MapContainer';
import AmbulanceMarkers from './AmbulanceMarkers';
import InfoPanel from './InfoPanel';

export default function SituationMap({
  ambulances = [],
  hospitals = [],
  selectedAmbulance,
  center,
  showOnlyMyFirestation = true,
  statusFilter = 'ALL',
}) {
  const map = useRef(null);
  const infoWindow = useRef(null);
  const firestationMarker = useRef(null);

  // 리스너 중복 방지용
  const markerClickHandlerRef = useRef(null);
  const mapClickHandlerRef = useRef(null);

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

  // 지도 초기화 이후: 소방서 마커 및 InfoWindow 구성
  useEffect(() => {
    if (!map.current || !window.kakao?.maps || !isMapInitialized) return;

    // InfoWindow 1회 생성
    if (!infoWindow.current) {
      infoWindow.current = new window.kakao.maps.InfoWindow({ zIndex: 1 });
    }

    // 기존 마커/리스너 정리
    if (firestationMarker.current) {
      if (markerClickHandlerRef.current) {
        window.kakao.maps.event.removeListener(
          firestationMarker.current,
          'click',
          markerClickHandlerRef.current
        );
        markerClickHandlerRef.current = null;
      }
      firestationMarker.current.setMap(null);
      firestationMarker.current = null;
    }

    // 소방서 마커 생성
    if (firestationInfo?.latitude && firestationInfo?.longitude) {
      const position = new window.kakao.maps.LatLng(
        firestationInfo.latitude,
        firestationInfo.longitude
      );

      const markerImage = new window.kakao.maps.MarkerImage(
        'https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/marker_red.png',
        new window.kakao.maps.Size(32, 32)
      );

      firestationMarker.current = new window.kakao.maps.Marker({
        position,
        image: markerImage,
        map: map.current,
        title: firestationInfo.name || '소방서',
        zIndex: 5,
      });

      // InfoWindow 내용 DOM 생성 (닫기 버튼이 InfoWindow 자체를 닫도록)
      const buildFirestationContent = () => {
        const container = document.createElement('div');
        container.className = 'info-window-content';
        container.style.padding = '10px';
        container.style.minWidth = '320px';
        container.style.minHeight = '50px'; // 필요하면 높이도 추가
        container.innerHTML = `
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
            <div style="font-weight:bold; color:#d9534f; font-size:16px;">
              🚒 ${firestationInfo.name || '소방서'}
            </div>
            <button class="info-close-btn" style="border:none; background:none; font-size:16px; cursor:pointer; color:#999;">×</button>
          </div>
          <div style="font-size:14px; color:#666;">
            ${firestationInfo.address || '주소 정보 없음'}
          </div>
        `;
        const closeBtn = container.querySelector('.info-close-btn');
        if (closeBtn) {
          closeBtn.addEventListener('click', () => infoWindow.current?.close());
        }
        return container;
      };

      const openFirestationInfo = () => {
        if (!infoWindow.current) return;
        infoWindow.current.close(); // 기존 열린 창 닫기
        infoWindow.current.setContent(buildFirestationContent());
        infoWindow.current.open(map.current, firestationMarker.current);
      };

      // 마커 클릭 리스너 등록 (중복 방지 ref 저장)
      markerClickHandlerRef.current = openFirestationInfo;
      window.kakao.maps.event.addListener(
        firestationMarker.current,
        'click',
        markerClickHandlerRef.current
      );
    }

    // 지도 클릭 시 InfoWindow 닫기(중복 제거 후 재등록)
    if (mapClickHandlerRef.current) {
      window.kakao.maps.event.removeListener(map.current, 'click', mapClickHandlerRef.current);
      mapClickHandlerRef.current = null;
    }
    mapClickHandlerRef.current = () => infoWindow.current?.close();
    window.kakao.maps.event.addListener(map.current, 'click', mapClickHandlerRef.current);

    // 정리 함수
    return () => {
      if (markerClickHandlerRef.current && firestationMarker.current) {
        window.kakao.maps.event.removeListener(
          firestationMarker.current,
          'click',
          markerClickHandlerRef.current
        );
        markerClickHandlerRef.current = null;
      }
      if (mapClickHandlerRef.current && map.current) {
        window.kakao.maps.event.removeListener(map.current, 'click', mapClickHandlerRef.current);
        mapClickHandlerRef.current = null;
      }
    };
    // firestationInfo 바뀔 때만 재설치 (center는 MapContainer에서 pan 처리)
  }, [isMapInitialized, firestationInfo]);

  // 언마운트 시 리소스 정리
  useEffect(() => {
    return () => {
      if (infoWindow.current) {
        infoWindow.current.close();
        infoWindow.current = null;
      }
      if (firestationMarker.current) {
        firestationMarker.current.setMap(null);
        firestationMarker.current = null;
      }
    };
  }, []);

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
        center={
          firestationInfo?.latitude && firestationInfo?.longitude
            ? { lat: firestationInfo.latitude, lng: firestationInfo.longitude }
            : center
        }
        onMapInitialized={setIsMapInitialized}
        mapRef={map}
      />
      {/* --- 🔽 핵심 수정: props 이름을 'filteredAmbulances'에서 'ambulances'로 변경 --- */}
      <AmbulanceMarkers
        map={map.current}
        ambulances={ambulances} 
        selectedAmbulance={selectedAmbulance}
        firestationInfo={firestationInfo}
        infoWindow={infoWindow}
      />

    </div>
  );
}
