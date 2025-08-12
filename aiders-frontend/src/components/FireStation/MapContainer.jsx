import React, { useCallback, useEffect, useRef, useState } from 'react';

const MapContainer = ({ center, onMapInitialized, mapRef }) => {
  const mapContainer = useRef(null);
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const initialCenterSet = useRef(false);

  useEffect(() => {
    if (!mapContainer.current) {
      return;
    }

    const checkKakaoMap = () => {
      if (!center || typeof center.lat !== 'number' || typeof center.lng !== 'number') {
        console.warn('[MapContainer] center prop이 유효하지 않음, 재시도 대기 중:', center);
        setTimeout(checkKakaoMap, 100);
        return;
      }

      if (window.kakao && window.kakao.maps && window.kakao.maps.services) {
        if (!mapRef.current) {
          console.log('[MapContainer] 지도 초기화 시작:', center);
          
          const options = {
            center: new window.kakao.maps.LatLng(center.lat, center.lng),
            level: 5,
          };
          
          mapRef.current = new window.kakao.maps.Map(mapContainer.current, options);
          
          window.kakao.maps.event.addListener(mapRef.current, 'idle', () => {
            if (mapRef.current) {
              mapRef.current.relayout();
            }
          });

          console.log('[MapContainer] 지도 초기화 완료');
          setIsMapLoaded(true);
          onMapInitialized(true);
          initialCenterSet.current = true;
        }

        if (mapContainer.current.offsetWidth > 0 && mapContainer.current.offsetHeight > 0 && !mapRef.current.relayoutCalled) {
          mapRef.current.relayout();
          mapRef.current.relayoutCalled = true;
        }

        if (initialCenterSet.current && mapRef.current) {
            const moveLatLon = new window.kakao.maps.LatLng(center.lat, center.lng);
            mapRef.current.panTo(moveLatLon);
            initialCenterSet.current = false;
        }


      } else {
        console.warn('[MapContainer] 카카오맵 SDK 로딩 대기 중...');
        setTimeout(checkKakaoMap, 100);
      }
    };

    checkKakaoMap();
  }, [center, onMapInitialized, mapRef]);

  const goBackToFirestation = useCallback(() => {
    if (mapRef.current && center && typeof center.lat === 'number' && typeof center.lng === 'number') {
      const firestationPos = new window.kakao.maps.LatLng(center.lat, center.lng);
      mapRef.current.panTo(firestationPos);
      mapRef.current.setLevel(5);
    }
  }, [mapRef, center]);

  return (
    <div 
      ref={mapContainer}
      className="w-full h-full relative"
      style={{ minHeight: '400px' }}
    >
      {!isMapLoaded && (
        <div className="absolute inset-0 bg-gray-100 bg-opacity-75 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 shadow-lg text-center">
            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-700">지도 로딩 중...</p>
            <p className="text-xs text-gray-500 mt-1">카카오맵을 초기화하고 있습니다.</p>
          </div>
        </div>
      )}
      {isMapLoaded && (
        <button
          onClick={goBackToFirestation}
          className="absolute bottom-4 right-4 z-10 p-3 bg-white rounded-full shadow-lg hover:bg-gray-100"
          title="소방서 위치로 돌아가기"
        >
          📍
        </button>
      )}
    </div>
  );
};

export default MapContainer;