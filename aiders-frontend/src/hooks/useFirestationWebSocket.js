// hooks/useFirestationWebSocket.js
import { useEffect, useState, useCallback } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { useAuthStore } from '../stores/useAuthStore';

const useFirestationWebSocket = (firestationId) => {
  const [stompClient, setStompClient] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [ambulanceUpdates, setAmbulanceUpdates] = useState(new Map());
  const [dispatchUpdates, setDispatchUpdates] = useState([]);
  
  const { user } = useAuthStore();

  // 연결 설정
  const connect = useCallback(() => {
    if (!firestationId || !user) return;

    console.log('[WebSocket] 소방서 WebSocket 연결 시도:', firestationId);

    const client = new Client({
      webSocketFactory: () => new SockJS('/ws'),
      connectHeaders: {
        Authorization: `Bearer ${localStorage.getItem('accessToken')}`
      },
      debug: (str) => {
        console.log('[WebSocket Debug]', str);
      },
      onConnect: (frame) => {
        console.log('[WebSocket] 연결 성공:', frame);
        setIsConnected(true);
        
        // 소방서 소속 구급차들의 상태 변경 구독
        client.subscribe(`/topic/firestation/${firestationId}/ambulance-status`, (message) => {
          const statusUpdate = JSON.parse(message.body);
          console.log('[WebSocket] 구급차 상태 업데이트:', statusUpdate);
          
          setAmbulanceUpdates(prev => {
            const newMap = new Map(prev);
            newMap.set(statusUpdate.ambulanceId, {
              ...statusUpdate,
              timestamp: Date.now()
            });
            return newMap;
          });
        });
        
        // 출동 알림 구독
        client.subscribe(`/topic/firestation/${firestationId}/dispatch`, (message) => {
          const dispatchUpdate = JSON.parse(message.body);
          console.log('[WebSocket] 출동 업데이트:', dispatchUpdate);
          
          setDispatchUpdates(prev => [
            {
              ...dispatchUpdate,
              id: Date.now(),
              timestamp: Date.now()
            },
            ...prev.slice(0, 9) // 최대 10개만 유지
          ]);
        });
        
        // 구급차 위치 업데이트 구독 (선택적)
        client.subscribe(`/topic/firestation/${firestationId}/location`, (message) => {
          const locationUpdate = JSON.parse(message.body);
          console.log('[WebSocket] 위치 업데이트:', locationUpdate);
          
          // 위치 업데이트 처리 로직
          setAmbulanceUpdates(prev => {
            const existing = prev.get(locationUpdate.ambulanceId) || {};
            const newMap = new Map(prev);
            newMap.set(locationUpdate.ambulanceId, {
              ...existing,
              latitude: locationUpdate.latitude,
              longitude: locationUpdate.longitude,
              lastLocationUpdate: Date.now()
            });
            return newMap;
          });
        });
      },
      onStompError: (frame) => {
        console.error('[WebSocket] STOMP 에러:', frame);
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
    setStompClient(client);
  }, [firestationId, user]);

  // 연결 해제
  const disconnect = useCallback(() => {
    if (stompClient) {
      console.log('[WebSocket] 연결 해제 중...');
      stompClient.deactivate();
      setStompClient(null);
      setIsConnected(false);
    }
  }, [stompClient]);

  // 자동 연결/해제
  useEffect(() => {
    connect();
    
    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  // 메시지 전송 함수들
  const sendMessage = useCallback((destination, body) => {
    if (stompClient && isConnected) {
      stompClient.publish({
        destination,
        body: JSON.stringify(body)
      });
    } else {
      console.warn('[WebSocket] 연결되지 않음, 메시지 전송 실패');
    }
  }, [stompClient, isConnected]);

  // 출동 지시 메시지 전송
  const sendDispatchOrder = useCallback((dispatchData) => {
    sendMessage('/pub/dispatch/order', {
      firestationId,
      ...dispatchData,
      timestamp: Date.now()
    });
  }, [sendMessage, firestationId]);

  // 상태 확인 요청
  const requestStatusUpdate = useCallback((ambulanceId) => {
    sendMessage('/pub/ambulance/status-request', {
      ambulanceId,
      firestationId,
      timestamp: Date.now()
    });
  }, [sendMessage, firestationId]);

  return {
    isConnected,
    ambulanceUpdates,
    dispatchUpdates,
    sendDispatchOrder,
    requestStatusUpdate,
    connect,
    disconnect
  };
};

export default useFirestationWebSocket;
