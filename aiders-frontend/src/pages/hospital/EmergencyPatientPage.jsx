// src/pages/hospital/EmergencyPatientPage.jsx
import { useState, useEffect, useMemo, useCallback } from "react";
import HospitalHeader from "../../components/hospital/HospitalHeader";
import WebRtcCall from "../../components/webRTC/WebRtcCall";
import useEmergencyStore from "../../store/useEmergencyStore";
import useWaitingAmbulanceStore from "../../store/useWaitingAmbulanceStore";
import { useAuthStore } from "../../store/useAuthStore";
import { startVideoCall, endVideoCall, getPatientInfo } from "../../api/api";
import useHospitalAlarmRefresh from "../../hooks/useHospitalAlarmRefresh";

/** ─────────────────────────────
 *  공통: 드래그 위치 훅
 *  ───────────────────────────── */
function useDraggable(initial = { x: 20, y: 20 }) {
  const [pos, setPos] = useState(initial);
  const [dragging, setDragging] = useState(false);
  const [start, setStart] = useState({ x: 0, y: 0 });

  const onMouseDown = useCallback(
    (e) => {
      if (e.target.closest(".drag-handle")) {
        e.preventDefault();
        setDragging(true);
        setStart({ x: e.clientX - pos.x, y: e.clientY - pos.y });
      }
    },
    [pos.x, pos.y]
  );

  useEffect(() => {
    if (!dragging) return;

    const onMouseMove = (e) => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      const width = 320;
      const height = 240;

      let nx = e.clientX - start.x;
      let ny = e.clientY - start.y;

      nx = Math.max(0, Math.min(nx, w - width));
      ny = Math.max(0, Math.min(ny, h - height));
      setPos({ x: nx, y: ny });
    };

    const onMouseUp = () => setDragging(false);

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
    return () => {
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
    };
  }, [dragging, start.x, start.y]);

  return { pos, dragging, onMouseDown };
}

/** ─────────────────────────────
 *  PIP 비디오(공통 컨테이너)
 *  ───────────────────────────── */
function DraggablePip({ title, children }) {
  const { pos, dragging, onMouseDown } = useDraggable();

  return (
    <div
      style={{ top: pos.y, left: pos.x }}
      className={[
        "fixed z-[1000] w-[320px] h-[240px] select-none overflow-hidden",
        "rounded-xl bg-white border",
        dragging ? "border-blue-500 scale-[1.02] shadow-2xl" : "border-gray-200 shadow-xl",
        dragging ? "" : "transition-all duration-200 ease-in-out",
      ].join(" ")}
    >
      <div
        className={[
          "drag-handle flex items-center justify-between",
          "px-3 py-2 border-b border-gray-200",
          dragging ? "cursor-grabbing" : "cursor-grab",
          "bg-slate-50",
        ].join(" ")}
        onMouseDown={onMouseDown}
      >
        <h4 className="m-0 text-sm font-bold text-gray-800">{title}</h4>
        <span className="text-xs text-gray-500">드래그로 이동</span>
      </div>
      <div className="h-[200px]">{children}</div>
    </div>
  );
}

/** ─────────────────────────────
 *  구급차 카드
 *  ───────────────────────────── */
