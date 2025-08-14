import React, { useEffect, useRef, useState } from 'react';
import { useAuthStore } from '../../store/useAuthStore';
import { useTestRealtimeStore } from '../../store/useTestRealtimeStore'; // 테스트용 Store 추가
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
  
  // 테스트용 Store 사용
  const { mockAmbulances, setHospitalLocation } = useTestRealtimeStore();

  // 구급차 마커 생성/업데이트 함수
  const createOrUpdateAmbulanceMarker = (ambulanceData) => {
    if (!mapInstanceRef.current || !window.kakao?.maps) return;

    const { ambulanceId, ambulanceNumber, latitude, longitude, distance } = ambulanceData;
    const position = new window.kakao.maps.LatLng(latitude, longitude);
    
    // 기존 마커가 있으면 위치만 업데이트
    const existingMarker = ambulanceMarkersRef.current.get(ambulanceId);
    if (existingMarker) {
      existingMarker.marker.setPosition(position);
      // 정보창 내용도 업데이트
      existingMarker.infoWindow.setContent(`
        <div style="padding: 8px 12px; font-size: 12px; min-width: 150px;">
          <div style="font-weight: bold; color: #dc2626; margin-bottom: 4px;">
            🚑 구급차 ${ambulanceNumber || ambulanceId}
          </div>
          <div style="color: #6b7280; font-size: 11px; margin-bottom: 2px;">
            상태: <span style="color: #f59e0b;">이송 중</span>
          </div>
          <div style="color: #6b7280; font-size: 11px; margin-bottom: 2px;">
            병원까지: <span style="color: #059669;">${distance ? `${distance.toFixed(1)}km` : '계산 중'}</span>
          </div>
          <div style="color: #6b7280; font-size: 11px;">
            위치: ${latitude.toFixed(6)}, ${longitude.toFixed(6)}
          </div>
        </div>
      `);
      console.log(`🚑 [RealTimeMap] 구급차 ${ambulanceNumber || ambulanceId} 위치 업데이트: ${latitude}, ${longitude}, 거리: ${distance?.toFixed(1)}km`);
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
      title: `구급차 ${ambulanceNumber || ambulanceId}`
    });

    // 정보창 생성
    const infoWindow = new window.kakao.maps.InfoWindow({
      content: `
        <div style="padding: 8px 12px; font-size: 12px; min-width: 150px;">
          <div style="font-weight: bold; color: #dc2626; margin-bottom: 4px;">
            🚑 구급차 ${ambulanceNumber || ambulanceId}
          </div>
          <div style="color: #6b7280; font-size: 11px; margin-bottom: 2px;">
            상태: <span style="color: #f59e0b;">이송 중</span>
          </div>
          <div style="color: #6b7280; font-size: 11px; margin-bottom: 2px;">
            병원까지: <span style="color: #059669;">${distance ? `${distance.toFixed(1)}km` : '계산 중'}</span>
          </div>
          <div style="color: #6b7280; font-size: 11px;">
            위치: ${latitude.toFixed(6)}, ${longitude.toFixed(6)}
          </div>
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

    console.log(`🚑 [RealTimeMap] 새 구급차 ${ambulanceNumber || ambulanceId} 마커 생성: ${latitude}, ${longitude}, 거리: ${distance?.toFixed(1)}km`);
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
            console.log('🔍 [RealTimeMap] 수신된 DistanceMessage 데이터:', {
              원본데이터: locationData,
              데이터타입: typeof locationData,
              키목록: Object.keys(locationData),
              ambulanceId: locationData.ambulanceId,
              hospitalId: locationData.hospitalId,
              ambulanceNumber: locationData.ambulanceNumber,
              위도경도: `${locationData.latitude}, ${locationData.longitude}`,
              거리: locationData.distance,
              타임스탬프: new Date().toLocaleTimeString()
            });
            
            // DistanceMessage 데이터 확인 및 처리
            if (locationData.ambulanceId && locationData.latitude && locationData.longitude) {
              console.log('🚑 [RealTimeMap] 구급차 위치 데이터 처리!', {
                구급차ID: locationData.ambulanceId,
                구급차번호: locationData.ambulanceNumber,
                병원ID: locationData.hospitalId,
                위도: locationData.latitude,
                경도: locationData.longitude,
                거리: `${locationData.distance?.toFixed(1)}km`
              });
              
              // 구급차 위치 상태 업데이트
              const ambulanceInfo = {
                ambulanceId: locationData.ambulanceId,
                ambulanceNumber: locationData.ambulanceNumber,
                hospitalId: locationData.hospitalId,
                latitude: locationData.latitude,
                longitude: locationData.longitude,
                distance: locationData.distance,
                timestamp: new Date().toISOString()
              };

              setAmbulanceLocations(prev => {
                const newMap = new Map(prev);
                newMap.set(locationData.ambulanceId, ambulanceInfo);
                return newMap;
              });

              // 지도에 구급차 마커 생성/업데이트
              createOrUpdateAmbulanceMarker(ambulanceInfo);
            } else {
              console.log('❓ [RealTimeMap] 불완전한 데이터 형식:', locationData);
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
      
      // 🧪 TEST: 병원 위치를 테스트 Store에 설정하여 Mock 데이터 동적 생성
      setHospitalLocation(mapLocation.latitude, mapLocation.longitude);
      console.log(`🧪 [RealTimeMap] 테스트 Store에 병원 위치 설정: ${mapLocation.latitude}, ${mapLocation.longitude}`);

    } catch (error) {
      console.error('[RealTimeMap] 지도 초기화 오류:', error);
    }
  }, [hospitalLocation]); // hospitalLocation이 있을 때만 지도 초기화

  // 🧪 TEST: Mock 데이터 처리 useEffect (항상 작동 - 실시간 데이터와 함께 표시)
  useEffect(() => {
    if (mockAmbulances.length > 0 && mapInstanceRef.current) {
      console.log('🧪 [RealTimeMap] Mock 데이터 지도에 추가 표시', mockAmbulances);
      
      // Mock 구급차들을 지도에 표시 (실시간 데이터와 구분하지 않고 함께 표시)
      mockAmbulances.forEach(ambulance => {
        createOrUpdateAmbulanceMarker(ambulance);
      });
    }
  }, [mockAmbulances, mapInstanceRef.current]); // Mock 데이터 변경 시 업데이트

  // WebSocket 연결 (지도와 분리) - 항상 작동 (실시간 데이터 수신)
  useEffect(() => {
    if (user?.userId) {
      console.log('🌐 [RealTimeMap] 실제 WebSocket 연결 시작');
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
  }, [user?.userId]); // WebSocket은 항상 연결

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