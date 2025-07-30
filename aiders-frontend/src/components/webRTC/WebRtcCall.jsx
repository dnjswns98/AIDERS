import React, { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useWebRtc } from "../../context/WebRtcContext";
import { useOpenVidu } from "../../hooks/useOpenVidu";
import { useMediaStream } from "../../hooks/useMediaStream";
import { useFullScreen } from "../../hooks/useFullScreen";
import VideoDisplay from "./VideoDisplay";
import CallControls from "./CallControls";

export default function WebRtcCall({ sessionName, userName, onLeave }) {
  const { togglePipMode } = useWebRtc();
  const location = useLocation();
  
  // 커스텀 훅들로 로직 완전 분리
  const { joinSession, leaveSession } = useOpenVidu({ 
    sessionName, 
    userName,
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
    joinSession();
    
    const handleBeforeUnload = () => leaveSession();
    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      leaveSession();
    };
  }, [joinSession, leaveSession]);

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
