import React, { useEffect, useRef, useState } from 'react';

// 하버사인 공식으로 두 지점 간의 거리 계산 (km 단위)
const getDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // 지구의 반지름 (킬로미터)
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  return distance;
};

const MapDisplay = ({ hospital }) => {
  const mapRef = useRef(null);
  const mapInstance = useRef(null); // 지도 인스턴스 저장용
  const userMarker = useRef(null); // 사용자 마커 인스턴스 저장용
  const hospitalMarker = useRef(null); // 병원 마커 인스턴스 저장용
  const initialMapSetupDone = useRef(false); // 초기 지도 설정 (중심/범위) 완료 여부

  const [distanceKm, setDistanceKm] = useState(null); // 거리 상태

  useEffect(() => {
    const KAKAO_KEY = import.meta.env.VITE_KAKAO_MAP_API_KEY;
    console.log('KAKAO_KEY:', KAKAO_KEY ? 'Loaded' : 'Not Loaded'); // 1. API 키 로드 확인

    if (!KAKAO_KEY) {
      alert('카카오 지도 API 키가 .env 파일에 설정되지 않았습니다!');
      return;
    }

    const script = document.createElement('script');
    script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${KAKAO_KEY}&libraries=services&autoload=false`;
    script.async = true;
    document.head.appendChild(script);
    console.log('Kakao Maps SDK script added to head.'); // 2. 스크립트 추가 확인

    let watchId = null; // watchId를 useEffect 최상단에 선언

    script.onload = () => {
      console.log('Kakao Maps SDK script loaded successfully.'); // 3. 스크립트 로드 완료 확인
      window.kakao.maps.load(() => {
        console.log('Kakao Maps API loaded and ready.'); // 4. 카카오 API 로드 완료 확인

        if (!mapRef.current) {
          console.error('mapRef.current is null. Map container not found.'); // 5. mapRef 확인
          return;
        }
        console.log('mapRef.current exists:', mapRef.current); // 5. mapRef 확인

        const createMapAndMarkers = (initialUserPos) => {
          console.log('Creating map with initial position:', initialUserPos); // 6. 지도 생성 시작
          const mapContainer = mapRef.current;
          const mapOption = { center: initialUserPos, level: 4 };
          const map = new window.kakao.maps.Map(mapContainer, mapOption);
          mapInstance.current = map; // 지도 인스턴스 저장
          console.log('Map instance created:', mapInstance.current); // 7. 지도 인스턴스 생성 확인

          // 사용자 마커 초기 생성
          userMarker.current = new window.kakao.maps.Marker({
            map: map,
            position: initialUserPos,
            title: '현재 위치',
          });

          // 병원 마커 생성
          let hospitalPos = null;
          if (hospital && hospital.lat && hospital.lng) {
            hospitalPos = new window.kakao.maps.LatLng(hospital.lat, hospital.lng);
            hospitalMarker.current = new window.kakao.maps.Marker({
              map: map,
              position: hospitalPos,
              title: hospital.name || '매칭 병원',
            });

            // 사용자 위치와 병원 위치를 모두 포함하는 bounds 설정
            const bounds = new window.kakao.maps.LatLngBounds();
            bounds.extend(userMarker.current.getPosition());
            bounds.extend(hospitalPos);
            map.setBounds(bounds);
            initialMapSetupDone.current = true;

            // 초기 거리 계산
            const dist = getDistance(
              userMarker.current.getPosition().getLat(), userMarker.current.getPosition().getLng(),
              hospitalPos.getLat(), hospitalPos.getLng()
            );
            setDistanceKm(dist.toFixed(2));

          } else { // 병원 정보가 없으면 사용자 위치 중심으로 초기 지도 설정
              map.setCenter(initialUserPos);
              initialMapSetupDone.current = true;
          }
        };

        // 현재 위치 가져오기 시도
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              console.log('Geolocation success:', position); // 8. 현재 위치 가져오기 성공
              const userInitialPos = new window.kakao.maps.LatLng(position.coords.latitude, position.coords.longitude);
              createMapAndMarkers(userInitialPos);
            },
            (error) => {
              console.error("초기 위치 정보 에러:", error); // 9. 현재 위치 가져오기 실패
              console.error("현재 위치를 가져올 수 없습니다. 기본 위치(서울 시청)로 지도를 표시합니다.");
              const defaultPos = new window.kakao.maps.LatLng(37.566826, 126.9786567);
              createMapAndMarkers(defaultPos);
            },
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
          );
        } else {
          console.error("이 브라우저는 위치 정보를 지원하지 않습니다. 기본 위치(서울 시청)로 지도를 표시합니다."); // 10. Geolocation 미지원
          const defaultPos = new window.kakao.maps.LatLng(37.566826, 126.9786567);
          createMapAndMarkers(defaultPos);
        }

        // 실시간 위치 추적 시작 (지도가 생성된 후에만)
        if (navigator.geolocation) {
          watchId = navigator.geolocation.watchPosition(
            (position) => {
              const userCurrentPos = new window.kakao.maps.LatLng(position.coords.latitude, position.coords.longitude);

              // 사용자 마커 업데이트
              if (userMarker.current) {
                userMarker.current.setPosition(userCurrentPos);
              }

              // 초기 지도 설정이 완료된 후에는 panTo로 부드럽게 이동
              if (initialMapSetupDone.current && mapInstance.current) {
                mapInstance.current.panTo(userCurrentPos);
              }

              // 거리 계산 (병원 마커가 존재할 경우)
              if (hospitalMarker.current) {
                const currentHospitalPos = hospitalMarker.current.getPosition();
                const dist = getDistance(
                  userCurrentPos.getLat(), userCurrentPos.getLng(),
                  currentHospitalPos.getLat(), currentHospitalPos.getLng()
                );
                setDistanceKm(dist.toFixed(2));
              }
            },
            (error) => {
              console.error("위치 정보 추적 에러:", error);
              // 추적 에러 시에도 초기 지도 설정이 안 되어 있다면 기본 위치로 panTo
              if (!initialMapSetupDone.current && mapInstance.current) {
                mapInstance.current.panTo(new window.kakao.maps.LatLng(37.566826, 126.9786567));
                initialMapSetupDone.current = true;
              }
            },
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
          );
        }
      });
    };

    // 클린업 함수
    return () => {
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
      if (watchId) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, [hospital]); // hospital이 변경되면 useEffect 재실행

  return (
    <div className="w-full h-full">
      <div ref={mapRef} style={{ width: '100%', height: '100%' }} className="rounded-lg" />
      {distanceKm ? (
        <p className="text-sm text-gray-700 mt-2">예상 거리: {distanceKm} km</p>
      ) : (
        <p className="text-sm text-gray-700 mt-2">거리 계산 중...</p>
      )}
    </div>
  );
};

export default MapDisplay;
