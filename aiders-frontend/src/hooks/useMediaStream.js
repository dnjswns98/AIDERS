import { useRef, useEffect } from "react";
import { useWebRtc } from "../context/WebRtcContext";

export const useMediaStream = () => {
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);

  const { localStream, remoteStream } = useWebRtc();

  useEffect(() => {
    if (localVideoRef.current) {
      if (localStream) {
        localVideoRef.current.srcObject = localStream;
      } else {
        localVideoRef.current.srcObject = null;
      }
    }
  }, [localStream]);

  useEffect(() => {
    if (remoteVideoRef.current) {
      if (remoteStream) {
        remoteVideoRef.current.srcObject = remoteStream;
      } else {
        remoteVideoRef.current.srcObject = null;
      }
    }
  }, [remoteStream]);

  return {
    localVideoRef,
    remoteVideoRef,
    localStream,
    remoteStream,
    hasLocalStream: !!localStream,
    hasRemoteStream: !!remoteStream,
  };
};