function AmbulanceCard({ ambulance, detail, onClick, onStartCall }) {
  const status = ambulance.isInCall ? "연결중" : "대기중";
  const statusClass = ambulance.isInCall
    ? "bg-emerald-100 text-emerald-700 border-emerald-200"
    : "bg-amber-100 text-amber-800 border-amber-200";

  const ktas = detail?.ktas ?? ambulance.ktas;
  const ktasBadge =
    ktas && ktas <= 2
      ? "bg-red-100 text-red-800"
      : ktas && ktas <= 3
      ? "bg-amber-100 text-amber-800"
      : "bg-gray-100 text-gray-800";

  return (
    <div className="rounded-lg border border-gray-200 bg-slate-50 p-4">
      <div
        onClick={onClick}
        className="mb-2 flex cursor-pointer items-center justify-between rounded px-1 py-0.5 hover:bg-blue-50"
      >
        <span className="text-xl font-bold text-gray-900">{ambulance.ambulanceNumber}</span>
        <span className={`rounded border px-2 py-0.5 text-base font-semibold ${statusClass}`}>{status}</span>
      </div>

      <div onClick={onClick} className="mb-2 cursor-pointer rounded px-1 py-0.5 text-gray-500 hover:bg-blue-50">
        <div className="mb-1">
          <span className="font-bold text-gray-400">진료과목:</span>{" "}
          <strong>{detail?.department || "조회중..."}</strong>
        </div>
        <div className="mb-2">
          <span className="font-bold text-gray-400">KTAS:</span>{" "}
          <span className={`ml-1 rounded px-1.5 py-0.5 text-lg font-semibold ${ktasBadge}`}>
            {ktas ? `${ktas}등급` : "미기재"}
          </span>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div onClick={onClick} className="flex-1 cursor-pointer rounded px-1 py-0.5 hover:bg-blue-50">
          <span className="text-sm text-gray-400">
            등록시간: {ambulance.createdAt ? new Date(ambulance.createdAt).toLocaleString("ko-KR") : "방금전"}
          </span>
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onStartCall();
          }}
          disabled={ambulance.isInCall}
          className={[
            "min-w-[72px] rounded-md px-3 py-2 text-base font-semibold text-white transition-colors",
            ambulance.isInCall ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700",
          ].join(" ")}
        >
          {ambulance.isInCall ? "통화중" : "통화"}
        </button>
      </div>
    </div>
  );
}

/** ─────────────────────────────
 *  구급차 목록
 *  ───────────────────────────── */
