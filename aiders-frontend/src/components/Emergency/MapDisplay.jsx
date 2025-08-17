import React, {
  useEffect,
  useRef,
  useState,
  useCallback,
  useMemo,
} from "react";

const MapDisplay = ({
  hospital,
  ambulanceLocation,
  distanceInfo,
  isFullScreen = false,
  showControls = true,
  zoom = 4,
  destinationType = "hospital", // 'patient' | 'hospital'
  destinationIconSrc, // 목적지 아이콘 직접 지정 가능
}) => {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const ambulanceMarker = useRef(null);
  const hospitalMarker = useRef(null);
  const isMountedRef = useRef(true);
  const scriptLoadedRef = useRef(false);

  const [mapError, setMapError] = useState(null);
  const [isMapReady, setIsMapReady] = useState(false);

  // 자동 따라가기 상태 (true면 내 위치 따라감, false면 안 따라감)
  const [isFollowing, setIsFollowing] = useState(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // 마커 정리 함수
  const cleanupMarkers = useCallback(() => {
    if (ambulanceMarker.current) {
      ambulanceMarker.current.setMap(null);
      ambulanceMarker.current = null;
    }
    if (hospitalMarker.current) {
      hospitalMarker.current.setMap(null);
      hospitalMarker.current = null;
    }
  }, []);

  // 마커 이미지 생성 함수
  const getMarkerImage = (src, width, height, offsetX = width / 2, offsetY = height) => {
    if (!src) return null;
    try {
      return new window.kakao.maps.MarkerImage(
        src,
        new window.kakao.maps.Size(width, height),
        { offset: new window.kakao.maps.Point(offsetX, offsetY) }
      );
    } catch (e) {
      return null;
    }
  };

  // 좌표 변환 함수
  const getCoordinates = useCallback((locationData) => {
    if (!locationData) return null;
    const lat = locationData.latitude || locationData.lat || null;
    const lng = locationData.longitude || locationData.lng || locationData.lon || null;
    if (lat && lng && !isNaN(lat) && !isNaN(lng)) {
      if (lat >= 33 && lat <= 39 && lng >= 124 && lng <= 132) {
        return { lat: Number(lat), lng: Number(lng) };
      } else {
        console.warn(`⚠️ [MapDisplay] 좌표가 대한민국 범위를 벗어남: ${lat}, ${lng}`);
        return { lat: Number(lat), lng: Number(lng) };
      }
    }
    return null;
  }, []);

  // 좌표 품질 분석 함수
  const analyzeCoordinateQuality = useCallback((locationData) => {
    if (!locationData) {
      return { quality: "none", message: "좌표 정보 없음", color: "gray" };
    }
    const lat = locationData.latitude || locationData.lat || null;
    const lng = locationData.longitude || locationData.lng || locationData.lon || null;
    if (!lat || !lng || isNaN(lat) || isNaN(lng)) {
      return { quality: "invalid", message: "유효하지 않은 좌표", color: "red" };
    }
    if (
      (Number(lat).toFixed(6) === "37.566826" && Number(lng).toFixed(6) === "126.978657") ||
      (Number(lat).toFixed(6) === "37.566826" && Number(lng).toFixed(6) === "126.978000")
    ) {
      return { quality: "default", message: "기본 위치 (서울시청)", color: "orange" };
    }
    if (lat < 33 || lat > 39 || lng < 124 || lng > 132) {
      return { quality: "outbound", message: "대한민국 범위 벗어남", color: "red" };
    }
    return { quality: "real", message: "실제 위치", color: "green" };
  }, []);

  const stableAmbulanceCoords = useMemo(() => {
    if (!ambulanceLocation) return null;
    return getCoordinates(ambulanceLocation);
  }, [ambulanceLocation?.latitude, ambulanceLocation?.longitude, getCoordinates]);

  const stableHospitalCoords = useMemo(() => {
    if (!hospital) return null;
    return getCoordinates(hospital);
  }, [hospital?.latitude, hospital?.longitude, hospital?.id, getCoordinates]);

  const ambulanceQuality = useMemo(() => {
    return analyzeCoordinateQuality(ambulanceLocation);
  }, [ambulanceLocation?.latitude, ambulanceLocation?.longitude, analyzeCoordinateQuality]);

  const hospitalQuality = useMemo(() => {
    return analyzeCoordinateQuality(hospital);
  }, [hospital?.latitude, hospital?.longitude, hospital?.id, analyzeCoordinateQuality]);

  const hasLocationMismatch = useMemo(() => {
    if (!hospital?.name || !stableHospitalCoords) return false;
    const hospitalName = (hospital.name || "").toLowerCase();
    const lat = stableHospitalCoords.lat;
    const lng = stableHospitalCoords.lng;
    if (hospitalName.includes("구미") && lat > 37 && lng < 127) {
      return {
        type: "구미→서울",
        message: "구미 병원인데 서울 좌표가 저장되어 있습니다.",
        expectedRegion: "구미 (36.1xxx, 128.4xxx)",
        actualCoords: `${lat.toFixed(4)}, ${lng.toFixed(4)}`,
      };
    }
    if (hospitalName.includes("대구") && lat > 37 && lng < 127) {
      return {
        type: "대구→서울",
        message: "대구 병원인데 서울 좌표가 저장되어 있습니다.",
        expectedRegion: "대구 (35.8xxx, 128.6xxx)",
        actualCoords: `${lat.toFixed(4)}, ${lng.toFixed(4)}`,
      };
    }
    return false;
  }, [hospital?.name, stableHospitalCoords]);

  useEffect(() => {
    if (scriptLoadedRef.current) return;
    const KAKAO_KEY = import.meta.env.VITE_KAKAO_MAP_API_KEY;
    if (!KAKAO_KEY) {
      setMapError("카카오 지도 API 키가 설정되지 않았습니다.");
      return;
    }
    if (window.kakao && window.kakao.maps) {
      scriptLoadedRef.current = true;
      setIsMapReady(true);
      return;
    }
    const script = document.createElement("script");
    script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${KAKAO_KEY}&libraries=services&autoload=false`;
    script.async = true;
    script.onload = () => {
      window.kakao.maps.load(() => {
        if (isMountedRef.current) {
          scriptLoadedRef.current = true;
          setIsMapReady(true);
          setMapError(null);
        }
      });
    };
    script.onerror = () => {
      if (isMountedRef.current) {
        setMapError("카카오 맵 스크립트 로딩 실패");
      }
    };
    document.head.appendChild(script);
    return () => {};
  }, []);

  useEffect(() => {
    if (!isMapReady || !mapRef.current) return;
    cleanupMarkers();
    let initialPosition = null;
    if (stableAmbulanceCoords) {
      initialPosition = new window.kakao.maps.LatLng(stableAmbulanceCoords.lat, stableAmbulanceCoords.lng);
    } else if (stableHospitalCoords) {
      initialPosition = new window.kakao.maps.LatLng(stableHospitalCoords.lat, stableHospitalCoords.lng);
    } else {
      initialPosition = new window.kakao.maps.LatLng(37.566826, 126.9786567);
    }
    const mapOptions = {
      center: initialPosition,
      level: zoom,
      mapTypeId: window.kakao.maps.MapTypeId.ROADMAP,
    };
    const map = new window.kakao.maps.Map(mapRef.current, mapOptions);
    mapInstance.current = map;

    if (showControls) {
      const mapTypeControl = new window.kakao.maps.MapTypeControl();
      map.addControl(mapTypeControl, window.kakao.maps.ControlPosition.TOPRIGHT);
      const zoomControl = new window.kakao.maps.ZoomControl();
      map.addControl(zoomControl, window.kakao.maps.ControlPosition.RIGHT);
    }
    // 사용자 조작시 자동추적 해제
    window.kakao.maps.event.addListener(map, 'dragstart', () => setIsFollowing(false));
    window.kakao.maps.event.addListener(map, 'zoom_changed', () => setIsFollowing(false));
    // 🚑 구급차 마커
    if (stableAmbulanceCoords) {
      const ambulancePos = new window.kakao.maps.LatLng(stableAmbulanceCoords.lat, stableAmbulanceCoords.lng);
      const ambulanceImageSrc = "/icon/1f691_color.png";
      const ambulanceMarkerImage = getMarkerImage(ambulanceImageSrc, 36, 36, 18, 36);
      ambulanceMarker.current = new window.kakao.maps.Marker({
        map,
        position: ambulancePos,
        title: "구급차 (실시간)",
        image: ambulanceMarkerImage || undefined,
      });
    }
    // 🏥 목적지 마커
    if (stableHospitalCoords && hospital) {
      const hospitalPos = new window.kakao.maps.LatLng(stableHospitalCoords.lat, stableHospitalCoords.lng);
      const isPatient = destinationType === "patient";
      const destTitle = isPatient ? (hospital.name || "환자 위치") : (hospital.name || "배정 병원");
      const destIconSrc = destinationIconSrc || (isPatient ? "/icon/patient.png" : "/icon/hospital.png");
      const destMarkerImage = getMarkerImage(destIconSrc, 36, 36);
      hospitalMarker.current = new window.kakao.maps.Marker({
        map,
        position: hospitalPos,
        title: destTitle,
        image: destMarkerImage || undefined,
      });
    }
  }, [isMapReady, stableAmbulanceCoords, stableHospitalCoords, showControls, zoom, destinationType, destinationIconSrc]);

  useEffect(() => {
    if (!mapInstance.current || !stableAmbulanceCoords) return;
    const pos = new window.kakao.maps.LatLng(stableAmbulanceCoords.lat, stableAmbulanceCoords.lng);
    // 구급차 마커 없으면 생성
    if (!ambulanceMarker.current) {
      const ambulanceImageSrc = "/icon/1f691_color.png";
      const ambulanceMarkerImage = getMarkerImage(ambulanceImageSrc, 36, 36, 18, 36);
      ambulanceMarker.current = new window.kakao.maps.Marker({
        map: mapInstance.current,
        position: pos,
        title: "구급차 (실시간)",
        image: ambulanceMarkerImage || undefined,
      });
    } else {
      ambulanceMarker.current.setPosition(pos);
    }
    if (isFollowing) mapInstance.current.setCenter(pos);
  }, [stableAmbulanceCoords?.lat, stableAmbulanceCoords?.lng, isFollowing]);

  useEffect(() => {
    if (!mapInstance.current || !stableHospitalCoords) return;
    const pos = new window.kakao.maps.LatLng(stableHospitalCoords.lat, stableHospitalCoords.lng);
    if (!hospitalMarker.current) {
      const destMarkerImage = getMarkerImage(destinationIconSrc || "/icon/hospital.png", 36, 36);
      hospitalMarker.current = new window.kakao.maps.Marker({
        map: mapInstance.current,
        position: pos,
        title: "병원",
        image: destMarkerImage || undefined,
      });
    } else {
      hospitalMarker.current.setPosition(pos);
    }
  }, [stableHospitalCoords?.lat, stableHospitalCoords?.lng, destinationIconSrc]);

  useEffect(() => () => cleanupMarkers(), [cleanupMarkers]);

  if (mapError) {
    return <div style={{color:'red',textAlign:'center',marginTop:16}}>{mapError}</div>;
  }
  if (!isMapReady) {
    return <div style={{textAlign:'center',marginTop:16}}>구급차 추적 지도 로딩 중...</div>;
  }

  return (
    <div className={`w-full h-full ${isFullScreen ? "relative" : ""}`}>
       <div ref={mapRef} style={{ width: "100%", height: "100%" }} className="rounded-lg" />
      {isFullScreen && (
        <button
          style={{
            position: 'absolute', bottom: 24, left: 24, zIndex: 10,
            padding: '0.5em 1em', fontWeight: 'bold', borderRadius: 8,
            background: isFollowing ? '#d1fae5' : '#dbeafe', color: '#2563eb', border: 'none',
            boxShadow: '0 2px 8px #0002', cursor: 'pointer'
          }}
          onClick={() => {
            setIsFollowing(true);
            if (ambulanceMarker.current && mapInstance.current) {
              mapInstance.current.setCenter(ambulanceMarker.current.getPosition());
            }
          }}
        >내 위치로</button>
      )}
    </div>
  );
};

export default MapDisplay;
