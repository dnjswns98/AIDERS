// src/hooks/useLiveAmbulanceLocation.js
import { useEffect, useRef, useState } from "react";
import SockJS from "sockjs-client/dist/sockjs"; // 🔥 /dist/sockjs 제거
import Stomp from "stompjs";

// 🔥 SockJS용 URL 변환 함수
const createSockJSUrl = (wsUrl) => {
  if (!wsUrl) return "http://localhost:8080/ws";
  
  // ws:// → http://, wss:// → https:// 변환
  return wsUrl
    .replace(/^ws:\/\//, 'http://')
    .replace(/^wss:\/\//, 'https://');
};

// 🔥 환경변수 처리
const WS_BASE_URL = import.meta.env.VITE_WS_BASE_URL || 
                    import.meta.env.VITE_WS_URL || 
                    "ws://localhost:8080/ws";

const SOCKET_URL = createSockJSUrl(WS_BASE_URL);

// 🔥 개발 모드에서만 URL 확인 로그
if (import.meta.env.DEV) {
  console.log("🚑 [구급차 추적] WebSocket URL:", WS_BASE_URL, "→", SOCKET_URL);
}

export default function useLiveAmbulanceLocation(ambulanceId) {
  const wsClientRef = useRef(null);
  const watchIdRef = useRef(null);
  const isConnectingRef = useRef(false);
  const isMountedRef = useRef(true);
  
  // 🔥 상태 관리 (단순화)
  const [hospitalDistanceInfo, setHospitalDistanceInfo] = useState(null);
  const [ambulanceLocation, setAmbulanceLocation] = useState(null);
  const [connectionError, setConnectionError] = useState(null);
  const [reconnectAttempts, setReconnectAttempts] = useState(0);
  const [forceReconnect, setForceReconnect] = useState(0);

  // 🔥 컴포넌트 마운트 상태 관리
  useEffect(() => {
    isMountedRef.current = true;
    
    return () => {
      isMountedRef.current = false;
      isConnectingRef.current = false;
      
      // 위치 추적 정리
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
      
      // WebSocket 연결 정리
      if (wsClientRef.current) {
        try {
          if (wsClientRef.current.connected) {
            wsClientRef.current.disconnect();
          }
        } catch (error) {
          // 정리 중 에러 무시
        } finally {
          wsClientRef.current = null;
        }
      }
    };
  }, []);

  // === WebSocket 연결 관리 ===
  useEffect(() => {
    if (!ambulanceId) {
      console.warn("🚑 [WebSocket] ambulanceId 없음");
      return;
    }

    if (isConnectingRef.current) {
      return; // 이미 연결 시도 중
    }

    console.log(`🔌 [WebSocket] 구급차 ${ambulanceId} 연결 시도`);
    isConnectingRef.current = true;

    // 기존 연결 정리
    if (wsClientRef.current) {
      try {
        if (wsClientRef.current.connected) {
          wsClientRef.current.disconnect();
        }
        wsClientRef.current = null;
      } catch (error) {
        // 기존 연결 정리 에러 무시
      }
    }

    try {
      // SockJS + STOMP 연결 생성
      const sock = new SockJS(SOCKET_URL);
      const stomp = Stomp.over(sock);
      
      // STOMP 설정
      stomp.debug = import.meta.env.DEV ? (msg) => {
        if (msg.includes('CONNECTED') || msg.includes('ERROR')) {
          console.log(`[STOMP] ${msg}`);
        }
      } : null;
      
      stomp.heartbeat.outgoing = 10000;
      stomp.heartbeat.incoming = 10000;

      // 🔥 연결 성공 핸들러
      const onConnect = (frame) => {
        if (!isMountedRef.current) {
          try { stomp.disconnect(); } catch (e) {}
          return;
        }

        console.log("✅ [WebSocket] 구급차 실시간 추적 연결 성공!");
        
        wsClientRef.current = stomp;
        isConnectingRef.current = false;
        setConnectionError(null);
        setReconnectAttempts(0);
        
        // 🔥 병원 거리 정보 구독
        try {
          const topic = `/topic/location/ambulance/${ambulanceId}`;
          
          stomp.subscribe(topic, (msg) => {
            try {
              const data = JSON.parse(msg.body);
              const { ambulanceId: msgAmbulanceId, hospitalId, distance } = data;
              
              setHospitalDistanceInfo({
                ambulanceId: msgAmbulanceId,
                hospitalId: hospitalId,
                distance: distance,
                timestamp: new Date().toISOString()
              });
              
              console.log(`🏥 [실시간] 병원까지 거리: ${(distance / 1000).toFixed(2)}km`);
              
            } catch (parseError) {
              console.warn("⚠️ [WebSocket] 메시지 파싱 에러");
            }
          });
          
        } catch (subscribeError) {
          console.error("❌ [WebSocket] 구독 실패:", subscribeError);
        }
      };

      // 🔥 연결 실패 핸들러
      const onError = (error) => {
        console.error("❌ [WebSocket] 연결 실패:", error?.message || error);
        
        isConnectingRef.current = false;
        wsClientRef.current = null;
        setConnectionError(`연결 실패: ${error?.message || '알 수 없는 에러'}`);
        
        // 재연결 로직 (최대 3회)
        if (reconnectAttempts < 3 && isMountedRef.current) {
          const nextAttempt = reconnectAttempts + 1;
          const delay = Math.min(2000 * nextAttempt, 10000); // 2초, 4초, 6초 간격
          
          console.log(`🔄 [WebSocket] ${delay}ms 후 재연결 시도 (${nextAttempt}/3)`);
          setReconnectAttempts(nextAttempt);
          
          setTimeout(() => {
            if (isMountedRef.current && !wsClientRef.current) {
              setForceReconnect(prev => prev + 1);
            }
          }, delay);
        } else {
          console.error("🚫 [WebSocket] 재연결 포기");
        }
      };

      // STOMP 연결 시작
      stomp.connect({}, onConnect, onError);

    } catch (createError) {
      console.error("❌ [WebSocket] 생성 실패:", createError.message);
      isConnectingRef.current = false;
      wsClientRef.current = null;
      setConnectionError(`생성 실패: ${createError.message}`);
    }

    // cleanup
    return () => {
      isConnectingRef.current = false;
      if (wsClientRef.current) {
        try {
          if (wsClientRef.current.connected) {
            wsClientRef.current.disconnect();
          }
        } catch (error) {
          // cleanup 에러 무시
        } finally {
          wsClientRef.current = null;
        }
      }
    };
  }, [ambulanceId, reconnectAttempts, forceReconnect]);

  // === 구급차 위치 추적 ===
  useEffect(() => {
    if (!ambulanceId) {
      return;
    }
    
    if (!navigator.geolocation) {
      console.warn("❌ [Location] Geolocation API 지원 안 함");
      return;
    }

    console.log("📍 [Location] 구급차 위치 추적 시작");

    // 위치 전송 함수
    const sendLocation = (latitude, longitude) => {
      // 구급차 위치 상태 업데이트 (지도 표시용)
      setAmbulanceLocation({
        latitude,
        longitude,
        timestamp: new Date().toISOString()
      });

      // WebSocket 연결 확인 후 전송
      if (!wsClientRef.current?.connected) {
        return; // 연결 안 됨, 조용히 스킵
      }
      
      if (!isMountedRef.current) {
        return;
      }

      try {
        // 백엔드로 위치 전송
        const locationData = {
          ambulanceId: ambulanceId,
          latitude: latitude,
          longitude: longitude
        };
        
        wsClientRef.current.send(
          "/pub/location/update",
          {},
          JSON.stringify(locationData)
        );
        
        // 개발 모드에서만 로그
        if (import.meta.env.DEV) {
          console.log(`📍 [Location] 위치 전송: ${latitude.toFixed(6)}, ${longitude.toFixed(6)}`);
        }
        
      } catch (sendError) {
        console.error("❌ [Location] 위치 전송 실패:", sendError.message);
      }
    };

    // Geolocation 옵션
    const geoOptions = {
      enableHighAccuracy: true,
      maximumAge: 1000,
      timeout: 15000
    };

    // 위치 추적 시작
    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        
        // 개발 모드에서만 상세 로그
        if (import.meta.env.DEV) {
          console.log(`📍 [구급차] ${latitude.toFixed(6)}, ${longitude.toFixed(6)} (정확도: ${Math.round(accuracy)}m)`);
        }
        
        sendLocation(latitude, longitude);
      },
      (error) => {
        console.error("❌ [Location] 위치 추적 에러:", error.message);
        
        // 에러 타입별 메시지
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setConnectionError("위치 권한이 거부되었습니다.");
            break;
          case error.POSITION_UNAVAILABLE:
            setConnectionError("위치 정보를 사용할 수 없습니다.");
            break;
          case error.TIMEOUT:
            console.warn("위치 요청 시간 초과, 계속 시도 중...");
            break;
          default:
            console.error("알 수 없는 위치 에러");
            break;
        }
      },
      geoOptions
    );
    
    watchIdRef.current = watchId;

    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
    };
  }, [ambulanceId]);

  // 🔥 외부에서 사용할 수 있는 깔끔한 인터페이스
  return {
    // 연결 상태
    isConnected: wsClientRef.current?.connected || false,
    connectionStatus: isConnectingRef.current ? 'connecting' : 
                     (wsClientRef.current?.connected ? 'connected' : 'disconnected'),
    connectionError,
    
    // 핵심 데이터
    ambulanceLocation,      // 구급차 현재 위치 { latitude, longitude, timestamp }
    hospitalDistanceInfo,   // 병원과의 거리 정보 { ambulanceId, hospitalId, distance, timestamp }
    
    // 유틸리티
    send: (destination, body) => {
      if (!wsClientRef.current?.connected) {
        console.warn("[Hook] WebSocket 연결 안 됨");
        return false;
      }
      
      try {
        wsClientRef.current.send(destination, {}, JSON.stringify(body));
        return true;
      } catch (error) {
        console.error("[Hook] 메시지 전송 실패:", error.message);
        return false;
      }
    },
    
    // 수동 재연결
    forceReconnect: () => {
      if (isConnectingRef.current) {
        console.log("⚠️ 이미 연결 시도 중");
        return;
      }
      
      console.log("🔄 [Manual] 수동 재연결 시작");
      setReconnectAttempts(0);
      setConnectionError(null);
      setForceReconnect(prev => prev + 1);
    },
    
    // 디버깅 정보 (개발 모드에서만)
    ...(import.meta.env.DEV && {
      debug: {
        socketUrl: SOCKET_URL,
        originalWsUrl: WS_BASE_URL,
        reconnectAttempts
      }
    })
  };
}
