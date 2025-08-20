// src/hooks/useFirestationWebSocket.js
import { useEffect, useState, useCallback, useRef } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { useAuthStore } from '../store/useAuthStore';
import useFireStationStore from '../store/useFireStationStore';

const useFirestationWebSocket = (firestationId) => {
  const stompClientRef = useRef(null);
  const [isConnected, setIsConnected] = useState(false);
  const [ambulanceUpdates, setAmbulanceUpdates] = useState(new Map());
  const [dispatchUpdates, setDispatchUpdates] = useState([]);
  
  const { accessToken } = useAuthStore();
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
      reconnectDelay: 10000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,

      onConnect: (frame) => {
        console.log('[WebSocket] 연결 성공:', frame);
        setIsConnected(true);
        
        const locationTopic = `/topic/location/firestation/${firestationId}`;
        console.log(`[WebSocket] 구급차 위치 토픽 구독 시작: ${locationTopic}`);
        client.subscribe(locationTopic, (message) => {
            const locationUpdate = JSON.parse(message.body);
            console.log(`[WebSocket] 위치 업데이트 수신 (ID: ${locationUpdate.ambulanceId}):`, locationUpdate);
            setAmbulanceUpdates(prev => {
                const newMap = new Map(prev);
                newMap.set(locationUpdate.ambulanceId, { 
                    ...locationUpdate, 
                    timestamp: Date.now() 
                });
                return newMap;
            });
        });

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
  }, [firestationId, accessToken]); 

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