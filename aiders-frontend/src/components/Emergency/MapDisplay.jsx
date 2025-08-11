// src/components/Emergency/MapDisplay.jsx
import React, {
  useEffect,
  useRef,
  useState,
  useCallback,
  useMemo,
} from "react";

const MapDisplay = ({
  hospital, // 🔥 배정된 병원 정보 (DB에서 정확한 좌표 포함)
  ambulanceLocation, // 🔥 구급차 실시간 위치 { latitude, longitude, timestamp }
  distanceInfo, // 🔥 병원과의 거리 정보 { ambulanceId, hospitalId, distance, timestamp }
  isFullScreen = false,
  showControls = true,
  zoom = 4,
}) => {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const ambulanceMarker = useRef(null); // 🔥 구급차 마커
  const hospitalMarker = useRef(null); // 병원 마커
  const initialMapSetupDone = useRef(false);
  const isMountedRef = useRef(true);
  const scriptLoadedRef = useRef(false);

  const [mapError, setMapError] = useState(null);
  const [isMapReady, setIsMapReady] = useState(false);

  // 🔥 컴포넌트 마운트 상태 관리
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // 🔥 마커 정리 함수 (안정화)
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

  // 🔥 좌표 추출 함수 (memoized)
  const getCoordinates = useCallback((locationData) => {
    if (!locationData) return null;

    const lat = locationData.latitude || locationData.lat || null;
    const lng =
      locationData.longitude || locationData.lng || locationData.lon || null;

    if (lat && lng && !isNaN(lat) && !isNaN(lng)) {
      // 🔥 대한민국 좌표 범위 확인
      if (lat >= 33 && lat <= 39 && lng >= 124 && lng <= 132) {
        return { lat: Number(lat), lng: Number(lng) };
      } else {
        console.warn(
          `⚠️ [MapDisplay] 좌표가 대한민국 범위를 벗어남: ${lat}, ${lng}`
        );
        return { lat: Number(lat), lng: Number(lng) }; // 범위 벗어나도 일단 표시
      }
    }

    return null;
  }, []);

  // 🔥 좌표 품질 분석 함수 (memoized)
  const analyzeCoordinateQuality = useCallback((locationData, name = "") => {
    if (!locationData) {
      return { quality: "none", message: "좌표 정보 없음", color: "gray" };
    }

    const lat = locationData.latitude || locationData.lat || null;
    const lng =
      locationData.longitude || locationData.lng || locationData.lon || null;

    if (!lat || !lng || isNaN(lat) || isNaN(lng)) {
      return {
        quality: "invalid",
        message: "유효하지 않은 좌표",
        color: "red",
      };
    }

    // 🔥 서울시청 기본 좌표 확인
    if (
      (Number(lat).toFixed(6) === "37.566826" &&
        Number(lng).toFixed(6) === "126.978657") ||
      (Number(lat).toFixed(6) === "37.566826" &&
        Number(lng).toFixed(6) === "126.978000")
    ) {
      return {
        quality: "default",
        message: "기본 위치 (서울시청)",
        color: "orange",
      };
    }

    // 🔥 대한민국 범위 확인
    if (lat < 33 || lat > 39 || lng < 124 || lng > 132) {
      return {
        quality: "outbound",
        message: "대한민국 범위 벗어남",
        color: "red",
      };
    }

    // 🔥 실제 좌표
    return { quality: "real", message: "실제 위치", color: "green" };
  }, []);

  // 🔥 안정화된 좌표 추출 (memoization으로 불필요한 재계산 방지)
  const stableAmbulanceCoords = useMemo(() => {
    if (!ambulanceLocation) return null;
    const coords = getCoordinates(ambulanceLocation);
    return coords;
  }, [
    ambulanceLocation?.latitude,
    ambulanceLocation?.longitude,
    getCoordinates,
  ]);

  const stableHospitalCoords = useMemo(() => {
    if (!hospital) return null;
    const coords = getCoordinates(hospital);
    return coords;
  }, [hospital?.latitude, hospital?.longitude, hospital?.id, getCoordinates]);

  // 🔥 좌표 품질 분석 (memoization)
  const ambulanceQuality = useMemo(() => {
    const quality = analyzeCoordinateQuality(ambulanceLocation, "구급차");
    return quality;
  }, [
    ambulanceLocation?.latitude,
    ambulanceLocation?.longitude,
    analyzeCoordinateQuality,
  ]);

  const hospitalQuality = useMemo(() => {
    const quality = analyzeCoordinateQuality(hospital, "병원");
    return quality;
  }, [
    hospital?.latitude,
    hospital?.longitude,
    hospital?.id,
    analyzeCoordinateQuality,
  ]);

  // 🔥 지역 불일치 감지 (구미병원인데 서울 좌표인 경우)
  const hasLocationMismatch = useMemo(() => {
    if (!hospital?.name || !stableHospitalCoords) return false;

    const hospitalName = hospital.name.toLowerCase();
    const lat = stableHospitalCoords.lat;
    const lng = stableHospitalCoords.lng;

    // 구미 지역 병원인데 서울 좌표인 경우
    if (hospitalName.includes("구미") && lat > 37 && lng < 127) {
      return {
        type: "구미→서울",
        message: "구미 병원인데 서울 좌표가 저장되어 있습니다.",
        expectedRegion: "구미 (36.1xxx, 128.4xxx)",
        actualCoords: `${lat.toFixed(4)}, ${lng.toFixed(4)}`,
      };
    }

    // 대구 지역 병원인데 서울 좌표인 경우
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

  // 🔥 카카오 맵 스크립트 로딩 (변경 없음)
  useEffect(() => {
    if (scriptLoadedRef.current) return;

    const KAKAO_KEY = import.meta.env.VITE_KAKAO_MAP_API_KEY;

    if (!KAKAO_KEY) {
      setMapError("카카오 지도 API 키가 설정되지 않았습니다.");
      return;
    }

    // 이미 로드된 경우
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

    return () => {
    };
  }, []);

  // 🔥 지도 초기화 (안정화된 의존성 - 무한 렌더링 방지)
  useEffect(() => {
    if (!isMapReady || !mapRef.current) {
      return;
    }

    const initializeMap = () => {
      try {
        if (!mapRef.current || !window.kakao?.maps) {
          return;
        }

        // 기존 마커 정리
        cleanupMarkers();

        // 🔥 초기 위치 결정 (안정화된 좌표 사용)
        let initialPosition = null;

        if (stableAmbulanceCoords) {
          initialPosition = new window.kakao.maps.LatLng(
            stableAmbulanceCoords.lat,
            stableAmbulanceCoords.lng
          );
        } else if (stableHospitalCoords) {
          initialPosition = new window.kakao.maps.LatLng(
            stableHospitalCoords.lat,
            stableHospitalCoords.lng
          );
        } else {
          initialPosition = new window.kakao.maps.LatLng(
            37.566826,
            126.9786567
          );
        }

        // 지도 생성
        const mapOptions = {
          center: initialPosition,
          level: zoom,
          mapTypeId: window.kakao.maps.MapTypeId.ROADMAP,
        };

        const map = new window.kakao.maps.Map(mapRef.current, mapOptions);
        mapInstance.current = map;

        // 🔥 컨트롤 추가
        if (showControls) {
          const mapTypeControl = new window.kakao.maps.MapTypeControl();
          map.addControl(
            mapTypeControl,
            window.kakao.maps.ControlPosition.TOPRIGHT
          );

          const zoomControl = new window.kakao.maps.ZoomControl();
          map.addControl(zoomControl, window.kakao.maps.ControlPosition.RIGHT);
        }

        // 🔥 구급차 마커 생성 (안정화된 좌표 사용)
        if (stableAmbulanceCoords) {
          const ambulancePos = new window.kakao.maps.LatLng(
            stableAmbulanceCoords.lat,
            stableAmbulanceCoords.lng
          );

          ambulanceMarker.current = new window.kakao.maps.Marker({
            map: map,
            position: ambulancePos,
            title: "구급차 (실시간)",
          });

          // 🔥 구급차 정보창 (품질 정보 포함)
          const ambulanceInfoWindow = new window.kakao.maps.InfoWindow({
            content: `
              <div style="padding:10px;min-width:200px;text-align:center;">
                <strong style="color:#2563eb;">🚑 구급차</strong><br>
                <small style="color:#6b7280;">실시간 위치</small><br>
                <div style="margin:5px 0;padding:3px 6px;background:${
                  ambulanceQuality.color === "green"
                    ? "#dcfce7"
                    : ambulanceQuality.color === "orange"
                    ? "#fed7aa"
                    : "#fecaca"
                };border-radius:4px;">
                  <small style="color:${
                    ambulanceQuality.color === "green"
                      ? "#166534"
                      : ambulanceQuality.color === "orange"
                      ? "#9a3412"
                      : "#991b1b"
                  };">
                    📍 ${ambulanceQuality.message}
                  </small>
                </div>
                <small style="color:#4b5563;">
                  ${stableAmbulanceCoords.lat.toFixed(
                    6
                  )}, ${stableAmbulanceCoords.lng.toFixed(6)}<br>
                  ${
                    ambulanceLocation
                      ? new Date(
                          ambulanceLocation.timestamp
                        ).toLocaleTimeString()
                      : ""
                  }
                </small>
              </div>
            `,
          });

          window.kakao.maps.event.addListener(
            ambulanceMarker.current,
            "click",
            () => {
              ambulanceInfoWindow.open(map, ambulanceMarker.current);
            }
          );

        }

        // 🔥 병원 마커 생성 (안정화된 좌표 사용)
        if (stableHospitalCoords && hospital) {
          const hospitalPos = new window.kakao.maps.LatLng(
            stableHospitalCoords.lat,
            stableHospitalCoords.lng
          );

          hospitalMarker.current = new window.kakao.maps.Marker({
            map: map,
            position: hospitalPos,
            title: hospital.name || "배정 병원",
          });

          // 🔥 병원 정보창 (품질 + 거리 정보 포함)
          const hospitalInfoContent = () => {
            let content = `
              <div style="padding:10px;min-width:220px;text-align:center;">
                <strong style="color:#dc2626;">🏥 ${
                  hospital.name || "배정 병원"
                }</strong>
            `;

            if (hospital.address) {
              content += `<br><small style="color:#6b7280;">${hospital.address}</small>`;
            }

            // 🔥 좌표 품질 표시
            content += `
              <div style="margin:5px 0;padding:3px 6px;background:${
                hospitalQuality.color === "green"
                  ? "#dcfce7"
                  : hospitalQuality.color === "orange"
                  ? "#fed7aa"
                  : "#fecaca"
              };border-radius:4px;">
                <small style="color:${
                  hospitalQuality.color === "green"
                    ? "#166534"
                    : hospitalQuality.color === "orange"
                    ? "#9a3412"
                    : "#991b1b"
                };">
                  📍 ${hospitalQuality.message}
                </small>
              </div>
            `;

            // 🔥 지역 불일치 경고
            if (hasLocationMismatch) {
              content += `
                <div style="margin:5px 0;padding:3px 6px;background:#fecaca;border-radius:4px;">
                  <small style="color:#991b1b;">
                    🚨 ${hasLocationMismatch.message}
                  </small>
                </div>
              `;
            }

            // 🔥 좌표 정보
            content += `<small style="color:#4b5563;">${stableHospitalCoords.lat.toFixed(
              6
            )}, ${stableHospitalCoords.lng.toFixed(6)}</small>`;

            // 🔥 거리 정보
            if (distanceInfo && distanceInfo.distance) {
              content += `<br><small style="color:#059669;font-weight:bold;">실시간 거리: ${(
                distanceInfo.distance / 1000
              ).toFixed(2)}km</small>`;
              content += `<br><small style="color:#6b7280;">업데이트: ${new Date(
                distanceInfo.timestamp
              ).toLocaleTimeString()}</small>`;
            }

            content += `</div>`;
            return content;
          };

          const hospitalInfoWindow = new window.kakao.maps.InfoWindow({
            content: hospitalInfoContent(),
          });

          window.kakao.maps.event.addListener(
            hospitalMarker.current,
            "click",
            () => {
              hospitalInfoWindow.setContent(hospitalInfoContent());
              hospitalInfoWindow.open(map, hospitalMarker.current);
            }
          );

        }

        // 🔥 지도 범위 설정 (안정화)
        if (ambulanceMarker.current && hospitalMarker.current) {
          const bounds = new window.kakao.maps.LatLngBounds();
          bounds.extend(ambulanceMarker.current.getPosition());
          bounds.extend(hospitalMarker.current.getPosition());
          map.setBounds(bounds);
        } else if (ambulanceMarker.current) {
          map.setCenter(ambulanceMarker.current.getPosition());
        } else if (hospitalMarker.current) {
          map.setCenter(hospitalMarker.current.getPosition());
        }

        initialMapSetupDone.current = true;
      } catch (error) {
        console.error("[MapDisplay] ❌ 지도 초기화 실패:", error);
        setMapError(`지도 초기화 실패: ${error.message}`);
      }
    };

    initializeMap();

    return () => {
      cleanupMarkers();
      initialMapSetupDone.current = false;
    };
  }, [
    isMapReady,
    hospital?.id,
    stableHospitalCoords?.lat,
    stableHospitalCoords?.lng,
    stableAmbulanceCoords?.lat,
    stableAmbulanceCoords?.lng,
    showControls,
    zoom,
  ]);

  // 🔥 구급차 위치 실시간 업데이트 (안정화)
  useEffect(() => {
    if (
      !mapInstance.current ||
      !stableAmbulanceCoords ||
      !ambulanceMarker.current
    ) {
      return;
    }

    try {
      const newAmbulancePos = new window.kakao.maps.LatLng(
        stableAmbulanceCoords.lat,
        stableAmbulanceCoords.lng
      );

      // 🔥 구급차 마커 위치 업데이트
      ambulanceMarker.current.setPosition(newAmbulancePos);

      // 🔥 초기 설정 완료 후에만 지도 중심 부드럽게 이동
      if (initialMapSetupDone.current) {
        mapInstance.current.panTo(newAmbulancePos);
      }

    } catch (error) {
      console.error("[MapDisplay] ❌ 구급차 위치 업데이트 실패:", error);
    }
  }, [
    stableAmbulanceCoords?.lat,
    stableAmbulanceCoords?.lng,
    ambulanceQuality.quality,
  ]);

  // 🔥 전체 정리 (변경 없음)
  useEffect(() => {
    return () => {
      cleanupMarkers();
      if (mapInstance.current) {
        mapInstance.current = null;
      }
    };
  }, [cleanupMarkers]);

  // 🔥 에러 상태 렌더링 (변경 없음)
  if (mapError) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-100 rounded-lg">
        <div className="text-center p-6">
          <div className="text-red-500 text-4xl mb-4">⚠️</div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">
            지도 로드 실패
          </h3>
          <p className="text-sm text-gray-600 mb-4">{mapError}</p>
          <button
            onClick={() => {
              setMapError(null);
              setIsMapReady(false);
              scriptLoadedRef.current = false;
              window.location.reload();
            }}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded transition-colors"
          >
            새로고침
          </button>
        </div>
      </div>
    );
  }

  // 🔥 로딩 상태 렌더링 (변경 없음)
  if (!isMapReady) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-100 rounded-lg">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-3"></div>
          <p className="text-gray-600">구급차 추적 지도 로딩 중...</p>
          <p className="text-xs text-gray-500 mt-1">
            좌표 품질 분석 및 안정화 포함
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`w-full h-full ${isFullScreen ? "relative" : ""}`}>
      <div
        ref={mapRef}
        style={{ width: "100%", height: "100%" }}
        className="rounded-lg"
      />

      {/* 🔥 실시간 거리 정보 표시 (좌표 품질 포함) */}
      {distanceInfo && (
        <div
          className={`${
            isFullScreen
              ? "absolute bottom-4 left-4 bg-white bg-opacity-90 backdrop-blur-sm rounded-lg p-3 shadow-lg"
              : "mt-2"
          }`}
        >
          <p className="text-sm font-semibold text-gray-700">
            🚑 ↔ 🏥 실시간 거리:{" "}
            <span className="text-blue-600">
              {(distanceInfo.distance / 1000).toFixed(2)} km
            </span>
          </p>
          <p className="text-xs text-gray-500">
            업데이트: {new Date(distanceInfo.timestamp).toLocaleTimeString()}
          </p>

          {/* 🔥 좌표 품질 배지 */}
          <div className="mt-2 flex gap-2 text-xs">
            <span
              className={`px-2 py-1 rounded ${
                ambulanceQuality.color === "green"
                  ? "bg-green-100 text-green-700"
                  : ambulanceQuality.color === "orange"
                  ? "bg-orange-100 text-orange-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              🚑 {ambulanceQuality.message}
            </span>
            <span
              className={`px-2 py-1 rounded ${
                hospitalQuality.color === "green"
                  ? "bg-green-100 text-green-700"
                  : hospitalQuality.color === "orange"
                  ? "bg-orange-100 text-orange-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              🏥 {hospitalQuality.message}
            </span>
          </div>
        </div>
      )}

      {/* 🔥 지역 불일치 경고 (구미병원인데 서울 좌표) */}
      {hasLocationMismatch && (
        <div
          className={`${
            isFullScreen
              ? "absolute top-4 left-4 bg-red-50 border border-red-200 rounded-lg p-3 shadow-lg max-w-sm"
              : "mt-2 bg-red-50 border border-red-200 rounded-lg p-3"
          }`}
        >
          <div className="flex items-center gap-2 text-red-700 mb-2">
            <span className="text-red-600">🚨</span>
            <span className="font-semibold text-sm">좌표 데이터 오류!</span>
          </div>
          <p className="text-xs text-red-600 mb-1">
            <strong>{hospital.name}</strong> {hasLocationMismatch.message}
          </p>
          <div className="text-xs text-red-500">
            <p>• 예상 지역: {hasLocationMismatch.expectedRegion}</p>
            <p>• 실제 좌표: {hasLocationMismatch.actualCoords}</p>
            <p className="mt-1 font-semibold">
              💡 백엔드 DB 병원 좌표 데이터를 확인해주세요!
            </p>
          </div>
        </div>
      )}

      {/* 🔥 일반 좌표 품질 경고 */}
      {!hasLocationMismatch &&
        (hospitalQuality.quality === "default" ||
          hospitalQuality.quality === "invalid") && (
          <div
            className={`${
              isFullScreen
                ? "absolute top-4 left-4 bg-orange-50 border border-orange-200 rounded-lg p-3 shadow-lg max-w-sm"
                : "mt-2 bg-orange-50 border border-orange-200 rounded-lg p-3"
            }`}
          >
            <div className="flex items-center gap-2 text-orange-700 mb-1">
              <span className="text-orange-600">⚠️</span>
              <span className="font-semibold text-sm">병원 위치 주의</span>
            </div>
            <p className="text-xs text-orange-600">
              {hospitalQuality.quality === "default"
                ? "병원 실제 좌표 정보가 없어서 기본 위치(서울시청)를 표시하고 있습니다."
                : "병원 좌표 정보가 유효하지 않습니다."}
            </p>
          </div>
        )}

      {/* 🔥 구급차 위치 정보 (좌표 품질 포함) */}
      {ambulanceLocation && isFullScreen && (
        <div className="absolute bottom-4 right-4 bg-white bg-opacity-90 backdrop-blur-sm rounded-lg p-3 shadow-lg">
          <p className="text-xs font-semibold text-gray-700 mb-1 flex items-center gap-2">
            🚑 구급차 위치
            <span
              className={`px-2 py-0.5 rounded text-xs ${
                ambulanceQuality.color === "green"
                  ? "bg-green-100 text-green-700"
                  : ambulanceQuality.color === "orange"
                  ? "bg-orange-100 text-orange-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              {ambulanceQuality.quality === "real"
                ? "실제"
                : ambulanceQuality.quality === "default"
                ? "기본"
                : "오류"}
            </span>
          </p>
          <p className="text-xs text-gray-600">
            위도: {ambulanceLocation.latitude.toFixed(6)}
          </p>
          <p className="text-xs text-gray-600">
            경도: {ambulanceLocation.longitude.toFixed(6)}
          </p>
          <p className="text-xs text-gray-500">
            {new Date(ambulanceLocation.timestamp).toLocaleTimeString()}
          </p>

          {/* 🔥 좌표 품질 상세 정보 */}
          <p className="text-xs mt-1" style={{ color: ambulanceQuality.color }}>
            📍 {ambulanceQuality.message}
          </p>
        </div>
      )}

      {/* 🔥 풀스크린 컨트롤 버튼들 (좌표 품질에 따라 색깔 구분) */}
      {isFullScreen && (
        <div className="absolute top-4 right-4 flex flex-col gap-2">
          {/* 구급차 위치로 이동 */}
          {ambulanceMarker.current && (
            <button
              onClick={() => {
                if (mapInstance.current && ambulanceMarker.current) {
                  mapInstance.current.setCenter(
                    ambulanceMarker.current.getPosition()
                  );
                  mapInstance.current.setLevel(3); // 줌인
                }
              }}
              className={`p-2 rounded-lg shadow-lg transition-all ${
                ambulanceQuality.color === "green"
                  ? "bg-green-100 hover:bg-green-200 text-green-700"
                  : ambulanceQuality.color === "orange"
                  ? "bg-orange-100 hover:bg-orange-200 text-orange-700"
                  : "bg-red-100 hover:bg-red-200 text-red-700"
              }`}
              title={`구급차 위치로 이동 (${ambulanceQuality.message})`}
            >
              🚑
            </button>
          )}

          {/* 병원 위치로 이동 */}
          {hospitalMarker.current && (
            <button
              onClick={() => {
                if (mapInstance.current && hospitalMarker.current) {
                  mapInstance.current.setCenter(
                    hospitalMarker.current.getPosition()
                  );
                  mapInstance.current.setLevel(3); // 줌인
                }
              }}
              className={`p-2 rounded-lg shadow-lg transition-all ${
                hospitalQuality.color === "green"
                  ? "bg-green-100 hover:bg-green-200 text-green-700"
                  : hospitalQuality.color === "orange"
                  ? "bg-orange-100 hover:bg-orange-200 text-orange-700"
                  : "bg-red-100 hover:bg-red-200 text-red-700"
              }`}
              title={`병원 위치로 이동 (${hospitalQuality.message})`}
            >
              🏥
            </button>
          )}

          {/* 전체 보기 */}
          <button
            onClick={() => {
              if (
                mapInstance.current &&
                ambulanceMarker.current &&
                hospitalMarker.current
              ) {
                const bounds = new window.kakao.maps.LatLngBounds();
                bounds.extend(ambulanceMarker.current.getPosition());
                bounds.extend(hospitalMarker.current.getPosition());
                mapInstance.current.setBounds(bounds);
              }
            }}
            className="bg-white bg-opacity-90 hover:bg-opacity-100 text-gray-700 p-2 rounded-lg shadow-lg transition-all"
            title="구급차 + 병원 전체 보기"
          >
            🔍
          </button>

          {/* 지도 새로고침 */}
          <button
            onClick={() => {
              setIsMapReady(false);
              setTimeout(() => setIsMapReady(true), 100);
            }}
            className="bg-white bg-opacity-90 hover:bg-opacity-100 text-gray-700 p-2 rounded-lg shadow-lg transition-all"
            title="지도 새로고침"
          >
            🔄
          </button>
        </div>
      )}

      {/* 🔥 개발 모드 디버깅 정보 (안정화 버전) */}
      
    </div>
  );
};

export default MapDisplay;