import React, { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useWebRtc } from "../../context/WebRtcContext";
import { useOpenVidu } from "../../hooks/useOpenVidu";
import { useMediaStream } from "../../hooks/useMediaStream";
import { useFullScreen } from "../../hooks/useFullScreen";
import VideoDisplay from "./VideoDisplay";
import CallControls from "./CallControls";

export default function WebRtcCall({ sessionId, ambulanceNumber, hospitalId, patientName, ktas, onLeave }) {
  const { togglePipMode } = useWebRtc();
  const location = useLocation();
  
  console.log('[WebRtcCall] 전달받은 props:', {
    sessionId,
    ambulanceNumber,
    hospitalId,
    patientName,
    ktas
  });
  
  // 커스텀 훅들로 로직 완전 분리
  const { joinSession, leaveSession } = useOpenVidu({ 
    sessionId, 
    ambulanceNumber,
    hospitalId, // hospitalId 전달 추가
    ktas, // KTAS 정보 전달
    patientName, // 환자명 전달
    onError: (error) => {
      alert(error.message);
    }
  });
  
  const { 
    localVideoRef, 
    remoteVideoRef, 
    hasRemoteStream 
  } = useMediaStream();
  
  const { isFullScreen, toggleFullScreen } = useFullScreen();

  // 컴포넌트 생명주기 관리
  useEffect(() => {
    console.log('[WebRtcCall] 세션 참가 시작:', {
      sessionId,
      ambulanceNumber,
      hospitalId,
      patientName,
      ktas
    });
    joinSession();

  // beforeunload 이벤트는 페이지를 완전히 벗어날 때만 호출되도록:
  const handleBeforeUnload = (event) => {
    leaveSession();
  };
  window.addEventListener("beforeunload", handleBeforeUnload);

  return () => {
    window.removeEventListener("beforeunload", handleBeforeUnload);
    leaveSession();
  };
}, []);

  // PiP 모드 관리
  useEffect(() => {
    if (togglePipMode) {
      togglePipMode(location.pathname !== "/emergency/map");
    }
  }, [location.pathname, togglePipMode]);

  const handleLeave = () => {
    leaveSession();
    onLeave?.();
  };

  return (
    <div className="web-rtc-call-container flex flex-col h-full">
      <VideoDisplay 
        localVideoRef={localVideoRef}
        remoteVideoRef={remoteVideoRef}
        hasRemoteStream={hasRemoteStream}
      />
      <CallControls 
        onLeave={handleLeave}
        onToggleFullScreen={toggleFullScreen}
        isFullScreen={isFullScreen}
      />
    </div>
  );
}
