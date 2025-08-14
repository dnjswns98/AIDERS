import { useState, useEffect, useRef } from 'react';
import SockJS from 'sockjs-client';
import Stomp from 'stompjs';
import useEmergencyStore from '../store/useEmergencyStore';
import { calculateDistance } from '../api/api';

const useLiveAmbulanceLocation = (ambulanceId) => {
    const [ambulanceLocation, setAmbulanceLocation] = useState(null);
    const [hospitalDistanceInfo, setHospitalDistanceInfo] = useState({ distance: null, duration: null });
    const { matchedHospitals } = useEmergencyStore();
    const stompClientRef = useRef(null);
    const locationWatchIdRef = useRef(null);

    const hospital = matchedHospitals?.[0];

    useEffect(() => {
        if (!ambulanceId) return;

        // 1. 초기 위치 설정 (고정밀 GPS)
        locationWatchIdRef.current = navigator.geolocation.watchPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;
                const newLocation = { latitude, longitude, timestamp: new Date().toISOString() };
                
                console.log('[GPS watch] 새 위치 수신:', newLocation);
                setAmbulanceLocation(newLocation);

                // WebSocket으로 위치 전송
                if (stompClientRef.current && stompClientRef.current.connected) {
                    stompClientRef.current.send(`/pub/location/ambulance/${ambulanceId}`, {}, JSON.stringify({ latitude, longitude }));
                }

                // 병원과의 거리 계산
                if (hospital?.latitude && hospital?.longitude) {
                    try {
                        const distanceInfo = await calculateDistance(newLocation, hospital);
                        setHospitalDistanceInfo({
                            distance: (distanceInfo.distance / 1000).toFixed(1) + 'km',
                            duration: Math.round(distanceInfo.duration) + '분'
                        });
                    } catch (error) {
                        console.error('거리 계산 실패:', error);
                    }
                }
            },
            (error) => {
                console.error("GPS 위치 추적 오류:", error);
            },
            { enableHighAccuracy: true, timeout: 20000, maximumAge: 1000, distanceFilter: 10 }
        );

        // 2. WebSocket 연결 설정
        const WS_BASE_URL = (import.meta.env.VITE_WS_BASE_URL || "ws://localhost:8080/ws")
            .replace(/^ws:\/\//, "http://").replace(/^wss:\/\//, "https://");
        
        const socket = new SockJS(WS_BASE_URL);
        const stompClient = Stomp.over(socket);
        stompClient.debug = null;

        stompClient.connect({}, 
            () => {
                console.log('[LiveLocation] WebSocket 연결 성공');
                stompClientRef.current = stompClient;
            },
            (error) => {
                console.error('[LiveLocation] WebSocket 연결 실패:', error);
            }
        );

        // 3. 컴포넌트 언마운트 시 정리
        return () => {
            if (locationWatchIdRef.current) {
                navigator.geolocation.clearWatch(locationWatchIdRef.current);
                console.log('[GPS watch] 위치 추적 중지.');
            }
            if (stompClientRef.current && stompClientRef.current.connected) {
                stompClientRef.current.disconnect(() => {
                    console.log('[LiveLocation] WebSocket 연결 해제');
                });
            }
        };
    }, [ambulanceId, hospital]); // ambulanceId나 hospital이 변경되면 재설정

    return { ambulanceLocation, hospitalDistanceInfo };
};

export default useLiveAmbulanceLocation;