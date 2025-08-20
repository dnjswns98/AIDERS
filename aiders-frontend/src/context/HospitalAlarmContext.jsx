import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import SockJS from 'sockjs-client/dist/sockjs';
import Stomp from 'stompjs';

const HospitalAlarmContext = createContext();

export const useHospitalAlarm = () => {
  const context = useContext(HospitalAlarmContext);
  if (!context) {
    throw new Error('useHospitalAlarm must be used within a HospitalAlarmProvider');
  }
  return context;
};

export const HospitalAlarmProvider = ({ children }) => {
  const { user } = useAuthStore();
  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('연결 대기 중...');
  const [toastQueue, setToastQueue] = useState([]);
  const [currentToast, setCurrentToast] = useState(null);
  const [isToastVisible, setIsToastVisible] = useState(false);
  const stompClientRef = useRef(null);
  const toastTimeoutRef = useRef(null);
  const isConnectingRef = useRef(false); // 연결 시도 중 플래그

  // WebSocket 연결
  const connectWebSocket = () => {
    if (!user?.userId) {
      setConnectionStatus('병원 ID 없음');
      return;
    }

    // 이미 연결 중이거나 연결되어 있으면 중단
    if (isConnectingRef.current || stompClientRef.current?.connected) {
      return;
    }

    isConnectingRef.current = true;
    
    const WS_BASE_URL = import.meta.env.VITE_WS_BASE_URL || "ws://localhost:8080/ws";
    const SOCKET_URL = WS_BASE_URL.replace(/^ws:\/\//, 'http://').replace(/^wss:\/\//, 'https://');
    
    console.log('🔌 WebSocket 연결 시작:', user.userId);
    setConnectionStatus('WebSocket 연결 중...');

    try {
      const sock = new SockJS(SOCKET_URL);
      const stomp = Stomp.over(sock);
      
      stomp.debug = null;
      stomp.heartbeat.outgoing = 10000;
      stomp.heartbeat.incoming = 10000;

      const onConnect = () => {
        setIsConnected(true);
        setConnectionStatus('연결됨');
        stompClientRef.current = stomp;
        isConnectingRef.current = false; // 연결 완료
        
        // 알람 토픽 구독
        const alarmTopic = `/topic/alarm/${user.userId}`;
        console.log('🔗 WebSocket 알람 토픽 구독:', alarmTopic);
        stomp.subscribe(alarmTopic, (message) => {
          try {
            const alarmData = JSON.parse(message.body);
            console.log('🔔 [WebSocket] 알람 수신:', {
              type: alarmData.type,
              ambulanceKey: alarmData.ambulanceKey,
              message: alarmData.message,
              raw: alarmData
            });
            
            // 무조건 토스트 큐에 추가
            addToastToQueue(alarmData);
            
            // 페이지 새로고침 이벤트 발생
            console.log('📡 [WebSocket] hospitalAlarmReceived 이벤트 발생');
            window.dispatchEvent(new CustomEvent('hospitalAlarmReceived', { 
              detail: alarmData 
            }));
            
            // 브라우저 알림
            if (Notification.permission === 'granted') {
              new Notification(`${getAlarmTypeText(alarmData.type)} 알림`, {
                body: alarmData.message || `새로운 ${getAlarmTypeText(alarmData.type)} 알림이 있습니다.`
              });
            }
          } catch (error) {
            console.error('❌ [WebSocket] 알람 파싱 오류:', error);
          }
        });

        // 필요시 다른 토픽들도 여기서 구독 가능
        // 예: 구급차 위치 추적, 병상 상태 등
      };

      const onError = (error) => {
        setIsConnected(false);
        setConnectionStatus('연결 실패');
        isConnectingRef.current = false; // 연결 실패
        console.error('WebSocket 연결 실패:', error);
      };

      stomp.connect({}, onConnect, onError);
      
    } catch (error) {
      setConnectionStatus('연결 오류');
      isConnectingRef.current = false; // 연결 오류
      console.error('WebSocket 생성 실패:', error);
    }
  };

  // WebSocket 연결 해제
  const disconnectWebSocket = () => {
    if (stompClientRef.current?.connected) {
      stompClientRef.current.disconnect();
    }
    stompClientRef.current = null;
    isConnectingRef.current = false;
    setIsConnected(false);
    setConnectionStatus('연결 해제됨');
  };

  // 알람 타입 텍스트 변환
  const getAlarmTypeText = (type) => {
    switch (type) {
      case 'MATCHING': return '매칭 완료';
      case 'REQUEST': return '통화 요청';
      case 'EDIT': return '정보 수정';
      case 'COMPLETE': return '이송 완료';
      default: return type;
    }
  };

  // 알람 타입 아이콘
  const getAlarmTypeIcon = (type) => {
    switch (type) {
      case 'MATCHING': return '🎯';
      case 'REQUEST': return '📞';
      case 'EDIT': return '✏️';
      case 'COMPLETE': return '✅';
      default: return '🔔';
    }
  };

  // 알람 타입 색상
  const getAlarmTypeColor = (type) => {
    switch (type) {
      case 'MATCHING': return '#10b981';
      case 'REQUEST': return '#f59e0b';
      case 'EDIT': return '#3b82f6';
      case 'COMPLETE': return '#059669';
      default: return '#6b7280';
    }
  };

  // 토스트 큐에 알람 추가 - 조건 없이 무조건 추가
  const addToastToQueue = (alarmData) => {
    const toast = {
      id: Date.now() + Math.random(),
      ...alarmData,
      timestamp: new Date()
    };
    
    console.log('🔔 알람 추가:', alarmData.type);
    setToastQueue(prev => [...prev, toast]);
  };

  // 토스트 표시 처리
  const showNextToast = () => {
    const nextToast = toastQueue[0];
    setToastQueue(prev => prev.slice(1));
    setCurrentToast(nextToast);
    setIsToastVisible(true);
    
    // 5초 후 자동 숨기기
    toastTimeoutRef.current = setTimeout(() => {
      hideCurrentToast();
    }, 5000);
  };

  // 현재 토스트 숨기기
  const hideCurrentToast = () => {
    setIsToastVisible(false);
    
    // 애니메이션 완료 후 토스트 제거
    setTimeout(() => {
      setCurrentToast(null);
      if (toastTimeoutRef.current) {
        clearTimeout(toastTimeoutRef.current);
        toastTimeoutRef.current = null;
      }
    }, 300); // 애니메이션 시간
  };

  // 토스트 클릭 핸들러
  const handleToastClick = () => {
    // NotificationModal 열기 이벤트 발생
    window.dispatchEvent(new CustomEvent('openNotificationModal'));
    hideCurrentToast();
  };

  // 토스트 큐 처리 - 간단하게 다음 토스트 표시
  useEffect(() => {
    if (!currentToast && toastQueue.length > 0) {
      showNextToast();
    }
  }, [toastQueue, currentToast]);

  // WebSocket 연결 관리
  useEffect(() => {
    if (user?.userId && !isConnected && !isConnectingRef.current) {
      console.log('🔌 WebSocket 연결 시도:', user.userId);
      connectWebSocket();
      
      // 브라우저 알림 권한 요청
      if (Notification.permission === 'default') {
        Notification.requestPermission();
      }
    }

    return () => {
      disconnectWebSocket();
      if (toastTimeoutRef.current) {
        clearTimeout(toastTimeoutRef.current);
      }
    };
  }, [user?.userId]);

  const value = {
    // WebSocket 상태
    isConnected,
    connectionStatus,
    stompClient: stompClientRef.current,
    connectWebSocket,
    disconnectWebSocket,
    
    // 토스트 관리
    currentToast,
    isToastVisible,
    handleToastClick,
    hideCurrentToast,
    
    // 유틸리티 함수
    getAlarmTypeText,
    getAlarmTypeIcon,
    getAlarmTypeColor
  };

  return (
    <HospitalAlarmContext.Provider value={value}>
      {children}
    </HospitalAlarmContext.Provider>
  );
};