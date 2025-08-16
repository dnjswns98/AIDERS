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

  // 말풍선 모양의 커스텀 마커 생성 함수
  const createSpeechBubbleMarker = (text, backgroundColor = '#ef4444') => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    // 캔버스 크기 설정
    canvas.width = 120;
    canvas.height = 50;
    
    // 말풍선 그리기 (흰색 테두리 제거)
    ctx.fillStyle = backgroundColor;
    
    // 말풍선 본체 (둥근 사각형)
    const bubbleWidth = 100;
    const bubbleHeight = 30;
    const bubbleX = 10;
    const bubbleY = 5;
    const radius = 8;
    
    ctx.beginPath();
    ctx.moveTo(bubbleX + radius, bubbleY);
    ctx.lineTo(bubbleX + bubbleWidth - radius, bubbleY);
    ctx.quadraticCurveTo(bubbleX + bubbleWidth, bubbleY, bubbleX + bubbleWidth, bubbleY + radius);
    ctx.lineTo(bubbleX + bubbleWidth, bubbleY + bubbleHeight - radius);
    ctx.quadraticCurveTo(bubbleX + bubbleWidth, bubbleY + bubbleHeight, bubbleX + bubbleWidth - radius, bubbleY + bubbleHeight);
    ctx.lineTo(bubbleX + radius, bubbleY + bubbleHeight);
    ctx.quadraticCurveTo(bubbleX, bubbleY + bubbleHeight, bubbleX, bubbleY + bubbleHeight - radius);
    ctx.lineTo(bubbleX, bubbleY + radius);
    ctx.quadraticCurveTo(bubbleX, bubbleY, bubbleX + radius, bubbleY);
    ctx.closePath();
    ctx.fill();
    
    // 말풍선 꼬리 (흰색 테두리 제거)
    ctx.beginPath();
    ctx.moveTo(bubbleX + bubbleWidth/2 - 8, bubbleY + bubbleHeight);
    ctx.lineTo(bubbleX + bubbleWidth/2, bubbleY + bubbleHeight + 12);
    ctx.lineTo(bubbleX + bubbleWidth/2 + 8, bubbleY + bubbleHeight);
    ctx.closePath();
    ctx.fill();
    
    // 텍스트 그리기
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 12px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, bubbleX + bubbleWidth/2, bubbleY + bubbleHeight/2);
    
    return canvas.toDataURL();
  };

  // 병원 마커 생성 함수 (소방서 스타일 - 중앙 비어있음 + 초록 십자가)
  const createHospitalMarker = () => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    // 캔버스 크기 설정
    canvas.width = 60;
    canvas.height = 60;
    
    const centerX = 30;
    const centerY = 30;
    const outerRadius = 25;
    const innerRadius = 18;
    
    // 그림자 효과
    ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
    ctx.shadowBlur = 4;
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 2;
    
    // 외곽 원 (테두리)
    ctx.fillStyle = '#10b981'; // 초록색
    ctx.beginPath();
    ctx.arc(centerX, centerY, outerRadius, 0, 2 * Math.PI);
    ctx.fill();
    
    // 그림자 리셋
    ctx.shadowColor = 'transparent';
    
    // 내부 원 (비어있는 부분)
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(centerX, centerY, innerRadius, 0, 2 * Math.PI);
    ctx.fill();
    
    // 십자가 그리기 (초록색)
    ctx.fillStyle = '#10b981';
    const crossSize = 10;
    const crossThickness = 2.5;
    
    // 세로 막대
    ctx.fillRect(
      centerX - crossThickness/2,
      centerY - crossSize/2,
      crossThickness,
      crossSize
    );
    
    // 가로 막대
    ctx.fillRect(
      centerX - crossSize/2,
      centerY - crossThickness/2,
      crossSize,
      crossThickness
    );
    
    return canvas.toDataURL();
  };

  // 구급차 마커 생성/업데이트 함수
  const createOrUpdateAmbulanceMarker = (ambulanceData) => {
    console.log('🗺️ [RealTimeMap] 마커 생성/업데이트 함수 호출:', ambulanceData);
    
    if (!mapInstanceRef.current) {
      console.error('❌ [RealTimeMap] 지도 인스턴스가 없습니다');
      return;
    }
    
    if (!window.kakao?.maps) {
      console.error('❌ [RealTimeMap] 카카오맵 API가 로드되지 않았습니다');
      return;
    }

    const { ambulanceId, ambulanceNumber, latitude, longitude, distance } = ambulanceData;
    console.log('📍 [RealTimeMap] 마커 생성 데이터:', {
      ambulanceId,
      ambulanceNumber,
      latitude,
      longitude,
      distance
    });
    
    const position = new window.kakao.maps.LatLng(latitude, longitude);
    console.log('🎯 [RealTimeMap] 마커 위치 객체 생성:', position);
    
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
      console.log(`[RealTimeMap] 구급차 ${ambulanceNumber || ambulanceId} 위치 업데이트 (${distance?.toFixed(1)}km)`);
      return;
    }

    // 새 구급차 마커 생성 (번호가 표시되는 말풍선 마커)
    const markerImageSrc = createSpeechBubbleMarker(ambulanceNumber || ambulanceId);
    const markerImageSize = new window.kakao.maps.Size(120, 50);
    const markerImageOptions = {
      offset: new window.kakao.maps.Point(60, 50) // 말풍선 꼬리 끝이 위치를 가리키도록
    };
    const markerImage = new window.kakao.maps.MarkerImage(markerImageSrc, markerImageSize, markerImageOptions);

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

    console.log(`[RealTimeMap] 새 구급차 ${ambulanceNumber || ambulanceId} 마커 생성 (${distance?.toFixed(1)}km)`);
  };

  // 구급차 마커 제거 함수
  const removeAmbulanceMarker = (ambulanceId) => {
    const ambulanceMarker = ambulanceMarkersRef.current.get(ambulanceId);
    if (ambulanceMarker) {
      ambulanceMarker.marker.setMap(null);
      ambulanceMarkersRef.current.delete(ambulanceId);
      console.log(`[RealTimeMap] 구급차 ${ambulanceId} 마커 제거`);
    }
  };

  // 모든 구급차 마커 정리 함수
  const clearAllAmbulanceMarkers = () => {
    ambulanceMarkersRef.current.forEach((markerInfo, ambulanceId) => {
      markerInfo.marker.setMap(null);
      console.log(`[RealTimeMap] 구급차 ${ambulanceId} 마커 정리`);
    });
    ambulanceMarkersRef.current.clear();
    setAmbulanceLocations(new Map());
  };

  // STOMP 연결 함수 (구급차와 동일한 방식)
  const connectWebSocket = () => {
    if (!user?.userId) {
      console.error('[RealTimeMap] 사용자 ID가 없어 WebSocket 연결 불가');
      return;
    }

    const WS_BASE_URL = import.meta.env.VITE_WS_BASE_URL || "ws://localhost:8080/ws";
    const SOCKET_URL = WS_BASE_URL.replace(/^ws:\/\//, 'http://').replace(/^wss:\/\//, 'https://');
    
    console.log('[RealTimeMap] STOMP 연결 시도:', {
      WS_BASE_URL,
      SOCKET_URL,
      사용자ID: user.userId
    });

    try {
      const sock = new SockJS(SOCKET_URL);
      const stomp = Stomp.over(sock);
      
      stomp.debug = null;
      stomp.heartbeat.outgoing = 10000;
      stomp.heartbeat.incoming = 10000;

      const onConnect = () => {
        console.log('✅ [RealTimeMap] STOMP 연결 성공');
        stompClientRef.current = stomp;
        
        const topic = `/topic/location/hospital/${user.userId}`;
        console.log('📡 [RealTimeMap] 토픽 구독 시작:', topic);
        
        const subscription = stomp.subscribe(topic, (message) => {
          console.log('🔔 [RealTimeMap] 메시지 수신 이벤트 발생!');
          console.log('📨 [RealTimeMap] 원시 메시지 수신:', message.body);
          console.log('🕐 [RealTimeMap] 수신 시각:', new Date().toISOString());
          try {
            const locationData = JSON.parse(message.body);
            console.log('🔍 [RealTimeMap] 파싱된 데이터:', locationData);
            console.log('📍 [RealTimeMap] 구급차 위치 데이터 수신:', {
              ambulanceId: locationData.ambulanceId,
              ambulanceNumber: locationData.ambulanceNumber,
              latitude: locationData.latitude,
              longitude: locationData.longitude,
              거리: `${locationData.distance?.toFixed(1)}km`,
              hospitalId: locationData.hospitalId,
              타임스탬프: new Date().toLocaleTimeString()
            });
            
            // DistanceMessage 데이터 확인 및 처리
            if (locationData.ambulanceId && locationData.latitude && locationData.longitude) {
              console.log('✅ [RealTimeMap] 유효한 구급차 위치 데이터 - 처리 시작');
              console.log('🗺️ [RealTimeMap] 마커 생성/업데이트 시작');
              
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
              console.log('🎯 [RealTimeMap] 구급차 마커 처리 완료!');
            } else {
              console.warn('[RealTimeMap] 불완전한 구급차 위치 데이터:', locationData);
            }
            
          } catch (error) {
            console.error('[RealTimeMap] STOMP 메시지 파싱 오류:', error);
          }
        });
        
        console.log('📋 [RealTimeMap] 토픽 구독 완료, 구독ID:', subscription.id);
        console.log('⏳ [RealTimeMap] 구급차에서 위치 데이터 전송 대기 중...');
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

    // 지도가 이미 초기화되었으면 재초기화하지 않음
    if (isMapInitialized && mapInstanceRef.current) {
      console.log('[RealTimeMap] 지도 이미 초기화됨 - 재초기화 스킵');
      return;
    }
    
    const mapLocation = hospitalLocation;
    console.log('[RealTimeMap] 병원 위치로 지도 초기화:', mapLocation);
    
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

      // 병원 마커 생성 (public 폴더의 이미지 사용)
      const markerPosition = new window.kakao.maps.LatLng(mapLocation.latitude, mapLocation.longitude);
      const hospitalMarkerImageSrc = '/mapmarker/Mapmarker_hospital.png';
      const hospitalMarkerImage = new window.kakao.maps.MarkerImage(
        hospitalMarkerImageSrc,
        new window.kakao.maps.Size(60, 60),
        {
          offset: new window.kakao.maps.Point(30, 60) // 마커 하단이 위치를 가리키도록
        }
      );
      
      const marker = new window.kakao.maps.Marker({
        position: markerPosition,
        image: hospitalMarkerImage,
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
              병원 위치
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
  }, [hospitalLocation?.latitude, hospitalLocation?.longitude, isMapInitialized]); // 위치와 초기화 상태가 변경될 때만


  // WebSocket 연결 - 실시간 구급차 위치 데이터 수신
  useEffect(() => {
    if (user?.userId) {
      console.log('[RealTimeMap] WebSocket 연결 시작', {
        사용자ID: user.userId,
        사용자정보: user
      });
      connectWebSocket();
    } else {
      console.warn('[RealTimeMap] 사용자 정보가 없어 WebSocket 연결을 시작할 수 없습니다.');
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
  }, [user?.userId]);

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
        🟢 실시간 구급차 위치 수신 중
      </div>
    </div>
  );
};

export default RealTimeMap;