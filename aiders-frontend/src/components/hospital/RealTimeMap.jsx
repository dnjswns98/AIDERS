import React, { useEffect, useRef, useState } from 'react';
import { useAuthStore } from '../../store/useAuthStore';
import SockJS from "sockjs-client/dist/sockjs";
import Stomp from "stompjs";

const RealTimeMap = ({ hospitalLocation, className }) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const hospitalMarkerRef = useRef(null);
  const ambulanceMarkersRef = useRef(new Map()); // 구급차 마커들을 저장
  const stompClientRef = useRef(null);
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [isMapInitialized, setIsMapInitialized] = useState(false);
  const [ambulanceLocations, setAmbulanceLocations] = useState(new Map()); // 구급차 위치 정보
  const { user } = useAuthStore();

  // 구급차 마커 생성/업데이트 함수
  const createOrUpdateAmbulanceMarker = (ambulanceData) => {
    if (!mapInstanceRef.current || !window.kakao?.maps) return;

    const { ambulanceId, latitude, longitude, status, patientName, ktasLevel } = ambulanceData;
    const position = new window.kakao.maps.LatLng(latitude, longitude);
    
    // 기존 마커가 있으면 위치만 업데이트
    const existingMarker = ambulanceMarkersRef.current.get(ambulanceId);
    if (existingMarker) {
      existingMarker.marker.setPosition(position);
      console.log(`🚑 [RealTimeMap] 구급차 ${ambulanceId} 위치 업데이트: ${latitude}, ${longitude}`);
      return;
    }

    // 새 구급차 마커 생성
    const markerImageSrc = 'https://maps.google.com/mapfiles/ms/icons/red-dot.png';
    const markerImageSize = new window.kakao.maps.Size(32, 32);
    const markerImage = new window.kakao.maps.MarkerImage(markerImageSrc, markerImageSize);

    const marker = new window.kakao.maps.Marker({
      position: position,
      image: markerImage,
      map: mapInstanceRef.current,
      title: `구급차 ${ambulanceId}`
    });

    // 정보창 생성
    const infoWindow = new window.kakao.maps.InfoWindow({
      content: `
        <div style="padding: 8px 12px; font-size: 12px; min-width: 150px;">
          <div style="font-weight: bold; color: #dc2626; margin-bottom: 4px;">
            🚑 구급차 ${ambulanceId}
          </div>
          <div style="color: #6b7280; font-size: 11px; margin-bottom: 2px;">
            상태: <span style="color: #f59e0b;">통신대기</span>
          </div>
          <div style="color: #6b7280; font-size: 11px; margin-bottom: 2px;">
            환자: ${patientName || '미상'}
          </div>
          ${ktasLevel ? `<div style="color: #6b7280; font-size: 11px;">
            KTAS: <span style="color: #ef4444;">${ktasLevel}</span>
          </div>` : ''}
        </div>
      `,
      removable: false
    });

    // 마커 클릭 이벤트
    window.kakao.maps.event.addListener(marker, 'click', () => {
      infoWindow.open(mapInstanceRef.current, marker);
    });

    // 마커 정보 저장
    ambulanceMarkersRef.current.set(ambulanceId, {
      marker,
      infoWindow,
      lastUpdate: Date.now()
    });

    console.log(`🚑 [RealTimeMap] 새 구급차 ${ambulanceId} 마커 생성: ${latitude}, ${longitude}`);
  };

  // 구급차 마커 제거 함수
  const removeAmbulanceMarker = (ambulanceId) => {
    const ambulanceMarker = ambulanceMarkersRef.current.get(ambulanceId);
    if (ambulanceMarker) {
      ambulanceMarker.marker.setMap(null);
      ambulanceMarkersRef.current.delete(ambulanceId);
      console.log(`🚑 [RealTimeMap] 구급차 ${ambulanceId} 마커 제거`);
    }
  };

  // 모든 구급차 마커 정리 함수
  const clearAllAmbulanceMarkers = () => {
    ambulanceMarkersRef.current.forEach((markerInfo, ambulanceId) => {
      markerInfo.marker.setMap(null);
      console.log(`🚑 [RealTimeMap] 구급차 ${ambulanceId} 마커 정리`);
    });
    ambulanceMarkersRef.current.clear();
    setAmbulanceLocations(new Map());
  };

  // STOMP 연결 함수 (구급차와 동일한 방식)
  const connectWebSocket = () => {
    if (!user?.userId) return;

    const WS_BASE_URL = import.meta.env.VITE_WS_BASE_URL || "ws://localhost:8080/ws";
    const SOCKET_URL = WS_BASE_URL.replace(/^ws:\/\//, 'http://').replace(/^wss:\/\//, 'https://');
    
    console.log('[RealTimeMap] STOMP 연결 시도:', SOCKET_URL);

    try {
      const sock = new SockJS(SOCKET_URL);
      const stomp = Stomp.over(sock);
      
      stomp.debug = null;
      stomp.heartbeat.outgoing = 10000;
      stomp.heartbeat.incoming = 10000;

      const onConnect = () => {
        console.log('[RealTimeMap] STOMP 연결 성공');
        stompClientRef.current = stomp;
        
        const topic = `/topic/location/hospital/${user.userId}`;
        console.log('[RealTimeMap] 토픽 구독:', topic);
        
        stomp.subscribe(topic, (message) => {
          try {
            const locationData = JSON.parse(message.body);
            console.log('🔍 [RealTimeMap] 수신된 데이터 전체 구조:', {
              원본데이터: locationData,
              데이터타입: typeof locationData,
              키목록: Object.keys(locationData),
              ambulanceId존재: !!locationData.ambulanceId,
              hospitalId존재: !!locationData.hospitalId,
              위도경도존재: !!(locationData.latitude && locationData.longitude),
              타임스탬프: new Date().toLocaleTimeString()
            });
            
            // 구급차 데이터인지 확인
            if (locationData.ambulanceId) {
              console.log('🚑 [RealTimeMap] 구급차 위치 데이터 감지!', {
                구급차ID: locationData.ambulanceId,
                위도: locationData.latitude,
                경도: locationData.longitude,
                기타정보: {
                  status: locationData.status,
                  patientName: locationData.patientName,
                  ktasLevel: locationData.ktasLevel,
                  hospitalId: locationData.hospitalId
                }
              });
              
              // 구급차 위치 상태 업데이트
              const ambulanceInfo = {
                ambulanceId: locationData.ambulanceId,
                latitude: locationData.latitude,
                longitude: locationData.longitude,
                status: locationData.status || 'waiting_communication',
                patientName: locationData.patientName,
                ktasLevel: locationData.ktasLevel,
                timestamp: new Date().toISOString()
              };

              setAmbulanceLocations(prev => {
                const newMap = new Map(prev);
                newMap.set(locationData.ambulanceId, ambulanceInfo);
                return newMap;
              });

              // 지도에 구급차 마커 생성/업데이트
              createOrUpdateAmbulanceMarker(ambulanceInfo);
            }
            
            // 병원 데이터인지 확인 (기존 로직)
            if (locationData.latitude && locationData.longitude && mapInstanceRef.current && hospitalMarkerRef.current) {
              console.log('🏥 [RealTimeMap] 병원/일반 위치 데이터 처리');
              const newPosition = new window.kakao.maps.LatLng(locationData.latitude, locationData.longitude);
              hospitalMarkerRef.current.setPosition(newPosition);
              mapInstanceRef.current.panTo(newPosition);
            }
            
            // 알 수 없는 데이터 형식
            if (!locationData.ambulanceId && (!locationData.latitude || !locationData.longitude)) {
              console.log('❓ [RealTimeMap] 알 수 없는 데이터 형식:', locationData);
            }
            
          } catch (error) {
            console.error('[RealTimeMap] STOMP 메시지 파싱 오류:', error);
          }
        });
      };

      const onError = (error) => {
        console.error('[RealTimeMap] STOMP 연결 실패:', error);
        stompClientRef.current = null;
        setTimeout(connectWebSocket, 3000);
      };

      stomp.connect({}, onConnect, onError);
      
    } catch (error) {
      console.error('[RealTimeMap] STOMP 생성 실패:', error);
      setTimeout(connectWebSocket, 3000);
    }
  };

  // 카카오맵 초기화
  useEffect(() => {
    if (!window.kakao || !window.kakao.maps) {
      console.error('[RealTimeMap] 카카오맵 SDK가 로드되지 않았습니다');
      return;
    }

    // hospitalLocation에서 좌표 가져오기 - 없으면 지도 초기화 대기
    if (!hospitalLocation?.latitude || !hospitalLocation?.longitude) {
      console.warn('[RealTimeMap] 병원 위치 정보가 없음 - 지도 초기화 대기');
      return;
    }
    
    const mapLocation = hospitalLocation;
    console.log('[RealTimeMap] 병원 위치로 지도 초기화:', mapLocation);

    // 지도가 이미 초기화되었고 mapInstanceRef가 있으면 재초기화하지 않음
    if (isMapInitialized && mapInstanceRef.current) {
      console.log('[RealTimeMap] 지도 이미 초기화됨 - 재초기화 스킵');
      return;
    }
    
    // 기존 지도가 있으면 정리
    if (mapInstanceRef.current) {
      console.log('[RealTimeMap] 기존 지도 정리 후 재초기화');
      if (hospitalMarkerRef.current) {
        hospitalMarkerRef.current.setMap(null);
        hospitalMarkerRef.current = null;
      }
      // 구급차 마커들도 모두 정리
      clearAllAmbulanceMarkers();
      mapInstanceRef.current = null;
      setIsMapLoaded(false);
      setIsMapInitialized(false);
    }

    try {
      // 지도 옵션
      const mapOption = {
        center: new window.kakao.maps.LatLng(mapLocation.latitude, mapLocation.longitude),
        level: 5 // 확대 레벨
      };

      // 지도 생성
      const map = new window.kakao.maps.Map(mapRef.current, mapOption);
      mapInstanceRef.current = map;

      // 병원 마커 생성
      const markerPosition = new window.kakao.maps.LatLng(mapLocation.latitude, mapLocation.longitude);
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
              🏥 ${mapLocation.name || '병원'}
            </div>
            <div style="color: #6b7280; font-size: 11px;">
              ${hospitalLocation?.latitude && hospitalLocation?.longitude ? '실시간 위치' : '기본 위치 - 실제 데이터 대기 중'}
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
      setIsMapInitialized(true);
      console.log('[RealTimeMap] 카카오맵 초기화 완료');

    } catch (error) {
      console.error('[RealTimeMap] 지도 초기화 오류:', error);
    }
  }, [hospitalLocation]); // hospitalLocation이 있을 때만 지도 초기화

  // WebSocket 연결 (지도와 분리)
  useEffect(() => {
    if (user?.userId) {
      connectWebSocket();
    }

    return () => {
      if (stompClientRef.current && stompClientRef.current.connected) {
        console.log('[RealTimeMap] STOMP 연결 해제');
        stompClientRef.current.disconnect();
        stompClientRef.current = null;
      }
      // 컴포넌트 언마운트 시 모든 구급차 마커 정리
      clearAllAmbulanceMarkers();
    };
  }, [user?.userId]); // 지도 로딩 상태와 무관하게 WebSocket 연결

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