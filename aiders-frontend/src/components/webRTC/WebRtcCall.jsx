// src/components/webRTC/WebRtcCall.jsx
import React, { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { useWebRtc } from "../../context/WebRtcContext";
import { useOpenVidu } from "../../hooks/useOpenVidu";
import { useMediaStream } from "../../hooks/useMediaStream";
import { useFullScreen } from "../../hooks/useFullScreen";
import VideoDisplay from "./VideoDisplay";
import CallControls from "./CallControls";

// 🔥 수정: 모든 필요한 props 추가
export default function WebRtcCall({
  sessionId,
  ambulanceNumber,
  hospitalId,
  patientName,
  ktas,
  onLeave,
  onRequestCall,
  isRequestInProgress = false, // 🔥 추가: 기본값 설정
  userRole = 'ambulance',      // 🔥 추가: 기본값 설정
  showRequestButton = true,    // 🔥 추가: 기본값 설정
}) {
  const { togglePipMode } = useWebRtc();
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

  const { isFullScreen, toggleFullScreen } = useFullScreen(
    webRtcCallContainerRef
  );

  useEffect(() => {
    joinSession();

    const handleBeforeUnload = (event) => {
      leaveSession();
    };
    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      leaveSession();
    };
  }, []);

  const handleLeave = () => {
    leaveSession();
    onLeave?.();
  };

  const isAmbulanceUser = !!ambulanceNumber;

  return (
    <div
      ref={webRtcCallContainerRef}
      className={`relative ${
        isFullScreen ? "fixed inset-0 z-50 bg-black" : "w-full h-full"
      }`}
    >
      <VideoDisplay
        localVideoRef={localVideoRef}
        remoteVideoRef={remoteVideoRef}
        hasRemoteStream={hasRemoteStream}
      />

      {/* 🔥 구급차 사용자일 때만 하단 컨트롤 패널 표시 */}
      {isAmbulanceUser && (
        <div className="absolute bottom-4 left-4 right-4 bg-black bg-opacity-80 rounded-lg p-3 backdrop-blur-sm">
          <div className="flex gap-2">
            {/* 긴급 추가 알림 버튼 */}
            {onRequestCall && (
              <button
                onClick={onRequestCall}
                disabled={isRequestInProgress}
                className={`
                  flex-1 py-2 px-4 rounded-lg text-sm font-bold transition-all duration-200 flex items-center justify-center gap-2
                  ${
                    isRequestInProgress
                      ? "bg-orange-400 cursor-not-allowed text-white"
                      : "bg-orange-500 hover:bg-orange-600 text-white active:bg-orange-700"
                  }
                `}
              >
                {isRequestInProgress ? (
                  <>
                    <svg
                      className="animate-spin h-4 w-4"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    전송 중...
                  </>
                ) : (
                  <>🚨 긴급 알림</>
                )}
              </button>
            )}

            {/* 전체화면 토글 */}
            <button
              onClick={toggleFullScreen}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-bold transition-colors duration-200"
            >
              {isFullScreen ? "🔄" : "⛶"}
            </button>
          </div>

        </div>
      )}

      {/* 🔥 CallControls는 중복되므로 제거하거나 조건부 렌더링 */}
      {!isAmbulanceUser && (
        <CallControls
          onLeave={handleLeave}
          onToggleFullScreen={toggleFullScreen}
          isFullScreen={isFullScreen}
          canEndCall={true}
          onRequestCall={onRequestCall}
          showRequestButton={showRequestButton}
          isRequestInProgress={isRequestInProgress}
          userRole={userRole}
          ambulanceNumber={ambulanceNumber}
          hospitalName="병원"
        />
      )}
    </div>
  );
}