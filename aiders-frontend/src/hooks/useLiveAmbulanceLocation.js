// src/hooks/useLiveAmbulanceLocation.js
import { useEffect, useRef, useState } from "react";
import SockJS from "sockjs-client/dist/sockjs";
import Stomp from "stompjs";

const createSockJSUrl = (wsUrl) => {
  if (!wsUrl) return "http://localhost:8080/ws";
  
  return wsUrl
    .replace(/^ws:\/\//, 'http://')
    .replace(/^wss:\/\//, 'https://');
};

const WS_BASE_URL = import.meta.env.VITE_WS_BASE_URL || 
                    import.meta.env.VITE_WS_URL || 
                    "ws://localhost:8080/ws";

const SOCKET_URL = createSockJSUrl(WS_BASE_URL);

export default function useLiveAmbulanceLocation(ambulanceId) {
  const wsClientRef = useRef(null);
  const watchIdRef = useRef(null);
  const isConnectingRef = useRef(false);
  const isMountedRef = useRef(true);
  
  const [hospitalDistanceInfo, setHospitalDistanceInfo] = useState(null);
  const [ambulanceLocation, setAmbulanceLocation] = useState(null);
  const [connectionError, setConnectionError] = useState(null);
  const [reconnectAttempts, setReconnectAttempts] = useState(0);
  const [forceReconnect, setForceReconnect] = useState(0);

  useEffect(() => {
    isMountedRef.current = true;
    
    return () => {
      isMountedRef.current = false;
      isConnectingRef.current = false;
      
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
      
      if (wsClientRef.current) {
        try {
          if (wsClientRef.current.connected) {
            wsClientRef.current.disconnect();
          }
        } catch (error) {
        } finally {
          wsClientRef.current = null;
        }
      }
    };
  }, []);

  useEffect(() => {
    if (!ambulanceId) {
      return;
    }

    if (isConnectingRef.current) {
      return;
    }

    isConnectingRef.current = true;

    if (wsClientRef.current) {
      try {
        if (wsClientRef.current.connected) {
          wsClientRef.current.disconnect();
        }
        wsClientRef.current = null;
      } catch (error) {
      }
    }

    try {
      const sock = new SockJS(SOCKET_URL);
      const stomp = Stomp.over(sock);
      
      stomp.debug = null;
      
      stomp.heartbeat.outgoing = 10000;
      stomp.heartbeat.incoming = 10000;

      const onConnect = (frame) => {
        if (!isMountedRef.current) {
          try { stomp.disconnect(); } catch (e) {}
          return;
        }

        wsClientRef.current = stomp;
        isConnectingRef.current = false;
        setConnectionError(null);
        setReconnectAttempts(0);
        
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
              
            } catch (parseError) {
            }
          });
          
        } catch (subscribeError) {
          console.error("❌ [WebSocket] 구독 실패:", subscribeError);
        }
      };

      const onError = (error) => {
        console.error("❌ [WebSocket] 연결 실패:", error?.message || error);
        
        isConnectingRef.current = false;
        wsClientRef.current = null;
        setConnectionError(`연결 실패: ${error?.message || '알 수 없는 에러'}`);
        
        if (reconnectAttempts < 3 && isMountedRef.current) {
          const nextAttempt = reconnectAttempts + 1;
          const delay = Math.min(2000 * nextAttempt, 10000);
          
          setReconnectAttempts(nextAttempt);
          
          setTimeout(() => {
            if (isMountedRef.current && !wsClientRef.current) {
              setForceReconnect(prev => prev + 1);
            }
          }, delay);
        } else {
        }
      };

      stomp.connect({}, onConnect, onError);

    } catch (createError) {
      console.error("❌ [WebSocket] 생성 실패:", createError.message);
      isConnectingRef.current = false;
      wsClientRef.current = null;
      setConnectionError(`생성 실패: ${createError.message}`);
    }

    return () => {
      isConnectingRef.current = false;
      if (wsClientRef.current) {
        try {
          if (wsClientRef.current.connected) {
            wsClientRef.current.disconnect();
          }
        } catch (error) {
        } finally {
          wsClientRef.current = null;
        }
      }
    };
  }, [ambulanceId, reconnectAttempts, forceReconnect]);

  useEffect(() => {
    if (!ambulanceId) {
      return;
    }
    
    if (!navigator.geolocation) {
      return;
    }

    const sendLocation = (latitude, longitude) => {
      setAmbulanceLocation({
        latitude,
        longitude,
        timestamp: new Date().toISOString()
      });

      if (!wsClientRef.current?.connected) {
        return;
      }
      
      if (!isMountedRef.current) {
        return;
      }

      try {
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
        
      } catch (sendError) {
        console.error("❌ [Location] 위치 전송 실패:", sendError.message);
      }
    };

    const geoOptions = {
      enableHighAccuracy: true,
      maximumAge: 1000,
      timeout: 15000
    };

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        
        sendLocation(latitude, longitude);
      },
      (error) => {
        console.error("❌ [Location] 위치 추적 에러:", error.message);
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setConnectionError("위치 권한이 거부되었습니다.");
            break;
          case error.POSITION_UNAVAILABLE:
            setConnectionError("위치 정보를 사용할 수 없습니다.");
            break;
          case error.TIMEOUT:
            break;
          default:
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

  return {
    isConnected: wsClientRef.current?.connected || false,
    connectionStatus: isConnectingRef.current ? 'connecting' : 
                     (wsClientRef.current?.connected ? 'connected' : 'disconnected'),
    connectionError,
    
    ambulanceLocation,
    hospitalDistanceInfo,
    
    send: (destination, body) => {
      if (!wsClientRef.current?.connected) {
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
    
    forceReconnect: () => {
      if (isConnectingRef.current) {
        return;
      }
      
      setReconnectAttempts(0);
      setConnectionError(null);
      setForceReconnect(prev => prev + 1);
    },
    
    ...(import.meta.env.DEV && {
      debug: {
        socketUrl: SOCKET_URL,
        originalWsUrl: WS_BASE_URL,
        reconnectAttempts
      }
    })
  };
}