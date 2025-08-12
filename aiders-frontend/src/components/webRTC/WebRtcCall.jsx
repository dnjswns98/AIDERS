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

  // 🔥 수정: 컴포넌트 생명주기와 세션 참여/종료 로직을 명확하게 연결합니다.
  useEffect(() => {
    joinSession();

    const handleBeforeUnload = (event) => {
        leaveSession();
    };
    window.addEventListener("beforeunload", handleBeforeUnload);

    // 컴포넌트가 언마운트될 때 세션을 확실하게 종료합니다.
    return () => {
        window.removeEventListener("beforeunload", handleBeforeUnload);
        leaveSession();
    };
  }, [joinSession, leaveSession]); // 🔥 수정: 의존성 배열에 joinSession과 leaveSession을 추가

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