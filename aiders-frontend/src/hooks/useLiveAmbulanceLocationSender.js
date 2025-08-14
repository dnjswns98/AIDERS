// src/hooks/useLiveAmbulanceLocationSender.js
import { useEffect, useRef, useState } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { useAuthStore } from '../store/useAuthStore';

const useLiveAmbulanceLocationSender = () => {
    const { user, accessToken } = useAuthStore();
    const stompClientRef = useRef(null);
    const locationIntervalRef = useRef(null);
    const [isConnected, setIsConnected] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!user?.userId || !accessToken) {
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
            onConnect: () => {
                console.log('[LocationSender] ✅ WebSocket 연결 성공');
                setIsConnected(true);
                setError(null);
                startSendingLocation();
            },
            onStompError: (frame) => {
                console.error('[LocationSender] ❌ STOMP 에러:', frame.headers['message']);
                setError('STOMP 프로토콜 오류가 발생했습니다.');
                stopSendingLocation();
            },
            onWebSocketClose: () => {
                console.log('[LocationSender] 🔌 WebSocket 연결 해제');
                setIsConnected(false);
                stopSendingLocation();
            },
        });

        const startSendingLocation = () => {
            if (locationIntervalRef.current) {
                clearInterval(locationIntervalRef.current);
            }

            locationIntervalRef.current = setInterval(() => {
                navigator.geolocation.getCurrentPosition(
                    (position) => {
                        const { latitude, longitude } = position.coords;
                        const locationData = {
                            ambulanceId: user.userId,
                            ambulanceNumber: user.userKey,
                            latitude,
                            longitude
                        };

                        if (client.active) {
                            client.publish({
                                destination: '/pub/location/update',
                                body: JSON.stringify(locationData),
                            });
                            console.log(`[LocationSender] 🚀 위치 전송:`, locationData);
                        }
                    },
                    (geoError) => {
                        console.error('[LocationSender] ❌ GPS 오류:', geoError.message);
                        setError('GPS 위치를 가져올 수 없습니다.');
                    },
                    { enableHighAccuracy: true }
                );
            }, 10000); // 10초마다 위치 전송
        };

        const stopSendingLocation = () => {
            if (locationIntervalRef.current) {
                clearInterval(locationIntervalRef.current);
                locationIntervalRef.current = null;
            }
        };

        client.activate();
        stompClientRef.current = client;

        return () => {
            stopSendingLocation();
            if (stompClientRef.current) {
                stompClientRef.current.deactivate();
            }
        };

    }, [user, accessToken]);

    return { isConnected, error };
};

export default useLiveAmbulanceLocationSender;