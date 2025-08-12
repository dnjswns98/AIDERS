import React, { useState, useEffect, useMemo, useCallback } from "react";
import useEmergencyStore from "../../store/useEmergencyStore";
import useBedStore from "../../store/useBedStore";
import useFireStationStore from "../../store/useFireStationStore";
import {
  getStatusText,
  getStatusColor,
  getPriorityColor,
  getPriorityText,
} from "../../utils/statusUtils";
import SituationMap from "../../components/FireStation/SituationMap";
import { useAuthStore } from "../../store/useAuthStore";
import { getHospitals } from "../../api/api";

const FireStationSituationBoard = () => {
  const { user } = useAuthStore();
  const { getDispatchedAmbulances, getAvailableAmbulances } = useEmergencyStore();

  const {
    ambulances,
    firestationInfo,
    dispatchHistory,
    todayStats,
    recentDispatches,
    isAmbulanceDispatching,
    getDispatchProgress,
    refreshTodayStats,
    fetchDispatchHistory,
    fetchFirestationAmbulances,
    fetchFirestationInfo,
    error: storeError,
    clearError,
    isLoading: storeLoading,
  } = useFireStationStore();

  // === 상태 관리 ===
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedAmbulance, setSelectedAmbulance] = useState(null);
  const [hospitals, setHospitals] = useState([]);
  const [mapCenter, setMapCenter] = useState({ lat: 36.145, lng: 128.39 });

  // UI 상태
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isAutoRefresh, setIsAutoRefresh] = useState(true);
  const [lastRefreshTime, setLastRefreshTime] = useState(null);
  const [localError, setLocalError] = useState(null);

  // === 상태별 구급차 통계 계산 ===
  const ambulanceStats = useMemo(() => {
    const stats = {
      total: ambulances.length,
      dispatched: 0,
      transporting: 0,
      standby: 0,
      maintenance: 0,
    };

    ambulances.forEach((ambulance) => {
      const status = ambulance.currentStatus || ambulance.status;
      switch (status) {
        case "DISPATCH":
        case "dispatched":
          stats.dispatched++;
          break;
        case "TRANSFER":
        case "transporting":
          stats.transporting++;
          break;
        case "WAIT":
        case "standby":
          stats.standby++;
          break;
        case "MAINTENANCE":
        case "maintenance":
          stats.maintenance++;
          break;
      }
    });

    return stats;
  }, [ambulances]);

  // === 필터링된 구급차 목록 ===
  const filteredAmbulances = useMemo(() => {
    let filtered = [...ambulances];

    switch (filterStatus) {
      case "dispatched":
        filtered = filtered.filter((a) => {
          const status = a.currentStatus || a.status;
          return (
            status === "DISPATCH" ||
            status === "dispatched" ||
            isAmbulanceDispatching(a.userKey)
          );
        });
        break;
      case "transporting":
        filtered = filtered.filter((a) => {
          const status = a.currentStatus || a.status;
          return status === "TRANSFER" || status === "transporting";
        });
        break;
      case "standby":
        filtered = filtered.filter((a) => {
          const status = a.currentStatus || a.status;
          return status === "WAIT" || status === "standby";
        });
        break;
      case "all":
      default:
        // 전체 표시
        break;
    }

    // 우선순위 정렬: 배차중 > 출동중 > 이송중 > 대기중
    filtered.sort((a, b) => {
      const statusPriority = {
        dispatching: 1000, // 배차 중
        DISPATCH: 900,
        dispatched: 900,
        TRANSFER: 800,
        transporting: 800,
        WAIT: 100,
        standby: 100,
        MAINTENANCE: 10,
        maintenance: 10,
      };

      const aIsDispatching = isAmbulanceDispatching(a.userKey);
      const bIsDispatching = isAmbulanceDispatching(b.userKey);

      const aPriority = aIsDispatching
        ? 1000
        : statusPriority[a.currentStatus || a.status] || 50;
      const bPriority = bIsDispatching
        ? 1000
        : statusPriority[b.currentStatus || b.status] || 50;

      return bPriority - aPriority;
    });

    return filtered;
  }, [ambulances, filterStatus, isAmbulanceDispatching]);

  // === 데이터 로딩이 완료된 후 지도 중앙 위치 설정 ===
  useEffect(() => {
    if (firestationInfo?.latitude && firestationInfo?.longitude) {
      setMapCenter({
        lat: firestationInfo.latitude,
        lng: firestationInfo.longitude,
      });
    }
  }, [firestationInfo]);

  // === 자동 새로고침 ===
  useEffect(() => {
    let interval;
    if (isAutoRefresh) {
      interval = setInterval(() => {
        const { initializeData } = useFireStationStore.getState();
        initializeData();
        setLastRefreshTime(new Date());
      }, 30000);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isAutoRefresh]);

  // === 에러 자동 클리어 ===
  useEffect(() => {
    if (storeError || localError) {
      const timer = setTimeout(() => {
        clearError();
        setLocalError(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [storeError, localError, clearError]);

  // === 이벤트 핸들러들 ===

  // 구급차 선택
  const handleSelectAmbulance = useCallback((ambulance) => {
    console.log("[상황판] 구급차 선택:", ambulance.userKey);
    setSelectedAmbulance(ambulance);

    if (
      ambulance.latitude &&
      ambulance.longitude &&
      typeof ambulance.latitude === "number" &&
      typeof ambulance.longitude === "number"
    ) {
      setMapCenter({
        lat: ambulance.latitude,
        lng: ambulance.longitude,
      });
    }
  }, []);

  // 수동 새로고침
  const handleManualRefresh = useCallback(async () => {
    if (isRefreshing || storeLoading) return;

    setIsRefreshing(true);
    try {
      const { initializeData } = useFireStationStore.getState();
      await initializeData();
      setLastRefreshTime(new Date());
      setLocalError(null);
    } catch (error) {
      console.error("[상황판] 수동 새로고침 실패:", error);
      setLocalError("새로고침에 실패했습니다.");
    } finally {
      setIsRefreshing(false);
    }
  }, [isRefreshing, storeLoading]);

  // 자동 새로고침 토글
  const toggleAutoRefresh = useCallback(() => {
    setIsAutoRefresh((prev) => !prev);
  }, []);

  // 필터 상태별 색상 및 아이콘
  const getFilterStyle = useCallback(
    (status) => {
      const isActive = filterStatus === status;

      const styles = {
        all: {
          color: isActive
            ? "bg-gray-600 text-white"
            : "bg-gray-100 text-gray-700 hover:bg-gray-200",
          icon: "📋",
        },
        dispatched: {
          color: isActive
            ? "bg-orange-600 text-white"
            : "bg-orange-100 text-orange-700 hover:bg-orange-200",
          icon: "🚨",
        },
        transporting: {
          color: isActive
            ? "bg-green-600 text-white"
            : "bg-green-100 text-green-700 hover:bg-green-200",
          icon: "🏥",
        },
        standby: {
          color: isActive
            ? "bg-blue-600 text-white"
            : "bg-blue-100 text-blue-700 hover:bg-blue-200",
          icon: "⭐",
        },
      };

      return styles[status] || styles.all;
    },
    [filterStatus]
  );

  // 구급차 상태 표시 스타일
  const getAmbulanceStatusStyle = useCallback(
    (ambulance) => {
      const isDispatching = isAmbulanceDispatching(ambulance.userKey);
      const status = ambulance.currentStatus || ambulance.status;

      if (isDispatching) {
        return {
          bgColor: "bg-blue-50",
          borderColor: "border-l-blue-500",
          textColor: "text-blue-700",
          icon: "🔄",
          statusText: "배차 중...",
        };
      }

      switch (status) {
        case "DISPATCH":
        case "dispatched":
          return {
            bgColor: "bg-orange-50",
            borderColor: "border-l-orange-500",
            textColor: "text-orange-700",
            icon: "🚨",
            statusText: "출동 중",
          };
        case "TRANSFER":
        case "transporting":
          return {
            bgColor: "bg-green-50",
            borderColor: "border-l-green-500",
            textColor: "text-green-700",
            icon: "🏥",
            statusText: "이송 중",
          };
        case "WAIT":
        case "standby":
          return {
            bgColor: "bg-blue-50",
            borderColor: "border-l-blue-500",
            textColor: "text-blue-700",
            icon: "⭐",
            statusText: "대기 중",
          };
        case "MAINTENANCE":
        case "maintenance":
          return {
            bgColor: "bg-gray-50",
            borderColor: "border-l-gray-500",
            textColor: "text-gray-700",
            icon: "🔧",
            statusText: "정비 중",
          };
        default:
          return {
            bgColor: "bg-gray-50",
            borderColor: "border-l-gray-500",
            textColor: "text-gray-700",
            icon: "❓",
            statusText: "상태 불명",
          };
      }
    },
    [isAmbulanceDispatching]
  );

  if (!firestationInfo || storeLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="flex h-full bg-gray-100">
      {/* === 좌측 사이드바 === */}
      <aside className="w-80 bg-white border-r border-gray-300 flex flex-col shadow-lg">
        {/* 사이드바 헤더 */}
        <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900 flex items-center">
              <span className="mr-2">🚑</span>
              구급차 현황
            </h2>
            <div className="text-sm text-gray-600">
              {filteredAmbulances.length} / {ambulances.length}
            </div>
          </div>

          {/* 상태 필터 버튼들 */}
          <div className="mt-4 grid grid-cols-2 gap-2">
            {[
              { key: "all", label: "전체", count: ambulanceStats.total },
              {
                key: "dispatched",
                label: "출동중",
                count: ambulanceStats.dispatched,
              },
              {
                key: "transporting",
                label: "이송중",
                count: ambulanceStats.transporting,
              },
              {
                key: "standby",
                label: "대기중",
                count: ambulanceStats.standby,
              },
            ].map((filter) => {
              const style = getFilterStyle(filter.key);
              return (
                <button
                  key={filter.key}
                  onClick={() => setFilterStatus(filter.key)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center ${style.color}`}
                >
                  <span className="mr-1">{style.icon}</span>
                  {filter.label}
                  <span className="ml-1 text-xs opacity-75">
                    ({filter.count})
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 구급차 목록 */}
        <div className="flex-1 overflow-y-auto">
          {filteredAmbulances.length === 0 ? (
            <div className="p-6 text-center">
              <div className="text-gray-500">
                <span className="text-4xl block mb-4">🚑</span>
                <div className="font-medium">
                  해당 상태의 구급차가 없습니다
                </div>
                <div className="text-sm mt-1">
                  {filterStatus === "all"
                    ? "구급차가 없습니다."
                    : filterStatus === "dispatched"
                    ? "출동 중인 구급차가 없습니다."
                    : filterStatus === "transporting"
                    ? "이송 중인 구급차가 없습니다."
                    : filterStatus === "standby"
                    ? "대기 중인 구급차가 없습니다."
                    : "해당 조건의 구급차가 없습니다."}
                </div>
              </div>
            </div>
          ) : (
            <div className="p-2">
              {filteredAmbulances.map((ambulance) => {
                const statusStyle = getAmbulanceStatusStyle(ambulance);
                const isSelected = selectedAmbulance?.userKey === ambulance.userKey;
                const dispatchProgress = getDispatchProgress(
                  ambulance.userKey
                );

                return (
                  <div
                    key={ambulance.userKey}
                    onClick={() => handleSelectAmbulance(ambulance)}
                    className={`mb-2 p-3 rounded-lg border-l-4 cursor-pointer transition-all hover:shadow-md ${statusStyle.bgColor} ${statusStyle.borderColor} ${
                      isSelected ? "ring-2 ring-blue-400 bg-blue-100" : ""
                    }`}
                  >
                    {/* 구급차 헤더 */}
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center">
                        <span className="text-lg mr-2">{statusStyle.icon}</span>
                        <div>
                          <div className="font-bold text-gray-900">
                            {ambulance.carNumber ||
                              ambulance.userKey ||
                              `구급차 정보 없음`}
                          </div>
                          <div
                            className={`text-xs font-medium ${statusStyle.textColor}`}
                          >
                            {statusStyle.statusText}
                          </div>
                        </div>
                      </div>

                      {/* 실시간 표시 */}
                      <div className="flex items-center space-x-1">
                        {isAmbulanceDispatching(ambulance.userKey) && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                        )}
                        <div className="text-xs text-gray-500">
                          {ambulance.userKey}
                        </div>
                      </div>
                    </div>

                    {/* 배차 진행률 */}
                    {dispatchProgress && (
                      <div className="mb-2">
                        <div className="flex items-center justify-between text-xs text-blue-600 mb-1">
                          <span>
                            배차 진행률: {dispatchProgress.progress}%
                          </span>
                          <span>
                            {dispatchProgress.step}/{dispatchProgress.totalSteps}
                          </span>
                        </div>
                        <div className="w-full bg-blue-200 rounded-full h-1.5">
                          <div
                            className="bg-blue-600 h-1.5 rounded-full transition-all duration-300"
                            style={{ width: `${dispatchProgress.progress}%` }}
                          ></div>
                        </div>
                      </div>
                    )}

                    {/* 상세 정보 */}
                    <div className="space-y-1 text-sm">
                      {ambulance.pAddress && (
                        <div className="text-gray-600 truncate">
                          📍 {ambulance.pAddress}
                        </div>
                      )}

                      {ambulance.condition && (
                        <div className="text-gray-600 truncate">
                          🏥 {ambulance.condition}
                        </div>
                      )}

                      {ambulance.pKtas && (
                        <div className="text-gray-600">
                          🚨 KTAS {ambulance.pKtas}급
                        </div>
                      )}

                      {ambulance.dispatchTime && (
                        <div className="text-gray-500 text-xs">
                          출동:{" "}
                          {new Date(ambulance.dispatchTime).toLocaleTimeString()}
                        </div>
                      )}

                      {(!ambulance.latitude || !ambulance.longitude) && (
                        <div className="text-yellow-600 text-xs">
                          ⚠️ 위치 정보 없음
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* 사이드바 푸터 */}
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <div className="flex items-center">
              <div
                className={`w-2 h-2 rounded-full mr-2 ${
                  isAutoRefresh ? "bg-green-500 animate-pulse" : "bg-gray-400"
                }`}
              ></div>
              {isAutoRefresh ? "자동 새로고침 ON" : "자동 새로고침 OFF"}
            </div>
            {lastRefreshTime && <div>{lastRefreshTime.toLocaleTimeString()}</div>}
          </div>
        </div>
      </aside>

      {/* === 우측 메인 영역 === */}
      <main className="flex-1 flex flex-col">
        {/* 상단 통계 바 */}
        <header className="bg-white border-b border-gray-200 shadow-sm">
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                  <span className="mr-2">🔥</span>
                  실시간 상황판
                </h1>
                <p className="text-sm text-gray-600">
                  {firestationInfo?.name || "소방서"} · 실시간 모니터링
                </p>
              </div>

              <div className="flex items-center space-x-3">
                {/* 자동 새로고침 토글 */}
                <button
                  onClick={toggleAutoRefresh}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isAutoRefresh
                      ? "bg-green-600 text-white hover:bg-green-700"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                >
                  {isAutoRefresh ? "⏸️ 자동새로고침" : "▶️ 자동새로고침"}
                </button>

                {/* 수동 새로고침 */}
                <button
                  onClick={handleManualRefresh}
                  disabled={isRefreshing || storeLoading}
                  className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-300 disabled:cursor-not-allowed flex items-center"
                >
                  <span
                    className={`mr-2 ${
                      isRefreshing || storeLoading ? "animate-spin" : ""
                    }`}
                  >
                    🔄
                  </span>
                  {isRefreshing || storeLoading ? "새로고침 중..." : "새로고침"}
                </button>
              </div>
            </div>

            {/* 통계 카드들 */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {/* 오늘 출동 */}
              <div className="bg-purple-50 p-3 rounded-lg border border-purple-200">
                <div className="flex items-center">
                  <div className="p-2 bg-purple-100 rounded-lg mr-3">
                    <span className="text-lg">📊</span>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-purple-600">
                      오늘 출동
                    </p>
                    <p className="text-lg font-bold text-purple-900">
                      {todayStats.totalDispatches || 0}
                    </p>
                  </div>
                </div>
              </div>

              {/* 출동 중 */}
              <div className="bg-orange-50 p-3 rounded-lg border border-orange-200">
                <div className="flex items-center">
                  <div className="p-2 bg-orange-100 rounded-lg mr-3">
                    <span className="text-lg">🚨</span>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-orange-600">
                      출동 중
                    </p>
                    <p className="text-lg font-bold text-orange-900">
                      {ambulanceStats.dispatched}
                    </p>
                  </div>
                </div>
              </div>

              {/* 이송 중 */}
              <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 rounded-lg mr-3">
                    <span className="text-lg">🏥</span>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-green-600">
                      이송 중
                    </p>
                    <p className="text-lg font-bold text-green-900">
                      {ambulanceStats.transporting}
                    </p>
                  </div>
                </div>
              </div>

              {/* 대기 중 */}
              <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg mr-3">
                    <span className="text-lg">⭐</span>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-blue-600">
                      대기 중
                    </p>
                    <p className="text-lg font-bold text-blue-900">
                      {ambulanceStats.standby}
                    </p>
                  </div>
                </div>
              </div>

              {/* 평균 응답시간 */}
              <div className="bg-indigo-50 p-3 rounded-lg border border-indigo-200">
                <div className="flex items-center">
                  <div className="p-2 bg-indigo-100 rounded-lg mr-3">
                    <span className="text-lg">⏱️</span>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-indigo-600">
                      평균응답
                    </p>
                    <p className="text-lg font-bold text-indigo-900">
                      {todayStats.averageResponseTime || 0}분
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* 에러 표시 */}
        {(storeError || localError) && (
          <div className="m-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <span className="text-red-600 mr-2">⚠️</span>
                <div>
                  <p className="text-red-800 font-medium">
                    오류가 발생했습니다
                  </p>
                  <p className="text-red-700 text-sm mt-1">
                    {storeError || localError}
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  clearError();
                  setLocalError(null);
                }}
                className="text-red-600 hover:text-red-800 text-lg"
              >
                ×
              </button>
            </div>
          </div>
        )}

        {/* 지도 영역 */}
        <div className="flex-1 p-4">
          <div className="bg-white rounded-lg shadow-lg border border-gray-200 h-full overflow-hidden">
            <div className="h-full">
              <SituationMap
                ambulances={filteredAmbulances}
                selectedAmbulance={selectedAmbulance}
                center={mapCenter}
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default FireStationSituationBoard;