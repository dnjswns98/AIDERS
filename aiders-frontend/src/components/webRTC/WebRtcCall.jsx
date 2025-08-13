// src/components/webRTC/WebRtcCall.jsx

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
  
  const { joinSession, leaveSession } = useOpenVidu({ 
    sessionId, 
    ambulanceNumber,
    hospitalId,
    ktas,
    patientName,
    onError: (error) => {
      console.error("WebRTC Hook Error:", error);
      alert(error.message); // 사용자에게 오류 알림
      onLeave?.(); // 오류 발생 시 통화 종료 처리
    }
  });
  
  const { 
    localVideoRef, 
    remoteVideoRef, 
    hasRemoteStream 
  } = useMediaStream();
  
  const { isFullScreen, toggleFullScreen } = useFullScreen();

  // 🔥 수정된 부분: useEffect의 의존성 배열을 빈 배열([])로 변경
  // 이렇게 하면 컴포넌트가 처음 마운트될 때 joinSession이 딱 한 번만 호출되고,
  // 언마운트될 때 return문의 leaveSession이 딱 한 번만 호출됩니다.
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // <-- 이 부분을 빈 배열로 수정했습니다!

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