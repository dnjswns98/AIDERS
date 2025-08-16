import React, { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom"; // 🔥 추가
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
  userRole = 'ambulance',
  showRequestButton = true,
}) {
  const { isPipMode } = useWebRtc(); // PIP 모드 상태 가져오기
  const location = useLocation(); // 🔥 추가
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

    const handleBeforeUnload = (event) => {
      leaveSession();
    };
    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []); // joinSession, leaveSession은 useCallback으로 최적화되어 있으므로 의존성 배열에서 제외 가능

  const handleLeave = () => {
    leaveSession();
    onLeave?.();
  };

  const isAmbulanceUser = !!ambulanceNumber;
  
  // 🔥 PIP 모드이거나, 현재 경로가 대시보드가 아닐 경우 전체 화면 컴포넌트를 렌더링하지 않음
  if (isPipMode) {
    return null;
  }

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

      {isAmbulanceUser && (
        <div className="absolute bottom-4 left-4 right-4 bg-black bg-opacity-80 rounded-lg p-3 backdrop-blur-sm">
          <div className="flex gap-2">
            {onRequestCall && (
              <button
                onClick={onRequestCall}
                disabled={isRequestInProgress}
                className={`flex-1 py-2 px-4 rounded-lg text-sm font-bold transition-all duration-200 flex items-center justify-center gap-2 ${
                  isRequestInProgress
                    ? "bg-orange-400 cursor-not-allowed text-white"
                    : "bg-orange-500 hover:bg-orange-600 text-white active:bg-orange-700"
                }`}
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
                        cx="12" cy="12" r="10"
                        stroke="currentColor" strokeWidth="4"
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
                  <>🚨 통화 요청</>
                )}
              </button>
            )}
            <button
              onClick={toggleFullScreen}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-bold transition-colors duration-200"
            >
              {isFullScreen ? "축소" : "전체화면"}
            </button>
          </div>
        </div>
      )}

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