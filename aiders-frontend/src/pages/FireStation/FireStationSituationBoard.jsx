import React, { useState, useEffect, useMemo, useCallback } from "react";
import useFireStationStore from "../../store/useFireStationStore";
import SituationMap from "../../components/FireStation/SituationMap";
import { useAuthStore } from "../../store/useAuthStore";
import DispatchFormModal from "../../components/FireStation/modals/DispatchFormModal";
import useFirestationWebSocket from "../../hooks/useFirestationWebSocket";

const FireStationSituationBoard = () => {
  const { user } = useAuthStore();
  
  const { 
      ambulances, 
      firestationInfo, 
      todayStats, 
      isAmbulanceDispatching,
      getDispatchProgress,
      fetchDispatchHistory, 
      fetchFirestationAmbulances,
      fetchFirestationInfo,
      error: storeError, 
      clearError,
      isLoading: storeLoading 
  } = useFireStationStore();

  const { ambulanceUpdates } = useFirestationWebSocket(firestationInfo?.id);

  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedAmbulance, setSelectedAmbulance] = useState(null);
  const [mapCenter, setMapCenter] = useState({ lat: 36.145, lng: 128.39 });
  const [showDispatchModal, setShowDispatchModal] = useState(false);
  const [preselectedAmbulance, setPreselectedAmbulance] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isAutoRefresh, setIsAutoRefresh] = useState(true);
  const [lastRefreshTime, setLastRefreshTime] = useState(null);
  const [localError, setLocalError] = useState(null);

  const fetchData = useCallback(async () => {
    if (user?.userId) {
        await fetchFirestationInfo();
        await fetchFirestationAmbulances(user.userId);
        await fetchDispatchHistory();
    }
  }, [user?.userId, fetchFirestationInfo, fetchFirestationAmbulances, fetchDispatchHistory]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const ambulanceStats = useMemo(() => {
    const stats = {
      total: ambulances.length, dispatched: 0, transporting: 0, standby: 0, maintenance: 0,
    };
    ambulances.forEach((ambulance) => {
      const status = ambulance.currentStatus || ambulance.status;
      switch (status) {
        case "DISPATCH": case "dispatched": stats.dispatched++; break;
        case "TRANSFER": case "transporting": stats.transporting++; break;
        case "WAIT": case "standby": stats.standby++; break;
        case "MAINTENANCE": case "maintenance": stats.maintenance++; break;
      }
    });
    return stats;
  }, [ambulances]);

  const allAmbulancesWithLocation = useMemo(() => {
    return ambulances.map(ambulance => {
        const update = ambulanceUpdates.get(ambulance.ambulanceId);
        if (update) {
            return {
                ...ambulance,
                latitude: update.latitude,
                longitude: update.longitude,
                lastLocationUpdate: update.timestamp,
            };
        }
        return ambulance;
    });
  }, [ambulances, ambulanceUpdates]);
  
  const filteredAmbulances = useMemo(() => {
    let filtered = [...allAmbulancesWithLocation];
    switch (filterStatus) {
      case "dispatched":
        filtered = filtered.filter((a) => ["DISPATCH", "dispatched"].includes(a.currentStatus || a.status) || isAmbulanceDispatching(a.userKey));
        break;
      case "transporting":
        filtered = filtered.filter((a) => ["TRANSFER", "transporting"].includes(a.currentStatus || a.status));
        break;
      case "standby":
        filtered = filtered.filter((a) => ["WAIT", "standby"].includes(a.currentStatus || a.status));
        break;
    }
    filtered.sort((a, b) => {
      const statusPriority = { dispatching: 1000, DISPATCH: 900, TRANSFER: 800, WAIT: 100, MAINTENANCE: 10 };
      const aP = isAmbulanceDispatching(a.userKey) ? 1000 : statusPriority[a.currentStatus] || 50;
      const bP = isAmbulanceDispatching(b.userKey) ? 1000 : statusPriority[b.currentStatus] || 50;
      return bP - aP;
    });
    return filtered;
  }, [allAmbulancesWithLocation, filterStatus, isAmbulanceDispatching]);
  
  useEffect(() => {
    if (firestationInfo?.latitude && firestationInfo?.longitude) {
      setMapCenter({ lat: firestationInfo.latitude, lng: firestationInfo.longitude });
    }
  }, [firestationInfo]);

  useEffect(() => {
    let interval;
    if (isAutoRefresh) {
      interval = setInterval(() => { fetchData(); setLastRefreshTime(new Date()); }, 30000);
    }
    return () => clearInterval(interval);
  }, [isAutoRefresh, fetchData]);

  useEffect(() => {
    if (storeError || localError) {
      const timer = setTimeout(() => { clearError(); setLocalError(null); }, 5000);
      return () => clearTimeout(timer);
    }
  }, [storeError, localError, clearError]);

  const handleAmbulanceClick = useCallback((ambulance) => {
    setSelectedAmbulance(ambulance);
    const status = (ambulance.currentStatus || ambulance.status || '').toUpperCase();
    if (status === 'WAIT' || status === 'STANDBY') {
        setPreselectedAmbulance(ambulance);
        setShowDispatchModal(true);
    } else if (ambulance.latitude && ambulance.longitude) {
        setMapCenter({ lat: ambulance.latitude, lng: ambulance.longitude });
    }
  }, []);

  const handleManualRefresh = useCallback(async () => {
    if (isRefreshing || storeLoading) return;
    setIsRefreshing(true);
    try {
      await fetchData();
      setLastRefreshTime(new Date());
      setLocalError(null);
    } catch (error) {
      setLocalError("새로고침에 실패했습니다.");
    } finally {
      setIsRefreshing(false);
    }
  }, [isRefreshing, storeLoading, fetchData]);

  const toggleAutoRefresh = useCallback(() => setIsAutoRefresh(p => !p), []);

  const getFilterStyle = useCallback((status) => {
    const isActive = filterStatus === status;
    const styles = {
      all: { color: isActive ? "bg-gray-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200", icon: "📋" },
      dispatched: { color: isActive ? "bg-orange-600 text-white" : "bg-orange-100 text-orange-700 hover:bg-orange-200", icon: "🚨" },
      transporting: { color: isActive ? "bg-green-600 text-white" : "bg-green-100 text-green-700 hover:bg-green-200", icon: "🏥" },
      standby: { color: isActive ? "bg-blue-600 text-white" : "bg-blue-100 text-blue-700 hover:bg-blue-200", icon: "⭐" },
    };
    return styles[status] || styles.all;
  }, [filterStatus]);

  const getAmbulanceStatusStyle = useCallback((ambulance) => {
    if (isAmbulanceDispatching(ambulance.userKey)) return { bgColor: "bg-blue-50", borderColor: "border-l-blue-500", textColor: "text-blue-700", icon: "🔄", statusText: "배차 중..." };
    const status = ambulance.currentStatus || ambulance.status;
    switch (status) {
      case "DISPATCH": case "dispatched": return { bgColor: "bg-orange-50", borderColor: "border-l-orange-500", textColor: "text-orange-700", icon: "🚨", statusText: "출동 중" };
      case "TRANSFER": case "transporting": return { bgColor: "bg-green-50", borderColor: "border-l-green-500", textColor: "text-green-700", icon: "🏥", statusText: "이송 중" };
      case "WAIT": case "standby": return { bgColor: "bg-blue-50", borderColor: "border-l-blue-500", textColor: "text-blue-700", icon: "⭐", statusText: "대기 중" };
      case "MAINTENANCE": case "maintenance": return { bgColor: "bg-gray-50", borderColor: "border-l-gray-500", textColor: "text-gray-700", icon: "🔧", statusText: "정비 중" };
      default: return { bgColor: "bg-gray-50", borderColor: "border-l-gray-500", textColor: "text-gray-700", icon: "❓", statusText: "상태 불명" };
    }
  }, [isAmbulanceDispatching]);

  const handleDispatchSuccess = () => {
    setShowDispatchModal(false);
    setPreselectedAmbulance(null);
    fetchData();
  };

  if (!firestationInfo || (storeLoading && !ambulances.length)) {
    return <div className="h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>;
  }

  return (
    <div className="flex h-full bg-gray-100">
      <aside className="w-80 bg-white border-r border-gray-300 flex flex-col shadow-lg">
        <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex items-center justify-between"><h2 className="text-xl font-bold text-gray-900 flex items-center"><span className="mr-2">🚑</span>구급차 현황</h2><div className="text-sm text-gray-600">{filteredAmbulances.length} / {ambulances.length}</div></div>
          <div className="mt-4 grid grid-cols-2 gap-2">
            {[{ key: "all", label: "전체", count: ambulanceStats.total }, { key: "dispatched", label: "출동중", count: ambulanceStats.dispatched }, { key: "transporting", label: "이송중", count: ambulanceStats.transporting }, { key: "standby", label: "대기중", count: ambulanceStats.standby }].map(f => {
              const style = getFilterStyle(f.key);
              return <button key={f.key} onClick={() => setFilterStatus(f.key)} className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center ${style.color}`}><span className="mr-1">{style.icon}</span>{f.label}<span className="ml-1 text-xs opacity-75">({f.count})</span></button>;
            })}
          </div>
        </div>
        <div className="flex-1 min-h-0 overflow-y-auto">
          {filteredAmbulances.length === 0 ? <div className="p-6 text-center text-gray-500"><span className="text-4xl block mb-4">🚑</span><div className="font-medium">해당 상태의 구급차가 없습니다</div></div> :
            <div className="p-2">
              {filteredAmbulances.map(ambulance => {
                const statusStyle = getAmbulanceStatusStyle(ambulance);
                const isSelected = selectedAmbulance?.userKey === ambulance.userKey;
                return (
                  <div key={ambulance.userKey} onClick={() => handleAmbulanceClick(ambulance)} className={`mb-2 p-3 rounded-lg border-l-4 cursor-pointer transition-all hover:shadow-md ${statusStyle.bgColor} ${statusStyle.borderColor} ${isSelected ? "ring-2 ring-blue-400 bg-blue-100" : ""}`}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center"><span className="text-lg mr-2">{statusStyle.icon}</span><div><div className="font-bold text-gray-900">{ambulance.userKey || `ID: ${ambulance.ambulanceId}`}</div><div className={`text-xs font-medium ${statusStyle.textColor}`}>{statusStyle.statusText}</div></div></div>
                    </div>
                    <div className="space-y-1 text-sm">
                      {ambulance.pAddress && <div className="text-gray-600 truncate">📍 {ambulance.pAddress}</div>}
                      {ambulance.pCondition && <div className="text-gray-600 truncate">🏥 {ambulance.pCondition}</div>}
                    </div>
                  </div>
                );
              })}
            </div>
          }
        </div>
        <div className="p-4 border-t border-gray-200 bg-gray-50"><div className="flex items-center justify-between text-sm text-gray-600"><div className="flex items-center"><div className={`w-2 h-2 rounded-full mr-2 ${isAutoRefresh ? "bg-green-500 animate-pulse" : "bg-gray-400"}`}></div>{isAutoRefresh ? "자동 새로고침 ON" : "자동 새로고침 OFF"}</div>{lastRefreshTime && <div>{lastRefreshTime.toLocaleTimeString()}</div>}</div></div>
      </aside>
      <main className="flex-1 flex flex-col min-h-0">
        <header className="bg-white border-b border-gray-200 shadow-sm">
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <div><h1 className="text-2xl font-bold text-gray-900 flex items-center"><span className="mr-2">🔥</span>실시간 상황판</h1><p className="text-sm text-gray-600">{firestationInfo?.name || "소방서"} · 실시간 모니터링</p></div>
              <div className="flex items-center space-x-3">
                <button onClick={toggleAutoRefresh} className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${isAutoRefresh ? "bg-green-600 text-white hover:bg-green-700" : "bg-gray-200 text-gray-700 hover:bg-gray-300"}`}>{isAutoRefresh ? "⏸️ 자동새로고침" : "▶️ 자동새로고침"}</button>
                <button onClick={handleManualRefresh} disabled={isRefreshing || storeLoading} className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-300 disabled:cursor-not-allowed flex items-center"><span className={`mr-2 ${isRefreshing || storeLoading ? "animate-spin" : ""}`}>🔄</span>{isRefreshing || storeLoading ? "새로고침 중..." : "새로고침"}</button>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="bg-purple-50 p-3 rounded-lg border border-purple-200"><div className="flex items-center"><div className="p-2 bg-purple-100 rounded-lg mr-3"><span className="text-lg">📊</span></div><div><p className="text-xs font-medium text-purple-600">오늘 출동</p><p className="text-lg font-bold text-purple-900">{todayStats.totalDispatches || 0}</p></div></div></div>
              <div className="bg-orange-50 p-3 rounded-lg border border-orange-200"><div className="flex items-center"><div className="p-2 bg-orange-100 rounded-lg mr-3"><span className="text-lg">🚨</span></div><div><p className="text-xs font-medium text-orange-600">출동 중</p><p className="text-lg font-bold text-orange-900">{ambulanceStats.dispatched}</p></div></div></div>
              <div className="bg-green-50 p-3 rounded-lg border border-green-200"><div className="flex items-center"><div className="p-2 bg-green-100 rounded-lg mr-3"><span className="text-lg">🏥</span></div><div><p className="text-xs font-medium text-green-600">이송 중</p><p className="text-lg font-bold text-green-900">{ambulanceStats.transporting}</p></div></div></div>
              <div className="bg-blue-50 p-3 rounded-lg border border-blue-200"><div className="flex items-center"><div className="p-2 bg-blue-100 rounded-lg mr-3"><span className="text-lg">⭐</span></div><div><p className="text-xs font-medium text-blue-600">대기 중</p><p className="text-lg font-bold text-blue-900">{ambulanceStats.standby}</p></div></div></div>
              <div className="bg-indigo-50 p-3 rounded-lg border border-indigo-200"><div className="flex items-center"><div className="p-2 bg-indigo-100 rounded-lg mr-3"><span className="text-lg">⏱️</span></div><div><p className="text-xs font-medium text-indigo-600">평균응답</p><p className="text-lg font-bold text-indigo-900">{todayStats.averageResponseTime || 0}분</p></div></div></div>
            </div>
          </div>
        </header>
        {(storeError || localError) && (<div className="m-4 p-4 bg-red-50 border border-red-200 rounded-lg"><div className="flex items-center justify-between"><div className="flex items-center"><span className="text-red-600 mr-2">⚠️</span><div><p className="text-red-800 font-medium">오류가 발생했습니다</p><p className="text-red-700 text-sm mt-1">{storeError || localError}</p></div></div><button onClick={() => { clearError(); setLocalError(null); }} className="text-red-600 hover:text-red-800 text-lg">×</button></div></div>)}
        <div className="flex-1 min-h-0 p-4">
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
      
      <DispatchFormModal
          isOpen={showDispatchModal}
          onClose={() => {
              setShowDispatchModal(false);
              setPreselectedAmbulance(null);
          }}
          onDispatchSuccess={handleDispatchSuccess}
          firestationInfo={firestationInfo}
          initialAmbulanceId={preselectedAmbulance?.ambulanceId}
      />
    </div>
  );
};

export default FireStationSituationBoard;