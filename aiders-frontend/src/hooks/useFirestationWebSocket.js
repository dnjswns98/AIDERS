// hooks/useFirestationWebSocket.js
import { useEffect, useState, useCallback, useRef } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { useAuthStore } from '../store/useAuthStore';
import useFireStationStore from '../store/useFireStationStore'; // 1. 소방서 스토어 import

const useFirestationWebSocket = (firestationId) => {
  const stompClientRef = useRef(null);
  const [isConnected, setIsConnected] = useState(false);
  const [ambulanceUpdates, setAmbulanceUpdates] = useState(new Map());
  const [dispatchUpdates, setDispatchUpdates] = useState([]);
  
  const { accessToken } = useAuthStore();
  // 2. 스토어에서 구급차 목록을 가져옵니다.
  const { ambulances } = useFireStationStore.getState();

  useEffect(() => {
    if (!firestationId || !accessToken) {
        return;
    }

    const WS_BASE_URL = (import.meta.env.VITE_WS_BASE_URL || "ws://localhost:8080/ws")
        .replace(/^ws:\/\//, 'http://')
        .replace(/^wss:\/\//, 'https://');

    const fullUrl = `${WS_BASE_URL}?token=${accessToken}`;
    
    const client = new Client({
      webSocketFactory: () => new SockJS(fullUrl),
      connectHeaders: {}, 
      reconnectDelay: 10000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,

      onConnect: (frame) => {
        console.log('[WebSocket] 연결 성공:', frame);
        setIsConnected(true);
        
        // --- 3. 여기가 핵심 수정 부분입니다 ---
        // 소방서에 소속된 모든 구급차에 대해 각각의 위치 토픽을 구독합니다.
        console.log(`[WebSocket] ${ambulances.length}대의 구급차 위치 토픽 구독을 시작합니다.`);
        ambulances.forEach(ambulance => {
            if (ambulance.ambulanceId) {
                const locationTopic = `/topic/location/ambulance/${ambulance.ambulanceId}`;
                console.log(`[WebSocket] 구독 중: ${locationTopic}`);
                client.subscribe(locationTopic, (message) => {
                    const locationUpdate = JSON.parse(message.body);
                    console.log(`[WebSocket] 위치 업데이트 수신 (ID: ${locationUpdate.ambulanceId}):`, locationUpdate);
                    setAmbulanceUpdates(prev => {
                        const newMap = new Map(prev);
                        const existing = newMap.get(locationUpdate.ambulanceId) || {};
                        newMap.set(locationUpdate.ambulanceId, { ...existing, ...locationUpdate, lastLocationUpdate: Date.now() });
                        return newMap;
                    });
                });
            }
        });

        // 기존의 다른 토픽 구독은 그대로 유지합니다.
        client.subscribe(`/topic/firestation/${firestationId}/dispatch`, (message) => {
          const dispatchUpdate = JSON.parse(message.body);
          setDispatchUpdates(prev => [{ ...dispatchUpdate, id: Date.now(), timestamp: Date.now() }, ...prev.slice(0, 9)]);
        });
      },
      onStompError: (frame) => {
        console.error('[WebSocket] STOMP 에러:', frame.headers['message']);
        setIsConnected(false);
      },
      onWebSocketError: (error) => {
        console.error('[WebSocket] WebSocket 에러:', error);
        setIsConnected(false);
      },
      onDisconnect: () => {
        console.log('[WebSocket] 연결 해제');
        setIsConnected(false);
      }
    });

    client.activate();
    stompClientRef.current = client;

    return () => {
      if (stompClientRef.current) {
        stompClientRef.current.deactivate();
        console.log('[WebSocket] 연결 해제 중...');
      }
    };
  // 4. ambulances 배열이 변경될 때도 이 효과를 다시 실행하도록 의존성에 추가합니다.
  }, [firestationId, accessToken, ambulances]); 

  const sendMessage = useCallback((destination, body) => {
    if (stompClientRef.current && stompClientRef.current.active) {
      stompClientRef.current.publish({
        destination,
        body: JSON.stringify(body)
      });
    } else {
      console.warn('[WebSocket] 연결되지 않음, 메시지 전송 실패');
    }
  }, []);

  const sendDispatchOrder = useCallback((dispatchData) => {
    sendMessage('/pub/dispatch/order', { firestationId, ...dispatchData, timestamp: Date.now() });
  }, [sendMessage, firestationId]);

  const requestStatusUpdate = useCallback((ambulanceId) => {
    sendMessage('/pub/ambulance/status-request', { ambulanceId, firestationId, timestamp: Date.now() });
  }, [sendMessage, firestationId]);

  return {
    isConnected,
    ambulanceUpdates,
    dispatchUpdates,
    sendDispatchOrder,
    requestStatusUpdate
  };
};

export default useFirestationWebSocket;