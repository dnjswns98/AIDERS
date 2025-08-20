import React, { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { useWebRtc } from "../../context/WebRtcContext";
import { useOpenVidu } from "../../hooks/useOpenVidu";
import { useMediaStream } from "../../hooks/useMediaStream";
import { useFullScreen } from "../../hooks/useFullScreen";
import VideoDisplay from "./VideoDisplay";
import CallControls from "./CallControls";

export default function WebRtcCall({
  sessionId,
  ambulanceNumber,
  hospitalId,
  patientName,
  ktas,
  onLeave,
  onRequestCall,
  isRequestInProgress = false,
  userRole = "ambulance",
  showRequestButton,
}) {
  const { isPipMode } = useWebRtc();
  const location = useLocation();
  const webRtcCallContainerRef = useRef(null);

  const { joinSession, leaveSession } = useOpenVidu({
    sessionId,
    ambulanceNumber,
    hospitalId,
    ktas,
    patientName,
    onError: (error) => {
      console.error("WebRTC Hook Error:", error);
      alert(error.message);
      onLeave?.();
    },
  });

  const { localVideoRef, remoteVideoRef, hasRemoteStream } = useMediaStream();
  const { isFullScreen, toggleFullScreen } = useFullScreen(webRtcCallContainerRef);

  useEffect(() => {
    joinSession();
    const handleBeforeUnload = () => leaveSession();
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, []); // join/leave 는 useCallback으로 메모

  const handleLeave = () => {
    leaveSession();
    onLeave?.();
  };

  const isAmbulanceUser = userRole === 'ambulance';
  const shouldShowRequestButton = showRequestButton === undefined ? isAmbulanceUser : showRequestButton;

  // PIP 모드에서는 렌더 안 함
  if (isPipMode) return null;

  return (
    <div
      ref={webRtcCallContainerRef}
      className={`relative ${isFullScreen ? "fixed inset-0 z-50 bg-black" : "w-full h-full"}`}
    >
      {/* 비디오 (꽉 채우기 가능) */}
      <VideoDisplay
        localVideoRef={localVideoRef}
        remoteVideoRef={remoteVideoRef}
        hasRemoteStream={hasRemoteStream}
      />

      {/* === 공통 오버레이 영역: 항상 표시 (z-index 높게) === */}
      <div className="absolute bottom-4 right-4 z-10">
        {isAmbulanceUser ? (
          // 구급차 측: 요청/전체화면 버튼 (오버레이)
          <div className="flex gap-2">
            {onRequestCall && (
              <button
                onClick={onRequestCall}
                disabled={isRequestInProgress}
                className={`px-4 py-2 rounded-lg text-sm font-bold transition-all duration-200 ${
                  isRequestInProgress
                    ? "bg-orange-400 cursor-not-allowed text-white"
                    : "bg-orange-500 hover:bg-orange-600 text-white active:bg-orange-700"
                }`}
              >
                {isRequestInProgress ? "전송 중..." : "🚨 통화 요청"}
              </button>
            )}
            <button
              onClick={toggleFullScreen}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-bold transition-colors duration-200"
            >
              {isFullScreen ? "축소" : "전체화면"}
            </button>
          </div>
        ) : (
          // 병원 측: CallControls 를 오버레이로 띄우기
          <div className="pointer-events-auto">
            <CallControls
              onLeave={handleLeave}
              onToggleFullScreen={toggleFullScreen}
              isFullScreen={isFullScreen}
              canEndCall={true}
              onRequestCall={onRequestCall}
              showRequestButton={shouldShowRequestButton}
              isRequestInProgress={isRequestInProgress}
              userRole={userRole}
              ambulanceNumber={ambulanceNumber}
              hospitalName="병원"
              /** 필요하다면 CallControls에 compact/variant 같은 prop을 추가해
               *  오버레이용 작은 UI로 렌더하도록 개선할 수 있어요. */
            />
          </div>
        )}
      </div>
    </div>
  );
}
