// src/components/webRTC/WebRtcCall.jsx

import React, { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { useWebRtc } from "../../context/WebRtcContext";
import { useOpenVidu } from "../../hooks/useOpenVidu";
import { useMediaStream } from "../../hooks/useMediaStream";
import { useFullScreen } from "../../hooks/useFullScreen";
import VideoDisplay from "./VideoDisplay";
import CallControls from "./CallControls";

// 🔥 수정: onRequestCall prop 추가
export default function WebRtcCall({ sessionId, ambulanceNumber, hospitalId, patientName, ktas, onLeave, onRequestCall }) {
  const { togglePipMode } = useWebRtc();
  const location = useLocation();
  const webRtcCallContainerRef = useRef(null); 
  
  const { 
    joinSession, 
    leaveSession 
  } = useOpenVidu({ 
    sessionId, 
    ambulanceNumber,
    hospitalId,
    ktas,
    patientName,
    onError: (error) => {
      console.error("WebRTC Hook Error:", error);
      alert(error.message);
      onLeave?.();
    }
  });
  
  const { 
    localVideoRef, 
    remoteVideoRef, 
    hasRemoteStream 
  } = useMediaStream();
  
  const { isFullScreen, toggleFullScreen } = useFullScreen(webRtcCallContainerRef);

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
    <div ref={webRtcCallContainerRef} className="web-rtc-call-container flex flex-col h-full bg-gray-800">
      <VideoDisplay 
        localVideoRef={localVideoRef}
        remoteVideoRef={remoteVideoRef}
        hasRemoteStream={hasRemoteStream}
      />
      <CallControls 
        onLeave={handleLeave}
        onToggleFullScreen={toggleFullScreen}
        isFullScreen={isFullScreen}
        canEndCall={!isAmbulanceUser}
        // 🔥 추가: 전화 요청 기능과 표시 여부를 prop으로 전달
        onRequestCall={onRequestCall}
        showRequestButton={isAmbulanceUser}
      />
    </div>
  );
}