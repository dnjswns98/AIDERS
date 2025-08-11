import React, { useEffect, useRef, useState } from 'react';
import { useAuthStore } from '../../store/useAuthStore';

const RealTimeMap = ({ hospitalLocation, className }) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const hospitalMarkerRef = useRef(null);
  const websocketRef = useRef(null);
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const { user } = useAuthStore();

  // WebSocket 연결 함수
  const connectWebSocket = () => {
    if (!user?.userId) return;

    try {
      const wsUrl = import.meta.env.VITE_WS_BASE_URL || 'ws://localhost:8080/ws';
      const ws = new WebSocket(`${wsUrl}/location`);
      
      ws.onopen = () => {
        console.log('[RealTimeMap] WebSocket 연결 성공');
        // 병원 위치 토픽 구독
        ws.send(JSON.stringify({
          type: 'SUBSCRIBE',
          topic: `/topic/location/hospital/${user.userId}`
        }));
      };

      ws.onmessage = (event) => {
        try {
          const locationData = JSON.parse(event.data);
          console.log('[RealTimeMap] 병원 위치 데이터 수신:', locationData);
          
          if (locationData.latitude && locationData.longitude && mapInstanceRef.current && hospitalMarkerRef.current) {
            // 병원 마커 위치 업데이트
            const newPosition = new window.kakao.maps.LatLng(locationData.latitude, locationData.longitude);
            hospitalMarkerRef.current.setPosition(newPosition);
            
            // 지도 중심 이동 (부드럽게)
            mapInstanceRef.current.panTo(newPosition);
          }
        } catch (error) {
          console.error('[RealTimeMap] WebSocket 메시지 파싱 오류:', error);
        }
      };

      ws.onclose = () => {
        console.log('[RealTimeMap] WebSocket 연결 종료');
        // 3초 후 재연결 시도
        setTimeout(connectWebSocket, 3000);
      };

      ws.onerror = (error) => {
        console.error('[RealTimeMap] WebSocket 오류:', error);
      };

      websocketRef.current = ws;
    } catch (error) {
      console.error('[RealTimeMap] WebSocket 연결 실패:', error);
      // 3초 후 재연결 시도
      setTimeout(connectWebSocket, 3000);
    }
  };

  // 카카오맵 초기화
  useEffect(() => {
    if (!window.kakao || !window.kakao.maps) {
      console.error('[RealTimeMap] 카카오맵 SDK가 로드되지 않았습니다');
      return;
    }

    if (!hospitalLocation?.latitude || !hospitalLocation?.longitude) {
      console.warn('[RealTimeMap] 병원 위치 정보가 없습니다');
      return;
    }

    if (mapInstanceRef.current) {
      console.log('[RealTimeMap] 지도가 이미 초기화되어 있습니다');
      return;
    }

    try {
      // 지도 옵션
      const mapOption = {
        center: new window.kakao.maps.LatLng(hospitalLocation.latitude, hospitalLocation.longitude),
        level: 3 // 확대 레벨
      };

      // 지도 생성
      const map = new window.kakao.maps.Map(mapRef.current, mapOption);
      mapInstanceRef.current = map;

      // 병원 마커 생성
      const markerPosition = new window.kakao.maps.LatLng(hospitalLocation.latitude, hospitalLocation.longitude);
      const marker = new window.kakao.maps.Marker({
        position: markerPosition,
        map: map
      });
      hospitalMarkerRef.current = marker;

      // 병원 정보창 생성
      const infoWindow = new window.kakao.maps.InfoWindow({
        content: `
          <div style="padding: 8px 12px; font-size: 12px; min-width: 120px;">
            <div style="font-weight: bold; color: #1f2937; margin-bottom: 4px;">
              🏥 ${hospitalLocation.name || '병원'}
            </div>
            <div style="color: #6b7280; font-size: 11px;">
              실시간 위치
            </div>
          </div>
        `,
        removable: false
      });

      // 마커 클릭 시 정보창 표시
      window.kakao.maps.event.addListener(marker, 'click', () => {
        infoWindow.open(map, marker);
      });

      // 지도 로딩 완료
      setIsMapLoaded(true);
      console.log('[RealTimeMap] 카카오맵 초기화 완료');

    } catch (error) {
      console.error('[RealTimeMap] 지도 초기화 오류:', error);
    }
  }, [hospitalLocation]);

  // WebSocket 연결
  useEffect(() => {
    if (isMapLoaded && user?.userId) {
      connectWebSocket();
    }

    return () => {
      if (websocketRef.current) {
        websocketRef.current.close();
        websocketRef.current = null;
      }
    };
  }, [isMapLoaded, user?.userId]);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <div
        ref={mapRef}
        className={className}
        style={{
          width: '100%',
          height: '100%',
          borderRadius: '8px',
          border: '1px solid #e5e7eb'
        }}
      />
      
      {!isMapLoaded && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#f8fafc',
            borderRadius: '8px',
            border: '2px dashed #cbd5e1'
          }}
        >
          <div style={{ textAlign: 'center', color: '#64748b' }}>
            <div style={{ fontSize: '48px', marginBottom: '12px' }}>🗺️</div>
            <div style={{ fontSize: '14px', fontWeight: '500' }}>
              지도를 불러오는 중...
            </div>
          </div>
        </div>
      )}
      
      <div
        style={{
          position: 'absolute',
          bottom: '12px',
          left: '12px',
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          padding: '8px 12px',
          borderRadius: '6px',
          fontSize: '12px',
          color: '#374151',
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
          backdropFilter: 'blur(4px)'
        }}
      >
        🟢 실시간 위치 업데이트 중
      </div>
    </div>
  );
};

export default RealTimeMap;