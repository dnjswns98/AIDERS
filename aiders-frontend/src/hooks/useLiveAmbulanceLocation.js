// src/hooks/useLiveAmbulanceLocation.js

import { useState, useEffect, useRef, useCallback } from 'react';
import Stomp from 'stompjs';
import SockJS from 'sockjs-client';

const useLiveAmbulanceLocation = (ambulanceId) => {
    const [ambulanceLocation, setAmbulanceLocation] = useState(null);
    const [hospitalDistanceInfo, setHospitalDistanceInfo] = useState(null);
    const [wsError, setWsError] = useState(null);
    const stompClientRef = useRef(null);

    const disconnect = useCallback(() => {
        if (stompClientRef.current && stompClientRef.current.connected) {
            stompClientRef.current.disconnect(() => {
                console.log('[LiveLocation] WebSocket 연결 해제');
            });
            stompClientRef.current = null;
        }
    }, []);

    const connect = useCallback(() => {
        if (!ambulanceId || stompClientRef.current) {
            return;
        }

        const WS_BASE_URL = (import.meta.env.VITE_WS_BASE_URL || "ws://localhost:8080/ws")
            .replace(/^ws:\/\//, 'http://')
            .replace(/^wss:\/\//, 'https://');
        
        console.log(`[LiveLocation] WebSocket 연결 시도: ${WS_BASE_URL}`);
        
        const socket = new SockJS(WS_BASE_URL);
        const stompClient = Stomp.over(socket);
        stompClient.debug = null; // 디버그 로그 비활성화

        stompClient.connect({}, 
            (frame) => {
                console.log('[LiveLocation] ✅ WebSocket 연결 성공');
                setWsError(null);
                stompClientRef.current = stompClient;

                // 구급차 위치 및 거리 정보 구독
                const topic = `/topic/location/ambulance/${ambulanceId}`;
                console.log(`[LiveLocation] 📡 토픽 구독: ${topic}`);
                
                stompClient.subscribe(topic, (message) => {
                    try {
                        const data = JSON.parse(message.body);
                        console.log('[LiveLocation] 📩 메시지 수신:', data);
                        
                        // 실시간 위치 정보 업데이트
                        setAmbulanceLocation({
                            latitude: data.latitude,
                            longitude: data.longitude,
                            timestamp: new Date().toISOString()
                        });
                        
                        // 거리 정보 업데이트
                        setHospitalDistanceInfo({
                            ambulanceId: data.ambulanceId,
                            hospitalId: data.hospitalId,
                            distance: data.distance,
                            timestamp: new Date().toISOString()
                        });

                    } catch (e) {
                        console.error('[LiveLocation] ❌ 메시지 처리 실패:', e);
                        setWsError('수신 데이터 처리에 실패했습니다.');
                    }
                });
            },
            (error) => {
                console.error('[LiveLocation] ❌ WebSocket 연결 실패:', error);
                setWsError('실시간 위치 서버에 연결할 수 없습니다. 5초 후 재시도합니다.');
                stompClientRef.current = null;
                setTimeout(connect, 5000); // 5초 후 재연결 시도
            }
        );

    }, [ambulanceId]);

    // ambulanceId가 변경되면 웹소켓 연결을 다시 설정합니다.
    useEffect(() => {
        connect();
        return () => {
            disconnect();
        };
    }, [connect, disconnect]);

    return {
        ambulanceLocation,
        hospitalDistanceInfo,
        wsError,
        wsReconnect: connect, // 수동 재연결 함수
    };
};

export default useLiveAmbulanceLocation;