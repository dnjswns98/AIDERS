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
    const retryTimeoutRef = useRef(0);
    const retryCountRef = useRef(0);
    const lastSentLocationRef = useRef(null); // 마지막으로 전송된 위치 저장

    const hospital = matchedHospitals?.[0];

    // GPS 위치 가져오기 함수
    const startLocationTracking = () => {
        if (locationWatchIdRef.current) {
            navigator.geolocation.clearWatch(locationWatchIdRef.current);
        }

        // 먼저 현재 위치를 한 번 가져오기 시도
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude, accuracy } = position.coords;
                // 초기 위치도 정확도 필터링
                if (accuracy > 5000) { // 5000미터 이상 부정확하면 건너뛰기 (디버깅용)
                    console.warn('[GPS] 초기 위치 정확도 낮음, 건너뜀:', accuracy);
                    setLocationError('초기 위치 정확도가 낮습니다. 다시 시도해주세요.');
                    handleLocationError({ code: 'ACCURACY_LOW', message: 'Initial accuracy too low' }); // 재시도 로직에 포함
                    return;
                }

                const newLocation = { latitude, longitude, timestamp: new Date().toISOString() };
                console.log('[GPS] 초기 위치 수신:', newLocation, '정확도:', accuracy);
                setAmbulanceLocation(newLocation);
                lastSentLocationRef.current = newLocation; // 초기 위치 설정
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
                timeout: 15000, // 15초로 설정
                maximumAge: 5000 // 5초로 설정
            }
        );
    };

    // 연속 위치 추적
    const startWatchPosition = () => {
        locationWatchIdRef.current = navigator.geolocation.watchPosition(
            async (position) => {
                const { latitude, longitude, accuracy } = position.coords;
                const newLocation = { latitude, longitude, timestamp: new Date().toISOString() };
                
                // 정확도 필터링: 5000미터 이상 부정확하면 건너뛰기 (디버깅용)
                if (accuracy > 5000) {
                    console.warn('[GPS watch] 정확도 낮음, 건너뜀:', accuracy);
                    setLocationError('위치 정확도가 낮습니다.');
                    return;
                }

                // 이동 임계값 필터링: 마지막 전송 위치에서 5미터 이상 이동했을 때만 업데이트
                if (lastSentLocationRef.current) {
                    try {
                        const dist = await calculateDistance(lastSentLocationRef.current, newLocation);
                        if (dist.distance < 5) { // 5미터 미만 이동 시 무시
                            console.log('[GPS watch] 이동 거리 미미, 업데이트 건너뜀:', dist.distance.toFixed(2), 'm');
                            return;
                        }
                    } catch (e) {
                        console.error('거리 계산 오류:', e);
                        // 오류 발생 시 일단 업데이트 진행 (정확도 문제로 간주하지 않음)
                    }
                }

                console.log('[GPS watch] 새 위치 수신:', newLocation, '정확도:', accuracy);
                setAmbulanceLocation(newLocation);
                lastSentLocationRef.current = newLocation; // 마지막 전송 위치 업데이트
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
                timeout: 15000, // 15초로 설정
                maximumAge: 5000 // 5초로 설정
            }
        );
    };

    // 위치 오류 처리 및 재시도 로직
    const handleLocationError = (error) => {
        const maxRetries = 3;
        
        let errorMessage = '위치를 가져올 수 없습니다.';
        
        switch (error.code) {
            case error.PERMISSION_DENIED:
                errorMessage = 'GPS 권한이 거부되었습니다. 위치 서비스를 사용하려면 권한을 허용해주세요.';
                setLocationError(errorMessage);
                console.error('GPS 권한 거부됨, 재시도하지 않음.');
                return; // 권한 거부는 재시도하지 않음
            case error.POSITION_UNAVAILABLE:
                errorMessage = 'GPS 위치 정보를 사용할 수 없습니다. GPS 신호가 약하거나 꺼져있을 수 있습니다.';
                break;
            case error.TIMEOUT:
                errorMessage = 'GPS 위치 요청이 시간 초과되었습니다. 신호가 약하거나 기기가 움직이는 중일 수 있습니다.';
                break;
            default: // ACCURACY_LOW 등 사용자 정의 오류 코드
                errorMessage = error.message || '알 수 없는 위치 오류가 발생했습니다.';
                break;
        }

        setLocationError(errorMessage);
        retryCountRef.current += 1; // 재시도 횟수 증가

        if (retryCountRef.current <= maxRetries) {
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