function AmbulanceList({ onSelectAmbulance, onStartCall, onAmbulanceDetailsChange }) {
  const { ambulances, isLoading, error, fetchWaitingAmbulances } = useWaitingAmbulanceStore();
  const { user } = useAuthStore();
  const [details, setDetails] = useState({});

  const uniqueAmbulances = useMemo(() => {
    if (!ambulances?.length) return [];
    const seen = new Set();
    return ambulances.filter((a) => {
      const key = a.sessionId ?? a.ambulanceId ?? a.id;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, [ambulances]);

  const fetchAmbulanceDetails = useCallback(async () => {
    if (!uniqueAmbulances.length) {
      setDetails({});
      onAmbulanceDetailsChange?.({});
      return;
    }

    const next = {};
    for (const a of uniqueAmbulances) {
      const key = a.sessionId ?? a.ambulanceId ?? a.id;
      try {
        const p = await getPatientInfo(a.sessionId);
        next[a.sessionId] = {
          department: p?.department || "미기재",
          ktas: p?.ktas || a.ktas,
          patientName: p?.name || a.patientName,
          sex: p?.sex,
          ageRange: p?.ageRange,
          rrn: p?.rrn,
          nationality: p?.nationality,
          vitalSigns: p?.vitalSigns,
          medicine: p?.medicine,
          pastHistory: p?.pastHistory,
          familyHistory: p?.familyHistory,
          medicalRecord: p?.medicalRecord,
        };
      } catch (e) {
        console.warn(`환자 정보 조회 실패: ${key}`, e);
        next[a.sessionId] = {
          department: "미기재",
          ktas: a.ktas,
          patientName: a.patientName,
          sex: null,
          ageRange: null,
          rrn: null,
          nationality: null,
          vitalSigns: null,
          medicine: null,
          pastHistory: null,
          familyHistory: null,
          medicalRecord: null,
        };
      }
    }
    setDetails(next);
    onAmbulanceDetailsChange?.(next);
  }, [uniqueAmbulances, onAmbulanceDetailsChange]);

  useHospitalAlarmRefresh(() => {
    if (user?.userId) fetchWaitingAmbulances(user.userId);
  }, ["MATCHING", "REQUEST"]);

  useEffect(() => {
    if (!user?.userId) return;
    fetchWaitingAmbulances(user.userId);
    const id = setInterval(() => fetchWaitingAmbulances(user.userId), 30000);
    return () => clearInterval(id);
  }, [fetchWaitingAmbulances, user?.userId]);

  useEffect(() => {
    fetchAmbulanceDetails();
  }, [fetchAmbulanceDetails, uniqueAmbulances.length]);

  return (
    <aside className="h-full w-[400px] overflow-auto border-r-2 border-gray-200 bg-white p-5">
      <div className="mb-5 flex items-center justify-center border-b-2 border-gray-200 pb-4">
        <h3 className="m-0 text-center text-2xl font-bold text-gray-900">이송중인 구급차</h3>
      </div>

      {isLoading && <div className="py-5 text-center text-gray-500">로딩 중...</div>}
      {error && <div className="py-5 text-center text-red-500">오류가 발생했습니다: {error}</div>}
      {!isLoading && !error && uniqueAmbulances.length === 0 && (
        <div className="py-5 text-center text-gray-500">현재 이송중인 구급차가 없습니다.</div>
      )}

      <div className="flex flex-col gap-3">
        {uniqueAmbulances.map((a) => (
          <AmbulanceCard
            key={a.sessionId ?? a.ambulanceId ?? a.id}
            ambulance={a}
            detail={details[a.sessionId]}
            onClick={() => onSelectAmbulance(a)}
            onStartCall={() => onStartCall(a)}
          />
        ))}
      </div>
    </aside>
  );
}

/** ─────────────────────────────
 *  상세정보 탭
 *  ───────────────────────────── */
function DetailInfoTab({ selectedAmbulance, ambulanceDetails }) {
  if (!selectedAmbulance) {
    return (
      <div className="flex flex-1 items-center justify-center p-5">
        <div className="text-center text-gray-500">
          <div className="mb-4 text-5xl">🚑</div>
          <h3 className="text-lg font-bold">구급차를 선택하세요</h3>
          <p className="mt-2 text-base">왼쪽 목록에서 구급차를 클릭하여 환자 상세정보를 확인하세요.</p>
        </div>
      </div>
    );
  }
  const d = ambulanceDetails[selectedAmbulance.sessionId] || {};

  const ktas = d.ktas ?? selectedAmbulance.ktas;
  const ktasBadge =
    ktas && ktas <= 2
      ? "bg-red-100 text-red-800"
      : ktas && ktas <= 3
      ? "bg-amber-100 text-amber-800"
      : "bg-gray-100 text-gray-800";

  const ageDict = {
    NEWBORN: "신생아",
    INFANT: "영유아",
    CHILD: "아동",
    ADULT: "성인",
    ELDERLY: "고령자",
  };

  return (
    <div className="flex-1 overflow-auto p-5">
      <div className="h-full w-full overflow-auto rounded-xl bg-white p-6 shadow">
        <div className="mb-6 flex items-center border-b-2 border-gray-200 pb-4">
          <div className="mr-3 text-2xl">👤</div>
          <h3 className="m-0 text-2xl font-bold text-gray-900">
            구급차 {selectedAmbulance.ambulanceNumber} 환자 상세정보
          </h3>
        </div>

        <div className="rounded-lg border border-gray-200 bg-slate-50 p-6">
          <div className="flex flex-col gap-5">
            <section>
              <h4 className="mb-3 border-b border-gray-200 pb-2 text-lg font-semibold text-gray-900">환자 기본 정보</h4>
              <ul className="flex flex-col gap-2 text-gray-600">
                <li>
                  <span className="font-semibold text-gray-800">환자명:</span>
                  <span className="ml-2">{d.patientName || selectedAmbulance.patientName || "미기재"}</span>
                </li>
                <li>
                  <span className="font-semibold text-gray-800">성별:</span>
                  <span className="ml-2">{d.sex === 0 ? "남성" : d.sex === 1 ? "여성" : "미기재"}</span>
                </li>
                <li>
                  <span className="font-semibold text-gray-800">연령대:</span>
                  <span className="ml-2">{ageDict[d.ageRange] || d.ageRange || "미기재"}</span>
                </li>
              </ul>
            </section>

            <section>
              <h4 className="mb-3 border-b border-gray-200 pb-2 text-lg font-semibold text-gray-900">의료 정보</h4>
              <ul className="flex flex-col gap-2 text-gray-600">
                <li>
                  <span className="font-semibold text-gray-800">진료과목:</span>
                  <span className="ml-2">{d.department || "미기재"}</span>
                </li>
                <li className="flex items-center">
                  <span className="font-semibold text-gray-800">KTAS 등급:</span>
                  <span className={`ml-2 rounded px-2 py-0.5 text-sm font-semibold ${ktasBadge}`}>
                    {ktas ? `KTAS ${ktas}등급` : "미분류"}
                  </span>
                </li>
                <li>
                  <span className="font-semibold text-gray-800">생체징후:</span>
                  <span className="ml-2">{d.vitalSigns || "미기재"}</span>
                </li>
                <li>
                  <span className="font-semibold text-gray-800">복용약물:</span>
                  <span className="ml-2">{d.medicine || "미기재"}</span>
                </li>
              </ul>
            </section>

            <section>
              <h4 className="mb-3 border-b border-gray-200 pb-2 text-lg font-semibold text-gray-900">병력 정보</h4>
              <ul className="flex flex-col gap-2 text-gray-600">
                <li>
                  <span className="font-semibold text-gray-800">과거병력:</span>
                  <span className="ml-2">{d.pastHistory || "미기재"}</span>
                </li>
                <li>
                  <span className="font-semibold text-gray-800">가족력:</span>
                  <span className="ml-2">{d.familyHistory || "미기재"}</span>
                </li>
                <li>
                  <span className="font-semibold text-gray-800">의료기록:</span>
                  <span className="ml-2">{d.medicalRecord || "미기재"}</span>
                </li>
              </ul>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}

/** ─────────────────────────────
 *  메인 페이지
 *  ───────────────────────────── */
export default function EmergencyPatientPage() {
  const [activeTab, setActiveTab] = useState("video");
  const { selectedAmbulance, selectAmbulance } = useEmergencyStore();
  const [isCallActive, setIsCallActive] = useState(false);
  const [currentCallAmbulance, setCurrentCallAmbulance] = useState(null);
  const [webRtcSessionId, setWebRtcSessionId] = useState(null);
  const [webRtcComponent, setWebRtcComponent] = useState(null);
  const [ambulanceDetails, setAmbulanceDetails] = useState({});
  const { user } = useAuthStore();

  const handleSelectAmbulance = useCallback((a) => {
    selectAmbulance(a);
  }, [selectAmbulance]);

  const handleStartCall = useCallback(async (ambulance) => {
    try {
      const sessionId = ambulance.sessionId || ambulance.ambulanceId;
      await startVideoCall({ sessionId, hospitalId: parseInt(user?.userId) });

      setWebRtcSessionId(sessionId);
      setIsCallActive(true);
      setCurrentCallAmbulance(ambulance);
      handleSelectAmbulance(ambulance);

      setWebRtcComponent(
        <WebRtcCall
          sessionId={sessionId}
          hospitalId={parseInt(user?.userId)}
          onLeave={handleEndCall}
          patientName={ambulance.patientName || ""}
          ktas={ambulance.ktas || ""}
        />
      );

      const { updateAmbulanceCallStatus } = useWaitingAmbulanceStore.getState();
      updateAmbulanceCallStatus(sessionId, true);
    } catch (e) {
      console.error("[EmergencyPatient] 통화 시작 실패:", e);
    }
  }, [handleSelectAmbulance, user?.userId]);

  const handleEndCall = useCallback(async () => {
    try {
      if (currentCallAmbulance && user?.userId) {
        const sessionId = webRtcSessionId || currentCallAmbulance.sessionId || currentCallAmbulance.ambulanceId;
        await endVideoCall({ sessionId, hospitalId: parseInt(user.userId) });

        const { updateAmbulanceCallStatus, fetchWaitingAmbulances } = useWaitingAmbulanceStore.getState();
        updateAmbulanceCallStatus(sessionId, false);
        fetchWaitingAmbulances(user.userId);
      }
    } catch (e) {
      console.error("[EmergencyPatient] 통화 종료 처리 실패:", e);
    } finally {
      setWebRtcSessionId(null);
      setIsCallActive(false);
      setCurrentCallAmbulance(null);
      setWebRtcComponent(null);
    }
  }, [currentCallAmbulance, user?.userId, webRtcSessionId]);

  return (
    <>
      <HospitalHeader />

      {/* 헤더 64px 기준: 전체 높이에서 헤더 제외 */}
      <main className="flex h-screen bg-gray-50 pt-16 overflow-hidden">
        <AmbulanceList
          onSelectAmbulance={handleSelectAmbulance}
          onStartCall={handleStartCall}
          onAmbulanceDetailsChange={setAmbulanceDetails}
        />

        {/* PIP 모드 - 상세정보 탭일 때만 표시 */}
        {isCallActive && activeTab === "detail" && webRtcComponent && (
          <DraggablePip title="화상통화 (PIP)">{webRtcComponent}</DraggablePip>
        )}

        <section className="flex flex-1 flex-col min-h-0 overflow-hidden">
          <div className="px-6 pt-6 shrink-0">
            <h1 className="mb-2 text-3xl font-bold text-gray-900">구급환자 관리</h1>
          </div>

          {/* 탭 */}
          <div className="mx-6 border-b-2 border-gray-200 shrink-0">
            <div className="flex">
              <button
                onClick={() => setActiveTab("video")}
                className={[
                  "flex-1 cursor-pointer border-b-4 px-10 py-5 text-lg transition-all",
                  activeTab === "video" ? "border-blue-600 font-semibold text-blue-600" : "border-transparent text-gray-500",
                ].join(" ")}
              >
                📹 화상전화
              </button>
              <button
                onClick={() => setActiveTab("detail")}
                className={[
                  "flex-1 cursor-pointer border-b-4 px-10 py-5 text-lg transition-all",
                  activeTab === "detail" ? "border-blue-600 font-semibold text-blue-600" : "border-transparent text-gray-500",
                ].join(" ")}
              >
                📋 상세정보
              </button>
            </div>
          </div>

          {/* 콘텐츠 */}
          {activeTab === "video" ? (
            <div className="flex-1 p-6 min-h-0 overflow-hidden">
              <div className="flex h-full w-full flex-col rounded-xl bg-white p-5 shadow overflow-hidden">
                <div className="flex items-center justify-between border-b-2 border-gray-200 pb-4 mb-4 shrink-0">
                  <h3 className="m-0 text-lg font-bold text-gray-900">
                    구급차 화상통화
                    {currentCallAmbulance && (
                      <span className="ml-2 text-sm text-gray-500">
                        ({currentCallAmbulance.ambulanceNumber || currentCallAmbulance.ambulanceId})
                      </span>
                    )}
                  </h3>
                </div>

                {/* 본문: 영상 + 컨트롤(오버레이) */}
                <div className="relative flex-1 min-h-0 overflow-hidden rounded-lg bg-black">
                  {/* 영상 꽉 차게 */}
                  <div className="absolute inset-0">
                    {isCallActive && webRtcComponent ? (
                      webRtcComponent
                    ) : (
                      <div className="flex h-full w-full flex-col items-center justify-center bg-gray-50">
                        <div className="mb-6 text-6xl">📹</div>
                        <h4 className="mb-3 text-2xl text-gray-500">화상통화 대기중</h4>
                        <p className="text-center text-base leading-relaxed text-gray-400">
                          왼쪽 구급차 목록에서 &quot;통화&quot; 버튼을 클릭하여<br />화상통화를 시작하세요.
                        </p>
                      </div>
                    )}
                  </div>

                  {/* 컨트롤: 비디오 위에 겹쳐 표시 → 스크롤 없음 */}
                  <div className="pointer-events-auto absolute bottom-4 right-4 flex gap-3">
                    {/* 필요하면 여기에 '추가 알림', '전체화면' 버튼을 렌더링
                        <button className="rounded-lg bg-orange-500 px-4 py-2 text-white shadow hover:bg-orange-600">추가 알림</button>
                        <button className="rounded-lg bg-blue-600 px-4 py-2 text-white shadow hover:bg-blue-700">전체화면</button>
                    */}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <DetailInfoTab selectedAmbulance={selectedAmbulance} ambulanceDetails={ambulanceDetails} />
          )}
        </section>
      </main>
    </>
  );
}
