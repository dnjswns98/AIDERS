import React, { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useWebRtc } from "../../context/WebRtcContext";
import { useOpenVidu } from "../../hooks/useOpenVidu";
import { useMediaStream } from "../../hooks/useMediaStream";
import { useFullScreen } from "../../hooks/useFullScreen";
import VideoDisplay from "./VideoDisplay";
import CallControls from "./CallControls";
import useEmergencyStore from "../../store/useEmergencyStore";

export default function WebRtcCall({ sessionId, ambulanceNumber, hospitalId, patientName, ktas, onLeave }) {
  const { togglePipMode } = useWebRtc();
  const location = useLocation();
  const fetchAmbulanceDetails = useEmergencyStore((state) => state.fetchAmbulanceDetails);
  
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

  useEffect(() => {
    joinSession();
    if (hospitalId && ambulanceNumber) {
      fetchAmbulanceDetails(hospitalId, ambulanceNumber);
    }

  const handleBeforeUnload = (event) => {
    leaveSession();
  };
  window.addEventListener("beforeunload", handleBeforeUnload);

  return () => {
    window.removeEventListener("beforeunload", handleBeforeUnload);
    leaveSession();
  };
}, []);

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