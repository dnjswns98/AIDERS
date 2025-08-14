import { useState, useEffect, useRef } from 'react';
import SockJS from 'sockjs-client';
import Stomp from 'stompjs';
import useEmergencyStore from '../store/useEmergencyStore';
import { calculateDistance } from '../api/api';

const useLiveAmbulanceLocation = (ambulanceId) => {
    const [ambulanceLocation, setAmbulanceLocation] = useState(null);
    const [hospitalDistanceInfo, setHospitalDistanceInfo] = useState({ distance: null, duration: null });
    const [locationError, setLocationError] = useState(null);
    const { matchedHospitals } = useEmergencyStore();
    const stompClientRef = useRef(null);
    const locationWatchIdRef = useRef(null);
    const retryTimeoutRef = useRef(null);
    const retryCountRef = useRef(0);
    
    const hospital = matchedHospitals?.[0];

    // GPS 위치 가져오기 함수
    const startLocationTracking = () => {
        if (locationWatchIdRef.current) {
            navigator.geolocation.clearWatch(locationWatchIdRef.current);
        }

        // 먼저 현재 위치를 한 번 가져오기 시도
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                const newLocation = { latitude, longitude, timestamp: new Date().toISOString() };
                console.log('[GPS] 초기 위치 수신:', newLocation);
                setAmbulanceLocation(newLocation);
                setLocationError(null);
                retryCountRef.current = 0;
                
                // 성공하면 연속 추적 시작
                startWatchPosition();
            },
            (error) => {
                console.error("GPS 초기 위치 오류:", error);
                handleLocationError(error);
            },
            { 
                enableHighAccuracy: true, 
                timeout: 10000, // 10초로 단축
                maximumAge: 30000 // 30초로 증가
            }
        );
    };

    // 연속 위치 추적
    const startWatchPosition = () => {
        locationWatchIdRef.current = navigator.geolocation.watchPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;
                const newLocation = { latitude, longitude, timestamp: new Date().toISOString() };
                
                console.log('[GPS watch] 새 위치 수신:', newLocation);
                setAmbulanceLocation(newLocation);
                setLocationError(null);
                retryCountRef.current = 0;

                // WebSocket으로 위치 전송
                if (stompClientRef.current && stompClientRef.current.connected) {
                    stompClientRef.current.send(
                        `/pub/location/ambulance/${ambulanceId}`, 
                        {}, 
                        JSON.stringify({ latitude, longitude })
                    );
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
                handleLocationError(error);
            },
            { 
                enableHighAccuracy: true, 
                timeout: 80000, // 8초로 설정
                maximumAge: 60000 // 1분으로 증가
            }
        );
    };

    // 위치 오류 처리 및 재시도 로직
    const handleLocationError = (error) => {
        const maxRetries = 3;
        retryCountRef.current += 1;

        let errorMessage = '위치를 가져올 수 없습니다.';
        
        switch (error.code) {
            case error.PERMISSION_DENIED:
                errorMessage = 'GPS 권한이 거부되었습니다.';
                break;
            case error.POSITION_UNAVAILABLE:
                errorMessage = 'GPS 위치 정보를 사용할 수 없습니다.';
                break;
            case error.TIMEOUT:
                errorMessage = 'GPS 위치 요청이 시간 초과되었습니다.';
                break;
        }

        setLocationError(errorMessage);

        // 재시도 로직 (PERMISSION_DENIED 제외)
        if (error.code !== error.PERMISSION_DENIED && retryCountRef.current <= maxRetries) {
            console.log(`GPS 재시도 (${retryCountRef.current}/${maxRetries})`);
            
            retryTimeoutRef.current = setTimeout(() => {
                startLocationTracking();
            }, 3000 * retryCountRef.current); // 점진적 지연
        }
    };

    useEffect(() => {
        if (!ambulanceId) return;

        // 위치 추적 시작
        startLocationTracking();

        // WebSocket 연결 설정
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

        // 컴포넌트 언마운트 시 정리
        return () => {
            if (locationWatchIdRef.current) {
                navigator.geolocation.clearWatch(locationWatchIdRef.current);
                console.log('[GPS watch] 위치 추적 중지.');
            }
            
            if (retryTimeoutRef.current) {
                clearTimeout(retryTimeoutRef.current);
            }
            
            if (stompClientRef.current && stompClientRef.current.connected) {
                stompClientRef.current.disconnect(() => {
                    console.log('[LiveLocation] WebSocket 연결 해제');
                });
            }
        };
    }, [ambulanceId, hospital]);

    return { 
        ambulanceLocation, 
        hospitalDistanceInfo, 
        locationError // 오류 상태도 반환
    };
};

export default useLiveAmbulanceLocation;
